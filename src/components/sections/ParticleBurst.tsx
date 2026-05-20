'use client';

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

export interface ParticleBurstRef {
  trigger: () => void;
}

export const ParticleBurst = forwardRef<ParticleBurstRef, {}>((_props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    alpha: number;
    decay: number;
  }>>([]);
  const animationFrameRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    trigger() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Only launch a burst if particles list is currently empty, avoiding multiple overlapping bursts
      if (particlesRef.current.length > 0) return;

      const colors = ['#1a6bff', '#7c3aed', '#ffffff'];

      // Generate 60 high-velocity particles in 360-degree vectors
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 9 + 4; // Velocity spread
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 4 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.04 + 0.02, // Alpha decay timing (approx 0.4s duration)
        });
      }

      // Kick off the rendering ticks
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      tick();
    }
  }));

  const tick = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear buffer
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let active = false;
    particlesRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.93; // Friction to slow down expansion organically
      p.vy *= 0.93;
      p.alpha -= p.decay;

      if (p.alpha > 0) {
        active = true;
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      }
    });

    if (active) {
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = [];
      animationFrameRef.current = null;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[45]"
    />
  );
});

ParticleBurst.displayName = 'ParticleBurst';
