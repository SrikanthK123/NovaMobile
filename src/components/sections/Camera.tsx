import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import Scene from '../three/Scene';

export default function CameraDeepDive() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      // Desktop setup: pin and scrub transitions
      mm.add("(min-width: 768px)", () => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=200%',
          pin: true,
          scrub: true
        });

        gsap.to('#camera-progress', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=200%',
            scrub: true
          }
        });
      });

      // Mobile setup: no pinning, scroll naturally with a progress bar tracked to the section scroll
      mm.add("(max-width: 767px)", () => {
        gsap.to('#camera-progress', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: true
          }
        });
      });

      // Animate text blocks on both mobile and desktop
      gsap.fromTo('.camera-text', 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          stagger: 0.15,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top center',
            end: 'center center',
            scrub: true
          }
        }
      );
    }, sectionRef);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  return (
    <section id="camera" ref={sectionRef} className="relative min-h-screen md:h-screen bg-brand-obsidian overflow-hidden py-16 md:py-0">
      <div className="absolute inset-0 z-0">
          {/* We show a static detail view or a different scene camera here if needed */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-obsidian via-transparent to-brand-obsidian z-10 pointer-events-none" />
          <Scene phoneColor="#0a0a0a" mode="static" />
      </div>

      <div className="relative z-20 h-full flex items-center justify-center text-center pointer-events-none px-6 py-10 md:py-20">
        <div className="max-w-4xl space-y-6 md:space-y-10">
          <div className="camera-text">
            <h3 className="text-brand-cobalt text-sm md:text-lg font-bold tracking-[0.3em] md:tracking-[0.5em] uppercase">The Vanguard System</h3>
            <h2 className="text-4xl md:text-8xl font-display font-extrabold mt-2 md:mt-4 leading-none">TRIPLE VISION.</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-12 md:mt-20">
            <div className="camera-text space-y-2 md:space-y-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-brand-cobalt flex items-center justify-center mx-auto text-brand-cobalt text-sm md:text-base">1</div>
              <h4 className="font-display font-bold text-lg md:text-xl uppercase">200MP Main</h4>
              <p className="text-brand-titanium text-sm font-light max-w-[250px] mx-auto">Custom ultra-clear sensor with 16-in-1 pixel binning.</p>
            </div>
            <div className="camera-text space-y-2 md:space-y-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-brand-cobalt flex items-center justify-center mx-auto text-brand-cobalt text-sm md:text-base">2</div>
              <h4 className="font-display font-bold text-lg md:text-xl uppercase">Periscope Tele</h4>
              <p className="text-brand-titanium text-sm font-light max-w-[250px] mx-auto">100x Space Zoom with advanced optical stabilization.</p>
            </div>
            <div className="camera-text space-y-2 md:space-y-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-brand-cobalt flex items-center justify-center mx-auto text-brand-cobalt text-sm md:text-base">3</div>
              <h4 className="font-display font-bold text-lg md:text-xl uppercase">Ultra-Wide</h4>
              <p className="text-brand-titanium text-sm font-light max-w-[250px] mx-auto">120 degree field of view with zero edge distortion.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Progress Bar */}
      <div className="absolute bottom-14 md:bottom-24 left-1/2 -translate-x-1/2 w-[200px] md:w-[400px] h-1 bg-white/10 rounded-full overflow-hidden z-30">
        <div 
          id="camera-progress"
          className="h-full bg-brand-cobalt origin-left transform scale-x-0"
        />
      </div>
    </section>
  );
}
