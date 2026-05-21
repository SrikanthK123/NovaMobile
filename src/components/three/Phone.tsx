import { useRef, forwardRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, useTexture, Circle, Text } from '@react-three/drei';
import * as THREE from 'three';
import { MotionValue } from 'motion/react';

interface PhoneProps {
  color?: string;
  scrollProgress?: MotionValue<number>;
  mode?: 'hero' | 'static';
  rotationY?: number;
}

const getRoundedRectShape = (width: number, height: number, radius: number) => {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x, y + radius);
  shape.lineTo(x, y + height - radius);
  shape.quadraticCurveTo(x, y + height, x + radius, y + height);
  shape.lineTo(x + width - radius, y + height);
  shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  shape.lineTo(x + width, y + radius);
  shape.quadraticCurveTo(x + width, y, x + width - radius, y);
  shape.lineTo(x + radius, y);
  shape.quadraticCurveTo(x, y, x, y + radius);
  return shape;
};

const adjustTextureRepeat = (
  texture: THREE.Texture,
  planeWidth: number,
  planeHeight: number,
  rotation: number,
  zoomFactor: number = 0.55
) => {
  if (!texture.image) return;
  const img = texture.image as any;
  const w_t = img.width;
  const h_t = img.height;
  if (!w_t || !h_t) return;

  const cos = Math.abs(Math.cos(rotation));
  const sin = Math.abs(Math.sin(rotation));

  const w_box = planeWidth * cos + planeHeight * sin;
  const h_box = planeWidth * sin + planeHeight * cos;

  const s_w = w_box / w_t;
  const s_h = h_box / h_t;
  const s = Math.max(s_w, s_h);

  const baseRepX = w_box / (s * w_t);
  const baseRepY = h_box / (s * h_t);

  texture.repeat.set(baseRepX * zoomFactor, baseRepY * zoomFactor);
  texture.center.set(0.5, 0.5);
};

