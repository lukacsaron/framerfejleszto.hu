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
function DemoEdit() {
  const [ref, inView] = useInView();
  const [text, setText] = useState('Új kampány indul kedden');
  const [editing, setEditing] = useState(false);
  const [phase, setPhase] = useState(0); // 0=idle, 1=delete, 2=type
  const targets = [
    'Új kampány indul kedden',
    'Black Friday — most 50% kedvezmény',
    'Új termékkollekció: Tavasz 2026',
  ];
  const idx = useRef(0);

  useEffect(() => {
    if (!inView) return;
    let timer;
    const tick = () => {
      const target = targets[idx.current];
      setText(prev => {
        if (prev === target) {
          timer = setTimeout(() => {
            idx.current = (idx.current + 1) % targets.length;
            setEditing(true); setPhase(1);
            tick();
          }, 1700);
          return prev;
        }
        if (phase === 1) {
          if (prev.length === 0) { setPhase(2); return prev; }
          timer = setTimeout(tick, 35);
          return prev.slice(0, -1);
        }
        if (prev.length < target.length) {
          timer = setTimeout(tick, 60);
          return target.slice(0, prev.length + 1);
        }
        timer = setTimeout(() => { setEditing(false); }, 800);
        return prev;
      });
    };
    timer = setTimeout(tick, 600);
    return () => { clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, phase]);

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
              <span>FRAMER</span><span>★</span><span>22!</span><span>HUNGARY</span>
              <span>FRAMER</span><span>★</span><span>22!</span><span>HUNGARY</span>
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
    { label: 'framerfejlesztő.hu',     amount: 950000,  fill: 0.11, color: 'var(--c-orange-600)', highlight: true },
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
        <span className="bdp-save">−89%</span>
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
function DemoCDN()        { return <div className="bdemo bdemo-cdn" />; }

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
