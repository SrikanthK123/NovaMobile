'use client';

import { useEffect, useRef, useState } from 'react';

interface ShootingStar {
  id: number;
  top: number;
  left: number;
  angle: number;
}

export default function ParallaxStars() {
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  const canvasRef3 = useRef<HTMLCanvasElement>(null);
  
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const starIdCounter = useRef(0);

  // Core Star Drawing helper
  const initStars = (canvas: HTMLCanvasElement, count: number, size: number, opacity: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    
    // We make the canvas taller than the viewport (double height) for seamless vertical tiling
    canvas.width = w;
    canvas.height = h * 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

    // Generate random stars
    const stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
    }));

    // Draw the star set in both the top half and bottom half of the canvas for seamless tiling
    stars.forEach(star => {
      // Top half
      ctx.beginPath();
      ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
      ctx.fill();

      // Bottom half (offset vertically by exactly 100vh)
      ctx.beginPath();
      ctx.arc(star.x, star.y + h, size, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  useEffect(() => {
    const c1 = canvasRef1.current;
    const c2 = canvasRef2.current;
    const c3 = canvasRef3.current;

    if (!c1 || !c2 || !c3) return;

    // Initialize all canvas dimensions and drawings
    const handleResize = () => {
      initStars(c1, 200, 0.6, 0.3); // Far
      initStars(c2, 100, 1.1, 0.5); // Mid
      initStars(c3, 40, 1.8, 0.8);  // Near
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // High Performance requestAnimationFrame translation loop
    let rafId: number;
    const tick = () => {
      const scrollY = window.scrollY;
      const h = window.innerHeight;

      // Calculate vertical parallax offsets using modulo wrapping over 100vh
      const yOffset1 = -(scrollY * 0.05) % h;
      const yOffset2 = -(scrollY * 0.15) % h;
      const yOffset3 = -(scrollY * 0.35) % h;

      // Apply GPU-accelerated CSS translate3d
      if (c1) c1.style.transform = `translate3d(0, ${yOffset1}px, 0)`;
      if (c2) c2.style.transform = `translate3d(0, ${yOffset2}px, 0)`;
      if (c3) c3.style.transform = `translate3d(0, ${yOffset3}px, 0)`;

      rafId = requestAnimationFrame(tick);
    };

    tick();

    // Shooting Star Interval (spawns one every 8 to 12 seconds)
    const spawnShootingStar = () => {
      const id = starIdCounter.current++;
      const top = Math.random() * (window.innerHeight * 0.4); // spawn in upper part
      const left = Math.random() * (window.innerWidth * 0.6); // spawn in left/middle
      const angle = 30 + Math.random() * 20; // 30 to 50 degrees

      setShootingStars(prev => [...prev, { id, top, left, angle }]);

      // Remove after 600ms (matching the animation duration)
      setTimeout(() => {
        setShootingStars(prev => prev.filter(star => star.id !== id));
      }, 600);
    };

    const intervalId = setInterval(() => {
      spawnShootingStar();
    }, 8000 + Math.random() * 4000);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-[-1] overflow-hidden pointer-events-none bg-[#020205]">
      {/* ── PARALLAX LAYERS ── */}
      <canvas ref={canvasRef1} className="absolute inset-0 w-full h-[200vh] will-change-transform" />
      <canvas ref={canvasRef2} className="absolute inset-0 w-full h-[200vh] will-change-transform" />
      <canvas ref={canvasRef3} className="absolute inset-0 w-full h-[200vh] will-change-transform" />

      {/* ── SHOOTING STARS ── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {shootingStars.map(star => (
          <div
            key={star.id}
            style={{
              top: `${star.top}px`,
              left: `${star.left}px`,
              transform: `rotate(${star.angle}deg)`,
            }}
            className="absolute w-[120px] h-[1px] bg-gradient-to-r from-white to-transparent pointer-events-none will-change-transform animate-[shootingStar_0.6s_ease-out_forwards]"
          />
        ))}
      </div>

      {/* ── CSS KEYFRAMES FOR SHOOTING STAR INLINED ── */}
      <style>{`
        @keyframes shootingStar {
          0% {
            transform: translate3d(0, 0, 0) scaleX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translate3d(50px, 50px, 0) scaleX(1);
          }
          100% {
            transform: translate3d(300px, 300px, 0) scaleX(0.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
