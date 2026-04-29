import { useState, useEffect, useRef } from 'react';
import { Rocket, Pencil, Bolt, Leaf, Globe } from './Icons';
import { Reveal, TypewriterReveal } from './animations/Reveal';

function useInView(threshold = 0.4) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { threshold },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useHover() {
  const [h, setH] = useState(false);
  return [h, { onMouseEnter: () => setH(true), onMouseLeave: () => setH(false) }];
}

function Gauge({ value, label, color, delay = 0 }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="bdemo-gauge">
      <svg viewBox="0 0 80 80" width="80" height="80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 40 40)"
          style={{ transition: `stroke-dasharray 1.4s cubic-bezier(.2,.8,.2,1) ${delay}s` }}
        />
        <text x="40" y="46" textAnchor="middle" fontSize="22" fontWeight="900" fill="#fff" fontFamily="Big Shoulders Display, Arial, sans-serif">{value}</text>
      </svg>
      <div className="bdemo-gauge-label">{label}</div>
    </div>
  );
}

// Demo placeholders — filled in by later tasks
function DemoLanding() {
  const [ref, inView] = useInView();
  const [hover, hoverHandlers] = useHover();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setTick(t => (t + 1) % 4), 1400);
    return () => clearInterval(id);
  }, [inView]);

  const active = hover ? Math.floor(Date.now() / 350) % 4 : tick;
  return (
    <div ref={ref} {...hoverHandlers} className="bdemo bdemo-landing">
      <div className="bdemo-bezel">
        <div className="bdemo-chrome">
          <span /><span /><span />
          <div className="bdemo-url">framerfejlesztő.hu</div>
        </div>
        <div className="bdemo-page">
          <div className={`bd-row hero ${active >= 0 ? 'on' : ''}`}>
            <div className="h1" />
            <div className="h2" />
            <div className="cta" />
          </div>
          <div className={`bd-row stats ${active >= 1 ? 'on' : ''}`}>
            <div><b>120+</b><span>projekt</span></div>
            <div><b>5–10</b><span>nap</span></div>
            <div><b>99</b><span>Lighthouse</span></div>
          </div>
          <div className={`bd-row cards ${active >= 2 ? 'on' : ''}`}>
            <div /><div /><div />
          </div>
          <div className={`bd-row footer ${active >= 3 ? 'on' : ''}`}>
            <div className="ftr-cta" />
          </div>
        </div>
      </div>
      <div className="bdemo-caption">Hős → Stat → Kártya → CTA — minden a helyén.</div>
    </div>
  );
}
const EDIT_TARGETS = [
  'Új kampány indul kedden',
  'Black Friday — 50% akció',
  'Új termékkollekció 2026',
];

