import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { ChristmasTree } from './Tree';
import { useAppState } from './Store';
import { TreeState } from '../types';

// 简单的手机检测
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// 一个绝对不会出错的测试方块组件
const TestBox = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.02;
      meshRef.current.rotation.y += 0.02;
    }
  });
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshBasicMaterial color="#00ff00" wireframe />
    </mesh>
  );
};

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
      // 强制使用最保守的渲染参数，防止崩溃
      gl={{ 
        antialias: false,
        powerPreference: "low-power",
        preserveDrawingBuffer: true
      }}
      dpr={[1, 1.5]} 
    >
      <PerspectiveCamera makeDefault position={[0, 1.5, isMobile ? 25 : 14]} fov={35} />
      
      <OrbitControls 
        enablePan={false} 
        minDistance={5} 
        maxDistance={40} 
        autoRotate={!isExploded}
        autoRotateSpeed={0.5}
      />
      
      {/* 🔴 1. 这个绿色方块在 Suspense 外面。只要 Canvas 能跑，它就一定显示 */}
      <TestBox />

      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* 🔴 2. 圣诞树组件 */}
        <ChristmasTree />
        
        {/* 只有 PC 端才加载环境贴图，手机端省去加载资源 */}
        {!isMobile && <Environment preset="night" />}
      </Suspense>
    </Canvas>
  );
};

