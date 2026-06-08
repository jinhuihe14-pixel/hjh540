import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { Vehicle as VehicleType } from '@/types';
import { useParkStore } from '@/store/parkStore';

const vehicleColors: Record<string, string> = {
  truck: '#2c3e50',
  forklift: '#e67e22',
  van: '#3498db',
  container: '#7f8c8d',
};

const statusColors: Record<string, string> = {
  moving: '#27ae60',
  stopped: '#f39c12',
  loading: '#3498db',
  unloading: '#9b59b6',
  waiting: '#e67e22',
  violation: '#e74c3c',
};

interface VehicleMeshProps {
  vehicle: VehicleType;
  isSelected: boolean;
  onClick: () => void;
}

function VehicleMesh({ vehicle, isSelected, onClick }: VehicleMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const baseColor = vehicleColors[vehicle.type] || '#666';
  const statusColor = statusColors[vehicle.status] || '#999';
  const showWarning = vehicle.status === 'violation';

  const dimensions = useMemo(() => {
    switch (vehicle.type) {
      case 'truck':
        return { body: [4, 1.5, 2], cab: [1.2, 1.8, 1.8], height: 0.5 };
      case 'forklift':
        return { body: [1.5, 0.8, 1], cab: [1, 1.2, 0.9], height: 0.3 };
      case 'van':
        return { body: [2.5, 1.3, 1.5], cab: [0.8, 1.5, 1.4], height: 0.4 };
      case 'container':
        return { body: [5, 2, 2.2], cab: [1.2, 2, 2], height: 0.6 };
      default:
        return { body: [3, 1.2, 1.5], cab: [1, 1.5, 1.4], height: 0.4 };
    }
  }, [vehicle.type]);

  const totalHeight = dimensions.height + dimensions.body[1];

  useFrame(({ clock }) => {
    if (groupRef.current && showWarning) {
      const intensity = (Math.sin(clock.getElapsedTime() * 4) + 1) / 2;
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          if (child.name === 'warning-light') {
            child.material.emissiveIntensity = 0.3 + intensity * 0.7;
          }
        }
      });
    }
  });

  return (
    <group
      ref={groupRef}
      position={[vehicle.position.x, dimensions.height, vehicle.position.z]}
      rotation={[0, vehicle.rotation, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <mesh position={[0, dimensions.body[1] / 2, 0]} castShadow>
        <boxGeometry args={dimensions.body as [number, number, number]} />
        <meshStandardMaterial color={baseColor} />
      </mesh>

      <mesh
        position={[
          -dimensions.body[0] / 2 - dimensions.cab[0] / 2 + 0.2,
          dimensions.cab[1] / 2,
          0,
        ]}
        castShadow
      >
        <boxGeometry args={dimensions.cab as [number, number, number]} />
        <meshStandardMaterial color={baseColor} />
      </mesh>

      <mesh
        position={[
          -dimensions.body[0] / 2 - dimensions.cab[0] / 2 + 0.2,
          dimensions.cab[1] * 0.7,
          dimensions.cab[2] / 2 + 0.01,
        ]}
      >
        <planeGeometry args={[dimensions.cab[0] * 0.8, dimensions.cab[1] * 0.5]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.7} />
      </mesh>

      <mesh name="warning-light" position={[0, dimensions.body[1] + 0.3, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial
          color={isSelected ? '#4a90d9' : statusColor}
          emissive={isSelected ? '#4a90d9' : statusColor}
          emissiveIntensity={showWarning ? 0.8 : 0.3}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[dimensions.body[0] / 4, -dimensions.height / 2 + 0.05, dimensions.body[2] / 2 - 0.2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[dimensions.body[0] / 4, -dimensions.height / 2 + 0.05, -dimensions.body[2] / 2 + 0.2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-dimensions.body[0] / 4, -dimensions.height / 2 + 0.05, dimensions.body[2] / 2 - 0.2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-dimensions.body[0] / 4, -dimensions.height / 2 + 0.05, -dimensions.body[2] / 2 + 0.2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {isSelected && (
        <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2, 2.5, 32]} />
          <meshBasicMaterial color="#4a90d9" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {(isSelected || showWarning) && (
        <Html position={[0, totalHeight + 1.5, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div
            className={`px-2 py-1 rounded text-xs whitespace-nowrap font-medium ${
              showWarning ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-600 text-white'
            }`}
          >
            {vehicle.plateNumber}
            {showWarning && ' · 违停'}
          </div>
        </Html>
      )}
    </group>
  );
}

interface VehicleTrailProps {
  trail: { x: number; y: number; z: number }[];
  color: string;
}

function VehicleTrail({ trail, color }: VehicleTrailProps) {
  const points = useMemo(() => {
    return trail.map((p) => [p.x, 0.1, p.z] as [number, number, number]);
  }, [trail]);

  if (trail.length < 2) return null;

  return <Line points={points} color={color} transparent opacity={0.6} lineWidth={2} />;
}

interface VehiclesProps {
  vehicles: VehicleType[];
  showTrails?: boolean;
}

export function Vehicles({ vehicles, showTrails = true }: VehiclesProps) {
  const selectVehicle = useParkStore((state) => state.selectVehicle);
  const selectedVehicleId = useParkStore((state) => state.selectedVehicleId);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <group name="vehicles">
      {vehicles.map((vehicle) => (
        <VehicleMesh
          key={vehicle.id}
          vehicle={vehicle}
          isSelected={vehicle.id === selectedVehicleId}
          onClick={() => selectVehicle(vehicle.id === selectedVehicleId ? null : vehicle.id)}
        />
      ))}

      {showTrails && selectedVehicle && selectedVehicle.trail.length > 1 && (
        <VehicleTrail trail={selectedVehicle.trail} color="#4a90d9" />
      )}
    </group>
  );
}