function DemoEdit() {
  const [ref, inView] = useInView();
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState(EDIT_TARGETS[0]);
  const [phase, setPhase] = useState('idle'); // idle | deleting | typing

  useEffect(() => {
    if (!inView) return;
    const target = EDIT_TARGETS[idx];
    let timer;
    if (phase === 'idle') {
      timer = setTimeout(() => setPhase('deleting'), 2200);
    } else if (phase === 'deleting') {
      if (text.length === 0) {
        setIdx((i) => (i + 1) % EDIT_TARGETS.length);
        setPhase('typing');
      } else {
        timer = setTimeout(() => setText((t) => t.slice(0, -1)), 55);
      }
    } else if (phase === 'typing') {
      if (text === target) {
        setPhase('idle');
      } else {
        timer = setTimeout(() => setText(target.slice(0, text.length + 1)), 90);
      }
    }
    return () => clearTimeout(timer);
  }, [inView, phase, text, idx]);

  const editing = phase !== 'idle';
  return (
    <div ref={ref} className="bdemo bdemo-edit">
      <div className="bdemo-cms">
        <div className="bdemo-cms-head">
          <span className="dot" /><span className="dot" /><span className="dot" />
          <span className="bdemo-cms-tab">CMS / Hero / headline</span>
          <span className="bdemo-cms-save">{editing ? 'Mentés…' : 'Mentve ✓'}</span>
        </div>
        <div className="bdemo-cms-body">
          <div className="bdemo-cms-label">HEADLINE</div>
          <div className="bdemo-cms-input">
            <span className="txt">{text}</span>
            {editing && <span className="caret" />}
          </div>
          <div className="bdemo-cms-row">
            <div className="bdemo-cms-chip"><span className="dot-g" /> Élő</div>
            <div className="bdemo-cms-meta">v 2.14 · 4 mp után publikál</div>
          </div>
        </div>
      </div>
      <div className="bdemo-caption">Marketinges szerkeszti. Te csak nézed.</div>
    </div>
  );
}
function DemoAnimations() {
  const [ref, inView] = useInView();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const [magnet, setMagnet] = useState({ x: 0, y: 0 });
  const btnAreaRef = useRef(null);

  const onTiltMove = (e) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 14, y: px * 18 });
  };
  const onTiltLeave = () => setTilt({ x: 0, y: 0 });
  const onMagnet = (e) => {
    if (!btnAreaRef.current) return;
    const r = btnAreaRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    setMagnet({ x: (e.clientX - cx) * 0.35, y: (e.clientY - cy) * 0.35 });
  };
  const onMagnetLeave = () => setMagnet({ x: 0, y: 0 });

  return (
    <div ref={ref} className="bdemo bdemo-anim">
      <div className="bdemo-anim-grid">
        <div className="bdemo-anim-cell">
          <div
            ref={cardRef}
            className="bdemo-tilt-card"
            onMouseMove={onTiltMove}
            onMouseLeave={onTiltLeave}
            style={{ transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
          >
            <div className="bdt-shine" />
            <div className="bdt-stamp">22<sup>!</sup></div>
            <div className="bdt-label">3D TILT</div>
          </div>
          <span className="bdemo-anim-tag">Mozgasd</span>
        </div>
        <div className="bdemo-anim-cell">
          <div
            ref={btnAreaRef}
            className="bdemo-magnet-area"
            onMouseMove={onMagnet}
            onMouseLeave={onMagnetLeave}
          >
            <button
              className="bdemo-magnet-btn"
              style={{ transform: `translate(${magnet.x}px, ${magnet.y}px)` }}
            >Beszéljük meg →</button>
          </div>
          <span className="bdemo-anim-tag">Mágneses</span>
        </div>
        <div className="bdemo-anim-cell">
          <div className={`bdemo-marquee ${inView ? 'on' : ''}`}>
            <div className="bdm-track">
              {Array.from({ length: 4 }).flatMap((_, copy) => [
                <span key={`f${copy}`}>FRAMER</span>,
                <span key={`s${copy}`}>★</span>,
                <span key={`t${copy}`}>22!</span>,
                <span key={`h${copy}`}>HUNGARY</span>,
              ])}
            </div>
          </div>
          <span className="bdemo-anim-tag">Marquee</span>
        </div>
      </div>
      <div className="bdemo-caption">Pár kattintás. Nem több órányi munka.</div>
    </div>
  );
}
function DemoPricing() {
  const [ref, inView] = useInView();
  const items = [
    { label: 'Hagyományos ügynökség', amount: 8500000, fill: 1,    color: 'var(--c-slate-400)' },
    { label: 'In-house dev + designer', amount: 4200000, fill: 0.49, color: 'var(--c-slate-500)' },
    { label: 'framerfejlesztő.hu',     amount: 1950000,  fill: 0.23, color: 'var(--c-orange-600)', highlight: true },
  ];
  const fmt = (n) => n.toLocaleString('hu-HU') + ' Ft';
  return (
    <div ref={ref} className="bdemo bdemo-price">
      <div className="bdemo-price-head">
        <span>Egy landing page költsége</span>
        <span className="bdemo-price-tag">éves ÁTLAG</span>
      </div>
      <div className="bdemo-price-bars">
        {items.map((it, i) => (
          <div key={i} className={`bdp-row ${it.highlight ? 'highlight' : ''}`}>
            <div className="bdp-label">{it.label}</div>
            <div className="bdp-track">
              <div
                className="bdp-fill"
                style={{
                  width: inView ? (it.fill * 100) + '%' : 0,
                  background: it.color,
                  transitionDelay: (i * 0.18) + 's',
                }}
              >
                <span className="bdp-amount">{fmt(it.amount)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bdemo-price-foot">
        <span className="bdp-save">−59%</span>
        <span>versus ügynökség, ugyanaz a minőség</span>
      </div>
    </div>
  );
}
function DemoLighthouse() {
  const [ref, inView] = useInView();
  const scores = [
    { label: 'Performance',   value: 99,  color: '#4BC292' },
    { label: 'Accessibility', value: 96,  color: '#4BC292' },
    { label: 'Best practices', value: 100, color: '#4BC292' },
    { label: 'SEO',           value: 98,  color: '#4BC292' },
  ];
  return (
    <div ref={ref} className="bdemo bdemo-lh">
      <div className="bdemo-lh-head">
        <span className="bdemo-lh-pill">LIGHTHOUSE</span>
        <span>framerfejlesztő.hu — átlagos pontszámok</span>
      </div>
      <div className="bdemo-lh-grid">
        {scores.map((s, i) => (
          <Gauge key={i} value={inView ? s.value : 0} label={s.label} color={s.color} delay={i * 0.18} />
        ))}
      </div>
      <div className="bdemo-lh-foot">
        <div className="lf-bar"><span className="lf-bar-fill" style={{ width: inView ? '12%' : 0 }} /></div>
        <div className="lf-meta">
          <span><b>0.8s</b> First Contentful Paint</span>
          <span><b>1.2s</b> Largest Contentful Paint</span>
          <span><b>0</b> Cumulative Layout Shift</span>
        </div>
      </div>
    </div>
  );
}
function DemoCDN() {
  const [ref, inView] = useInView();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setTick(t => t + 1), 1300);
    return () => clearInterval(id);
  }, [inView]);

  const nodes = [
    { x: 40,  y: 60,  label: 'SF'  },
    { x: 90,  y: 50,  label: 'NYC' },
    { x: 145, y: 56,  label: 'LON' },
    { x: 165, y: 60,  label: 'BUD' },
    { x: 230, y: 78,  label: 'SGP' },
    { x: 260, y: 110, label: 'SYD' },
  ];
  return (
    <div ref={ref} className="bdemo bdemo-cdn">
      <div className="bdemo-cdn-head">
        <span className="bdemo-cdn-status"><i className="dot-pulse" /> 99.99% uptime · ma</span>
        <span className="bdemo-cdn-meta">automatikus SSL · global CDN · 0 üzemeltetés</span>
      </div>
      <div className="bdemo-cdn-map">
        <svg viewBox="0 0 320 140" preserveAspectRatio="xMidYMid meet">
          <g fill="rgba(255,255,255,0.08)">
            {Array.from({ length: 80 }).map((_, i) => {
              const x = (i % 20) * 16 + 8;
              const y = Math.floor(i / 20) * 28 + 14;
              const isLand = (
                (x < 80 && y > 28 && y < 100) ||
                (x > 80 && x < 175 && y > 24 && y < 90) ||
                (x > 175 && x < 280 && y > 28 && y < 95) ||
                (x > 200 && x < 270 && y > 95)
              );
              return isLand ? <circle key={i} cx={x} cy={y} r="1.6" /> : null;
            })}
          </g>
          {nodes.slice(0, -1).map((n, i) => {
            const m = nodes[i + 1];
            const mx = (n.x + m.x) / 2;
            const my = (n.y + m.y) / 2 - 12;
            const active = (tick % nodes.length) === i;
            return (
              <path
                key={i}
                d={`M ${n.x} ${n.y} Q ${mx} ${my} ${m.x} ${m.y}`}
                stroke={active ? 'var(--c-orange-600)' : 'rgba(255,255,255,0.18)'}
                strokeWidth={active ? '1.5' : '1'} fill="none"
                strokeDasharray={active ? '4 3' : '0'}
              />
            );
          })}
          {nodes.map((n, i) => {
            const active = (tick % nodes.length) === i;
            return (
              <g key={i}>
                <circle
                  cx={n.x} cy={n.y} r={active ? 7 : 4}
                  fill={active ? 'var(--c-orange-600)' : '#fff'}
                  opacity={active ? 0.25 : 0.5}
                  style={{ transition: 'all .4s' }}
                />
                <circle cx={n.x} cy={n.y} r="2.5" fill={active ? 'var(--c-orange-600)' : '#fff'} />
                <text x={n.x} y={n.y - 8} fontSize="6" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontWeight="700" letterSpacing="0.5">{n.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="bdemo-cdn-foot">
        <span><b>{nodes.length * 47}+</b> edge node</span>
        <span><b>~28ms</b> EU latency</span>
        <span><b>auto</b> SSL</span>
      </div>
    </div>
  );
}

const BENEFIT_CARDS = [
  { icon: <Rocket />,  title: 'Tökéletes kampány-landing oldalakhoz',           body: 'Villámgyors, reszponzív, látványos. Minden, amire egy értékesítési felületnek szüksége van.',                                       Demo: DemoLanding,    span: 1 },
  { icon: <Pencil />,  title: 'Te is tudod szerkeszteni',                        body: 'CMS a tartalomhoz, vizuális szerkesztő a designhoz. Ha van a csapatban digitálisan jártas marketinges, teljes az ownership — ügynökségre sincs szükség.', Demo: DemoEdit,       span: 1 },
  { icon: <Bolt />,    title: 'Animációk, amik máshol luxusnak számítanak',      body: 'Mikrointerakciók, hover-effektek, scroll-animációk. Egyedi fejlesztésnél órákba és extra költségbe kerülnek. Framer-ben ugyanez pár kattintás.',          Demo: DemoAnimations, span: 2 },
  { icon: <Leaf />,    title: 'Fenntartható és transzparens árazás',             body: 'Nincs dupla költség design + fejlesztésre, külön alvállalkozókra. Transzparens Framer előfizetés, havi díjjal.',                                          Demo: DemoPricing,    span: 2 },
  { icon: <Bolt />,    title: 'SEO és villámgyors betöltés',                     body: 'Beépített SEO, global CDN, Lighthouse 90+. Nem kell plugint vadászni, hogy az oldalad megfeleljen a sztenderdeknek.',                                     Demo: DemoLighthouse, span: 1 },
  { icon: <Globe />,   title: 'Hosting nélküli hosting',                         body: 'Nincs szerver, nem kell rendszergazda. A Framer cloud üzemelteti: automatikus SSL, global CDN, 99.9% uptime.',                                            Demo: DemoCDN,        span: 1 },
];

export default function BenefitsRich() {
  return (
    <section className="ff-section paper" id="benefits">
      <div className="ff-container">
        <Reveal>
          <div className="ff-section-head">
            <div>
              <div className="ff-eyebrow" style={{ color: 'var(--c-orange-600)' }}>MIÉRT A FRAMER?</div>
              <TypewriterReveal>A FRAMER NEM CSAK<br />GYORS.<br /><span style={{ color: 'var(--c-orange-600)' }}>OKOS IS.</span></TypewriterReveal>
            </div>
            <p className="lead">Miért a Framert választjuk a legtöbb no-code design & fejlesztés projektünkhöz? Összegyűjtöttük a 6 legfontosabb okot.</p>
          </div>
        </Reveal>
        <div className="bdemo-grid">
          {BENEFIT_CARDS.map((b, i) => {
            const Demo = b.Demo;
            return (
              <article key={i} className={`bdemo-card span-${b.span}`}>
                <div className="bdemo-card-head">
                  <div className="ic">{b.icon}</div>
                  <div>
                    <h4>{b.title}</h4>
                    <p>{b.body}</p>
                  </div>
                </div>
                <div className="bdemo-card-body"><Demo /></div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { useInView, useHover, Gauge };
