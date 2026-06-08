import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Building as BuildingType } from '@/types';
import { useParkStore } from '@/store/parkStore';

interface BuildingProps {
  building: BuildingType;
}

export function Building({ building }: BuildingProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const selectBuilding = useParkStore((state) => state.selectBuilding);
  const selectedBuildingId = useParkStore((state) => state.selectedBuildingId);
  const isSelected = selectedBuildingId === building.id;

  useFrame((state) => {
    if (meshRef.current && hovered) {
    }
  });

  const color = isSelected ? '#6ab0ff' : building.color;

  return (
    <group position={[building.position.x, building.position.y, building.position.z]}>
      <mesh
        ref={meshRef}
        position={[0, building.size.y / 2, 0]}
        castShadow
        receiveShadow
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
          selectBuilding(isSelected ? null : building.id);
        }}
      >
        <boxGeometry args={[building.size.x, building.size.y, building.size.z]} />
        <meshStandardMaterial
          color={color}
          emissive={isSelected ? '#4a90d9' : '#000000'}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>

      {Array.from({ length: building.floors }).map((_, floorIdx) =>
        Array.from({ length: Math.floor(building.size.x / 5) }).map((_, winIdx) => (
          <mesh
            key={`win-${floorIdx}-${winIdx}`}
            position={[
              -building.size.x / 2 + 2.5 + winIdx * 5,
              2 + floorIdx * (building.size.y / building.floors),
              building.size.z / 2 + 0.01,
            ]}
          >
            <planeGeometry args={[2, 1.5]} />
            <meshStandardMaterial color="#f0f5ff" emissive="#ffffaa" emissiveIntensity={0.3} />
          </mesh>
        ))
      )}

      {(hovered || isSelected) && (
        <Html
          position={[0, building.size.y + 2, 0]}
          center
          distanceFactor={10}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-black/80 text-white px-3 py-1 rounded text-sm whitespace-nowrap font-medium">
            {building.name}
          </div>
        </Html>
      )}
    </group>
  );
}

interface BuildingsProps {
  buildings: BuildingType[];
}

export function Buildings({ buildings }: BuildingsProps) {
  return (
    <group name="buildings">
      {buildings.map((building) => (
        <Building key={building.id} building={building} />
      ))}
    </group>
  );
}
