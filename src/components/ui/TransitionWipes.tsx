'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';

export default function TransitionWipes() {
  const curtainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const curtain = curtainRef.current;
    if (!curtain) return;

    const ctx = gsap.context(() => {
      // Helper function to trigger the sweep wipe animation
      const triggerWipe = () => {
        const tl = gsap.timeline();
        tl.set(curtain, { transformOrigin: 'left', scaleX: 0 })
          .to(curtain, { scaleX: 1, duration: 0.3, ease: 'power3.inOut' })
          .set(curtain, { transformOrigin: 'right' })
          .to(curtain, { scaleX: 0, duration: 0.25, ease: 'power3.inOut' });
      };

      // Query all sections and features layout containers
      const sections = gsap.utils.toArray('section, #features, #camera, #specs, #cta');
      
      sections.forEach((sec: any) => {
        ScrollTrigger.create({
          trigger: sec,
          start: 'top 80%', // Triggers just as the section starts to enter
          onEnter: () => triggerWipe(),
          onEnterBack: () => triggerWipe(),
        });
      });
    }, curtainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={curtainRef}
      id="transition-curtain"
      className="fixed inset-0 w-full h-full bg-[#07070a] z-[99999] pointer-events-none scale-x-0 will-change-transform"
    />
  );
}
