'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import { gsap, ScrollTrigger } from '../../lib/gsap';

// ─────────────────────────────────────────────────────────
// FONTS & KEYFRAMES INJECTED LOCALLY FOR 100% ISOLATION
// ─────────────────────────────────────────────────────────
const SCOPED_CSS = `
  @import url('https://fonts.cdnfonts.com/css/clash-display');
  @import url('https://fonts.cdnfonts.com/css/cabinet-grotesk');

  .gaming-font-display {
    font-family: 'Clash Display', 'Syne', sans-serif !important;
  }
  .gaming-font-sans {
    font-family: 'Cabinet Grotesk', 'Space Grotesk', sans-serif !important;
  }

  @keyframes pulseScale {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.6); opacity: 0.3; }
  }

  @keyframes rotateCW {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes rotateCCW {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(-360deg); }
  }

  @keyframes slideDot {
    0%, 100% { left: 85%; }
    50% { left: 20%; }
  }

  @keyframes arrowBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(4px); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes digitFlipOut {
    from { transform: rotateX(0deg); opacity: 1; }
    to { transform: rotateX(-90deg); opacity: 0; }
  }

  @keyframes digitFlipIn {
    from { transform: rotateX(90deg); opacity: 0; }
    to { transform: rotateX(0deg); opacity: 1; }
  }

  @keyframes floatBadge1 {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(8px); }
  }
  @keyframes floatBadge2 {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }
  @keyframes floatBadge3 {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(10px); }
  }

  /* Scoped layout fixes */
  .gaming-text-outline {
    -webkit-text-stroke: 1px rgba(255, 255, 255, 0.15);
    color: transparent;
  }

  .animate-fan-spin {
    animation: rotateCW 15s linear infinite;
  }

  .temp-dot {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    background-color: #ffffff;
    border-radius: 50%;
    box-shadow: 0 0 8px #ffffff;
    animation: slideDot 4s ease-in-out infinite;
  }
`;

// ─────────────────────────────────────────────────────────
// WIDGET A — FLIP CLOCK DIGIT (3D TRANSFORMS)
// ─────────────────────────────────────────────────────────
interface FlipDigitProps {
  digit: string;
}

function FlipDigit({ digit }: FlipDigitProps) {
  const [current, setCurrent] = useState(digit);
  const [next, setNext] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (digit !== current) {
      setNext(digit);
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setCurrent(digit);
        setIsFlipping(false);
      }, 400); // 200ms ease-in + 200ms ease-out
      return () => clearTimeout(timer);
    }
  }, [digit, current]);

  return (
    <div 
      className="relative w-12 h-20 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-center overflow-hidden" 
      style={{ perspective: '300px' }}
    >
      <div 
        className="absolute inset-0 flex items-center justify-center gaming-font-display font-extrabold text-white text-4xl leading-none" 
        style={{ transformStyle: 'preserve-3d' }}
      >
        {isFlipping ? (
          <>
            <span
              className="absolute inset-0 flex items-center justify-center select-none"
              style={{
                transformOrigin: 'center center',
                animation: 'digitFlipOut 200ms ease-in forwards',
                backfaceVisibility: 'hidden',
              }}
            >
              {current}
            </span>
            <span
              className="absolute inset-0 flex items-center justify-center select-none"
              style={{
                transformOrigin: 'center center',
                animation: 'digitFlipIn 200ms ease-out 200ms forwards',
                transform: 'rotateX(90deg)',
                opacity: 0,
                backfaceVisibility: 'hidden',
              }}
            >
              {next}
            </span>
          </>
        ) : (
          <span>{current}</span>
        )}
      </div>
      {/* Faint horizontal flip clock divider line */}
      <div className="absolute top-1/2 left-0 w-full h-[0.5px] bg-white/10 z-10" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// WIDGET B — LIVE COUNTDOWN TIMER
// ─────────────────────────────────────────────────────────
interface CountdownUnit {
  days: string;
  hours: string;
  mins: string;
  secs: string;
}

function LiveCountdown() {
  const targetDate = useMemo(() => new Date('2026-09-01T00:00:00'), []);
  const [timeLeft, setTimeLeft] = useState<CountdownUnit>({
    days: '00', hours: '00', mins: '00', secs: '00'
  });

  useEffect(() => {
    const calculateTime = () => {
      const diff = targetDate.getTime() - new Date().getTime();
      if (diff <= 0) {
        return { days: '00', hours: '00', mins: '00', secs: '00' };
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      return {
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        mins: String(mins).padStart(2, '0'),
        secs: String(secs).padStart(2, '0')
      };
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex flex-col items-center">
      <span className="gaming-font-sans text-[10px] tracking-[6px] text-white/50 uppercase mb-5">
        TIME REMAINING
      </span>
      <div className="flex items-center gap-2 md:gap-4 select-none">
        {/* Days */}
        <div className="flex flex-col items-center">
          <div className="flex gap-1">
            <FlipDigit digit={timeLeft.days[0]} />
            <FlipDigit digit={timeLeft.days[1]} />
          </div>
          <span className="gaming-font-sans text-[9px] tracking-[3px] text-white/50 mt-2 uppercase">DAYS</span>
        </div>

        {/* Separator */}
        <span 
          className="gaming-font-display text-2xl md:text-3xl text-[#1a6bff] self-start mt-5"
          style={{ animation: 'pulseScale 1.5s infinite' }}
        >
          :
        </span>

        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className="flex gap-1">
            <FlipDigit digit={timeLeft.hours[0]} />
            <FlipDigit digit={timeLeft.hours[1]} />
          </div>
          <span className="gaming-font-sans text-[9px] tracking-[3px] text-white/50 mt-2 uppercase">HRS</span>
        </div>

        {/* Separator */}
        <span 
          className="gaming-font-display text-2xl md:text-3xl text-[#1a6bff] self-start mt-5"
          style={{ animation: 'pulseScale 1.5s infinite' }}
        >
          :
        </span>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className="flex gap-1">
            <FlipDigit digit={timeLeft.mins[0]} />
            <FlipDigit digit={timeLeft.mins[1]} />
          </div>
          <span className="gaming-font-sans text-[9px] tracking-[3px] text-white/50 mt-2 uppercase">MINS</span>
        </div>

        {/* Separator */}
        <span 
          className="gaming-font-display text-2xl md:text-3xl text-[#1a6bff] self-start mt-5"
          style={{ animation: 'pulseScale 1.5s infinite' }}
        >
          :
        </span>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className="flex gap-1">
            <FlipDigit digit={timeLeft.secs[0]} />
            <FlipDigit digit={timeLeft.secs[1]} />
          </div>
          <span className="gaming-font-sans text-[9px] tracking-[3px] text-white/50 mt-2 uppercase">SECS</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CONFETTI SYSTEM (TRIGGERS ON WAITLIST SUCCESS)
// ─────────────────────────────────────────────────────────
interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

function ConfettiCanvas({ active, onComplete }: { active: boolean; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Burst from button center (which is roughly centered horizontally and slightly below half vertical)
    const startX = canvas.width / 2;
    const startY = canvas.height / 2;

    const particles: ConfettiParticle[] = [];
    const colors = ['#00c864', '#1a6bff', '#ffffff', '#7c3aed'];

    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // slightly bias upward
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
      });
    }

    let rAFId: number;
    let frames = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.vx *= 0.96; // friction
        p.alpha -= 0.015;

        if (p.alpha > 0) {
          alive = true;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0');
          ctx.fill();
        }
      });

      frames++;
      if (alive && frames < 120) {
        rAFId = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    rAFId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rAFId);
  }, [active, onComplete]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-55"
    />
  );
}

