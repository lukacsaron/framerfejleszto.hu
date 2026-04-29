import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Arrow, ArrowUpRight } from './Icons';
import { FFNav, FFButton, FFStamp } from './Primitives';
import { Reveal } from './animations/Reveal';
import StickyNav from './StickyNav';
import FramerExpertBadge from '../../framer/framer-expert-badge';
import '../../framer/styles.css';

// Flourish images (single intrinsic size, srcset variants for DPR)
import starYellow from '../assets/images/flourishes/star-yellow.avif?w=60;120&format=avif&as=srcset';
import plusPurple from '../assets/images/flourishes/plus-purple.avif?w=72;144&format=avif&as=srcset';
import arrowOrangeDrawn from '../assets/images/flourishes/arrow-orange-drawn.avif?w=64;128&format=avif&as=srcset';
import flowerBlueDrawn from '../assets/images/flourishes/flower-blue-drawn.avif?w=80;160&format=avif&as=srcset';
import asteriskGreen from '../assets/images/flourishes/asterisk-green.avif?w=56;112&format=avif&as=srcset';
import starWhite from '../assets/images/flourishes/star-white.avif?w=60;120&format=avif&as=srcset';
import starburstYellow from '../assets/images/flourishes/starburst-yellow.avif?w=68;136&format=avif&as=srcset';

// Hero illustration (rendered ~240px in live card)
import thumbsUpResponsive from '../assets/images/illustrations/thumbs-up-responsive.avif?w=240;480&format=avif&as=srcset';

