import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';

// Upgraded Circular Progress Visualizer Component
function CircularProgress() {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
      } else {
        setInView(false);
      }
    }, { threshold: 0.4 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/10 md:hidden" />
        <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10 hidden md:block" />
        
        {/* Mobile Circle */}
        <circle 
          cx="80" 
          cy="80" 
          r="70" 
          stroke="#1a6bff" 
          strokeWidth="6" 
          strokeDasharray={440} 
          strokeDashoffset={inView ? 110 : 440} 
          fill="transparent" 
          strokeLinecap="round" 
          className="md:hidden transition-all duration-[2000ms] ease-out-expo" 
        />
        {/* Desktop Circle */}
        <circle 
          cx="96" 
          cy="96" 
          r="80" 
          stroke="#1a6bff" 
          strokeWidth="8" 
          strokeDasharray={502} 
          strokeDashoffset={inView ? 120 : 502} 
          fill="transparent" 
          strokeLinecap="round" 
          className="hidden md:block transition-all duration-[2000ms] ease-out-expo" 
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-3xl md:text-4xl font-display font-extrabold text-white">48H</span>
        <span className="text-[7px] md:text-[8px] font-mono tracking-[2px] text-white/50 uppercase mt-1">ACTIVE USE</span>
      </div>
    </div>
  );
}

