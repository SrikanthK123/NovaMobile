'use client';

const reviews1 = [
  "BEST PHONE 2026 — TechRadar",
  "★★★★★ — The Verge",
  "Innovation Award — CES 2026",
  "Phone of the Year — CNET",
  "Editor's Choice — GSMArena"
];

const reviews2 = [
  "Revolutionary Camera — DxOMark #1",
  "Best Display Award — DisplayMate",
  "Fastest Mobile CPU — AnTuTu",
  "Design Excellence — Red Dot Award",
  "Most Anticipated — Android Authority"
];

export default function PressMarquee() {
  // Duplicate reviews array to create seamless loop structure
  const duplicatedRow1 = [...reviews1, ...reviews1, ...reviews1];
  const duplicatedRow2 = [...reviews2, ...reviews2, ...reviews2];

  return (
    <section className="relative w-full py-16 bg-[#020205] border-t border-b border-white/5 overflow-hidden select-none">
      
      {/* Visual Shadow Vignette to fade edges */}
      <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-[#020205] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-[#020205] to-transparent z-10 pointer-events-none" />

      <div className="space-y-8 md:space-y-12">
        
        {/* ── ROW 1: LEFT TO RIGHT ── */}
        <div className="marquee-wrapper relative flex overflow-hidden group">
          <div className="marquee-content flex gap-8 animate-[marqueeRight_35s_linear_infinite] group-hover:[animation-play-state:paused] will-change-transform">
            {duplicatedRow1.map((review, idx) => (
              <div
                key={`rev1-${idx}`}
                className="flex items-center gap-8 whitespace-nowrap text-lg md:text-xl font-display font-extrabold text-white/30 hover:text-white transition-all duration-300 cursor-pointer relative py-2 group/item"
              >
                <span>{review}</span>
                <span className="text-brand-cobalt font-black">•</span>
                
                {/* Micro underline highlight */}
                <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-brand-cobalt shadow-[0_0_8px_#1a6bff] transition-all duration-300 group-hover/item:w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* ── ROW 2: RIGHT TO LEFT ── */}
        <div className="marquee-wrapper relative flex overflow-hidden group">
          <div className="marquee-content flex gap-8 animate-[marqueeLeft_30s_linear_infinite] group-hover:[animation-play-state:paused] will-change-transform">
            {duplicatedRow2.map((review, idx) => (
              <div
                key={`rev2-${idx}`}
                className="flex items-center gap-8 whitespace-nowrap text-lg md:text-xl font-display font-extrabold text-white/30 hover:text-white transition-all duration-300 cursor-pointer relative py-2 group/item"
              >
                <span>{review}</span>
                <span className="text-brand-cobalt font-black">•</span>

                {/* Micro underline highlight */}
                <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-brand-cobalt shadow-[0_0_8px_#1a6bff] transition-all duration-300 group-hover/item:w-full" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── SEAMLESS KEYFRAMES STYLES INLINED ── */}
      <style>{`
        @keyframes marqueeLeft {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-33.333%, 0, 0);
          }
        }
        @keyframes marqueeRight {
          0% {
            transform: translate3d(-33.333%, 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </section>
  );
}
