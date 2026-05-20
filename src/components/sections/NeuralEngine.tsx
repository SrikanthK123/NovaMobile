'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

// Neural net node coordinates in viewBox="0 0 500 400"
const columns = [
  { x: 50, ys: [120, 200, 280] },
  { x: 150, ys: [80, 140, 200, 260, 320] },
  { x: 250, ys: [40, 93, 146, 200, 253, 306, 360] },
  { x: 350, ys: [80, 140, 200, 260, 320] },
  { x: 450, ys: [120, 200, 280] },
];

export default function NeuralEngine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavePathRef = useRef<SVGPathElement>(null);
  const [inView, setInView] = useState(false);

  // Generate connection paths for the background lines
  const connectionPaths: string[] = [];
  for (let c = 0; c < columns.length - 1; c++) {
    const colA = columns[c];
    const colB = columns[c + 1];
    colA.ys.forEach(yA => {
      colB.ys.forEach(yB => {
        // Connect nodes if they are structurally close
        if (Math.abs(yA - yB) < 100) {
          connectionPaths.push(`M ${colA.x} ${yA} L ${colB.x} ${yB}`);
        }
      });
    });
  }

  // Choose a subset of paths to run signal pulses along
  const pulsePaths = [
    `M 50 120 L 150 80 L 250 40 L 350 80 L 450 120`,
    `M 50 200 L 150 200 L 250 200 L 350 200 L 450 200`,
    `M 50 280 L 150 320 L 250 360 L 350 320 L 450 280`,
    `M 50 120 L 150 140 L 250 200 L 350 260 L 450 280`,
    `M 50 280 L 150 260 L 250 200 L 350 140 L 450 120`,
  ];

  // Intersection observer to pause animations when out of viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Real-time Waveform Animation Loop
  useEffect(() => {
    if (!inView) return;

    let rafId: number;
    let time = 0;

    const animateWave = () => {
      time += 0.08;
      const width = 800;
      const height = 100;
      const points: string[] = [];

      for (let x = 0; x <= width; x += 10) {
        // Compose multiple sine waves with different frequencies and phases
        const y1 = Math.sin(x * 0.015 + time) * 20;
        const y2 = Math.cos(x * 0.035 - time * 0.7) * 10;
        const y3 = Math.sin(x * 0.005 + time * 0.3) * 15;
        const totalY = (height / 2) + y1 + y2 + y3;

        points.push(`${x === 0 ? 'M' : 'L'} ${x} ${totalY}`);
      }

      if (wavePathRef.current) {
        wavePathRef.current.setAttribute('d', points.join(' '));
      }

      rafId = requestAnimationFrame(animateWave);
    };

    animateWave();

    return () => cancelAnimationFrame(rafId);
  }, [inView]);

  return (
    <section
      id="neural"
      ref={containerRef}
      className="relative min-h-screen bg-[#040814] py-24 px-6 md:px-12 flex flex-col justify-center overflow-hidden"
    >
      {/* Ambient Neural Backlighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] bg-brand-cobalt/15 rounded-full filter blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-brand-cobalt/10 rounded-full filter blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">
        
        {/* ── LEFT SIDE: NEURAL NET VISUALIZATION ── */}
        <div className="relative w-full flex items-center justify-center bg-[#070d22]/50 border border-white/5 rounded-3xl p-6 md:p-10 backdrop-blur-md phone-rotator-zone">
          <div className="absolute top-4 left-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-cobalt animate-ping" />
            <span className="text-[9px] font-mono tracking-[4px] text-brand-cobalt uppercase font-bold">
              SYSTEM ACTIVE // AI ENGINE
            </span>
          </div>

          <svg
            viewBox="0 0 500 400"
            className="w-full max-w-[450px] h-auto overflow-visible select-none pointer-events-none"
          >
            {/* Background Connection Lines */}
            {connectionPaths.map((path, idx) => (
              <path
                key={`line-${idx}`}
                d={path}
                fill="none"
                stroke="#1a6bff"
                strokeWidth="0.5"
                strokeOpacity="0.18"
              />
            ))}

            {/* Traveling Signal Pulse animations */}
            {inView &&
              pulsePaths.map((path, idx) => (
                <g key={`pulse-${idx}`}>
                  {/* Glowing core dot */}
                  <circle r="3" fill="#ffffff" className="shadow-[0_0_12px_#1a6bff]">
                    <animateMotion
                      dur={`${1.6 + idx * 0.3}s`}
                      repeatCount="indefinite"
                      path={path}
                    />
                  </circle>
                  {/* Outer aura dot */}
                  <circle r="6" fill="#1a6bff" fillOpacity="0.4">
                    <animateMotion
                      dur={`${1.6 + idx * 0.3}s`}
                      repeatCount="indefinite"
                      path={path}
                    />
                  </circle>
                </g>
              ))}

            {/* Static Glowing Nodes */}
            {columns.map((col, colIdx) => (
              <g key={`col-${colIdx}`}>
                {col.ys.map((y, nodeIdx) => (
                  <g key={`node-${nodeIdx}`} className="origin-center">
                    {/* Node ring glow */}
                    <circle
                      cx={col.x}
                      cy={y}
                      r="9"
                      fill="#1a6bff"
                      fillOpacity="0.15"
                      className="animate-pulse"
                    />
                    {/* Inner core node */}
                    <circle
                      cx={col.x}
                      cy={y}
                      r="4.5"
                      fill="#1a6bff"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                    />
                  </g>
                ))}
              </g>
            ))}
          </svg>
        </div>

        {/* ── RIGHT SIDE: AI CAPABILITIES LIST ── */}
        <div className="flex flex-col justify-center">
          <div className="mb-10">
            <span className="text-[10px] tracking-[6px] text-brand-cobalt uppercase font-bold block mb-3">
              [ BRAIN MATRIX ]
            </span>
            <h2 className="text-4xl md:text-6xl font-display font-extrabold uppercase leading-none text-white tracking-tight">
              NOVA MIND
            </h2>
            <p className="text-white/60 tracking-widest uppercase font-mono text-[10px] mt-2">
              Neural Processing Engine
            </p>
          </div>

          <div className="space-y-8">
            {/* Capability 1 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group border-l-2 border-[#1a6bff]/30 hover:border-brand-cobalt pl-6 py-2 transition-all duration-300"
            >
              <h4 className="text-white font-display text-sm md:text-base tracking-[3px] uppercase font-bold flex items-center gap-2">
                <span className="text-brand-cobalt">◆</span> REAL-TIME SCENE DETECTION
              </h4>
              <p className="text-white/50 text-[11px] md:text-[13px] tracking-wider uppercase font-mono mt-1 group-hover:text-white/80 transition-colors">
                Identifies 10,000+ objects per second dynamically
              </p>
            </motion.div>

            {/* Capability 2 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group border-l-2 border-[#1a6bff]/30 hover:border-brand-cobalt pl-6 py-2 transition-all duration-300"
            >
              <h4 className="text-white font-display text-sm md:text-base tracking-[3px] uppercase font-bold flex items-center gap-2">
                <span className="text-brand-cobalt">◆</span> NEURAL PHOTO PROCESSING
              </h4>
              <p className="text-white/50 text-[11px] md:text-[13px] tracking-wider uppercase font-mono mt-1 group-hover:text-white/80 transition-colors">
                12 AI models process every shot simultaneously at hardware speed
              </p>
            </motion.div>

            {/* Capability 3 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group border-l-2 border-[#1a6bff]/30 hover:border-brand-cobalt pl-6 py-2 transition-all duration-300"
            >
              <h4 className="text-white font-display text-sm md:text-base tracking-[3px] uppercase font-bold flex items-center gap-2">
                <span className="text-brand-cobalt">◆</span> PREDICTIVE BATTERY AI
              </h4>
              <p className="text-white/50 text-[11px] md:text-[13px] tracking-wider uppercase font-mono mt-1 group-hover:text-white/80 transition-colors">
                Learns your daily routines and usage patterns. Extends life by 40%
              </p>
            </motion.div>

            {/* Capability 4 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="group border-l-2 border-[#1a6bff]/30 hover:border-brand-cobalt pl-6 py-2 transition-all duration-300"
            >
              <h4 className="text-white font-display text-sm md:text-base tracking-[3px] uppercase font-bold flex items-center gap-2">
                <span className="text-brand-cobalt">◆</span> VOICE SYNTHESIS ENGINE
              </h4>
              <p className="text-white/50 text-[11px] md:text-[13px] tracking-wider uppercase font-mono mt-1 group-hover:text-white/80 transition-colors">
                Understands and translates 94 languages with zero network latency
              </p>
            </motion.div>
          </div>
        </div>

      </div>

      {/* ── BOTTOM AUDIO WAVEFORM VISUALIZATION ── */}
      <div className="absolute bottom-0 left-0 right-0 w-full flex flex-col items-center select-none pointer-events-none pb-6">
        <svg
          viewBox="0 0 800 100"
          className="w-full max-w-[800px] h-[60px] overflow-visible"
        >
          <path
            ref={wavePathRef}
            fill="none"
            stroke="#1a6bff"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="drop-shadow-[0_0_6px_#1a6bff]"
          />
        </svg>
        <span className="text-[7px] md:text-[8px] font-mono tracking-[4px] text-brand-cobalt uppercase font-bold mt-2 opacity-50">
          NEURAL AUDIOWAVE SCANNING LIVE...
        </span>
      </div>

    </section>
  );
}