// ─────────────────────────────────────────────────────────
// WAITLIST FORM COMPONENT
// ─────────────────────────────────────────────────────────
function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [confettiActive, setConfettiActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address');
      setStatus('error');
      return;
    }

    setStatus('loading');

    setTimeout(() => {
      setStatus('success');
      setConfettiActive(true);
    }, 1500);
  };

  return (
    <div className="relative w-full max-w-[520px] mx-auto flex flex-col items-center">
      <ConfettiCanvas active={confettiActive} onComplete={() => setConfettiActive(false)} />
      
      <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-row gap-3 items-center mt-6">
        <div className="relative flex-1 w-full">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') {
                setStatus('idle');
                setErrorMsg('');
              }
            }}
            placeholder="your@email.com"
            disabled={status === 'loading' || status === 'success'}
            className={`w-full h-14 bg-white/[0.04] border rounded-[28px] px-6 gaming-font-sans text-[14px] text-white outline-none transition-all duration-300
              ${status === 'error' 
                ? 'border-[#ff4444] focus:border-[#ff4444] bg-[#ff4444]/[0.04] shadow-[0_0_0_3px_rgba(255,68,68,0.12)]' 
                : 'border-white/10 focus:border-[#1a6bff] focus:bg-[#1a6bff]/[0.06] focus:shadow-[0_0_0_3px_rgba(26,107,255,0.12)]'
              }
            `}
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className={`h-14 font-semibold shrink-0 cursor-pointer gaming-font-sans text-[12px] tracking-[3px] transition-all duration-300 ease-in-out relative flex items-center justify-center
            ${status === 'loading' 
              ? 'w-14 rounded-full p-0 bg-[#1a6bff] shadow-[0_0_30px_rgba(26,107,255,0.4)]' 
              : status === 'success'
              ? 'px-8 rounded-[28px] bg-[#00c864]/10 border border-[#00c864] text-[#00c864] shadow-[0_0_30px_rgba(0,200,100,0.2)]'
              : 'px-8 rounded-[28px] bg-[#1a6bff] text-white border-none shadow-[0_0_30px_rgba(26,107,255,0.4)] hover:bg-[#2575ff] hover:shadow-[0_0_50px_rgba(26,107,255,0.6)] hover:-translate-y-[1px] active:translate-y-[1px] active:shadow-[0_0_20px_rgba(26,107,255,0.3)]'
            }
          `}
        >
          {status === 'loading' ? (
            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-[spin_0.8s_linear_infinite]" />
          ) : status === 'success' ? (
            <span>✓ YOU'RE ON THE LIST</span>
          ) : (
            <span>JOIN THE LIST</span>
          )}
        </button>
      </form>

      {/* Error message */}
      <div 
        className={`w-full text-left mt-2 pl-6 transition-all duration-350 overflow-hidden
          ${status === 'error' ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <span className="text-[12px] text-[#ff6644] font-medium">{errorMsg}</span>
      </div>

      {/* Social Proof */}
      <div className="flex items-center gap-2.5 mt-8 select-none">
        <div className="flex items-center">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#1a6bff] to-[#7c3aed] border-2 border-[#04040a]" />
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#ff6644] border-2 border-[#04040a] -ml-2" />
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ff6644] to-[#1a6bff] border-2 border-[#04040a] -ml-2" />
        </div>
        <p className="gaming-font-sans text-[12px] text-white/50">
          <span className="text-white/90 font-semibold">847,293</span> people already joined
        </p>
      </div>

      {/* Trust row */}
      <div className="flex items-center gap-6 mt-6 select-none border-t border-white/[0.04] pt-5 w-full justify-center">
        <div className="flex items-center gap-2">
          <span className="text-xs">🔒</span>
          <span className="gaming-font-sans text-[10px] tracking-[2px] text-white/50 uppercase">Secure & Private</span>
        </div>
        <div className="w-px h-3.5 bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-xs">⚡</span>
          <span className="gaming-font-sans text-[10px] tracking-[2px] text-white/50 uppercase">Early Access Perks</span>
        </div>
        <div className="w-px h-3.5 bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-xs">🎮</span>
          <span className="gaming-font-sans text-[10px] tracking-[2px] text-white/50 uppercase">Exclusive Launch Price</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// AMBIENT PARTICLE ENGINE CLASS
// ─────────────────────────────────────────────────────────
class Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedX: number;
  speedY: number;
  color: string;
  isExplosion: boolean;

  constructor(w: number, h: number, isExplosion = false) {
    this.isExplosion = isExplosion;
    
    if (isExplosion) {
      this.x = w / 2;
      this.y = h / 2;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8; // varying speed
      this.speedX = Math.cos(angle) * speed;
      this.speedY = Math.sin(angle) * speed;
      this.size = 1 + Math.random() * 2; // 1-3px
      this.opacity = 0.8 + Math.random() * 0.2;
    } else {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = 0.5 + Math.random() * 2.0; // 0.5-2.5px
      this.opacity = 0.1 + Math.random() * 0.4;
      this.speedX = -0.2 + Math.random() * 0.4;
      this.speedY = -0.3 - Math.random() * 0.2; // drift upward
    }

    const colors = ['#1a6bff', '#ffffff', '#7c3aed'];
    const r = Math.random();
    if (r < 0.6) this.color = colors[0];
    else if (r < 0.9) this.color = colors[1];
    else this.color = colors[2];
  }

  update(w: number, h: number) {
    if (this.isExplosion) {
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedX *= 0.95; // friction
      this.speedY *= 0.95;
      this.opacity -= 0.01;

      // settle into drifting ambient field
      if (Math.abs(this.speedX) < 0.3 && Math.abs(this.speedY) < 0.3) {
        this.isExplosion = false;
        this.speedX = -0.2 + Math.random() * 0.4;
        this.speedY = -0.3 - Math.random() * 0.2;
        this.opacity = 0.1 + Math.random() * 0.4;
      }
    } else {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.y < -10) this.y = h;
      if (this.x < 0) this.x = w;
      if (this.x > w) this.x = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    // Convert float to hex alpha
    const alphaHex = Math.max(0, Math.min(255, Math.round(this.opacity * 255))).toString(16).padStart(2, '0');
    ctx.fillStyle = this.color + alphaHex;
    ctx.fill();
  }
}

// ─────────────────────────────────────────────────────────
// MAIN GAME CINEMATIC SECTION
// ─────────────────────────────────────────────────────────
export default function GamingSeriesCinematic() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveformContainerRef = useRef<HTMLDivElement | null>(null);
  const triggersGSAPRef = useRef<any[]>([]);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tiltRAFRef = useRef<number | null>(null);
  const particleRAFRef = useRef<number | null>(null);

  const baseUrl = import.meta.env.BASE_URL || "/";
  const p1Image = `${baseUrl}images/NOVA GamingTrigger.png`;
  const p2Image = `${baseUrl}images/NOVA-Coolfan.png`;
  const p3Image = `${baseUrl}images/NOVA EarBuds.png`;

  const [inViewport, setInViewport] = useState(false);
  const [activeDot, setActiveDot] = useState<number>(-1);

  // Framer Motion Scroll targets
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Track active progress dot based on scroll
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v >= 0.20 && v < 0.37) setActiveDot(0);
    else if (v >= 0.37 && v < 0.58) setActiveDot(1);
    else if (v >= 0.58 && v < 0.76) setActiveDot(2);
    else setActiveDot(-1);
  });

  // ─────────────────────────────────────────────────────────
  // PARTICLE ENGINE SYSTEM SETUP & SCROLL TRIGGER EXPLOSION
  // ─────────────────────────────────────────────────────────
  const particlesRef = useRef<Particle[]>([]);
  const isExplodedRef = useRef(false);

  // Particle burst helper
  const triggerParticleExplosion = (w: number, h: number) => {
    // Add 300 explosion particles from center
    for (let i = 0; i < 300; i++) {
      particlesRef.current.push(new Particle(w, h, true));
    }
  };

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (v >= 0.10 && v <= 0.12) {
      if (!isExplodedRef.current) {
        triggerParticleExplosion(canvas.width, canvas.height);
        isExplodedRef.current = true;
      }
    } else if (v < 0.08 || v > 0.15) {
      isExplodedRef.current = false;
    }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Initial particles (scale based on screen size)
    const screenWidth = window.innerWidth;
    const maxParticles = screenWidth < 640 ? 80 : screenWidth < 1024 ? 150 : 250;
    
    particlesRef.current = [];
    for (let i = 0; i < maxParticles; i++) {
      particlesRef.current.push(new Particle(canvas.width, canvas.height));
    }

    let isVisible = false;

    const loop = () => {
      if (!isVisible) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Keep particles count from exploding infinitely
      if (particlesRef.current.length > 600) {
        particlesRef.current = particlesRef.current.slice(-500);
      }

      particlesRef.current.forEach((p) => {
        p.update(canvas.width, canvas.height);
        p.draw(ctx);
      });

      particleRAFRef.current = requestAnimationFrame(loop);
    };

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          if (!particleRAFRef.current) {
            particleRAFRef.current = requestAnimationFrame(loop);
          }
        } else {
          if (particleRAFRef.current) {
            cancelAnimationFrame(particleRAFRef.current);
            particleRAFRef.current = null;
          }
        }
      });
    }, { threshold: 0.01 });

    obs.observe(canvas);

    return () => {
      window.removeEventListener('resize', handleResize);
      obs.disconnect();
      if (particleRAFRef.current) cancelAnimationFrame(particleRAFRef.current);
    };
  }, []);

  // ─────────────────────────────────────────────────────────
  // AUDIO EQUALIZER ANIMATION (PRODUCT 3 WIDGET)
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    const container = waveformContainerRef.current;
    if (!container) return;

    const bars = container.querySelectorAll('.waveform-bar');
    if (bars.length === 0) return;

    const baseHeights = [6, 12, 18, 24, 18, 30, 24, 18, 12, 18, 24, 12];
    const freqs = [2.2, 3.1, 2.7, 3.8, 2.0, 3.4, 2.9, 3.6, 2.4, 3.2, 2.6, 3.5];
    const phases = [0, 0.5, 1.1, 1.8, 2.3, 2.9, 3.4, 4.0, 4.5, 5.1, 5.7, 6.2];
    const amps = [4, 6, 5, 8, 4, 7, 6, 8, 5, 6, 7, 5];

    let rAFId: number | null = null;
    let isVisible = false;

    const tick = (timestamp: number) => {
      if (!isVisible) return;
      const t = timestamp / 1000;

      // Adjust bar count on mobile (<640px we hide last 6 bars via CSS grid, but animate all just in case)
      bars.forEach((bar, idx) => {
        const el = bar as HTMLElement;
        const base = baseHeights[idx];
        const freq = freqs[idx];
        const phase = phases[idx];
        const amp = amps[idx];
        const h = base + Math.sin(t * freq + phase) * amp;
        el.style.height = `${Math.max(3, h)}px`;
      });

      rAFId = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          if (!rAFId) rAFId = requestAnimationFrame(tick);
        } else {
          if (rAFId) {
            cancelAnimationFrame(rAFId);
            rAFId = null;
          }
        }
      });
    }, { threshold: 0.1 });

    observer.observe(container);

    return () => {
      observer.disconnect();
      if (rAFId) cancelAnimationFrame(rAFId);
    };
  }, []);

  // ─────────────────────────────────────────────────────────
  // GSAP LAUNCH DATE COUNT-UP (ONCE EXECUTED)
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top -78%', // when user scrolls past 78% (entrance of countdown)
      onEnter: () => {
        // Animate Day 00 -> 01
        const dayObj = { val: 0 };
        gsap.to(dayObj, {
          val: 1,
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: () => {
            const el = document.getElementById('gsap-day-count');
            if (el) el.innerText = String(Math.floor(dayObj.val)).padStart(2, '0');
          }
        });

        // Animate Year 2000 -> 2026
        const yearObj = { val: 2000 };
        gsap.to(yearObj, {
          val: 2026,
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: () => {
            const el = document.getElementById('gsap-year-count');
            if (el) el.innerText = String(Math.floor(yearObj.val));
          }
        });

        // Fade in month
        const monthEl = document.getElementById('gsap-month-count');
        if (monthEl) {
          monthEl.style.opacity = '0';
          monthEl.style.transition = 'opacity 1.2s ease-out';
          requestAnimationFrame(() => {
            monthEl.style.opacity = '1';
          });
        }
      },
      once: true,
    });

    triggersGSAPRef.current.push(trigger);
    return () => {
      trigger.kill();
    };
  }, []);

  // ─────────────────────────────────────────────────────────
  // INTERSECTION OBSERVER FOR MOUNTING/UNMOUNTING FIXED DOTS
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        setInViewport(entry.isIntersecting);
      });
    }, { threshold: 0.01 });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // ─────────────────────────────────────────────────────────
  // INTERACTIVE MOUSE-DRIVEN 3D IMAGE TILT WITH SMOOTH LERP
  // ─────────────────────────────────────────────────────────
  const tiltRef = useRef({ currentX: 0, currentY: 0, targetX: 0, targetY: 0 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const nx = (x - xc) / xc;
    const ny = (y - yc) / yc;

    // rotation factor max 8 degrees
    tiltRef.current.targetX = -ny * 8;
    tiltRef.current.targetY = nx * 8;

    if (!tiltRAFRef.current) {
      const loop = () => {
        const { currentX, currentY, targetX, targetY } = tiltRef.current;
        const nextX = currentX + (targetX - currentX) * 0.08; // 0.08 lerp factor
        const nextY = currentY + (targetY - currentY) * 0.08;

        tiltRef.current.currentX = nextX;
        tiltRef.current.currentY = nextY;

        const el = e.currentTarget.querySelector('.tilt-target') as HTMLElement;
        if (el) {
          el.style.transform = `perspective(1000px) rotateX(${nextX}deg) rotateY(${nextY}deg)`;
        }

        if (Math.abs(targetX - nextX) > 0.01 || Math.abs(targetY - nextY) > 0.01) {
          tiltRAFRef.current = requestAnimationFrame(loop);
        } else {
          tiltRAFRef.current = null;
        }
      };
      tiltRAFRef.current = requestAnimationFrame(loop);
    }
  };

  const onMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    tiltRef.current.targetX = 0;
    tiltRef.current.targetY = 0;
  };

  // ─────────────────────────────────────────────────────────
  // MAGNETIC HOVER ON NOTIFY ME BUTTONS (LERP 0.15, RADIUS 80PX)
  // ─────────────────────────────────────────────────────────
  const magneticRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const cleanups: (() => void)[] = [];

    magneticRefs.current.forEach((btn) => {
      if (!btn) return;

      let currentX = 0;
      let currentY = 0;
      let targetX = 0;
      let targetY = 0;
      let rAFId: number | null = null;

      const onMouseMove = (e: MouseEvent) => {
        const rect = btn.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;

        const dx = e.clientX - btnCenterX;
        const dy = e.clientY - btnCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 80) {
          const angle = Math.atan2(dy, dx);
          const shift = (1 - dist / 80) * 8; // Max 8px shift
          targetX = Math.cos(angle) * shift;
          targetY = Math.sin(angle) * shift;
        } else {
          targetX = 0;
          targetY = 0;
        }
      };

      const tick = () => {
        currentX += (targetX - currentX) * 0.15; // 0.15 lerp factor
        currentY += (targetY - currentY) * 0.15;
        btn.style.transform = `translate(${currentX}px, ${currentY}px)`;
        rAFId = requestAnimationFrame(tick);
      };

      window.addEventListener('mousemove', onMouseMove);
      rAFId = requestAnimationFrame(tick);

      cleanups.push(() => {
        window.removeEventListener('mousemove', onMouseMove);
        if (rAFId) cancelAnimationFrame(rAFId);
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [inViewport]); // rebinding when mounted

  // ─────────────────────────────────────────────────────────
  // SCROLL-TIMED FRAMER MOTION TRANSFORMS
  // ─────────────────────────────────────────────────────────

  // -- SCENE TRANSITION WIPES --
  // Safe circular wipes that are fully transparent (circle(0%)) when outside transition range, preventing double-screen blackout
  const iris1Clip = useTransform(
    scrollYProgress,
    [0.10, 0.11, 0.125, 0.14, 0.15],
    ["circle(0% at 50% 50%)", "circle(100% at 50% 50%)", "circle(0% at 50% 50%)", "circle(100% at 50% 50%)", "circle(0% at 50% 50%)"]
  );
  const wipe1Clip = useTransform(scrollYProgress, [0.30, 0.33, 0.36], ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)", "inset(0% 0% 0% 100%)"]);
  const wipe2Clip = useTransform(scrollYProgress, [0.51, 0.54, 0.57], ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)", "inset(0% 0% 0% 100%)"]);
  const iris2Clip = useTransform(
    scrollYProgress,
    [0.73, 0.74, 0.76, 0.78, 0.79],
    ["circle(0% at 50% 50%)", "circle(100% at 50% 50%)", "circle(0% at 50% 50%)", "circle(100% at 50% 50%)", "circle(0% at 50% 50%)"]
  );

  // Dynamic Background Gradient Shifts tailored to the active gadget
  const bgGlowGradient = useTransform(
    scrollYProgress,
    [0.0, 0.24, 0.47, 0.68, 0.85],
    [
      "radial-gradient(circle at 50% 50%, rgba(26, 107, 255, 0.15) 0%, rgba(4, 4, 10, 0) 70%)",  // Blue
      "radial-gradient(circle at 50% 50%, rgba(26, 107, 255, 0.15) 0%, rgba(4, 4, 10, 0) 70%)",  // Blue (P1)
      "radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.15) 0%, rgba(4, 4, 10, 0) 70%)",   // Cyan/Teal (P2)
      "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, rgba(4, 4, 10, 0) 70%)",  // Purple/Violet (P3)
      "radial-gradient(circle at 50% 50%, rgba(26, 107, 255, 0.08) 0%, rgba(4, 4, 10, 0) 70%)",  // Deep Blue (CTA)
    ]
  );

  // -- 1. CINEMATIC OPENING (0% -> 12%) --
  const pixelScale = useTransform(scrollYProgress, [0.0, 0.03], [0, 1]);
  const lineWidth = useTransform(scrollYProgress, [0.03, 0.06], ["2px", "200px"]);
  const lineColor = useTransform(scrollYProgress, [0.0, 0.03, 0.06], ["#ffffff", "#ffffff", "#1a6bff"]);
  const wordmarkOpacity = useTransform(scrollYProgress, [0.03, 0.06], [0, 1]);
  const wordmarkLetterSpacing = useTransform(scrollYProgress, [0.03, 0.06], ["2px", "12px"]);

  const topLineY = useTransform(scrollYProgress, [0.06, 0.10], [0, -60]);
  const bottomLineY = useTransform(scrollYProgress, [0.06, 0.10], [0, 60]);

  // Words Clip reveals
  const clipWordThe = useTransform(scrollYProgress, [0.06, 0.08], ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"]);
  const clipWordArsenal = useTransform(scrollYProgress, [0.07, 0.09], ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"]);
  const clipWordSeries = useTransform(scrollYProgress, [0.08, 0.10], ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"]);

  // Opacity transitions for each word
  const theOpacity = useTransform(scrollYProgress, [0.06, 0.08], [0, 1]);
  const arsenalOpacity = useTransform(scrollYProgress, [0.07, 0.09], [0, 1]);
  const seriesOpacity = useTransform(scrollYProgress, [0.08, 0.10], [0, 1]);

  // Fading out opening headline (scroll 10 -> 12%)
  const openingHeadlineOpacity = useTransform(scrollYProgress, [0.10, 0.12], [1, 0]);

  // Pointer Events maps aligned to midpoint transitions to ensure correct button interactivity
  const p1PointerEvents = useTransform(scrollYProgress, (v) => (v >= 0.11 && v < 0.34) ? "auto" : "none");
  const p2PointerEvents = useTransform(scrollYProgress, (v) => (v >= 0.34 && v < 0.54) ? "auto" : "none");
  const p3PointerEvents = useTransform(scrollYProgress, (v) => (v >= 0.54 && v < 0.72) ? "auto" : "none");
  const ctaPointerEvents = useTransform(scrollYProgress, (v) => (v >= 0.72) ? "auto" : "none");

  // Opacity maps for each stage - OVERLAPPING cross-fades
  const p1Opacity = useTransform(scrollYProgress, [0.11, 0.15, 0.30, 0.38], [0, 1, 1, 0]);
  const p2Opacity = useTransform(scrollYProgress, [0.30, 0.38, 0.50, 0.58], [0, 1, 1, 0]);
  const p3Opacity = useTransform(scrollYProgress, [0.50, 0.58, 0.68, 0.76], [0, 1, 1, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0.68, 0.76, 0.95, 0.98], [0, 1, 1, 0]);

  // -- 2. PRODUCT 1 — NOVA TRIGGER PRO (scroll 12% → 38%) --
  const p1NumeralY = useTransform(scrollYProgress, [0.12, 0.38], ["-50%", "-60%"]);
  
  // Image Entrance transforms
  const p1ImageX = useTransform(scrollYProgress, [0.12, 0.18, 0.30, 0.38], ["-60vw", "0vw", "0vw", "60vw"]);
  const p1ImageRotY = useTransform(scrollYProgress, [0.12, 0.18], [45, 0]);
  const p1ImageRotZ = useTransform(scrollYProgress, [0.12, 0.18], [-8, -2]);
  const p1ImageScale = useTransform(scrollYProgress, [0.12, 0.18, 0.30, 0.38], [0.7, 1.0, 1.0, 0.8]);
  const p1ImageOpacity = useTransform(scrollYProgress, [0.12, 0.18, 0.30, 0.38], [0, 1, 1, 0]);
  const p1ImageBlur = useTransform(scrollYProgress, [0.12, 0.18], ["20px", "0px"]);

  // Staggered Product 1 content transforms inside new overlapping range
  const p1BadgeOp = useTransform(scrollYProgress, [0.13, 0.15], [0, 1]);
  const p1CatOp = useTransform(scrollYProgress, [0.135, 0.155], [0, 1]);
  const p1NovaClip = useTransform(scrollYProgress, [0.14, 0.16], ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"]);
  const p1NovaOp = useTransform(scrollYProgress, [0.14, 0.16], [0, 1]);
  const p1ModelClip = useTransform(scrollYProgress, [0.145, 0.165], ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"]);
  const p1ModelOp = useTransform(scrollYProgress, [0.145, 0.165], [0, 1]);
  const p1LineScaleX = useTransform(scrollYProgress, [0.15, 0.17], [0, 1]);
  const p1Spec1Op = useTransform(scrollYProgress, [0.155, 0.175], [0, 1]);
  const p1Spec1X = useTransform(scrollYProgress, [0.155, 0.175], [30, 0]);
  const p1Spec2Op = useTransform(scrollYProgress, [0.16, 0.18], [0, 1]);
  const p1Spec2X = useTransform(scrollYProgress, [0.16, 0.18], [30, 0]);
  const p1Spec3Op = useTransform(scrollYProgress, [0.165, 0.185], [0, 1]);
  const p1Spec3X = useTransform(scrollYProgress, [0.165, 0.185], [30, 0]);
  const p1Spec4Op = useTransform(scrollYProgress, [0.17, 0.19], [0, 1]);
  const p1Spec4X = useTransform(scrollYProgress, [0.17, 0.19], [30, 0]);
  const p1LaunchBadgeScale = useTransform(scrollYProgress, [0.175, 0.195], [0, 1]);
  const p1ButtonsOp = useTransform(scrollYProgress, [0.18, 0.20], [0, 1]);

  // Overall exit for Content 1
  const p1ContentX = useTransform(scrollYProgress, [0.12, 0.18, 0.30, 0.38], [80, 0, 0, -80]);
  const p1ContentOp = useTransform(scrollYProgress, [0.12, 0.18, 0.30, 0.38], [0, 1, 1, 0]);

  // -- 3. PRODUCT 2 — NOVA COOLER X1 (scroll 30% → 58%) --
  const p2NumeralY = useTransform(scrollYProgress, [0.30, 0.58], ["-50%", "-40%"]);

  // Fan entrance transforms inside new overlapping range
  const p2ImageX = useTransform(scrollYProgress, [0.30, 0.38, 0.50, 0.58], ["60vw", "0vw", "0vw", "-60vw"]);
  const p2ImageBlur = useTransform(scrollYProgress, [0.30, 0.38], ["40px", "0px"]);
  const p2ImageRotZ = useTransform(scrollYProgress, [0.30, 0.38], [20, 0]);
  const p2ImageScale = useTransform(scrollYProgress, [0.30, 0.38, 0.50, 0.58], [0.7, 1.0, 1.0, 0.8]);
  const p2ImageOpacity = useTransform(scrollYProgress, [0.30, 0.38, 0.50, 0.58], [0, 1, 1, 0]);

  // Content 2 entrances
  const p2ContentX = useTransform(scrollYProgress, [0.30, 0.38, 0.50, 0.58], [-80, 0, 0, 80]);
  const p2ContentOp = useTransform(scrollYProgress, [0.30, 0.38, 0.50, 0.58], [0, 1, 1, 0]);

  const p2BadgeOp = useTransform(scrollYProgress, [0.31, 0.33], [0, 1]);
  const p2CatOp = useTransform(scrollYProgress, [0.315, 0.335], [0, 1]);
  const p2NovaClip = useTransform(scrollYProgress, [0.32, 0.34], ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"]);
  const p2NovaOp = useTransform(scrollYProgress, [0.32, 0.34], [0, 1]);
  const p2ModelClip = useTransform(scrollYProgress, [0.325, 0.345], ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"]);
  const p2ModelOp = useTransform(scrollYProgress, [0.325, 0.345], [0, 1]);
  const p2LineScaleX = useTransform(scrollYProgress, [0.33, 0.35], [0, 1]);
  const p2Spec1Op = useTransform(scrollYProgress, [0.335, 0.355], [0, 1]);
  const p2Spec1X = useTransform(scrollYProgress, [0.335, 0.355], [-30, 0]);
  const p2Spec2Op = useTransform(scrollYProgress, [0.34, 0.36], [0, 1]);
  const p2Spec2X = useTransform(scrollYProgress, [0.34, 0.36], [-30, 0]);
  const p2Spec3Op = useTransform(scrollYProgress, [0.345, 0.365], [0, 1]);
  const p2Spec3X = useTransform(scrollYProgress, [0.345, 0.365], [-30, 0]);
  const p2Spec4Op = useTransform(scrollYProgress, [0.35, 0.37], [0, 1]);
  const p2Spec4X = useTransform(scrollYProgress, [0.35, 0.37], [-30, 0]);
  const p2TempWidgetOp = useTransform(scrollYProgress, [0.355, 0.375], [0, 1]);
  const p2LaunchBadgeScale = useTransform(scrollYProgress, [0.36, 0.38], [0, 1]);
  const p2ButtonsOp = useTransform(scrollYProgress, [0.365, 0.385], [0, 1]);

  // -- 4. PRODUCT 3 — NOVA SOUNDPRO X (scroll 50% → 76%) --
  const p3NumeralY = useTransform(scrollYProgress, [0.50, 0.76], ["-50%", "-60%"]);

  // Earbuds Image entrance transforms with overlapping range (alternating slide from left)
  const p3ImageX = useTransform(scrollYProgress, [0.50, 0.58, 0.68, 0.76], ["-60vw", "0vw", "0vw", "60vw"]);
  const p3LeftBudX = useTransform(scrollYProgress, [0.50, 0.58], ["-30vw", "0vw"]);
  const p3LeftBudY = useTransform(scrollYProgress, [0.50, 0.58], ["-20vh", "0vh"]);
  const p3RightBudX = useTransform(scrollYProgress, [0.50, 0.58], ["30vw", "0vw"]);
  const p3RightBudY = useTransform(scrollYProgress, [0.50, 0.58], ["-20vh", "0vh"]);
  
  const p3ImageScale = useTransform(scrollYProgress, [0.50, 0.58, 0.68, 0.76], [0.7, 1.0, 1.0, 0.7]);
  const p3ImageOpacity = useTransform(scrollYProgress, [0.50, 0.58, 0.68, 0.76], [0, 1, 1, 0]);

  // Content 3 entrances
  const p3ContentX = useTransform(scrollYProgress, [0.50, 0.58, 0.68, 0.76], [80, 0, 0, -80]);
  const p3ContentOp = useTransform(scrollYProgress, [0.50, 0.58, 0.68, 0.76], [0, 1, 1, 0]);

  const p3BadgeOp = useTransform(scrollYProgress, [0.51, 0.53], [0, 1]);
  const p3CatOp = useTransform(scrollYProgress, [0.515, 0.535], [0, 1]);
  const p3NovaClip = useTransform(scrollYProgress, [0.52, 0.54], ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"]);
  const p3NovaOp = useTransform(scrollYProgress, [0.52, 0.54], [0, 1]);
  const p3ModelClip = useTransform(scrollYProgress, [0.525, 0.545], ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"]);
  const p3ModelOp = useTransform(scrollYProgress, [0.525, 0.545], [0, 1]);
  const p3LineScaleX = useTransform(scrollYProgress, [0.53, 0.55], [0, 1]);
  const p3Spec1Op = useTransform(scrollYProgress, [0.535, 0.555], [0, 1]);
  const p3Spec1X = useTransform(scrollYProgress, [0.535, 0.555], [30, 0]);
  const p3Spec2Op = useTransform(scrollYProgress, [0.54, 0.56], [0, 1]);
  const p3Spec2X = useTransform(scrollYProgress, [0.54, 0.56], [30, 0]);
  const p3Spec3Op = useTransform(scrollYProgress, [0.545, 0.565], [0, 1]);
  const p3Spec3X = useTransform(scrollYProgress, [0.545, 0.565], [30, 0]);
  const p3Spec4Op = useTransform(scrollYProgress, [0.55, 0.57], [0, 1]);
  const p3Spec4X = useTransform(scrollYProgress, [0.55, 0.57], [30, 0]);
  const p3WaveformOp = useTransform(scrollYProgress, [0.555, 0.575], [0, 1]);
  const p3LaunchBadgeScale = useTransform(scrollYProgress, [0.56, 0.58], [0, 1]);
  const p3ButtonsOp = useTransform(scrollYProgress, [0.565, 0.585], [0, 1]);

  // -- 5. COUNTDOWN SCENE — "GEAR UP" (scroll 68% → 100%) --
  const gearClip = useTransform(scrollYProgress, [0.68, 0.71], ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"]);
  const gearOp = useTransform(scrollYProgress, [0.68, 0.71], [0, 1]);
  const upClip = useTransform(scrollYProgress, [0.69, 0.72], ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"]);
  const upOp = useTransform(scrollYProgress, [0.69, 0.72], [0, 1]);
  const ctaSubtextOp = useTransform(scrollYProgress, [0.70, 0.73], [0, 1]);

  // Product recap cards
  const card1Y = useTransform(scrollYProgress, [0.71, 0.74], [40, 0]);
  const card1Op = useTransform(scrollYProgress, [0.71, 0.74], [0, 1]);
  const card2Y = useTransform(scrollYProgress, [0.72, 0.75], [40, 0]);
  const card2Op = useTransform(scrollYProgress, [0.72, 0.75], [0, 1]);
  const card3Y = useTransform(scrollYProgress, [0.73, 0.76], [40, 0]);
  const card3Op = useTransform(scrollYProgress, [0.73, 0.76], [0, 1]);

  // Launch date Display block
  const dateBlockOp = useTransform(scrollYProgress, [0.74, 0.77], [0, 1]);

  // Countdown timer
  const liveCountdownOp = useTransform(scrollYProgress, [0.75, 0.78], [0, 1]);

  // Waitlist form
  const waitlistFormOp = useTransform(scrollYProgress, [0.76, 0.79], [0, 1]);

  // Countdown Content Exit (going into final outro curtain)
  const ctaContentY = useTransform(scrollYProgress, [0.95, 0.98], [0, -30]);
  const ctaContentOp = useTransform(scrollYProgress, [0.95, 0.98], [1, 0]);

  // -- 6. FINAL SECTION OUTRO (95% -> 100%) --
  const outroLineOp = useTransform(scrollYProgress, [0.96, 0.98, 1.00], [0, 0.2, 0]);
  const outroLaserScaleX = useTransform(scrollYProgress, [0.96, 0.98, 1.00], [0, 1, 0]);

  // Fixed progress dots indicator line progress
  const progressLineScaleY = useTransform(scrollYProgress, [0.20, 0.76], [0, 1]);

  // Mathematical navigation scrolling function
  const handleDotClick = (index: number) => {
    const targets = [0.24, 0.47, 0.68];
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const sectionStart = rect.top + scrollTop;
    const targetY = sectionStart + targets[index] * rect.height;

    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(targetY, { duration: 1.8 });
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

  return (
    <>
      <style>{SCOPED_CSS}</style>

      <section
        id="nova-gaming-cinematic"
        ref={sectionRef}
        className="relative"
        style={{
          height: '700vh',
          background: '#04040a',
          isolation: 'isolate',
          zIndex: 1,
        }}
      >
        {/* ── STICKY INNER CONTAINER ──────────────────────── */}
        <div
          className="sticky top-0 left-0 w-full h-screen overflow-hidden select-none"
          style={{ background: '#04040a' }}
        >
          {/* Ambient Particles Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
          />

          {/* Ambient Particles Glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-0"
            style={{ background: bgGlowGradient }}
          />

          {/* ────────────────────────────────────────────────
              TRANSITION WIPES (LAYERS SEAMLESSLY AT TOP Z-INDEX)
              (Deactivated to allow gorgeous, seamless cross-fades)
             ──────────────────────────────────────────────── */}
          {/* Iris Wipe 1 (Intro -> P1)
          <motion.div
            className="absolute inset-0 bg-[#04040a] pointer-events-none z-40"
            style={{ clipPath: iris1Clip }}
          />
          */}

          {/* Wipe 1 (P1 -> P2)
          <motion.div
            className="absolute inset-0 bg-[#04040a] pointer-events-none z-40"
            style={{ clipPath: wipe1Clip }}
          />
          */}

          {/* Wipe 2 (P2 -> P3)
          <motion.div
            className="absolute inset-0 bg-[#04040a] pointer-events-none z-40"
            style={{ clipPath: wipe2Clip }}
          />
          */}

          {/* Iris Wipe 2 (P3 -> Countdown)
          <motion.div
            className="absolute inset-0 bg-[#04040a] pointer-events-none z-40"
            style={{ clipPath: iris2Clip }}
          />
          */}

          {/* ────────────────────────────────────────────────
              ACT 0: CINEMATIC OPENING (scroll 0% → 12%)
             ──────────────────────────────────────────────── */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
            style={{ opacity: openingHeadlineOpacity }}
          >
            {/* Split Lines & Gap text container */}
            <div className="relative flex flex-col items-center justify-center">
              
              {/* Top Splitting Line */}
              <motion.div
                className="absolute h-[1px] transform -translate-x-1/2 left-1/2"
                style={{
                  width: lineWidth,
                  backgroundColor: lineColor,
                  y: topLineY,
                  scale: pixelScale,
                }}
              />

              {/* Emerging Headline inside the Split Gap */}
              <div className="flex flex-col items-center justify-center py-24 gaming-font-display text-center leading-none tracking-tighter">
                <motion.span
                  className="font-extrabold text-white/15 select-none"
                  style={{
                    fontSize: 'clamp(56px, 10vw, 130px)',
                    clipPath: clipWordThe,
                    opacity: theOpacity,
                  }}
                >
                  THE
                </motion.span>
                <motion.span
                  className="font-extrabold text-white select-none my-2"
                  style={{
                    fontSize: 'clamp(56px, 10vw, 130px)',
                    clipPath: clipWordArsenal,
                    opacity: arsenalOpacity,
                  }}
                >
                  ARSENAL
                </motion.span>
                <motion.span
                  className="font-extrabold text-[#1a6bff] select-none"
                  style={{
                    fontSize: 'clamp(56px, 10vw, 130px)',
                    clipPath: clipWordSeries,
                    opacity: seriesOpacity,
                  }}
                >
                  SERIES.
                </motion.span>
              </div>

              {/* Bottom Splitting Line */}
              <motion.div
                className="absolute h-[1px] transform -translate-x-1/2 left-1/2"
                style={{
                  width: lineWidth,
                  backgroundColor: lineColor,
                  y: bottomLineY,
                  scale: pixelScale,
                }}
              />

              {/* Below Line wordmark "NOVA" */}
              <motion.div
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center justify-center"
                style={{ opacity: wordmarkOpacity }}
              >
                <motion.span
                  className="gaming-font-display text-[14px] font-semibold text-white/40 tracking-[12px] uppercase select-none"
                  style={{ letterSpacing: wordmarkLetterSpacing }}
                >
                  NOVA
                </motion.span>
              </motion.div>
            </div>
          </motion.div>


          {/* ────────────────────────────────────────────────
              ACT 1: PRODUCT 1 — NOVA TRIGGER PRO (12% → 37%)
             ──────────────────────────────────────────────── */}
          <motion.div
            className="absolute inset-0 w-full h-full flex flex-col lg:flex-row items-center justify-center px-6 lg:px-24 z-10"
            style={{ 
              opacity: p1Opacity, 
              pointerEvents: p1PointerEvents 
            }}
          >
            {/* Background Big Numeral 01 */}
            <motion.div 
              className="absolute right-[-20px] lg:right-[-60px] top-1/2 gaming-font-display text-[260px] lg:text-[450px] font-extrabold text-[#1a6bff]/[0.015] select-none pointer-events-none z-0 hidden md:block"
              style={{ y: p1NumeralY }}
            >
              01
            </motion.div>

            {/* Product Image Layer (Left Side) */}
            <div className="w-full lg:w-[48%] h-[30vh] sm:h-[45vh] lg:h-[70vh] flex items-center justify-center relative select-none">
              
              {/* Technical floating badges */}
              <div 
                className="absolute top-[12%] left-[10%] border border-[#1a6bff]/20 rounded-lg py-2 px-3.5 bg-white/[0.04] backdrop-blur-md z-20 gaming-font-sans text-[11px] text-white/60 select-none hidden sm:block"
                style={{ animation: 'floatBadge1 3.5s ease-in-out infinite' }}
              >
                0.8ms
              </div>
              <div 
                className="absolute top-[35%] right-[10%] border border-[#1a6bff]/20 rounded-lg py-2 px-3.5 bg-white/[0.04] backdrop-blur-md z-20 gaming-font-sans text-[11px] text-white/60 select-none hidden sm:block"
                style={{ animation: 'floatBadge2 2.6s ease-in-out infinite', animationDelay: '0.4s' }}
              >
                LED STRIP
              </div>
              <div 
                className="absolute bottom-[20%] left-[8%] border border-[#1a6bff]/20 rounded-lg py-2 px-3.5 bg-white/[0.04] backdrop-blur-md z-20 gaming-font-sans text-[11px] text-white/60 select-none hidden sm:block"
                style={{ animation: 'floatBadge3 3.0s ease-in-out infinite', animationDelay: '1.0s' }}
              >
                CNC ALLOY
              </div>

              {/* Connecting Dashed Callout lines SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden sm:block">
                {/* Line 1 (0.8ms to Triggers) */}
                <line x1="20%" y1="17%" x2="42%" y2="28%" stroke="rgba(26,107,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
                {/* Line 2 (LED Strip to Triggers) */}
                <line x1="80%" y1="40%" x2="62%" y2="45%" stroke="rgba(26,107,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
                {/* Line 3 (CNC Alloy to Triggers) */}
                <line x1="20%" y1="75%" x2="48%" y2="65%" stroke="rgba(26,107,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
              </svg>

              {/* Image Container with 3D Mouse Tilt */}
              <motion.div 
                className="relative cursor-crosshair flex items-center justify-center p-6 w-full h-full"
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                style={{ 
                  x: p1ImageX, 
                  rotateY: p1ImageRotY, 
                  rotateZ: p1ImageRotZ, 
                  scale: p1ImageScale, 
                  opacity: p1ImageOpacity,
                  filter: p1ImageBlur 
                }}
              >
                {/* Soft LED Blue Glow Back-Div */}
                <div 
                  className="absolute bottom-[20%] left-[30%] w-[4px] h-[55%] bg-gradient-to-t from-[#1a6bff]/30 to-transparent blur-[40px] pointer-events-none z-0"
                />

                {/* Main Product Image */}
                <img
                  src={p1Image}
                  alt="Nova Trigger Pro"
                  className="tilt-target max-h-[25vh] sm:max-h-[38vh] lg:max-h-[62vh] object-contain transition-[filter] duration-400 ease hover:drop-shadow-[0_0_60px_rgba(26,107,255,0.5)] z-10"
                />
              </motion.div>
            </div>

            {/* Gap divider for columns */}
            <div className="w-0 lg:w-[4%]" />

            {/* Content Layer (Right Side) */}
            <motion.div 
              className="w-full lg:w-[48%] flex flex-col items-center lg:items-start text-center lg:text-left z-10 mt-6 lg:mt-0"
              style={{ x: p1ContentX, opacity: p1ContentOp }}
            >
              {/* Badge Row */}
              <motion.div 
                className="flex items-center gap-2 mb-2"
                style={{ opacity: p1BadgeOp }}
              >
                <div className="w-6 h-[8px] bg-[#1a6bff]" />
                <span className="gaming-font-sans text-[11px] tracking-[4px] text-white/50 font-bold">01 / 03</span>
              </motion.div>

              {/* Category */}
              <motion.span 
                className="gaming-font-sans text-[10px] tracking-[5px] text-[#1a6bff] uppercase mb-4 block font-semibold"
                style={{ opacity: p1CatOp }}
              >
                [ GAMING PERIPHERAL ]
              </motion.span>

              {/* Headline */}
              <div className="gaming-font-display leading-none mb-6">
                <motion.h2 
                  className="text-5xl lg:text-7xl font-extrabold text-white uppercase select-none"
                  style={{ clipPath: p1NovaClip, opacity: p1NovaOp }}
                >
                  NOVA
                </motion.h2>
                <motion.h2 
                  className="text-5xl lg:text-7xl font-extrabold uppercase gaming-text-outline select-none mt-1"
                  style={{ clipPath: p1ModelClip, opacity: p1ModelOp }}
                >
                  TRIGGER PRO
                </motion.h2>
              </div>

              {/* Scoped blue line */}
              <motion.div 
                className="w-28 h-[1px] bg-[#1a6bff] mb-8 origin-left"
                style={{ scaleX: p1LineScaleX }}
              />

              {/* Staggered Specs List */}
              <div className="w-full max-w-[480px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-x-6 gap-y-1 text-left">
                {/* Spec 1 */}
                <motion.div 
                  className="py-2.5 border-b border-white/[0.06] flex items-start"
                  style={{ opacity: p1Spec1Op, x: p1Spec1X }}
                >
                  <div className="w-1.5 h-1.5 bg-[#1a6bff] mt-1.5 mr-3 flex-shrink-0" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                  <div>
                    <h4 className="gaming-font-sans text-[13px] font-semibold text-white mb-0.5">0.8ms actuation</h4>
                    <p className="gaming-font-sans text-[11px] text-white/40">Ultra-low latency response</p>
                  </div>
                </motion.div>

                {/* Spec 2 */}
                <motion.div 
                  className="py-2.5 border-b border-white/[0.06] flex items-start"
                  style={{ opacity: p1Spec2Op, x: p1Spec2X }}
                >
                  <div className="w-1.5 h-1.5 bg-[#1a6bff] mt-1.5 mr-3 flex-shrink-0" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                  <div>
                    <h4 className="gaming-font-sans text-[13px] font-semibold text-white mb-0.5">CNC 6061-T6 aluminum</h4>
                    <p className="gaming-font-sans text-[11px] text-white/40">Aerospace grade body</p>
                  </div>
                </motion.div>

                {/* Spec 3 */}
                <motion.div 
                  className="py-2.5 border-b border-white/[0.06] flex items-start"
                  style={{ opacity: p1Spec3Op, x: p1Spec3X }}
                >
                  <div className="w-1.5 h-1.5 bg-[#1a6bff] mt-1.5 mr-3 flex-shrink-0" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                  <div>
                    <h4 className="gaming-font-sans text-[13px] font-semibold text-white mb-0.5">Per-zone cobalt LED</h4>
                    <p className="gaming-font-sans text-[11px] text-white/40">Blue signature lighting</p>
                  </div>
                </motion.div>

                {/* Spec 4 */}
                <motion.div 
                  className="py-2.5 border-b border-white/[0.06] flex items-start"
                  style={{ opacity: p1Spec4Op, x: p1Spec4X }}
                >
                  <div className="w-1.5 h-1.5 bg-[#1a6bff] mt-1.5 mr-3 flex-shrink-0" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                  <div>
                    <h4 className="gaming-font-sans text-[13px] font-semibold text-white mb-0.5">5.5"–7.2" compatibility</h4>
                    <p className="gaming-font-sans text-[11px] text-white/40">Spring-loaded universal clamp</p>
                  </div>
                </motion.div>
              </div>

              {/* Launch Badge */}
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a6bff]/10 border border-[#1a6bff]/25 rounded-full mt-6"
                style={{ scale: p1LaunchBadgeScale }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#1a6bff]" style={{ animation: 'pulseScale 1.5s infinite' }} />
                <span className="gaming-font-sans text-[10px] tracking-[3px] text-[#1a6bff] uppercase font-bold">LAUNCHING Q1 2026</span>
              </motion.div>

              {/* Call to Actions Buttons */}
              <motion.div 
                className="flex items-center gap-4 mt-6"
                style={{ opacity: p1ButtonsOp }}
              >
                <button 
                  ref={(el) => { magneticRefs.current[0] = el; }}
                  className="h-12 px-7 rounded-[24px] border border-white/15 bg-transparent text-white gaming-font-sans text-[11px] tracking-[3px] font-medium cursor-pointer transition-all duration-300 hover:border-[#1a6bff] hover:text-[#1a6bff] hover:shadow-[0_0_24px_rgba(26,107,255,0.25)] hover:bg-[#1a6bff]/5"
                >
                  NOTIFY ME
                </button>
                <button 
                  className="h-12 px-7 rounded-[24px] border border-[#1a6bff]/30 bg-[#1a6bff]/15 text-[#1a6bff] gaming-font-sans text-[11px] tracking-[3px] font-semibold cursor-pointer transition-all duration-300 hover:bg-[#1a6bff]/25 hover:shadow-[0_0_30px_rgba(26,107,255,0.2)]"
                >
                  LEARN MORE
                </button>
              </motion.div>
            </motion.div>
          </motion.div>


          {/* ────────────────────────────────────────────────
              ACT 2: PRODUCT 2 — NOVA COOLER X1 (37% → 58%)
             ──────────────────────────────────────────────── */}
          <motion.div
            className="absolute inset-0 w-full h-full flex flex-col-reverse lg:flex-row items-center justify-center px-6 lg:px-24 z-10"
            style={{ 
              opacity: p2Opacity, 
              pointerEvents: p2PointerEvents 
            }}
          >
            {/* Content Layer (Left Side) */}
            <motion.div 
              className="w-full lg:w-[48%] flex flex-col items-center lg:items-start text-center lg:text-left z-10 mt-6 lg:mt-0"
              style={{ x: p2ContentX, opacity: p2ContentOp }}
            >
              {/* Badge Row */}
              <motion.div 
                className="flex items-center gap-2 mb-2"
                style={{ opacity: p2BadgeOp }}
              >
                <div className="w-6 h-[8px] bg-[#00f0ff]" />
                <span className="gaming-font-sans text-[11px] tracking-[4px] text-white/50 font-bold">02 / 03</span>
              </motion.div>

              {/* Category */}
              <motion.span 
                className="gaming-font-sans text-[10px] tracking-[5px] text-[#00f0ff] uppercase mb-4 block font-semibold"
                style={{ opacity: p2CatOp }}
              >
                [ THERMAL MANAGEMENT ]
              </motion.span>

              {/* Headline */}
              <div className="gaming-font-display leading-none mb-6">
                <motion.h2 
                  className="text-5xl lg:text-7xl font-extrabold text-white uppercase select-none"
                  style={{ clipPath: p2NovaClip, opacity: p2NovaOp }}
                >
                  NOVA
                </motion.h2>
                <motion.h2 
                  className="text-5xl lg:text-7xl font-extrabold uppercase gaming-text-outline select-none mt-1"
                  style={{ clipPath: p2ModelClip, opacity: p2ModelOp }}
                >
                  COOLER X1
                </motion.h2>
              </div>

              {/* Scoped blue line */}
              <motion.div 
                className="w-28 h-[1px] bg-[#00f0ff] mb-8 origin-left"
                style={{ scaleX: p2LineScaleX }}
              />

              {/* Staggered Specs List */}
              <div className="w-full max-w-[480px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-x-6 gap-y-1 text-left">
                {/* Spec 1 */}
                <motion.div 
                  className="py-2.5 border-b border-white/[0.06] flex items-start"
                  style={{ opacity: p2Spec1Op, x: p2Spec1X }}
                >
                  <div className="w-1.5 h-1.5 bg-[#00f0ff] mt-1.5 mr-3 flex-shrink-0" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                  <div>
                    <h4 className="gaming-font-sans text-[13px] font-semibold text-white mb-0.5">Ultra-silent turbine</h4>
                    <p className="gaming-font-sans text-[11px] text-white/40">18dB noise floor at max RPM</p>
                  </div>
                </motion.div>

                {/* Spec 2 */}
                <motion.div 
                  className="py-2.5 border-b border-white/[0.06] flex items-start"
                  style={{ opacity: p2Spec2Op, x: p2Spec2X }}
                >
                  <div className="w-1.5 h-1.5 bg-[#00f0ff] mt-1.5 mr-3 flex-shrink-0" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                  <div>
                    <h4 className="gaming-font-sans text-[13px] font-semibold text-white mb-0.5">360° RGB halo ring</h4>
                    <p className="gaming-font-sans text-[11px] text-white/40">Teal and Arctic blue signature lighting</p>
                  </div>
                </motion.div>

                {/* Spec 3 */}
                <motion.div 
                  className="py-2.5 border-b border-white/[0.06] flex items-start"
                  style={{ opacity: p2Spec3Op, x: p2Spec3X }}
                >
                  <div className="w-1.5 h-1.5 bg-[#00f0ff] mt-1.5 mr-3 flex-shrink-0" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                  <div>
                    <h4 className="gaming-font-sans text-[13px] font-semibold text-white mb-0.5">Semiconductor cooling</h4>
                    <p className="gaming-font-sans text-[11px] text-white/40">Drops phone temp by 15°C</p>
                  </div>
                </motion.div>

                {/* Spec 4 */}
                <motion.div 
                  className="py-2.5 border-b border-white/[0.06] flex items-start"
                  style={{ opacity: p2Spec4Op, x: p2Spec4X }}
                >
                  <div className="w-1.5 h-1.5 bg-[#00f0ff] mt-1.5 mr-3 flex-shrink-0" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                  <div>
                    <h4 className="gaming-font-sans text-[13px] font-semibold text-white mb-0.5">Magnetic quick-attach</h4>
                    <p className="gaming-font-sans text-[11px] text-white/40">0.5 second attachment system</p>
                  </div>
                </motion.div>
              </div>

              {/* ── UNIQUE WIDGET: TEMPERATURE DISPLAY CARD ── */}
              <motion.div
                className="mt-6 flex flex-col w-[200px] border border-[#00f0ff]/15 bg-white/[0.03] rounded-2xl p-4 backdrop-blur-xl pointer-events-none select-none"
                style={{ opacity: p2TempWidgetOp }}
              >
                <span className="gaming-font-sans text-[9px] tracking-[1.5px] text-[#00f0ff] font-bold uppercase mb-3">
                  PHONE TEMPERATURE
                </span>
                
                {/* Temp transition indicator */}
                <div className="flex items-center justify-between text-white font-extrabold gaming-font-display text-[16px] mb-1.5">
                  <span className="text-[#ff6644]">42°C</span>
                  <span className="text-white/30 text-xs">→</span>
                  <span className="text-[#00f0ff]">27°C</span>
                </div>

                {/* Delta pill */}
                <div className="flex items-center gap-1 bg-[#00c864]/15 border border-[#00c864]/30 rounded-full px-2.5 py-0.5 self-start mb-4 select-none">
                  <span className="text-[#00c864] text-[9px] animate-[arrowBounce_2s_infinite]">↓</span>
                  <span className="gaming-font-sans text-[10px] text-[#00c864] font-semibold">-15°C</span>
                </div>

                {/* Color slider bar */}
                <div className="relative w-full h-[4px] rounded-full bg-gradient-to-r from-[#ff4444] via-[#ff8800] to-[#00f0ff] mt-1">
                  {/* Sliding White Dot */}
                  <div className="temp-dot" />
                </div>

                <div className="flex justify-between items-center text-[8px] text-white/30 font-bold gaming-font-sans mt-2.5">
                  <span>[HOT]</span>
                  <span>[COOL]</span>
                </div>
              </motion.div>

              {/* Launch Badge */}
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#00f0ff]/10 border border-[#00f0ff]/25 rounded-full mt-6"
                style={{ scale: p2LaunchBadgeScale }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" style={{ animation: 'pulseScale 1.5s infinite' }} />
                <span className="gaming-font-sans text-[10px] tracking-[3px] text-[#00f0ff] uppercase font-bold">LAUNCHING Q2 2026</span>
              </motion.div>

              {/* Call to Actions Buttons */}
              <motion.div 
                className="flex items-center gap-4 mt-6"
                style={{ opacity: p2ButtonsOp }}
              >
                <button 
                  ref={(el) => { magneticRefs.current[1] = el; }}
                  className="h-12 px-7 rounded-[24px] border border-white/15 bg-transparent text-white gaming-font-sans text-[11px] tracking-[3px] font-medium cursor-pointer transition-all duration-300 hover:border-[#00f0ff] hover:text-[#00f0ff] hover:shadow-[0_0_24px_rgba(0,240,255,0.25)] hover:bg-[#00f0ff]/5"
                >
                  NOTIFY ME
                </button>
                <button 
                  className="h-12 px-7 rounded-[24px] border border-[#00f0ff]/30 bg-[#00f0ff]/15 text-[#00f0ff] gaming-font-sans text-[11px] tracking-[3px] font-semibold cursor-pointer transition-all duration-300 hover:bg-[#00f0ff]/25 hover:shadow-[0_0_30px_rgba(0,240,255,0.2)]"
                >
                  LEARN MORE
                </button>
              </motion.div>
            </motion.div>

            {/* Gap divider */}
            <div className="w-0 lg:w-[4%]" />

            {/* Product Image Layer (Right Side) */}
            <div className="w-full lg:w-[48%] h-[30vh] sm:h-[45vh] lg:h-[70vh] flex items-center justify-center relative select-none">
              
              {/* Left Side Big Numeral 02 */}
              <motion.div 
                className="absolute left-[-20px] lg:left-[-60px] top-1/2 gaming-font-display text-[260px] lg:text-[450px] font-extrabold text-[#00f0ff]/[0.015] select-none pointer-events-none z-0 hidden md:block"
                style={{ y: p2NumeralY }}
              >
                02
              </motion.div>

              {/* Technical floating badges */}
              <div 
                className="absolute top-[15%] right-[10%] border border-[#00f0ff]/20 rounded-lg py-2 px-3.5 bg-white/[0.04] backdrop-blur-md z-20 gaming-font-sans text-[11px] text-white/60 select-none hidden sm:block"
                style={{ animation: 'floatBadge1 3.2s ease-in-out infinite' }}
              >
                18dB
              </div>
              <div 
                className="absolute top-[45%] left-[8%] border border-[#00f0ff]/20 rounded-lg py-2 px-3.5 bg-white/[0.04] backdrop-blur-md z-20 gaming-font-sans text-[11px] text-white/60 select-none hidden sm:block"
                style={{ animation: 'floatBadge2 2.8s ease-in-out infinite', animationDelay: '0.6s' }}
              >
                360° HALO
              </div>
              <div 
                className="absolute bottom-[20%] right-[12%] border border-[#00f0ff]/20 rounded-lg py-2 px-3.5 bg-white/[0.04] backdrop-blur-md z-20 gaming-font-sans text-[11px] text-white/60 select-none hidden sm:block"
                style={{ animation: 'floatBadge3 3.4s ease-in-out infinite', animationDelay: '1.2s' }}
              >
                -15°C COOL
              </div>

              {/* SVG connection lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden sm:block">
                <line x1="80%" y1="20%" x2="55%" y2="35%" stroke="rgba(0,240,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="20%" y1="48%" x2="42%" y2="48%" stroke="rgba(0,240,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="80%" y1="75%" x2="52%" y2="60%" stroke="rgba(0,240,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
              </svg>

              {/* Image Container with Mouse Tilt */}
              <motion.div 
                className="relative cursor-crosshair flex items-center justify-center p-6 w-full h-full"
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                style={{ 
                  x: p2ImageX, 
                  scale: p2ImageScale, 
                  opacity: p2ImageOpacity,
                }}
              >
                {/* Circular pulsing LED behind image */}
                <div 
                  className="absolute w-[300px] h-[300px] rounded-full bg-radial from-[#00f0ff]/15 to-transparent blur-[45px] z-0"
                  style={{
                    animation: 'pulseScale 2.0s infinite ease-in-out',
                  }}
                />

                {/* Circular Fan image with fan spin animation */}
                <motion.img
                  src={p2Image}
                  alt="Nova Cooler X1"
                  className="tilt-target max-h-[25vh] sm:max-h-[38vh] lg:max-h-[62vh] object-contain transition-[filter] duration-400 ease hover:drop-shadow-[0_0_60px_rgba(0,240,255,0.5)] z-10 animate-fan-spin"
                  style={{ filter: p2ImageBlur, rotate: p2ImageRotZ }}
                />
              </motion.div>
            </div>
          </motion.div>


          {/* ────────────────────────────────────────────────
              ACT 3: PRODUCT 3 — NOVA SOUNDPRO X (58% → 76%)
             ──────────────────────────────────────────────── */}
          <motion.div
            className="absolute inset-0 w-full h-full flex flex-col lg:flex-row items-center justify-center px-6 lg:px-24 z-10"
            style={{ 
              opacity: p3Opacity, 
              pointerEvents: p3PointerEvents 
            }}
          >
            {/* Background Big Numeral 03 */}
            <motion.div 
              className="absolute right-[-20px] lg:right-[-60px] top-1/2 gaming-font-display text-[260px] lg:text-[450px] font-extrabold text-[#8b5cf6]/[0.015] select-none pointer-events-none z-0 hidden md:block"
              style={{ y: p3NumeralY }}
            >
              03
            </motion.div>

            {/* Product Image Layer (Left Side) */}
            <div className="w-full lg:w-[48%] h-[30vh] sm:h-[45vh] lg:h-[70vh] flex items-center justify-center relative select-none">
              
              {/* Technical floating badges */}
              <div 
                className="absolute top-[12%] left-[10%] border border-[#8b5cf6]/20 rounded-lg py-2 px-3.5 bg-white/[0.04] backdrop-blur-md z-20 gaming-font-sans text-[11px] text-white/60 select-none hidden sm:block"
                style={{ animation: 'floatBadge1 3.4s ease-in-out infinite' }}
              >
                24-BIT
              </div>
              <div 
                className="absolute top-[35%] right-[10%] border border-[#8b5cf6]/20 rounded-lg py-2 px-3.5 bg-white/[0.04] backdrop-blur-md z-20 gaming-font-sans text-[11px] text-white/60 select-none hidden sm:block"
                style={{ animation: 'floatBadge2 2.8s ease-in-out infinite', animationDelay: '0.5s' }}
              >
                AI ANC
              </div>
              <div 
                className="absolute bottom-[20%] left-[8%] border border-[#8b5cf6]/20 rounded-lg py-2 px-3.5 bg-white/[0.04] backdrop-blur-md z-20 gaming-font-sans text-[11px] text-white/60 select-none hidden sm:block"
                style={{ animation: 'floatBadge3 3.2s ease-in-out infinite', animationDelay: '1.1s' }}
              >
                28ms LATENCY
              </div>

              {/* Connecting callouts SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden sm:block">
                <line x1="20%" y1="17%" x2="48%" y2="35%" stroke="rgba(139,92,246,0.2)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="80%" y1="40%" x2="52%" y2="42%" stroke="rgba(139,92,246,0.2)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="20%" y1="75%" x2="48%" y2="60%" stroke="rgba(139,92,246,0.2)" strokeWidth="1" strokeDasharray="4 4" />
              </svg>

              {/* Image Container with Mouse Tilt */}
              <motion.div 
                className="relative cursor-crosshair flex items-center justify-center p-6 w-full h-full"
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                style={{ 
                  scale: p3ImageScale,
                  opacity: p3ImageOpacity,
                }}
              >
                {/* Two Earbuds converging from outer bounds */}
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Left Earbud Flying */}
                  <motion.div 
                    className="absolute left-[15%] top-[25%] w-[80px] h-[80px]"
                    style={{ x: p3LeftBudX, y: p3LeftBudY }}
                  >
                    <img src={p3Image} alt="" className="w-full h-full object-contain filter hue-rotate-[180deg]" />
                  </motion.div>

                  {/* Right Earbud Flying */}
                  <motion.div 
                    className="absolute right-[15%] top-[25%] w-[80px] h-[80px]"
                    style={{ x: p3RightBudX, y: p3RightBudY }}
                  >
                    <img src={p3Image} alt="" className="w-full h-full object-contain filter hue-rotate-[90deg] scale-x-[-1]" />
                  </motion.div>
                </motion.div>

                {/* Main buds composite image */}
                <img
                  src={p3Image}
                  alt="Nova SoundPro X"
                  className="tilt-target max-h-[25vh] sm:max-h-[38vh] lg:max-h-[62vh] object-contain transition-[filter] duration-400 ease hover:drop-shadow-[0_0_60px_rgba(139,92,246,0.5)] z-10"
                />
              </motion.div>
            </div>

            {/* Column gap */}
            <div className="w-0 lg:w-[4%]" />

            {/* Content Layer (Right Side) */}
            <motion.div 
              className="w-full lg:w-[48%] flex flex-col items-center lg:items-start text-center lg:text-left z-10 mt-6 lg:mt-0"
              style={{ x: p3ContentX, opacity: p3ContentOp }}
            >
              {/* Badge Row */}
              <motion.div 
                className="flex items-center gap-2 mb-2"
                style={{ opacity: p3BadgeOp }}
              >
                <div className="w-6 h-[8px] bg-[#8b5cf6]" />
                <span className="gaming-font-sans text-[11px] tracking-[4px] text-white/50 font-bold">03 / 03</span>
              </motion.div>

              {/* Category */}
              <motion.span 
                className="gaming-font-sans text-[10px] tracking-[5px] text-[#8b5cf6] uppercase mb-4 block font-semibold"
                style={{ opacity: p3CatOp }}
              >
                [ AUDIO ENGINEERING ]
              </motion.span>

              {/* Headline */}
              <div className="gaming-font-display leading-none mb-6">
                <motion.h2 
                  className="text-5xl lg:text-7xl font-extrabold text-white uppercase select-none"
                  style={{ clipPath: p3NovaClip, opacity: p3NovaOp }}
                >
                  NOVA
                </motion.h2>
                <motion.h2 
                  className="text-5xl lg:text-7xl font-extrabold uppercase gaming-text-outline select-none mt-1"
                  style={{ clipPath: p3ModelClip, opacity: p3ModelOp }}
                >
                  SOUNDPRO X
                </motion.h2>
              </div>

              {/* Scoped blue line */}
              <motion.div 
                className="w-28 h-[1px] bg-[#8b5cf6] mb-8 origin-left"
                style={{ scaleX: p3LineScaleX }}
              />

              {/* Staggered Specs List */}
              <div className="w-full max-w-[480px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-x-6 gap-y-1 text-left">
                {/* Spec 1 */}
                <motion.div 
                  className="py-2.5 border-b border-white/[0.06] flex items-start"
                  style={{ opacity: p3Spec1Op, x: p3Spec1X }}
                >
                  <div className="w-1.5 h-1.5 bg-[#8b5cf6] mt-1.5 mr-3 flex-shrink-0" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                  <div>
                    <h4 className="gaming-font-sans text-[13px] font-semibold text-white mb-0.5">Lossless gaming audio</h4>
                    <p className="gaming-font-sans text-[11px] text-white/40">24-bit, 96kHz crystal clarity</p>
                  </div>
                </motion.div>

                {/* Spec 2 */}
                <motion.div 
                  className="py-2.5 border-b border-white/[0.06] flex items-start"
                  style={{ opacity: p3Spec2Op, x: p3Spec2X }}
                >
                  <div className="w-1.5 h-1.5 bg-[#8b5cf6] mt-1.5 mr-3 flex-shrink-0" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                  <div>
                    <h4 className="gaming-font-sans text-[13px] font-semibold text-white mb-0.5">AI noise cancellation</h4>
                    <p className="gaming-font-sans text-[11px] text-white/40">NOVA MIND isolation engine</p>
                  </div>
                </motion.div>

                {/* Spec 3 */}
                <motion.div 
                  className="py-2.5 border-b border-white/[0.06] flex items-start"
                  style={{ opacity: p3Spec3Op, x: p3Spec3X }}
                >
                  <div className="w-1.5 h-1.5 bg-[#8b5cf6] mt-1.5 mr-3 flex-shrink-0" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                  <div>
                    <h4 className="gaming-font-sans text-[13px] font-semibold text-white mb-0.5">Ultra-low latency mode</h4>
                    <p className="gaming-font-sans text-[11px] text-white/40">28ms gaming mode, zero lag</p>
                  </div>
                </motion.div>

                {/* Spec 4 */}
                <motion.div 
                  className="py-2.5 border-b border-white/[0.06] flex items-start"
                  style={{ opacity: p3Spec4Op, x: p3Spec4X }}
                >
                  <div className="w-1.5 h-1.5 bg-[#8b5cf6] mt-1.5 mr-3 flex-shrink-0" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                  <div>
                    <h4 className="gaming-font-sans text-[13px] font-semibold text-white mb-0.5">48hr total battery life</h4>
                    <p className="gaming-font-sans text-[11px] text-white/40">12hr buds + 36hr case</p>
                  </div>
                </motion.div>
              </div>

              {/* ── UNIQUE WIDGET: ORGANIC AUDIO EQUALIZER WAVEFORM ── */}
              <motion.div
                ref={waveformContainerRef}
                className="mt-6 flex flex-col w-[220px] h-[86px] border border-[#8b5cf6]/15 bg-white/[0.03] rounded-2xl p-4 backdrop-blur-xl select-none"
                style={{ opacity: p3WaveformOp }}
              >
                <div className="flex items-center justify-between mb-3 w-full">
                  <span className="gaming-font-sans text-[9px] tracking-[1.5px] text-[#8b5cf6] font-bold uppercase">
                    NOVA SPATIAL AUDIO
                  </span>
                  
                  {/* tag */}
                  <span className="gaming-font-sans text-[8px] bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] rounded-md px-1.5 py-0.5">
                    28ms MODE
                  </span>
                </div>

                {/* Frequency bars container */}
                <div className="flex items-end gap-[4px] h-[36px] w-full mt-1 select-none">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className={`waveform-bar flex-1 rounded-t-full bg-gradient-to-t from-[#8b5cf6] to-[#d946ef] transition-all duration-75
                        ${i >= 6 ? 'hidden sm:block' : ''}
                      `}
                      style={{ height: '6px' }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Launch Badge */}
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/25 rounded-full mt-6"
                style={{ scale: p3LaunchBadgeScale }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" style={{ animation: 'pulseScale 1.5s infinite' }} />
                <span className="gaming-font-sans text-[10px] tracking-[3px] text-[#8b5cf6] uppercase font-bold">LAUNCHING Q3 2026</span>
              </motion.div>

              {/* Call to Actions Buttons */}
              <motion.div 
                className="flex items-center gap-4 mt-6"
                style={{ opacity: p3ButtonsOp }}
              >
                <button 
                  ref={(el) => { magneticRefs.current[2] = el; }}
                  className="h-12 px-7 rounded-[24px] border border-white/15 bg-transparent text-white gaming-font-sans text-[11px] tracking-[3px] font-medium cursor-pointer transition-all duration-300 hover:border-[#8b5cf6] hover:text-[#8b5cf6] hover:shadow-[0_0_24px_rgba(139,92,246,0.25)] hover:bg-[#8b5cf6]/5"
                >
                  NOTIFY ME
                </button>
                <button 
                  className="h-12 px-7 rounded-[24px] border border-[#8b5cf6]/30 bg-[#8b5cf6]/15 text-[#8b5cf6] gaming-font-sans text-[11px] tracking-[3px] font-semibold cursor-pointer transition-all duration-300 hover:bg-[#8b5cf6]/25 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]"
                >
                  LEARN MORE
                </button>
              </motion.div>
            </motion.div>
          </motion.div>


          {/* ────────────────────────────────────────────────
              ACT 4: COUNTDOWN SCENE — "GEAR UP" (76% → 100%)
             ──────────────────────────────────────────────── */}
          <motion.div
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-start overflow-y-auto z-20 py-20 px-6 lg:px-24"
            style={{ 
              opacity: ctaOpacity, 
              pointerEvents: ctaPointerEvents,
              background: 'radial-gradient(ellipse at 50% 60%, #0a0a35 0%, #04040a 60%, #020208 100%)',
            }}
          >
            {/* 3 Concentric Target Rings Rotating CW/CCW */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <div 
                className="absolute border border-[#1a6bff]/5 rounded-full select-none"
                style={{ width: '300px', height: '300px', animation: 'rotateCW 60s linear infinite' }}
              />
              <div 
                className="absolute border border-[#1a6bff]/5 rounded-full select-none"
                style={{ width: '500px', height: '500px', animation: 'rotateCCW 90s linear infinite' }}
              />
              <div 
                className="absolute border border-[#1a6bff]/5 rounded-full select-none"
                style={{ width: '700px', height: '700px', animation: 'rotateCW 120s linear infinite' }}
              />
            </div>

            {/* Scrollable Content Wrapper */}
            <motion.div 
              className="w-full max-w-4xl flex flex-col items-center justify-start text-center z-10"
              style={{ y: ctaContentY, opacity: ctaContentOp }}
            >
              {/* Emerging Headline "GEAR UP." */}
              <div className="flex items-center justify-center leading-none tracking-tighter gaming-font-display mb-3 select-none">
                <motion.h2
                  className="font-extrabold text-white text-5xl sm:text-6xl lg:text-9xl mr-4"
                  style={{ clipPath: gearClip, opacity: gearOp }}
                >
                  GEAR
                </motion.h2>
                <motion.h2
                  className="font-extrabold text-[#1a6bff] text-5xl sm:text-6xl lg:text-9xl"
                  style={{ clipPath: upClip, opacity: upOp }}
                >
                  UP.
                </motion.h2>
              </div>

              {/* Subheadline description */}
              <motion.p
                className="gaming-font-sans text-[14px] sm:text-lg text-white/70 max-w-lg leading-relaxed select-none mb-12"
                style={{ opacity: ctaSubtextOp }}
              >
                The NOVA Gaming Series drops 2026. <br />Engineered for raw competitive dominance.
              </motion.p>

              {/* ────────────────────────────────────────────────
                  PRODUCT RECAP ROW (horizontal gallery)
                 ──────────────────────────────────────────────── */}
              <div className="flex flex-row flex-wrap items-center justify-center gap-6 mb-12 w-full select-none">
                
                {/* Card 1: Triggers */}
                <motion.div
                  onClick={() => handleDotClick(0)}
                  className="w-[140px] sm:w-[180px] aspect-[3/4] border border-white/[0.08] bg-white/[0.02] rounded-3xl p-4 flex flex-col items-center justify-between cursor-pointer select-none backdrop-blur-md transition-all duration-350 hover:border-[#1a6bff]/40 hover:scale-104 hover:shadow-[0_20px_60px_rgba(26,107,255,0.15)] group active:scale-[0.97]"
                  style={{ y: card1Y, opacity: card1Op }}
                >
                  <img src={p1Image} alt="Triggers" className="w-[80%] h-[70%] object-contain transition-transform duration-350 group-hover:scale-108" />
                  <div className="w-full text-center mt-3">
                    <h5 className="gaming-font-sans text-[11px] font-semibold text-white tracking-[2px] uppercase">TRIGGER PRO</h5>
                    <span className="gaming-font-sans text-[9px] tracking-[1.5px] text-[#1a6bff] font-bold">Q1 2026</span>
                  </div>
                </motion.div>

                {/* Card 2: Cooler */}
                <motion.div
                  onClick={() => handleDotClick(1)}
                  className="w-[140px] sm:w-[180px] aspect-[3/4] border border-white/[0.08] bg-white/[0.02] rounded-3xl p-4 flex flex-col items-center justify-between cursor-pointer select-none backdrop-blur-md transition-all duration-350 hover:border-[#1a6bff]/40 hover:scale-104 hover:shadow-[0_20px_60px_rgba(26,107,255,0.15)] group active:scale-[0.97]"
                  style={{ y: card2Y, opacity: card2Op }}
                >
                  <img src={p2Image} alt="Cooler" className="w-[80%] h-[70%] object-contain transition-transform duration-350 group-hover:scale-108" />
                  <div className="w-full text-center mt-3">
                    <h5 className="gaming-font-sans text-[11px] font-semibold text-white tracking-[2px] uppercase">COOLER X1</h5>
                    <span className="gaming-font-sans text-[9px] tracking-[1.5px] text-[#1a6bff] font-bold">Q2 2026</span>
                  </div>
                </motion.div>

                {/* Card 3: Earbuds */}
                <motion.div
                  onClick={() => handleDotClick(2)}
                  className="w-[140px] sm:w-[180px] aspect-[3/4] border border-white/[0.08] bg-white/[0.02] rounded-3xl p-4 flex flex-col items-center justify-between cursor-pointer select-none backdrop-blur-md transition-all duration-350 hover:border-[#1a6bff]/40 hover:scale-104 hover:shadow-[0_20px_60px_rgba(26,107,255,0.15)] group active:scale-[0.97]"
                  style={{ y: card3Y, opacity: card3Op }}
                >
                  <img src={p3Image} alt="Earbuds" className="w-[80%] h-[70%] object-contain transition-transform duration-350 group-hover:scale-108" />
                  <div className="w-full text-center mt-3">
                    <h5 className="gaming-font-sans text-[11px] font-semibold text-white tracking-[2px] uppercase">SOUNDPRO X</h5>
                    <span className="gaming-font-sans text-[9px] tracking-[1.5px] text-[#1a6bff] font-bold">Q3 2026</span>
                  </div>
                </motion.div>
              </div>

              {/* ────────────────────────────────────────────────
                  LAUNCH DATE DISPLAY (GSAP TWEEN ENTRANCE)
                 ──────────────────────────────────────────────── */}
              <motion.div 
                className="flex flex-col items-center select-none w-full mb-12"
                style={{ opacity: dateBlockOp }}
              >
                <span className="gaming-font-sans text-[10px] tracking-[6px] text-[#1a6bff] uppercase mb-2 block font-extrabold">
                  OFFICIAL LAUNCH DATE
                </span>
                
                {/* Underline */}
                <div className="w-10 h-[2px] bg-[#1a6bff] mb-5" />

                {/* Date blocks */}
                <div className="flex items-center justify-center gap-6 sm:gap-12 py-5 px-8 sm:px-16 border border-white/[0.06] bg-white/[0.02] rounded-3xl backdrop-blur-sm shadow-xl">
                  {/* Day */}
                  <div className="flex flex-col items-center">
                    <span id="gsap-day-count" className="gaming-font-display text-4xl sm:text-6xl font-extrabold text-white leading-none">00</span>
                    <span className="gaming-font-sans text-[9px] tracking-[4px] text-white/50 uppercase mt-2">DAY</span>
                  </div>

                  {/* Pipe divider */}
                  <div className="w-px h-12 bg-white/10" />

                  {/* Month */}
                  <div className="flex flex-col items-center">
                    <span id="gsap-month-count" className="gaming-font-display text-4xl sm:text-6xl font-extrabold text-white leading-none opacity-0">SEP</span>
                    <span className="gaming-font-sans text-[9px] tracking-[4px] text-white/50 uppercase mt-2">MONTH</span>
                  </div>

                  {/* Pipe divider */}
                  <div className="w-px h-12 bg-white/10" />

                  {/* Year */}
                  <div className="flex flex-col items-center">
                    <span id="gsap-year-count" className="gaming-font-display text-4xl sm:text-6xl font-extrabold text-white leading-none">2000</span>
                    <span className="gaming-font-sans text-[9px] tracking-[4px] text-white/50 uppercase mt-2">YEAR</span>
                  </div>
                </div>
              </motion.div>

              {/* ── LIVE TIMER DISPLAY ── */}
              <motion.div 
                className="w-full mb-14"
                style={{ opacity: liveCountdownOp }}
              >
                <LiveCountdown />
              </motion.div>

              {/* ── WAITLIST FORM DISPLAY ── */}
              <motion.div 
                className="w-full max-w-[520px]"
                style={{ opacity: waitlistFormOp }}
              >
                <div className="text-center mb-6">
                  <h3 className="gaming-font-display text-2xl tracking-[2px] font-extrabold text-white uppercase select-none">
                    JOIN THE WAITLIST
                  </h3>
                  <p className="gaming-font-sans text-[13px] text-white/60 mt-1 select-none">
                    Be first. Get exclusive early access.
                  </p>
                </div>

                <WaitlistForm />
              </motion.div>
            </motion.div>
          </motion.div>


          {/* ────────────────────────────────────────────────
              ACT 5: FINAL OUTRO CURTAIN (scroll 95% → 100%)
             ──────────────────────────────────────────────── */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-30"
            style={{ opacity: outroLineOp }}
          >
            <h1 className="gaming-font-display text-2xl sm:text-5xl font-black text-white/20 tracking-[8px] sm:tracking-[12px] leading-none text-center select-none">
              NOVA. BEYOND PERCEPTION.
            </h1>
            
            {/* Scaling laser line below */}
            <motion.div
              className="h-[1px] bg-[#1a6bff] w-20 sm:w-28 mt-6 origin-center select-none shadow-[0_0_12px_rgba(26,107,255,0.65)]"
              style={{ scaleX: outroLaserScaleX }}
            />
          </motion.div>

          {/* ────────────────────────────────────────────────
              VERTICAL PROGRESS FILLING BAR
             ──────────────────────────────────────────────── */}
          {inViewport && (
            <div 
              className="fixed right-7 top-1/2 -translate-y-1/2 h-[220px] w-[3px] bg-white/[0.06] rounded-full z-[999] hidden md:block overflow-hidden"
              style={{
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.8)',
              }}
            >
              {/* Active Scroll-Driven Filling Line with Signature Color Gradient */}
              <motion.div
                className="w-full h-full rounded-full bg-gradient-to-b from-[#1a6bff] via-[#00f0ff] to-[#8b5cf6] origin-top shadow-[0_0_12px_rgba(26,107,255,0.8)]"
                style={{ 
                  scaleY: scrollYProgress,
                }}
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
