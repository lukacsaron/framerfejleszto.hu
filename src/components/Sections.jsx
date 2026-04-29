import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Arrow, ArrowUpRight, Plus } from './Icons';
import { FFButton, FFStamp, FFLogoMark } from './Primitives';
import { Reveal, RevealGroup, RevealChild, TypewriterReveal } from './animations/Reveal';
import CountUp from './animations/CountUp';

// Section illustrations (responsive variants for layout-flexible cards)
import caesarUiCollage from '../assets/images/illustrations/caesar-ui-collage.avif?w=400;800;1200&format=avif&as=picture';
import okHandType from '../assets/images/illustrations/ok-hand-type.avif?w=400;800&format=avif&as=picture';
import aiBrainHead from '../assets/images/illustrations/ai-brain-head.avif?w=400;800;1200&format=avif&as=picture';

/* ═════════ Problem vs Solution — Before/After Slider ═════════ */
export function ProblemSolution() {
  const [split, setSplit] = useState(65);
  const [dragging, setDragging] = useState(false);
  const sliderRef = useRef(null);

  const updateSplit = useCallback((clientX) => {
    const el = sliderRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSplit(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  }, []);

  const onPointerDown = useCallback((e) => {
    setDragging(true);
    updateSplit(e.clientX);
    if (e.currentTarget.setPointerCapture && e.pointerId != null) {
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* pointer capture not supported */ }
    }
  }, [updateSplit]);

  const onPointerMove = useCallback((e) => {
    if (!dragging) {
      // Allow desktop hover-to-scrub
      if (e.pointerType === 'mouse') updateSplit(e.clientX);
      return;
    }
    e.preventDefault();
    updateSplit(e.clientX);
  }, [dragging, updateSplit]);

  const onPointerUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    if (!dragging) return;
    const stop = () => setDragging(false);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
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
            ref={sliderRef}
            className="ff-vs-slider"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            data-cursor="slider"
          >
            {/* LEFT — traditional (always visible underneath) */}
            <div className="ff-vs-slider-bad">
              <picture>
                <source type="image/avif" srcSet={caesarUiCollage.sources.avif} />
                <img
                  className="ff-vs-slider-illu bad"
                  src={caesarUiCollage.img.src}
                  width={caesarUiCollage.img.w}
                  height={caesarUiCollage.img.h}
                  loading="lazy"
                  alt=""
                  aria-hidden="true"
                />
              </picture>
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
              <picture>
                <source type="image/avif" srcSet={okHandType.sources.avif} />
                <img
                  className="ff-vs-slider-illu good"
                  src={okHandType.img.src}
                  width={okHandType.img.w}
                  height={okHandType.img.h}
                  loading="lazy"
                  alt=""
                  aria-hidden="true"
                />
              </picture>
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
                  <h3>{s.title}</h3>
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
            <picture>
              <source type="image/avif" srcSet={aiBrainHead.sources.avif} />
              <motion.img
                src={aiBrainHead.img.src}
                width={aiBrainHead.img.w}
                height={aiBrainHead.img.h}
                loading="lazy"
                alt="22.design senior team"
                style={{ y: useTransform(scrollYProgress, [0, 1], [40, -40]) }}
              />
            </picture>
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
    // Use the section element directly — RevealGroup doesn't forward refs.
    const root = gridRef.current || document.getElementById('works')
    if (!root) return

    const mq = window.matchMedia('(max-width: 768px)')
    const isMobile = mq.matches
    const cards = Array.from(root.querySelectorAll('.pitem'))

    // Pause off-screen videos on mobile to save data; resume when they re-enter
    // view. Global autoplay handling lives in App.useGlobalVideoAutoplay.
    const playObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const v = entry.target.querySelector('.thumb video')
          if (!v) return
          if (entry.isIntersecting) {
            const p = v.play()
            if (p && typeof p.catch === 'function') p.catch(() => {})
          } else if (isMobile) {
            v.pause()
          }
        })
      },
      { threshold: 0.15 }
    )
    cards.forEach((card) => playObserver.observe(card))

    let kenBurnsObserver
    if (!isMobile) {
      kenBurnsObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const media = entry.target.querySelector('.thumb img, .thumb video')
              if (media) media.classList.add('ken-burns-active')
              kenBurnsObserver.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.8 }
      )
      cards.forEach((card) => kenBurnsObserver.observe(card))
    }

    return () => {
      playObserver.disconnect()
      kenBurnsObserver?.disconnect()
    }
  }, [])

  return (
    <section className="ff-section paper" id="works" ref={gridRef}>
      <div className="ff-container">
        <Reveal>
          <div className="ff-section-head">
            <div>
              <div className="ff-eyebrow" style={{ color: 'var(--c-orange-600)' }}>KIEMELT MUNKÁINK</div>
              <TypewriterReveal>MI NEM HIRDETJÜK MAGUNKAT.<br /><span style={{ color: 'var(--c-orange-600)' }}>AZ ÜGYFELEINK VISZONT IGEN.</span></TypewriterReveal>
            </div>
            <p className="lead">Néhány projekt, amin szerettünk dolgozni és no-code eszközökkel készült.</p>
          </div>
        </Reveal>
        <RevealGroup className="ff-portfolio" stagger={0.1}>
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
                    <h3>{p.title}</h3>
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
              <TypewriterReveal style={{ fontFamily: 'var(--ff-display)', textTransform: 'uppercase', fontSize: 'clamp(36px, 4.6vw, 64px)', letterSpacing: '-0.02em', lineHeight: 1.02, margin: '0 0 20px' }}>VÁLASZOK,<br />MIELŐTT<br />MEGKÉRDEZNÉD.</TypewriterReveal>
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
                    <h3 style={{ margin: 0 }}>{f.q}</h3>
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
            <picture>
              <source type="image/avif" srcSet={okHandType.sources.avif} />
              <img
                src={okHandType.img.src}
                width={okHandType.img.w}
                height={okHandType.img.h}
                loading="lazy"
                className="illo"
                alt=""
              />
            </picture>
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
                <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
                <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
                <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
              </div>
            </div>
          </RevealChild>
          <RevealChild>
            <div className="ff-footer-col">
              <h3>Szolgáltatás</h3>
              <a href="#">Framer fejlesztés</a>
              <a href="#">Landing oldal</a>
              <a href="#">Microsite</a>
              <a href="#">CMS integráció</a>
            </div>
          </RevealChild>
          <RevealChild>
            <div className="ff-footer-col">
              <h3>22.design</h3>
              <a href="#">Fő weboldal</a>
              <a href="#">UX Audit</a>
              <a href="#">Szolgáltatások</a>
              <a href="#">Blog</a>
            </div>
          </RevealChild>
          <RevealChild>
            <div className="ff-footer-col">
              <h3>Kapcsolat</h3>
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
