import { motion } from 'motion/react';

interface FeatureItemProps {
  title: string;
  description: string;
  index: number;
}

export default function FeatureItem({ title, description, index }: FeatureItemProps) {
  // Motion variants for staggered entrance reveal
  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as any,
      },
    },
  } as any;

  return (
    <motion.div
      variants={itemVariants}
      className="py-2.5 md:py-4 border-b border-white/5 flex gap-4 cursor-default group transition-colors duration-300 hover:border-[#1a6bff]/30"
    >
      {/* Diamond Icon ◆ */}
      <div 
        className="w-2 h-2 bg-[#1a6bff] flex-shrink-0 mt-[6px] transition-transform duration-300 group-hover:scale-125 group-hover:rotate-45"
        style={{
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          boxShadow: '0 0 8px rgba(26, 107, 255, 0.6)'
        }}
      />

      {/* Content */}
      <div className="flex flex-col">
        <h4 className="font-cabinet font-semibold text-sm text-white tracking-wide transition-colors duration-200 group-hover:text-[#1a6bff]">
          {title}
        </h4>
        <p className="font-cabinet font-normal text-[13px] text-white/40 leading-relaxed max-w-[380px] mt-1 transition-colors duration-200 group-hover:text-white/60">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
