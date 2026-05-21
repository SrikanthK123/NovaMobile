'use client';

import { useState, useRef, useEffect } from 'react';

interface WaitlistFormProps {
  onSuccess?: () => void;
}

export default function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('nova-waitlist-email');
    if (saved) {
      setAlreadyJoined(true);
      setStatus('success');
      setEmail(saved);
    }
  }, []);

  const validateEmail = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email');
      return;
    }

    setStatus('loading');

    // Simulate async submit
    setTimeout(() => {
      localStorage.setItem('nova-waitlist-email', email.trim());
      setStatus('success');
      onSuccess?.();
    }, 1200);
  };

  const isSuccess = status === 'success';
  const isLoading = status === 'loading';

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-[600px]"
        noValidate
      >
        {/* Email Input */}
        <div className="relative flex-1 w-full">
          <input
            ref={inputRef}
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setErrorMsg(''); }}
            disabled={isSuccess || isLoading}
            placeholder="Enter your email address"
            className="w-full h-[52px] rounded-[100px] px-6 font-sans text-[14px] text-white outline-none transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: errorMsg
                ? '1px solid #ff4444'
                : isSuccess
                ? '1px solid #00c864'
                : 'var(--input-border, 1px solid rgba(255,255,255,0.12))',
              boxShadow: isSuccess ? '0 0 0 3px rgba(0,200,100,0.1)' : 'none',
              caretColor: '#1a6bff',
            }}
            onFocus={e => {
              if (!isSuccess && !errorMsg) {
                e.target.style.setProperty('--input-border', '1px solid #1a6bff');
                e.target.style.boxShadow = '0 0 0 3px rgba(26,107,255,0.15)';
              }
            }}
            onBlur={e => {
              if (!isSuccess && !errorMsg) {
                e.target.style.setProperty('--input-border', '1px solid rgba(255,255,255,0.12)');
                e.target.style.boxShadow = 'none';
              }
            }}
          />
          <style>{`
            input::placeholder { color: rgba(255,255,255,0.3); }
          `}</style>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isSuccess}
          className="shrink-0 h-[52px] rounded-[100px] font-sans font-semibold transition-all duration-250 cursor-pointer relative overflow-hidden"
          style={{
            padding: isLoading ? '0' : '0 32px',
            width: isLoading ? '52px' : 'auto',
            background: isSuccess
              ? 'rgba(0,200,100,0.15)'
              : '#1a6bff',
            border: isSuccess ? '1px solid #00c864' : 'none',
            color: isSuccess ? '#00c864' : 'white',
            fontSize: '12px',
            letterSpacing: '3px',
            boxShadow: isSuccess ? 'none' : '0 0 30px rgba(26,107,255,0.35)',
            transform: 'scale(1)',
          }}
          onMouseEnter={e => {
            if (!isLoading && !isSuccess) {
              (e.currentTarget as HTMLButtonElement).style.background = '#2a7bff';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 50px rgba(26,107,255,0.5)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)';
            }
          }}
          onMouseLeave={e => {
            if (!isLoading && !isSuccess) {
              (e.currentTarget as HTMLButtonElement).style.background = '#1a6bff';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 30px rgba(26,107,255,0.35)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }
          }}
        >
          {isLoading ? (
            <span
              className="block w-5 h-5 rounded-full border-2 border-white/30 border-t-white mx-auto"
              style={{ animation: 'spin 0.7s linear infinite' }}
            />
          ) : isSuccess ? (
            <span className="tracking-[2px] text-[11px] font-bold">
              {alreadyJoined ? '✓ ALREADY JOINED' : '✓ YOU\'RE ON THE LIST'}
            </span>
          ) : (
            'JOIN WAITLIST'
          )}
        </button>
      </form>

      {/* Error message */}
      {errorMsg && (
        <p className="text-[11px] text-[#ff4444] mt-[-8px] self-start ml-4 transition-opacity duration-200">
          {errorMsg}
        </p>
      )}

      {/* Social proof */}
      <div className="flex items-center gap-3 mt-1">
        {/* Avatar stack */}
        <div className="flex -space-x-2">
          {[
            'from-[#1a6bff] to-[#7c3aed]',
            'from-[#ff3366] to-[#7c3aed]',
            'from-emerald-500 to-[#1a6bff]',
          ].map((grad, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full bg-gradient-to-tr ${grad} border border-[#050508] flex items-center justify-center text-[7px] font-bold text-white`}
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
        <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Join 847,293 people already waiting
        </span>
      </div>

      {/* Trust badges */}
      <div className="flex items-center gap-4 mt-1 select-none">
        {['🔒 Secure', '📦 Early Access', '🎮 Exclusive'].map((badge, i) => (
          <div key={badge} className="flex items-center gap-4">
            <span
              className="text-[11px] tracking-[2px]"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              {badge}
            </span>
            {i < 2 && (
              <div
                className="w-px h-3 shrink-0"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              />
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
