import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MotionValue } from 'motion/react';

interface ParticleFieldProps {
  count?: number;
  scrollProgress?: MotionValue<number>;
}

export default function ParticleField({ count = 3000, scrollProgress }: ParticleFieldProps) {
  const points = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 20;
      temp[i * 3 + 1] = (Math.random() - 0.5) * 20;
      temp[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    const s = scrollProgress?.get() ?? 0;
    // ACT 1: Particle field slows down (1.0 -> 0.2)
    const speedMultiplier = s < 0.3 ? THREE.MathUtils.mapLinear(s, 0, 0.3, 1.0, 0.2) : 0.2;
    
    points.current.rotation.y = state.clock.elapsedTime * 0.05 * speedMultiplier;
    points.current.rotation.x = state.clock.elapsedTime * 0.03 * speedMultiplier;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#1a6bff"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}
