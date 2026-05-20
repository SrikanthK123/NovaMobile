import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';

const specData = [
  { label: "Display", value: 6.8, unit: "in", sub: "Super Retina XDR", suffix: " AMOLED" },
  { label: "Battery", value: 7000, unit: "mAh", sub: "PowerCore Tech" },
  { label: "Storage", value: 1, unit: "TB", sub: "Ultra-Fast NVMe" },
  { label: "CPU", value: 4.2, unit: "GHz", sub: "Octa-Core Neural" },
  { label: "Weight", value: 185, unit: "g", sub: "Aerospace Titanium" },
  { label: "Network", value: 5, unit: "G+", sub: "Next-Gen Ultra Broadband" },
];

export default function Specs() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".spec-card");
      if (cards.length === 0) return;

      const mm = gsap.matchMedia();

      // Desktop layout: Pinned sequential reveal
      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            pin: true,
            scrub: 1,
            start: "top top",
            end: "+=120%",
          }
        });

        cards.forEach((card: any, i: number) => {
          const countVal = card.querySelector(".count-value");
          const target = parseFloat(countVal?.getAttribute('data-target') || "0");

          // Sequence the card entrance
          tl.fromTo(card,
            { opacity: 0, y: 40 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.8,
              ease: "power2.out" 
            },
            i * 0.4 // Stagger sequentially
          );

          // Sequence count up with card entrance
          if (countVal) {
            tl.to(countVal, {
              innerText: target,
              duration: 0.8,
              snap: { innerText: target % 1 === 0 ? 1 : 0.1 },
              ease: "power1.out",
              onUpdate: function() {
                // Ensure floating numbers keep their decimal point formatting during countup
                if (target % 1 !== 0) {
                  const val = parseFloat(countVal.innerText);
                  countVal.innerText = val.toFixed(1);
                }
              }
            }, i * 0.4);
          }
        });
      });

      // Mobile/Tablet layout: Non-pinned scroll sequential reveal
      mm.add("(max-width: 1023px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            scrub: 1,
            start: "top 80%",
            end: "bottom 90%",
          }
        });

        cards.forEach((card: any, i: number) => {
          const countVal = card.querySelector(".count-value");
          const target = parseFloat(countVal?.getAttribute('data-target') || "0");

          tl.fromTo(card,
            { opacity: 0, y: 30 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.6,
              ease: "power2.out" 
            },
            i * 0.3
          );

          if (countVal) {
            tl.to(countVal, {
              innerText: target,
              duration: 0.6,
              snap: { innerText: target % 1 === 0 ? 1 : 0.1 },
              ease: "power1.out",
              onUpdate: function() {
                if (target % 1 !== 0) {
                  const val = parseFloat(countVal.innerText);
                  countVal.innerText = val.toFixed(1);
                }
              }
            }, i * 0.3);
          }
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // 3D Tilt Mouse Move Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Max 10 degrees tilt relative to card center coords
    const rotateX = ((centerY - y) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <section 
      id="specs" 
      ref={containerRef} 
      className="relative py-24 min-h-screen bg-brand-obsidian flex flex-col justify-center px-6 md:px-20 overflow-hidden"
    >
      <div className="w-full max-w-[1440px] mx-auto z-10">
        
        {/* Dynamic Section Header */}
        <div className="mb-10 md:mb-16 text-center lg:text-left select-none">
          <h2 className="text-4xl md:text-8xl font-display font-extrabold uppercase tracking-tighter text-white">
            System Specs.
          </h2>
          <p className="text-brand-cobalt text-xs md:text-sm tracking-[4px] uppercase font-bold mt-2 font-mono">
            [ Hardware Intelligence Deck ]
          </p>
        </div>

        {/* Specs Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {specData.map((spec, i) => (
            <div 
              key={i} 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="spec-card group relative p-5 md:p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-brand-cobalt transition-all duration-300 ease-out overflow-hidden flex flex-col justify-between min-h-[190px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] will-change-transform phone-rotator-zone"
            >
              {/* Top glowing accent accent line */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-brand-cobalt transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left shadow-[0_0_8px_#1a6bff]" />
              
              <h4 className="text-[10px] md:text-xs uppercase tracking-widest text-white/40 font-bold mb-5 select-none">
                {spec.label}
              </h4>
              
              <div className="flex flex-wrap items-baseline gap-1 mt-auto select-none">
                <span className="count-value text-3xl md:text-4xl xl:text-5xl font-display font-extrabold text-white" data-target={spec.value}>
                  0
                </span>
                <span className="text-sm md:text-base xl:text-lg font-bold opacity-60 text-brand-cobalt">{spec.unit}</span>
              </div>
              
              <p className="mt-3 text-[10px] md:text-xs font-medium text-brand-titanium font-mono select-none">
                {spec.sub}{spec.suffix || ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
