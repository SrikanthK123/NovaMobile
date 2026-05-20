'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import GalaxyParticles from './GalaxyParticles';
import MagneticButton from '../ui/MagneticButton';

export default function CSSPhone({ active = false }: { active?: boolean }) {
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const stickyRef   = useRef<HTMLDivElement>(null);
  const phoneRef    = useRef<HTMLDivElement>(null);
  const frameRef    = useRef<HTMLDivElement>(null);
  const screenRef   = useRef<HTMLDivElement>(null);
  const wallRef     = useRef<HTMLDivElement>(null);
  const lockRef     = useRef<HTMLDivElement>(null);
  const tagsRef     = useRef<HTMLDivElement>(null);
  const titleRef    = useRef<HTMLDivElement>(null);
  const btnRef      = useRef<HTMLDivElement>(null);
  const featRef     = useRef<HTMLDivElement>(null);
  const hudRef      = useRef<HTMLDivElement>(null);
  const hardwareRef = useRef<HTMLDivElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);
  const videoOverlayRef = useRef<HTMLDivElement>(null);

  const [currentTime, setCurrentTime] = useState('10:08');
  const [currentDate, setCurrentDate] = useState('TUESDAY, MAY 18');
  const baseUrl = import.meta.env.BASE_URL;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setCurrentTime(`${hours}:${minutes} ${ampm}`);

      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
      
      const dayName = days[now.getDay()];
      const monthName = months[now.getMonth()];
      const dayNum = now.getDate();
      
      setCurrentDate(`${dayName}, ${monthName} ${dayNum}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const wallpaperUrl = `${baseUrl}images/MobileWallpaper.png`;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Handle entry animation of interactive tags/buttons when active changes to true
  useEffect(() => {
    const title = titleRef.current;
    const phone = phoneRef.current;
    const tagsContainer = tagsRef.current;
    const lock = lockRef.current;
    const btn = btnRef.current;

    if (!active) {
      // Initialize states to hidden
      gsap.set([title, lock, btn], { opacity: 0, y: 30 });
      gsap.set(phone, { opacity: 0, scale: 0.9 });
      if (tagsContainer) {
        gsap.set(tagsContainer.children, { opacity: 0, y: 20 });
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
      return;
    }

    // Play buttery-smooth cinematic stagger fade in
    const tl = gsap.timeline();

    // Reset display properties
    tl.set([title, lock, btn, phone, frameRef.current, hardwareRef.current], { display: '' });
    tl.set(hardwareRef.current, { opacity: 1 });
    if (tagsContainer) {
      tl.set([tagsContainer, ...Array.from(tagsContainer.children)], { display: '' });
    }

    // 1. Fade & Scale in mockup phone
    tl.to(phone, {
      opacity: 1,
      scale: 1.0,
      duration: 1.2,
      ease: 'power3.out'
    });

    // 2. Fade in background NOVA title
    tl.to(title, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power2.out'
    }, '-=0.9');

    // 3. Stagger in feature tags
    if (tagsContainer && tagsContainer.children.length > 0) {
      tl.to(tagsContainer.children, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out'
      }, '-=0.8');
    }

    // 4. Stagger in remaining interactive elements (lockscreen, CTA)
    tl.to([lock, btn], {
      opacity: 1,
      y: 0,
      duration: 1.0,
      stagger: 0.15,
      ease: 'power3.out'
    }, '-=0.6');

    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }

  }, [active]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ── master timeline scrubbed to section scroll ── */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger:  wrapperRef.current,
          start:    'top top',
          end:      'bottom bottom',
          scrub:    2.2,
          pin:      false,            // sticky is handled by CSS
          invalidateOnRefresh: true,
        },
      });

      /* ═══════════════════════════════════════════════════════════
         PHASE 1  (progress 0 → 0.30)
         Phone upright, tags/lock-screen/title visible — no animation yet
         Handled by initial CSS state.  This block is a timeline pause.
       ═══════════════════════════════════════════════════════════ */
      tl.to({}, { duration: 0.30 });   // hold at phase-1

      /* ═══════════════════════════════════════════════════════════
         PHASE 2  (progress 0.30 → 0.65)
         • Phone rotates  0deg → -90deg  (portrait → landscape)
         • Phone scales   1.0 → 1.15
         • Tags, lock UI, NOVA title fade to 0
         • Wallpaper brightens
       ═══════════════════════════════════════════════════════════ */
      tl.to(phoneRef.current, {
        rotationZ: -90,
        scale:     1.15,
        transformOrigin: "center center",
        duration:  0.35,
        ease:      'none',
      }, 0.30);

      tl.to([tagsRef.current, lockRef.current, titleRef.current, btnRef.current], {
        opacity:  0,
        y:       -30,
        duration: 0.20,
        ease:    'none',
        stagger:  0.03,
      }, 0.30);

      // Hide elements completely to prevent browser GPU rendering bugs
      tl.set([tagsRef.current, lockRef.current, titleRef.current, btnRef.current], {
        display: 'none'
      }, 0.50);

      tl.to(wallRef.current, {
        filter:   'brightness(1.6) saturate(1.3)',
        duration: 0.35,
        ease:     'none',
      }, 0.30);

      // HUD specs appear during landscape hold
      tl.to(hudRef.current, {
        opacity:  1,
        duration: 0.10,
        ease:     'none',
      }, 0.56);

      tl.to(hudRef.current, {
        opacity:  0,
        duration: 0.08,
        ease:     'none',
      }, 0.64);

      /* ═══════════════════════════════════════════════════════════
         PHASE 3  (progress 0.65 → 1.0)
         • Frame (bezel) fades to 0
         • Wallpaper clip-path expands from phone rect → inset(0%)
         • Fullscreen "CRAFTED FOR THE FUTURE" text fades in
       ═══════════════════════════════════════════════════════════ */

      // Fade the bezel border so only the screen shows
      tl.to(frameRef.current, {
        opacity:      0,
        duration:     0.18,
        ease:         'none',
      }, 0.65);

      // Fade out mockup hardware details (selfie camera, home bar, grade gradients)
      tl.to(hardwareRef.current, {
        opacity:      0,
        duration:     0.15,
        ease:         'none',
      }, 0.65);

      // Hide bezel completely to prevent high-scale overflow and visual layout bugs
      tl.set(frameRef.current, {
        display: 'none'
      }, 0.83);

      // Hide mockup hardware details completely to prevent giant scaling artifacts
      tl.set(hardwareRef.current, {
        display: 'none'
      }, 0.80);

      // Expand the wallpaper to fill viewport using scale + border-radius collapse
      tl.to(screenRef.current, {
        // At this point the screen div is inside a rotated 1.15x phone.
        // We override its transform separately so it "pops" to fullscreen.
        scale:        20,       // 20× a ~280px div = 5600px — covers any screen
        borderRadius: 0,
        duration:     0.35,
        ease:         'power2.inOut',
      }, 0.65);

      // Counter-scale the wallpaper so it stays crisp and doesn't get pixelated
      // Parent scales to 20x, so scaling child to 0.08x results in a beautiful, crisp 1.6x overall zoom.
      tl.to(wallRef.current, {
        scale:        0.08,
        transformOrigin: "center center",
        duration:     0.35,
        ease:         'power2.inOut',
      }, 0.65);

      // Counter-scale the video so it stays crisp and matches the wallpaper
      tl.to(videoRef.current, {
        scale:        0.08,
        transformOrigin: "center center",
        duration:     0.35,
        ease:         'power2.inOut',
      }, 0.65);

      // Counter-scale the video overlay so it stays crisp and matches the wallpaper
      tl.to(videoOverlayRef.current, {
        scale:        0.08,
        transformOrigin: "center center",
        duration:     0.35,
        ease:         'power2.inOut',
      }, 0.65);

      // Fade in the video so it shows instead of the image when zoomed
      tl.to(videoRef.current, {
        opacity:      1,
        duration:     0.25,
        ease:         'power2.out',
      }, 0.65);

      // Fade out the static wallpaper when the video fades in
      tl.to(wallRef.current, {
        opacity:      0,
        duration:     0.25,
        ease:         'power2.out',
      }, 0.65);

      // Fade in the video overlay so it shows instead of the image when zoomed
      tl.to(videoOverlayRef.current, {
        opacity:      1,
        duration:     0.25,
        ease:         'power2.out',
      }, 0.65);

      // phoneRef is NOT faded out here so the wallpaper remains the full-screen background
      // until the next section natively scrolls over it.

      // Features text fades in over the fullscreen wallpaper
      tl.to(featRef.current, {
        opacity:  1,
        y:        0,
        duration: 0.12,
        ease:     'power1.out',
      }, 0.72);

      // Fade out "CRAFTED FOR THE FUTURE" text before Features section panels scroll up
      tl.to(featRef.current, {
        opacity:  0,
        y:        -30,
        duration: 0.12,
        ease:     'power1.in',
      }, 0.88);

      // Direct instant fade-out to bypass the 2.2s scrub lag and prevent any overlapping
      ScrollTrigger.create({
        trigger: '#features',
        start: 'top 20%',
        onEnter: () => {
          gsap.to(featRef.current, { opacity: 0, y: -30, duration: 0.2, overwrite: 'auto' });
        },
        onLeaveBack: () => {
          gsap.to(featRef.current, { opacity: 1, y: 0, duration: 0.2, overwrite: 'auto' });
        }
      });

    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    /**
     * SCROLL WRAPPER — 150vh makes the animation snappy and fast.
     */
    <div id="home" ref={wrapperRef} className="relative w-full" style={{ height: '150vh' }}>

      {/* FIXED FRAME — stays locked to viewport during scroll and behind subsequent content */}
      <div
        ref={stickyRef}
        className="fixed inset-0 h-screen w-full overflow-hidden bg-[#050508] flex items-center justify-center z-[1]"
      >
        <GalaxyParticles />

        {/* ── NOVA TITLE (behind phone) ── */}
        <div
          ref={titleRef}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-[20]"
        >
          <h1 className="text-[18vw] md:text-[12vw] font-display font-extrabold leading-none text-white/[0.08] tracking-[-0.02em] uppercase">
            NOVA
          </h1>
        </div>

        {/* ── FEATURE TAGS ── */}
        <div
          ref={tagsRef}
          className="absolute inset-0 z-[60] pointer-events-none select-none hidden md:block"
        >
          {/* Top-left */}
          <div className="absolute top-[calc(50%-120px)] left-[calc(50%-300px)] flex items-center gap-2 px-3.5 py-2 bg-[#0c0c14]/90 border border-white/[0.15] rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
            <span className="w-1.5 h-1.5 bg-[#1a6bff] rounded-full animate-pulse shadow-[0_0_8px_#1a6bff]" />
            <span className="text-[8px] font-mono tracking-[2px] text-white/80 font-bold uppercase">6.8&quot; AMOLED 120Hz</span>
            <div className="absolute right-[-42px] top-1/2 -translate-y-1/2 w-[42px] h-px bg-gradient-to-r from-white/30 to-transparent" />
          </div>
          {/* Right */}
          <div className="absolute top-[calc(50%-50px)] right-[calc(50%-300px)] flex items-center gap-2 px-3.5 py-2 bg-[#0c0c14]/90 border border-white/[0.15] rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
            <div className="absolute left-[-42px] top-1/2 -translate-y-1/2 w-[42px] h-px bg-gradient-to-l from-white/30 to-transparent" />
            <span className="w-1.5 h-1.5 bg-[#ff3366] rounded-full animate-pulse shadow-[0_0_8px_#ff3366]" />
            <span className="text-[8px] font-mono tracking-[2px] text-white/80 font-bold uppercase">200MP VISION CAMERA</span>
          </div>
          {/* Bottom-left */}
          <div className="absolute top-[calc(50%+80px)] left-[calc(50%-300px)] flex items-center gap-2 px-3.5 py-2 bg-[#0c0c14]/90 border border-white/[0.15] rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-[8px] font-mono tracking-[2px] text-white/80 font-bold uppercase">7000mAh POWERCORE</span>
            <div className="absolute right-[-42px] top-1/2 -translate-y-1/2 w-[42px] h-px bg-gradient-to-r from-white/30 to-transparent" />
          </div>
        </div>

        {/* ═══ THE PHONE — GSAP animates this element ═══ */}
        <div
          ref={phoneRef}
          className="relative z-[40]"
          style={{ width: '280px', height: '590px', transformOrigin: 'center center', willChange: 'transform' }}
        >
          {/* Outer chassis / bezel */}
          <div
            ref={frameRef}
            className="absolute inset-[-3px] rounded-[52px] bg-gradient-to-br from-[#3d3d4d] via-[#1a1a22] to-[#2c2c3c] shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_50px_120px_rgba(0,0,0,0.96)]"
            style={{ zIndex: 1 }}
          >
            {/* Volume buttons */}
            <div className="absolute -left-[6px] top-[26%] w-[5px] h-12 rounded-l-full bg-gradient-to-b from-[#4a4a5a] to-[#3a3a4a]" />
            <div className="absolute -left-[6px] top-[38%] w-[5px] h-9  rounded-l-full bg-gradient-to-b from-[#4a4a5a] to-[#3a3a4a]" />
            {/* Power */}
            <div className="absolute -right-[6px] top-[30%] w-[5px] h-14 rounded-r-full bg-gradient-to-b from-[#4a4a5a] to-[#3a3a4a]" />
          </div>

          {/* Screen container — GSAP scales THIS to fill viewport */}
          <div
            ref={screenRef}
            className="relative z-[2] overflow-hidden bg-black"
            style={{
              width:        '280px',
              height:       '590px',
              borderRadius: '49px',
              transformOrigin: 'center center',
              willChange:   'transform, border-radius',
            }}
          >
            {/* Galaxy wallpaper (rendered on all devices) */}
            <div
              ref={wallRef}
              className="absolute bg-cover bg-center"
              style={{
                backgroundImage: `url('${wallpaperUrl}')`,
                transformOrigin: 'center center',
                willChange: 'transform, opacity',
                top: '-32%',
                bottom: '-32%',
                left: '-32%',
                right: '-32%',
              }}
            />

            {/* Galaxy wallpaper video */}
            <video
              ref={videoRef}
              src={`${baseUrl}images/WallpaperVideo.mp4`}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{
                opacity: 0,
                transformOrigin: 'center center',
                willChange: 'transform, opacity',
              }}
              muted
              loop
              playsInline
            />

            {/* Galaxy wallpaper video overlay to soften brightness */}
            <div
              ref={videoOverlayRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
              style={{
                opacity: 0,
                background: 'linear-gradient(to bottom, rgba(5, 5, 8, 0.45) 0%, rgba(5, 5, 8, 0.25) 50%, rgba(5, 5, 8, 0.45) 100%), radial-gradient(circle, rgba(5, 5, 8, 0.2) 0%, rgba(5, 5, 8, 0.85) 100%)',
                transformOrigin: 'center center',
                willChange: 'transform, opacity',
              }}
            />

            {/* Lock screen UI */}
            <div
              ref={lockRef}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 select-none"
            >
              <span className="text-white text-5xl font-bold tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.9)]">{currentTime}</span>
              <span className="text-white/55 text-[9px] tracking-[5px] font-mono uppercase">{currentDate}</span>
            </div>
            {/* Phone hardware / UI overlays — faded out and hidden during fullscreen scale */}
            <div ref={hardwareRef} className="absolute inset-0 z-10 pointer-events-none">
              {/* Cinematic grade */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-blue-900/25 mix-blend-color-dodge" />
              {/* Vignette */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/45" />

              {/* Selfie Camera Punch-Hole with deep blue inner lens sheen and periodic light pulse */}
              <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[14px] h-[14px] rounded-full bg-black flex items-center justify-center border border-white/10 shadow-[inset_0_1px_3px_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.8)]">
                {/* Inner glass lens reflex */}
                <div className="w-[6px] h-[6px] rounded-full bg-gradient-to-tr from-[#020e26] to-[#0d2a5c] border border-cyan-500/20 relative">
                  {/* reflection dot */}
                  <div className="absolute top-[0.5px] left-[0.5px] w-[1px] h-[1px] rounded-full bg-white/80" />
                </div>
                
                {/* Selfie Camera White Light Ripple (every 5 seconds) */}
                <div className="absolute inset-0 rounded-full border border-white/90 opacity-0 pointer-events-none scale-100 animate-selfie-pulse" />
              </div>
              

            </div>

          </div>
        </div>

        {/* Fullscreen features text — rendered at 1x outside the scaling phone to prevent large layout glitches */}
        <div
          ref={featRef}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 select-none z-[50] pointer-events-none"
          style={{ opacity: 0, transform: 'translateY(30px)' }}
        >
          <span className="px-3.5 py-1.5 rounded-full border border-[#1a6bff]/30 bg-gradient-to-r from-[#1a6bff]/10 to-[#1a6bff]/20 text-[#1a6bff] text-[9px] sm:text-[11px] tracking-[4px] sm:tracking-[6px] mb-4 sm:mb-6 uppercase font-bold font-mono shadow-[0_0_15px_rgba(26,107,255,0.25)] backdrop-blur-md">
            Evolution Complete
          </span>
          <h2 className="text-white text-4xl sm:text-6xl md:text-8xl font-display font-extrabold uppercase leading-[0.95] tracking-tighter drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)] bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">
            CRAFTED FOR<br />THE FUTURE
          </h2>
          <p className="text-white/80 mt-4 sm:mt-6 text-xs sm:text-base md:text-xl tracking-[0.18em] sm:tracking-[0.25em] font-light uppercase max-w-[280px] sm:max-w-xl leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            Optical excellence meets<br className="block sm:hidden" /> unyielding performance.
          </p>
          <div className="mt-6 sm:mt-10 w-24 h-[1.5px] bg-gradient-to-r from-transparent via-[#1a6bff] to-transparent shadow-[0_0_8px_#1a6bff]" />
        </div>

        {/* ── HERO BOTTOM TEXT (tagline + button) ── */}
        <div
          ref={btnRef}
          className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-4 pointer-events-auto select-none"
        >
          <p className="text-white/40 text-[9px] tracking-[6px] uppercase font-bold">BEYOND PERCEPTION</p>
          <MagneticButton
            onClick={() => {
              if (wrapperRef.current) {
                window.scrollTo({ top: wrapperRef.current.offsetTop + window.innerHeight * 1.5, behavior: 'smooth' });
              }
            }}
            className="px-10 py-4 bg-[#1a6bff] text-white rounded-full font-display font-bold text-[11px] tracking-[2px] shadow-[0_0_60px_rgba(26,107,255,0.6)] hover:shadow-[0_0_80px_rgba(26,107,255,0.8)] hover:scale-105 transition-all uppercase"
          >
            EXPLORE NOW
          </MagneticButton>
          {/* Scroll hint */}
          <div className="flex flex-col items-center gap-1 mt-2">
            <p className="text-white/25 text-[7px] tracking-[4px] uppercase">scroll to discover</p>
            <svg className="animate-bounce" width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1 L6 6 L11 1" stroke="#1a6bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* ── HUD SPECS (landscape hold phase) ── */}
        {/* These are driven by GSAP timeline in Phase 2 hold / Phase 3.
            We start them invisible and let GSAP animate them in. */}
        {/* ── HUD SPECS (landscape hold phase) ── */}
        <div ref={hudRef} className="absolute inset-0 z-[80] pointer-events-none opacity-0">
          {/* Left-top: Display */}
          <div className="absolute top-[12%] left-[4%] md:top-[10%] md:left-[5%] flex flex-col items-start gap-1 max-w-[210px] md:max-w-[260px] p-3.5 md:p-0 rounded-2xl md:rounded-none bg-black/40 md:bg-transparent border border-white/5 md:border-none backdrop-blur-md md:backdrop-blur-none shadow-[0_8px_32px_rgba(0,0,0,0.5)] md:shadow-none transition-all duration-300 pointer-events-auto">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 bg-[#1a6bff] rounded-sm animate-pulse shadow-[0_0_10px_rgba(26,107,255,0.8)]" />
              <span className="text-[#1a6bff] text-[8px] md:text-[9px] tracking-[3px] md:tracking-[4px] font-mono uppercase">[ SYS.01 ] DISPLAY</span>
              <div className="h-px w-10 md:w-16 bg-gradient-to-r from-[#1a6bff]/60 to-transparent" />
            </div>
            <h3 className="text-white text-xl sm:text-2xl md:text-5xl font-display font-extrabold uppercase leading-none tracking-tight">8K<br />CINEMA<br />RES</h3>
            <p className="text-white/50 font-mono text-[7px] md:text-[8px] tracking-widest uppercase mt-2 leading-relaxed">ULTRA-DENSE PRECISION<br />120HZ PROMOTION ENGINE</p>
          </div>
          {/* Left-bottom: Chassis */}
          <div className="absolute bottom-[18%] left-[4%] md:bottom-[10%] md:left-[5%] flex flex-col items-start gap-1 max-w-[210px] md:max-w-[260px] p-3.5 md:p-0 rounded-2xl md:rounded-none bg-black/40 md:bg-transparent border border-white/5 md:border-none backdrop-blur-md md:backdrop-blur-none shadow-[0_8px_32px_rgba(0,0,0,0.5)] md:shadow-none transition-all duration-300 pointer-events-auto">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 bg-white rounded-sm animate-pulse" />
              <span className="text-white text-[8px] md:text-[9px] tracking-[3px] md:tracking-[4px] font-mono uppercase">[ MAT.02 ] CHASSIS</span>
              <div className="h-px w-10 md:w-16 bg-gradient-to-r from-white/50 to-transparent" />
            </div>
            <h3 className="text-white text-xl sm:text-2xl md:text-5xl font-display font-extrabold uppercase leading-none tracking-tight">TITANIUM<br />GLASS</h3>
            <p className="text-white/50 font-mono text-[7px] md:text-[8px] tracking-widest uppercase mt-2 leading-relaxed">NANO-CERAMIC SHIELD<br />10X DURABILITY RATING</p>
          </div>
          {/* Right: Sensor */}
          <div className="absolute top-[44%] right-[4%] md:top-1/2 md:-translate-y-1/2 md:right-[5%] flex flex-col items-end text-right gap-1 max-w-[210px] md:max-w-[260px] p-3.5 md:p-0 rounded-2xl md:rounded-none bg-black/40 md:bg-transparent border border-white/5 md:border-none backdrop-blur-md md:backdrop-blur-none shadow-[0_8px_32px_rgba(0,0,0,0.5)] md:shadow-none transition-all duration-300 pointer-events-auto">
            <div className="flex items-center justify-end gap-2 mb-1 flex-row-reverse">
              <div className="w-1.5 h-1.5 bg-[#ff3366] rounded-sm animate-pulse shadow-[0_0_10px_rgba(255,51,102,0.8)]" />
              <span className="text-[#ff3366] text-[8px] md:text-[9px] tracking-[3px] md:tracking-[4px] font-mono uppercase">[ OPT.03 ] SENSOR</span>
              <div className="h-px w-10 md:w-16 bg-gradient-to-l from-[#ff3366]/60 to-transparent" />
            </div>
            <h3 className="text-white text-xl sm:text-2xl md:text-5xl font-display font-extrabold uppercase leading-none tracking-tight">ULTRA<br />COLOR</h3>
            <p className="text-white/50 font-mono text-[7px] md:text-[8px] tracking-widest uppercase mt-2 leading-relaxed">10-BIT CINEMATIC SPACE<br />ΔE &lt; 0.5 CALIBRATION</p>
          </div>
        </div>

      </div>
    </div>
  );
}
