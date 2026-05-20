'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'motion/react';
import { ParticleBurst, ParticleBurstRef } from './ParticleBurst';

// ── TYPES & INTERFACES ──
interface CardData {
  id: number;
  app: string;
  label: string;
}

const CARD_DATA: CardData[] = [
  { id: 1, app: 'camera',  label: 'ProVision Camera' },
  { id: 2, app: 'ai',      label: 'Nova Mind' },
  { id: 3, app: 'health',  label: 'BioCore Health' },
  { id: 4, app: 'wallet',  label: 'Nova Pay' },
  { id: 5, app: 'music',   label: 'SoundSpace' },
  { id: 6, app: 'maps',    label: 'Nova Navigate' },
];

// Fan positions at scroll 30% for desktop
// Inner cards (idx 2 & 3) use wider ±170px spread to prevent overlap with the center card
const FAN_CONFIG = [
  { x: -580, y: 40,  rotY: 35,  rotZ: -5, scale: 0.82 },
  { x: -310, y: 15,  rotY: 20,  rotZ: -2, scale: 0.88 },
  { x: -170, y: 5,   rotY: 10,  rotZ: -1, scale: 0.93 },
  { x:  170, y: 5,   rotY: -10, rotZ:  1, scale: 0.93 },
  { x:  310, y: 15,  rotY: -20, rotZ:  2, scale: 0.88 },
  { x:  580, y: 40,  rotY: -35, rotZ:  5, scale: 0.82 },
];


// ── INDIVIDUAL CARD UI COMPONENTS (REAL JSX MOCKUPS) ──

