'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize2, Camera, Layers, Volume2 } from 'lucide-react';
import Scene from '../three/Scene';

export default function PhoneRotator() {
  const rotatorRef = useRef<HTMLDivElement>(null);

  // ── CRITICAL FIX ─────────────────────────────────────────────────────────────
  // Store rotation as UNBOUNDED RADIANS — never use % 360 / % (2π) modulo.
  // Modulo causes a wrap-around jump (e.g. 6.26 → 0.0 radians) which the lerp
  // in Phone.tsx then resolves by spinning backward through ~2π, appearing as
  // 3 phantom rotations. Unbounded radians = no wrap = no phantom spins.
  // ─────────────────────────────────────────────────────────────────────────────
  const rotationRad = useRef(0);          // accumulated radians, unbounded
  const [displayRad, setDisplayRad] = useState(0); // drive re-render + Scene

  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const lastX = useRef(0);
  const velocity = useRef(0);            // pixels/frame for inertia
  const inertiaRaf = useRef<number | null>(null);

  // Degrees equivalent for HUD highlights only (uses modulo safely here)
  const rotationDeg = ((displayRad * 180) / Math.PI % 360 + 360) % 360;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (inertiaRaf.current) cancelAnimationFrame(inertiaRaf.current);
    };
  }, []);

  // ── DRAG START ────────────────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent) => {
    if (inertiaRaf.current) {
      cancelAnimationFrame(inertiaRaf.current);
      inertiaRaf.current = null;
    }
    setIsDragging(true);
    startX.current = e.clientX;
    lastX.current = e.clientX;
    velocity.current = 0;
    document.body.style.userSelect = 'none';
  };

  // ── DRAG MOVE + RELEASE ───────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - startX.current;         // pixels moved since last frame
      // 1 px drag = 0.008 radians ≈ 0.46°  (tight 1:1 feel, no over-rotation)
      const deltaRad = dx * 0.008;

      rotationRad.current += deltaRad;               // UNBOUNDED accumulation
      setDisplayRad(rotationRad.current);

      velocity.current = e.clientX - lastX.current; // raw pixel velocity
      lastX.current = e.clientX;
      startX.current = e.clientX;
    };

    const onUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';

      // ── INERTIA ───────────────────────────────────────────────────────────────
      // Gradually decelerate using the last drag velocity.
      // Still in unbounded radians — no wrap, no phantom spin.
      const coast = () => {
        velocity.current *= 0.90;                    // friction coefficient
        if (Math.abs(velocity.current) < 0.3) {      // stop threshold (pixels)
          velocity.current = 0;
          inertiaRaf.current = null;
          return;
        }
        const deltaRad = velocity.current * 0.008;
        rotationRad.current += deltaRad;
        setDisplayRad(rotationRad.current);
        inertiaRaf.current = requestAnimationFrame(coast);
      };
      inertiaRaf.current = requestAnimationFrame(coast);
    };

    if (isDragging) {
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    }
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [isDragging]);

  // ── HUD HELPERS ───────────────────────────────────────────────────────────────
  const isAngleActive = (target: number, tolerance = 35) => {
    const diff = Math.abs((rotationDeg - target + 180 + 360) % 360 - 180);
    return diff <= tolerance;
  };
  const showDisplay  = isAngleActive(0);
  const showFrame    = isAngleActive(90);
  const showCamera   = isAngleActive(180);
  const showSpeakers = isAngleActive(270);

  return (
    <section
      id="rotator"
      ref={rotatorRef}
      className="relative min-h-screen bg-[#040409] py-24 px-6 md:px-12 flex flex-col justify-center items-center overflow-hidden"
    >
      {/* Dynamic background aura rotates with phone */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          style={{
            transform: `scale(${isDragging ? 1.15 : 1}) rotate(${rotationDeg}deg)`,
            opacity: 0.15,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-brand-cobalt to-purple-600 rounded-full filter blur-[150px] transition-transform duration-300"
        />
      </div>

      <div className="max-w-6xl w-full flex flex-col items-center z-10">

        {/* Title */}
        <div className="text-center mb-16 select-none">
          <span className="text-[10px] tracking-[6px] text-brand-cobalt uppercase font-bold block mb-3">
            [ 3D INTERACTIVE CORE ]
          </span>
          <h2 className="text-[26px] sm:text-5xl md:text-6xl font-display font-extrabold uppercase leading-tight text-white tracking-tight">
            EVERY ANGLE. PERFECTED.
          </h2>
          <p className="text-white/60 tracking-widest uppercase font-mono text-[9px] mt-2">
            DRAG TO ROTATE
          </p>
        </div>

        {/* ── ROTATOR ZONE ── */}
        <div
          className="relative w-full min-h-[420px] md:min-h-[560px] flex flex-col md:flex-row items-center justify-center cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
        >
          {/* Three.js phone — receives raw unbounded radians, no lerp */}
          <div className="w-[300px] md:w-[450px] h-[400px] md:h-[600px] select-none pointer-events-none flex items-center justify-center">
            <Scene
              mode="static"
              phoneColor="#0c0c14"
              rotationY={displayRad}
            />
          </div>

          {/* HUD: Front display (0°) — Hidden on mobile, shown on desktop */}
          <div
            className={`absolute top-[15%] left-[5%] md:left-[15%] transition-all duration-500 hidden md:flex items-start gap-4 pointer-events-none ${
              showDisplay ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <div className="p-3 bg-[#1a6bff]/10 border border-[#1a6bff]/40 rounded-xl backdrop-blur-md flex items-center justify-center">
              <Maximize2 className="w-5 h-5 text-brand-cobalt" />
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-mono tracking-[3px] text-brand-cobalt uppercase font-bold block">[ VIEWPORT FRONT ]</span>
              <h4 className="text-white font-display text-lg font-black uppercase">Cinematic 8K Display</h4>
              <p className="text-white/60 font-mono text-[9px] uppercase tracking-wider">120Hz Infinite ProMotion OLED Panel</p>
            </div>
          </div>

          {/* HUD: Titanium frame (90° / 270°) — Hidden on mobile, shown on desktop */}
          <div
            className={`absolute bottom-[20%] left-[5%] md:left-[15%] transition-all duration-500 hidden md:flex items-start gap-4 pointer-events-none ${
              showFrame ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <div className="p-3 bg-[#1a6bff]/10 border border-[#1a6bff]/40 rounded-xl backdrop-blur-md flex items-center justify-center">
              <Layers className="w-5 h-5 text-brand-cobalt" />
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-mono tracking-[3px] text-brand-cobalt uppercase font-bold block">[ PROFILE EDGE ]</span>
              <h4 className="text-white font-display text-lg font-black uppercase">Titanium Frame</h4>
              <p className="text-white/60 font-mono text-[9px] uppercase tracking-wider">Space-Grade Titanium Alloy Core Chassis</p>
            </div>
          </div>

          {/* HUD: Camera (180°) — Hidden on mobile, shown on desktop */}
          <div
            className={`absolute top-[15%] right-[5%] md:right-[15%] transition-all duration-500 hidden md:flex items-start gap-4 pointer-events-none text-right flex-row-reverse ${
              showCamera ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            <div className="p-3 bg-[#1a6bff]/10 border border-[#1a6bff]/40 rounded-xl backdrop-blur-md flex items-center justify-center">
              <Camera className="w-5 h-5 text-brand-cobalt" />
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-mono tracking-[3px] text-brand-cobalt uppercase font-bold block">[ OPTICS BACK ]</span>
              <h4 className="text-white font-display text-lg font-black uppercase">200MP Triple Vision</h4>
              <p className="text-white/60 font-mono text-[9px] uppercase tracking-wider">Dual Telephoto &amp; Neural Night Engine</p>
            </div>
          </div>

          {/* HUD: Speaker / USB-C (270°) — Hidden on mobile, shown on desktop */}
          <div
            className={`absolute bottom-[20%] right-[5%] md:right-[15%] transition-all duration-500 hidden md:flex items-start gap-4 pointer-events-none text-right flex-row-reverse ${
              showSpeakers ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            <div className="p-3 bg-[#1a6bff]/10 border border-[#1a6bff]/40 rounded-xl backdrop-blur-md flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-brand-cobalt" />
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-mono tracking-[3px] text-brand-cobalt uppercase font-bold block">[ ACOUSTIC BASE ]</span>
              <h4 className="text-white font-display text-lg font-black uppercase">USB-C + SPEAKER</h4>
              <p className="text-white/60 font-mono text-[9px] uppercase tracking-wider">Haptic Stereo Surround Sound Acoustic Ports</p>
            </div>
          </div>

          {/* Dedicated Mobile HUD Card — only visible on small screens under the 3D phone */}
          <div className="md:hidden mt-2 px-4 w-full max-w-sm z-50 pointer-events-none min-h-[90px] flex items-center justify-center">
            <div className="w-full p-4 bg-[#0a0a0f]/80 border border-white/[0.08] rounded-2xl backdrop-blur-lg shadow-[0_15px_35px_rgba(0,0,0,0.5)] flex items-center gap-3 transition-all duration-300 min-h-[82px]">
              {showDisplay && (
                <>
                  <div className="p-2 bg-[#1a6bff]/10 border border-[#1a6bff]/40 rounded-xl flex items-center justify-center shrink-0">
                    <Maximize2 className="w-4 h-4 text-brand-cobalt" />
                  </div>
                  <div className="text-left space-y-0.5">
                    <span className="text-[7px] font-mono tracking-[2px] text-brand-cobalt uppercase font-bold block">[ VIEWPORT FRONT ]</span>
                    <h4 className="text-white font-display text-xs font-black uppercase">Cinematic 8K Display</h4>
                    <p className="text-white/60 font-mono text-[8px] uppercase tracking-wider leading-none">120Hz Infinite ProMotion OLED</p>
                  </div>
                </>
              )}
              {showFrame && (
                <>
                  <div className="p-2 bg-[#1a6bff]/10 border border-[#1a6bff]/40 rounded-xl flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4 text-brand-cobalt" />
                  </div>
                  <div className="text-left space-y-0.5">
                    <span className="text-[7px] font-mono tracking-[2px] text-brand-cobalt uppercase font-bold block">[ PROFILE EDGE ]</span>
                    <h4 className="text-white font-display text-xs font-black uppercase">Titanium Frame</h4>
                    <p className="text-white/60 font-mono text-[8px] uppercase tracking-wider leading-none">Space-Grade Titanium Core Chassis</p>
                  </div>
                </>
              )}
              {showCamera && (
                <>
                  <div className="p-2 bg-[#1a6bff]/10 border border-[#1a6bff]/40 rounded-xl flex items-center justify-center shrink-0">
                    <Camera className="w-4 h-4 text-brand-cobalt" />
                  </div>
                  <div className="text-left space-y-0.5">
                    <span className="text-[7px] font-mono tracking-[2px] text-brand-cobalt uppercase font-bold block">[ OPTICS BACK ]</span>
                    <h4 className="text-white font-display text-xs font-black uppercase">200MP Triple Vision</h4>
                    <p className="text-white/60 font-mono text-[8px] uppercase tracking-wider leading-none">Dual Telephoto &amp; Neural Night Engine</p>
                  </div>
                </>
              )}
              {showSpeakers && (
                <>
                  <div className="p-2 bg-[#1a6bff]/10 border border-[#1a6bff]/40 rounded-xl flex items-center justify-center shrink-0">
                    <Volume2 className="w-4 h-4 text-brand-cobalt" />
                  </div>
                  <div className="text-left space-y-0.5">
                    <span className="text-[7px] font-mono tracking-[2px] text-brand-cobalt uppercase font-bold block">[ ACOUSTIC BASE ]</span>
                    <h4 className="text-white font-display text-xs font-black uppercase">USB-C + SPEAKER</h4>
                    <p className="text-white/60 font-mono text-[8px] uppercase tracking-wider leading-none">Haptic Stereo Surround Sound Ports</p>
                  </div>
                </>
              )}
              {!showDisplay && !showFrame && !showCamera && !showSpeakers && (
                <div className="w-full text-center py-2 text-white/30 font-mono text-[8px] uppercase tracking-[3px] animate-pulse">
                  Drag phone left or right to inspect
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live angle readout */}
        <span className="text-[8px] font-mono tracking-[3px] text-white/40 uppercase mt-4 select-none animate-pulse">
          * ACTIVE ROTATOR ANGLE: {Math.floor(rotationDeg)}° *
        </span>
      </div>
    </section>
  );
}
