'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';

export default function DragReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [revealPercent, setRevealPercent] = useState(50);
  const isDragging = useRef(false);

  // Scroll Trigger Teaser Sweep Animation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Create ScrollTrigger to animate a teaser sweep
      ScrollTrigger.create({
        trigger: container,
        start: 'top 65%',
        onEnter: () => {
          // Teaser sweep animation: 50% -> 15% -> 50%
          const obj = { value: 50 };
          gsap.to(obj, {
            value: 20,
            duration: 0.8,
            ease: 'power2.out',
            onUpdate: () => setRevealPercent(obj.value),
            onComplete: () => {
              gsap.to(obj, {
                value: 50,
                duration: 1.0,
                ease: 'power3.inOut',
                onUpdate: () => setRevealPercent(obj.value),
              });
            }
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Drag interaction handler
  const handlePointerDown = () => {
    isDragging.current = true;
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current || !trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const clientX = e.clientX;
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = (x / rect.width) * 100;

      setRevealPercent(percent);
    };

    const handlePointerUp = () => {
      isDragging.current = false;
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const baseUrl = import.meta.env.BASE_URL;

  // Shared stunning landscape photo (Starry Canyon Night)
  const imageUrl = `${baseUrl}images/camera-canyon.png`;

  return (
    <section
      id="camera-reveal"
      ref={containerRef}
      className="relative min-h-screen bg-[#020205] py-24 px-6 md:px-12 flex flex-col justify-center items-center overflow-hidden"
    >
      <div className="max-w-6xl w-full flex flex-col items-center">
        {/* Title Group */}
        <div className="text-center mb-12">
          <span className="text-[10px] tracking-[6px] text-brand-cobalt uppercase font-bold block mb-3">
            [ SENSOR COMPARISON ]
          </span>
          <h2 className="text-[28px] sm:text-5xl md:text-6xl font-display font-extrabold uppercase leading-tight text-white tracking-tight">
            SEE THE DIFFERENCE
          </h2>
          <p className="text-white/60 tracking-widest uppercase font-mono text-[9px] mt-2">
            NOVA vs ordinary. Drag to reveal.
          </p>
        </div>

        {/* Mobile/Responsive Badges Row (NOT ON IMAGE) */}
        <div className="flex sm:hidden justify-between w-full mb-5 px-1 gap-3 select-none">
          {/* Ordinary Phone (Red) */}
          <div className="flex-1 flex items-center justify-center py-2.5 px-3 bg-red-950/40 border border-red-500/25 rounded-2xl">
            <span className="text-[8px] font-mono tracking-[2px] text-red-400 font-extrabold uppercase">
              ← ORDINARY PHONE
            </span>
          </div>
          {/* Nova 200MP (Blue) */}
          <div className="flex-1 flex items-center justify-center py-2.5 px-3 bg-blue-950/40 border border-blue-500/25 rounded-2xl shadow-[0_0_15px_rgba(26,107,255,0.1)]">
            <span className="text-[8px] font-mono tracking-[2px] text-blue-400 font-extrabold uppercase">
              NOVA 200MP →
            </span>
          </div>
        </div>

        {/* --- COMPARISON SLIDER TRACK --- */}
        <div
          ref={trackRef}
          className="relative w-full aspect-[16/10] md:aspect-[16/9] max-h-[550px] bg-[#07070d] border border-white/10 rounded-3xl overflow-hidden cursor-ew-resize phone-rotator-zone shadow-[0_30px_90px_rgba(0,0,0,0.8)]"
          onPointerDown={handlePointerDown}
        >
          {/* 1. RIGHT SIDE: NOVA IMAGE (Crisp, High Vibrance, Sharp) */}
          <div
            style={{
              backgroundImage: `url(${imageUrl})`,
            }}
            className="absolute inset-0 bg-cover bg-center brightness-[1.08] saturate-[1.25] contrast-[1.02]"
          >
            {/* Blue badge top-right */}
            <div className="hidden sm:block absolute top-6 right-6 px-4 py-1.5 bg-[#1a6bff]/90 border border-white/20 backdrop-blur-md rounded-full shadow-[0_0_15px_rgba(26,107,255,0.4)]">
              <span className="text-[9px] font-mono tracking-[3px] text-white font-black uppercase">
                NOVA 200MP
              </span>
            </div>
          </div>

          {/* 2. LEFT SIDE: ORDINARY IMAGE (Dim, Noisy, Low Contrast) */}
          <div
            style={{
              backgroundImage: `url(${imageUrl})`,
              clipPath: `inset(0 ${100 - revealPercent}% 0 0)`,
            }}
            className="absolute inset-0 bg-cover bg-center brightness-[0.55] contrast-[0.7] saturate-[0.6] blur-[0.6px] grayscale-[0.2]"
          >
            {/* Red badge top-left */}
            <div className="hidden sm:block absolute top-6 left-6 px-4 py-1.5 bg-red-600/80 border border-white/15 backdrop-blur-md rounded-full">
              <span className="text-[9px] font-mono tracking-[3px] text-white font-black uppercase">
                ORDINARY PHONE
              </span>
            </div>

            {/* Low-light Noise Grain Overlay Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.15)_1px,transparent_1px)] bg-[size:3px_3px] opacity-35" />
          </div>

          {/* 3. DIVIDER LINE & HANDLE */}
          <div
            style={{
              left: `${revealPercent}%`,
            }}
            className="absolute top-0 bottom-0 w-[3px] bg-white z-10 -translate-x-[1.5px] pointer-events-none"
          >
            {/* Glowing vertical line overlay */}
            <div className="absolute inset-0 w-full h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />

            {/* Floating Drag Handle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border border-white/20 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(255,255,255,0.4)] select-none">
              {/* Arrow symbols */}
              <div className="flex gap-1.5 text-black font-extrabold text-[12px]">
                <span>←</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </div>

        {/* Help tooltip */}
        <span className="text-[8px] font-mono tracking-[3px] text-white/40 uppercase mt-6 select-none animate-pulse">
          * DRAG THE DIVIDER TO COMPARE OPTICAL SHARPNESS *
        </span>
      </div>
    </section>
  );
}
