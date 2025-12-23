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
        antialias: true, // 🔴 核心修复：强制开启抗锯齿，解决粒子边缘闪烁问题
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
        powerPreference: "default", // 恢复默认电源模式，保证渲染稳定
        preserveDrawingBuffer: true
      }}
      dpr={isMobile ? [1, 2] : [1, 2]} // 允许手机更高分辨率
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
        <ambientLight intensity={0.8} />
        <pointLight position={[0, 0, 0]} color="#0055ff" intensity={5} distance={15} />
        <spotLight position={[0, 20, 0]} angle={0.15} penumbra={1} intensity={8} color="#ffffff" />
        
        <ChristmasTree />
        
        {!isMobile && (
           <ContactShadows opacity={0.4} scale={25} blur={3} far={10} resolution={512} color="#000000" />
        )}

        {!isMobile && <Environment preset="night" />}
        
        {/* 🔴 核心修复：手机端完全移除 EffectComposer */}
        {/* 后期处理是手机闪屏的根源，移除后画面会非常稳，且粒子更清晰 */}
        {!isMobile && (
          <EffectComposer enableNormalPass={false} multisampling={4}>
            <Bloom luminanceThreshold={0.1} mipmapBlur intensity={2.5} radius={0.4} />
            <ChromaticAberration offset={new THREE.Vector2(0.0008, 0.0008)} />
            <Noise opacity={0.015} />
            <Vignette eskil={false} offset={0.1} darkness={1.2} />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
};
