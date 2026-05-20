'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Smartphone, Camera, Cpu, ShoppingBag } from 'lucide-react';
import clsx from 'clsx';

interface TabItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const tabs: TabItem[] = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'features', icon: Smartphone, label: 'Features' },
  { id: 'camera', icon: Camera, label: 'Camera' },
  { id: 'specs', icon: Cpu, label: 'Specs' },
  { id: 'cta', icon: ShoppingBag, label: 'Order' },
];

const tabCenters = [38, 99, 160, 221, 282];

const getNotchedPath = (C: number) => {
  return `M 24,0 L ${C - 24},0 C ${C - 16},0 ${C - 12},12 ${C},12 C ${C + 12},12 ${C + 16},0 ${C + 24},0 L 296,0 A 24,24 0 0 1 320,24 L 320,40 A 24,24 0 0 1 296,64 L 24,64 A 24,24 0 0 1 0,40 L 0,24 A 24,24 0 0 1 24,0 Z`;
};

export default function InteractiveNavbar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  // SVG Paths for Capsule Background
  // Width: 320, Height: 64, Corner Radius: 24
  // Flat Path (for when index !== 3)
  const flatPath = "M 24,0 L 296,0 A 24,24 0 0 1 320,24 L 320,40 A 24,24 0 0 1 296,64 L 24,64 A 24,24 0 0 1 0,40 L 0,24 A 24,24 0 0 1 24,0 Z";
  
  // Wave Notch Path (for when index === 3, Specs tab active)
  const notchedPath = getNotchedPath(tabCenters[3]);

  useEffect(() => {
    // Scroll Spy & Auto Hide/Reveal on Scroll
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 1. Navbar Visibility logic (auto-hide on scroll down, reveal on scroll up)
      if (currentScrollY > 100 && currentScrollY > lastScrollY.current) {
        setIsVisible(false); // scrolling down
      } else {
        setIsVisible(true); // scrolling up
      }
      lastScrollY.current = currentScrollY;

      // 2. Section Tracker logic
      const sectionIds = ['home', 'features', 'camera', 'specs', 'cta'];
      const viewportMiddle = window.scrollY + window.innerHeight * 0.45;

      let activeSection = 'home';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const bottom = rect.bottom + window.scrollY;

        // If the viewport middle is within this section's vertical range, mark it active
        if (viewportMiddle >= top && viewportMiddle <= bottom) {
          activeSection = id;
          break;
        }
      }

      const idx = sectionIds.indexOf(activeSection);
      if (idx !== -1) {
        setActiveIndex(idx);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once initially to capture load state
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string, index: number) => {
    setActiveIndex(index);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      initial={{ y: 100, x: '-50%', opacity: 0 }}
      animate={{ 
        y: isVisible ? 0 : 120, 
        x: '-50%', 
        opacity: isVisible ? 1 : 0 
      }}
      transition={{ type: 'spring', stiffness: 260, damping: 25 }}
      className="fixed bottom-8 left-1/2 z-[999] w-[320px] h-16 pointer-events-auto cursor-default select-none"
    >
      {/* ── GLASSMORPHIC BACKDROP BLUR CONTAINER ── */}
      <div className="absolute inset-0 w-full h-full rounded-[24px] backdrop-blur-xl pointer-events-none" />

      {/* ── CUSTOM PATH-MORPHING SVG BACKGROUND & BORDER ── */}
      <svg
        width="320"
        height="64"
        viewBox="0 0 320 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
      >
        <motion.path
          d={getNotchedPath(tabCenters[activeIndex])}
          animate={{ d: getNotchedPath(tabCenters[activeIndex]) }}
          transition={{ type: 'spring', stiffness: 250, damping: 22 }}
          fill="rgba(12, 12, 16, 0.92)"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1.2"
        />
      </svg>

      {/* ── WAVE NOTCH FLOATING DOT ── */}
      <motion.div
        animate={{ 
          left: tabCenters[activeIndex],
          scale: 1,
          opacity: 1,
          y: -5
        }}
        transition={{ type: 'spring', stiffness: 250, damping: 22 }}
        className="absolute -translate-x-1/2 top-0 z-30 w-2.5 h-2.5 rounded-full bg-brand-cobalt shadow-[0_0_12px_#1a6bff]"
      />

      {/* ── INTERACTIVE NAV ITEMS LAYOUT ── */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-between px-[10px] z-20">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeIndex === idx;

          return (
            <button
              key={tab.id}
              onClick={() => scrollToSection(tab.id, idx)}
              className="relative w-[56px] h-12 flex flex-col items-center justify-center cursor-pointer select-none outline-none focus:outline-none transition-transform active:scale-95 group"
              aria-label={`Navigate to ${tab.label}`}
            >
              <motion.div
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="pointer-events-none"
              >
                <Icon 
                  className={clsx(
                    "w-[21px] h-[21px] transition-colors duration-300", 
                    isActive 
                      ? "text-brand-cobalt filter drop-shadow-[0_0_6px_rgba(26,107,255,0.6)]" 
                      : "text-white/40 group-hover:text-white/80"
                  )} 
                />
              </motion.div>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
