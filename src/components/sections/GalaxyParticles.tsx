'use client';
import { useEffect, useRef } from 'react';

export default function GalaxyParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number;
      y: number;
      length: number;
      thickness: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
      color2?: string;
      angle: number;
      isBig: boolean;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        
        const randType = Math.random();
        this.isBig = randType > 0.95;
        
        if (this.isBig) {
          // 5% Big Blue rays
          this.length = Math.random() * 120 + 50; 
          this.thickness = Math.random() * 4 + 3; 
          this.color = '#1a6bff'; 
          this.speedX = Math.random() * 5 - 2.5;
          this.speedY = Math.random() * -6 - 2; 
          this.opacity = Math.random() * 0.4 + 0.4; 
        } else if (randType > 0.90) {
          // 5% Purple & Red combination rays
          this.length = Math.random() * 100 + 30; 
          this.thickness = Math.random() * 2 + 1; 
          this.color = '#ff3366'; // Bright Red/Pink head
          this.color2 = '#8a2be2'; // Purple tail transition
          this.speedX = Math.random() * 4 - 2;
          this.speedY = Math.random() * -5 - 2; 
          this.opacity = Math.random() * 0.5 + 0.2;
        } else {
          // 90% Normal thinner blue rays
          this.length = Math.random() * 80 + 20; 
          this.thickness = Math.random() * 1.5 + 0.5; 
          const colors = ['#1a6bff', '#00b3ff', '#4e92ff', '#80c0ff'];
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.speedX = Math.random() * 4 - 2;
          this.speedY = Math.random() * -5 - 2; 
          this.opacity = Math.random() * 0.5 + 0.1;
        }
        
        this.angle = Math.atan2(this.speedY, this.speedX);
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas!.width + this.length) this.x = -this.length;
        if (this.x < -this.length) this.x = canvas!.width + this.length;
        if (this.y > canvas!.height + this.length) this.y = -this.length;
        if (this.y < -this.length) this.y = canvas!.height + this.length;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // The head of the ray is at (x,y), the tail fades out behind it
        const endX = this.x - Math.cos(this.angle) * this.length;
        const endY = this.y - Math.sin(this.angle) * this.length;
        
        const grad = ctx.createLinearGradient(this.x, this.y, endX, endY);
        grad.addColorStop(0, this.color);
        if (this.color2) {
          grad.addColorStop(0.5, this.color2);
        }
        grad.addColorStop(1, 'transparent');
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = this.thickness;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Add a tiny glowing head to the ray
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.thickness * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    }

    const init = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 8000);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Nebula-like glow
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 1.5
      );
      grad.addColorStop(0, 'rgba(10, 10, 20, 0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-screen"
    />
  );
}
