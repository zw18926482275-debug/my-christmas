
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';
import { ChristmasTree } from './Tree.tsx';
import * as THREE from 'three';
import { useAppState } from './Store.tsx';
import { TreeState } from '../types.ts';

// 1. 在文件头部添加一个简单的手机判断
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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
        // 手机端建议关掉默认抗锯齿以节省性能，PC端保持开启
        antialias: !isMobile,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
        powerPreference: "high-performance"
      }}
      // 🟢 优化 1: 手机端限制像素比，防止高分屏手机渲染压力过大
      dpr={isMobile ? [1, 1.5] : [1, 2]} 
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
        
        {/* 🟢 优化 2: 手机端直接移除 ContactShadows (非常耗性能) */}
        {!isMobile && (
          <ContactShadows 
            opacity={0.4} 
            scale={25} 
            blur={3} 
            far={10} 
            resolution={512} // 将原来的 1024 降低为 512
            color="#000000" 
          />
        )}
        
        <Environment preset="night" />
        
        {/* 🟢 优化 3: 手机端降低采样率 (multisampling 设为 0) */}
        <EffectComposer enableNormalPass={false} multisampling={isMobile ? 0 : 4}>
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
