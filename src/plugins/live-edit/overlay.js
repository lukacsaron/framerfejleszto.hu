(function () {
  'use strict';

  var cfg = window.__LIVE_EDIT_CONFIG__ || {};
  var shortcut = cfg.shortcut || 'ctrl+e';
  var editor = cfg.editor || 'vscode';
  var root = cfg.root || '';

  var mode = null; // null | 'inline' | 'edit' | 'annotate'
  var pill = null;
  var popover = null;
  var activeTarget = null;
  var inlineEdit = null; // { target, originalText, sourcePill, observer } | null

  // ── Helpers ──────────────────────────────────────────────

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function editorUrl(file, line, col) {
    return editor + '://file/' + root + '/' + file + ':' + (line || 1) + ':' + (col || 1);
  }

  // Get the element's text. Components that render their text into nested
  // spans (e.g. typewriter splits chars into per-character motion.spans) can
  // expose the canonical text via a `data-live-text` attribute. Otherwise we
  // collect only direct text nodes so we don't grab text from nested children.
  function getDirectText(el) {
    var override = el.getAttribute('data-live-text');
    if (override !== null) return override;
    var text = '';
    for (var i = 0; i < el.childNodes.length; i++) {
      if (el.childNodes[i].nodeType === 3) { // Node.TEXT_NODE
        text += el.childNodes[i].textContent;
      }
    }
    return text.trim();
  }

  // innerHTML for round-tripping into the source: strips attributes the
  // live-edit babel transform injects (data-live-file, data-live-line,
  // data-live-col, etc.) and any state attributes we set during editing.
  // Source on disk has clean tags like `<b>foo</b>`; the rendered DOM has
  // `<b data-live-file="..." data-live-line="...">foo</b>`. Without this
  // cleanup the save-side text search can never line up the two.
  function cleanInnerHTML(el) {
    var clone = el.cloneNode(true);
    var all = clone.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
      var node = all[i];
      var attrs = node.attributes;
      for (var j = attrs.length - 1; j >= 0; j--) {
        var name = attrs[j].name;
        if (name.indexOf('data-live-') === 0 || name === 'contenteditable') {
          node.removeAttribute(name);
        }
      }
    }
    return (clone.innerHTML || '').trim();
  }

  // ── Pill ─────────────────────────────────────────────────

  function createPill() {
    var el = document.createElement('div');
    el.setAttribute('data-live-edit-overlay', '');
    el.className = 'le-pill';
    el.innerHTML =
      '<span class="le-pill-dot"></span>' +
      '<span class="le-pill-label">Live Edit</span>' +
      '<span class="le-pill-shortcut">' + escapeHtml(shortcut) + '</span>';
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      cycleMode();
    });
    document.body.appendChild(el);
    return el;
  }

  function updatePill() {
    if (!pill) return;
    pill.setAttribute('data-mode', mode || '');
    var label = pill.querySelector('.le-pill-label');
    if (mode === 'inline') label.textContent = 'Inline Edit';
    else if (mode === 'edit') label.textContent = 'Edit Mode';
    else if (mode === 'annotate') label.textContent = 'Annotate';
    else label.textContent = 'Live Edit';
  }

  // ── Mode ─────────────────────────────────────────────────

  function cycleMode() {
    if (inlineEdit) closeInlineEdit({ save: false });
    if (mode === null) mode = 'inline';
    else if (mode === 'inline') mode = 'edit';
    else if (mode === 'edit') mode = 'annotate';
    else mode = null;
    applyMode();
  }

  function applyMode() {
    if (mode) {
      document.body.setAttribute('data-live-edit-active', mode);
    } else {
      document.body.removeAttribute('data-live-edit-active');
    }
    updatePill();
    updateQueryParam();
    if (!mode) closePopover();
  }

  function updateQueryParam() {
    var url = new URL(window.location.href);
    if (mode === 'inline') {
      url.searchParams.set('live-edit', 'inline');
    } else if (mode === 'edit') {
      url.searchParams.set('live-edit', 'true');
    } else if (mode === 'annotate') {
      url.searchParams.set('live-edit', 'annotate');
    } else {
      url.searchParams.delete('live-edit');
    }
    window.history.replaceState(null, '', url.toString());
  }

  // ── Popover ──────────────────────────────────────────────

  function createPopover() {
    var el = document.createElement('div');
    el.setAttribute('data-live-edit-overlay', '');
    el.className = 'le-popover';
    document.body.appendChild(el);
    return el;
  }

  function positionPopover(target) {
    if (!popover) return;
    var rect = target.getBoundingClientRect();
    var top = rect.bottom + 8;
    var left = rect.left;

    // Keep in viewport
    if (top + 300 > window.innerHeight) {
      top = rect.top - 8 - 300;
      if (top < 8) top = 8;
    }
    if (left + 370 > window.innerWidth) {
      left = window.innerWidth - 370;
    }
    if (left < 8) left = 8;

    popover.style.top = top + 'px';
    popover.style.left = left + 'px';
  }

  function closePopover() {
    if (popover) {
      popover.classList.remove('visible');
      popover.innerHTML = '';
    }
    activeTarget = null;
  }

  function openEditPopover(target) {
    if (!popover) popover = createPopover();
    activeTarget = target;

    var file = target.getAttribute('data-live-file');
    var line = target.getAttribute('data-live-line') || '1';
    var col = target.getAttribute('data-live-col') || '1';
    var currentText = getDirectText(target);

    popover.innerHTML =
      '<div class="le-popover-header">' +
        '<a class="le-popover-source" href="' + escapeHtml(editorUrl(file, line, col)) + '">' +
          escapeHtml(file) + ':' + escapeHtml(line) +
        '</a>' +
        '<button class="le-popover-close" data-action="close">&times;</button>' +
      '</div>' +
      '<label>Text Content</label>' +
      '<textarea class="le-edit-textarea">' + escapeHtml(currentText) + '</textarea>' +
      '<div class="le-popover-actions">' +
        '<button data-action="cancel">Cancel</button>' +
        '<button class="le-primary" data-action="save">Save <kbd>&#8984;&#9166;</kbd></button>' +
      '</div>';

    positionPopover(target);
    popover.classList.add('visible');

    var textarea = popover.querySelector('.le-edit-textarea');
    textarea.focus();
    // For elements with a `data-live-text` override (TypewriterReveal &
    // friends), the text has `\n` characters where the source uses `<br />`.
    // Convert both directions so the search/replace lines up with the source.
    var hasLiveText = target.hasAttribute('data-live-text');
    function toSourceText(s) {
      return hasLiveText ? s.replace(/\n/g, '<br />') : s;
    }
    function commit() {
      saveEdit(file, line, col, toSourceText(currentText), toSourceText(textarea.value));
    }
    textarea.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        commit();
      }
    });

    popover.querySelector('[data-action="close"]').addEventListener('click', closePopover);
    popover.querySelector('[data-action="cancel"]').addEventListener('click', closePopover);
    popover.querySelector('[data-action="save"]').addEventListener('click', commit);
  }

  function openAnnotatePopover(target) {
    if (!popover) popover = createPopover();
    activeTarget = target;

    var file = target.getAttribute('data-live-file');
    var line = target.getAttribute('data-live-line') || '1';
    var col = target.getAttribute('data-live-col') || '1';
    var currentText = getDirectText(target);

    popover.innerHTML =
      '<div class="le-popover-header">' +
        '<span class="le-popover-source" style="color: var(--le-accent-annotate); cursor: default;">' +
          escapeHtml(file) + ':' + escapeHtml(line) +
        '</span>' +
        '<button class="le-popover-close" data-action="close">&times;</button>' +
      '</div>' +
      '<label>Current Text</label>' +
      '<textarea readonly style="opacity:0.6;cursor:default;">' + escapeHtml(currentText) + '</textarea>' +
      '<div style="margin-top:8px;">' +
        '<label>Suggested Text</label>' +
        '<textarea class="le-suggest-textarea" placeholder="Your suggested change...">' + escapeHtml(currentText) + '</textarea>' +
      '</div>' +
      '<div style="margin-top:8px;">' +
        '<label>Note (optional)</label>' +
        '<input type="text" class="le-note-input" placeholder="Why this change?" />' +
      '</div>' +
      '<div class="le-popover-actions">' +
        '<button data-action="cancel">Cancel</button>' +
        '<button class="le-primary-annotate" data-action="annotate">Save Annotation</button>' +
      '</div>';

    positionPopover(target);
    popover.classList.add('visible');

    var suggestArea = popover.querySelector('.le-suggest-textarea');
    suggestArea.focus();

    popover.querySelector('[data-action="close"]').addEventListener('click', closePopover);
    popover.querySelector('[data-action="cancel"]').addEventListener('click', closePopover);
    popover.querySelector('[data-action="annotate"]').addEventListener('click', function () {
      var noteInput = popover.querySelector('.le-note-input');
      saveAnnotation(file, line, currentText, suggestArea.value, noteInput.value);
    });
  }

  // ── Save / Annotate ──────────────────────────────────────

  function saveEdit(file, line, col, oldText, newText) {
    if (oldText === newText) {
      closePopover();
      return;
    }

    fetch('/__live-edit/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: file,
        line: Number(line),
        col: Number(col),
        oldText: oldText,
        newText: newText,
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.ok) {
          if (activeTarget) {
            activeTarget.style.outline = '2px solid #66bb6a';
            setTimeout(function () {
              if (activeTarget) activeTarget.style.outline = '';
            }, 600);
          }
          closePopover();
        } else {
          alert('Save failed: ' + (data.error || 'Unknown error'));
        }
      })
      .catch(function (err) {
        alert('Save error: ' + err.message);
      });
  }

  function saveAnnotation(file, line, currentText, suggestedText, note) {
    fetch('/__live-edit/annotate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: file,
        line: Number(line),
        currentText: currentText,
        suggestedText: suggestedText,
        note: note,
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.ok) {
          if (activeTarget) {
            activeTarget.style.outline = '2px solid #66bb6a';
            setTimeout(function () {
              if (activeTarget) activeTarget.style.outline = '';
            }, 600);
          }
          closePopover();
        } else {
          alert('Annotation failed: ' + (data.error || 'Unknown error'));
        }
      })
      .catch(function (err) {
        alert('Annotation error: ' + err.message);
      });
  }

  // ── Inline Edit ──────────────────────────────────────────

  function openInlineEdit(target) {
    // If we're already editing this exact element, do nothing — clicking back
    // into your own active edit shouldn't lose your in-progress text.
    if (inlineEdit && inlineEdit.target === target) return;
    // If a different edit is open, save it (matches spec: "Clicking a different
    // editable element commits the current edit via blur, then opens the new one").
    if (inlineEdit) closeInlineEdit({ save: true });

    var file = target.getAttribute('data-live-file');
    var line = target.getAttribute('data-live-line') || '1';
    var col = target.getAttribute('data-live-col') || '1';
    // Capture two snapshots:
    //   originalText  — sanitized innerHTML used as `oldText` on save. Strips
    //                   the babel-injected data-live-* attrs so the search
    //                   matches what's actually on disk.
    //   originalRawHTML — pristine innerHTML used to restore the DOM if the
    //                   user cancels, keeps the inner tagged elements intact.
    var originalText = cleanInnerHTML(target);
    var originalRawHTML = (target.innerHTML || '');

    target.setAttribute('contenteditable', 'true');
    target.setAttribute('data-live-editing', '');
    // Use tag-based formatting (<b>, <i>, <u>) instead of inline `style=`.
    try { document.execCommand('styleWithCSS', false, false); } catch (_) {}
    target.focus();

    var sourcePill = createSourcePill(file, line, col);
    positionSourcePill(sourcePill, target);

    target.addEventListener('keydown', handleInlineKeydown);
    target.addEventListener('blur', handleInlineBlur);
    target.addEventListener('paste', handleInlinePaste);

    // Tags introduced via Cmd+B/I/U: see FORMAT_TAGS_NAMES at module scope.
    // Mutations that only add these are user formatting, not React re-rendering.
    var observer = new MutationObserver(function (mutations) {
      if (!inlineEdit) return;
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === 'characterData') continue;
        if (m.type === 'childList') {
          var foreign = false;
          for (var j = 0; j < m.addedNodes.length; j++) {
            var n = m.addedNodes[j];
            if (n.nodeType === 3) continue;
            if (n.nodeType === 1 && FORMAT_TAGS_NAMES[n.tagName]) continue;
            foreign = true;
            break;
          }
          if (foreign || !document.body.contains(target)) {
            closeInlineEdit({ save: false });
            return;
          }
        }
      }
    });
    observer.observe(target, { childList: true, characterData: true, subtree: false });

    inlineEdit = { target: target, originalText: originalText, originalRawHTML: originalRawHTML, file: file, line: line, col: col, sourcePill: sourcePill, observer: observer };

    window.addEventListener('scroll', repositionInlineUI, true);
    window.addEventListener('resize', repositionInlineUI);
  }

  function closeInlineEdit(opts) {
    if (!inlineEdit) return;
    var ie = inlineEdit;
    // Mark closed first so re-entrancy from blur events during save is a no-op
    inlineEdit = null;

    var t = ie.target;
    t.removeEventListener('keydown', handleInlineKeydown);
    t.removeEventListener('blur', handleInlineBlur);
    t.removeEventListener('paste', handleInlinePaste);

    var newText = cleanInnerHTML(t);
    var oldText = ie.originalText;
    var shouldSave = opts && opts.save && newText.length > 0 && newText !== oldText;

    if (!shouldSave) {
      // Restore from the raw snapshot so inner tagged elements keep their
      // data-live-* attrs (oldText is the sanitized version, not suitable
      // for a DOM round-trip).
      t.innerHTML = ie.originalRawHTML;
      teardownInlineUI(ie);
      return;
    }

    // Visually freeze: pull contentEditable off so the user can't keep typing during save
    t.removeAttribute('contenteditable');
    setSourcePillState(ie.sourcePill, 'saving');

    // Reset the DOM to the pristine snapshot BEFORE the save fetch fires.
    // While editing we mutated DOM directly (typed text, inserted <b>/<i>/<u>
    // via Range API). React's virtual DOM doesn't know about those changes.
    // When the file write triggers Vite HMR, React reconciles new-virtual
    // against its stored old-virtual — but applies the diff to the *actual*
    // DOM, which still has our edits. The result is doubled-up tags. By
    // restoring before HMR fires, React's diff lines up cleanly.
    t.innerHTML = ie.originalRawHTML;

    fetch('/__live-edit/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: ie.file,
        line: Number(ie.line),
        col: Number(ie.col),
        oldText: oldText,
        newText: newText,
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.ok) {
          flashOutline(t, '#66bb6a');
          setSourcePillState(ie.sourcePill, 'saved');
          setTimeout(function () {
            // If a newer edit took over while we were waiting, only tear down THIS
            // edit's per-element resources — leave the global window listeners in place
            // so the successor's repositioning still works.
            if (inlineEdit && inlineEdit !== ie) {
              if (ie.observer) ie.observer.disconnect();
              ie.target.removeAttribute('data-live-editing');
              if (ie.sourcePill && ie.sourcePill.parentNode) {
                ie.sourcePill.parentNode.removeChild(ie.sourcePill);
              }
            } else {
              teardownInlineUI(ie);
            }
          }, 600);
        } else {
          flashOutline(t, '#ef5350');
          setSourcePillState(ie.sourcePill, 'error', data.error || 'Save failed');
          // Save failed — the file wasn't written so HMR won't fire. Put the
          // user's edits back on screen so they can adjust and retry instead
          // of typing everything again.
          if (inlineEdit === null) {
            t.innerHTML = newText;
            t.setAttribute('contenteditable', 'true');
            t.setAttribute('data-live-editing', '');
            inlineEdit = ie;
            t.addEventListener('keydown', handleInlineKeydown);
            t.addEventListener('blur', handleInlineBlur);
            t.addEventListener('paste', handleInlinePaste);
          }
        }
      })
      .catch(function (err) {
        flashOutline(t, '#ef5350');
        setSourcePillState(ie.sourcePill, 'error', (err && err.message) || 'Network error');
        if (inlineEdit === null) {
          t.innerHTML = newText;
          t.setAttribute('contenteditable', 'true');
          t.setAttribute('data-live-editing', '');
          inlineEdit = ie;
          t.addEventListener('keydown', handleInlineKeydown);
          t.addEventListener('blur', handleInlineBlur);
          t.addEventListener('paste', handleInlinePaste);
        }
      });
  }

  function teardownInlineUI(ie) {
    if (ie.observer) ie.observer.disconnect();
    window.removeEventListener('scroll', repositionInlineUI, true);
    window.removeEventListener('resize', repositionInlineUI);

    ie.target.removeAttribute('contenteditable');
    ie.target.removeAttribute('data-live-editing');
    if (ie.sourcePill && ie.sourcePill.parentNode) {
      ie.sourcePill.parentNode.removeChild(ie.sourcePill);
    }
  }

  function flashOutline(el, color) {
    var prev = el.style.getPropertyValue('outline');
    var prevPriority = el.style.getPropertyPriority('outline');
    el.style.setProperty('outline', '2px solid ' + color, 'important');
    setTimeout(function () {
      el.style.setProperty('outline', prev, prevPriority);
    }, 600);
  }

  function setSourcePillState(pill, state, message) {
    if (!pill) return;
    pill.classList.remove('saving', 'saved', 'error');
    if (state) pill.classList.add(state);
    if (state === 'error' && message) {
      pill.textContent = message;
    } else {
      // Restore the file:line label for non-error states (saving, saved, default).
      pill.textContent = pill.dataset.defaultText || '';
    }
  }

  function handleInlineKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeInlineEdit({ save: false });
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      closeInlineEdit({ save: true });
      return;
    }
    // Cmd/Ctrl + B/I/U: tag-based formatting that round-trips into the JSX.
    // We avoid execCommand because it produces inconsistent output (e.g.
    // <span style="font-weight: normal"> when toggling off bold inside a
    // CSS-bold heading) which breaks both source round-tripping and our
    // MutationObserver. The Range-based wrap/unwrap below always emits
    // clean <b>/<i>/<u> tags.
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.length === 1) {
      var k = e.key.toLowerCase();
      var tag = k === 'b' ? 'b' : k === 'i' ? 'i' : k === 'u' ? 'u' : null;
      if (tag && inlineEdit) {
        e.preventDefault();
        toggleInlineFormat(inlineEdit.target, tag);
      }
    }
  }

  function toggleInlineFormat(host, tag) {
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    var range = sel.getRangeAt(0);
    if (range.collapsed) return;
    if (!host.contains(range.commonAncestorContainer)) return;

    // If the selection sits inside an existing wrapper of the same tag, unwrap it.
    var existing = findAncestor(range.commonAncestorContainer, tag, host);
    if (existing) {
      var parent = existing.parentNode;
      while (existing.firstChild) parent.insertBefore(existing.firstChild, existing);
      parent.removeChild(existing);
      parent.normalize();
      restoreSelection(parent, sel);
      return;
    }

    // Otherwise wrap. extractContents handles partial-element selections.
    var wrapper = document.createElement(tag);
    try {
      wrapper.appendChild(range.extractContents());
      range.insertNode(wrapper);
      // Reselect the wrapped contents so successive shortcuts (e.g. Cmd+I after
      // Cmd+B) keep operating on the same range.
      var newRange = document.createRange();
      newRange.selectNodeContents(wrapper);
      sel.removeAllRanges();
      sel.addRange(newRange);
      if (wrapper.parentNode) wrapper.parentNode.normalize();
    } catch (_) {
      // Selections that cross unrelated parents can't be wrapped atomically;
      // silently bail rather than producing weird DOM.
    }
  }

  function findAncestor(node, tagLower, stopAt) {
    var t = tagLower.toUpperCase();
    while (node && node !== stopAt) {
      if (node.nodeType === 1 && node.tagName === t) return node;
      node = node.parentNode;
    }
    return null;
  }

  function restoreSelection(parent, sel) {
    var range = document.createRange();
    range.selectNodeContents(parent);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function handleInlineBlur() {
    if (!inlineEdit) return;
    if (inlineEdit.suppressBlurSave) {
      inlineEdit.suppressBlurSave = false;
      // Re-focus on next tick so the user stays in the edit
      var t = inlineEdit.target;
      setTimeout(function () {
        if (inlineEdit && inlineEdit.target === t) t.focus();
      }, 0);
      return;
    }
    closeInlineEdit({ save: true });
  }

  function handleInlinePaste(e) {
    e.preventDefault();
    var text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
  }

  function createSourcePill(file, line, col) {
    var pill = document.createElement('a');
    pill.setAttribute('data-live-edit-overlay', '');
    pill.className = 'le-source-pill';
    pill.href = editorUrl(file, line, col);
    pill.textContent = file + ':' + line;
    pill.dataset.defaultText = file + ':' + line;
    // Prevent the blur-save when the user clicks the pill itself.
    pill.addEventListener('mousedown', function (e) {
      if (inlineEdit) inlineEdit.suppressBlurSave = true;
    });
    document.body.appendChild(pill);
    return pill;
  }

  function positionSourcePill(pill, target) {
    var rect = target.getBoundingClientRect();
    // Default: above the target, left-aligned
    var top = rect.top - 28;
    var left = rect.left;

    // If no room above, place below
    if (top < 8) {
      top = rect.bottom + 8;
    }
    // Keep within viewport
    if (left + 200 > window.innerWidth) {
      left = window.innerWidth - 200;
    }
    if (left < 8) left = 8;

    pill.style.top = top + 'px';
    pill.style.left = left + 'px';
  }

  function repositionInlineUI() {
    if (!inlineEdit) return;
    positionSourcePill(inlineEdit.sourcePill, inlineEdit.target);
  }

  // ── Event Handlers ───────────────────────────────────────

  // Walk up the DOM looking for an element with [data-live-file] that
  // doesn't have [data-live-edit-skip]. We do this manually instead of using
  // `closest('[data-live-file]:not([data-live-edit-skip])')` because some
  // browsers/engines mis-handle the `:not` attribute filter and end up
  // matching skipped elements (e.g. per-character spans inside typewriter
  // headlines).
  function findEditableAncestor(el) {
    while (el && el.nodeType === 1) {
      if (el.hasAttribute('data-live-file') && !el.hasAttribute('data-live-edit-skip')) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }

  // True if the target has child elements that themselves carry text
  // (e.g. <p>plain <strong>bold</strong> plain</p>). Editing such an element
  // as a single string can't round-trip cleanly: the source has the inline
  // tags between the text segments, so neither getDirectText (which omits
  // the formatted middle) nor textContent (which loses the tags) yields a
  // string the save endpoint can locate in the source file. We refuse the
  // edit and tell the user to click the inline element directly.
  // Elements with `data-live-text` (typewriter headlines) handle their own
  // text extraction and are exempt.
  // Tags that round-trip cleanly through inline edit's innerHTML capture
  // (see openInlineEdit). Their presence inside a target does not make the
  // element "mixed" — the user can keep editing.
  var FORMAT_TAGS_NAMES = { B: 1, I: 1, U: 1, STRONG: 1, EM: 1 };

  function hasMixedInlineContent(target) {
    if (target.hasAttribute('data-live-text')) return false;
    var kids = target.children;
    for (var i = 0; i < kids.length; i++) {
      var c = kids[i];
      if (c.hasAttribute('data-live-edit-skip')) continue;
      if (c.tagName === 'BR') continue;
      // <b>/<i>/<u>/<strong>/<em> are part of the editable surface, not blockers.
      if (FORMAT_TAGS_NAMES[c.tagName]) continue;
      if ((c.textContent || '').trim().length > 0) return true;
    }
    return false;
  }

  var mixedNotice = null;
  var mixedNoticeTimer = null;
  function showMixedNotice(target) {
    if (mixedNoticeTimer) {
      clearTimeout(mixedNoticeTimer);
      mixedNoticeTimer = null;
    }
    if (!mixedNotice) {
      mixedNotice = document.createElement('div');
      mixedNotice.setAttribute('data-live-edit-overlay', '');
      mixedNotice.className = 'le-source-pill error';
      document.body.appendChild(mixedNotice);
    }
    mixedNotice.textContent = 'Has inline formatting — click the bold/link/etc directly';
    var rect = target.getBoundingClientRect();
    mixedNotice.style.top = (rect.top - 28) + 'px';
    mixedNotice.style.left = rect.left + 'px';
    mixedNotice.style.display = '';
    flashOutline(target, '#ef5350');
    mixedNoticeTimer = setTimeout(function () {
      if (mixedNotice) mixedNotice.style.display = 'none';
    }, 2200);
  }

  function handleClick(e) {
    if (!mode) return;

    // Ignore clicks on the overlay itself
    if (e.target.closest('[data-live-edit-overlay]')) return;

    var target = findEditableAncestor(e.target);
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    if (hasMixedInlineContent(target)) {
      showMixedNotice(target);
      return;
    }

    if (mode === 'inline') {
      if (target.hasAttribute('data-live-text')) {
        openEditPopover(target);
      } else {
        openInlineEdit(target);
      }
    } else if (mode === 'edit') {
      openEditPopover(target);
    } else if (mode === 'annotate') {
      openAnnotatePopover(target);
    }
  }

  function handleKeydown(e) {
    // Don't trigger when typing in inputs
    var tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;

    // Parse shortcut
    var parts = shortcut.toLowerCase().split('+');
    var key = parts[parts.length - 1];
    var needCtrl = parts.indexOf('ctrl') !== -1;
    var needMeta = parts.indexOf('meta') !== -1 || parts.indexOf('cmd') !== -1;

    var ctrlMatch = needCtrl ? (e.ctrlKey || e.metaKey) : true;
    var metaMatch = needMeta ? e.metaKey : true;

    if (ctrlMatch && metaMatch && e.key.toLowerCase() === key) {
      e.preventDefault();
      cycleMode();
    }
  }

  function handleEscape(e) {
    if (e.key !== 'Escape') return;

    // Inline edit Escape is handled by the element's own keydown listener
    if (inlineEdit) return;

    if (popover && popover.classList.contains('visible')) {
      closePopover();
      e.stopPropagation();
    } else if (mode) {
      mode = null;
      applyMode();
    }
  }

  // ── Init ─────────────────────────────────────────────────

  function init() {
    pill = createPill();
    popover = createPopover();

    // Check query param for initial mode
    var params = new URLSearchParams(window.location.search);
    var leParam = params.get('live-edit');
    if (leParam === 'inline') {
      mode = 'inline';
      applyMode();
    } else if (leParam === 'annotate') {
      mode = 'annotate';
      applyMode();
    } else if (leParam === 'true' || leParam === '1') {
      mode = 'edit';
      applyMode();
    }

    // Capture-phase click handler to fire before React
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('keydown', handleEscape);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
