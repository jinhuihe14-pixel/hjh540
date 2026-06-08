import { useMemo } from 'react';
import * as THREE from 'three';
import type { RoadSegment } from '@/types';

interface RoadProps {
  road: RoadSegment;
}

function Road({ road }: RoadProps) {
  const { position, rotation, length } = useMemo(() => {
    const dx = road.end.x - road.start.x;
    const dy = road.end.y - road.start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const midX = (road.start.x + road.end.x) / 2;
    const midY = (road.start.y + road.end.y) / 2;
    return {
      position: [midX, 0.05, midY] as [number, number, number],
      rotation: [-Math.PI / 2, -angle, 0] as [number, number, number],
      length,
    };
  }, [road]);

  const congestionColor = useMemo(() => {
    const level = road.congestionLevel;
    if (level < 0.3) return '#555555';
    if (level < 0.6) return '#8B7500';
    return '#8B0000';
  }, [road.congestionLevel]);

  return (
    <group position={position} rotation={rotation as unknown as THREE.Euler}>
      <mesh>
        <planeGeometry args={[length, road.width]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>

      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[length, road.width * 0.9]} />
        <meshStandardMaterial color={congestionColor} transparent opacity={0.6} />
      </mesh>

      {road.type === 'main' && (
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[length, 0.2]} />
          <meshStandardMaterial color="#ffff00" />
        </mesh>
      )}

      {road.lanes > 2 &&
        Array.from({ length: road.lanes - 1 }).map((_, i) => {
          const offset = -road.width / 2 + (road.width / road.lanes) * (i + 1);
          return (
            <mesh key={i} position={[0, 0, 0.02]}>
              <planeGeometry args={[length * 0.8, 0.1]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          );
        })}
    </group>
  );
}

interface RoadsProps {
  roads: RoadSegment[];
}

export function Roads({ roads }: RoadsProps) {
  return (
    <group name="roads">
      {roads.map((road) => (
        <Road key={road.id} road={road} />
      ))}
    </group>
  );
}
