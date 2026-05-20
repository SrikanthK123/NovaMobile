import { useRef, useEffect, useState } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import SplitType from 'split-type';
import MagneticButton from '../ui/MagneticButton';
import { Globe, Zap, ShieldAlert, Award } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export default function CTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);

  // Resize canvas to cover viewport size
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Split-text animation
  useEffect(() => {
    if (!textRef.current) return;

    const split = new SplitType(textRef.current, { types: 'words' });

    const ctx = gsap.context(() => {
      gsap.from(split.words, {
        y: 40,
        opacity: 0,
        stagger: 0.08,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        }
      });
    }, containerRef);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 600);

    return () => {
      ctx.revert();
      split.revert();
      clearTimeout(timer);
    };
  }, []);

  // Main Canvas Spark Particle Animation Loop
  const tick = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update & draw particles
    const list = particles.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96; // drag friction
      p.vy *= 0.96;
      p.life--;

      if (p.life <= 0) {
        list.splice(i, 1);
        continue;
      }

      // Draw glowing sparks
      const ratio = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * ratio, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10 * ratio;
      ctx.shadowColor = p.color === '#ffffff' ? 'rgba(255,255,255,0.8)' : 'rgba(26,107,255,0.8)';
      ctx.fill();
    }

    if (list.length > 0) {
      animationFrameId.current = requestAnimationFrame(tick);
    } else {
      animationFrameId.current = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Spark Spawner: Spawn 120 blue/white sparks centered at the button coordinates
  const triggerSparks = () => {
    const canvas = canvasRef.current;
    const button = buttonRef.current;
    if (!canvas || !button) return;

    const canvasRect = canvas.getBoundingClientRect();
    const btnRect = button.getBoundingClientRect();

    const originX = btnRect.left - canvasRect.left + btnRect.width / 2;
    const originY = btnRect.top - canvasRect.top + btnRect.height / 2;

    const colorsList = ['#ffffff', '#1a6bff', '#5ea1ff', '#aaccff'];

    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8; // Random velocities
      const maxLife = 30 + Math.floor(Math.random() * 50);

      particles.current.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: maxLife,
        maxLife,
        color: colorsList[Math.floor(Math.random() * colorsList.length)],
        size: 1.5 + Math.random() * 2.5
      });
    }

    // Start tick loop if not already running
    if (!animationFrameId.current) {
      animationFrameId.current = requestAnimationFrame(tick);
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <section 
      id="cta" 
      ref={containerRef} 
      className="relative min-h-screen py-20 md:py-0 bg-[#020204] flex flex-col items-center justify-center px-6 md:px-10 overflow-hidden"
    >
      {/* Sparkles Canvas overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Scarcity alert panel */}
      <div className="mb-8 px-4 py-1.5 bg-red-950/20 border border-red-500/30 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.08)] select-none">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shadow-[0_0_8px_#ef4444]" />
        <span className="text-[8px] md:text-[9px] font-mono tracking-[3px] text-red-400 font-extrabold uppercase flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5" /> SCARCITY ALERT: ONLY 12 ITEMS REMAINING IN BATCH #08
        </span>
      </div>

      <h2 
        ref={textRef}
        className="text-[10vw] sm:text-[7vw] md:text-[6vw] font-display font-extrabold leading-tight text-center uppercase tracking-tighter w-full max-w-[95vw] px-4 text-white relative select-none"
      >
        Own the Future Now.
      </h2>

      {/* Preorder Button Wrapper with triggers */}
      <div 
        className="mt-10 md:mt-12 z-20"
        onMouseEnter={triggerSparks}
      >
        <button
          ref={buttonRef}
          className="px-10 py-4.5 md:px-14 md:py-5.5 bg-white text-brand-obsidian rounded-full font-display font-black text-base md:text-lg hover:bg-brand-cobalt hover:text-white transition-all duration-300 hover:scale-105 shadow-[0_10px_40px_rgba(255,255,255,0.08)] hover:shadow-[0_0_50px_rgba(26,107,255,0.5)] uppercase tracking-[1px]"
        >
          ORDER NOVA
        </button>
      </div>

      {/* Upgraded Sleek Trust Badges Row */}
      <div className="relative md:absolute md:bottom-8 lg:bottom-12 max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-16 px-6 z-25 text-center mt-16 md:mt-0 select-none">
        
        {/* Badge 1 */}
        <div className="flex flex-col items-center space-y-1.5 p-3 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-md">
          <Globe className="w-5 h-5 text-brand-cobalt" />
          <span className="text-[8px] md:text-[9px] font-mono tracking-[4px] text-white/50 uppercase font-black">
            SHIPS GLOBALLY
          </span>
          <span className="text-[6.5px] font-mono tracking-[2px] text-white/30 uppercase">
            Priority Air Freight
          </span>
        </div>

        {/* Badge 2 */}
        <div className="flex flex-col items-center space-y-1.5 p-3 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-md">
          <Zap className="w-5 h-5 text-[#ffaa00]" />
          <span className="text-[8px] md:text-[9px] font-mono tracking-[4px] text-white/50 uppercase font-black">
            FREE PRIORITY ACCESS
          </span>
          <span className="text-[6.5px] font-mono tracking-[2px] text-white/30 uppercase">
            Early Backer Allocation
          </span>
        </div>

        {/* Badge 3 */}
        <div className="flex flex-col items-center space-y-1.5 p-3 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-md">
          <Award className="w-5 h-5 text-emerald-500" />
          <span className="text-[8px] md:text-[9px] font-mono tracking-[4px] text-white/50 uppercase font-black">
            2 YEAR WARRANTY
          </span>
          <span className="text-[6.5px] font-mono tracking-[2px] text-white/30 uppercase">
            Full Replacement Guard
          </span>
        </div>

      </div>
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-brand-cobalt/10 rounded-full blur-[150px] pointer-events-none z-0" />
    </section>
  );
}
