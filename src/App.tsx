/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { motion, useScroll, useTransform } from 'motion/react';
import { gsap, ScrollTrigger } from './lib/gsap';

// Global Enhancers & UI
import CursorCircle from './components/ui/CursorCircle';
import InteractiveNavbar from './components/ui/InteractiveNavbar';
import AmbientSound from './components/ui/AmbientSound';
import ParallaxStars from './components/ui/ParallaxStars';
import NovaIntro from './components/ui/NovaIntro';
import TransitionWipes from './components/ui/TransitionWipes';

// Cinematic Sections
import Unboxing from './components/sections/Unboxing';
import Hero from './components/sections/Hero';
import Features from './components/sections/Features';
import NeuralEngine from './components/sections/NeuralEngine';
import DragReveal from './components/sections/DragReveal';
import CameraDeepDive from './components/sections/Camera';
import NovaOSShowcase from './components/sections/NovaOSShowcase';
import PhoneRotator from './components/sections/PhoneRotator';
import SpeedBenchmark from './components/sections/SpeedBenchmark';
import Specs from './components/sections/Specs';
import Colors from './components/sections/Colors';
import PreorderCountdown from './components/sections/PreorderCountdown';
import PressMarquee from './components/sections/PressMarquee';
import Testimonials from './components/sections/Testimonials';
import CTA from './components/sections/CTA';

export default function App() {
  const { scrollYProgress } = useScroll();
  const [introComplete, setIntroComplete] = useState(false);
  const [unboxingComplete, setUnboxingComplete] = useState(false);
  const [introPlayed, setIntroPlayed] = useState(false);

  // Lock scroll while intro loader or cinematic unboxing is running
  useEffect(() => {
    if (!unboxingComplete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [unboxingComplete]);
  
  // Fade out global footer overlay based on scroll progress
  const footerVisibility = useTransform(scrollYProgress, [0.02, 0.05], [1, 0]);

  useEffect(() => {
    // Disable virtual inertia scroll on mobile devices to prevent touch latency.
    // Touch viewports have native hardware scroll inertia.
    if (window.innerWidth < 768) {
      return;
    }

    // Initialize premium Lenis Smooth Scroll with customized easeOutExpo physics
    const lenis = new Lenis({
      duration: 1.4,
      lerp: 0.08,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo mathematical formula
      smoothWheel: true,
    });

    // Synchronize ScrollTrigger with Lenis updates
    lenis.on('scroll', ScrollTrigger.update);

    // Frame-rate update loop
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off('scroll', ScrollTrigger.update);
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-[#020204] overflow-x-clip">
      
      {/* ── GLOBAL DECORATIVE & DYNAMIC UI ── */}
      <ParallaxStars />
      <CursorCircle />
      <InteractiveNavbar />
      <AmbientSound />
      <TransitionWipes />
      
      <Unboxing active={introComplete} onComplete={() => setUnboxingComplete(true)} />
      <Hero active={unboxingComplete} />
      
      <div className="relative z-[10]">
        <Features />
        <NeuralEngine />
        <DragReveal />
        <CameraDeepDive />
        <NovaOSShowcase />
        <PhoneRotator />
        <SpeedBenchmark />
        <Specs />
        <Colors />
        <PreorderCountdown />
        <PressMarquee />
        <Testimonials />
        <CTA />
      </div>

      {/* ── GLOBAL HEADER OVERLAY ── */}
      <header className="fixed top-0 left-0 w-full p-6 md:p-10 z-[100] pointer-events-none select-none mix-blend-difference flex justify-between items-start">
        <div className="space-y-1">
          <h4 
            className="logo-nova navbar-logo text-xl md:text-2xl font-display font-extrabold leading-none text-white tracking-[2px]"
            style={{ opacity: introPlayed ? 1 : 0 }}
          >
            NOVA
          </h4>
          <p 
            className="navbar-subtitle text-[7px] md:text-[8px] tracking-[4px] uppercase text-white"
            style={{ opacity: introPlayed ? 0.5 : 0 }}
          >
            Beyond Perception
          </p>
        </div>
      </header>

      {/* ── GLOBAL FOOTER OVERLAY ── */}
      <motion.footer 
        style={{ opacity: footerVisibility }}
        className="fixed bottom-0 left-0 w-full p-10 z-[100] pointer-events-none mix-blend-difference hidden md:flex justify-between items-end select-none"
      >
         <div className="space-y-1">
           <h4 className="text-lg md:text-xl font-display font-extrabold leading-none text-white">NOVA</h4>
           <p className="text-[7px] md:text-[8px] tracking-[4px] md:tracking-[6px] opacity-50 uppercase text-white">Beyond Perception</p>
         </div>
         <div className="text-[7px] md:text-[8px] tracking-[3px] md:tracking-[5px] opacity-50 uppercase text-white font-mono">
           © 2026 NOVA CORP / ALL RIGHTS RESERVED
         </div>
      </motion.footer>

      <NovaIntro 
        onComplete={() => {
          setIntroComplete(true);
          setIntroPlayed(true);
          setUnboxingComplete(true);
        }} 
      />
    </main>
  );
}
