'use client';

import { useEffect, useRef, useState } from 'react';

export default function CursorCircle() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [customState, setCustomState] = useState<'default' | 'hover' | 'hold'>('default');
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    // Detect mobile touch devices to safely skip custom cursor
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    setIsTouchDevice(isTouch);
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      if (target.closest('a, button, [role="button"], input, select, textarea')) {
        setCustomState('hover');
      } else {
        setCustomState(prev => prev === 'hold' ? 'hold' : 'default');
      }
    };

    const handleMouseDown = () => {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 150);
    };

    const handleCursorState = (e: Event) => {
      const state = (e as CustomEvent).detail;
      setCustomState(state);
    };

    // Attach mouse interaction events
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('cursor-state', handleCursorState as EventListener);

    // LERP loop for trailing lag effect (stiffness coefficient 0.12)
    let rafId: number;
    const tick = () => {
      currentX.current += (mouseX.current - currentX.current) * 0.12;
      currentY.current += (mouseY.current - currentY.current) * 0.12;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentX.current}px, ${currentY.current}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('cursor-state', handleCursorState as EventListener);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media (pointer: fine) {
          body, a, button, select, input, textarea, [role="button"] {
            cursor: none !important;
          }
        }
        @keyframes cursorInnerPulse {
          0% { transform: translate(-50%, -50%) scale(1.0); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.3); opacity: 1.0; }
          100% { transform: translate(-50%, -50%) scale(1.0); opacity: 0.5; }
        }
        .cursor-pulse-inner {
          animation: cursorInnerPulse 0.6s infinite ease-in-out;
        }
      `}} />

      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 999999,
          willChange: 'transform',
          transform: 'translate3d(0, 0, 0)',
        }}
      >
        <div
          className={`rounded-full transition-[width,height,border-color,background-color,opacity] duration-200 will-change-[transform,opacity] ${
            customState === 'hover' 
              ? 'w-10 h-10 bg-transparent border-[1.5px] border-white opacity-100' 
              : customState === 'hold' 
              ? 'w-5 h-5 bg-white cursor-pulse-inner' 
              : isClicked 
              ? 'w-5 h-5 bg-white scale-[0.8] opacity-90' 
              : 'w-5 h-5 bg-white/90 opacity-90'
          }`}
          style={{
            transform: 'translate(-50%, -50%)',
            mixBlendMode: 'difference',
          }}
        />
      </div>
    </>
  );
}
