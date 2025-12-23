import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useAppState } from './Store';
import { TreeState } from '../types';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// 🔴 优化配置：数量大幅增加，尺寸减小
const COUNT_A = isMobile ? 600 : 1200;   // 丝带：变多
const COUNT_B = isMobile ? 2500 : 8500;  // 星云：大幅变多
const COUNT_C = isMobile ? 2000 : 8000;  // 闪光：大幅变多
const BOKEH_COUNT = isMobile ? 150 : 300; 

const ribbonShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#FFD700") },
    uOpacity: { value: 0.8 }
  },
  vertexShader: `
    uniform float uTime;
    attribute float aSize;
    attribute float aOpacity;
    varying float vOpacity;
    void main() {
      vOpacity = aOpacity;
      vec3 pos = position;
      pos.x += sin(uTime * 2.0 + position.y) * 0.05; 
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = aSize * (800.0 / -mvPosition.z);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    varying float vOpacity;
    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      float strength = 1.0 - dist * 2.0;
      gl_FragColor = vec4(uColor, strength * vOpacity);
    }
  `
};

export const ChristmasTree: React.FC = () => {
  const { state, isExploded } = useAppState();
  const ribbonRef = useRef<THREE.Points>(null!);
  const nebulaRef = useRef<THREE.Points>(null!);
  const sparkleRef = useRef<THREE.Points>(null!);
  const starRef = useRef<THREE.Group>(null!);
  const bokehRef = useRef<THREE.Points>(null!);

  const isCinematic = state === TreeState.SCATTERED;

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

  const createSystemData = (count: number, type: 'A' | 'B' | 'C') => {
    const targetPos = new Float32Array(count * 3);
    const randomPos = new Float32Array(count * 3);
    const currPos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const t = i / count; 
      const h = t * 7.5 - 3.5; 
      const yNormalized = t;
      const spirals = 6.5; 
      const theta = yNormalized * Math.PI * 2 * spirals;
      const baseR = (1 - yNormalized) * 2.2;
      
      let x = 0, y = h, z = 0;
      if (type === 'A') {
        const ribbonWidth = 0.08 * (1 - yNormalized);
        const r = baseR + (Math.random() - 0.5) * ribbonWidth * 12.0;
        x = Math.cos(theta) * r;
        z = Math.sin(theta) * r;
        sizes[i] = 0.06 + Math.random() * 0.1;
        opacities[i] = 0.5 + Math.random() * 0.4;
      } else if (type === 'B') {
        const r = Math.sqrt(Math.random()) * baseR * 1.25; 
        const randAngle = Math.random() * Math.PI * 2;
        x = Math.cos(randAngle) * r;
        z = Math.sin(randAngle) * r;
        sizes[i] = 0.07 + Math.random() * 0.15;
        opacities[i] = 0.2 + Math.random() * 0.3;
      } else {
        const r = baseR * Math.sqrt(Math.random()) * 1.4;
        const randAngle = Math.random() * Math.PI * 2;
        x = Math.cos(randAngle) * r;
        z = Math.sin(randAngle) * r;
        sizes[i] = 0.02 + Math.random() * 0.06;
        opacities[i] = 0.6 + Math.random() * 0.4;
      }

      targetPos[i3] = x; targetPos[i3 + 1] = y; targetPos[i3 + 2] = z;
      randomPos[i3] = (Math.random() - 0.5) * 15;
      randomPos[i3 + 1] = (Math.random() - 0.5) * 15;
      randomPos[i3 + 2] = (Math.random() - 0.5) * 15;
      currPos[i3] = x; currPos[i3 + 1] = y; currPos[i3 + 2] = z;
    }
    return { targetPos, randomPos, currPos, sizes, opacities };
  };

  const systemA = useMemo(() => createSystemData(COUNT_A, 'A'), []);
  const systemB = useMemo(() => createSystemData(COUNT_B, 'B'), []);
  const systemC = useMemo(() => createSystemData(COUNT_C, 'C'), []);
  
  const bokehData = useMemo(() => {
    const pos = new Float32Array(BOKEH_COUNT * 3);
    const vel = new Float32Array(BOKEH_COUNT * 3);
    for(let i=0; i<BOKEH_COUNT; i++) {
      pos[i*3] = (Math.random() - 0.5) * 40;
      pos[i*3+1] = Math.random() * 40;
      pos[i*3+2] = (Math.random() - 0.5) * 40;
      vel[i*3+1] = -(0.02 + Math.random() * 0.05);
    }
    return { pos, vel };
  }, []);

  const updatePhysics = (sys: any, ref: any) => {
    const activeExplosion = isCinematic && isExploded;
    const lerpFactor = activeExplosion ? 0.03 : 0.08;

    for (let i = 0; i < sys.targetPos.length / 3; i++) {
      const i3 = i * 3;
      const tx = activeExplosion ? sys.randomPos[i3] : sys.targetPos[i3];
      const ty = activeExplosion ? sys.randomPos[i3+1] : sys.targetPos[i3+1];
      const tz = activeExplosion ? sys.randomPos[i3+2] : sys.targetPos[i3+2];

      sys.currPos[i3] = THREE.MathUtils.lerp(sys.currPos[i3], tx, lerpFactor);
      sys.currPos[i3+1] = THREE.MathUtils.lerp(sys.currPos[i3+1], ty, lerpFactor);
      sys.currPos[i3+2] = THREE.MathUtils.lerp(sys.currPos[i3+2], tz, lerpFactor);
    }
    if (ref.current) {
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  };

  useFrame((stateContext) => {
    const time = stateContext.clock.getElapsedTime();
    updatePhysics(systemA, ribbonRef);
    updatePhysics(systemB, nebulaRef);
    updatePhysics(systemC, sparkleRef);

    if (bokehRef.current) {
      const positions = bokehRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < BOKEH_COUNT; i++) {
        const i3 = i * 3;
        positions[i3+1] += bokehData.vel[i3+1];
        if (positions[i3+1] < -10) positions[i3+1] = 30;
      }
      bokehRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (!isMobile && ribbonRef.current && (ribbonRef.current.material as THREE.ShaderMaterial).uniforms) {
       (ribbonRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
    }

    if (starRef.current) {
      const rotationSpeed = isExploded && isCinematic ? 3.0 : 0.8;
      starRef.current.rotation.y += (rotationSpeed * 0.016);
      starRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.03);
    }
  });

  return (
    <group>
      {/* 1. 背景粒子 */}
      <points ref={bokehRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={BOKEH_COUNT} array={bokehData.pos} itemSize={3} />
        </bufferGeometry>
        {/* 调小背景粒子 */}
        <pointsMaterial color="#ffd700" size={isMobile ? 0.6 : 0.4} transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {/* 2. 金色丝带 */}
      <points ref={ribbonRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={COUNT_A} array={systemA.currPos} itemSize={3} />
          {!isMobile && <bufferAttribute attach="attributes-aSize" count={COUNT_A} array={systemA.sizes} itemSize={1} />}
          {!isMobile && <bufferAttribute attach="attributes-aOpacity" count={COUNT_A} array={systemA.opacities} itemSize={1} />}
        </bufferGeometry>
        
        {isMobile ? (
          <pointsMaterial 
            color="#FFD700" 
            size={0.25} // 🔴 缩小尺寸：0.4 -> 0.25，更精致
            transparent 
            opacity={0.8} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false} 
            sizeAttenuation={true}
          />
        ) : (
          <shaderMaterial {...ribbonShader} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        )}
      </points>

      {/* 3. 蓝色星云 */}
      <points ref={nebulaRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={COUNT_B} array={systemB.currPos} itemSize={3} />
        </bufferGeometry>
        {/* 🔴 缩小尺寸：0.3 -> 0.15 */}
        <pointsMaterial color="#0077BE" size={isMobile ? 0.15 : 0.11} transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {/* 4. 金色闪光 */}
      <points ref={sparkleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={COUNT_C} array={systemC.currPos} itemSize={3} />
        </bufferGeometry>
        {/* 🔴 缩小尺寸：0.2 -> 0.12 */}
        <pointsMaterial color="#FFD700" size={isMobile ? 0.12 : 0.05} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {/* 5. 顶部星星 */}
      <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <group ref={starRef} position={[0, 4.25, 0]}>
          <mesh rotation={[0, 0, 0]} position={[0, 0, -0.06]}>
            <extrudeGeometry args={[starShape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 5 }]} />
            {isMobile ? (
               <meshBasicMaterial color="#FFD700" /> 
            ) : (
               <meshStandardMaterial 
                color="#FFD700" 
                emissive="#FFD700" 
                emissiveIntensity={30} 
                toneMapped={false} 
                metalness={0.9} 
                roughness={0.1} 
              />
            )}
          </mesh>
          <pointLight intensity={isMobile ? 100 : 250} distance={20} color="#FFD700" />
        </group>
      </Float>

      <Sparkles count={isMobile ? 600 : 1200} scale={20} size={isMobile ? 5 : 4} speed={0.5} color="#ffd700" opacity={0.2} />
      <Stars radius={150} depth={50} count={isMobile ? 2000 : 10000} factor={6} saturation={0} fade speed={1} />
    </group>
  );
};
