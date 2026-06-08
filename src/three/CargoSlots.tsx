import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { CargoSlot } from '@/types';
import { useParkStore } from '@/store/parkStore';

const statusColors: Record<string, string> = {
  empty: '#555555',
  occupied: '#3498db',
  pending_out: '#f39c12',
  abnormal: '#e74c3c',
};

interface SlotProps {
  slot: CargoSlot;
  isSelected: boolean;
  onClick: () => void;
}

function SlotCube({ slot, isSelected, onClick }: SlotProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const color = statusColors[slot.status];

  useFrame(({ clock }) => {
    if (meshRef.current && isSelected) {
      meshRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 3) * 0.05);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[slot.position.x, slot.position.y, slot.position.z]}
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
        onClick();
      }}
    >
      <boxGeometry args={[slot.size.x, slot.size.y, slot.size.z]} />
      <meshStandardMaterial
        color={isSelected ? '#f1c40f' : color}
        transparent
        opacity={slot.status === 'empty' ? 0.3 : 0.85}
        emissive={isSelected || hovered ? color : '#000000'}
        emissiveIntensity={isSelected ? 0.5 : hovered ? 0.2 : 0}
      />

      {(hovered || isSelected) && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(slot.size.x * 1.05, slot.size.y * 1.05, slot.size.z * 1.05)]} />
          <lineBasicMaterial color={isSelected ? '#f1c40f' : '#ffffff'} linewidth={2} />
        </lineSegments>
      )}
    </mesh>
  );
}

interface CargoSlotsProps {
  slots: CargoSlot[];
  warehouseId: string;
}

export function CargoSlots({ slots, warehouseId }: CargoSlotsProps) {
  const selectSlot = useParkStore((state) => state.selectSlot);
  const selectedSlotId = useParkStore((state) => state.selectedSlotId);
  const currentWarehouseId = useParkStore((state) => state.currentWarehouseId);

  if (currentWarehouseId !== warehouseId) return null;

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  return (
    <group name="cargo-slots">
      {slots.map((slot) => (
        <SlotCube
          key={slot.id}
          slot={slot}
          isSelected={slot.id === selectedSlotId}
          onClick={() => selectSlot(slot.id === selectedSlotId ? null : slot.id)}
        />
      ))}

      {selectedSlot && selectedSlot.cargoInfo && (
        <Html
          position={[selectedSlot.position.x, selectedSlot.position.y + selectedSlot.size.y + 1, selectedSlot.position.z]}
          center
          distanceFactor={6}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-black/90 text-white px-3 py-2 rounded text-xs whitespace-nowrap min-w-[120px]">
            <div className="font-bold text-blue-400">{selectedSlot.cargoInfo.name}</div>
            <div className="text-gray-400 mt-1">批次: {selectedSlot.cargoInfo.batch}</div>
            <div className="text-gray-400">数量: {selectedSlot.cargoInfo.quantity}</div>
            <div className="text-gray-400">重量: {selectedSlot.cargoInfo.weight.toFixed(2)}吨</div>
            <div className="text-gray-400">货主: {selectedSlot.cargoInfo.owner}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

interface CargoLegendProps {
  position?: [number, number, number];
}

export function CargoLegend({ position = [0, 0, 0] }: CargoLegendProps) {
  const legends = [
    { status: 'empty', label: '空货位', color: statusColors.empty },
    { status: 'occupied', label: '已占用', color: statusColors.occupied },
    { status: 'pending_out', label: '待出库', color: statusColors.pending_out },
    { status: 'abnormal', label: '异常滞留', color: statusColors.abnormal },
  ];

  return (
    <group position={position}>
      {legends.map((item, i) => (
        <group key={item.status} position={[0, -i * 0.8, 0]}>
          <mesh position={[-0.4, 0, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.1]} />
            <meshStandardMaterial color={item.color} />
          </mesh>
          <Html position={[0.3, 0, 0]} distanceFactor={4} style={{ pointerEvents: 'none' }}>
            <span className="text-white text-xs">{item.label}</span>
          </Html>
        </group>
      ))}
    </group>
  );
}
