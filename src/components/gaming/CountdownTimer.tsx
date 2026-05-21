'use client';

import { useEffect, useState, useRef } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
}

interface TimeUnit {
  label: string;
  value: number;
  prev: number;
}

function FlipDigit({ value, prev, flip }: { value: string; prev: string; flip: boolean }) {
  return (
    <div className="relative overflow-hidden" style={{ perspective: '300px' }}>
      <span
        className="block font-display font-extrabold text-white leading-none"
        style={{
          fontSize: 'clamp(36px, 5vw, 56px)',
          animation: flip ? 'digitFlipIn 0.25s ease-out forwards' : 'none',
        }}
      >
        {value}
      </span>
      {flip && (
        <span
          className="absolute inset-0 flex items-center justify-center font-display font-extrabold text-white leading-none pointer-events-none"
          style={{
            fontSize: 'clamp(36px, 5vw, 56px)',
            animation: 'digitFlipOut 0.25s ease-in forwards',
          }}
        >
          {prev}
        </span>
      )}
    </div>
  );
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const getTime = () => {
    const now = new Date();
    const diff = Math.max(0, targetDate.getTime() - now.getTime());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hrs, mins, secs };
  };

  const [time, setTime] = useState(getTime());
  const [prev, setPrev] = useState(getTime());
  const [flips, setFlips] = useState({ days: false, hrs: false, mins: false, secs: false });
  const [colonVisible, setColonVisible] = useState(true);
  const prevRef = useRef(time);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getTime();
      const cur = prevRef.current;
      setFlips({
        days: next.days !== cur.days,
        hrs: next.hrs !== cur.hrs,
        mins: next.mins !== cur.mins,
        secs: next.secs !== cur.secs,
      });
      setPrev({ ...cur });
      setTime(next);
      prevRef.current = next;
      setColonVisible(v => !v);
      setTimeout(() => setFlips({ days: false, hrs: false, mins: false, secs: false }), 300);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  const units = [
    { key: 'days' as const, label: 'DAYS', value: pad(time.days), prev: pad(prev.days) },
    { key: 'hrs' as const, label: 'HRS', value: pad(time.hrs), prev: pad(prev.hrs) },
    { key: 'mins' as const, label: 'MINS', value: pad(time.mins), prev: pad(prev.mins) },
    { key: 'secs' as const, label: 'SECS', value: pad(time.secs), prev: pad(prev.secs) },
  ];

  return (
    <>
      <style>{`
        @keyframes digitFlipIn {
          from { transform: rotateX(90deg); opacity: 0; }
          to   { transform: rotateX(0deg);  opacity: 1; }
        }
        @keyframes digitFlipOut {
          from { transform: rotateX(0deg);  opacity: 1; }
          to   { transform: rotateX(-90deg); opacity: 0; }
        }
        @keyframes colonBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>

      <div
        className="flex items-center gap-1.5 md:gap-4 px-4 md:px-8 py-3 md:py-5 rounded-xl md:rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '0.5px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {units.map((u, i) => (
          <div key={u.key} className="flex items-center gap-2 md:gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <FlipDigit value={u.value} prev={u.prev} flip={flips[u.key]} />
              <span
                className="font-mono uppercase tracking-[3px] text-white/40"
                style={{ fontSize: 'clamp(7px, 1vw, 10px)' }}
              >
                {u.label}
              </span>
            </div>
            {i < units.length - 1 && (
              <span
                className="font-display font-bold text-[#1a6bff] self-start mt-1"
                style={{
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  lineHeight: 1,
                  animation: 'colonBlink 1s ease-in-out infinite',
                }}
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
