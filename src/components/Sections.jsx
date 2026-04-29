import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Arrow, ArrowUpRight, Plus } from './Icons';
import { FFButton, FFStamp, FFLogoMark } from './Primitives';
import { Reveal, RevealGroup, RevealChild, TypewriterReveal } from './animations/Reveal';
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
              <TypewriterReveal style={{ color: '#fff' }}>A régi megközelítés lassú. A no-code gyorsabb és egyszerűbb.</TypewriterReveal>
            </div>
            <p className="lead" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Mozgasd az egered a kártyán, hasonlítsd össze a két megközelítést!
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
              <img
                className="ff-vs-slider-illu bad"
                src="/assets/illustrations/caesar-ui-collage.avif"
                alt=""
                aria-hidden="true"
              />
              <div className="ff-vs-slider-label">HAGYOMÁNYOS ÚT</div>
              <h3>Design → Handoff → Fejlesztés → Hiba → Újra</h3>
              <div className="ff-vs-slider-list">
                {['8–18 hét átfutás', 'Kettős költség: design + kód', 'Tartalommódosítás? Írj a kivitelezőnek', 'Nem tökéletes pixel-pontosság', 'Lost in translation: más a terv, más a kész oldal', 'Az élesítés külön projekt'].map(t => (
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
              <img
                className="ff-vs-slider-illu good"
                src="/assets/illustrations/ok-hand-type.avif"
                alt=""
                aria-hidden="true"
              />
              <div className="ff-vs-slider-label">A MI MEGOLDÁSUNK · FRAMER</div>
              <h3>Design = Kód. Egy lépés.</h3>
              <div className="ff-vs-slider-list">
                {['2–4 nap élesítés', 'Egy szerződés, egy csapat', 'A tartalmat te is módosíthatod', 'Pixel-pontos, 1:1', 'Aki tervezi, az építi. Nincs fordítási veszteség', 'One-click publish'].map(t => (
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

        <Reveal delay={0.35} variant="fadeIn">
          <p style={{
            fontFamily: 'var(--ff-body)', fontSize: 12, fontWeight: 700,
            color: 'rgba(255,255,255,0.35)', marginTop: 16, textAlign: 'center',
            letterSpacing: '0.14em', textTransform: 'uppercase',
          }}>
            ↔ MOZGASD AZ EGERED. HASONLÍTSD ÖSSZE
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ═════════ Process (brutalist) ═════════ */
const PROCESS_STEPS = [
  {
    n: '01', label: 'PLATFORM',
    title: 'Közösen kiválasztjuk a legjobb megoldást.',
    desc: 'Nem minden projekt Framer. Az első beszélgetésen kiderül, hogy a Framer, egyedi fejlesztési, vagy AI-assisted megoldás szolgálja ki legjobban az igényeiteket. Nem pusholunk olyan megoldást, amire igazából nincs szükségetek.',
    timeline: '1–2 nap',
    steps: [
      'A célok és elvárások tisztázása egy rövid kick-off hívás keretében',
      'Platform választás: Framer, egyedi fejlesztés, AI megoldások',
      'Tartalom, design- és funkcióigények felmérése',
      'Projekt ütemterv és mérföldkövek rögzítése',
    ],
  },
  {
    n: '02', label: 'DESIGN',
    title: 'UX/UI tervezés, felesleges körök nélkül.',
    desc: 'Nálunk nem a "nagyágyúk" adják el a szolgáltatást, aztán a juniorok dolgoznak rajta. A folyamaton közösen megyünk végig, a módosítási lehetőségeket pedig szerződésben rögzítjük.',
    timeline: '1–2 hét',
    steps: [
      'Oldalstruktúra kialakítása, tartalom repository',
      'High-fidelity design tervek Figmában 1 kulcsképernyőre, a többi screen egyből Framerben készül',
      '2–3 iterációs kör, valós időben egyeztetve',
      'Design system és komponenskönyvtár',
    ],
  },
  {
    n: '03', label: 'IMPLEMENTÁCIÓ',
    title: 'Framer-ben életre keltjük.',
    desc: 'A design maga az AZONNAL működő éles oldal. CMS, form, SEO, analytics.',
    timeline: '1–2 hét',
    steps: [
      'Pixel-pontos Framer fejlesztés, reszponzívan',
      'CMS beállítás, tartalomfeltöltés a megállapodás szerint',
      'SEO, analytics, form integráció',
      'Tesztelés, élesítés, tudásátadás',
    ],
  },
];

export function ProcessSection() {
  const [open, setOpen] = useState(0);
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
              <TypewriterReveal>AZ ELSŐ HÍVÁSTÓL AZ ÉLES OLDALIG<br />3 LÉPÉSBEN.</TypewriterReveal>
            </div>
            <p className="lead">Átlagos átfutás: <b>2-3 hét</b></p>
          </div>
        </Reveal>
        <RevealGroup className="ff-process" stagger={0.15}>
          {PROCESS_STEPS.map((s, i) => (
            <RevealChild variant="slideRight" key={s.n}>
              <div
                className={`ff-proc-step ${i === open ? 'featured' : ''}`}
                onClick={() => setOpen(open === i ? -1 : i)}
                style={i === open ? colors[i] : {}}
              >
                <div className="n">{s.n}</div>
                <div>
                  <div className="label">{s.label}</div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                  <AnimatePresence>
                    {i === open && (
                      <motion.div
                        className="ff-proc-detail"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="ff-proc-detail-inner">
                          <span className="ff-proc-timeline">{s.timeline}</span>
                          <ul className="ff-proc-detail-list">
                            {s.steps.map((step, j) => (
                              <li key={j}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <motion.button
                  className="chev"
                  animate={{ rotate: i === open ? 90 : 0 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                >
                  <Arrow />
                </motion.button>
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
              <div className="ff-eyebrow">NEM MINDEN PROJEKTHEZ KELL FRAMER !</div>
              <TypewriterReveal>
                NÉHA AZ{' '}
                <span style={{ color: 'var(--c-mint-500)' }}>EGYSZERŰ</span>
                {' '}DÖNTÉS A JÓ DÖNTÉS
              </TypewriterReveal>
            </div>
            <p className="lead">
              No-code / low-code stúdió vagyunk. Ennek ellenére azt gondoljuk, hogy <b>nem mindig a Framer a legjobb válasz</b>. Nem olyan régen egy ügyfelünk egy 150+ oldalas interaktív piackutatást kért élő grafikonokkal és komplex adatvizualizációval. Ebben az esetben AI vibekódolt megoldással építettük fel az eredményt, mert <b>a jó döntés az, ami a projekthez illik, nem ami a portfóliónkhoz</b>.
            </p>
          </div>
        </Reveal>

        <RevealGroup className="ff-vibe-showcase" stagger={0.1}>
          <RevealChild variant="slideRight">
            <div>
              <div className="ff-vibe-client-label">Ügyfél</div>
              <div className="ff-vibe-client-name">PhenoGyde</div>
              <div className="ff-vibe-project-name">ACQ Riport 2026, Magyarország</div>
              <p className="ff-vibe-desc">
                A magyar bankkártya-elfogadási piac teljes feltérképezése: 23
                szolgáltató, mystery shopping, kereskedői ügyfélút-elemzés,
                versenyképességi scoring.
              </p>
              <RevealGroup className="ff-vibe-stats" stagger={0.08}>
                <RevealChild variant="scaleUp">
                  <div className="ff-vibe-stat">
                    <div className="ff-vibe-stat-num">150+</div>
                    <div className="ff-vibe-stat-label">Oldal</div>
                  </div>
                </RevealChild>
                <RevealChild variant="scaleUp">
                  <div className="ff-vibe-stat">
                    <div className="ff-vibe-stat-num">100+</div>
                    <div className="ff-vibe-stat-label">Grafikon</div>
                  </div>
                </RevealChild>
                <RevealChild variant="scaleUp">
                  <div className="ff-vibe-stat">
                    <div className="ff-vibe-stat-num">10+</div>
                    <div className="ff-vibe-stat-label">3D térkép</div>
                  </div>
                </RevealChild>
                <RevealChild variant="scaleUp">
                  <div className="ff-vibe-stat">
                    <div className="ff-vibe-stat-num">23</div>
                    <div className="ff-vibe-stat-label">Szolgáltató</div>
                  </div>
                </RevealChild>
              </RevealGroup>
            </div>
          </RevealChild>

          <RevealChild variant="scaleUp">
            <div className="ff-vibe-browser">
              <div className="ff-vibe-browser-bar">
                <div className="ff-vibe-browser-dot" />
                <div className="ff-vibe-browser-dot" />
                <div className="ff-vibe-browser-dot" />
                <span className="ff-vibe-browser-url">phenogyde.com/acq-riport-2026</span>
              </div>
              <div className="ff-vibe-browser-content">
                <video
                  src="/assets/videos/phenogyde-2.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="PhenoGyde ACQ Riport 2026: interaktív piackutatás"
                />
              </div>
            </div>
          </RevealChild>
        </RevealGroup>

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

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const quoteText = "Az új dizájn bevezetése után háromszorosára növeltük a konverziós arányunkat. Nemcsak szép lett. Mérhetően jobban is működik.";

  return (
    <section className="ff-section sunken" ref={sectionRef}>
      <div className="ff-container">
        <div className="ff-trust">
          <Reveal variant="scaleUp" className="illo">
            <div className="wash" />
            <motion.img
              src="/assets/illustrations/ai-brain-head.avif"
              alt="22.design senior team"
              style={{ y: useTransform(scrollYProgress, [0, 1], [40, -40]) }}
            />
          </Reveal>
          <div className="text">
            <Reveal variant="eyebrow">
              <div className="ff-eyebrow" style={{ color: 'var(--c-orange-600)', marginBottom: 16 }}>KIK VAGYUNK?</div>
            </Reveal>
            <Reveal delay={0.1}>
              <TypewriterReveal as="h3">100% SENIOR</TypewriterReveal>
            </Reveal>
            <Reveal delay={0.2} variant="fadeIn">
              <p>
                Bár a technológia no-code, a minőség mögött a 22.design tapasztalt UX/UI és Service Design csapata áll. Nincsenek alvállalkozók, nincsenek gyakornokok, nincsenek köztes project managerek. <b>Aki tervezi, az élesíti is.</b>
              </p>
            </Reveal>
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
              <Reveal><p>„{quoteText}"</p></Reveal>
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
              <Reveal delay={0.15} variant="fadeIn">
                <div className="who">— Zsófi Nagy, Head of Ecommerce, REGIO Játék</div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═════════ Portfolio ═════════ */
const PROJECTS = [
  {
    video: 'logishop.mp4', bg: 'linear-gradient(135deg, var(--c-wash-peach), var(--c-wash-lilac))',
    tag: 'SAAS · FRAMER', title: 'LOGISHOP.IO', body: 'E-kereskedelmi SaaS marketing site. Tiszta narratíva, demó és feature-fókusz, Framer CMS. A projekt célja, hogy egyszerűen, érthetően adja át a Logishop ajánlatát.',
    stat: '12', statSub: 'NAP ÉLESÍTÉS',
  },
  {
    video: 'kurt.mp4', bg: 'linear-gradient(135deg, var(--c-wash-mint), var(--c-wash-sky))',
    tag: 'CONSULTING · FRAMER', title: 'KURTCONSULTING.COM', body: 'Tanácsadói brand új arculattal és Framer oldallal. Tiszta narratíva, magabiztos megjelenés.',
    stat: '8', statSub: 'NAP ÉLESÍTÉS',
  },
  {
    video: 'loginet.mp4', bg: 'linear-gradient(135deg, var(--c-wash-sky), var(--c-wash-lilac))',
    tag: 'B2B · FRAMER', title: 'LOGINET.COM', body: 'IT-hálózati szolgáltató teljes site-refresh. Új arculat, gyorsabb betöltés, jobb lead-konverzió.',
    stat: '14', statSub: 'NAP ÉLESÍTÉS',
  },
  {
    video: 'ganzmavag.mp4', bg: 'linear-gradient(135deg, var(--c-wash-lilac), var(--c-wash-peach))',
    tag: 'INDUSTRIAL · FRAMER', title: 'GANZ-MAVAG.COM', body: 'Klasszikus ipari brand digitális újraindítása. Történelmi örökség és modernitás egy arculatban.',
    stat: '180', statSub: 'ÉVES ÖRÖKSÉG',
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
            const media = entry.target.querySelector('.thumb img, .thumb video')
            if (media) media.classList.add('ken-burns-active')
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
              <TypewriterReveal>MI NEM HIRDETJÜK MAGUNKAT.<br /><span style={{ color: 'var(--c-orange-600)' }}>AZ ÜGYFELEINK VISZONT IGEN.</span></TypewriterReveal>
            </div>
            <p className="lead">Néhány projekt, amin szerettünk dolgozni és no-code eszközökkel készült.</p>
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
                    const media = e.currentTarget.querySelector('.thumb img, .thumb video')
                    if (media) media.style.transform = `translate(${x * 8}px, ${y * 8}px)`
                  }}
                  onMouseLeave={(e) => {
                    const media = e.currentTarget.querySelector('.thumb img, .thumb video')
                    if (media) {
                      media.style.transition = 'transform 0.4s var(--ease-out)'
                      media.style.transform = ''
                      setTimeout(() => { if (media) media.style.transition = '' }, 400)
                    }
                  }}
                >
                  <div className={`thumb${p.video ? ' thumb--video' : ''}`}>
                    <div className="bg" style={{ background: p.bg }} />
                    {p.video ? (
                      <video
                        src={`/assets/videos/${p.video}`}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img src={`/assets/illustrations/${p.img}`} alt={p.title} />
                    )}
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
    a: 'A Framer gyorsabb és designer-barátabb, a Webflow rugalmasabb e-kereskedelemre és komplex logikára. Mindkettőben szakértők vagyunk a 22.design-nál, így őszintén ajánljuk az adott projekthez illőt.'
  },
  {
    q: 'KAPOK HOZZÁFÉRÉST AZ OLDAL SZERKESZTÉSÉHEZ?',
    a: 'Igen. Teljes jogú hozzáférést kapsz a Framer projekt-hez, és átadjuk a szerkesztési alapokat egy 30 perces onboarding-on. Ha elakadsz, havi support-csomaggal is bármikor segítünk.'
  },
  {
    q: 'MENNYI IDŐ ALATT KÉSZÜL EL EGY OLDAL?',
    a: 'Egy egyszerűbb landing page 5–7 munkanap. Teljes marketing microsite 2–3 hét. CMS-es, többoldalas site 4–8 hét. Beleértve a design fázist is.'
  },
  {
    q: 'MENNYIBE KERÜL?',
    a: 'Az árazás mindig a komplexitástól, oldalak számától és interaktív elemektől függ, de a nagyságrend általában ezek körül az összegek körül mozog: Landing (650k Ft-tól), Microsite (1.2M Ft-tól), Full site CMS-sel (2.5M Ft-tól). Az áron felül a Framer előfizetés havi pár ezer forint.'
  },
  {
    q: 'KI HOSTOLJA AZ OLDALT?',
    a: 'A Framer saját cloud infrastruktúráján fut. Global CDN, automatikus SSL, 99.9% uptime. Nincs szerver, nincs karbantartás. Az előfizetésben minden benne van.'
  },
  {
    q: 'MI VAN, HA KINŐJÜK A FRAMERT?',
    a: 'Akkor átváltunk egyedi fejlesztésre. Ebben is segítünk. A Framer-ben felépített design-rendszer átemelhető / exportálható, nem kell mindent újrakezdeni.'
  },
  {
    q: 'NEM FÉLTEK A VENDOR LOCK-INTŐL?',
    a: 'Nem, mert nincs. A domain a tied, a tartalom a tied, a projekt a tied. A Framer oldalt bármikor exportálhatod statikus HTML/CSS/JS kódként, a design-rendszer és az assetek pedig 1:1-ben átemelhetők egy egyedi fejlesztési projektbe (Next.js, React, bármi). Ha egyszer úgy döntenél, hogy lecseréled a platformot, abban is mi segítünk a migrációval — nem hagyunk csapdában.'
  },
  {
    q: 'MENNYIRE MEGBÍZHATÓ A FRAMER? KIK HASZNÁLJÁK MÉG?',
    a: 'A Framer-en ma 144 000+ cég oldalai futnak 194 országban — köztük olyan globális márkák, mint a Perplexity, Miro, Zapier, Mixpanel, Scale AI, Superhuman, Huel és Cal.com. A platform mögött enterprise-szintű infrastruktúra áll: globális CDN, automatikus SSL, 99.9% uptime garancia, SOC 2 megfelelőség. Nem egy hobbi-eszköz, hanem komoly SaaS-cégek és AI-startupok éles produkciós környezete.'
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
              <TypewriterReveal style={{ fontFamily: 'var(--ff-display)', textTransform: 'uppercase', fontSize: 'clamp(36px, 4.6vw, 64px)', letterSpacing: '-0.02em', lineHeight: 0.95, margin: '0 0 20px' }}>VÁLASZOK,<br />MIELŐTT<br />MEGKÉRDEZNÉD.</TypewriterReveal>
              <p style={{ fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.55 }}>Nem találod a kérdésed? <a href="#final" style={{ color: 'var(--c-orange-600)', fontWeight: 700, textDecoration: 'none', borderBottom: '1.5px solid var(--c-orange-600)' }}>Írj nekünk</a>. 24 órán belül válaszolunk.</p>
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
                        <div style={{ paddingTop: 20, paddingBottom: 12 }}>{f.a}</div>
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
        <div className="ff-final-cta">
          <Reveal variant="scaleUp">
            <div className="stamp"><FFStamp onDark={true} /></div>
          </Reveal>
          <Reveal delay={0.1} variant="scaleUp">
            <img src="/assets/illustrations/ok-hand-type.avif" className="illo" alt="" />
          </Reveal>
          <Reveal delay={0.2}>
            <TypewriterReveal>HA NEM CSAK SZÉP DESIGNT,<br />HANEM MAGASABB KONVERZIÓT IS<br />SZERETNÉL: ITT KEZDJÜK.</TypewriterReveal>
          </Reveal>
          <RevealGroup stagger={0.1} style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <RevealChild variant="scaleUp">
              <FFButton variant="white" icon={<Arrow />}>Indítsuk el a projekted</FFButton>
            </RevealChild>
            <RevealChild variant="scaleUp">
              <FFButton variant="orange" icon={<ArrowUpRight />}>Nézd meg a munkáinkat</FFButton>
            </RevealChild>
          </RevealGroup>
          <Reveal delay={0.4} variant="fadeIn">
            <div style={{ marginTop: 32, fontSize: 13, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 800 }}>
              ingyenes 30 perces konzultáció · nincs kötelezettség · budapesti csapat
            </div>
          </Reveal>
        </div>
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
        <Reveal variant="fadeIn" delay={0.2}>
          <div className="ff-footer-bottom">
            <span>© 2025 22 Média és Design Stúdió Kft. All rights reserved.</span>
            <span>Adatvédelmi tájékoztató · ÁSZF</span>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
