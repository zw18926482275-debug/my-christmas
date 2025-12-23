import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ChristmasTree } from './Tree';
import { useAppState } from './Store';
import { TreeState } from '../types';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export const Scene: React.FC = () => {
  const { state, isExploded, setIsExploded } = useAppState();

  const handlePointerDown = () => {
    if (state === TreeState.SCATTERED) {
      setIsExploded(!isExploded);
    }
  };

  return (
    <Canvas 
      className="w-full h-full bg-[#000205]"
      onPointerDown={handlePointerDown}
      gl={{ 
        antialias: !isMobile, 
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
        powerPreference: "low-power", // 保持低功耗
        preserveDrawingBuffer: true
      }}
      dpr={isMobile ? [1, 1.5] : [1, 2]} 
    >
      <PerspectiveCamera makeDefault position={[0, 1.5, isMobile ? 24 : 14]} fov={35} />
      
      <OrbitControls 
        enablePan={false} 
        minDistance={8} 
        maxDistance={40} 
        autoRotate={!isExploded}
        autoRotateSpeed={0.4}
      />
      
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} color="#0055ff" intensity={5} distance={15} />
        <spotLight position={[0, 20, 0]} angle={0.15} penumbra={1} intensity={8} color="#ffffff" />
        
        <ChristmasTree />
        
        {!isMobile && (
           <ContactShadows opacity={0.4} scale={25} blur={3} far={10} resolution={512} color="#000000" />
        )}

        {/* 手机端彻底移除环境贴图加载，减少网络请求 */}
        {!isMobile && <Environment preset="night" />}
        
        {/* 手机端只保留最简单的泛光 */}
        {!isMobile ? (
          <EffectComposer enableNormalPass={false} multisampling={4}>
            <Bloom luminanceThreshold={0.1} mipmapBlur intensity={2.5} radius={0.4} />
            <ChromaticAberration offset={new THREE.Vector2(0.0008, 0.0008)} />
            <Noise opacity={0.015} />
            <Vignette eskil={false} offset={0.1} darkness={1.2} />
          </EffectComposer>
        ) : (
          <EffectComposer enableNormalPass={false} multisampling={0}>
             <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.4} />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
};
