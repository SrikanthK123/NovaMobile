import { motion } from 'motion/react';
import FeatureItem from './FeatureItem';
import TempWidget from './TempWidget';
import WaveformWidget from './WaveformWidget';
import ProductInfoCard from './ProductInfoCard';

interface Feature {
  title: string;
  desc: string;
}

interface LeftProductBlockProps {
  label: string;
  category: string;
  headline: string[];
  description: string;
  features: Feature[];
  launchQuarter: string;
  productIndex: number;
  uniqueWidget: 'temperature' | 'waveform' | null;
  image: string;
  specBadge: { value: string; label: string };
  colorDots: string[];
}

export default function LeftProductBlock({
  label,
  category,
  headline,
  description,
  features,
  launchQuarter,
  productIndex,
  uniqueWidget,
  image,
  specBadge,
  colorDots,
}: LeftProductBlockProps) {
  // Container variants for staggered entrance of features
  const featuresContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  // Headline reveal clip path variants
  const wordVariants = {
    hidden: { clipPath: 'inset(0% 0% 100% 0%)', y: 15 },
    visible: (index: number) => ({
      clipPath: 'inset(0% 0% 0% 0%)',
      y: 0,
      transition: {
        delay: index * 0.12,
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1] as any, // expo.out
      },
    }),
  } as any;

  return (
    <div
      data-product-index={productIndex}
      className="left-product-block w-full md:min-h-[110vh] flex flex-col justify-center py-6 md:py-24 px-5 md:px-16 lg:px-20 border-b border-white/[0.02]"
    >
      <style>{`
        @keyframes pulseScaleGlow {
          0% {
            transform: scale(1);
            opacity: 1;
            box-shadow: 0 0 0 0px rgba(26, 107, 255, 0.7);
          }
          70% {
            transform: scale(1.6);
            opacity: 0;
            box-shadow: 0 0 0 6px rgba(26, 107, 255, 0);
          }
          100% {
            transform: scale(1);
            opacity: 0;
            box-shadow: 0 0 0 0px rgba(26, 107, 255, 0);
          }
        }
        .pulse-dot-glow {
          position: relative;
        }
        .pulse-dot-glow::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #1a6bff;
          animation: pulseScaleGlow 1.8s infinite ease-out;
        }
      `}</style>

      {/* Top Label */}
      <div className="flex items-center gap-5 mb-4 md:mb-6">
        <div className="w-[30px] h-[1px] bg-[#1a6bff]" />
        <span className="font-cabinet text-[11px] font-bold tracking-[5px] text-[#1a6bff] uppercase">
          {label} &nbsp; {category}
        </span>
      </div>

      {/* Headline Clip Reveal */}
      <div className="mb-4 md:mb-6 select-none">
        {headline.map((line, i) => (
          <div key={i} className="overflow-hidden py-1">
            <motion.h2
              custom={i}
              variants={wordVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="font-clash font-extrabold text-[clamp(44px,6.5vw,88px)] text-white leading-[0.92] tracking-[-2px] uppercase"
            >
              {line}
            </motion.h2>
          </div>
        ))}
      </div>

      {/* Description */}
      <p className="font-cabinet font-normal text-[clamp(14px,1.4vw,17px)] text-white/50 leading-relaxed max-w-[420px] mb-4 md:mb-10">
        {description}
      </p>

      {/* Mobile-Only Visual Component block (Collapses sticky column data inline) */}
      <div className="flex md:hidden flex-col items-center w-full my-4 md:my-6 relative z-10 bg-white/[0.01] border border-white/5 rounded-2xl p-4 py-6 overflow-hidden">
        {/* Subtle radial background glow per product on mobile */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-40"
          style={{
            background:
              productIndex === 0
                ? 'radial-gradient(circle, rgba(26,107,255,0.18) 0%, transparent 70%)'
                : productIndex === 1
                ? 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(26,107,255,0.12) 0%, rgba(124,58,237,0.1) 40%, transparent 70%)',
          }}
        />
        
        {/* Mobile visual spec badge */}
        <div className="absolute top-[10%] left-[8%] z-20 bg-white/[0.04] border border-[#1a6bff]/20 rounded-[8px] p-2 px-3 backdrop-blur-[8px]">
          <span className="font-clash font-extrabold text-sm text-white leading-none block">
            {specBadge.value}
          </span>
          <span className="font-cabinet font-semibold text-[8px] tracking-[2px] text-[#1a6bff] block mt-0.5 leading-none uppercase">
            {specBadge.label}
          </span>
        </div>

        {/* Product Image */}
        <motion.img
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          src={image}
          alt={category}
          className="max-h-[250px] max-w-[90%] object-contain relative z-10 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)] mb-4"
        />

        {/* LED Glow overlay directly below image on mobile */}
        <div className="relative z-10 flex flex-col items-center pointer-events-none w-full mb-4">
          {productIndex !== 2 ? (
            <div className="flex flex-col items-center">
              <div 
                className="w-[120px] h-[3px] rounded-full bg-[#1a6bff] opacity-70 blur-[6px]"
                style={{ boxShadow: '0 0 8px #1a6bff' }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-[15px]">
              <div className="w-[5px] h-[5px] rounded-full bg-[#1a6bff] opacity-80 blur-[3px] animate-pulse shadow-[0_0_6px_#1a6bff]" />
              <div className="w-[5px] h-[5px] rounded-full bg-[#1a6bff] opacity-80 blur-[3px] animate-pulse shadow-[0_0_6px_#1a6bff]" />
            </div>
          )}
        </div>

        {/* Product Info Card directly below image/LED inside the mobile block */}
        <div className="w-full flex justify-center relative z-10">
          <ProductInfoCard
            name={category === 'GAMING PERIPHERAL' ? 'NOVA TRIGGER PRO' : category === 'THERMAL MANAGEMENT' ? 'NOVA COOLER X1' : 'NOVA SOUNDPRO X'}
            image={image}
            colors={colorDots}
            launchQuarter={launchQuarter}
            productIndex={productIndex}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="w-10 h-[1px] bg-gradient-to-r from-[#1a6bff] to-transparent mb-4 md:mb-9" />

      {/* Features List with Staggered Entrance & Inline Widget Insertion */}
      <motion.div
        variants={featuresContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="flex flex-col mb-4 md:mb-10"
      >
        {features.map((feature, i) => {
          const renderedItems = [
            <FeatureItem
              key={`feature-${i}`}
              title={feature.title}
              description={feature.desc}
              index={i}
            />
          ];

          // Inject unique widget between 2nd (index 1) and 3rd (index 2) features
          if (i === 1 && uniqueWidget) {
            renderedItems.push(
              <motion.div
                key="unique-widget-wrapper"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                {uniqueWidget === 'temperature' ? <TempWidget /> : <WaveformWidget />}
              </motion.div>
            );
          }

          return renderedItems;
        })}
      </motion.div>

      {/* Launch Info Row */}
      <div className="flex flex-wrap items-center gap-4 mt-2 md:mt-4">
        {/* Status Pill */}
        <div className="bg-[#1a6bff]/10 border border-[#1a6bff]/25 rounded-full py-2 px-4 flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1a6bff] pulse-dot-glow flex-shrink-0" />
          <span className="font-cabinet text-[11px] font-bold tracking-[3px] text-[#1a6bff]">
            LAUNCHING {launchQuarter}
          </span>
        </div>

        {/* Notify Link */}
        <a
          href="#waitlist"
          className="group flex items-center gap-1.5 font-cabinet text-[13px] font-bold text-white/40 no-underline transition-colors duration-200 hover:text-white"
        >
          Get notified
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </a>
      </div>
    </div>
  );
}