function FloatingIcon({ src, srcSet, sizes, width, height, style, className, alt = '' }) {
  const wrapRef = useRef(null);
  const state = useRef({
    dragging: false, startX: 0, startY: 0, dx: 0, dy: 0,
    vx: 0, vy: 0, lastX: 0, lastY: 0, lastT: 0, raf: 0,
  });

  const onPointerDown = (e) => {
    const el = wrapRef.current;
    if (!el) return;
    e.preventDefault();
    const s = state.current;
    cancelAnimationFrame(s.raf);
    s.dragging = true;
    s.startX = e.clientX - s.dx;
    s.startY = e.clientY - s.dy;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.lastT = performance.now();
    s.vx = 0;
    s.vy = 0;
    el.setPointerCapture(e.pointerId);
    el.style.cursor = 'grabbing';
  };

  const onPointerMove = (e) => {
    const s = state.current;
    if (!s.dragging) return;
    const el = wrapRef.current;
    if (!el) return;
    const now = performance.now();
    const dt = now - s.lastT;
    if (dt > 0) {
      s.vx = (e.clientX - s.lastX) / dt;
      s.vy = (e.clientY - s.lastY) / dt;
    }
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.lastT = now;
    s.dx = e.clientX - s.startX;
    s.dy = e.clientY - s.startY;
    el.style.transform = `translate(${s.dx}px, ${s.dy}px)`;
  };

  const onPointerUp = () => {
    const el = wrapRef.current;
    if (!el) return;
    const s = state.current;
    s.dragging = false;
    el.style.cursor = '';

    // Glide with momentum
    const friction = 0.95;
    let vx = s.vx * 16; // scale to per-frame speed
    let vy = s.vy * 16;

    const glide = () => {
      vx *= friction;
      vy *= friction;
      s.dx += vx;
      s.dy += vy;
      el.style.transform = `translate(${s.dx}px, ${s.dy}px)`;
      if (Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1) {
        s.raf = requestAnimationFrame(glide);
      }
    };
    s.raf = requestAnimationFrame(glide);
  };

  return (
    <div
      ref={wrapRef}
      className="ff-flourish ff-float-wrap"
      style={{ ...style, touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        width={width}
        height={height}
        loading="lazy"
        alt={alt}
        className={`ff-float ${className}`}
        draggable={false}
      />
    </div>
  );
}

export default function HeroA() {
  const [mode, setMode] = useState('design');
  const [heroRevealed, setHeroRevealed] = useState(false);

  const heroRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setHeroRevealed(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = window.scrollY;
      const max = el.offsetHeight;
      if (y > max) return;
      const r = y / max;          // 0 → 1 over hero height
      el.style.setProperty('--scroll', r);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const seq = ['design', 'live'];
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % seq.length;
      setMode(seq[i]);
    }, 3600);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="ff-hero-wrap gradient" ref={heroRef}>
      <StickyNav />
      <FFNav onDark={true} />
      <div className="ff-hero-inner">
        <img
          srcSet={starYellow}
          sizes="60px"
          width={60}
          height={60}
          loading="lazy"
          className="ff-flourish"
          style={{ top: 140, right: '8%', width: 60, transform: 'rotate(12deg)' }}
          alt=""
        />
        <FloatingIcon srcSet={plusPurple} sizes="72px" width={72} height={72} className="ff-float-1" style={{ top: 389, left: '51%', width: 72 }} />
        <FloatingIcon srcSet={arrowOrangeDrawn} sizes="64px" width={64} height={64} className="ff-float-2" style={{ top: 570, left: '23%', width: 64 }} />
        <FloatingIcon srcSet={flowerBlueDrawn} sizes="80px" width={80} height={80} className="ff-float-3" style={{ top: 395, left: '6%', width: 80 }} />
        <FloatingIcon srcSet={asteriskGreen} sizes="56px" width={56} height={56} className="ff-float-4" style={{ top: 83, left: '53%', width: 56 }} />
        <FloatingIcon srcSet={starWhite} sizes="60px" width={60} height={60} className="ff-float-5" style={{ top: 308, right: '9%', width: 60 }} />
        <FloatingIcon srcSet={starburstYellow} sizes="68px" width={68} height={68} className="ff-float-6" style={{ top: 88, left: '23%', width: 68 }} />

        <motion.div
          className="ff-hero-stamp-desktop"
          style={{ textAlign: 'center', position: 'absolute', top: 28, right: 40 }}
          initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
          animate={heroRevealed ? { opacity: 1, scale: 1, rotate: 0 } : {}}
          transition={{ type: 'spring', damping: 12, stiffness: 100, delay: 1.3 }}
        >
          <FFStamp onDark={true} />
        </motion.div>

        <motion.div
          className="ff-hero-badges"
          initial={{ opacity: 0, y: 20 }}
          animate={heroRevealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <FramerExpertBadge link="https://www.framer.com/experts/" />
          <div className="ff-award-badge">
            <div className="ff-award-text">
              <p className="ff-award-title">RGB PRO - 2025</p>
              <p className="ff-award-sub">Digital Design Award</p>
            </div>
            <img
              src="https://framerusercontent.com/images/3OnQEmmXWGgyAjtgmLzHmifDzYc.png?scale-down-to=512&width=1063&height=685"
              width={1063}
              height={685}
              alt="RGB Kreatív Design Award"
              className="ff-award-img"
            />
          </div>
        </motion.div>

        <h1 className={`ff-hero-headline ${heroRevealed ? 'revealed' : ''}`}>
          <span className="row hero-anim hero-anim-1">WEBOLDAL</span>
          <span className="row row-flex">
            <span className="hero-anim hero-anim-2 strike-wrap">
              <span className="strike-text">HETEK</span>
              <svg className="strike-line" viewBox="0 0 100 12" preserveAspectRatio="none">
                <line x1="-2" y1="8" x2="102" y2="4" stroke="var(--c-orange-600)" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>
            <span className="hero-anim hero-anim-3" style={{ opacity: 0.75, fontSize: '0.5em', fontFamily: 'var(--ff-body)', fontWeight: 400, textTransform: 'lowercase' }}>helyett</span>
            <span className="hero-anim hero-anim-4 orange">NAPOK</span>
          </span>
          <span className="row hero-anim hero-anim-5">ALATT<span className="hero-anim hero-anim-6 violet">.</span></span>
        </h1>

        <p className="ff-hero-sub hero-anim hero-anim-7">
          A Framer sebessége a 22.design szakértelmével ötvözve. <b>Lenyűgöző</b>, azonnal <b>módosítható</b>, prémium weboldalak, <b>fejlesztők nélkül.</b>
        </p>

        <div className="ff-hero-cta hero-anim hero-anim-7">
          <FFButton variant="white" icon={<Arrow />}>Pitchelj minket</FFButton>
          <FFButton variant="violet" icon={<ArrowUpRight />}>Demó</FFButton>
        </div>

        {/* Animated stage */}
        <motion.div
          className="ffA-stage"
          data-mode={mode}
          initial={{ opacity: 0, y: 40 }}
          animate={heroRevealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Editor card */}
          <div className="ffA-card ffA-editor">
            <div className="chrome">
              <span className="dot" style={{ background: '#FF5F57' }} />
              <span className="dot" style={{ background: '#FEBC2E' }} />
              <span className="dot" style={{ background: '#28C840' }} />
              <span className="url">framer.com/projects/framerfejleszto</span>
              <span className="chrome-users">
                <span className="u" style={{ background: '#FF6600' }}>22</span>
                <span className="u" style={{ background: '#9747FF' }}>K</span>
              </span>
            </div>
            <div className="body">
              <div className="rail">
                <div className="tool active" title="Select"><svg viewBox="0 0 16 16" fill="none"><path d="M3 2 L13 8 L8 9 L6 14 Z" fill="currentColor" /></svg></div>
                <div className="tool"><svg viewBox="0 0 16 16" fill="none"><rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1.5" /></svg></div>
                <div className="tool"><svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" /></svg></div>
                <div className="tool"><svg viewBox="0 0 16 16" fill="none"><path d="M4 12 L8 4 L12 12" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg></div>
                <div className="tool"><svg viewBox="0 0 16 16" fill="none"><path d="M3 8 H13 M8 3 V13" stroke="currentColor" strokeWidth="1.5" /></svg></div>
                <div className="rail-sep" />
                <div className="tool"><svg viewBox="0 0 16 16" fill="none"><path d="M4 4 H12 V12 H4 Z" stroke="currentColor" strokeWidth="1.5" fill="none" /><circle cx="6" cy="6" r="1" fill="currentColor" /></svg></div>
              </div>

              <div className="layers">
                <div className="layers-head">LAYERS</div>
                <div className="layer-row selected"><span className="chev">&#9662;</span><span className="dot-v" />Hero</div>
                <div className="layer-row nested"><span className="chev">&#9656;</span><span className="dot-f" />Nav</div>
                <div className="layer-row nested selected"><span className="chev">&#9662;</span><span className="dot-f" />Heading</div>
                <div className="layer-row nested2"><span className="dot-t" />H1 / Display</div>
                <div className="layer-row nested2"><span className="dot-t" />Subtitle</div>
                <div className="layer-row nested"><span className="chev">&#9656;</span><span className="dot-f" />CTA Group</div>
                <div className="layer-row nested"><span className="chev">&#9656;</span><span className="dot-i" />Image</div>
                <div className="layer-row"><span className="chev">&#9656;</span><span className="dot-v" />Features</div>
                <div className="layer-row"><span className="chev">&#9656;</span><span className="dot-v" />Testimonials</div>
                <div className="layer-row"><span className="chev">&#9656;</span><span className="dot-v" />Footer</div>
              </div>

              <div className="canvas">
                <div className="ruler-top"><span>0</span><span>200</span><span>400</span><span>600</span><span>800</span></div>
                <div className="artboard-label">Desktop 1440</div>
                <div className="frame">
                  <div className="nav">
                    <div className="logo" />
                    <div className="l" /><div className="l" /><div className="l" />
                    <div className="cta-mini" />
                  </div>
                  <div className="hero">
                    <div className="txt">
                      <div className="pill">NEW / 2026</div>
                      <div className="l" /><div className="l" /><div className="m" />
                      <div style={{ height: 4 }} />
                      <div className="p" /><div className="p" />
                      <div style={{ height: 6 }} />
                      <div className="s" />
                    </div>
                    <div className="pic">
                      <div className="pic-dot" />
                      <div className="pic-arrow" />
                    </div>
                  </div>
                  <div className="strip">
                    <span /><span /><span /><span /><span />
                  </div>
                </div>
                <div className="handles" />
                <div className="ffA-cursor">
                  <span className="label">22.design</span>
                </div>
                <div className="comment-pin">
                  <span className="pin-num">3</span>
                </div>
              </div>

              <div className="panel">
                <div className="panel-tabs">
                  <span className="active">Design</span>
                  <span>Prototype</span>
                  <span>CMS</span>
                </div>
                <div className="panel-label">Layer</div>
                <div className="prop"><span>Hero</span><span className="v">Frame</span></div>
                <div className="prop"><span>W × H</span><span className="v">1440 × 720</span></div>

                <div className="panel-label">Fill</div>
                <div className="prop with-chip"><span className="chip" style={{ background: '#FF6600' }} /><span>#FF6600</span><span className="v">100%</span></div>
                <div className="prop with-chip"><span className="chip grad" /><span>Linear</span><span className="v">2 stops</span></div>

                <div className="panel-label">Typography</div>
                <div className="prop"><span>Big Shoulders</span><span className="v">900</span></div>
                <div className="prop"><span>Size · Lead</span><span className="v">72 / 0.95</span></div>

                <div className="panel-label">Palette</div>
                <div className="swatches">
                  <span style={{ background: '#FF6600' }} />
                  <span style={{ background: '#9747FF' }} />
                  <span style={{ background: '#4BC292' }} />
                  <span style={{ background: '#0F1B3D' }} />
                  <span style={{ background: '#F5EEFF' }} />
                  <span style={{ background: '#FAFAF7', border: '1px solid rgba(255,255,255,0.2)' }} />
                </div>

                <div className="panel-label">Effects</div>
                <div className="prop"><span>Shadow</span><span className="v">0 30 80</span></div>
                <div className="prop"><span>Radius</span><span className="v">20</span></div>

                <div className="panel-spacer" />
                <div className="panel-label">Publish</div>
                <div className="publish">
                  <span className="publish-live">● LIVE</span>
                  <span>framerfejlesztő.hu</span>
                </div>
                <div className="publish-meta">
                  <span>v2.14</span><span>·</span><span>CDN: EU</span><span>·</span><span>99 pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live site card */}
          <div className="ffA-card ffA-live">
            <div className="chrome">
              <span className="dot" style={{ background: '#FF5F57' }} />
              <span className="dot" style={{ background: '#FEBC2E' }} />
              <span className="dot" style={{ background: '#28C840' }} />
              <span className="url"><span className="lock">🔒</span>framerfejlesztő.hu</span>
              <span className="chrome-badge">SSL · 98</span>
            </div>
            <div className="body">
              <div className="topbar">
                <span className="logo">22<sup>!</sup></span>
                <div className="links">
                  <span>Folyamat</span><span>Munkáink</span><span>Árak</span><span>GYIK</span>
                </div>
                <span className="btn">Kapcsolat →</span>
              </div>
              <div className="announce">
                <span className="dot-live" /> <b>Újdonság</b> · Framer v4 támogatás · 5 új sablon élesítve
                <span className="arr">→</span>
              </div>
              <div className="content">
                <div>
                  <div className="eyebrow">
                    <span className="eb-chip">&#9670; Framer Expert</span>
                    <span className="eb-stars">★★★★★ <b>4.9</b></span>
                  </div>
                  <div className="ffA-live-heading">Weboldal napok<br />alatt, <em>nem hetek alatt.</em></div>
                  <p>Framer + senior 22.design csapat. Nincs átadás, nincs dupla költség. Te magad töltöd fel a tartalmat.</p>
                  <div className="cta-row">
                    <span className="mini-cta">Pitchelj minket! →</span>
                    <span className="mini-cta ghost">Élő demó</span>
                  </div>
                  <div className="stat-row">
                    <div><b>5–10</b><span>munkanap</span></div>
                    <div><b>120+</b><span>projekt</span></div>
                    <div><b>99</b><span>Lighthouse</span></div>
                  </div>
                </div>
                <div className="pic">
                  <img
                    srcSet={thumbsUpResponsive}
                    sizes="240px"
                    width={240}
                    height={240}
                    loading="lazy"
                    alt=""
                  />
                  <span className="pic-badge">LIVE</span>
                </div>
              </div>
              <div className="logos-strip">
                <span>REGIO</span><span>APOLLO</span><span>CAESAR</span><span>TEDDY</span><span>KORONA</span><span>KERN</span>
              </div>
            </div>
          </div>

          <div className="ffA-toggle">
            <button className={mode === 'design' ? 'active' : ''} onClick={() => setMode('design')}>Design</button>
            <button className={mode === 'live' ? 'active' : ''} onClick={() => setMode('live')}>Live</button>
          </div>
        </motion.div>

        <motion.div
          style={{ textAlign: 'center', marginTop: 64, fontSize: 13, opacity: 0, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 800 }}
          animate={heroRevealed ? { opacity: 0.7 } : {}}
          transition={{ duration: 0.6, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          ↓ görgess lejjebb, hogy megértsd a teljes folyamatot
        </motion.div>
      </div>
    </section>
  );
}
