'use client';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';

interface UnboxingProps {
  active?: boolean;
  onComplete?: () => void;
}

export default function Unboxing({ active = false, onComplete }: UnboxingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  
  // Set to true if you want to restore the original scroll-triggered unboxing behavior
  const USE_SCROLL_UNBOXING = false;
  
  // Element Refs
  const boxRef = useRef<HTMLDivElement>(null);
  const lidRef = useRef<HTMLDivElement>(null);
  const raysContainerRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const phoneScreenRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If not using scroll-based unboxing, wait until the intro loader completes
    if (!USE_SCROLL_UNBOXING && !active) return;

    const container = containerRef.current;
    const sticky = stickyRef.current;
    const box = boxRef.current;
    const lid = lidRef.current;
    const rays = raysContainerRef.current;
    const phone = phoneRef.current;
    const phoneScreen = phoneScreenRef.current;
    const text = textRef.current;

    if (!container || !sticky || !box || !lid || !rays || !phone || !phoneScreen || !text) return;

    const ctx = gsap.context(() => {
      if (USE_SCROLL_UNBOXING) {
        // ── 1. Setup Initial States for Scroll-Triggered mode ──
        gsap.set(box, { y: '120vh', opacity: 0.2, scale: 0.8 });
        gsap.set(lid, { y: 0, opacity: 1 });
        gsap.set(rays, { opacity: 0 });
        gsap.set(phone, { y: '150%', scale: 0.75, opacity: 0 });
        gsap.set(phoneScreen, { opacity: 0 });
        gsap.set(text, { opacity: 0, y: 30 });

        // ── 2. Build Scroll Trigger Timeline ──
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            pin: sticky,
            invalidateOnRefresh: true,
          }
        });

        // Scroll 0% -> 25%: Box appears and centers
        tl.to(box, {
          y: '0vh',
          opacity: 1,
          scale: 1,
          duration: 2,
          ease: 'power2.out',
        })
        .to({}, { duration: 0.5 }) // Brief pause

        // Scroll 25% -> 55%: Box lid lifts & God rays emit
        .to(lid, {
          y: -180,
          opacity: 0,
          scale: 0.95,
          duration: 2.5,
          ease: 'power3.inOut'
        }, 'lift')
        .to(rays, {
          opacity: 0.75,
          duration: 1.5,
          ease: 'power2.out'
        }, 'lift')
        .to(phone, {
          y: '-10%',
          opacity: 1,
          scale: 0.85,
          duration: 3,
          ease: 'power3.out'
        }, 'lift+=0.5')

        // Scroll 55% -> 80%: Phone centers, box fades, screen turns on
        .to(box, {
          opacity: 0,
          y: 100,
          duration: 2,
          ease: 'power2.inOut'
        }, 'center')
        .to(rays, {
          opacity: 0,
          duration: 1.5,
          ease: 'power2.inOut'
        }, 'center')
        .to(phone, {
          y: '-40px',
          scale: 0.95,
          duration: 2.5,
          ease: 'power3.inOut'
        }, 'center')
        .to(phoneScreen, {
          opacity: 1,
          duration: 1.5,
          ease: 'power2.out'
        }, 'center+=1')
        .to(text, {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: 'power2.out'
        }, 'center+=1')

        // Scroll 80% -> 100%: Scale and blend out to transition to Hero
        .to(phone, {
          scale: 1.1,
          y: '-80px',
          opacity: 0,
          duration: 2,
          ease: 'power2.inOut'
        }, 'exit')
        .to(text, {
          opacity: 0,
          y: -30,
          duration: 1.5,
          ease: 'power2.inOut'
        }, 'exit')
        .to(sticky, {
          opacity: 0,
          duration: 1.5,
          ease: 'power2.inOut'
        }, 'exit');
      } else {
        // ── 3. Build Cinematic Automatic Timeline ──
        // Setup initial states
        gsap.set(box, { y: '100vh', opacity: 0, scale: 0.8 });
        gsap.set(lid, { y: 0, opacity: 1 });
        gsap.set(rays, { opacity: 0 });
        gsap.set(phone, { y: '120%', scale: 0.75, opacity: 0 });
        gsap.set(phoneScreen, { opacity: 0 });
        gsap.set(text, { opacity: 0, y: 30 });

        const tl = gsap.timeline({
          onComplete: () => {
            // Fade out the overlay and notify parent to unlock scroll and reveal Hero
            gsap.to(container, {
              opacity: 0,
              duration: 0.8,
              ease: 'power2.inOut',
              onComplete: () => {
                gsap.set(container, { display: 'none' });
                if (onComplete) onComplete();
              }
            });
          }
        });

        // 1. Box enters with power and slam
        tl.to(box, {
          y: '0vh',
          opacity: 1,
          scale: 1,
          duration: 1.0,
          ease: 'power4.out',
        })
        .to({}, { duration: 0.2 }) // brief pause of tension

        // 2. Lid flies up and god rays emit
        .to(lid, {
          y: -140,
          opacity: 0,
          scale: 0.95,
          duration: 1.2,
          ease: 'power3.inOut'
        }, 'lift')
        .to(rays, {
          opacity: 0.8,
          duration: 0.8,
          ease: 'power2.out'
        }, 'lift')
        
        // 3. Phone rises majestically from the box and screen powers on
        .to(phone, {
          y: '0%',
          opacity: 1,
          scale: 1.0,
          duration: 1.5,
          ease: 'power3.out'
        }, 'lift+=0.3')
        .to(phoneScreen, {
          opacity: 1,
          duration: 0.8,
          ease: 'power2.in'
        }, 'lift+=1.0')
        .to(text, {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: 'power2.out'
        }, 'lift+=1.0')

        // 4. Box and rays dissolve away, leaving only the pristine phone and title
        .to(box, {
          opacity: 0,
          y: 50,
          duration: 0.8,
          ease: 'power2.inOut'
        }, 'dissolve')
        .to(rays, {
          opacity: 0,
          duration: 0.8,
          ease: 'power2.inOut'
        }, 'dissolve')
        .to(text, {
          opacity: 0,
          y: -20,
          duration: 0.6,
          ease: 'power2.inOut'
        }, 'dissolve+=0.2');
      }
    }, containerRef);

    return () => ctx.revert();
  }, [active, onComplete]);

  if (!USE_SCROLL_UNBOXING) return null;

  return (
    <div 
      ref={containerRef} 
      className={USE_SCROLL_UNBOXING 
        ? "relative w-full h-[250vh] bg-transparent z-40 overflow-hidden" 
        : "fixed inset-0 w-full h-screen bg-transparent overflow-hidden pointer-events-none"
      }
      style={USE_SCROLL_UNBOXING ? {} : { zIndex: 999998 }}
    >
      {/* ── STICKY/FIXED VIEWPORT CONTAINER ── */}
      <div 
        ref={stickyRef} 
        className={USE_SCROLL_UNBOXING 
          ? "sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#020205] z-40"
          : "absolute inset-0 h-full w-full flex flex-col items-center justify-center overflow-hidden bg-[#020205] z-40 pointer-events-auto"
        }
      >
        
        {/* God Rays Elements */}
        <div ref={raysContainerRef} className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="absolute w-[2px] h-[350px] bg-gradient-to-b from-brand-cobalt to-transparent -rotate-30 origin-center animate-pulse" />
          <div className="absolute w-[2px] h-[350px] bg-gradient-to-b from-brand-cobalt to-transparent -rotate-15 origin-center" />
          <div className="absolute w-[2.5px] h-[400px] bg-gradient-to-b from-white to-transparent origin-center" />
          <div className="absolute w-[2px] h-[350px] bg-gradient-to-b from-brand-cobalt to-transparent rotate-15 origin-center" />
          <div className="absolute w-[2px] h-[350px] bg-gradient-to-b from-brand-cobalt to-transparent rotate-30 origin-center animate-pulse" />
        </div>

        {/* ── RISING PREMIUM CSS PHONE MODEL ── */}
        <div ref={phoneRef} className="absolute z-20 flex items-center justify-center pointer-events-none phone-rotator-zone">
          {/* Titanium Frame Border */}
          <div className="w-[210px] md:w-[250px] h-[440px] md:h-[520px] rounded-[45px] md:rounded-[55px] bg-gradient-to-br from-[#3a3a4a] via-[#1a1a24] to-[#2a2a38] p-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_30px_90px_rgba(0,0,0,0.9),0_0_60px_rgba(26,107,255,0.1)] relative">
            
            {/* Screen Inner Body */}
            <div className="w-full h-full rounded-[42px] md:rounded-[52px] bg-[#08080d] overflow-hidden relative">
              
              {/* Emissive Screen Wallpaper Content */}
              <div
                ref={phoneScreenRef}
                style={{
                  backgroundImage: `url('${import.meta.env.BASE_URL}images/cosmic-wallpaper.png')`,
                }}
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
              >
                {/* Glowing Overlay */}
                <div className="absolute inset-0 bg-brand-cobalt/20 mix-blend-color-dodge animate-pulse" />
                <div className="absolute inset-0 bg-black/30" />
                
                {/* Micro Tech Details on Screen */}
                <div className="absolute inset-x-0 bottom-10 flex flex-col items-center justify-center text-center opacity-80">
                  <span className="text-[7px] tracking-[4px] text-white/60 font-mono uppercase">OBSIDIAN 200MP</span>
                  <span className="text-[9px] tracking-[6px] text-white font-mono uppercase mt-1">POWERED BY AI</span>
                </div>
              </div>

              {/* Selfie Camera Hole */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-black ring-1 ring-white/10" />
            </div>
          </div>
        </div>

        {/* ── ENGRAVED PREMIUM BOX ── */}
        <div ref={boxRef} className="absolute z-30 flex flex-col items-center justify-center pointer-events-none">
          {/* Main Box Base */}
          <div className="relative w-[280px] md:w-[360px] h-[160px] md:h-[220px] bg-gradient-to-b from-[#101018] to-[#040408] border border-white/10 rounded-2xl shadow-[0_40px_100px_rgba(26,107,255,0.18)] flex items-center justify-center overflow-hidden">
            {/* Debossed Text */}
            <span className="text-[44px] md:text-[56px] font-display font-black tracking-[12px] opacity-10 text-white select-none">
              NOVA
            </span>

            {/* Lid Element sits absolute inside/on box */}
            <div
              ref={lidRef}
              className="absolute inset-0 bg-gradient-to-b from-[#161622] to-[#0c0c14] border-b-2 border-white/20 flex items-center justify-center transition-all duration-300"
            >
              {/* Premium Silver Branding Foil on Lid */}
              <span className="text-[28px] md:text-[36px] font-display font-black tracking-[14px] text-white/90 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                NOVA
              </span>
            </div>
          </div>
        </div>

        {/* ── TEXT & SUBTITLE OVERLAY ── */}
        <div ref={textRef} className="absolute bottom-[10vh] z-30 flex flex-col items-center text-center px-6 select-none pointer-events-none">
          <h2 className="text-3xl md:text-5xl font-display font-black tracking-[-0.01em] text-white uppercase">
            NOVA OBSIDIAN
          </h2>
          <p className="text-[9px] md:text-[11px] tracking-[6px] md:tracking-[9px] text-brand-cobalt uppercase font-bold mt-2">
            The future, unboxed.
          </p>
        </div>

      </div>
    </div>
  );
}
