import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Arrow, ArrowUpRight, Plus, Rocket, Pencil, Leaf, Bolt } from './Icons';
import { FFButton, FFStamp, FFLogoMark } from './Primitives';
import { Reveal, RevealGroup, RevealChild } from './animations/Reveal';
import CountUp from './animations/CountUp';

/* ═════════ Problem vs Solution — Before/After Slider ═════════ */
export function ProblemSolution() {
  const [split, setSplit] = useState(65);
  const [dragging, setDragging] = useState(false);

  const onMouseMove = useCallback((e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setSplit(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
  }, []);

  const onTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    const r = e.currentTarget.getBoundingClientRect();
    setSplit(Math.max(0, Math.min(100, ((touch.clientX - r.left) / r.width) * 100)));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const stop = () => setDragging(false);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchend', stop);
    };
  }, [dragging]);

  return (
    <section className="ff-section dark" id="problem">
      <div className="ff-container">
        <Reveal>
          <div className="ff-section-head">
            <div>
              <div className="ff-eyebrow" style={{ color: 'var(--c-orange-600)' }}>A PROBLÉMA × MEGOLDÁS</div>
              <h2 style={{ color: '#fff' }}>
                <span style={{
                  display: 'inline',
                  background: 'var(--c-midnight-800)',
                  padding: '0 12px',
                  boxDecorationBreak: 'clone',
                  WebkitBoxDecorationBreak: 'clone',
                }}>A régi megközelítés lassú. A no-code gyorsabb, egyszerűbb.</span>
              </h2>
            </div>
            <p className="lead" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Mozgasd az egered a kártyán, hasonlítsd össze a két megközelítést.
            </p>
          </div>
        </Reveal>

        {/* Slider card */}
        <Reveal delay={0.2}>
          <div
            className="ff-vs-slider"
            onMouseMove={onMouseMove}
            onTouchMove={onTouchMove}
            onMouseDown={() => setDragging(true)}
            data-cursor="slider"
          >
            {/* LEFT — traditional (always visible underneath) */}
            <div className="ff-vs-slider-bad">
              <div className="ff-vs-slider-label">HAGYOMÁNYOS ÚT</div>
              <h3>Design → Handoff → Fejlesztés → Hiba → Újra</h3>
              <div className="ff-vs-slider-list">
                {['8–18 hét átfutás', 'Kettős költség: design + kód', 'Tartalommódosítás? Írj ticketet', 'Pixel-eltérések, loop-ok', 'Élesítés külön projekt'].map(t => (
                  <div key={t} className="ff-vs-slider-item bad">
                    <span className="ff-vs-slider-icon bad">✕</span>
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Framer way (clipped overlay) */}
            <div
              className="ff-vs-slider-good"
              style={{ clipPath: `polygon(${split}% 0, 100% 0, 100% 100%, ${split}% 100%)` }}
            >
              <div className="ff-vs-slider-label">A MI MEGOLDÁSUNK · FRAMER</div>
              <h3>Design = Kód. Egy lépés.</h3>
              <div className="ff-vs-slider-list">
                {['3–7 nap élesítés', 'Egyetlen számla, egyetlen csapat', 'CMS: te is szerkeszted', 'Pixel-pontos, 1:1', 'One-click publish'].map(t => (
                  <div key={t} className="ff-vs-slider-item good">
                    <span className="ff-vs-slider-icon good">✓</span>
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Slider handle */}
            <div className="ff-vs-slider-track" style={{ left: `${split}%` }}>
              <div className={`ff-vs-slider-handle ${dragging ? 'grabbing' : 'idle'}`}>← →</div>
            </div>
          </div>
        </Reveal>

        <p style={{
          fontFamily: 'var(--ff-body)', fontSize: 12, fontWeight: 700,
          color: 'rgba(255,255,255,0.35)', marginTop: 16, textAlign: 'center',
          letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>
          ↔ MOZGASD AZ EGERED — HASONLÍTSD ÖSSZE
        </p>
      </div>
    </section>
  );
}

/* ═════════ Process (brutalist) ═════════ */
const PROCESS_STEPS = [
  {
    n: '01', label: 'PLATFORM',
    title: 'Kiválasztjuk a legjobb utat.',
    desc: 'Nem minden projekt Framer. Első hívás, pár kérdés a célokról, és ajánlunk platformot — Framer, Webflow, vagy egyedi. Nem adunk el olyat, amire nincs szükséged.',
  },
  {
    n: '02', label: 'DESIGN',
    title: 'UX/UI tervezés, felesleges körök nélkül.',
    desc: 'Senior designer, egy ember. Nincs „intern csinálja". 2–3 iteráció alatt készen vagyunk — közben te látod, amit látsz, és ott szólsz, ahol kell.',
  },
  {
    n: '03', label: 'IMPLEMENTÁCIÓ',
    title: 'Framer-ben életre keltjük.',
    desc: 'A design AZONNAL működő oldal. CMS, form, SEO, analytics — mind benne. Élesítés pár kattintás. És te utána is tudsz szerkeszteni.',
  },
];

export function ProcessSection() {
  const [hovered, setHovered] = useState(1);
  const colors = [
    { background: 'var(--c-orange-600)', color: '#fff' },
    { background: 'var(--c-violet-600)', color: '#fff' },
    { background: 'var(--c-mint-500)', color: '#14213D' },
  ];

  return (
    <section className="ff-section sunken" id="process">
      <div className="ff-container">
        <Reveal>
          <div className="ff-section-head">
            <div>
              <div className="ff-eyebrow" style={{ color: 'var(--c-orange-600)' }}>HOGYAN DOLGOZUNK</div>
              <h2>ELSŐ HÍVÁSTÓL ÉLES OLDALIG<br />3 LÉPÉSBEN.</h2>
            </div>
            <p className="lead">Átlagos átfutás: <b>5–10 munkanap</b>. Senior designer végigvisz — nincs PM-ek közti „visszakérdezés".</p>
          </div>
        </Reveal>
        <RevealGroup className="ff-process" stagger={0.15}>
          {PROCESS_STEPS.map((s, i) => (
            <RevealChild variant="slideRight" key={s.n}>
              <div
                className={`ff-proc-step ${i === hovered ? 'featured' : ''}`}
                onMouseEnter={() => setHovered(i)}
                onClick={() => setHovered(i)}
                style={i === hovered ? colors[i] : {}}
              >
                <div className="n">{s.n}</div>
                <div>
                  <div className="label">{s.label}</div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
                <button className="chev"><Arrow /></button>
              </div>
            </RevealChild>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* ═════════ Benefits (grid) ═════════ */
const BENEFITS = [
  { icon: <Rocket />, title: 'Tökéletes landing oldalakhoz.', body: 'Villámgyors, reszponzív, látványos. Minden, amire egy kampány-microsite-nak szüksége van.' },
  { icon: <Pencil />, title: 'Te is tudod szerkeszteni.', body: 'CMS-ben pár kattintás, nem kell minden apróságra ügynökséghez fordulni. Nincs „fejlesztői függőség".' },
  { icon: <Leaf />, title: 'Fenntartható árazás.', body: 'Nincs dupla költség design + fejlesztésre. Transzparens Framer előfizetés, havi díjjal.' },
  { icon: <Bolt />, title: 'SEO és villámgyors betöltés.', body: 'Beépített SEO, global CDN, Lighthouse 90+. Nem kell plugint vadászni.' },
];

export function Benefits() {
  return (
    <section className="ff-section paper" id="benefits">
      <div className="ff-container">
        <Reveal>
          <div className="ff-section-head">
            <div>
              <div className="ff-eyebrow" style={{ color: 'var(--c-orange-600)' }}>MIÉRT A FRAMER?</div>
              <h2>A FRAMER NEM CSAK<br />GYORS. <span style={{ color: 'var(--c-orange-600)' }}>OKOS IS.</span></h2>
            </div>
            <p className="lead">Miért pont ez a no-code platform? Négy konkrét ok, amiért a Framer más.</p>
          </div>
        </Reveal>
        <RevealGroup className="ff-benefits" stagger={0.08}>
          {BENEFITS.map((b, i) => (
            <RevealChild key={i}>
              <div className="ff-benefit">
                <div className="ic">{b.icon}</div>
                <h4>{b.title}</h4>
                <p>{b.body}</p>
              </div>
            </RevealChild>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* ═════════ Vibe-Coding — PhenoGyde Showcase ═════════ */
export function VibeCodingSection() {
  return (
    <section className="ff-section emerald" id="vibe">
      <div className="ff-container">
        <Reveal>
          <div className="ff-section-head">
            <div>
              <div className="ff-eyebrow">NEM MINDEN PROJEKTHEZ KELL FRAMER</div>
              <h2>
                NÉHA AZ{' '}
                <span style={{ color: 'var(--c-mint-500)' }}>EGYSZERŰBB</span>
                {' '}DÖNTÉS A JÓ DÖNTÉS
              </h2>
            </div>
            <p className="lead">
              Framer ügynökség vagyunk — és ezt mondjuk:{' '}
              <strong>nem mindig a Framer a válasz.</strong>{' '}
              Amikor ügyfelünk 150 oldalas interaktív piackutatást kért tele 3D
              térképekkel, élő grafikonokkal és komplex adatvizualizációval, nem
              erőltettük a Framert. AI-gyorsított fejlesztéssel építettük meg —
              mert a jó döntés az, ami a projekthez illik, nem ami a portfóliónkhoz.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="ff-vibe-showcase">
            <div>
              <div className="ff-vibe-client-label">Ügyfél</div>
              <div className="ff-vibe-client-name">PhenoGyde</div>
              <div className="ff-vibe-project-name">ACQ Riport 2026 — Magyarország</div>
              <p className="ff-vibe-desc">
                A magyar bankkártya-elfogadási piac teljes feltérképezése: 23
                szolgáltató, mystery shopping, kereskedői ügyfélút-elemzés,
                versenyképességi scoring.
              </p>
              <div className="ff-vibe-stats">
                <div className="ff-vibe-stat">
                  <div className="ff-vibe-stat-num">150+</div>
                  <div className="ff-vibe-stat-label">Oldal</div>
                </div>
                <div className="ff-vibe-stat">
                  <div className="ff-vibe-stat-num">100+</div>
                  <div className="ff-vibe-stat-label">Grafikon</div>
                </div>
                <div className="ff-vibe-stat">
                  <div className="ff-vibe-stat-num">10+</div>
                  <div className="ff-vibe-stat-label">3D térkép</div>
                </div>
                <div className="ff-vibe-stat">
                  <div className="ff-vibe-stat-num">23</div>
                  <div className="ff-vibe-stat-label">Szolgáltató</div>
                </div>
              </div>
            </div>

            <div className="ff-vibe-browser">
              <div className="ff-vibe-browser-bar">
                <div className="ff-vibe-browser-dot" />
                <div className="ff-vibe-browser-dot" />
                <div className="ff-vibe-browser-dot" />
                <span className="ff-vibe-browser-url">phenogyde.com/acq-riport-2026</span>
              </div>
              <div className="ff-vibe-browser-content">
                <img
                  src="/assets/illustrations/phenogyde-report-overview.avif"
                  alt="PhenoGyde ACQ Riport 2026 — interaktív piackutatás"
                />
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="ff-vibe-cta">
            <FFButton variant="mint" icon={<Arrow />}>Pitchelj minket</FFButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═════════ Trust / Team ═════════ */
export function TrustSection() {
  const sectionRef = useRef(null);
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const quoteText = "Az új dizájn bevezetése után háromszorosára növeltük a konverziós arányunkat. Nemcsak szép lett — mérhetően jobban is működik.";

  return (
    <section className="ff-section sunken" ref={sectionRef}>
      <div className="ff-container">
        <div className="ff-trust">
          <div className="illo">
            <div className="wash" />
            <motion.img
              src="/assets/illustrations/ai-brain-head.avif"
              alt="22.design senior team"
              style={{ y: useTransform(scrollYProgress, [0, 1], [40, -40]) }}
            />
          </div>
          <div className="text">
            <div className="ff-eyebrow" style={{ color: 'var(--c-orange-600)', marginBottom: 16 }}>KIK VAGYUNK?</div>
            <h3>100% SENIOR.<br />0% KAMU.</h3>
            <p>
              Bár a technológia no-code, a minőség mögött a 22.design tapasztalt
              UX/UI és Service Design csapata áll. Nincsenek közvetítők, nincsenek
              gyakornokok, nincsenek köztes project managerek. <b>Aki tervezi, az élesíti is.</b>
            </p>
            <div className="quote">
              <motion.span
                style={{ fontSize: '3em', lineHeight: 1, display: 'block', marginBottom: 8, fontFamily: 'var(--ff-display)' }}
                initial={{ scale: 2, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ type: 'spring', damping: 8, stiffness: 80 }}
              >
                &ldquo;
              </motion.span>
              {isMobile ? (
                <Reveal><p>„{quoteText}"</p></Reveal>
              ) : (
                <p>
                  „{quoteText.split(' ').map((word, i, arr) => (
                    <WordReveal key={i} word={word} index={i} total={arr.length} progress={scrollYProgress} />
                  ))}"
                </p>
              )}
              <motion.div
                className="stars"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
                style={{ display: 'flex', gap: 4, marginTop: 12, fontSize: 18, color: 'var(--c-orange-600)' }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.span
                    key={star}
                    variants={{
                      hidden: { scale: 0, opacity: 0 },
                      visible: { scale: 1, opacity: 1 },
                    }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                  >
                    ★
                  </motion.span>
                ))}
              </motion.div>
              <div className="who">— Zsófi Nagy, Head of Ecommerce, REGIO Játék</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WordReveal({ word, index, total, progress }) {
  const start = (index / total) * 0.6;
  const end = start + 0.15;
  const opacity = useTransform(progress, [start, end], [0.15, 1]);

  return (
    <motion.span style={{ opacity, display: 'inline-block', marginRight: '0.3em' }}>
      {word}
    </motion.span>
  );
}

/* ═════════ Portfolio ═════════ */
const PROJECTS = [
  {
    img: 'twin-heads-commerce.avif', bg: 'linear-gradient(135deg, var(--c-wash-peach), var(--c-wash-lilac))',
    tag: 'ECOMMERCE · CRO', title: 'REGIO JÁTÉK', body: 'Teljes redesign Magyarország legnagyobb játékáruházának. Jobb böngészés, okosabb kosár, valódi eredmény.',
    stat: '+22', statSub: '% KONVERZIÓ',
  },
  {
    img: 'hand-teddy-unbox.avif', bg: 'linear-gradient(135deg, var(--c-wash-mint), var(--c-wash-sky))',
    tag: 'BRAND · FRAMER', title: 'UNBOXED.HU', body: 'D2C gyerekjáték brand új identitás + Framer shop. 8 nap alatt design-tól az élesítésig.',
    stat: '8', statSub: 'NAP ÉLESÍTÉS',
  },
  {
    img: 'ui-flow-journey.avif', bg: 'linear-gradient(135deg, var(--c-wash-sky), var(--c-wash-lilac))',
    tag: 'SAAS · LANDING', title: 'DREAMJOBS', body: 'Kampány-microsite onboarding demóval. Lighthouse 98, a cold-traffic is konvertál.',
    stat: '98', statSub: 'LIGHTHOUSE',
  },
  {
    img: 'hands-wireframe-grid.avif', bg: 'linear-gradient(135deg, var(--c-wash-lilac), var(--c-wash-peach))',
    tag: 'B2B · MARKETING', title: 'WOLTERS KLUWER', body: 'Termékoldal-család, CMS-ben szerkeszthető. A marketing csapat azóta 14 új oldalt dobott fel.',
    stat: '14', statSub: 'CMS OLDAL',
  },
];

export function Portfolio() {
  const gridRef = useRef(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    if (mq.matches) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target.querySelector('.thumb img')
            if (img) img.classList.add('ken-burns-active')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.8 }
    )

    const cards = gridRef.current?.querySelectorAll('.pitem')
    cards?.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <section className="ff-section paper" id="works">
      <div className="ff-container">
        <Reveal>
          <div className="ff-section-head">
            <div>
              <div className="ff-eyebrow" style={{ color: 'var(--c-orange-600)' }}>KIEMELT MUNKÁINK</div>
              <h2>NEM HIRDETJÜK MAGUNKAT.<br /><span style={{ color: 'var(--c-orange-600)' }}>AZ ÜGYFELEINK IGEN.</span></h2>
            </div>
            <p className="lead">4 projekt az utóbbi 18 hónapból, mindegyik Framer-ben. Kattints, nézd meg élőben.</p>
          </div>
        </Reveal>
        <RevealGroup ref={gridRef} className="ff-portfolio" stagger={0.1}>
          {PROJECTS.map((p, i) => {
            const hasPrefix = p.stat.startsWith('+');
            const numericValue = parseInt(p.stat, 10);
            return (
              <motion.div
                key={p.title}
                variants={{
                  hidden: { opacity: 0, scale: 0.95, rotate: i % 2 === 0 ? -1 : 1 },
                  visible: { opacity: 1, scale: 1, rotate: 0 },
                }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="pitem"
                  data-cursor="portfolio"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
                    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
                    const img = e.currentTarget.querySelector('.thumb img')
                    if (img) img.style.transform = `translate(${x * 8}px, ${y * 8}px)`
                  }}
                  onMouseLeave={(e) => {
                    const img = e.currentTarget.querySelector('.thumb img')
                    if (img) {
                      img.style.transition = 'transform 0.4s var(--ease-out)'
                      img.style.transform = ''
                      setTimeout(() => { if (img) img.style.transition = '' }, 400)
                    }
                  }}
                >
                  <div className="thumb">
                    <div className="bg" style={{ background: p.bg }} />
                    <img src={`/assets/illustrations/${p.img}`} alt={p.title} />
                  </div>
                  <div className="meta">
                    <div className="tag">{p.tag}</div>
                    <h4>{p.title}</h4>
                    <p>{p.body}</p>
                    <div className="row">
                      <div className="stat">
                        <CountUp value={numericValue} prefix={hasPrefix ? '+' : undefined} /><sub>{p.statSub}</sub>
                      </div>
                      <a className="live" href="#">Élő oldal <ArrowUpRight /></a>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}

/* ═════════ FAQ ═════════ */
const FAQS = [
  {
    q: 'MI A KÜLÖNBSÉG A WEBFLOW ÉS A FRAMER KÖZÖTT?',
    a: 'A Framer gyorsabb és designer-barátabb, a Webflow rugalmasabb e-kereskedelemre és komplex logikára. Mindkettőben szakértők vagyunk a 22.design-nál, így őszintén ajánljuk az adott projekthez illőt — nem azt, ami nekünk kényelmes.'
  },
  {
    q: 'KAPOK HOZZÁFÉRÉST AZ OLDAL SZERKESZTÉSÉHEZ?',
    a: 'Igen. Teljes jogú hozzáférést kapsz a Framer projekt-hez, és átadjuk a szerkesztési alapokat egy 30 perces onboarding-on. Ha elakadsz, egy havi support-csomaggal bármikor segítünk.'
  },
  {
    q: 'MENNYI IDŐ ALATT KÉSZÜL EL EGY OLDAL?',
    a: 'Egy egyszerűbb landing page 3–5 munkanap. Teljes marketing microsite 5–10 munkanap. CMS-es, többoldalas site 2–3 hét. Mindezt beleértve a design fázist is.'
  },
  {
    q: 'MENNYIBE KERÜL?',
    a: 'Fix áras csomagok vannak: Landing (650k Ft-tól), Microsite (1.2M Ft-tól), Full site CMS-sel (2.5M Ft-tól). Az áron felül a Framer előfizetés havi pár ezer forint. Kérj konkrét ajánlatot egy hívással.'
  },
  {
    q: 'MI VAN, HA KINŐJÜK A FRAMERT?',
    a: 'Akkor átváltunk Webflow-ra vagy egyedi fejlesztésre — ebben is segítünk. A Framer-ben felépített design-rendszer átemelhető, nem kell mindent újrakezdeni.'
  },
];

export function FAQSection() {
  const [open, setOpen] = useState(0);
  return (
    <section className="ff-section paper" id="faq">
      <div className="ff-container">
        <div className="ff-faq">
          <Reveal>
            <div>
              <div className="ff-eyebrow" style={{ color: 'var(--c-orange-600)', marginBottom: 16 }}>GYAKORI KÉRDÉSEK</div>
              <h2 style={{ fontFamily: 'var(--ff-display)', textTransform: 'uppercase', fontSize: 'clamp(36px, 4.6vw, 64px)', letterSpacing: '-0.02em', lineHeight: 0.95, margin: '0 0 20px' }}>VÁLASZOK,<br />MIELŐTT<br />MEGKÉRDEZNÉD.</h2>
              <p style={{ fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.55 }}>Nem találod a kérdésed? <a href="#final" style={{ color: 'var(--c-orange-600)', fontWeight: 700, textDecoration: 'none', borderBottom: '1.5px solid var(--c-orange-600)' }}>Írj nekünk</a> — 24 órán belül válaszolunk.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="ff-faq-list">
              {FAQS.map((f, i) => (
                <div key={i} className={`ff-faq-item ${i === open ? 'open' : ''}`} data-cursor="faq">
                  <button className="ff-faq-q" onClick={() => setOpen(open === i ? -1 : i)} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', color: 'inherit', font: 'inherit' }}>
                    <motion.span
                      className="ic"
                      animate={{ rotate: i === open ? 45 : 0 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                      style={{ display: 'flex', flexShrink: 0 }}
                    >
                      <Plus />
                    </motion.span>
                    <h5 style={{ margin: 0 }}>{f.q}</h5>
                  </button>
                  <AnimatePresence>
                    {i === open && (
                      <motion.div
                        className="a"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ paddingTop: 8, paddingBottom: 12 }}>{f.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═════════ Final CTA ═════════ */
export function FinalCTA() {
  return (
    <section className="ff-section paper" id="final" data-cursor="cta">
      <div className="ff-container">
        <Reveal>
          <div className="ff-final-cta">
            <div className="stamp"><FFStamp onDark={true} /></div>
            <img src="/assets/illustrations/ok-hand-type.avif" className="illo" alt="" />
            <h2>HA NEMCSAK <span className="orange">SZÉP DIZÁJNT</span>,<br />HANEM <span className="hot">KONVERZIÓNÖVEKEDÉST</span> IS<br />SZERETNÉL: <span className="hot">ITT KEZDJÜK</span>.</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <FFButton variant="white" icon={<Arrow />}>Indítsuk el a projekted</FFButton>
              <FFButton variant="orange" icon={<ArrowUpRight />}>Nézd meg a munkáinkat</FFButton>
            </div>
            <div style={{ marginTop: 32, fontSize: 13, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 800 }}>
              ingyenes 30 perces konzultáció · nincs kötelezettség · budapesti csapat
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═════════ Footer ═════════ */
export function Footer() {
  return (
    <footer className="ff-footer">
      <div className="ff-container">
        <RevealGroup className="ff-footer-grid" stagger={0.06}>
          <RevealChild>
            <div className="brand-col">
              <FFLogoMark size={32} className="logo" />
              <p>A 22.design no-code műhelye. Prémium weboldalak Framer-ben, senior csapattal, kompromisszumok nélkül.</p>
              <div className="ff-socials">
                <a href="#"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 3h4v4h-4a1 1 0 00-1 1v3h5l-1 5h-4v8h-5v-8H8v-5h3V7a4 4 0 014-4z" /></svg></a>
                <a href="#"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h4v16H4zm2-3a2 2 0 100 4 2 2 0 000-4zm6 7h3.5v2.1c.5-.9 1.9-2.1 4-2.1 4 0 4.5 2.6 4.5 6V20h-4v-5c0-2.2-.8-3.2-2.2-3.2-1.6 0-2.3 1-2.3 3.2v5H12V8z" /></svg></a>
                <a href="#"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 2a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm5-3a1 1 0 110 2 1 1 0 010-2z" /></svg></a>
              </div>
            </div>
          </RevealChild>
          <RevealChild>
            <div className="ff-footer-col">
              <h6>Szolgáltatás</h6>
              <a href="#">Framer fejlesztés</a>
              <a href="#">Landing oldal</a>
              <a href="#">Microsite</a>
              <a href="#">CMS integráció</a>
            </div>
          </RevealChild>
          <RevealChild>
            <div className="ff-footer-col">
              <h6>22.design</h6>
              <a href="#">Fő weboldal</a>
              <a href="#">UX Audit</a>
              <a href="#">Szolgáltatások</a>
              <a href="#">Blog</a>
            </div>
          </RevealChild>
          <RevealChild>
            <div className="ff-footer-col">
              <h6>Kapcsolat</h6>
              <a href="mailto:hello@framerfejleszto.hu">hello@framerfejleszto.hu</a>
              <a href="#">Budapest, Hungary</a>
              <a href="#">+36 30 000 0000</a>
            </div>
          </RevealChild>
        </RevealGroup>
        <div className="ff-footer-bottom">
          <span>© 2025 22 Média és Design Stúdió Kft. — all rights reserved.</span>
          <span>Adatvédelmi tájékoztató · ÁSZF</span>
        </div>
      </div>
    </footer>
  );
}
