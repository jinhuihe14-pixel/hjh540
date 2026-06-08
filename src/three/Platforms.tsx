import { useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Platform as PlatformType } from '@/types';
import { useParkStore } from '@/store/parkStore';

interface PlatformProps {
  platform: PlatformType;
}

const statusColors: Record<string, string> = {
  idle: '#27ae60',
  occupied: '#e74c3c',
  reserved: '#f39c12',
  maintenance: '#95a5a6',
};

function PlatformDock({ platform }: PlatformProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const selectPlatform = useParkStore((state) => state.selectPlatform);
  const selectedPlatformId = useParkStore((state) => state.selectedPlatformId);
  const isSelected = selectedPlatformId === platform.id;

  const color = statusColors[platform.status] || '#666';

  return (
    <group position={[platform.position.x, platform.position.y, platform.position.z]}>
      <mesh
        ref={meshRef}
        position={[0, platform.size.y / 2, 0]}
        castShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          selectPlatform(isSelected ? null : platform.id);
        }}
      >
        <boxGeometry args={[platform.size.x, platform.size.y, platform.size.z]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected || hovered ? 0.5 : 0.2}
        />
      </mesh>

      <mesh position={[platform.size.x / 2 + 0.5, platform.size.y / 2, 0]}>
        <boxGeometry args={[1, platform.size.y * 0.8, platform.size.z * 0.6]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      {(hovered || isSelected) && (
        <Html position={[0, platform.size.y + 2, 0]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div className="bg-black/85 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            <div className="font-bold">{platform.name}</div>
            <div style={{ color }}>
              {platform.status === 'idle' && '空闲'}
              {platform.status === 'occupied' && '占用中'}
              {platform.status === 'reserved' && '已预约'}
              {platform.status === 'maintenance' && '维护中'}
            </div>
            <div className="text-gray-400">使用率: {platform.usageRate.toFixed(1)}%</div>
          </div>
        </Html>
      )}
    </group>
  );
}

interface PlatformsProps {
  platforms: PlatformType[];
}

export function Platforms({ platforms }: PlatformsProps) {
  return (
    <group name="platforms">
      {platforms.map((platform) => (
        <PlatformDock key={platform.id} platform={platform} />
      ))}
    </group>
  );
}
