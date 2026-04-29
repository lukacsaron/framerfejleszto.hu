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
function DemoEdit()       { return <div className="bdemo bdemo-edit" />; }
function DemoAnimations() { return <div className="bdemo bdemo-anim" />; }
function DemoPricing()    { return <div className="bdemo bdemo-price" />; }
function DemoLighthouse() { return <div className="bdemo bdemo-lh" />; }
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
