'use client';

import { useRef } from 'react';
import { motion, MotionValue, useTransform } from 'motion/react';

interface Spec {
  title: string;
  detail: string;
}

interface ProductSpotlightProps {
  name: string;
  model: string;
  category: string;
  image: string;
  launchDate: string;
  direction: 'left' | 'right'; // image enters from this side
  index: number;               // 0-based
  total: number;
  specs: Spec[];
  accentWidget: 'temperature' | 'waveform' | null;
  scrollProgress: MotionValue<number>;
  enterStart: number;
  spotlightEnd: number;
  exitEnd: number;
  baseUrl: string;
}

// Temperature widget for cooling fan
function TempWidget() {
  return (
    <div
      className="mt-4 p-3 rounded-xl flex flex-col gap-1.5"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid rgba(26,107,255,0.2)',
      }}
    >
      <span className="text-[10px] font-mono tracking-[2px] text-[#1a6bff] uppercase">
        Phone Temp
      </span>
      <div className="flex items-center gap-2">
        <span className="text-[18px] font-display font-extrabold text-white leading-none">
          42°C → 27°C
        </span>
        <span className="text-emerald-400 text-lg leading-none" style={{ animation: 'tempBounce 1.5s ease-in-out infinite' }}>
          ↓
        </span>
      </div>
      <div className="flex items-end gap-1 h-6 mt-1">
        {[100, 88, 74, 62, 48, 35].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-[2px]"
            style={{
              height: `${h}%`,
              background: `hsl(${i * 30}, 80%, 50%)`,
              opacity: 0.85,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes tempBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }
      `}</style>
    </div>
  );
}

// Audio waveform widget for earbuds
function WaveformWidget() {
  const HEIGHTS = [40, 70, 55, 90, 65, 80, 45, 75];
  return (
    <div
      className="mt-4 p-3 rounded-xl flex flex-col gap-2"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid rgba(124,58,237,0.25)',
      }}
    >
      <span className="text-[10px] font-mono tracking-[2px] text-[#7c3aed] uppercase">
        Nova Spatial Audio
      </span>
      <div className="flex items-end gap-1 h-8">
        {HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-[2px]"
            style={{
              height: `${h}%`,
              background: 'linear-gradient(to top, #1a6bff, #7c3aed)',
              animation: `waveBar 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes waveBar {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.5); }
        }
      `}</style>
    </div>
  );
}

export default function ProductSpotlight({
  name, model, category, image, launchDate, direction,
  index, total, specs, accentWidget, scrollProgress,
  enterStart, spotlightEnd, exitEnd, baseUrl,
}: ProductSpotlightProps) {
  const enterEnd = enterStart + 0.05;
  const exitStart = spotlightEnd;

  const opacity = useTransform(
    scrollProgress,
    [enterStart, enterEnd, exitStart, exitEnd],
    [0, 1, 1, 0]
  );

  const imgX = useTransform(
    scrollProgress,
    [enterStart, enterEnd, exitStart, exitEnd],
    direction === 'left'
      ? ['-60vw', '0vw', '0vw', '-60vw']
      : ['60vw', '0vw', '0vw', '60vw']
  );

  const imgScale = useTransform(
    scrollProgress,
    [enterStart, enterEnd, exitStart, exitEnd],
    [0.85, 1, 1, 0.85]
  );

  const textX = useTransform(
    scrollProgress,
    [enterStart, enterEnd, exitStart, exitEnd],
    direction === 'left'
      ? ['80px', '0px', '0px', '80px']
      : ['-80px', '0px', '0px', '-80px']
  );

  const isImageLeft = direction === 'left';
  const indexLabel = `0${index + 1} / 0${total}`;

  // Scroll-based spotlight phase for spec stagger
  const specOpacity = useTransform(
    scrollProgress,
    [enterEnd, enterEnd + 0.02, exitStart],
    [0, 1, 1]
  );

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center px-8 md:px-20"
      style={{
        opacity,
        zIndex: 10,
        background: '#050508',
        // Disable pointer events when the card is invisible so underlying
        // layers (buttons, links) remain clickable during transitions
        pointerEvents: 'auto',
      }}
    >
      {/* Giant background number */}
      <div
        className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none select-none overflow-hidden"
        aria-hidden
      >
        <span
          className="font-display font-extrabold leading-none"
          style={{
            fontSize: 'clamp(120px, 20vw, 280px)',
            color: 'rgba(255,255,255,0.02)',
          }}
        >
          0{index + 1}
        </span>
      </div>

      <div
        className={`relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full max-w-7xl ${
          isImageLeft ? 'md:flex-row' : 'md:flex-row-reverse'
        }`}
      >
        {/* ── PRODUCT IMAGE ── */}
        <motion.div
          className="relative flex-1 flex items-center justify-center"
          style={{ x: imgX, scale: imgScale }}
        >
          <div
            className="relative group cursor-crosshair"
            style={{ maxWidth: '55vw', maxHeight: '70vh' }}
          >
            <img
              src={`${baseUrl}${image}`}
              alt={`${name} ${model}`}
              className="w-full h-full object-contain transition-all duration-400"
              style={{
                maxHeight: '65vh',
                filter: 'drop-shadow(0 20px 60px rgba(26,107,255,0.2))',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)';
                (e.currentTarget as HTMLImageElement).style.filter =
                  'drop-shadow(0 0 40px rgba(26,107,255,0.4))';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)';
                (e.currentTarget as HTMLImageElement).style.filter =
                  'drop-shadow(0 20px 60px rgba(26,107,255,0.2))';
              }}
              loading="lazy"
            />
          </div>
        </motion.div>

        {/* ── PRODUCT CONTENT ── */}
        <motion.div
          className="flex-1 flex flex-col gap-4 md:gap-5 max-w-[420px]"
          style={{ x: textX }}
        >
          {/* Index + Category */}
          <div className="flex flex-col gap-1.5">
            <span
              className="font-mono font-bold tracking-[4px] text-[#1a6bff]"
              style={{ fontSize: '12px' }}
            >
              {indexLabel}
            </span>
            <span
              className="font-mono tracking-[6px] uppercase"
              style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}
            >
              [ {category} ]
            </span>
          </div>

          {/* Product Name */}
          <div className="flex flex-col leading-[0.9]">
            <h2
              className="font-display font-extrabold text-white uppercase tracking-tight"
              style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}
            >
              {name}
            </h2>
            <h3
              className="font-display font-extrabold uppercase tracking-tight"
              style={{
                fontSize: 'clamp(40px, 6vw, 72px)',
                color: 'rgba(255,255,255,0.15)',
              }}
            >
              {model}
            </h3>
          </div>

          {/* Divider */}
          <div className="w-10 h-px bg-[#1a6bff]" />

          {/* Specs */}
          <motion.div className="flex flex-col gap-3 md:gap-4" style={{ opacity: specOpacity }}>
            {specs.map((spec, i) => (
              <div
                key={i}
                className="flex flex-col gap-0.5"
                style={{
                  animation: `fadeSlideUp 0.5s ease-out forwards`,
                  animationDelay: `${i * 0.08}s`,
                  opacity: 0,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#1a6bff]" style={{ fontSize: '8px' }}>◆</span>
                  <span className="font-sans font-medium text-white" style={{ fontSize: '13px' }}>
                    {spec.title}
                  </span>
                </div>
                <span
                  className="font-mono pl-4"
                  style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}
                >
                  {spec.detail}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Accent widget */}
          {accentWidget === 'temperature' && <TempWidget />}
          {accentWidget === 'waveform' && <WaveformWidget />}

          {/* Launch status badge */}
          <div
            className="flex items-center gap-2 w-fit px-4 py-2 rounded-full"
            style={{
              background: 'rgba(26,107,255,0.12)',
              border: '1px solid rgba(26,107,255,0.3)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#1a6bff]"
              style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
            />
            <span
              className="font-mono font-bold text-[#1a6bff] tracking-[3px] uppercase"
              style={{ fontSize: '11px' }}
            >
              LAUNCHING {launchDate}
            </span>
          </div>

          {/* Notify button */}
          <button
            className="w-fit px-8 py-3.5 rounded-[100px] font-sans font-semibold text-white uppercase tracking-[3px] transition-all duration-300"
            style={{
              fontSize: '12px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.borderColor = '#1a6bff';
              el.style.color = '#1a6bff';
              el.style.boxShadow = '0 0 20px rgba(26,107,255,0.3)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.borderColor = 'rgba(255,255,255,0.2)';
              el.style.color = 'white';
              el.style.boxShadow = 'none';
            }}
          >
            NOTIFY ME
          </button>
        </motion.div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(26,107,255,0.4); }
          50% { opacity: 0.7; box-shadow: 0 0 0 4px rgba(26,107,255,0); }
        }
      `}</style>
    </motion.div>
  );
}
