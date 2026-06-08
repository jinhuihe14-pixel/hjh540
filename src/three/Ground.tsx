import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GroundProps {
  size?: [number, number];
}

export function Ground({ size = [200, 160] }: GroundProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
    }
  });

  return (
    <group>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={size} />
        <meshStandardMaterial color="#2d5016" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[size[0] - 10, size[1] - 10]} />
        <meshStandardMaterial color="#3d6b1f" />
      </mesh>

      <gridHelper args={[200, 40, '#4a7c2a', '#4a7c2a']} position={[0, 0.02, 0]} />
    </group>
  );
}
