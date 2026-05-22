import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import ProductInfoCard from './ProductInfoCard';

interface SpecBadge {
  value: string;
  label: string;
}

interface Product {
  index: number;
  label: string;
  category: string;
  headline: string[];
  description: string;
  image: string;
  launchQuarter: string;
  bgColor: string;
  specBadge: SpecBadge;
  colorDots: string[];
  uniqueWidget: 'temperature' | 'waveform' | null;
}

interface RightStickyDisplayProps {
  activeProduct: number;
  products: Product[];
  onSelectProduct?: (index: number) => void;
}

type ImageState = 'idle' | 'exiting' | 'entering';

export default function RightStickyDisplay({
  activeProduct,
  products,
  onSelectProduct,
}: RightStickyDisplayProps) {
  const [currentProductIndex, setCurrentProductIndex] = useState(activeProduct);
  const [imageState, setImageState] = useState<ImageState>('idle');
  const floatRef = useRef<HTMLDivElement>(null);
  
  // Continuous Idle Float Animation using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      time += 0.04;
      if (floatRef.current && imageState === 'idle') {
        const y = Math.sin(time * 0.6) * 8;
        const rotate = Math.sin(time * 0.4) * 0.8;
        floatRef.current.style.transform = `translateY(${y}px) rotate(${rotate}deg)`;
      } else if (floatRef.current && imageState !== 'idle') {
        // Clear transform styling during active Framer Motion transitions to avoid conflict
        floatRef.current.style.transform = '';
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [imageState]);

  // Cinematic Defocus-Refocus Transition State Machine
  useEffect(() => {
    if (activeProduct !== currentProductIndex) {
      // Step 1: Exit current product image
      setImageState('exiting');
      
      // Step 2: Swap product data half-way through the defocus phase (after exit finishes)
      const exitTimer = setTimeout(() => {
        setCurrentProductIndex(activeProduct);
        // Step 3: Enter new product image
        setImageState('entering');
        
        // Step 4: Complete transition and return to floating idle state
        const enterTimer = setTimeout(() => {
          setImageState('idle');
        }, 550);

        return () => clearTimeout(enterTimer);
      }, 450);

      return () => clearTimeout(exitTimer);
    }
  }, [activeProduct, currentProductIndex]);

  const currentProduct = products[currentProductIndex];

  // Radial gradients matching product aesthetic
  const getGlowGradient = (index: number) => {
    switch (index) {
      case 0:
        return 'radial-gradient(ellipse at 60% 50%, rgba(26,107,255,0.12) 0%, transparent 65%)';
      case 1:
        return 'radial-gradient(circle at 50% 50%, rgba(26,107,255,0.18) 0%, rgba(124,58,237,0.08) 40%, transparent 70%)';
      case 2:
        return 'radial-gradient(ellipse at 40% 60%, rgba(26,107,255,0.10) 0%, rgba(124,58,237,0.10) 50%, transparent 70%)';
      default:
        return 'radial-gradient(ellipse at 50% 50%, rgba(26,107,255,0.15) 0%, transparent 70%)';
    }
  };

  // Motion variants for defocus-refocus transitions
  const imageVariants = {
    idle: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      y: 0,
    },
    exiting: {
      opacity: 0,
      scale: 0.88,
      filter: 'blur(12px)',
      y: 20,
      transition: {
        duration: 0.45,
        ease: [0.76, 0, 0.24, 1] as any, // expo.in curve
      },
    },
    entering: {
      opacity: [0, 1],
      scale: [1.08, 1],
      filter: ['blur(12px)', 'blur(0px)'],
      y: [-20, 0],
      transition: {
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1] as any, // expo.out curve
      },
    },
  } as any;

  // Spec Badge exit/entry configurations
  const specBadgeVariants = {
    idle: { opacity: 1, y: 0 },
    exiting: {
      opacity: 0,
      y: 8,
      transition: { duration: 0.3, ease: 'easeIn' as any },
    },
    entering: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' as any },
    },
  } as any;

  return (
    <div className="w-full h-full relative flex flex-col justify-between items-center py-10 overflow-hidden bg-transparent">
      {/* 1. Background Glows (changes per product index with a smooth transition) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none transition-all duration-[800ms] ease-in-out"
        style={{ background: getGlowGradient(currentProductIndex) }}
      />

      {/* 2. Main Hero Image Area */}
      <div className="w-full h-[65vh] flex items-center justify-center relative z-10">
        
        {/* Floating Glassmorphic Spec Badge (Top Left of image area) */}
        <motion.div
          variants={specBadgeVariants}
          animate={imageState === 'exiting' ? 'exiting' : imageState === 'entering' ? 'entering' : 'idle'}
          className="absolute top-[15%] left-[6%] z-30 bg-white/[0.04] border border-[#1a6bff]/25 rounded-[10px] p-[10px] px-[14px] backdrop-blur-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col pointer-events-none"
        >
          <span className="font-clash font-extrabold text-[22px] text-white leading-none">
            {currentProduct.specBadge.value}
          </span>
          <span className="font-cabinet font-bold text-[9px] tracking-[4px] text-[#1a6bff] leading-none mt-1.5 uppercase">
            {currentProduct.specBadge.label}
          </span>
        </motion.div>

        {/* Float Wrap Container (Applies requestAnimationFrame translation) */}
        <div ref={floatRef} className="w-full h-full flex items-center justify-center transition-all duration-300">
          <motion.img
            key={currentProductIndex}
            variants={imageVariants}
            animate={imageState}
            src={currentProduct.image}
            alt={currentProduct.category}
            className="max-h-[55vh] max-w-[90%] object-contain select-none filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.65)] pointer-events-none z-20"
          />
        </div>

        {/* Dual LED lights or solid glow bar overlay directly below */}
        <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none w-full">
          {currentProductIndex !== 2 ? (
            // Trigger + Fan Solid Glow Strip
            <div className="flex flex-col items-center">
              <div 
                className="w-[160px] h-[4px] rounded-full bg-[#1a6bff] opacity-70 blur-[8px] transition-all duration-500"
                style={{ boxShadow: '0 0 10px #1a6bff' }}
              />
              <div 
                className="w-[200px] h-[20px] bg-[radial-gradient(rgba(26,107,255,0.3),transparent)] mt-1 transition-all duration-500"
              />
            </div>
          ) : (
            // Earbuds: Double pulsing small LED indicators
            <div className="flex items-center gap-[20px] transition-all duration-500">
              <div className="w-[6px] h-[6px] rounded-full bg-[#1a6bff] opacity-80 blur-[4px] animate-pulse shadow-[0_0_8px_#1a6bff]" />
              <div className="w-[6px] h-[6px] rounded-full bg-[#1a6bff] opacity-80 blur-[4px] animate-pulse shadow-[0_0_8px_#1a6bff]" />
            </div>
          )}
        </div>
      </div>

      {/* 3. Footer Elements: Clickable Switcher Dots + Info Card Wrapper */}
      <div className="absolute bottom-[48px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-6 w-full">
        {/* Product Switcher Dots */}
        <div className="flex items-center gap-2">
          {products.map((p) => {
            const isActive = p.index === activeProduct;
            return (
              <button
                key={p.index}
                onClick={() => onSelectProduct?.(p.index)}
                className="focus:outline-none transition-all duration-300 relative"
                title={`Switch to ${p.category}`}
              >
                {isActive ? (
                  <motion.div
                    layoutId="activeDot"
                    className="w-6 h-[6px] bg-[#1a6bff] rounded-full shadow-[0_0_10px_rgba(26,107,255,0.5)]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                ) : (
                  <div className="w-[6px] h-[6px] bg-white/15 rounded-full hover:bg-white/30 hover:scale-120 transition-all cursor-pointer" />
                )}
              </button>
            );
          })}
        </div>

        {/* Product Info Card component */}
        <ProductInfoCard
          name={currentProduct.category === 'GAMING PERIPHERAL' ? 'NOVA TRIGGER PRO' : currentProduct.category === 'THERMAL MANAGEMENT' ? 'NOVA COOLER X1' : 'NOVA SOUNDPRO X'}
          image={currentProduct.image}
          colors={currentProduct.colorDots}
          launchQuarter={currentProduct.launchQuarter}
          productIndex={currentProductIndex}
        />
      </div>
    </div>
  );
}
