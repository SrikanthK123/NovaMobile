'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BenchmarkItem {
  name: string;
  value: number;
  isNova: boolean;
}

const benchmarkData = {
  cpu: [
    { name: "NOVA OBSIDIAN (A19 PRO-CORES)", value: 100, isNova: true },
    { name: "COMPETITOR A (FLAGSHIP 4NM)", value: 78, isNova: false },
    { name: "COMPETITOR B (GEN 2 CORE)", value: 71, isNova: false },
    { name: "COMPETITOR C (ARM PRO)", value: 65, isNova: false },
    { name: "PREVIOUS GEN NOVA", value: 58, isNova: false },
  ],
  gpu: [
    { name: "NOVA OBSIDIAN (MIND-RASTER)", value: 100, isNova: true },
    { name: "COMPETITOR A (GRAPHICS PRO)", value: 82, isNova: false },
    { name: "COMPETITOR B (RAYTRACER X)", value: 75, isNova: false },
    { name: "COMPETITOR C (MOBILE RENDER)", value: 60, isNova: false },
    { name: "PREVIOUS GEN NOVA", value: 52, isNova: false },
  ],
  ai: [
    { name: "NOVA OBSIDIAN (NEURAL MATRIX V)", value: 100, isNova: true },
    { name: "COMPETITOR A (CLOUD BRAIN)", value: 68, isNova: false },
    { name: "COMPETITOR B (LOCAL TENSOR)", value: 62, isNova: false },
    { name: "COMPETITOR C (NEURAL CORE 1)", value: 55, isNova: false },
    { name: "PREVIOUS GEN NOVA", value: 45, isNova: false },
  ],
};

function CountingValue({ target, duration = 1400 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Apply easeOutQuad for numerical tracking
      const easedProgress = progress * (2 - progress);
      setCount(Math.floor(easedProgress * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return <span>{count}%</span>;
}

export default function SpeedBenchmark() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'cpu' | 'gpu' | 'ai'>('cpu');
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const currentData = benchmarkData[activeTab];

  return (
    <section
      id="benchmark"
      ref={containerRef}
      className="relative min-h-screen bg-[#020205] py-24 px-6 md:px-12 flex flex-col justify-center items-center overflow-hidden"
    >
      <div className="max-w-4xl w-full flex flex-col items-center">
        
        {/* Title Group */}
        <div className="text-center mb-10 select-none">
          <span className="text-[10px] tracking-[6px] text-brand-cobalt uppercase font-bold block mb-3">
            [ PERFORMANCE MATRIX ]
          </span>
          <h2 className="text-[28px] sm:text-5xl md:text-6xl font-display font-extrabold uppercase leading-tight text-white tracking-tight">
            BENCHMARK REALITY
          </h2>
          <p className="text-white/60 tracking-widest uppercase font-mono text-[9px] mt-2">
            [ Independent Lab Results ]
          </p>
        </div>

        {/* --- TABS SWITCHER --- */}
        <div className="flex gap-1 sm:gap-2 md:gap-4 p-1 sm:p-1.5 bg-[#0a0a0f] border border-white/5 rounded-full mb-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] max-w-full">
          {(['cpu', 'gpu', 'ai'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-2 md:py-2.5 rounded-full font-display font-extrabold text-[9px] md:text-[11px] tracking-[1.5px] sm:tracking-[2px] transition-all uppercase whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#1a6bff] text-white shadow-[0_0_15px_rgba(26,107,255,0.4)]'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              {tab === 'cpu' ? (
                <>
                  <span className="hidden sm:inline">CPU SPEED</span>
                  <span className="inline sm:hidden">CPU</span>
                </>
              ) : tab === 'gpu' ? (
                <>
                  <span className="hidden sm:inline">GPU RENDER</span>
                  <span className="inline sm:hidden">GPU</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">AI INFERENCE</span>
                  <span className="inline sm:hidden">AI</span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* --- CHART CONTAINER --- */}
        <div className="w-full bg-[#07070d]/60 border border-white/5 rounded-3xl p-6 md:p-10 backdrop-blur-md shadow-[0_30px_90px_rgba(0,0,0,0.8)] min-h-[380px] flex flex-col justify-between">
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {inView && (
                <motion.div
                  key={activeTab}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    visible: { transition: { staggerChildren: 0.1 } },
                    hidden: {}
                  }}
                  className="space-y-6"
                >
                  {currentData.map((item, idx) => (
                    <motion.div
                      key={`${activeTab}-${idx}`}
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
                      }}
                      className="space-y-2"
                    >
                      {/* Labels */}
                      <div className="flex justify-between items-end text-[9px] md:text-[11px] font-mono tracking-wider">
                        <span className={`font-extrabold uppercase ${item.isNova ? 'text-brand-cobalt' : 'text-white/60'}`}>
                          {item.name}
                        </span>
                        <span className={`font-black ${item.isNova ? 'text-brand-cobalt' : 'text-white/80'}`}>
                          <CountingValue target={item.value} />
                        </span>
                      </div>

                      {/* Bar Track */}
                      <div className="w-full h-3 md:h-4 bg-white/5 rounded-full overflow-hidden relative border border-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
                        {/* Bar Fill */}
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{ width: `${item.value}%` }}
                          transition={{
                            duration: 1.4,
                            delay: item.isNova ? 0 : 0.1 + idx * 0.1,
                            ease: [0.25, 1, 0.5, 1], // easeOutQuart
                          }}
                          className={`h-full rounded-full relative transition-all duration-300 ${
                            item.isNova
                              ? 'bg-gradient-to-r from-[#1a6bff] to-[#4c89ff] shadow-[0_0_20px_#1a6bff]'
                              : 'bg-white/20'
                          }`}
                        >
                          {/* Emissive pulse overlay on winning NOVA bar */}
                          {item.isNova && (
                            <motion.div
                              animate={{ opacity: [0.3, 0.8, 0.3] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute inset-0 bg-white/30 mix-blend-overlay"
                            />
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span className="text-[7px] md:text-[8px] font-mono tracking-[4px] text-white/30 uppercase mt-8 block border-t border-white/5 pt-4 text-center">
            * TEST PROTOCOLS RUN NATIVELY ON-DEVICE IN LAB CONDITIONS. METRICS SHOW HIGHER EFFICIENCY UNDER PEAK LOADS. *
          </span>
        </div>

      </div>
    </section>
  );
}