const CameraCard = React.memo(() => (
  <div className="w-full h-full bg-[#000008] text-white flex flex-col font-sans select-none overflow-hidden relative">
    {/* status bar */}
    <div className="px-4 pt-4 pb-2 flex justify-between items-center text-[9px] text-white/50 border-b border-white/[0.05]">
      <span>09:41 AM</span>
      <div className="flex items-center gap-1.5">
        <span>5G</span>
        <span className="w-3.5 h-2 border border-white/40 rounded-[2px] flex items-center p-[1px]"><span className="w-full h-full bg-white rounded-[1px]"/></span>
      </div>
    </div>
    {/* Viewfinder */}
    <div className="flex-1 bg-[#020210] relative flex items-center justify-center overflow-hidden">
      {/* Deep space cosmic styling background */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_#112244_0%,_transparent_70%)]" />
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="w-64 h-64 border border-dashed border-white rounded-full animate-[spin_40s_linear_infinite]" />
      </div>
      {/* Crosshair */}
      <div className="w-16 h-16 border border-[#1a6bff]/40 rounded-lg relative flex items-center justify-center">
        <div className="absolute top-[-3px] left-[-3px] w-3 h-3 border-t-2 border-l-2 border-[#1a6bff] rounded-tl-sm" />
        <div className="absolute top-[-3px] right-[-3px] w-3 h-3 border-t-2 border-r-2 border-[#1a6bff] rounded-tr-sm" />
        <div className="absolute bottom-[-3px] left-[-3px] w-3 h-3 border-b-2 border-l-2 border-[#1a6bff] rounded-bl-sm" />
        <div className="absolute bottom-[-3px] right-[-3px] w-3 h-3 border-b-2 border-r-2 border-[#1a6bff] rounded-br-sm" />
        <div className="w-1 h-1 bg-[#1a6bff] rounded-full animate-ping" />
      </div>
      {/* 200MP Badge */}
      <div className="absolute top-4 left-4 bg-[#1a6bff] text-white text-[9px] font-extrabold px-2 py-0.5 rounded tracking-widest shadow-[0_0_10px_rgba(26,107,255,0.4)]">
        200MP MODE
      </div>
      {/* Zoom Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md text-[8px] font-mono px-3 py-1 rounded-full border border-white/[0.08] flex gap-2">
        <span className="text-white/40">0.5x</span>
        <span className="text-white font-bold text-[#1a6bff]">1.0x</span>
        <span className="text-white/40">5x</span>
        <span className="text-white/40">10x</span>
      </div>
    </div>
    {/* Mode Selector */}
    <div className="py-2.5 px-4 bg-black/90 flex justify-between items-center border-t border-white/[0.05]">
      {['SLO-MO', 'VIDEO', 'PHOTO', 'PORTRAIT', 'PRO'].map(m => (
        <span key={m} className={`text-[8px] font-bold tracking-wider ${m === 'PHOTO' ? 'text-[#1a6bff]' : 'text-white/40'}`}>{m}</span>
      ))}
    </div>
    {/* Shutter Row */}
    <div className="py-4 px-6 bg-black flex justify-between items-center">
      {/* Gallery preview */}
      <div className="w-8 h-8 rounded-full border border-white/20 bg-cover bg-center overflow-hidden bg-[#111]" style={{ backgroundImage: `url('${import.meta.env.BASE_URL}images/MobileWallpaper.png')` }} />
      {/* Shutter btn */}
      <div className="w-12 h-12 rounded-full border-[3px] border-white flex items-center justify-center p-[2px]">
        <div className="w-full h-full bg-white rounded-full hover:scale-95 transition-transform" />
      </div>
      {/* Camera switch */}
      <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/75 text-xs">
        ↻
      </div>
    </div>
  </div>
));
CameraCard.displayName = 'CameraCard';

const AICard = React.memo(() => (
  <div className="w-full h-full bg-[#050510] text-white flex flex-col font-sans select-none overflow-hidden relative">
    {/* status bar */}
    <div className="px-4 pt-4 pb-2 flex justify-between items-center text-[9px] text-white/50 border-b border-white/[0.05]">
      <span>09:41 AM</span>
      <div className="flex items-center gap-1.5">
        <span>5G</span>
        <span className="w-3.5 h-2 border border-white/40 rounded-[2px] flex items-center p-[1px]"><span className="w-full h-full bg-white rounded-[1px]"/></span>
      </div>
    </div>
    {/* Header */}
    <div className="p-4 border-b border-[#1a6bff]/20 flex items-center gap-3 bg-black/30">
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1a6bff] to-[#7c3aed] flex items-center justify-center font-bold text-sm text-white shadow-[0_0_15px_rgba(26,107,255,0.3)]">
        N
      </div>
      <div>
        <h4 className="text-xs font-bold text-white tracking-wide leading-none">NOVA MIND</h4>
        <span className="text-[7px] font-mono text-[#1a6bff] tracking-widest uppercase flex items-center gap-1 mt-1">
          <span className="w-1 h-1 bg-[#1a6bff] rounded-full animate-pulse" />
          AI SYNAPSE ACTIVE
        </span>
      </div>
    </div>
    {/* Chat Area */}
    <div className="flex-1 p-3.5 flex flex-col gap-3 overflow-y-auto bg-[#030307]">
      <div className="self-end max-w-[80%] bg-[#1a6bff] text-white text-[9px] px-3 py-2 rounded-2xl rounded-tr-sm shadow-[0_5px_15px_rgba(26,107,255,0.15)] leading-relaxed">
        NOVA MIND operations readout?
      </div>
      <div className="self-start max-w-[85%] bg-white/5 text-white/90 text-[9px] px-3 py-2 rounded-2xl rounded-tl-sm border border-white/5 shadow-md leading-relaxed">
        Operating at <strong>40 TOPS</strong> utilizing the 3nm flagship core. Core thermal metrics stable at 36.4°C.
      </div>
      {/* Waveform graphic */}
      <div className="mt-2 p-2 bg-[#1a6bff]/5 border border-[#1a6bff]/10 rounded-xl flex flex-col gap-1">
        <span className="text-[6px] font-mono text-[#1a6bff] uppercase tracking-wider">VOICE SYNC OSCILLOSCOPE</span>
        <div className="h-6 flex items-center justify-center gap-[2px] px-1">
          {[20, 60, 40, 80, 50, 70, 30, 90, 40, 85, 30, 60, 20].map((h, idx) => (
            <div
              key={idx}
              className="flex-1 bg-gradient-to-t from-[#1a6bff] to-[#7c3aed] rounded-full"
              style={{
                height: `${h}%`,
                animation: `selfiePulse 1.2s ease-in-out infinite`,
                animationDelay: `${idx * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
    {/* Input bar */}
    <div className="p-3 border-t border-white/[0.05] bg-black/60 flex items-center gap-2">
      <input
        disabled
        placeholder="Ask NOVA anything..."
        className="flex-1 bg-white/5 border border-white/[0.08] rounded-full px-4 py-2 text-[9px] text-white/80 placeholder-white/30 focus:outline-none"
      />
      <div className="w-7 h-7 rounded-full bg-[#1a6bff] flex items-center justify-center text-white text-[9px] shrink-0 font-bold">
        ▲
      </div>
    </div>
  </div>
));
AICard.displayName = 'AICard';

const HealthCard = React.memo(() => (
  <div className="w-full h-full bg-[#050209] text-white flex flex-col font-sans select-none overflow-hidden relative">
    {/* status bar */}
    <div className="px-4 pt-4 pb-2 flex justify-between items-center text-[9px] text-white/50 border-b border-white/[0.05]">
      <span>09:41 AM</span>
      <div className="flex items-center gap-1.5">
        <span>5G</span>
        <span className="w-3.5 h-2 border border-white/40 rounded-[2px] flex items-center p-[1px]"><span className="w-full h-full bg-white rounded-[1px]"/></span>
      </div>
    </div>
    {/* Header */}
    <div className="p-4 flex justify-between items-center border-b border-white/[0.05] bg-black/20">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#ff3366] animate-pulse" />
        <h4 className="text-xs font-bold text-white tracking-wider leading-none">BIOCORE HEALTH</h4>
      </div>
      <span className="text-[7px] font-mono text-white/55">ACTIVE SYNC</span>
    </div>
    {/* Content */}
    <div className="flex-1 p-4 flex flex-col justify-around gap-2.5 bg-[#030105]">
      {/* Ring and Heart Rate */}
      <div className="flex justify-between items-center gap-3">
        {/* Circular progress */}
        <div className="w-20 h-20 rounded-full border-4 border-white/[0.03] relative flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full border-[3px] border-[#ff3366]/10" />
          <div className="absolute inset-0 rounded-full border-[3px] border-t-[#ff3366] border-r-[#7c3aed] border-b-transparent border-l-transparent transform rotate-45" />
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-mono text-white/40">STEPS</span>
            <span className="text-[11px] font-extrabold">12,847</span>
            <span className="text-[6px] text-emerald-400 font-bold mt-0.5">128%</span>
          </div>
        </div>
        {/* Heart rate & vitals */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="bg-white/5 border border-white/5 rounded-xl p-2 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[7px] text-white/40 uppercase font-bold tracking-wider leading-none">HEART RATE</span>
              <span className="text-xs font-extrabold text-[#ff3366] mt-1">72 <span className="text-[8px] font-normal text-white/50">BPM</span></span>
            </div>
            <span className="text-xs text-[#ff3366] animate-pulse">♥</span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-xl p-2 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[7px] text-white/40 uppercase font-bold tracking-wider leading-none">BIO-SYNC</span>
              <span className="text-xs font-extrabold text-[#7c3aed] mt-1">92<span className="text-[8px] font-normal text-white/50">/100</span></span>
            </div>
            <span className="text-[6px] text-emerald-400 font-bold uppercase">OPT</span>
          </div>
        </div>
      </div>
      {/* Vitals chart */}
      <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[7px] text-white/40 uppercase font-bold tracking-widest leading-none">METRIC CHART (24H)</span>
          <span className="text-[6px] text-white/70 bg-[#ff3366]/20 px-2 py-0.5 rounded-full font-bold">ECG OK</span>
        </div>
        {/* Simulated chart */}
        <div className="flex items-end gap-1 h-12 w-full px-1 border-b border-white/10">
          {[40, 60, 50, 75, 90, 80, 70, 85, 100, 75, 65, 80].map((h, idx) => (
            <div key={idx} className="flex-1 bg-gradient-to-t from-[#ff3366] to-[#7c3aed] rounded-t-[1px]" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  </div>
));
HealthCard.displayName = 'HealthCard';

const WalletCard = React.memo(() => (
  <div className="w-full h-full bg-[#030307] text-white flex flex-col font-sans select-none overflow-hidden relative">
    {/* status bar */}
    <div className="px-4 pt-4 pb-2 flex justify-between items-center text-[9px] text-white/50 border-b border-white/[0.05]">
      <span>09:41 AM</span>
      <div className="flex items-center gap-1.5">
        <span>5G</span>
        <span className="w-3.5 h-2 border border-white/40 rounded-[2px] flex items-center p-[1px]"><span className="w-full h-full bg-white rounded-[1px]"/></span>
      </div>
    </div>
    {/* Header */}
    <div className="p-4 flex justify-between items-center border-b border-white/[0.05] bg-black/20">
      <h4 className="text-xs font-bold text-white tracking-widest uppercase leading-none">NOVA PAY</h4>
      <span className="text-[7px] font-mono text-emerald-400 font-bold">NFC SYNCED</span>
    </div>
    {/* Credit Card mockup */}
    <div className="p-4 flex-1 flex flex-col gap-3 justify-center bg-[#010103]">
      <div className="w-full h-24 rounded-2xl bg-gradient-to-br from-[#1a6bff] via-[#7c3aed] to-[#ff3366] p-3 flex flex-col justify-between relative overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
        <div className="absolute -inset-1 opacity-20 bg-[radial-gradient(circle_at_bottom_right,_white_0%,_transparent_60%)]" />
        <div className="flex justify-between items-start">
          <span className="text-[9px] font-bold tracking-widest">NOVA PAY</span>
          <div className="w-6 h-4 rounded bg-white/20 backdrop-blur-sm border border-white/10" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-mono tracking-widest text-white/95">**** **** **** 2026</span>
          <div className="flex justify-between items-center mt-1">
            <span className="text-[7px] text-white/60 tracking-wider">SECURE SHIELD</span>
            <span className="text-[7px] text-white/60 tracking-wider">05/31</span>
          </div>
        </div>
      </div>
      {/* Balance Display */}
      <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[7px] text-white/40 uppercase font-bold tracking-wider leading-none">BALANCE</span>
          <span className="text-sm font-extrabold text-white mt-1">$2,847.50</span>
        </div>
        <div className="w-6 h-6 rounded-full bg-[#1a6bff]/20 border border-[#1a6bff]/30 flex items-center justify-center text-[#1a6bff] text-xs font-bold font-mono">+</div>
      </div>
      {/* Recent transaction */}
      <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex flex-col">
        <span className="text-[7px] text-white/40 uppercase font-bold tracking-widest mb-1.5 leading-none">RECENT</span>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[7px] font-bold font-mono">S</div>
            <span className="text-[8px] font-bold text-white/90">System Audio</span>
          </div>
          <span className="text-[8px] font-bold text-white">-$14.99</span>
        </div>
      </div>
    </div>
  </div>
));
WalletCard.displayName = 'WalletCard';

const MusicCard = React.memo(() => (
  <div className="w-full h-full bg-[#030107] text-white flex flex-col font-sans select-none overflow-hidden relative">
    {/* status bar */}
    <div className="px-4 pt-4 pb-2 flex justify-between items-center text-[9px] text-white/50 border-b border-white/[0.05]">
      <span>09:41 AM</span>
      <span className="text-[#1a6bff] tracking-widest font-mono text-[7px]">SPATIAL</span>
    </div>
    {/* Vinyl/Nebula Disk Art */}
    <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3 bg-[#010003]">
      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#7c3aed] via-[#ff3366] to-[#00d4ff] flex items-center justify-center relative shadow-[0_10px_25px_rgba(124,58,237,0.3)]">
        <div className="w-9 h-9 rounded-full bg-black/80 flex items-center justify-center border border-white/10">
          <div className="w-2 h-2 rounded-full bg-[#1a6bff] animate-ping" />
        </div>
        <div className="absolute inset-2 border border-white/10 rounded-full animate-[spin_6s_linear_infinite]" />
      </div>
      <div className="text-center space-y-0.5">
        <h4 className="text-[11px] font-bold text-white tracking-wider leading-none">NOVA SOUND</h4>
        <p className="text-[8px] text-[#7c3aed] font-medium leading-none">SYSTEM CORE AUDIO</p>
      </div>
      {/* Animated bars visualizer */}
      <div className="w-full h-6 flex items-end justify-center gap-[2px] px-4">
        {[20, 50, 80, 40, 90, 60, 30, 70, 45, 80, 55, 65, 30, 40].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-gradient-to-t from-[#1a6bff] to-[#7c3aed] rounded-t-[1px]"
            style={{
              height: `${h}%`,
              animation: `selfiePulse 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      {/* Controls */}
      <div className="w-full flex justify-around items-center px-6 mt-1 text-[9px] text-white/50">
        <span>◀◀</span>
        <div className="w-7 h-7 rounded-full bg-[#1a6bff] flex items-center justify-center text-white font-bold text-[8px]">
          ■
        </div>
        <span>▶▶</span>
      </div>
    </div>
  </div>
));
MusicCard.displayName = 'MusicCard';

const MapsCard = React.memo(() => (
  <div className="w-full h-full bg-[#040508] text-white flex flex-col font-sans select-none overflow-hidden relative">
    {/* status bar */}
    <div className="px-4 pt-4 pb-2 flex justify-between items-center text-[9px] text-white/50 border-b border-white/[0.05]">
      <span>09:41 AM</span>
      <div className="flex items-center gap-1.5">
        <span>5G</span>
        <span className="w-3.5 h-2 border border-white/40 rounded-[2px] flex items-center p-[1px]"><span className="w-full h-full bg-white rounded-[1px]"/></span>
      </div>
    </div>
    {/* Header */}
    <div className="p-3 bg-black/60 border-b border-white/[0.05] flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#1a6bff] animate-ping" />
        <h4 className="text-xs font-bold tracking-wider leading-none">NOVA NAVIGATE</h4>
      </div>
      <span className="text-[6px] font-mono text-[#1a6bff] bg-[#1a6bff]/10 px-1.5 py-0.5 rounded leading-none">GPS OK</span>
    </div>
    {/* Map Viewport */}
    <div className="flex-1 relative bg-[#06060c] overflow-hidden flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M 0 10 L 100 10 M 0 30 L 100 30 M 0 50 L 100 50 M 0 70 L 100 70 M 0 90 L 100 90" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <path d="M 10 0 L 10 100 M 30 0 L 30 100 M 50 0 L 50 100 M 70 0 L 70 100 M 90 0 L 90 100" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <path d="M 15 80 L 35 60 L 35 35 L 75 35 L 85 15" fill="none" stroke="#1a6bff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="75" cy="35" r="3" fill="#00d4ff" />
      </svg>
      {/* Navigation Info Card */}
      <div className="absolute top-2 left-2 right-2 bg-black/90 border border-white/[0.08] backdrop-blur-md rounded-xl p-2 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#1a6bff] flex items-center justify-center text-[9px] font-bold">
            ↑
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-bold leading-tight">In 400 ft, turn left</span>
            <span className="text-[6px] text-white/50 mt-0.5 leading-none">Nebula Way, Sector 4</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-extrabold text-[#1a6bff] leading-none">1.2 MI</span>
          <span className="text-[6px] text-emerald-400 font-bold mt-1 leading-none">3 MIN</span>
        </div>
      </div>
      {/* Speed Indicator */}
      <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md rounded-full border border-white/10 w-9 h-9 flex flex-col items-center justify-center shadow-md">
        <span className="text-[9px] font-extrabold text-[#00d4ff] leading-none">65</span>
        <span className="text-[5px] text-white/40 tracking-tighter mt-0.5 uppercase leading-none">MPH</span>
      </div>
    </div>
  </div>
));
MapsCard.displayName = 'MapsCard';

// ── CSS PHONE FRAME WRAPPER ──
interface CSSPhoneFrameProps {
  children: React.ReactNode;
  borderWidth?: number;
  width?: string;
  height?: string;
}

const CSSPhoneFrame = React.memo(({ children, width = '100%', height = '100%' }: CSSPhoneFrameProps) => {
  return (
    <div className="relative pointer-events-auto" style={{ width, height, padding: '3px' }}>
      {/* Outer chassis / bezel */}
      <div
        className="absolute rounded-[35px] bg-gradient-to-b from-[#1b1b22] via-[#09090b] to-[#121216] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.22),inset_0_-1px_1px_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.15),0_30px_70px_rgba(0,0,0,0.95)] pointer-events-none"
        style={{ zIndex: 1, inset: '-3px' }}
      >
        {/* Volume buttons */}
        <div className="absolute -left-[5px] top-[26%] w-[5px] h-12 rounded-l-full bg-gradient-to-b from-[#3c3c46] to-[#1c1c22] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]" />
        <div className="absolute -left-[5px] top-[38%] w-[5px] h-9  rounded-l-full bg-gradient-to-b from-[#3c3c46] to-[#1c1c22] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]" />
        {/* Power */}
        <div className="absolute -right-[5px] top-[30%] w-[5px] h-14 rounded-r-full bg-gradient-to-b from-[#3c3c46] to-[#1c1c22] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]" />
      </div>

      {/* Screen container */}
      <div
        className="relative w-full h-full bg-black overflow-hidden"
        style={{
          borderRadius: '32px',
          zIndex: 2,
        }}
      >
        {/* Selfie Camera Punch-Hole */}
        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[11px] h-[11px] rounded-full bg-black flex items-center justify-center border border-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.15),0_1px_1px_rgba(0,0,0,0.8)] z-50">
          <div className="w-[5px] h-[5px] rounded-full bg-gradient-to-tr from-[#020e26] to-[#0d2a5c] border border-cyan-500/20 relative">
            <div className="absolute top-[0.5px] left-[0.5px] w-[0.8px] h-[0.8px] rounded-full bg-white/80" />
          </div>
        </div>

        {/* Dynamic Glow Overlay to resemble mobile glass — kept light to preserve screen brightness */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/8 via-transparent to-blue-900/12 mix-blend-color-dodge pointer-events-none z-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 pointer-events-none z-40" />

        {children}
      </div>
    </div>
  );
});
CSSPhoneFrame.displayName = 'CSSPhoneFrame';

// ── PHONE HOME SCREEN COMPONENT (live clock) ──
const HomeScreenContent = () => {
  const [now, setNow] = useState(() => new Date());

  // Update every second so the displayed time is always current
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Status bar: "12:36 PM"  |  Widget: "12:36"  |  Date: "TUESDAY, MAY 20"
  const statusTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const bigTime    = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr    = now.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  }).toUpperCase();

  return (
    <div className="w-full h-full bg-black text-white flex flex-col font-sans select-none overflow-hidden relative">
      {/* status bar */}
      <div className="px-4 pt-4 pb-2 flex justify-between items-center text-[9px] text-white/50 z-10">
        <span>{statusTime}</span>
        <div className="flex items-center gap-1.5">
          <span>5G</span>
          <span className="w-3.5 h-2 border border-white/40 rounded-[2px] flex items-center p-[1px]"><span className="w-full h-full bg-white rounded-[1px]"/></span>
        </div>
      </div>

      {/* Background removed so only time + app grid (screenshot) are visible on mobile */}

      {/* Live Time Widget */}
      <div className="relative z-10 flex flex-col items-center mt-12 mb-8 text-center">
        <span className="text-3xl font-extrabold tracking-tight drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]">{bigTime}</span>
        <span className="text-[8px] font-mono tracking-[3px] text-white/60 uppercase mt-1 drop-shadow-md">{dateStr}</span>
      </div>

      {/* Apps Grid */}
      <div className="relative z-10 grid grid-cols-3 gap-y-6 gap-x-4 px-6 flex-1 items-start content-start">
        {[
          { name: 'Camera',     icon: '📸', color: 'from-amber-600 to-red-600' },
          { name: 'Nova Mind',  icon: '🧠', color: 'from-[#1a6bff] to-[#7c3aed]' },
          { name: 'BioCore',   icon: '♥',  color: 'from-pink-600 to-[#7c3aed]' },
          { name: 'Nova Pay',  icon: '💳', color: 'from-emerald-600 to-[#1a6bff]' },
          { name: 'SoundSpace',icon: '🎵', color: 'from-indigo-600 to-purple-600' },
          { name: 'Navigate',  icon: '🧭', color: 'from-cyan-600 to-blue-600' }
        ].map((app, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${app.color} flex items-center justify-center text-lg shadow-lg group-active:scale-95 transition-all border border-white/10`}>
              {app.icon}
            </div>
            <span className="text-[7.5px] font-medium tracking-wide text-white/80 drop-shadow-sm">{app.name}</span>
          </div>
        ))}
      </div>

      {/* Dock */}
      <div className="relative z-10 px-4 pb-6 mt-auto">
        <div className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl py-2 px-3 flex justify-between items-center gap-2">
          {['📞', '💬', '🌐', '⚙️'].map((ico, idx) => (
            <div key={idx} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-base hover:scale-105 active:scale-95 transition-transform cursor-pointer">
              {ico}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── THE FULL APP SHOWCASE COMPONENT ──
export default function NovaOSShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const particleBurstRef = useRef<ParticleBurstRef>(null);

  // States for responsive logic (SSR safe)
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [activeMobileIdx, setActiveMobileIdx] = useState(0);
  const [mobileScreenIdx, setMobileScreenIdx] = useState(0);

  // Scroll bindings for desktop / tablet
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end']
  });

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── ACT 1 HEADING TEXT TRANSFORMS ──
  const act1Opacity = useTransform(scrollYProgress, [0.00, 0.05, 0.25, 0.30], [0, 1, 1, 0]);
  const act1Y = useTransform(scrollYProgress, [0.00, 0.05, 0.25, 0.30], [20, 0, 0, -20]);

  // ── ACT 2 HEADING TEXT TRANSFORMS ──
  const act2Opacity = useTransform(scrollYProgress, [0.30, 0.35, 0.60, 0.65], [0, 1, 1, 0]);
  const act2Y = useTransform(scrollYProgress, [0.30, 0.35, 0.60, 0.65], [20, 0, 0, -20]);

  // ── ACT 2 STAGGERED APP LABELS ──
  // Renders a row of app sub-labels that glow up when they converge
  const labelCameraOpacity = useTransform(scrollYProgress, [0.32, 0.35, 0.58, 0.62], [0, 1, 1, 0]);
  const labelAIOpacity = useTransform(scrollYProgress, [0.34, 0.37, 0.58, 0.62], [0, 1, 1, 0]);
  const labelHealthOpacity = useTransform(scrollYProgress, [0.36, 0.39, 0.58, 0.62], [0, 1, 1, 0]);
  const labelWalletOpacity = useTransform(scrollYProgress, [0.38, 0.41, 0.58, 0.62], [0, 1, 1, 0]);
  const labelMusicOpacity = useTransform(scrollYProgress, [0.40, 0.43, 0.58, 0.62], [0, 1, 1, 0]);
  const labelMapsOpacity = useTransform(scrollYProgress, [0.42, 0.45, 0.58, 0.62], [0, 1, 1, 0]);

  // ── ACT 3 PHONE CONTAINER TRANSFORM ──
  const phoneScale = useTransform(scrollYProgress, [0.30, 0.60, 0.65], [0.95, 0.95, 1.0]);
  const frameOpacity = useTransform(scrollYProgress, [0.60, 0.65], [0, 1]);
  // Fade the original HealthCard UI OUT as the phone frame fades IN → prevents double-screen bleedthrough
  const cardOriginalOpacity2 = useTransform(scrollYProgress, [0.58, 0.64], [1, 0]);

  // Dim overlay for non-main side cards: fade IN to 55% black as cards fan out, fade OUT as they converge
  // Creates the premium "depth-of-field" effect: centre card is bright, side cards dim when spread
  const sideCardDimOverlay = useTransform(
    scrollYProgress,
    [0.00, 0.12, 0.30, 0.52, 0.65],
    [0,    0,    0.55, 0.55, 0]
  );

  // Inside phone scrolling mockup: Page scroll 65% -> 100% maps to Y offset inside phone screen
  const desktopScrollRange = -4 * 554;
  const tabletScrollRange = -4 * 474;
  const phoneContentY = useTransform(
    scrollYProgress,
    [0.65, 1.0],
    [0, isTablet ? tabletScrollRange : desktopScrollRange]
  );

  // ── ACT 3 FEATURE CALLOUT TRANSFORMS ──
  // Callout 1 (Camera, Section 2): Left Side
  const callout1Opacity = useTransform(scrollYProgress, [0.67, 0.70, 0.76, 0.79], [0, 1, 1, 0]);
  const callout1X = useTransform(scrollYProgress, [0.67, 0.70, 0.76, 0.79], [-30, 0, 0, -30]);

  // Callout 2 (AI, Section 3): Right Side
  const callout2Opacity = useTransform(scrollYProgress, [0.75, 0.78, 0.84, 0.87], [0, 1, 1, 0]);
  const callout2X = useTransform(scrollYProgress, [0.75, 0.78, 0.84, 0.87], [30, 0, 0, 30]);

  // Callout 3 (Music, Section 4): Left Side
  const callout3Opacity = useTransform(scrollYProgress, [0.83, 0.86, 0.92, 0.95], [0, 1, 1, 0]);
  const callout3X = useTransform(scrollYProgress, [0.83, 0.86, 0.92, 0.95], [-30, 0, 0, -30]);

  // Callout 4 (Pay, Section 5): Right Side
  const callout4Opacity = useTransform(scrollYProgress, [0.91, 0.94, 0.98, 1.00], [0, 1, 1, 1]);
  const callout4X = useTransform(scrollYProgress, [0.91, 0.94, 0.98, 1.00], [30, 0, 0, 0]);

  // ── PARTICLE BURST TRIGGER ──
  // Triggers once exactly when scroll hits 62%
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (!isMobile) {
      if (latest >= 0.62 && latest <= 0.635) {
        particleBurstRef.current?.trigger();
      }
    }
  });

  // ── MOBILE AUTOPLAY LOOPS ──
  useEffect(() => {
    if (!isMobile) return;

    // Autoplay phone mockup internal screens every 3 seconds
    // 6 screens: 0=Home, 1=Camera, 2=AI, 3=Health, 4=Music, 5=Wallet
    const interval = setInterval(() => {
      setMobileScreenIdx((prev) => (prev + 1) % 6);
    }, 3000);

    return () => clearInterval(interval);
  }, [isMobile]);

  // Stagger entry animations for mobile cards
  const [mobileCardsVisible, setMobileCardsVisible] = useState(false);
  useEffect(() => {
    if (!isMobile) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMobileCardsVisible(true);
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  // ── DYNAMIC CARD ANIMATIONS (DECLARED AT TOP-LEVEL TO SATISFY RULES OF HOOKS) ──
  const willChangeTransform = useTransform(scrollYProgress, [0.0, 0.70, 1.0], ['transform', 'transform', 'auto']);

  // Card 0 (Camera)
  const cardX0 = useTransform(scrollYProgress, [0.00, 0.30, 0.65, 1.00], [0, isTablet ? FAN_CONFIG[0].x * 0.6 : FAN_CONFIG[0].x, 0, 0]);
  const cardY0 = useTransform(scrollYProgress, [0.00, 0.30, 0.65, 1.00], [0, FAN_CONFIG[0].y, 0, 0]);
  const cardRotY0 = useTransform(scrollYProgress, [0.00, 0.30, 0.65, 1.00], [0, FAN_CONFIG[0].rotY, 0, 0]);
  const cardRotZ0 = useTransform(scrollYProgress, [0.00, 0.30, 0.65, 1.00], [0, FAN_CONFIG[0].rotZ, 0, 0]);
  const cardScale0 = useTransform(scrollYProgress, [0.00, 0.30, 0.65, 1.00], [1, FAN_CONFIG[0].scale, 0.0, 0.0]);
  const cardOpacity0 = useTransform(scrollYProgress, [0.00, 0.30, 0.60, 0.65, 1.00], [1, 1, 1, 0, 0]);

  // Card 1 (AI)
  const cardX1 = useTransform(scrollYProgress, [0.01, 0.30, 0.65, 1.00], [0, isTablet ? FAN_CONFIG[1].x * 0.6 : FAN_CONFIG[1].x, 0, 0]);
  const cardY1 = useTransform(scrollYProgress, [0.01, 0.30, 0.65, 1.00], [0, FAN_CONFIG[1].y, 0, 0]);
  const cardRotY1 = useTransform(scrollYProgress, [0.01, 0.30, 0.65, 1.00], [0, FAN_CONFIG[1].rotY, 0, 0]);
  const cardRotZ1 = useTransform(scrollYProgress, [0.01, 0.30, 0.65, 1.00], [0, FAN_CONFIG[1].rotZ, 0, 0]);
  const cardScale1 = useTransform(scrollYProgress, [0.01, 0.30, 0.65, 1.00], [1, FAN_CONFIG[1].scale, 0.0, 0.0]);
  const cardOpacity1 = useTransform(scrollYProgress, [0.01, 0.30, 0.60, 0.65, 1.00], [1, 1, 1, 0, 0]);

  // Card 2 (Health - Main card)
  const cardX2 = useTransform(scrollYProgress, [0.02, 0.30, 0.65, 1.00], [0, isTablet ? FAN_CONFIG[2].x * 0.6 : FAN_CONFIG[2].x, 0, 0]);
  const cardY2 = useTransform(scrollYProgress, [0.02, 0.30, 0.65, 1.00], [0, FAN_CONFIG[2].y, 0, 0]);
  const cardRotY2 = useTransform(scrollYProgress, [0.02, 0.30, 0.65, 1.00], [0, FAN_CONFIG[2].rotY, 0, 0]);
  const cardRotZ2 = useTransform(scrollYProgress, [0.02, 0.30, 0.65, 1.00], [0, FAN_CONFIG[2].rotZ, 0, 0]);
  const cardScale2 = useTransform(scrollYProgress, [0.02, 0.30, 0.65, 1.00], [1, FAN_CONFIG[2].scale, 1.0, 1.0]);
  const cardOpacity2 = useTransform(scrollYProgress, [0.02, 0.30, 0.60, 0.65, 1.00], [1, 1, 1, 1, 1]);
  const cardBorderRadius2 = useTransform(scrollYProgress, [0.30, 0.60, 0.65], ['8px', '8px', '35px']);
  const cardInnerBorderRadius2 = useTransform(scrollYProgress, [0.30, 0.60, 0.65], ['6px', '6px', '32px']);

  // Card 3 (Wallet)
  const cardX3 = useTransform(scrollYProgress, [0.03, 0.30, 0.65, 1.00], [0, isTablet ? FAN_CONFIG[3].x * 0.6 : FAN_CONFIG[3].x, 0, 0]);
  const cardY3 = useTransform(scrollYProgress, [0.03, 0.30, 0.65, 1.00], [0, FAN_CONFIG[3].y, 0, 0]);
  const cardRotY3 = useTransform(scrollYProgress, [0.03, 0.30, 0.65, 1.00], [0, FAN_CONFIG[3].rotY, 0, 0]);
  const cardRotZ3 = useTransform(scrollYProgress, [0.03, 0.30, 0.65, 1.00], [0, FAN_CONFIG[3].rotZ, 0, 0]);
  const cardScale3 = useTransform(scrollYProgress, [0.03, 0.30, 0.65, 1.00], [1, FAN_CONFIG[3].scale, 0.0, 0.0]);
  const cardOpacity3 = useTransform(scrollYProgress, [0.03, 0.30, 0.60, 0.65, 1.00], [1, 1, 1, 0, 0]);

  // Card 4 (Music)
  const cardX4 = useTransform(scrollYProgress, [0.04, 0.30, 0.65, 1.00], [0, isTablet ? FAN_CONFIG[4].x * 0.6 : FAN_CONFIG[4].x, 0, 0]);
  const cardY4 = useTransform(scrollYProgress, [0.04, 0.30, 0.65, 1.00], [0, FAN_CONFIG[4].y, 0, 0]);
  const cardRotY4 = useTransform(scrollYProgress, [0.04, 0.30, 0.65, 1.00], [0, FAN_CONFIG[4].rotY, 0, 0]);
  const cardRotZ4 = useTransform(scrollYProgress, [0.04, 0.30, 0.65, 1.00], [0, FAN_CONFIG[4].rotZ, 0, 0]);
  const cardScale4 = useTransform(scrollYProgress, [0.04, 0.30, 0.65, 1.00], [1, FAN_CONFIG[4].scale, 0.0, 0.0]);
  const cardOpacity4 = useTransform(scrollYProgress, [0.04, 0.30, 0.60, 0.65, 1.00], [1, 1, 1, 0, 0]);

  // Card 5 (Maps)
  const cardX5 = useTransform(scrollYProgress, [0.05, 0.30, 0.65, 1.00], [0, isTablet ? FAN_CONFIG[5].x * 0.6 : FAN_CONFIG[5].x, 0, 0]);
  const cardY5 = useTransform(scrollYProgress, [0.05, 0.30, 0.65, 1.00], [0, FAN_CONFIG[5].y, 0, 0]);
  const cardRotY5 = useTransform(scrollYProgress, [0.05, 0.30, 0.65, 1.00], [0, FAN_CONFIG[5].rotY, 0, 0]);
  const cardRotZ5 = useTransform(scrollYProgress, [0.05, 0.30, 0.65, 1.00], [0, FAN_CONFIG[5].rotZ, 0, 0]);
  const cardScale5 = useTransform(scrollYProgress, [0.05, 0.30, 0.65, 1.00], [1, FAN_CONFIG[5].scale, 0.0, 0.0]);
  const cardOpacity5 = useTransform(scrollYProgress, [0.05, 0.30, 0.60, 0.65, 1.00], [1, 1, 1, 0, 0]);

  // Map individual transforms into the cards array without any React hooks inside useMemo
  const cards = useMemo(() => {
    return [
      {
        ...CARD_DATA[0],
        style: {
          x: cardX0,
          y: cardY0,
          rotateY: cardRotY0,
          rotateZ: cardRotZ0,
          scale: cardScale0,
          opacity: cardOpacity0,
          willChange: willChangeTransform,
          transformPerspective: 1200,
        },
        ui: <CameraCard />
      },
      {
        ...CARD_DATA[1],
        style: {
          x: cardX1,
          y: cardY1,
          rotateY: cardRotY1,
          rotateZ: cardRotZ1,
          scale: cardScale1,
          opacity: cardOpacity1,
          willChange: willChangeTransform,
          transformPerspective: 1200,
        },
        ui: <AICard />
      },
      {
        ...CARD_DATA[2],
        style: {
          x: cardX2,
          y: cardY2,
          rotateY: cardRotY2,
          rotateZ: cardRotZ2,
          scale: cardScale2,
          opacity: cardOpacity2,
          willChange: willChangeTransform,
          transformPerspective: 1200,
        },
        ui: <HealthCard />
      },
      {
        ...CARD_DATA[3],
        style: {
          x: cardX3,
          y: cardY3,
          rotateY: cardRotY3,
          rotateZ: cardRotZ3,
          scale: cardScale3,
          opacity: cardOpacity3,
          willChange: willChangeTransform,
          transformPerspective: 1200,
        },
        ui: <WalletCard />
      },
      {
        ...CARD_DATA[4],
        style: {
          x: cardX4,
          y: cardY4,
          rotateY: cardRotY4,
          rotateZ: cardRotZ4,
          scale: cardScale4,
          opacity: cardOpacity4,
          willChange: willChangeTransform,
          transformPerspective: 1200,
        },
        ui: <MusicCard />
      },
      {
        ...CARD_DATA[5],
        style: {
          x: cardX5,
          y: cardY5,
          rotateY: cardRotY5,
          rotateZ: cardRotZ5,
          scale: cardScale5,
          opacity: cardOpacity5,
          willChange: willChangeTransform,
          transformPerspective: 1200,
        },
        ui: <MapsCard />
      }
    ];
  }, [
    cardX0, cardY0, cardRotY0, cardRotZ0, cardScale0, cardOpacity0,
    cardX1, cardY1, cardRotY1, cardRotZ1, cardScale1, cardOpacity1,
    cardX2, cardY2, cardRotY2, cardRotZ2, cardScale2, cardOpacity2,
    cardX3, cardY3, cardRotY3, cardRotZ3, cardScale3, cardOpacity3,
    cardX4, cardY4, cardRotY4, cardRotZ4, cardScale4, cardOpacity4,
    cardX5, cardY5, cardRotY5, cardRotZ5, cardScale5, cardOpacity5,
    willChangeTransform
  ]);

  // Dimensions based on tablet/desktop sizes
  const cardWidth = isTablet ? '190px' : '220px';
  const cardHeight = isTablet ? '380px' : '440px';
  const phoneWidth = isTablet ? '240px' : '280px';
  const phoneHeight = isTablet ? '480px' : '560px';

  // ── RENDER MOBILE VIEW ──
  if (isMobile) {
    return (
      <section
        id="nova-os"
        ref={sectionRef}
        className="w-full bg-[#050508] py-20 px-6 text-white relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Header */}
          <div className="text-center mb-12 select-none">
            <span className="text-[10px] tracking-[6px] text-[#1a6bff] uppercase font-bold block mb-3">
              [ Flagship OS Showcase ]
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase leading-tight tracking-tight">
              NOVA OS — LIFE ELEVATED
            </h2>
            <p className="text-white/50 tracking-wide font-mono text-[9px] uppercase mt-2">
              Six billion lines of intelligence. One OS.
            </p>
          </div>

          {/* Autoplay CSS Phone mockups — carousel removed for mobile, just show the phone */}
          <div className="w-full flex flex-col items-center">
            <div className="text-center mb-8 select-none">
              <span className="text-[8px] font-mono tracking-[4px] text-[#1a6bff] uppercase font-bold block mb-1">
                [ OS ARCHITECTURE ]
              </span>
              <h3 className="text-xl font-bold uppercase tracking-tight text-white">INTERACTION ECOSYSTEM</h3>
            </div>

            {/* Simulated Frame */}
            <div className="w-[280px] h-[520px] relative rounded-[30px] border border-white/[0.08] shadow-2xl bg-black overflow-hidden flex items-center justify-center p-2 mb-8">
              {/* volume keys */}
              <div className="absolute -left-[3px] top-[26%] w-[3px] h-8 bg-white/20 rounded-l" />
              <div className="absolute -right-[3px] top-[30%] w-[3px] h-10 bg-white/20 rounded-r" />
              <div className="absolute top-[10px] w-10 h-3 bg-black rounded-full z-50 border border-white/10" />

              {/* AnimatePresence ensures only ONE screen renders at a time with a smooth
                  crossfade — prevents double-screen ghosting seen previously */}
              <div className="w-full h-full rounded-[26px] overflow-hidden relative">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mobileScreenIdx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: 'easeInOut' }}
                    className="absolute inset-0"
                  >
                    {mobileScreenIdx === 0 && <HomeScreenContent />}
                    {mobileScreenIdx === 1 && <CameraCard />}
                    {mobileScreenIdx === 2 && <AICard />}
                    {mobileScreenIdx === 3 && <HealthCard />}
                    {mobileScreenIdx === 4 && <MusicCard />}
                    {mobileScreenIdx === 5 && <WalletCard />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Callouts beneath phone for Mobile */}
            <div className="w-full max-w-sm flex flex-col gap-4">
              <AnimatePresence mode="wait">
                {mobileScreenIdx === 1 && (
                  <motion.div
                    key="camera"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center"
                  >
                    <h4 className="text-[#1a6bff] text-xs font-mono font-bold tracking-[2px] mb-1">200MP PROVISION</h4>
                    <p className="text-white/70 text-[10px] uppercase tracking-wider font-light">Captures light invisible to the human eye</p>
                  </motion.div>
                )}
                {mobileScreenIdx === 2 && (
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center"
                  >
                    <h4 className="text-[#1a6bff] text-xs font-mono font-bold tracking-[2px] mb-1">NOVA MIND AI</h4>
                    <p className="text-white/70 text-[10px] uppercase tracking-wider font-light">Processes 40 trillion operations per second</p>
                  </motion.div>
                )}
                {mobileScreenIdx === 3 && (
                  <motion.div
                    key="health"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-white/5 border border-[#ff3366]/20 rounded-2xl text-center"
                  >
                    <h4 className="text-[#ff3366] text-xs font-mono font-bold tracking-[2px] mb-1">BIOCORE HEALTH</h4>
                    <p className="text-white/70 text-[10px] uppercase tracking-wider font-light">Real-time biometrics, 24/7 ECG monitoring</p>
                  </motion.div>
                )}
                {mobileScreenIdx === 4 && (
                  <motion.div
                    key="music"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center"
                  >
                    <h4 className="text-[#1a6bff] text-xs font-mono font-bold tracking-[2px] mb-1">SPATIAL AUDIO</h4>
                    <p className="text-white/70 text-[10px] uppercase tracking-wider font-light">24-bit lossless, every frequency perfectly placed</p>
                  </motion.div>
                )}
                {mobileScreenIdx === 5 && (
                  <motion.div
                    key="pay"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center"
                  >
                    <h4 className="text-[#1a6bff] text-xs font-mono font-bold tracking-[2px] mb-1">NOVA PAY</h4>
                    <p className="text-white/70 text-[10px] uppercase tracking-wider font-light">Military-grade encryption. One tap checkout.</p>
                  </motion.div>
                )}
                {mobileScreenIdx === 0 && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-[#1a6bff]/10 border border-[#1a6bff]/20 rounded-2xl text-center shadow-[0_0_15px_rgba(26,107,255,0.15)]"
                  >
                    <h4 className="text-white text-xs font-mono font-bold tracking-[2px] mb-1">NOVA OS HOME</h4>
                    <p className="text-white/70 text-[10px] uppercase tracking-wider font-light">Your unified interface to absolute performance</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── DESKTOP / TABLET SCROLL-DRIVEN VIEW ──
  return (
    <section
      id="nova-os"
      ref={sectionRef}
      className="relative w-full bg-[#050508]"
      style={{ height: '500vh' }} // Slow scroll path
    >
      {/* STICKY CONTAINER */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Particle Burst Overlay */}
        <ParticleBurst ref={particleBurstRef} />

        {/* ── ACT 1 HEADING TEXT ── */}
        <motion.div
          style={{ opacity: act1Opacity, y: act1Y }}
          className="absolute top-[6%] text-center pointer-events-none select-none z-[48] flex flex-col items-center"
        >
          <h2 className="text-5xl md:text-7xl font-display font-extrabold leading-none text-white tracking-[-2px] uppercase">
            NOVA OS
          </h2>
          <p className="text-white/50 font-sans text-sm md:text-lg tracking-widest uppercase mt-3 font-medium">
            Six billion lines of intelligence. One OS.
          </p>
        </motion.div>

        {/* ── ACT 2 HEADING TEXT ── */}
        <motion.div
          style={{ opacity: act2Opacity, y: act2Y }}
          className="absolute top-[6%] text-center pointer-events-none select-none z-[48] flex flex-col items-center"
        >
          <h2 className="text-4xl md:text-6xl font-display font-extrabold leading-none text-white tracking-[-1px] uppercase">
            EVERYTHING YOU NEED
          </h2>
          {/* Staggered flying labels */}
          <div className="flex gap-4 md:gap-6 mt-4 font-mono text-[9px] md:text-[11px] tracking-[4px] uppercase font-bold text-white/50 select-none">
            <motion.span style={{ opacity: labelCameraOpacity }} className="text-[#1a6bff] shadow-[0_0_10px_rgba(26,107,255,0.4)] px-2 py-0.5 rounded border border-[#1a6bff]/20">Camera</motion.span>
            <motion.span style={{ opacity: labelAIOpacity }} className="text-[#7c3aed] px-2 py-0.5 rounded border border-[#7c3aed]/20">AI</motion.span>
            <motion.span style={{ opacity: labelHealthOpacity }} className="text-[#ff3366] px-2 py-0.5 rounded border border-[#ff3366]/20">Health</motion.span>
            <motion.span style={{ opacity: labelWalletOpacity }} className="text-emerald-400 px-2 py-0.5 rounded border border-emerald-400/20">Pay</motion.span>
            <motion.span style={{ opacity: labelMusicOpacity }} className="text-purple-400 px-2 py-0.5 rounded border border-purple-400/20">Music</motion.span>
            <motion.span style={{ opacity: labelMapsOpacity }} className="text-cyan-400 px-2 py-0.5 rounded border border-cyan-400/20">Maps</motion.span>
          </div>
        </motion.div>

        {/* ── ACT 3 FEATURE CALLOUTS (BESIDE PHONE) ── */}
        {/* Left Side Callout 1 (Camera) */}
        <motion.div
          style={{ opacity: callout1Opacity, x: callout1X }}
          className="absolute top-[calc(50%+50px)] -translate-y-1/2 left-[calc(50%-230px)] md:left-[calc(50%-340px)] w-[160px] md:w-[220px] z-[48] pointer-events-none select-none text-left"
        >
          <span className="text-[9px] font-mono tracking-[4px] text-[#1a6bff] uppercase font-bold block mb-1">
            [ OPTICAL CORE ]
          </span>
          <h3 className="text-lg md:text-2xl font-display font-extrabold uppercase leading-none tracking-tight text-white mb-2">
            200MP PROVISION
          </h3>
          <p className="text-white/60 font-sans text-[10px] md:text-xs tracking-wider leading-relaxed">
            Captures light invisible to the human eye with 16-in-1 pixel fusion.
          </p>
        </motion.div>

        {/* Right Side Callout 2 (AI Assistant) */}
        <motion.div
          style={{ opacity: callout2Opacity, x: callout2X }}
          className="absolute top-[calc(50%+50px)] -translate-y-1/2 right-[calc(50%-230px)] md:right-[calc(50%-340px)] w-[160px] md:w-[220px] z-[48] pointer-events-none select-none text-right"
        >
          <span className="text-[9px] font-mono tracking-[4px] text-[#7c3aed] uppercase font-bold block mb-1">
            [ COGNITIVE CORE ]
          </span>
          <h3 className="text-lg md:text-2xl font-display font-extrabold uppercase leading-none tracking-tight text-white mb-2">
            NOVA MIND AI
          </h3>
          <p className="text-white/60 font-sans text-[10px] md:text-xs tracking-wider leading-relaxed">
            Processes 40 trillion operations per second on-device.
          </p>
        </motion.div>

        {/* Left Side Callout 3 (Music Player) */}
        <motion.div
          style={{ opacity: callout3Opacity, x: callout3X }}
          className="absolute top-[calc(50%+50px)] -translate-y-1/2 left-[calc(50%-230px)] md:left-[calc(50%-340px)] w-[160px] md:w-[220px] z-[48] pointer-events-none select-none text-left"
        >
          <span className="text-[9px] font-mono tracking-[4px] text-purple-400 uppercase font-bold block mb-1">
            [ ACOUSTIC CORE ]
          </span>
          <h3 className="text-lg md:text-2xl font-display font-extrabold uppercase leading-none tracking-tight text-white mb-2">
            SPATIAL AUDIO
          </h3>
          <p className="text-white/60 font-sans text-[10px] md:text-xs tracking-wider leading-relaxed">
            24-bit lossless playback with holographic 3D frequency placement.
          </p>
        </motion.div>

        {/* Right Side Callout 4 (Nova Pay) */}
        <motion.div
          style={{ opacity: callout4Opacity, x: callout4X }}
          className="absolute top-[calc(50%+50px)] -translate-y-1/2 right-[calc(50%-230px)] md:right-[calc(50%-340px)] w-[160px] md:w-[220px] z-[48] pointer-events-none select-none text-right"
        >
          <span className="text-[9px] font-mono tracking-[4px] text-emerald-400 uppercase font-bold block mb-1">
            [ SECURITY CORE ]
          </span>
          <h3 className="text-lg md:text-2xl font-display font-extrabold uppercase leading-none tracking-tight text-white mb-2">
            NOVA PAY
          </h3>
          <p className="text-white/60 font-sans text-[10px] md:text-xs tracking-wider leading-relaxed">
            Military-grade bio-encryption for one-tap checkout.
          </p>
        </motion.div>

        {/* ── CARDS FAN / COLLAPSE ZONE ── */}
        <div
          className="relative flex items-center justify-center select-none"
          style={{
            width: phoneWidth,
            height: phoneHeight,
            perspective: '1200px',
            // preserve-3d removed: letting CSS z-index control stacking order so right cards
            // properly sit BEHIND the center card instead of fighting the 3D Z-axis
            transform: 'translateY(50px)', // Shifting fanning zone down by 50px to resolve heading overlaps
          }}
        >
          {cards.map((card, idx) => {
            const isMainCard = idx === 2;

            return (
              <motion.div
                key={card.id}
                className="absolute origin-center bg-black border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden"
                style={{
                  ...card.style,
                  borderRadius: isMainCard ? cardBorderRadius2 : '8px',
                  width: cardWidth,
                  height: cardHeight,
                  zIndex: isMainCard ? 30 : 20 - idx,
                }}
              >
                {/* Glowing conic gradient border */}
                <motion.div
                  className="card-glow"
                  style={{ borderRadius: isMainCard ? cardBorderRadius2 : '8px' }}
                />

                {/* Card Inner Content */}
                <motion.div
                  className="absolute inset-[2px] overflow-hidden bg-black z-10"
                  style={{ borderRadius: isMainCard ? cardInnerBorderRadius2 : '6px' }}
                >
                  {/* For Card 3, inside Act 3 (scroll > 65%), we render the nested CSSPhoneFrame with internal scroll content! */}
                  {isMainCard ? (
                    <motion.div style={{ opacity: frameOpacity }} className="w-full h-full absolute inset-0 z-20">
                      <CSSPhoneFrame width="100%" height="100%">
                        {/* Internal scroll viewport container */}
                        <div className="w-full h-full overflow-hidden relative">
                          <motion.div
                            className="absolute top-0 left-0 w-full flex flex-col"
                            style={{
                              y: phoneContentY,
                              height: isTablet ? '2370px' : '2770px', // 5 screens: Home, Camera, AI, Music, Pay
                            }}
                          >
                            {/* Screen 1: Home Screen */}
                            <div style={{ height: isTablet ? '474px' : '554px' }} className="w-full shrink-0">
                              <HomeScreenContent />
                            </div>
                            {/* Screen 2: Camera Mode */}
                            <div style={{ height: isTablet ? '474px' : '554px' }} className="w-full shrink-0">
                              <CameraCard />
                            </div>
                            {/* Screen 3: AI Assistant */}
                            <div style={{ height: isTablet ? '474px' : '554px' }} className="w-full shrink-0">
                              <AICard />
                            </div>
                            {/* Screen 4: Music Player */}
                            <div style={{ height: isTablet ? '474px' : '554px' }} className="w-full shrink-0">
                              <MusicCard />
                            </div>
                            {/* Screen 5: NOVA Pay */}
                            <div style={{ height: isTablet ? '474px' : '554px' }} className="w-full shrink-0">
                              <WalletCard />
                            </div>
                          </motion.div>
                        </div>
                      </CSSPhoneFrame>
                    </motion.div>
                  ) : null}

                  {/* Original card UI shown during Act 1 and Act 2.
                      For the main card (idx 2), fade it OUT as the phone frame fades IN
                      to prevent both screens rendering simultaneously. */}
                  <motion.div
                    className="w-full h-full absolute inset-0 z-0"
                    style={isMainCard ? { opacity: cardOriginalOpacity2 } : {}}
                  >
                    {card.ui}
                  </motion.div>

                  {/* Depth-of-field dim overlay for side cards: darkens when spread, clears when converged.
                      Hidden for the main center card (idx 2) which always stays fully bright. */}
                  {!isMainCard && (
                    <motion.div
                      className="absolute inset-0 bg-black pointer-events-none z-[25]"
                      style={{ opacity: sideCardDimOverlay }}
                    />
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
