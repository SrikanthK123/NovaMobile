'use client';

import { useEffect, useRef } from 'react';

interface ProductProgressDotsProps {
  activeIndex: number;      // 0, 1, or 2
  sectionRef: React.RefObject<HTMLElement | null>;
  productScrollStarts: number[]; // scroll Y positions for each product
}

const DOT_LABELS = ['TRIGGERS', 'COOLING FAN', 'EARBUDS'];

export default function ProductProgressDots({
  activeIndex,
  sectionRef,
  productScrollStarts,
}: ProductProgressDotsProps) {

  const scrollToProduct = (idx: number) => {
    if (!sectionRef.current) return;
    const sectionTop = sectionRef.current.offsetTop;
    window.scrollTo({ top: sectionTop + productScrollStarts[idx], behavior: 'smooth' });
  };

  return (
    <>
      {/* Desktop: fixed right side vertical dots */}
      <div
        className="hidden md:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col items-end gap-4 z-[200] select-none"
        aria-label="Product navigation"
      >
        {/* Connecting line */}
        <div className="absolute right-[2px] top-0 bottom-0 flex flex-col items-center pointer-events-none"
          style={{ width: '1px' }}>
          <div className="flex-1 w-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div
            className="absolute top-0 left-0 w-full transition-all duration-500"
            style={{
              background: '#1a6bff',
              height: `${((activeIndex) / (DOT_LABELS.length - 1)) * 100}%`,
              transformOrigin: 'top',
            }}
          />
        </div>

        {DOT_LABELS.map((label, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={label}
              onClick={() => scrollToProduct(i)}
              className="group relative flex items-center gap-3 cursor-pointer"
              aria-label={`Jump to ${label}`}
            >
              {/* Label (appears left on hover) */}
              <span
                className="absolute right-full mr-3 text-[11px] font-sans tracking-[2px] whitespace-nowrap transition-all duration-200 pointer-events-none"
                style={{
                  color: isActive ? '#1a6bff' : 'rgba(255,255,255,0.6)',
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateX(0)' : 'translateX(8px)',
                }}
              >
                {label}
              </span>
              <span
                className="group-hover:opacity-100 absolute right-full mr-3 text-[11px] font-sans tracking-[2px] whitespace-nowrap opacity-0 transition-all duration-200 pointer-events-none"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  display: isActive ? 'none' : undefined,
                }}
              >
                {label}
              </span>

              {/* Dot */}
              <div
                className="transition-all duration-300 rounded-full"
                style={{
                  width: isActive ? '6px' : '6px',
                  height: isActive ? '24px' : '6px',
                  background: isActive ? '#1a6bff' : 'rgba(255,255,255,0.2)',
                  transform: isActive ? 'scaleX(1)' : 'scaleX(1)',
                  boxShadow: isActive ? '0 0 10px rgba(26,107,255,0.6)' : 'none',
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Mobile: bottom center horizontal dots */}
      <div
        className="flex md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 items-center gap-3 z-[200]"
        style={{
          background: 'rgba(5,5,8,0.85)',
          backdropFilter: 'blur(12px)',
          border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: '100px',
          padding: '8px 16px',
        }}
      >
        {DOT_LABELS.map((label, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={label}
              onClick={() => scrollToProduct(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: isActive ? '24px' : '6px',
                height: '6px',
                background: isActive ? '#1a6bff' : 'rgba(255,255,255,0.25)',
                boxShadow: isActive ? '0 0 8px rgba(26,107,255,0.5)' : 'none',
              }}
              aria-label={label}
            />
          );
        })}
      </div>
    </>
  );
}
