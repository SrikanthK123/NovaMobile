'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import ProductSpotlight from '../gaming/ProductSpotlight';
import CountdownTimer from '../gaming/CountdownTimer';
import WaitlistForm from '../gaming/WaitlistForm';
import ProductProgressDots from '../gaming/ProductProgressDots';

// ─────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────
const GAMING_PRODUCTS = [
  {
    id: 1,
    name: 'NOVA',
    model: 'TRIGGER PRO',
    category: 'GAMING PERIPHERAL',
    image: 'images/NOVA GamingTrigger.png',
    launchDate: 'Q1 2026',
    direction: 'left' as const,
    specs: [
      { title: 'Ultra-low latency response', detail: '0.8ms trigger actuation' },
      { title: 'Aerospace aluminum body',    detail: 'CNC machined 6061-T6' },
      { title: 'Cobalt blue LED strip',      detail: 'Customizable per-zone RGB' },
      { title: 'Universal compatibility',    detail: 'Fits all phones 5.5″–7.2″' },
    ],
    accentWidget: null as null,
    enterStart:   0.15,
    spotlightEnd: 0.28,
    exitEnd:      0.33,
  },
  {
    id: 2,
    name: 'NOVA',
    model: 'COOLER X1',
    category: 'THERMAL MANAGEMENT',
    image: 'images/NOVA-Coolfan.png',
    launchDate: 'Q2 2026',
    direction: 'right' as const,
    specs: [
      { title: 'Ultra-silent turbine',    detail: '18dB noise floor at max RPM' },
      { title: '360° RGB halo ring',      detail: 'Cobalt blue always-on signature' },
      { title: 'Semiconductor cooling',   detail: 'Drops phone temp by 15°C' },
      { title: 'Magnetic quick-attach',   detail: '0.5 second attachment system' },
    ],
    accentWidget: 'temperature' as const,
    enterStart:   0.33,
    spotlightEnd: 0.46,
    exitEnd:      0.51,
  },
  {
    id: 3,
    name: 'NOVA',
    model: 'SOUNDPRO X',
    category: 'AUDIO ENGINEERING',
    image: 'images/NOVA EarBuds.png',
    launchDate: 'Q3 2026',
    direction: 'left' as const,
    specs: [
      { title: 'Lossless gaming audio',     detail: '24-bit, 96kHz crystal clarity' },
      { title: 'AI noise cancellation',     detail: 'NOVA MIND isolation engine' },
      { title: 'Ultra-low latency mode',    detail: '28ms gaming mode, zero lag' },
      { title: '48hr total battery life',   detail: '12hr buds + 36hr case' },
    ],
    accentWidget: 'waveform' as const,
    enterStart:   0.51,
    spotlightEnd: 0.65,
    exitEnd:      0.70,
  },
];

const LAUNCH_DATE = new Date('2026-09-01T00:00:00');

// Which "phase" is active based on scroll
type Phase = 'intro' | 'p1' | 'cut1' | 'p2' | 'cut2' | 'p3' | 'cta' | 'none';

function getPhase(v: number): Phase {
  if (v < 0.15)  return 'intro';
  if (v < 0.33)  return 'p1';
  if (v < 0.35)  return 'cut1';
  if (v < 0.51)  return 'p2';
  if (v < 0.53)  return 'cut2';
  if (v < 0.70)  return 'p3';
  return 'cta';
}

// ─────────────────────────────────────────────────────────
// KEYFRAMES (injected once)
// ─────────────────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes gamingOrb {
    0%,100% { transform:scale(0.85); opacity:.4; }
    50%     { transform:scale(1.15); opacity:.9; }
  }
  @keyframes gBounce {
    0%,100% { transform:translateY(0); }
    50%     { transform:translateY(6px); }
  }
  @keyframes gFadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes gPulse {
    0%,100% { opacity:1; }
    50%     { opacity:.35; }
  }
