
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useAppState } from './Store';
import { TreeState } from '../types';

// 🔴 极简模式：只生成 50 个粒子，排除性能问题
const COUNT_A = 50;  
const COUNT_B = 50;  
const COUNT_C = 50;  
const BOKEH_COUNT = 20; 

export const ChristmasTree: React.FC = () => {
  const { state, isExploded } = useAppState();
  const ribbonRef = useRef<THREE.Points>(null!);
  const nebulaRef = useRef<THREE.Points>(null!);
  const sparkleRef = useRef<THREE.Points>(null!);
  const starRef = useRef<THREE.Group>(null!);
  const bokehRef = useRef<THREE.Points>(null!);

  const isCinematic = state === TreeState.SCATTERED;

  // 星星形状
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.5;
    const innerRadius = 0.19;
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points + Math.PI / 2;
      shape[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    shape.closePath();
    return shape;
  }, []);

  // 生成极少量数据
  const createSystemData = (count: number, type: 'A' | 'B' | 'C') => {
    const currPos = new Float32Array(count * 3);
    const targetPos = new Float32Array(count * 3); // 需要保留 targetPos 避免 updatePhysics 报错
    const randomPos = new Float32Array(count * 3); // 需要保留 randomPos

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const t = i / count; 
      const h = t * 7.5 - 3.5; 
      const yNormalized = t;
      const spirals = 6.5; 
      const theta = yNormalized * Math.PI * 2 * spirals;
      const baseR = (1 - yNormalized) * 2.2;
      
      let x = Math.cos(theta) * baseR;
      let y = h;
      let z = Math.sin(theta) * baseR;

      // 简单赋值
      currPos[i3] = x; currPos[i3 + 1] = y; currPos[i3 + 2] = z;
      targetPos[i3] = x; targetPos[i3 + 1] = y; targetPos[i3 + 2] = z;
      randomPos[i3] = x * 2; randomPos[i3 + 1] = y * 2; randomPos[i3 + 2] = z * 2;
    }
    return { currPos, targetPos, randomPos };
  };

  const systemA = useMemo(() => createSystemData(COUNT_A, 'A'), []);
  const systemB = useMemo(() => createSystemData(COUNT_B, 'B'), []);
  const systemC = useMemo(() => createSystemData(COUNT_C, 'C'), []);
  
  const bokehData = useMemo(() => {
    const pos = new Float32Array(BOKEH_COUNT * 3);
    const vel = new Float32Array(BOKEH_COUNT * 3);
    for(let i=0; i<BOKEH_COUNT; i++) {
       pos[i*3] = (Math.random() - 0.5) * 10;
       pos[i*3+1] = (Math.random() - 0.5) * 10;
       pos[i*3+2] = (Math.random() - 0.5) * 10;
       vel[i*3+1] = -0.05;
    }
    return { pos, vel };
  }, []);

  // 极简动画逻辑
  useFrame((stateContext) => {
    const time = stateContext.clock.getElapsedTime();
    if (starRef.current) {
       starRef.current.rotation.y += 0.01;
    }
    // 简单的粒子移动，不进行复杂的 Lerp 计算，防止性能问题
    if(ribbonRef.current) ribbonRef.current.rotation.y += 0.005;
    if(nebulaRef.current) nebulaRef.current.rotation.y -= 0.005;
  });

  return (
    <group>
      {/* 背景粒子 */}
      <points ref={bokehRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={BOKEH_COUNT} array={bokehData.pos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="white" size={0.5} transparent opacity={0.5} />
      </points>

      {/* 粒子 A */}
      <points ref={ribbonRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={COUNT_A} array={systemA.currPos} itemSize={3} />
        </bufferGeometry>
        {/* 🔴 必须使用 PointsMaterial，最安全的材质 */}
        <pointsMaterial color="#FFD700" size={0.5} sizeAttenuation={true} transparent opacity={1} />
      </points>

      {/* 粒子 B */}
      <points ref={nebulaRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={COUNT_B} array={systemB.currPos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#0077BE" size={0.5} transparent opacity={0.8} />
      </points>

      {/* 粒子 C */}
      <points ref={sparkleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={COUNT_C} array={systemC.currPos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="red" size={0.5} transparent opacity={0.8} />
      </points>

      {/* 顶部星星 */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
        <group ref={starRef} position={[0, 4.25, 0]}>
          <mesh rotation={[0, 0, 0]} position={[0, 0, -0.06]}>
             <extrudeGeometry args={[starShape, { depth: 0.12, bevelEnabled: false }]} />
             <meshBasicMaterial color="yellow" />
          </mesh>
        </group>
      </Float>
    </group>
  );
};
