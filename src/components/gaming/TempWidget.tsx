import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export default function TempWidget() {
  const [temp, setTemp] = useState(42);

  // Animate the temp number reading live for premium feels
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const runAnimation = () => {
      let current = 42;
      interval = setInterval(() => {
        if (current > 27) {
          current -= 1;
          setTemp(current);
        } else {
          clearInterval(interval);
          // Wait a bit, then loop back
          setTimeout(() => {
            setTemp(42);
            runAnimation();
          }, 3000);
        }
      }, 80);
    };

    runAnimation();
    return () => clearInterval(interval);
  }, []);

  // Compute position percentage along the slider: 42°C is 0%, 27°C is 100%
  const percentage = ((42 - temp) / (42 - 27)) * 100;

  return (
    <div className="w-full max-w-[380px] bg-[rgba(26,107,255,0.06)] border border-[rgba(26,107,255,0.2)] rounded-xl p-[14px] px-[18px] my-4 backdrop-filter backdrop-blur-md">
      {/* Row 1: Temperature Readings */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-[3px] text-white/50 font-cabinet">Cooling Core</span>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold font-clash text-red-500 transition-colors duration-300">42°C</span>
          <span className="text-white/30 text-xs">→</span>
          <span className="text-base font-bold font-clash text-[#1a6bff] drop-shadow-[0_0_10px_rgba(26,107,255,0.4)]">
            {temp}°C
          </span>
        </div>
      </div>

      {/* Row 2: Sliding Gradient Indicator */}
      <div className="relative w-full h-[6px] rounded-full bg-gradient-to-r from-red-500 via-[#7c3aed] to-[#1a6bff] mb-3 overflow-visible">
        {/* Animated sliding dot */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border border-[#1a6bff] shadow-[0_0_8px_rgba(26,107,255,0.8)] -ml-1.5 transition-all duration-100 ease-out"
          style={{ left: `${percentage}%` }}
        />
      </div>

      {/* Row 3: Metrics & Badges */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/40 font-cabinet">Active Semiconductor Cooling</span>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-md px-2 py-0.5">
          <svg className="w-2.5 h-2.5 text-emerald-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
          </svg>
          <span className="text-[10px] font-bold font-cabinet text-emerald-400 tracking-wider">
            15°C COOLER
          </span>
        </div>
      </div>
    </div>
  );
}
