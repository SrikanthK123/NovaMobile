'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';

interface IntroLoaderProps {
  onComplete: () => void;
}

export default function IntroLoader({ onComplete }: IntroLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // 1. Check if the intro has already played in this browser session
    const played = sessionStorage.getItem('nova-intro-played') === 'true';
    if (played) {
      onComplete();
      return;
    }

    // Otherwise, render the loading intro overlay
    setShouldRender(true);
  }, [onComplete]);

  useEffect(() => {
    if (!shouldRender) return;

    const container = containerRef.current;
    const textElement = textRef.current;

    if (!container || !textElement) return;

    const ctx = gsap.context(() => {
      // Initialize centered styling and states
      gsap.set(textElement, {
        opacity: 0,
        scale: 0.8,
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0
      });

      // Create cinematic morph GSAP timeline
      const tl = gsap.timeline({
        onComplete: () => {
          // Swap: show the real logo and hide the moving loader text
          gsap.set('.navbar-logo', { opacity: 1 });
          gsap.set(textElement, { display: 'none' });

          // Call parent onComplete to stagger-in Hero elements (phone, tags)
          onComplete();

          // Fade out and clean up the overlay
          gsap.to(container, {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.inOut',
            onComplete: () => {
              sessionStorage.setItem('nova-intro-played', 'true');
              setShouldRender(false);
            }
          });
        }
      });

      // ── Step 2: Center NOVA Text entrance ──
      tl.to(textElement, {
        opacity: 1,
        scale: 1.0,
        duration: 0.7,
        ease: 'power2.out'
      })
      // Hold centered for 1.0s
      .to({}, { duration: 1.0 })

      // ── Step 3: Morph to Navbar Logo Position ──
      .add(() => {
        const logoEl = document.querySelector('.navbar-logo');
        if (!logoEl) {
          console.warn("Real navbar logo not found at morph time");
          return;
        }

        // Measure exact current bounds of the real logo and animated text
        const logoBounds = logoEl.getBoundingClientRect();
        const textBounds = textElement.getBoundingClientRect();

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const logoCenterX = logoBounds.left + logoBounds.width / 2;
        const logoCenterY = logoBounds.top + logoBounds.height / 2;

        // Calculate translation translation values from center to top-left
        const targetX = logoCenterX - centerX;
        const targetY = logoCenterY - centerY;
        const targetScale = logoBounds.width / textBounds.width;

        // Morph translation & scaling
        gsap.to(textElement, {
          x: targetX,
          y: targetY,
          scale: targetScale,
          duration: 1.0,
          ease: 'power3.inOut'
        });

        // Simultaneously fade in "BEYOND PERCEPTION" subtitle in header
        gsap.to('.navbar-subtitle', {
          opacity: 0.5, // Matches the original header opacity style
          duration: 0.4,
          delay: 0.8,
          ease: 'power2.out'
        });
      });

      // Delay timeline completion by 1.0s so morph completes completely before overlay fades
      tl.to({}, { duration: 1.0 });

    }, containerRef);

    return () => ctx.revert();
  }, [shouldRender, onComplete]);

  if (!shouldRender) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full bg-[#020205] z-[9999] flex items-center justify-center select-none overflow-hidden"
    >
      <div
        ref={textRef}
        className="absolute font-display font-extrabold text-white uppercase tracking-[2px]"
        style={{
          fontSize: 'clamp(80px, 12vw, 160px)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          willChange: 'transform, opacity'
        }}
      >
        NOVA
      </div>
    </div>
  );
}
