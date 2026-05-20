import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export default function HeroTransition() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Track scroll progress within this 180vh scroll track
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  // Typography merge transformations:
  // - "VAN" slides in from the left to center (X=0)
  // - "GUARD" slides in from the right to center (X=0)
  // Both meet precisely at scroll progress 0.5 (middle of transition track)
  const vanX = useTransform(scrollYProgress, [0.1, 0.5], ['-100%', '0%']);
  const guardX = useTransform(scrollYProgress, [0.1, 0.5], ['100%', '0%']);

  // Dynamic opacity fades: taglines and horizontal rule fade in after typography merges
  const contentOpacity = useTransform(scrollYProgress, [0.48, 0.58], [0, 1]);
  const containerScale = useTransform(scrollYProgress, [0.4, 0.6, 0.9], [0.95, 1.05, 0.85]);
  const horizontalRuleScale = useTransform(scrollYProgress, [0.48, 0.6], [0, 1]);

  // Cybergrid overlay scale & opacity
  const gridOpacity = useTransform(scrollYProgress, [0.1, 0.5, 0.9], [0.1, 0.35, 0.1]);
  const gridScale = useTransform(scrollYProgress, [0.1, 0.9], [1.1, 0.95]);

  return (
    <section 
      ref={sectionRef} 
      className="relative h-[150vh] md:h-[180vh] bg-[#020204] overflow-hidden select-none"
    >
      {/* ── STICKY VIEWPORT CONTAINER ── */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden z-10">
        
        {/* ── PREMIUM CYBERGRID VECTOR OVERLAY ── */}
        <motion.div 
          style={{ opacity: gridOpacity, scale: gridScale }}
          className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
        >
          {/* Cyan/Blue Neon Coordinates Grid */}
          <div 
            style={{ 
              backgroundImage: 'radial-gradient(circle, rgba(26,107,255,0.12) 1px, transparent 1px)',
              backgroundSize: '40px 40px' 
            }} 
            className="absolute inset-0 w-full h-full opacity-60"
          />
          {/* Subtle concentric circles overlay */}
          <div className="absolute w-[600px] h-[600px] rounded-full border border-brand-cobalt/5 blur-[2px] animate-pulse" />
          <div className="absolute w-[900px] h-[900px] rounded-full border border-brand-cobalt/3" />
        </motion.div>

        {/* ── CENTRAL NARRATIVE CONTAINER ── */}
        <motion.div 
          style={{ scale: containerScale }}
          className="relative z-10 flex flex-col items-center justify-center text-center px-6 w-full max-w-7xl"
        >
          {/* Tagline category label */}
          <motion.span 
            style={{ opacity: contentOpacity }}
            className="text-brand-cobalt text-[9px] md:text-[11px] tracking-[8px] md:tracking-[10px] font-mono uppercase font-bold block mb-6 shadow-[0_0_15px_rgba(26,107,255,0.4)]"
          >
            [ ARCHITECTURE OVERVIEW ]
          </motion.span>

          {/* GIANT SCROLL-MERGING TYPOGRAPHY */}
          <div className="relative flex items-center justify-center w-full overflow-visible font-display font-black leading-none text-white select-none">
            {/* "VAN" half */}
            <motion.div 
              style={{ x: vanX }}
              className="text-right w-1/2 pr-0.5 text-5xl sm:text-7xl md:text-9xl tracking-tighter uppercase whitespace-nowrap"
            >
              VAN
            </motion.div>
            
            {/* "GUARD" half */}
            <motion.div 
              style={{ x: guardX }}
              className="text-left w-1/2 pl-0.5 text-5xl sm:text-7xl md:text-9xl tracking-tighter uppercase whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400"
            >
              GUARD
            </motion.div>
          </div>

          {/* GLOWING LASER RULE LINE */}
          <motion.div 
            style={{ scaleX: horizontalRuleScale, opacity: contentOpacity }}
            className="w-48 md:w-80 h-[1.5px] bg-gradient-to-r from-transparent via-[#1a6bff] to-transparent mt-6 md:mt-8 shadow-[0_0_10px_#1a6bff]"
          />

          {/* NARRATIVE TAGLINES (Fade up staggered) */}
          <motion.p 
            style={{ opacity: contentOpacity }}
            className="text-brand-titanium mt-8 text-[10px] sm:text-xs md:text-sm tracking-[0.35em] font-light uppercase max-w-2xl leading-relaxed"
          >
            Decoding the new standard of premium performance.
            <br />
            <span className="text-white/40 text-[8px] sm:text-[9px] font-mono block mt-3">COSMIC CHASSIS • NEURAL SYNERGY</span>
          </motion.p>
        </motion.div>

        {/* ── STUNNING SCROLL PROMPT ── */}
        <motion.div 
          style={{ opacity: contentOpacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none select-none z-20"
        >
          <span className="text-[7px] font-mono tracking-[4px] text-white/30 uppercase">DECIPHER CORE FEATURES</span>
          <div className="w-5 h-8 border border-white/20 rounded-full flex justify-center p-1.5 relative overflow-hidden">
            <div className="w-1.5 h-1.5 bg-brand-cobalt rounded-full animate-[bounce_1.8s_infinite] shadow-[0_0_8px_#1a6bff]" />
          </div>
        </motion.div>
      </div>

      {styleElement}
    </section>
  );
}

// Stethic bouncing scroll bar indicator keyframes inline
const styleElement = (
  <style>{`
    @keyframes bounce {
      0%, 100% {
        transform: translate3d(0, 0px, 0);
      }
      50% {
        transform: translate3d(0, 10px, 0);
      }
    }
  `}</style>
);
