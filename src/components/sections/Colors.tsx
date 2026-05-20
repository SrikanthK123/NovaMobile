import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Scene from '../three/Scene';

const colors = [
  { name: "Obsidian", color: "#0a0a0a", meshColor: "#1a1a2e", price: "$1,199", bgWash: "radial-gradient(circle, #14141c 0%, #030305 100%)" },
  { name: "Arctic White", color: "#f5f5f5", meshColor: "#ffffff", price: "$1,199", bgWash: "radial-gradient(circle, #222233 0%, #06060a 100%)" },
  { name: "Cobalt Blue", color: "#1a6bff", meshColor: "#1a6bff", price: "$1,299", bgWash: "radial-gradient(circle, #0c1c3f 0%, #020612 100%)" },
  { name: "Titanium Gold", color: "#c8c8c8", meshColor: "#c8b08e", price: "$1,399", bgWash: "radial-gradient(circle, #2a2016 0%, #060503 100%)" },
  { name: "Crimson Black", color: "#4a0404", meshColor: "#2a0000", price: "$1,299", bgWash: "radial-gradient(circle, #380710 0%, #040102 100%)" },
];

export default function Colors() {
  const [activeColor, setActiveColor] = useState(colors[0]);

  return (
    <section className="relative h-screen flex flex-col md:flex-row overflow-hidden bg-[#020204]">
      {/* ── CINEMATIC BACKGROUND WASH OVERLAYS ── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeColor.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeInOut' }}
            style={{ background: activeColor.bgWash }}
            className="absolute inset-0 w-full h-full"
          />
        </AnimatePresence>
      </div>

      <div className="flex-1 relative order-2 md:order-1 z-10">
        <Scene phoneColor={activeColor.meshColor} mode="static" />
      </div>

      <div className={`flex-1 flex flex-col justify-center px-6 md:px-20 z-20 order-1 md:order-2 py-12 md:py-0 text-white`}>
        <motion.div
           key={activeColor.name}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -20 }}
           className="space-y-4 md:space-y-8 text-center md:text-left select-none"
        >
          <span className="text-[10px] tracking-[6px] text-brand-cobalt uppercase font-bold block mb-1">
            [ FLAGSHIP SHADE ]
          </span>
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-display font-extrabold leading-none uppercase tracking-tighter text-white">
            {activeColor.name}
          </h2>
          <div className="text-xl md:text-3xl font-light opacity-80 text-white/80">
            Starting at <span className="font-extrabold text-white">{activeColor.price}</span>
          </div>
        </motion.div>

        {/* Color buttons grid */}
        <div className="mt-10 md:mt-16 flex flex-wrap justify-center md:justify-start gap-4 z-25">
          {colors.map((c) => (
            <button
              key={c.name}
              onClick={() => setActiveColor(c)}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all duration-300 ${activeColor.name === c.name ? 'scale-125 border-white ring-4 ring-white/20' : 'border-white/20 hover:scale-110'}`}
              style={{ backgroundColor: c.color }}
              aria-label={`Select ${c.name} color`}
            />
          ))}
        </div>

        {/* Action button */}
        <div className="flex justify-center md:justify-start z-25">
          <button className={`mt-10 md:mt-12 w-fit px-8 py-3.5 border border-white hover:bg-white hover:text-brand-obsidian rounded-full font-display font-bold uppercase tracking-widest hover:scale-105 transition-all text-xs md:text-sm text-white bg-transparent`}>
            Order in {activeColor.name}
          </button>
        </div>
      </div>
      
      {/* Background text decoration */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none opacity-5 z-0 select-none">
        <span className="text-[25vw] font-extrabold uppercase tracking-tighter text-white">{activeColor.name}</span>
      </div>
    </section>
  );
}
