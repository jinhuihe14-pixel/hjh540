import { useMemo, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { PathPoint, Position3D } from '@/types';

interface PathLineProps {
  points: PathPoint[];
  color?: string;
  animated?: boolean;
  width?: number;
}

export function PathLine({ points, color = '#4a90d9', animated = true }: PathLineProps) {
  const [glowOpacity, setGlowOpacity] = useState(0.4);

  const linePoints = useMemo(() => {
    if (points.length < 2) return [];
    const positions = points.map(
      (p) => new THREE.Vector3(p.position.x, p.position.y, p.position.z)
    );
    const curve = new THREE.CatmullRomCurve3(positions);
    return curve.getPoints(50).map((p) => [p.x, p.y, p.z] as [number, number, number]);
  }, [points]);

  useFrame(({ clock }) => {
    if (animated) {
      const intensity = (Math.sin(clock.getElapsedTime() * 2) + 1) / 2;
      setGlowOpacity(0.2 + intensity * 0.3);
    }
  });

  if (points.length < 2) return null;

  return (
    <group>
      <Line points={linePoints} color={color} lineWidth={3} transparent opacity={0.9} />
      <Line points={linePoints} color={color} lineWidth={8} transparent opacity={glowOpacity} />

      <mesh position={[points[0].position.x, points[0].position.y, points[0].position.z]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#27ae60" emissive="#27ae60" emissiveIntensity={0.5} />
      </mesh>

      <mesh
        position={[
          points[points.length - 1].position.x,
          points[points.length - 1].position.y,
          points[points.length - 1].position.z,
        ]}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

interface PathMarkerProps {
  position: Position3D;
  type: 'start' | 'end';
  label?: string;
}

export function PathMarker({ position, type }: PathMarkerProps) {
  const color = type === 'start' ? '#27ae60' : '#e74c3c';
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = position.y + Math.sin(clock.getElapsedTime() * 3) * 0.2 + 1;
    }
  });

  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh ref={meshRef}>
        <coneGeometry args={[0.4, 0.8, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}