const Phone = forwardRef<THREE.Group, PhoneProps>(({ color = "#0d0d14", scrollProgress, mode = 'hero', rotationY }, ref) => {
  const internalRef = useRef<THREE.Group>(null);
  const wallpaperMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const selfieGlowRef = useRef<THREE.Mesh>(null);
  const selfieGlowMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const [currentTime, setCurrentTime] = useState('10:08');
  const [currentDate, setCurrentDate] = useState('TUESDAY, MAY 18');

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
  
  const baseUrl = import.meta.env.BASE_URL;

  // Load high-quality textures locally
  const baseGalaxyTexture = useTexture(`${baseUrl}images/MobileWallpaper.png`);
  const baseCanyonTexture = useTexture(`${baseUrl}images/camera-canyon.png`);
  const glowTexture = useTexture(`${baseUrl}images/vanguard-camera.png`);

  // Clone textures to ensure each Phone component instance has independent mapping state
  const galaxyTexture = useMemo(() => {
    const cloned = baseGalaxyTexture.clone();
    cloned.wrapS = cloned.wrapT = THREE.ClampToEdgeWrapping;
    cloned.colorSpace = THREE.SRGBColorSpace;
    cloned.center.set(0.5, 0.5);
    cloned.needsUpdate = true;
    return cloned;
  }, [baseGalaxyTexture]);

  const canyonTexture = useMemo(() => {
    const cloned = baseCanyonTexture.clone();
    cloned.wrapS = cloned.wrapT = THREE.ClampToEdgeWrapping;
    cloned.colorSpace = THREE.SRGBColorSpace;
    cloned.center.set(0.5, 0.5);
    cloned.needsUpdate = true;
    return cloned;
  }, [baseCanyonTexture]);

  glowTexture.wrapS = glowTexture.wrapT = THREE.ClampToEdgeWrapping;
  glowTexture.colorSpace = THREE.SRGBColorSpace;

  // Apply centered cover crop with extra zoom-in (0.55 repeat factor)
  adjustTextureRepeat(galaxyTexture, 1.92, 3.80, galaxyTexture.rotation, 0.55);

  canyonTexture.wrapS = canyonTexture.wrapT = THREE.ClampToEdgeWrapping;
  canyonTexture.colorSpace = THREE.SRGBColorSpace;
  canyonTexture.center.set(0.5, 0.5);
  
  glowTexture.wrapS = glowTexture.wrapT = THREE.ClampToEdgeWrapping;
  glowTexture.colorSpace = THREE.SRGBColorSpace;

  // Shapes for rounded screen corners
  const screenShape = getRoundedRectShape(1.92, 3.80, 0.12);
  const bezelShape = getRoundedRectShape(1.98, 3.85, 0.14);

  useFrame((state) => {
    // ── Periodic Selfie Camera 3D Light Ripple (every 5 seconds) ──
    if (selfieGlowRef.current && selfieGlowMatRef.current) {
      const cycleTime = state.clock.elapsedTime % 5;
      if (cycleTime < 0.75) {
        // Fast 0.75s expansion: scale 1.0 -> 2.8, opacity 0.95 -> 0
        const progress = cycleTime / 0.75;
        selfieGlowRef.current.scale.setScalar(1.0 + progress * 1.8);
        selfieGlowMatRef.current.opacity = 0.95 * (1.0 - progress);
      } else {
        selfieGlowRef.current.scale.setScalar(1.0);
        selfieGlowMatRef.current.opacity = 0;
      }
    }

    if (!internalRef.current || !groupRef.current) return;

    if (mode === 'static' || !scrollProgress) {
      internalRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      if (rotationY !== undefined) {
        // Apply directly — no lerp. The lerp was causing phantom spins when
        // the radian value jumped on wrap-around. Direct assignment = exact 1:1
        // control. The smoothness comes from inertia in PhoneRotator instead.
        groupRef.current.rotation.y = rotationY;
      } else {
        // Slowly rotate automatically if no external rotation is provided (e.g. in Colors section)
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      }
      groupRef.current.scale.setScalar(0.75);
      adjustTextureRepeat(galaxyTexture, 1.92, 3.80, galaxyTexture.rotation, 0.55);
      return;
    }

    const s = scrollProgress.get();
    
    // ACT 1 & 2: Floating movement (dims as we scroll)
    const floatAmount = 0.05 * Math.max(0, 1 - s * 3);
    internalRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * floatAmount;

    // ACT 2: 30% -> 65% (Phone rotates horizontal Z-axis)
    let targetZ = 0;
    if (s > 0.3 && s <= 0.65) {
      targetZ = THREE.MathUtils.mapLinear(s, 0.3, 0.65, 0, -Math.PI / 2);
    } else if (s > 0.65) {
      targetZ = -Math.PI / 2;
    }
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetZ, 0.025);

    // Subtle Y rotation oscillation based on scroll
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, Math.sin(s * Math.PI) * 0.2, 0.025);

    // ACT 2 & 3: Scale
    let targetScale = 0.85; 
    if (s > 0.3 && s <= 0.65) {
      targetScale = THREE.MathUtils.mapLinear(s, 0.3, 0.65, 0.85, 1.25);
    } else if (s > 0.65) {
      targetScale = THREE.MathUtils.mapLinear(s, 0.65, 1.0, 1.25, 2.5); // Prevent massive explosion that covers the screen in black
    }
    
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.025));

    // ACT 2: Position Y adjustment
    let targetY = 0;
    if (s > 0.3 && s <= 0.65) {
      targetY = THREE.MathUtils.mapLinear(s, 0.3, 0.65, 0, 0.3);
    } else if (s > 0.65) {
      targetY = 0.3;
    }
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.025);

    // Wallpaper Brightness/Opacity Control (Dim from 0.05 -> 0.30)
    if (wallpaperMatRef.current) {
      const targetOpacity = s < 0.05 ? 1.0 :
        s < 0.30 ? THREE.MathUtils.mapLinear(s, 0.05, 0.30, 1.0, 0.15) :
        s < 0.60 ? 0.15 :
        THREE.MathUtils.mapLinear(s, 0.60, 1.0, 0.15, 0);

      wallpaperMatRef.current.opacity = THREE.MathUtils.lerp(
        wallpaperMatRef.current.opacity,
        targetOpacity,
        0.05
      );
      
      // Rotate textures to keep them upright
      galaxyTexture.rotation = THREE.MathUtils.lerp(galaxyTexture.rotation, -targetZ, 0.06);
      canyonTexture.rotation = THREE.MathUtils.lerp(canyonTexture.rotation, -targetZ, 0.06);
      adjustTextureRepeat(galaxyTexture, 1.92, 3.80, galaxyTexture.rotation, 0.55);
    }

    // Glow Opacity Control
    if (glowMatRef.current) {
      const targetGlowOpacity = s < 0.3 ? 0.35 : 
        s < 0.65 ? THREE.MathUtils.mapLinear(s, 0.3, 0.65, 0.35, 0.6) :
        THREE.MathUtils.mapLinear(s, 0.65, 1.0, 0.6, 0);
        
      glowMatRef.current.opacity = THREE.MathUtils.lerp(glowMatRef.current.opacity, targetGlowOpacity, 0.05);
    }
  });

  return (
    <group ref={ref}>
      <group ref={groupRef}>
        <group ref={internalRef}>
          {/* === PHONE FRAME BORDER (Thin outer ring) === */}
          <RoundedBox args={[2.28, 4.28, 0.20]} radius={0.15} smoothness={12} position={[0, 0, -0.01]} renderOrder={0}>
            <meshStandardMaterial 
              color={color}
              roughness={0.1}
              metalness={0.95}
              transparent={false}
              depthWrite={true}
            />
          </RoundedBox>

          {/* === PHONE BODY === */}
          <RoundedBox args={[2.22, 4.22, 0.22]} radius={0.14} smoothness={12} position={[0, 0, 0]} renderOrder={1}>
            <meshStandardMaterial 
              color={color === "#ffffff" ? "#f5f5f5" : "#0d0d16"} 
              roughness={0.15} 
              metalness={0.85}
              transparent={false}
              opacity={1}
              depthWrite={true}
              depthTest={true}
            />
          </RoundedBox>

          {/* === BACK GLASS === */}
          <mesh position={[0, 0, -0.111]} rotation={[0, Math.PI, 0]} renderOrder={0}>
            <planeGeometry args={[2.1, 4.1]} />
            <meshStandardMaterial 
              color={color} 
              roughness={0.15} 
              metalness={0.4} 
            />
          </mesh>

          {/* === ENHANCED SCREEN STACK === */}
          
          {/* Layer 1 (z=0.111): Screen rounded black bezel/base */}
          <mesh position={[0, 0, 0.111]} renderOrder={2}>
            <shapeGeometry args={[bezelShape]} />
            <meshBasicMaterial color="#000000" />
          </mesh>

          {/* Layer 2 (z=0.112): Rounded cosmic wallpaper image */}
          <mesh position={[0, 0, 0.112]} renderOrder={3}>
            <shapeGeometry args={[screenShape]} />
            <meshBasicMaterial
              ref={wallpaperMatRef}
              map={galaxyTexture}
              toneMapped={false}
              transparent={true}
              depthWrite={true}
            />
          </mesh>

          {/* Layer 2.5 (z=0.113): Lock Screen Time & Date (Only for static rotator mode) */}
          {mode === 'static' && (
            <group position={[0, 0.75, 0.113]} renderOrder={4}>
              <Text
                fontSize={0.35}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                characters="0123456789:"
              >
                {currentTime}
              </Text>
              <Text
                fontSize={0.06}
                color="#ffffff"
                position={[0, -0.28, 0]}
                anchorX="center"
                anchorY="middle"
                fillOpacity={0.8}
                letterSpacing={0.2}
              >
                {currentDate}
              </Text>
            </group>
          )}

          {/* Layer 3 (z=0.114): Screen glow overlay */}
          <mesh position={[0, 0, 0.114]} renderOrder={4}>
            <shapeGeometry args={[screenShape]} />
            <meshBasicMaterial 
              ref={glowMatRef}
              map={glowTexture}
              transparent={true}
              opacity={0.35}
              depthWrite={false}
              color="#1a6bff"
            />
          </mesh>

          {/* Layer 4 (z=0.115): Selfie Camera Punch-Hole */}
          <mesh position={[0, 1.82, 0.115]} renderOrder={5}>
            <circleGeometry args={[0.045, 32]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <mesh position={[0, 1.82, 0.116]} renderOrder={6}>
            <circleGeometry args={[0.015, 16]} />
            <meshBasicMaterial color="#0a1a3a" />
          </mesh>

          {/* Selfie Camera 3D Glow Ring (pulsates every 5 seconds) */}
          <mesh ref={selfieGlowRef} position={[0, 1.82, 0.117]} renderOrder={7}>
            <ringGeometry args={[0.045, 0.052, 32]} />
            <meshBasicMaterial ref={selfieGlowMatRef} color="#ffffff" transparent={true} opacity={0} depthWrite={false} />
          </mesh>



          {/* Layer 6 (z=0.116): Screen reflection sheen */}
          <mesh position={[0.3, 0.8, 0.116]} rotation={[0, 0, -0.5]} renderOrder={6}>
            <planeGeometry args={[0.4, 2.5]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent={true} 
              opacity={0.03}
              depthWrite={false}
            />
          </mesh>


          {/* === BACK CAMERA ISLAND === */}
          <group position={[-0.45, 1.2, -0.12]} rotation={[0, Math.PI, 0]}>
            <RoundedBox args={[0.9, 1.0, 0.08]} radius={0.12}>
              <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
            </RoundedBox>

            <group position={[-0.2, 0.3, 0.041]}>
              <Circle args={[0.18, 32]}>
                <meshStandardMaterial color="#000000" metalness={1} roughness={0.1} />
              </Circle>
              <Circle args={[0.12, 32]} position={[0, 0, 0.001]}>
                <meshStandardMaterial color="#050505" roughness={0} />
              </Circle>
              <Circle args={[0.05, 32]} position={[0, 0, 0.002]}>
                <meshStandardMaterial color="#020210" emissive="#1a3fff" emissiveIntensity={0.8} />
              </Circle>
            </group>

            <group position={[0.2, 0.3, 0.041]}>
              <Circle args={[0.18, 32]}>
                <meshStandardMaterial color="#000000" metalness={1} roughness={0.1} />
              </Circle>
              <Circle args={[0.12, 32]} position={[0, 0, 0.001]}>
                <meshStandardMaterial color="#050505" roughness={0} />
              </Circle>
            </group>

            <group position={[0, -0.15, 0.041]}>
              <Circle args={[0.16, 32]}>
                <meshStandardMaterial color="#000000" metalness={1} roughness={0.1} />
              </Circle>
              <Circle args={[0.1, 32]} position={[0, 0, 0.001]}>
                <meshStandardMaterial color="#050505" roughness={0} />
              </Circle>
            </group>

            <RoundedBox args={[0.12, 0.12, 0.01]} radius={0.06} position={[0.28, -0.25, 0.041]}>
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
            </RoundedBox>
          </group>

          {/* === SIDE BUTTONS === */}
          <RoundedBox args={[0.04, 0.22, 0.06]} radius={0.02} position={[1.02, 0.4, 0]}>
            <meshStandardMaterial color="#3a3a3e" metalness={0.8} roughness={0.3} />
          </RoundedBox>

          <RoundedBox args={[0.04, 0.18, 0.06]} radius={0.02} position={[-1.02, 0.5, 0]}>
            <meshStandardMaterial color="#3a3a3e" metalness={0.8} roughness={0.3} />
          </RoundedBox>
          <RoundedBox args={[0.04, 0.18, 0.06]} radius={0.02} position={[-1.02, 0.15, 0]}>
            <meshStandardMaterial color="#3a3a3e" metalness={0.8} roughness={0.3} />
          </RoundedBox>

          {/* === BOTTOM PORTS & GRILLS === */}
          <group position={[0, -1.9, 0]}>
            <RoundedBox args={[0.22, 0.07, 0.1]} radius={0.02}>
              <meshStandardMaterial color="#050508" roughness={1} />
            </RoundedBox>
            
            <group position={[-0.45, 0, 0]}>
              {[...Array(5)].map((_, i) => (
                <mesh key={i} position={[i * 0.07, 0, 0.05]}>
                  <circleGeometry args={[0.015, 16]} />
                  <meshBasicMaterial color="#000" />
                </mesh>
              ))}
            </group>
            
            <mesh position={[0.35, 0, 0.05]}>
              <circleGeometry args={[0.015, 16]} />
              <meshBasicMaterial color="#000" />
            </mesh>
          </group>

          {/* === BACKSIDE NOVA BRAND TEXT === */}
          {/* "NOVA" etched into back glass — below the camera island */}
          <group position={[0, -0.9, -0.112]} rotation={[0, Math.PI, 0]}>
            {/* Outer soft-glow shadow layer */}
            <Text
              fontSize={0.22}
              color="#8ab4ff"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.45}
              fillOpacity={0.08}
              outlineWidth={0.012}
              outlineColor="#aaccff"
              outlineOpacity={0.12}
            >
              NOVA
            </Text>
            {/* Primary crisp text layer */}
            <Text
              fontSize={0.22}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.45}
              fillOpacity={0.55}
            >
              NOVA
            </Text>
            {/* Tagline below */}
            <Text
              fontSize={0.045}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              position={[0, -0.18, 0.001]}
              letterSpacing={0.35}
              fillOpacity={0.28}
            >
              BEYOND PERCEPTION
            </Text>
          </group>
        </group>
      </group>
    </group>
  );
});

Phone.displayName = 'Phone';

export default Phone;

