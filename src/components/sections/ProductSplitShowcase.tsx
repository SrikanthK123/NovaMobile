import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import LeftProductBlock from '../gaming/LeftProductBlock';
import RightStickyDisplay from '../gaming/RightStickyDisplay';
import ProductInfoCard from '../gaming/ProductInfoCard';

const PRODUCTS = [
  {
    index: 0,
    label: '01 / 03',
    category: 'GAMING PERIPHERAL',
    headline: ['TRIGGER', 'PRECISION.'],
    description: 'Dominate every match with sub-millisecond response times. CNC machined aerospace aluminum. Engineered for champions.',
    image: '/images/NOVA GamingTrigger.png',
    launchQuarter: 'Q1 2026',
    bgColor: '#050508',
    specBadge: { value: '0.8ms', label: 'ACTUATION' },
    colorDots: ['#0d0d14', '#1a6bff', '#2a2a3a'],
    uniqueWidget: null,
    features: [
      {
        title: 'Ultra-Low Latency',
        desc: '0.8ms actuation time for instantaneous trigger response in any game.'
      },
      {
        title: 'Aerospace Aluminum Body',
        desc: 'CNC machined 6061-T6 alloy. Stronger than steel, lighter than plastic.'
      },
      {
        title: 'Cobalt Blue LED Strip',
        desc: 'Signature NOVA glow runs the full length of each trigger edge.'
      },
      {
        title: 'Universal Fit System',
        desc: 'Spring-loaded clamp fits all phones from 5.5 to 7.2 inches perfectly.'
      },
      {
        title: 'Zero-Slip Grip Texture',
        desc: 'Knurled aluminum grip ensures your fingers never slip mid-match.'
      }
    ] as const
  },
  {
    index: 1,
    label: '02 / 03',
    category: 'THERMAL MANAGEMENT',
    headline: ['COOLING', 'PERFECTED.'],
    description: 'Kill the heat before it kills your game. Semiconductor cooling technology drops your phone temperature by 15°C instantly.',
    image: '/images/NOVA-Coolfan.png',
    launchQuarter: 'Q2 2026',
    bgColor: '#04040e',
    specBadge: { value: '−15°C', label: 'COOLING' },
    colorDots: ['#0d0d14', '#1a6bff', '#7c3aed'],
    uniqueWidget: 'temperature',
    features: [
      {
        title: 'Semiconductor Cooling Core',
        desc: 'Active cooling drops phone temp by up to 15°C in under 60 seconds.'
      },
      {
        title: '18dB Silent Turbine',
        desc: 'Ultra-quiet fan runs at full power without breaking your concentration.'
      },
      {
        title: '360° Cobalt Halo Ring',
        desc: 'Full circumference LED ring glows NOVA blue — always on, always iconic.'
      },
      {
        title: 'Magnetic Quick-Attach',
        desc: 'Zero-friction magnetic mount attaches in 0.5 seconds. No clips needed.'
      },
      {
        title: 'Real-Time Temp Display',
        desc: 'Companion app shows live temperature readout as you push your device.'
      }
    ] as const
  },
  {
    index: 2,
    label: '03 / 03',
    category: 'AUDIO ENGINEERING',
    headline: ['SOUND', 'UNLEASHED.'],
    description: 'Hear every footstep. Every reload. Every spatial cue. 24-bit lossless audio processed by NOVA MIND AI in real-time.',
    image: '/images/NOVA EarBuds.png',
    launchQuarter: 'Q3 2026',
    bgColor: '#060408',
    specBadge: { value: '28ms', label: 'LATENCY' },
    colorDots: ['#0d0d14', '#1a6bff', '#3a1a5a'],
    uniqueWidget: 'waveform',
    features: [
      {
        title: '24-bit Lossless Audio',
        desc: 'Studio-grade 96kHz audio quality in a form factor built for gaming.'
      },
      {
        title: '28ms Gaming Mode',
        desc: 'Ultra-low latency mode eliminates audio lag completely from gameplay.'
      },
      {
        title: 'NOVA MIND Noise Cancellation',
        desc: 'AI-powered noise isolation trained on 10 million audio environments.'
      },
      {
        title: '48 Hour Total Battery',
        desc: '12 hours in buds, 36 hours in case. Game for days without recharging.'
      },
      {
        title: 'Spatial Audio Engine',
        desc: 'Positional audio renders a full 360° soundscape in any game.'
      }
    ] as const
  }
];

