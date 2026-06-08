import { useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Gate as GateType } from '@/types';

interface GateProps {
  gate: GateType;
}

const statusColors: Record<string, string> = {
  open: '#27ae60',
  closed: '#e74c3c',
  busy: '#f39c12',
};

function Gate({ gate }: GateProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);

  const color = statusColors[gate.status] || '#666';

  const isHorizontal = Math.abs(gate.size.x) > Math.abs(gate.size.z);

  return (
    <group position={[gate.position.x, gate.position.y, gate.position.z]} ref={meshRef}>
      <mesh position={[0, gate.size.y / 2, 0]} castShadow>
        <boxGeometry args={[gate.size.x, gate.size.y, gate.size.z]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      <mesh position={[0, gate.size.y + 0.5, 0]}>
        <boxGeometry args={[gate.size.x * 1.2, 1, 0.5]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      {isHorizontal ? (
        <>
          <mesh position={[-gate.size.x / 2 + 1, 1, 0]}>
            <boxGeometry args={[0.5, 2, 0.5]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[gate.size.x / 2 - 1, 1, 0]}>
            <boxGeometry args={[0.5, 2, 0.5]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0, 1, -gate.size.z / 2 + 1]}>
            <boxGeometry args={[0.5, 2, 0.5]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, 1, gate.size.z / 2 - 1]}>
            <boxGeometry args={[0.5, 2, 0.5]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
          </mesh>
        </>
      )}

      {(hovered || true) && (
        <Html
          position={[0, gate.size.y + 3, 0]}
          center
          distanceFactor={10}
          style={{ pointerEvents: 'none' }}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <div className="bg-black/85 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            <div className="font-bold">{gate.name}</div>
            <div style={{ color }}>
              {gate.status === 'open' && '正常开放'}
              {gate.status === 'closed' && '关闭'}
              {gate.status === 'busy' && '繁忙'}
            </div>
            <div className="text-gray-400">今日通行: {gate.todayTraffic}</div>
            {gate.currentQueue > 0 && <div className="text-yellow-400">排队: {gate.currentQueue}辆</div>}
          </div>
        </Html>
      )}
    </group>
  );
}

interface GatesProps {
  gates: GateType[];
}

export function Gates({ gates }: GatesProps) {
  return (
    <group name="gates">
      {gates.map((gate) => (
        <Gate key={gate.id} gate={gate} />
      ))}
    </group>
  );
}
