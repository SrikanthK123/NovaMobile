'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';

interface NovaIntroProps {
  onComplete: () => void;
}

export default function NovaIntro({ onComplete }: NovaIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const fingerprintRef = useRef<SVGSVGElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [labelText, setLabelText] = useState('HOLD TO ENTER');
  const [isVerified, setIsVerified] = useState(false);

  // SVG Circumference: 2 * Math.PI * 76 = 477.52
  const circumference = 477.52;
  const [dashOffset, setDashOffset] = useState(circumference);
  const holdTween = useRef<gsap.core.Tween | null>(null);
  const progressObj = useRef({ value: 0 });
  useEffect(() => {
    setShouldRender(true);
  }, []);

  useEffect(() => {
    if (!shouldRender) return;

    const container = containerRef.current;
    const textElement = textRef.current;
    const scannerElement = scannerRef.current;

    if (!container || !textElement || !scannerElement) return;

    const ctx = gsap.context(() => {
      // 1. Initial State Setups
      gsap.set(textElement, {
        opacity: 0,
        y: 30,
        scale: 0.9,
        xPercent: -50,
        yPercent: -50,
        x: 0
      });

      gsap.set(scannerElement, {
        opacity: 0,
        y: 20
      });

      // ── PHASE A: Text Entrance ──
      const tl = gsap.timeline();

      tl.to(textElement, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.0,
        ease: 'power3.out'
      })
      // Hold centered for 0.5s
      .to({}, { duration: 0.5 })
      // Slide upward to make room for biometric scanner
      .to(textElement, {
        y: -60,
        duration: 0.8,
        ease: 'power2.inOut'
      })
      // ── PHASE B: Scanner Entrance ──
      .to(scannerElement, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.4');

    }, containerRef);

    return () => ctx.revert();
  }, [shouldRender]);

  // Fingerprint Interactions
  const startScanning = () => {
    if (isVerified) return;
    setIsHolding(true);
    setLabelText('SCANNING...');

    // Notify custom cursor to start hold pulse state
    window.dispatchEvent(new CustomEvent('cursor-state', { detail: 'hold' }));

    // Cancel any current tween
    if (holdTween.current) holdTween.current.kill();

    progressObj.current.value = 0;
    holdTween.current = gsap.to(progressObj.current, {
      value: 1,
      duration: 2.0,
      ease: 'none',
      onUpdate: () => {
        const offset = circumference * (1 - progressObj.current.value);
        setDashOffset(offset);
      },
      onComplete: () => {
        triggerUnlock();
      }
    });
  };

  const cancelScanning = () => {
    if (isVerified) return;
    setIsHolding(false);
    setLabelText('HOLD TO ENTER');

    // Notify custom cursor to return to default state
    window.dispatchEvent(new CustomEvent('cursor-state', { detail: 'default' }));

    if (holdTween.current) holdTween.current.kill();

    // Fast decay back to 0 (300ms)
    holdTween.current = gsap.to(progressObj.current, {
      value: 0,
      duration: 0.3,
      ease: 'power2.out',
      onUpdate: () => {
        const offset = circumference * (1 - progressObj.current.value);
        setDashOffset(offset);
      }
    });
  };

  // UNLOCK & LOGO MORPH SEQUENCE
  const triggerUnlock = () => {
    setIsVerified(true);
    setLabelText('VERIFIED ✓');
    window.dispatchEvent(new CustomEvent('cursor-state', { detail: 'default' }));

    const textElement = textRef.current;
    const scannerElement = scannerRef.current;
    const container = containerRef.current;

    if (!textElement || !scannerElement || !container) return;

    const tl = gsap.timeline({
      onComplete: () => {
        onComplete();
        gsap.to(container, {
          opacity: 0,
          duration: 0.4,
          onComplete: () => {
            setShouldRender(false);
          }
        });
      }
    });

    // Flash fingerprint white (200ms)
    tl.to(fingerprintRef.current, {
      filter: 'brightness(3) drop-shadow(0 0 25px rgba(255,255,255,1))',
      duration: 0.1,
      yoyo: true,
      repeat: 1
    })
    // Scanner elements fade out (opacity 1 -> 0, 400ms)
    .to(scannerElement, {
      opacity: 0,
      scale: 0.9,
      duration: 0.4,
      ease: 'power2.inOut'
    }, '+=0.1')
    // ── STEP 3: NOVA Text logo morph ──
    .add(() => {
      const logoEl = document.querySelector('.logo-nova');
      if (!logoEl) {
        console.warn("Target logo element '.logo-nova' not found");
        return;
      }

      // Measure exact screen dimensions to perform relative transform calculations
      const textBounds = textElement.getBoundingClientRect();
      const logoBounds = logoEl.getBoundingClientRect();

      // Relative delta offsets
      const targetX = (logoBounds.left + logoBounds.width / 2) - (textBounds.left + textBounds.width / 2);
      const targetY = (logoBounds.top + logoBounds.height / 2) - (textBounds.top + textBounds.height / 2);
      const targetScale = logoBounds.width / textBounds.width;

      // GSAP Relative Morph Glide
      gsap.to(textElement, {
        x: `+=${targetX}`,
        y: `+=${targetY}`,
        scale: targetScale,
        duration: 1.0,
        ease: 'power3.inOut',
        onComplete: () => {
          // Reveal the real logo instantly upon landing
          gsap.set('.logo-nova', { opacity: 1 });
          gsap.set(textElement, { display: 'none' });
        }
      });

      // Simultaneously dissolve/fade the black viewport background
      gsap.to(container, {
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: 'power2.inOut'
      });
    }, '-=0.1');

    // Staggered pad to ensure morph completes before unmounting
    tl.to({}, { duration: 1.3 });
  };

  if (!shouldRender) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full bg-[#000000] z-[9999] flex flex-col items-center justify-center select-none overflow-hidden"
    >
      {/* ── Centered NOVA text element ── */}
      <div
        ref={textRef}
        className="absolute font-display font-extrabold text-white uppercase tracking-[0.15em] will-change-transform"
        style={{
          fontSize: 'clamp(48px, 12vw, 150px)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        NOVA
      </div>

      {/* ── Biometric Hold-to-Enter scanner UI ── */}
      <div
        ref={scannerRef}
        className="absolute bottom-[20%] flex flex-col items-center gap-6"
      >
        {/* SVG Progress Circle and Touch Scanner */}
        <div
          className="relative w-[160px] h-[160px] rounded-full flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300"
          onMouseDown={startScanning}
          onMouseUp={cancelScanning}
          onMouseLeave={cancelScanning}
          onTouchStart={startScanning}
          onTouchEnd={cancelScanning}
          style={{
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          {/* Concentric Fingerprint Icon */}
          <svg
            ref={fingerprintRef}
            className={`w-[70px] h-[70px] text-white/80 transition-all duration-300 pointer-events-none ${
              isHolding ? 'scale-110' : 'scale-100'
            }`}
            viewBox="0 0 512 512"
            fill="none"
            stroke="currentColor"
            strokeWidth="28"
            strokeLinecap="round"
            style={{
              filter: isHolding 
                ? 'drop-shadow(0 0 15px rgba(255,255,255,0.8))' 
                : 'none',
            }}
          >
            <path d="M336 224c0-44.18-35.82-80-80-80s-80 35.82-80 80v64" />
            <path d="M384 224c0-70.69-57.31-128-128-128s-128 57.31-128 128v112" />
            <path d="M432 224c0-97.2-78.8-176-176-176S80 126.8 80 224v160" />
            <path d="M288 224c0-17.67-14.33-32-32-32s-32 14.33-32 32v16" />
            <path d="M256 160c-35.35 0-64 28.65-64 64v192" />
            <path d="M224 224c0-8.84-7.16-16-16-16s-16 7.16-16 16v96" />
            <path d="M304 288v48" />
            <path d="M304 384v16" />
            <path d="M352 352v48" />
            <path d="M400 416v16" />
          </svg>

          {/* SVG Circular Border Ring */}
          <svg className="absolute inset-0 w-full h-full rotate-[-90deg] pointer-events-none">
            <circle
              cx="80"
              cy="80"
              r="76"
              fill="transparent"
              stroke="white"
              strokeWidth="2"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-75"
            />
          </svg>
        </div>

        {/* Status label below biometric scan */}
        <span
          className={`text-[11px] font-mono tracking-[0.25em] transition-all duration-300 font-bold ${
            isHolding ? 'text-white/90 animate-pulse' : 'text-white/50'
          }`}
        >
          {labelText}
        </span>
      </div>
    </div>
  );
}