export default function ProductSplitShowcase() {
  const [activeProduct, setActiveProduct] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  // IntersectionObserver to detect active scrolling content blocks on desktop
  useEffect(() => {
    // Return early if elements are not mounted yet
    if (blockRefs.current.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-45% 0px -45% 0px', // Center-focused band of the screen
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number((entry.target as HTMLElement).dataset.productIndex);
          if (!isNaN(index)) {
            setActiveProduct(index);
          }
        }
      });
    }, observerOptions);

    blockRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Smooth scroll handler when switcher dots or links are clicked
  const handleSelectProduct = (index: number) => {
    const targetBlock = blockRefs.current[index];
    if (targetBlock) {
      // Check if smooth scroll library Lenis is available globally
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(targetBlock, { offset: 0, duration: 1.2 });
      } else {
        targetBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Section entrance anim targets
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const rightColumnVariants = {
    hidden: { x: 60, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as any, // expo.out curve
      },
    },
  } as any;

  return (
    <motion.section
      id="nova-gaming"
      ref={sectionRef}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="relative w-full transition-colors duration-[1200ms] ease-in-out select-none overflow-visible pt-16 md:pt-0"
      style={{
        backgroundColor: PRODUCTS[activeProduct].bgColor,
      }}
    >
      <style>{`
        /* Responsive tweaks for desktop split columns */
        @media (min-width: 1025px) {
          .left-column-width {
            width: 55%;
          }
          .right-column-width {
            width: 45%;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .left-column-width {
            width: 58%;
          }
          .right-column-width {
            width: 42%;
          }
        }
        
        .padding-block {
          padding-top: 8vh;
          padding-bottom: 8vh;
        }
      `}</style>

      {/* TWO COLUMN CONTAINER - Desktop Layout / Collapses automatically to single column in CSS */}
      <div className="w-full relative flex flex-col md:flex-row items-stretch">
        
        {/* LEFT COLUMN (55% width) - Scrolls normally */}
        <div className="left-column-width w-full relative z-10 flex flex-col">
          
          {/* Loop over products for scrolling sections */}
          {PRODUCTS.map((product, i) => (
            <div
              key={product.index}
              ref={(el) => {
                blockRefs.current[i] = el;
              }}
              data-product-index={product.index}
              className="w-full relative"
            >
              {/* Standard Desktop Left block renderer with integrated mobile visuals */}
              <LeftProductBlock
                label={product.label}
                category={product.category}
                headline={product.headline}
                description={product.description}
                features={product.features as any}
                launchQuarter={product.launchQuarter}
                productIndex={product.index}
                uniqueWidget={product.uniqueWidget as any}
                image={product.image}
                specBadge={product.specBadge}
                colorDots={product.colorDots as any}
              />
            </div>
          ))}

          {/* BONUS PREMIUM ECOSYSTEM TEASER (renders using NewLaunchProducts.png to display full bundle ecosystem) */}
          <div className="w-full bg-[#0d0d16]/30 border-t border-white/[0.03] py-8 md:py-20 px-5 md:px-16 lg:px-20 flex flex-col items-start relative overflow-hidden">
            {/* Ambient Background Glow for ecosystem teaser */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[300px] h-[300px] bg-[radial-gradient(circle,_rgba(26,107,255,0.08)_0%,_transparent_70%)] pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <span className="bg-[#1a6bff]/10 border border-[#1a6bff]/30 text-[#1a6bff] text-[9px] font-bold tracking-[3px] py-1 px-3.5 rounded-full font-cabinet uppercase">
                COMPLETE THE SUITE
              </span>
            </div>

            <h3 className="font-clash font-extrabold text-[clamp(28px,4vw,56px)] text-white leading-tight uppercase tracking-[-1px] mb-3 md:mb-4">
              THE ULTIMATE <br />
              <span className="text-[#1a6bff] drop-shadow-[0_0_15px_rgba(26,107,255,0.2)]">NOVA GEAR BUNDLE</span>
            </h3>

            <p className="font-cabinet text-white/50 text-[14px] leading-relaxed max-w-[460px] mb-5 md:mb-8">
              Unleash the full potential of your smartphone with the complete NOVA professional gaming ecosystem. Built for extreme competitors.
            </p>

            {/* Micro layout display showcasing Ecosystem Image */}
            <div className="w-full max-w-[480px] bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-6 md:mb-8 overflow-hidden flex flex-col md:flex-row gap-4 items-center">
              <img
                src="/images/NewLaunchProducts.png"
                alt="NOVA 2026 Gaming Gear Bundle Suite"
                className="w-[140px] h-[100px] object-contain rounded-lg filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105"
              />
              <div className="flex flex-col text-center md:text-left">
                <span className="font-clash text-xs font-bold text-white uppercase tracking-wide">NOVA Gaming Suite Pro</span>
                <span className="font-cabinet text-[11px] text-white/40 block mt-1">Includes Trigger Pro + Cooler X1 + SoundPro X earbuds</span>
                <span className="font-clash text-sm font-extrabold text-[#1a6bff] mt-2 block tracking-wider">RESERVING Q3 2026</span>
              </div>
            </div>

            <a
              href="#waitlist"
              className="group relative overflow-hidden bg-[#1a6bff] hover:bg-[#2070ff] text-white font-cabinet font-extrabold text-xs tracking-[3px] uppercase py-4 px-8 rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(26,107,255,0.4)]"
            >
              RESERVE COMPLETE SUITE
            </a>
          </div>

        </div>

        {/* RIGHT COLUMN (45% width) - Sticky container on Desktop / Hidden on Mobile */}
        <motion.div
          variants={rightColumnVariants}
          className="right-column-width hidden md:block h-screen sticky top-0 z-20 flex-shrink-0"
        >
          <RightStickyDisplay
            activeProduct={activeProduct}
            products={PRODUCTS as any}
            onSelectProduct={handleSelectProduct}
          />
        </motion.div>

      </div>
    </motion.section>
  );
}
