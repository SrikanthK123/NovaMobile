'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef   = useRef<HTMLDivElement>(null);
  const mouseX      = useRef(0);
  const mouseY      = useRef(0);
  const currentX    = useRef(0);
  const currentY    = useRef(0);
  const hoveredRef  = useRef(false);          // avoids stale-closure issues
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.documentElement.style.cursor = 'none';

    // ── HELPERS ────────────────────────────────────────────────────────────────

    /** Returns true when all RGB channels are ≥ 160 (white / near-white / light) */
    const isBright = (el: HTMLElement): boolean => {
      const c = window.getComputedStyle(el).color;
      const m = c.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
      if (!m) return false;
      const [, r, g, b, a = '1'] = m;
      return +r >= 160 && +g >= 160 && +b >= 160 && +a > 0.2;
    };

    /** True when el has at least one non-whitespace text node directly inside */
    const hasOwnText = (el: HTMLElement): boolean => {
      for (const n of el.childNodes) {
        if (n.nodeType === Node.TEXT_NODE && n.textContent?.trim()) return true;
      }
      return false;
    };

    const setHoveredOnce = (next: boolean) => {
      if (hoveredRef.current === next) return;   // skip redundant state updates
      hoveredRef.current = next;
      setHovered(next);
    };

    // ── EVENT HANDLER ──────────────────────────────────────────────────────────

    const onMouseOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || typeof t.matches !== 'function') return;

      // 1 ─ Buttons, links, and all interactive controls
      if (t.closest('button, a, input, select, textarea, [role="button"], .hoverable')) {
        setHoveredOnce(true);
        return;
      }

      // 2 ─ Bright text elements that directly carry a text node
      const TEXT_TAGS = 'h1,h2,h3,h4,h5,h6,p,span,li,strong,em,b,i,label,td,th,figcaption';
      if (t.matches(TEXT_TAGS) && hasOwnText(t) && isBright(t)) {
        setHoveredOnce(true);
        return;
      }

      // 3 ─ Cursor is on a child *of* a bright text element (e.g. SplitType word spans)
      const ancestor = t.closest(TEXT_TAGS) as HTMLElement | null;
      if (ancestor && isBright(ancestor)) {
        setHoveredOnce(true);
        return;
      }

      // 4 ─ Cursor is on a child of a button / link
      if (t.closest('button, a, [role="button"]')) {
        setHoveredOnce(true);
        return;
      }

      setHoveredOnce(false);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });

    // ── ANIMATION LOOP ─────────────────────────────────────────────────────────
    let raf: number;
    const tick = () => {
      currentX.current += (mouseX.current - currentX.current) * 0.14;
      currentY.current += (mouseY.current - currentY.current) * 0.14;
      if (cursorRef.current) {
        cursorRef.current.style.transform =
          `translate3d(${currentX.current - 10}px, ${currentY.current - 10}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      document.documentElement.style.cursor = '';
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 z-[99999] hidden md:block pointer-events-none will-change-transform"
      style={{ width: 20, height: 20 }}
    >
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full border transition-all duration-300 ease-out"
        style={{
          borderColor:      hovered ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.9)',
          backgroundColor:  hovered ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.12)',
          transform:        hovered ? 'scale(1.6)'        : 'scale(1)',
          backdropFilter:   hovered ? 'blur(2px)'         : 'none',
          mixBlendMode:     hovered ? 'normal'            : 'difference',
        }}
      />
      {/* Centre dot (always visible, shows precise hotspot) */}
      <div
        className="absolute rounded-full transition-all duration-200"
        style={{
          width:           4,
          height:          4,
          top:             '50%',
          left:            '50%',
          transform:       'translate(-50%,-50%)',
          backgroundColor: hovered ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
          mixBlendMode:    hovered ? 'normal'           : 'difference',
        }}
      />
    </div>
  );
}
