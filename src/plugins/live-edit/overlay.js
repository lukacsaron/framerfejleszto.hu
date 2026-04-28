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
    textarea.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        saveEdit(file, line, col, currentText, textarea.value);
      }
    });

    popover.querySelector('[data-action="close"]').addEventListener('click', closePopover);
    popover.querySelector('[data-action="cancel"]').addEventListener('click', closePopover);
    popover.querySelector('[data-action="save"]').addEventListener('click', function () {
      saveEdit(file, line, col, currentText, textarea.value);
    });
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
    // If another inline edit is open, close it first (commits or cancels per blur path)
    if (inlineEdit) closeInlineEdit({ save: false });

    var file = target.getAttribute('data-live-file');
    var line = target.getAttribute('data-live-line') || '1';
    var col = target.getAttribute('data-live-col') || '1';
    var originalText = getDirectText(target);

    target.setAttribute('contenteditable', 'true');
    target.setAttribute('data-live-editing', '');
    target.focus();

    var sourcePill = createSourcePill(file, line, col);
    positionSourcePill(sourcePill, target);

    inlineEdit = { target: target, originalText: originalText, file: file, line: line, col: col, sourcePill: sourcePill };

    target.addEventListener('keydown', handleInlineKeydown);
    target.addEventListener('blur', handleInlineBlur);
    target.addEventListener('paste', handleInlinePaste);
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

    var newText = (t.textContent || '').trim();
    var oldText = ie.originalText;
    var shouldSave = opts && opts.save && newText.length > 0 && newText !== oldText;

    if (!shouldSave) {
      t.textContent = oldText;
      teardownInlineUI(ie);
      return;
    }

    // Visually freeze: pull contentEditable off so the user can't keep typing during save
    t.removeAttribute('contenteditable');
    setSourcePillState(ie.sourcePill, 'saving');

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
          setTimeout(function () { teardownInlineUI(ie); }, 600);
        } else {
          flashOutline(t, '#ef5350');
          setSourcePillState(ie.sourcePill, 'error', data.error || 'Save failed');
          // Restore editability so the user can retry
          t.setAttribute('contenteditable', 'true');
          t.setAttribute('data-live-editing', '');
          inlineEdit = ie;
          t.addEventListener('keydown', handleInlineKeydown);
          t.addEventListener('blur', handleInlineBlur);
          t.addEventListener('paste', handleInlinePaste);
        }
      })
      .catch(function (err) {
        flashOutline(t, '#ef5350');
        setSourcePillState(ie.sourcePill, 'error', err.message);
        t.setAttribute('contenteditable', 'true');
        t.setAttribute('data-live-editing', '');
        inlineEdit = ie;
        t.addEventListener('keydown', handleInlineKeydown);
        t.addEventListener('blur', handleInlineBlur);
        t.addEventListener('paste', handleInlinePaste);
      });
  }

  function teardownInlineUI(ie) {
    ie.target.removeAttribute('contenteditable');
    ie.target.removeAttribute('data-live-editing');
    if (ie.sourcePill && ie.sourcePill.parentNode) {
      ie.sourcePill.parentNode.removeChild(ie.sourcePill);
    }
  }

  function flashOutline(el, color) {
    var prev = el.style.outline;
    el.style.outline = '2px solid ' + color;
    setTimeout(function () { el.style.outline = prev; }, 600);
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
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      closeInlineEdit({ save: true });
    }
  }

  function handleInlineBlur() {
    if (inlineEdit) closeInlineEdit({ save: true });
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
    // Stash the default label so setSourcePillState can restore it after error states.
    pill.dataset.defaultText = file + ':' + line;
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

  function handleClick(e) {
    if (!mode) return;

    // Ignore clicks on the overlay itself
    if (e.target.closest('[data-live-edit-overlay]')) return;

    var target = findEditableAncestor(e.target);
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

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
