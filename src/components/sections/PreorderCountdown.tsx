'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Preorder target date: exactly 90 days from first page load
const TARGET_DATE = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

interface FlipNumberProps {
  val: string | number;
}

function FlipDigit({ val }: FlipNumberProps) {
  return (
    <div 
      style={{ perspective: '400px' }}
      className="relative w-[34px] sm:w-[50px] md:w-[70px] h-[50px] sm:h-[75px] md:h-[95px] bg-[#0c0c16]/95 border border-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)]"
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={val}
          initial={{ rotateX: 85, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: -85, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute text-2xl sm:text-5xl md:text-7xl font-display font-extrabold text-white tracking-tight"
          style={{ backfaceVisibility: 'hidden', fontVariantNumeric: 'tabular-nums' }}
        >
          {val}
        </motion.span>
      </AnimatePresence>
      
      {/* Visual horizontal split crease on flip card */}
      <div className="absolute left-0 right-0 h-[1px] bg-black/40 top-1/2" />
    </div>
  );
}

export default function PreorderCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: '90',
    hours: '00',
    mins: '00',
    secs: '00',
  });

  // Email form states
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const difference = TARGET_DATE.getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({ days: '00', hours: '00', mins: '00', secs: '00' });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((difference / 1000 / 60) % 60);
      const secs = Math.floor((difference / 1000) % 60);

      setTimeLeft({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        mins: String(mins).padStart(2, '0'),
        secs: String(secs).padStart(2, '0'),
      });
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailRegex.test(email)) {
      setIsValid(true);
      setSubmitted(true);
    } else {
      setIsValid(false);
    }
  };

  return (
    <section
      id="countdown"
      style={{
        background: 'radial-gradient(circle, #081120 0%, #010103 100%)',
      }}
      className="relative min-h-screen py-24 px-6 md:px-12 flex flex-col justify-center items-center overflow-hidden"
    >
      <div className="max-w-4xl w-full flex flex-col items-center select-none text-center">
        
        {/* Headline */}
        <span className="text-[12px] md:text-[14px] tracking-[8px] text-white/50 uppercase font-mono font-bold mb-10">
          LAUNCHES IN
        </span>

        {/* --- COUNTDOWN DISPLAY --- */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-5 mb-16">
          
          {/* Days */}
          <div className="flex flex-col items-center">
            <div className="flex gap-0.5 sm:gap-1 md:gap-1.5">
              <FlipDigit val={timeLeft.days[0]} />
              <FlipDigit val={timeLeft.days[1]} />
            </div>
            <span className="text-[9px] md:text-[11px] tracking-[4px] text-white/40 uppercase mt-4 font-mono">
              DAYS
            </span>
          </div>

          {/* Separator */}
          <span className="text-xl sm:text-3xl md:text-5xl font-display font-extrabold text-[#1a6bff] animate-pulse -translate-y-2 sm:-translate-y-4">
            :
          </span>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="flex gap-0.5 sm:gap-1 md:gap-1.5">
              <FlipDigit val={timeLeft.hours[0]} />
              <FlipDigit val={timeLeft.hours[1]} />
            </div>
            <span className="text-[9px] md:text-[11px] tracking-[4px] text-white/40 uppercase mt-4 font-mono">
              HOURS
            </span>
          </div>

          {/* Separator */}
          <span className="text-xl sm:text-3xl md:text-5xl font-display font-extrabold text-[#1a6bff] animate-pulse -translate-y-2 sm:-translate-y-4">
            :
          </span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="flex gap-0.5 sm:gap-1 md:gap-1.5">
              <FlipDigit val={timeLeft.mins[0]} />
              <FlipDigit val={timeLeft.mins[1]} />
            </div>
            <span className="text-[9px] md:text-[11px] tracking-[4px] text-white/40 uppercase mt-4 font-mono">
              MINS
            </span>
          </div>

          {/* Separator */}
          <span className="text-xl sm:text-3xl md:text-5xl font-display font-extrabold text-[#1a6bff] animate-pulse -translate-y-2 sm:-translate-y-4">
            :
          </span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className="flex gap-0.5 sm:gap-1 md:gap-1.5">
              <FlipDigit val={timeLeft.secs[0]} />
              <FlipDigit val={timeLeft.secs[1]} />
            </div>
            <span className="text-[9px] md:text-[11px] tracking-[4px] text-white/40 uppercase mt-4 font-mono">
              SECS
            </span>
          </div>

        </div>

        {/* --- FORM SECTION --- */}
        <div className="w-full max-w-lg bg-white/5 border border-white/5 rounded-3xl p-6 md:p-10 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <p className="text-xs md:text-sm text-white/60 tracking-wider font-mono">
                  Join <span className="text-brand-cobalt font-extrabold">847,293 people</span> currently on the waitlist
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 w-full">
                  <div className="flex-grow flex flex-col items-start gap-1">
                    <input
                      type="text"
                      placeholder="ENTER EMAIL ADDRESS"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setIsValid(true);
                      }}
                      className={`w-full px-5 py-3.5 bg-black/40 border ${
                        isValid ? 'border-white/10' : 'border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                      } text-white placeholder-white/30 rounded-full font-mono text-[10px] md:text-[11px] tracking-[2px] focus:outline-none focus:border-brand-cobalt transition-all uppercase`}
                    />
                    {!isValid && (
                      <span className="text-[8px] font-mono text-red-500 tracking-[1.5px] uppercase mt-1 pl-4">
                        * Please provide a valid email *
                      </span>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-[#1a6bff] hover:bg-[#1559d4] hover:shadow-[0_0_20px_rgba(26,107,255,0.6)] text-white rounded-full font-display font-extrabold text-[9px] md:text-[11px] tracking-[2px] transition-all uppercase"
                  >
                    NOTIFY ME
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-4 space-y-3"
              >
                {/* Glowing checkmark */}
                <div className="w-12 h-12 rounded-full border-2 border-brand-cobalt flex items-center justify-center text-brand-cobalt font-extrabold text-xl shadow-[0_0_15px_rgba(26,107,255,0.4)] animate-bounce">
                  ✓
                </div>
                <h4 className="text-white font-display text-base font-extrabold uppercase tracking-widest mt-2">
                  YOU'RE ON THE LIST
                </h4>
                <p className="text-[#1a6bff] font-mono text-[9px] md:text-[10px] tracking-[3px] uppercase">
                  WE'LL NOTIFY YOU FIRST.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
