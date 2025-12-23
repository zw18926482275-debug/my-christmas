
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';
import { ChristmasTree } from './Tree.tsx';
import * as THREE from 'three';
import { useAppState } from './Store.tsx';
import { TreeState } from '../types.ts';

export const Scene: React.FC = () => {
  const { state, isExploded, setIsExploded } = useAppState();

  const handlePointerDown = () => {
    // Only allow explosion interaction when in Cinematic Mode (SCATTERED state)
    if (state === TreeState.SCATTERED) {
      setIsExploded(!isExploded);
    }
  };

  return (
    <Canvas 
      shadows 
      className="w-full h-full bg-[#000205]"
      onPointerDown={handlePointerDown}
      gl={{ 
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
        powerPreference: "high-performance"
      }}
      dpr={[1, 2]} // 优化高分屏显示
    >
      <PerspectiveCamera makeDefault position={[0, 1.5, 14]} fov={35} />
      <OrbitControls 
        enablePan={false} 
        minDistance={8} 
        maxDistance={22} 
        autoRotate={!isExploded} 
        autoRotateSpeed={0.4}
        maxPolarAngle={Math.PI / 1.7}
      />
      
      <Suspense fallback={null}>
        <ambientLight intensity={0.1} />
        
        <pointLight position={[0, 0, 0]} color="#0055ff" intensity={5} distance={15} />
        
        <spotLight 
          position={[0, 20, 0]} 
          angle={0.15} 
          penumbra={1} 
          intensity={8} 
          color="#ffffff"
        />
        
        <ChristmasTree />
        
        <ContactShadows 
          opacity={0.4} 
          scale={25} 
          blur={3} 
          far={10} 
          resolution={1024} 
          color="#000000" 
        />
        
        <Environment preset="night" />
        
        {/* Fix: changed disableNormalPass to enableNormalPass={false} to resolve type error on EffectComposer */}
        <EffectComposer enableNormalPass={false} multisampling={4}>
          <Bloom 
            luminanceThreshold={0.1} 
            mipmapBlur 
            intensity={2.5} 
            radius={0.4} 
          />
          <ChromaticAberration offset={new THREE.Vector2(0.0008, 0.0008)} />
          <Noise opacity={0.015} />
          <Vignette eskil={false} offset={0.1} darkness={1.2} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
};
