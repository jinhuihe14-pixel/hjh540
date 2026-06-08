import { useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Warehouse as WarehouseType } from '@/types';
import { useParkStore } from '@/store/parkStore';

interface WarehouseProps {
  warehouse: WarehouseType;
}

function WarehouseBuilding({ warehouse }: WarehouseProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const selectWarehouse = useParkStore((state) => state.selectWarehouse);
  const selectedWarehouseId = useParkStore((state) => state.selectedWarehouseId);
  const currentWarehouseId = useParkStore((state) => state.currentWarehouseId);
  const loadWarehouseSlots = useParkStore((state) => state.loadWarehouseSlots);
  const isSelected = selectedWarehouseId === warehouse.id;
  const isCurrent = currentWarehouseId === warehouse.id;

  const handleClick = () => {
    if (!isSelected) {
      selectWarehouse(warehouse.id);
      loadWarehouseSlots(warehouse.id);
    } else {
      selectWarehouse(null);
    }
  };

  const occupancyRate = warehouse.occupiedSlots / warehouse.totalSlots;
  const statusColor = occupancyRate > 0.8 ? '#e74c3c' : occupancyRate > 0.5 ? '#f39c12' : '#27ae60';
  const buildingOpacity = isCurrent ? 0.15 : 1;

  return (
    <group position={[warehouse.position.x, warehouse.position.y, warehouse.position.z]}>
      <mesh
        ref={meshRef}
        position={[0, warehouse.size.y / 2, 0]}
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
          handleClick();
        }}
      >
        <boxGeometry args={[warehouse.size.x, warehouse.size.y, warehouse.size.z]} />
        <meshStandardMaterial
          color={isSelected ? '#6ab0ff' : '#5a6c7d'}
          emissive={isSelected ? '#4a90d9' : '#1a2530'}
          emissiveIntensity={isSelected ? 0.3 : 0.1}
          transparent
          opacity={buildingOpacity}
        />
      </mesh>

      {Array.from({ length: warehouse.floors }).map((_, floorIdx) => (
        <mesh key={`floor-${floorIdx}`} position={[warehouse.size.x / 2 + 0.01, (floorIdx + 1) * (warehouse.size.y / warehouse.floors), 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[warehouse.size.z, 0.3]} />
          <meshStandardMaterial color="#f0f5ff" emissive="#88ccff" emissiveIntensity={0.2} transparent opacity={buildingOpacity} />
        </mesh>
      ))}

      <mesh position={[0, warehouse.size.y + 0.3, 0]}>
        <boxGeometry args={[warehouse.size.x * 0.6, 0.6, 4]} />
        <meshStandardMaterial color={statusColor} transparent opacity={buildingOpacity > 0.5 ? 1 : buildingOpacity * 2} />
      </mesh>

      {(hovered || isSelected) && (
        <Html position={[0, warehouse.size.y + 3, 0]} center distanceFactor={12} style={{ pointerEvents: 'none' }}>
          <div className="bg-black/85 text-white px-3 py-2 rounded text-sm whitespace-nowrap">
            <div className="font-bold text-base">{warehouse.name}</div>
            <div className="text-gray-300 text-xs mt-1">
              {warehouse.floors}层 · {warehouse.totalSlots}货位 · 占用{Math.round(occupancyRate * 100)}%
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

interface WarehousesProps {
  warehouses: WarehouseType[];
}

export function Warehouses({ warehouses }: WarehousesProps) {
  return (
    <group name="warehouses">
      {warehouses.map((warehouse) => (
        <WarehouseBuilding key={warehouse.id} warehouse={warehouse} />
      ))}
    </group>
  );
}
