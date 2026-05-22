import { useEffect, useRef, useState } from 'react';

export default function WaveformWidget() {
  const [heights, setHeights] = useState<number[]>([20, 30, 40, 50, 40, 30, 20, 10]);
  const animationFrameId = useRef<number | null>(null);
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    const updateWaveform = () => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      
      // Calculate heights based on sine wave with phase shifts for each bar
      const newHeights = Array.from({ length: 8 }).map((_, i) => {
        // Compose a sine wave with multiple frequencies for organic movement
        const wave = Math.sin(elapsed * 12 + i * 0.8) * 15 + Math.sin(elapsed * 6 + i * 0.4) * 8;
        // Clamp height between 8px and 42px
        return Math.max(8, Math.min(42, 25 + wave));
      });
      
      setHeights(newHeights);
      animationFrameId.current = requestAnimationFrame(updateWaveform);
    };

    animationFrameId.current = requestAnimationFrame(updateWaveform);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-[380px] bg-[rgba(26,107,255,0.06)] border border-[rgba(26,107,255,0.2)] rounded-xl p-[14px] px-[18px] my-4 backdrop-filter backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] uppercase tracking-[3px] text-white/50 font-cabinet">NOVA MIND Engine</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold font-clash text-white/80 tracking-widest">LIVE AUDIO PREVIEW</span>
        </div>
      </div>

      {/* Visualiser Area */}
      <div className="flex items-end justify-center gap-[6px] h-12 mb-2 bg-black/20 rounded-lg p-2">
        {heights.map((height, i) => (
          <div
            key={i}
            className="w-2.5 rounded-full transition-all duration-75 ease-out"
            style={{
              height: `${height}px`,
              background: `linear-gradient(to top, #1a6bff, #7c3aed)`,
              boxShadow: `0 0 12px rgba(26, 107, 255, ${0.1 + (height / 50) * 0.4})`
            }}
          />
        ))}
      </div>

      <div className="flex justify-between text-[9px] text-white/30 font-cabinet">
        <span>20 Hz</span>
        <span>NOVA Spatial Soundstage</span>
        <span>48 kHz</span>
      </div>
    </div>
  );
}
