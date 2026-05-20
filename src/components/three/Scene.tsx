import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import Phone from './Phone';
import ParticleField from './ParticleField';
import { MotionValue } from 'motion/react';

interface SceneProps {
  phoneColor?: string;
  mode?: 'hero' | 'static';
  scrollProgress?: MotionValue<number>;
  rotationY?: number;
}

export default function Scene({ phoneColor, mode = 'hero', scrollProgress, rotationY }: SceneProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ 
        antialias: true, 
        alpha: true,
        logarithmicDepthBuffer: true 
      }}
      className="w-full h-full"
    >
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
      
      {/* Realism Lighting Setup */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-5, 5, -5]} intensity={0.6} color="#4c89ff" />
      <pointLight position={[0, 0, 4]} intensity={1.2} color="#ffffff" />
      
      <Suspense fallback={null}>
        <Environment preset="city" />
        <Phone color={phoneColor} scrollProgress={scrollProgress} mode={mode} rotationY={rotationY} />
        <ParticleField scrollProgress={scrollProgress} />
      </Suspense>
    </Canvas>
  );
}
