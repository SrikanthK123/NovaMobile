'use client';

import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { Volume2, VolumeX } from 'lucide-react';

export default function AmbientSound() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const ambientSoundRef = useRef<Howl | null>(null);
  const clickSoundRef = useRef<Howl | null>(null);
  const isPlayingRef = useRef(false);

  // Keep isPlayingRef updated to avoid stale closure issues in the global event listener
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    // 1. Initialize Ambient Space Sound Loop (using SoundHelix public electronic track as space hum)
    ambientSoundRef.current = new Howl({
      src: ['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'],
      loop: true,
      volume: 0.15,
      html5: true, // stream large files
      onloaderror: () => console.warn('Ambient soundtrack failed to load. Operating in silent mode.'),
      onplayerror: () => {
        setIsPlaying(false);
      }
    });

    // 2. Initialize Haptic UI Click Sound Effect (using a short Mixkit futuristic UI bubble beep)
    clickSoundRef.current = new Howl({
      src: ['https://assets.mixkit.co/active_storage/sfx/900/900-100.wav'],
      volume: 0.25,
      onloaderror: () => {}
    });

    // Hide tooltip automatically after 5 seconds
    const tooltipTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);

    // Global listener to register clicks and play haptic transition sound
    const handleGlobalClick = () => {
      if (clickSoundRef.current && isPlayingRef.current) {
        clickSoundRef.current.play();
      }
    };

    window.addEventListener('click', handleGlobalClick);

    return () => {
      clearTimeout(tooltipTimer);
      window.removeEventListener('click', handleGlobalClick);
      if (ambientSoundRef.current) {
        ambientSoundRef.current.stop();
        ambientSoundRef.current.unload();
      }
      if (clickSoundRef.current) {
        clickSoundRef.current.unload();
      }
    };
  }, []);

  const toggleSound = () => {
    const ambient = ambientSoundRef.current;
    if (!ambient) return;

    if (isPlaying) {
      ambient.pause();
      setIsPlaying(false);
    } else {
      ambient.play();
      setIsPlaying(true);
      setShowTooltip(false); // Hide tooltip immediately when clicked
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-3 select-none pointer-events-auto">
      
      {/* ── AMBIENT TOOLTIP ── */}
      {showTooltip && (
        <div className="px-4 py-2 bg-gradient-to-r from-brand-cobalt to-[#0a0a0f] border border-[#1a6bff]/40 backdrop-blur-md rounded-xl shadow-[0_10px_25px_rgba(26,107,255,0.25)] animate-bounce max-w-[200px]">
          <span className="text-[9px] font-mono tracking-[1.5px] text-white font-extrabold uppercase leading-none">
            🔊 ENABLE AMBIENT HUM
          </span>
        </div>
      )}

      {/* ── SOUND TOGGLE BUTTON ── */}
      <button
        onClick={toggleSound}
        className="w-11 h-11 rounded-full bg-white/5 border border-white/10 hover:border-[#1a6bff]/50 hover:bg-brand-cobalt/10 backdrop-blur-md flex items-center justify-center relative shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 group hover:scale-105"
      >
        {isPlaying ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Equalizer Visualizer Bars */}
            <div className="flex gap-[2px] items-end justify-center w-5 h-5 absolute inset-0 m-auto">
              <div className="w-[2px] bg-brand-cobalt rounded-full animate-[equalizer_1s_ease-in-out_infinite_alternate]" />
              <div className="w-[2px] bg-brand-cobalt rounded-full animate-[equalizer_0.7s_ease-in-out_infinite_alternate_0.2s]" />
              <div className="w-[2px] bg-brand-cobalt rounded-full animate-[equalizer_1.2s_ease-in-out_infinite_alternate_0.1s]" />
            </div>
            
            {/* Fade-out speaker icon */}
            <Volume2 className="w-4 h-4 text-brand-cobalt opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute" />
          </div>
        ) : (
          <VolumeX className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
        )}
      </button>

      {/* ── CSS KEYFRAMES FOR EQUALIZER INLINED ── */}
      <style>{`
        @keyframes equalizer {
          0% {
            height: 4px;
          }
          100% {
            height: 16px;
          }
        }
      `}</style>
    </div>
  );
}
