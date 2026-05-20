import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';

const testimonials = [
  { name: "Alex Rivers", role: "Creative Director", text: "The camera is a paradigm shift. I've retired my DSLR.", raitng: 5 },
  { name: "Sarah Chen", role: "Tech Journalist", text: "NOVA isn't just a phone; it's a piece of engineering art.", raitng: 5 },
  { name: "Marcus Thorne", role: "Architect", text: "The titanium build quality feels immortal.", raitng: 5 },
  { name: "Elena Rossi", role: "Photographer", text: "Depth and dynamic range I never thought possible on mobile.", raitng: 5 },
  { name: "David Kim", role: "Software Engineer", text: "The performance overhead is insane. Nothing lags.", raitng: 5 },
  { name: "Sofia Vega", role: "Influencer", text: "Obsessed with the Crimson Black finish. Stunning.", raitng: 5 },
];

export default function Testimonials() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const totalWidth = marquee.scrollWidth / 2;
    
    const animation = gsap.to(marquee, {
      x: -totalWidth,
      duration: 30,
      ease: "none",
      repeat: -1,
    });

    // Speed up on hover
    marquee.addEventListener('mouseenter', () => animation.timeScale(0.2));
    marquee.addEventListener('mouseleave', () => animation.timeScale(1));

    return () => {
      animation.kill();
    };
  }, []);

  return (
    <section className="py-32 bg-brand-obsidian overflow-hidden">
      <div className="px-6 md:px-10 mb-12 md:mb-20 text-center">
        <h2 className="text-3xl md:text-6xl font-display uppercase tracking-tight">Vibrations from the Field.</h2>
      </div>

      <div className="relative flex">
        <div ref={marqueeRef} className="flex gap-4 md:gap-8 whitespace-nowrap">
          {[...testimonials, ...testimonials].map((t, i) => (
            <div key={i} className="min-w-[280px] md:min-w-[400px] p-8 md:p-10 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 flex flex-col justify-between h-56 md:h-64">
              <p className="text-lg md:text-xl font-light italic leading-relaxed text-brand-titanium overflow-hidden text-ellipsis whitespace-normal">
                "{t.text}"
              </p>
              <div className="flex items-center justify-between mt-4 md:mt-6">
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-sm md:text-base">{t.name}</h4>
                  <span className="text-[10px] md:text-xs text-brand-cobalt">{t.role}</span>
                </div>
                <div className="flex gap-0.5 md:gap-1">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-brand-cobalt text-xs md:text-base">★</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
