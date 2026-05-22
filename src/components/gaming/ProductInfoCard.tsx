import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

interface ProductInfoCardProps {
  name: string;
  image: string;
  colors: string[];
  launchQuarter: string;
  productIndex: number;
}

export default function ProductInfoCard({
  name,
  image,
  colors,
  launchQuarter,
  productIndex,
}: ProductInfoCardProps) {
  const [selectedColor, setSelectedColor] = useState(1); // default to second color (accent) or index 0

  // Whenever productIndex changes, reset selected color dot to central accent (index 1)
  useEffect(() => {
    setSelectedColor(1);
  }, [productIndex]);

  return (
    <div className="relative w-[clamp(260px,85%,340px)] select-none min-h-[72px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={productIndex}
          initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full bg-white/[0.04] border border-white/10 rounded-[18px] p-4 px-5 backdrop-blur-[24px] shadow-[0_24px_60px_rgba(0,0,0,0.5),_inset_0_0_0_0.5px_rgba(255,255,255,0.06)] flex items-center justify-between"
        >
          {/* Left: Product Thumbnail */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center p-1.5 flex-shrink-0">
              <img
                src={image}
                alt={name}
                className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              />
            </div>

            {/* Center: Info & Color Swatch */}
            <div className="flex flex-col justify-center">
              <h5 className="font-clash font-extrabold text-[13px] text-white tracking-[0.5px] leading-tight uppercase">
                {name}
              </h5>
              
              {/* Color Dot Swatch */}
              <div className="flex items-center gap-[6px] mt-1.5">
                {colors.map((color, dotIndex) => (
                  <button
                    key={dotIndex}
                    onClick={() => setSelectedColor(dotIndex)}
                    className="w-2 h-2 rounded-full cursor-pointer focus:outline-none relative transition-all duration-300 hover:scale-125"
                    style={{ backgroundColor: color }}
                    title={`Color variant ${dotIndex + 1}`}
                  >
                    {selectedColor === dotIndex && (
                      <span className="absolute -inset-[3px] rounded-full border border-white flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Launch details (acting as price showcase style) */}
          <div className="text-right flex flex-col justify-center pl-2 border-l border-white/5">
            <span className="font-clash text-[9px] text-white/40 tracking-[2px] font-medium leading-none uppercase">
              COMING
            </span>
            <span className="font-clash text-lg font-bold text-[#1a6bff] leading-none mt-1 tracking-wide">
              2026
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
