import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Points, PointMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Hero Particle Sphere
const ParticleSphere = () => {
  const ref = useRef();

  const count = 3000;
  const positions = useMemo(() => {
    const coords = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3.5 + Math.random() * 0.5;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      coords[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      coords[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      coords[i * 3 + 2] = r * Math.cos(phi);
    }
    return coords;
  }, [count]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#4ade80" size={0.02} sizeAttenuation={true} depthWrite={false} />
      </Points>
    </group>
  );
};

export const Hero3D = ({ style }) => {
  return (
    <div style={{ position: 'relative', ...style }}>
      <Canvas camera={{ position: [0, 0, 7] }}>
        <ambientLight intensity={0.5} />
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <ParticleSphere />
        </Float>
      </Canvas>
    </div>
  );
};

// Distorted Glowing Orb for Features Section Background
const GlowingOrb = () => {
  const sphereRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (sphereRef.current) {
      sphereRef.current.position.y = Math.sin(t / 1.5) / 2;
      sphereRef.current.rotation.x = t / 3;
      sphereRef.current.rotation.y = t / 4;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={sphereRef} args={[2, 64, 64]} position={[3, 0, -2]}>
        <MeshDistortMaterial
          color="#16a34a"
          envMapIntensity={0.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.5}
          roughness={0.2}
          distort={0.4}
          speed={2}
          wireframe
          transparent
          opacity={0.3}
        />
      </Sphere>
    </Float>
  );
};

export const Features3D = ({ style }) => {
  return (
    <div style={{ position: 'relative', ...style }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#4ade80" />
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        <GlowingOrb />
      </Canvas>
    </div>
  );
};

// Abstract connected network for CTA
const NetworkLines = () => {
  const ref = useRef();

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.05;
      ref.current.rotation.z += delta * 0.02;
    }
  });

  return (
    <group ref={ref}>
      <Stars radius={50} depth={50} count={3000} factor={4} saturation={1} fade speed={1.5} />
    </group>
  );
};

export const CTA3D = ({ style }) => {
  return (
    <div style={{ position: 'relative', ...style }}>
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ambientLight intensity={0.5} />
        <NetworkLines />
      </Canvas>
    </div>
  );
};