// Custom SVG Battery Visualizer with Concentric charge rings & Color Morphs
function BatteryVisual() {
  const [progress, setProgress] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
      } else {
        setInView(false);
        setProgress(0); // Reset when leaving to allow visual replay
      }
    }, { threshold: 0.4 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let startTimestamp: number;
    const duration = 2000; // 2 seconds fill

    const animate = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const pct = Math.min((elapsed / duration) * 85, 85);
      setProgress(pct);

      if (pct < 85) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [inView]);

  // Determine battery color based on progress percentage
  let color = 'rgb(239, 68, 68)'; // Red
  if (progress >= 50) {
    color = 'rgb(26, 107, 255)'; // Blue/cyan
  } else if (progress >= 20) {
    color = 'rgb(234, 179, 8)'; // Yellow
  }

  // Calculate width of internal fill: progress% of 180 max internal width
  const fillWidth = (progress / 100) * 180;

  return (
    <div ref={ref} className="relative flex items-center justify-center">
      {/* Dynamic Battery SVG */}
      <svg viewBox="0 0 240 120" className="w-52 h-26 md:w-64 md:h-32 overflow-visible">
        {/* Outline */}
        <rect
          x="10"
          y="10"
          width="200"
          height="100"
          rx="15"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="4"
        />
        {/* Terminal Cap */}
        <path
          d="M 210 40 Q 218 40, 218 45 L 218 75 Q 218 80, 210 80"
          fill="rgba(255,255,255,0.15)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="4"
        />
        {/* Internal Fill */}
        <rect
          x="18"
          y="18"
          width={fillWidth}
          height="84"
          rx="8"
          fill={color}
          className="transition-all duration-75 shadow-[0_0_15px_rgba(26,107,255,0.4)]"
          style={{
            fill: color,
            filter: progress > 50 ? 'drop-shadow(0 0 8px rgba(26,107,255,0.6))' : 'none',
          }}
        />
      </svg>

      {/* Concentric Wireless Waves */}
      {progress >= 80 && (
        <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-12 h-24 text-brand-cobalt overflow-visible">
            {/* Wave 1 */}
            <path
              d="M 10 30 A 30 30 0 0 1 10 70"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="animate-[ripple_1.5s_infinite]"
            />
            {/* Wave 2 */}
            <path
              d="M 25 20 A 45 45 0 0 1 25 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="animate-[ripple_1.5s_infinite_0.3s]"
            />
            {/* Wave 3 */}
            <path
              d="M 40 10 A 60 60 0 0 1 40 90"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="animate-[ripple_1.5s_infinite_0.6s]"
            />
          </svg>
        </div>
      )}

      {/* Numerical percentage tracker under battery */}
      <div className="absolute bottom-[-30px] font-mono text-[9px] tracking-[4px] text-white/50 uppercase select-none">
        CHARGE LEVEL: {Math.floor(progress)}%
      </div>
      
      {/* Ripple Animation Style */}
      <style>{`
        @keyframes ripple {
          0% {
            opacity: 0;
            transform: scale(0.8) translate3d(-10px, 0, 0);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: scale(1.2) translate3d(15px, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}

const features = [
  {
    title: "200MP ProVision Camera",
    description: "Capture the unseen with optical precision.",
    bg: "bg-transparent",
    icon: (
      <svg className="w-24 h-24 text-brand-cobalt" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  },
  {
    title: "7000mAh PowerCore",
    description: "Uninterrupted energy for your ambitions.",
    bg: "bg-[#06060c]",
    showBattery: true
  },
  {
    title: "Titanium Frame",
    description: "Strength of aerospace, weight of air.",
    bg: "bg-[#0a0a14]",
    showMaterial: true
  },
  {
    title: "48hr Battery Life",
    description: "A companion that never quits.",
    bg: "bg-[#0e0e1e]",
    showProgress: true
  }
];

export default function Features() {
  const horizontalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;
      
      gsap.to(containerRef.current, {
        xPercent: -75, // Translate entire row by 3 panels leftward (out of 4 total panels)
        ease: "none",
        scrollTrigger: {
          trigger: horizontalRef.current,
          pin: true,
          scrub: isMobile ? 0.25 : 1, // Smooth scrub tracking
          snap: 1 / 3, // Snap perfectly to panels (1/3 maps exactly to 0%, 25%, 50%, 75% row shifts)
          end: () => `+=${window.innerWidth * 3}` // Smooth scroll over 3 screen heights
        }
      });
    }, horizontalRef);

    return () => ctx.revert();
  }, []);

  return (
    <div id="features" ref={horizontalRef} className="overflow-hidden">
      <div ref={containerRef} className="flex w-[400vw] h-screen">
        {features.map((feature, i) => (
          <section key={i} className={`feature-panel relative w-screen h-screen flex flex-col items-center justify-center px-6 md:px-10 ${feature.bg}`}>
            <div className="max-w-6xl w-full flex flex-col md:flex-row items-center gap-12 md:gap-20">
              <div className="flex-1 space-y-4 md:space-y-6 text-center md:text-left z-10 select-none w-full px-6 py-8 md:p-0 bg-[#0a0a0a]/50 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border border-white/[0.06] md:border-none rounded-2xl md:rounded-none shadow-[0_12px_40px_rgba(0,0,0,0.6)] md:shadow-none">
                <h2 className="text-3xl sm:text-4xl md:text-7xl font-display font-extrabold leading-tight text-white uppercase tracking-tighter">
                  {feature.title}
                </h2>
                <p className="text-sm md:text-xl text-brand-titanium tracking-wide max-w-md mx-auto md:mx-0 opacity-90">
                  {feature.description}
                </p>
              </div>
              
              <div className="flex-1 flex items-center justify-center relative w-full h-[250px]">
                {feature.icon && <div className="scale-75 md:scale-100">{feature.icon}</div>}
                
                {feature.showBattery && <BatteryVisual />}

                {feature.showMaterial && (
                  <div className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-brand-titanium to-gray-800 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] animate-spin-slow flex items-center justify-center">
                    <span className="text-[10px] tracking-[6px] text-white/40 font-mono uppercase">TITANIUM ALLOY</span>
                  </div>
                )}

                {feature.showProgress && <CircularProgress />}
              </div>
            </div>

            {/* Panel Index */}
            <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 text-[15vw] md:text-[10vw] font-extrabold text-white/5 pointer-events-none select-none">
              0{i + 1}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