`;

// ─────────────────────────────────────────────────────────
// SUB 1 — CINEMATIC INTRO
// ─────────────────────────────────────────────────────────
function GamingIntro({
  scrollProgress,
}: {
  scrollProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  // Elements build up 0→15%, whole block fades out 13→16%
  const sectionOp = useTransform(scrollProgress, [0, 0.005, 0.13, 0.165], [0, 1, 1, 0]);
  const lineScale = useTransform(scrollProgress, [0.005, 0.055], [0, 1]);
  const badgeOp   = useTransform(scrollProgress, [0.04, 0.08], [0, 1]);
  const h1Op      = useTransform(scrollProgress, [0.06, 0.10], [0, 1]);
  const h1Y       = useTransform(scrollProgress, [0.06, 0.10], [40, 0]);
  const h2Op      = useTransform(scrollProgress, [0.08, 0.12], [0, 1]);
  const h2Y       = useTransform(scrollProgress, [0.08, 0.12], [40, 0]);
  const subOp     = useTransform(scrollProgress, [0.10, 0.14], [0, 1]);
  const subY      = useTransform(scrollProgress, [0.10, 0.14], [20, 0]);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-6
                 select-none pointer-events-none"
      style={{ opacity: sectionOp, zIndex: 10, background: '#050508' }}
    >
      {/* Pulsing blue orb */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          style={{
            width: 560,
            height: 560,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(26,107,255,0.10) 0%, transparent 70%)',
            animation: 'gamingOrb 2.5s ease-in-out infinite',
          }}
        />
      </div>

      {/* Line */}
      <motion.div
        className="bg-[#1a6bff] mb-7"
        style={{ height: 1, width: 120, scaleX: lineScale, transformOrigin: 'left' }}
      />

      {/* Badge */}
      <motion.span
        className="font-sans font-bold text-[#1a6bff] uppercase tracking-[6px] mb-7 block"
        style={{ fontSize: 11, opacity: badgeOp }}
      >
        [ NOVA GAMING SERIES ]
      </motion.span>

      {/* Headline 1 */}
      <motion.h2
        className="font-display font-extrabold text-white uppercase leading-[.88] tracking-tighter"
        style={{ fontSize: 'clamp(52px, 9vw, 130px)', opacity: h1Op, y: h1Y }}
      >
        THE ARSENAL
      </motion.h2>

      {/* Headline 2 */}
      <motion.h2
        className="font-display font-extrabold uppercase leading-[.88] tracking-tighter"
        style={{
          fontSize: 'clamp(52px, 9vw, 130px)',
          color: 'rgba(255,255,255,0.28)',
          opacity: h2Op,
          y: h2Y,
        }}
      >
        IS COMING.
      </motion.h2>

      {/* Subtext */}
      <motion.p
        className="font-sans mt-8 max-w-sm leading-relaxed"
        style={{ fontSize: 15, letterSpacing: 2, color: 'rgba(255,255,255,0.48)', opacity: subOp, y: subY }}
      >
        Three weapons. Engineered for dominance.
        <br />Launching 2026.
      </motion.p>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-10 flex flex-col items-center gap-2"
        style={{ opacity: subOp }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[4px] text-white/30">
          SCROLL TO EXPLORE
        </span>
        <svg
          width="14" height="10" viewBox="0 0 14 10" fill="none"
          className="text-[#1a6bff]"
          style={{ animation: 'gBounce 1.5s ease-in-out infinite' }}
        >
          <path d="M1 1L7 8L13 1" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// SCENE-CUT LINE
// ─────────────────────────────────────────────────────────
function SceneCutLine({
  scrollProgress, start, end,
}: {
  scrollProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  start: number; end: number;
}) {
  const mid    = (start + end) / 2;
  const scaleX = useTransform(scrollProgress, [start, mid, end], [0, 1, 0]);
  const op     = useTransform(scrollProgress, [start, start + 0.008, end - 0.008, end], [0, 1, 1, 0]);

  return (
    <motion.div
      aria-hidden
      className="absolute left-0 right-0 h-px bg-[#1a6bff] pointer-events-none"
      style={{
        top: '50%',
        scaleX, opacity: op,
        transformOrigin: 'left',
        boxShadow: '0 0 14px rgba(26,107,255,0.65)',
        zIndex: 30,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────
// SUB 3 — CTA / COUNTDOWN
// ─────────────────────────────────────────────────────────
function GamingCTA({
  scrollProgress,
  baseUrl,
}: {
  scrollProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  baseUrl: string;
}) {
  const sectionOp = useTransform(scrollProgress, [0.68, 0.76], [0, 1]);
  const subY      = useTransform(scrollProgress, [0.68, 0.78], [-12, 0]);
  const clipPath  = useTransform(
    scrollProgress,
    [0.68, 0.78],
    ['inset(0% 0% 100% 0%)', 'inset(0% 0% 0% 0%)'],
  );

  const productThumbs = [
    { src: 'images/NOVA GamingTrigger.png', label: 'TRIGGERS' },
    { src: 'images/NOVA-Coolfan.png',       label: 'COOLER' },
    { src: 'images/NOVA EarBuds.png',       label: 'EARBUDS' },
  ];

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center px-4 md:px-8 py-6 select-none"
      style={{
        opacity: sectionOp,
        zIndex: 20,
        background: '#04040e',
        // Critical: hide from interaction when transparent
        pointerEvents: 'auto',
        overflowY: 'auto',
        overflowX: 'hidden',
        // Let Lenis own the outer scroll; this inner scroll is only a safety net
        // for very small viewports — normally all content fits in 100vh
      }}
      data-lenis-prevent // prevents Lenis from swallowing inner scroll if needed
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 w-full max-w-6xl items-center text-center md:text-left py-4">
        {/* Left Column - Headline, Launch Date & Countdown */}
        <div className="flex flex-col items-center md:items-start w-full">
          {/* Badge */}
          <span className="font-mono font-bold text-[#1a6bff] uppercase tracking-[6px] mb-3 text-[10px] block">
            [ UPCOMING LAUNCH ]
          </span>

          {/* GEAR UP headline */}
          <motion.div style={{ clipPath }}>
            <h2
              className="font-display font-extrabold text-white uppercase leading-none tracking-tighter"
              style={{ fontSize: 'clamp(44px, 7vw, 100px)' }}
            >
              GEAR UP.
            </h2>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            className="font-sans mt-3 mb-8 md:mb-10"
            style={{
              fontSize: 'clamp(13px, 1.2vw, 16px)',
              color: 'rgba(255,255,255,0.50)',
              opacity: sectionOp,
              y: subY,
              maxWidth: 480,
              lineHeight: 1.6,
            }}
          >
            The NOVA Gaming Series drops in 2026.
            <br />Join the waitlist. Get early access.
          </motion.p>

          {/* Launch date (Modern pill format) */}
          <div className="flex flex-col items-center md:items-start mb-6 w-full">
            <span
              className="font-mono font-bold text-[#1a6bff]/80 tracking-[4px] uppercase mb-2 block"
              style={{ fontSize: 9 }}
            >
              OFFICIAL LAUNCH DATE
            </span>
            <div className="flex items-center gap-4 text-white font-display font-extrabold text-2xl md:text-3xl bg-white/[0.02] border border-white/[0.06] px-5 py-2.5 rounded-2xl backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
              <span>01</span>
              <span className="text-[#1a6bff]/40">/</span>
              <span>SEP</span>
              <span className="text-[#1a6bff]/40">/</span>
              <span>2026</span>
            </div>
          </div>

          {/* Countdown */}
          <div className="w-full max-w-md flex justify-center md:justify-start">
            <CountdownTimer targetDate={LAUNCH_DATE} />
          </div>
        </div>

        {/* Right Column - waitlist & thumbnails card */}
        <div className="w-full flex flex-col items-center">
          {/* Glassmorphic signup card */}
          <div className="w-full max-w-lg p-6 md:p-8 rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col items-center">
            {/* Ambient blue background glows */}
            <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-[#1a6bff]/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-[#1a6bff]/5 blur-3xl pointer-events-none" />

            {/* Product thumbnails (Compact row: Hidden on mobile to avoid overflow!) */}
            <div className="hidden md:flex items-center gap-4 mb-6 z-10">
              {productThumbs.map(p => (
                <div key={p.label} className="flex flex-col items-center gap-1 group">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center
                               bg-white/[0.03] border border-white/[0.08] transition-all duration-300 group-hover:border-[#1a6bff] group-hover:scale-105"
                    style={{ cursor: 'default' }}
                  >
                    <img
                      src={`${baseUrl}${p.src}`}
                      alt={p.label}
                      className="w-9 h-9 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <span
                    className="font-mono uppercase tracking-[2px] text-[8px] text-white/40"
                  >
                    {p.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Title above form on mobile only */}
            <h3 className="font-display font-extrabold uppercase text-white tracking-[2px] text-[10px] mb-4 block z-10 md:hidden">
              JOIN THE WAITLIST
            </h3>

            {/* Waitlist Form */}
            <div className="w-full px-2 z-10">
              <WaitlistForm />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN SECTION
// ─────────────────────────────────────────────────────────
export default function GamingSeries() {
  const sectionRef = useRef<HTMLElement>(null);
  const baseUrl    = import.meta.env.BASE_URL;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Track active product for progress dots
  const [activeProductIdx, setActiveProductIdx] = useState(-1);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (v >= 0.15 && v < 0.33)      setActiveProductIdx(0);
    else if (v >= 0.33 && v < 0.51) setActiveProductIdx(1);
    else if (v >= 0.51 && v < 0.70) setActiveProductIdx(2);
    else                             setActiveProductIdx(-1);
  });

  // Subtle background parallax
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);

  // Heights for dot click-to-scroll (computed once)
  const sectionH = typeof window !== 'undefined' ? window.innerHeight * 6 : 6000;
  const productScrollStarts = [
    0.15 * sectionH,
    0.33 * sectionH,
    0.51 * sectionH,
  ];

  return (
    <>
      <style>{KEYFRAMES}</style>

      <section
        id="nova-gaming"
        ref={sectionRef}
        className="relative"
        style={{ height: '600vh' }}
      >
        {/* ── STICKY VIEWPORT ─────────────────────────────── */}
        <div
          className="sticky top-0 h-screen"
          style={{ overflow: 'hidden', background: '#050508' }}
        >
          {/* Space parallax background */}
          <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ y: bgY, zIndex: 0 }}
          >
            <img
              src={`${baseUrl}images/cosmic-wallpaper.png`}
              alt=""
              className="w-full h-full object-cover"
              style={{ opacity: 0.055 }}
              loading="lazy"
            />
          </motion.div>

          {/* Dark gradient overlay on top of parallax */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 1,
              background:
                'linear-gradient(180deg,#050508 0%,rgba(5,5,8,0.90) 50%,#050508 100%)',
            }}
          />

          {/* ── INTRO (z-10, fades out at 13–16%) ── */}
          <GamingIntro scrollProgress={scrollYProgress} />

          {/* ── PRODUCT SPOTLIGHTS (z-10 each, own opacity range) ── */}
          {GAMING_PRODUCTS.map((p, i) => (
            <ProductSpotlight
              key={p.id}
              name={p.name}
              model={p.model}
              category={p.category}
              image={p.image}
              launchDate={p.launchDate}
              direction={p.direction}
              index={i}
              total={GAMING_PRODUCTS.length}
              specs={p.specs}
              accentWidget={p.accentWidget}
              scrollProgress={scrollYProgress}
              enterStart={p.enterStart}
              spotlightEnd={p.spotlightEnd}
              exitEnd={p.exitEnd}
              baseUrl={baseUrl}
            />
          ))}

          {/* ── SCENE-CUT LINES ── */}
          <SceneCutLine scrollProgress={scrollYProgress} start={0.28} end={0.35} />
          <SceneCutLine scrollProgress={scrollYProgress} start={0.46} end={0.53} />

          {/* ── CTA (z-20, opaque bg, shows only at 68%+) ── */}
          <GamingCTA scrollProgress={scrollYProgress} baseUrl={baseUrl} />
        </div>

        {/* Progress dots — only when a product is active */}
        {activeProductIdx >= 0 && (
          <ProductProgressDots
            activeIndex={activeProductIdx}
            sectionRef={sectionRef}
            productScrollStarts={productScrollStarts}
          />
        )}
      </section>
    </>
  );
}
