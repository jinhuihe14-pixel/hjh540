import { useEffect, useRef, useMemo, useState, useImperativeHandle, forwardRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Ground } from './Ground';
import { Buildings } from './Buildings';
import { Roads } from './Roads';
import { Warehouses } from './Warehouses';
import { Platforms } from './Platforms';
import { Gates } from './Gates';
import { Vehicles } from './Vehicles';
import { CargoSlots } from './CargoSlots';
import { Heatmap } from './Heatmap';
import { PathLine } from './PathLine';
import { useParkStore } from '@/store/parkStore';
import type { Position3D, CameraView } from '@/types';

interface CameraControllerProps {
  targetPosition?: Position3D;
  targetLookAt?: Position3D;
  onCameraChange?: (position: Position3D, target: Position3D) => void;
}

let currentCameraView: { position: Position3D; target: Position3D } | null = null;

function CameraController({ targetPosition, targetLookAt, onCameraChange }: CameraControllerProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const targetPos = useRef<THREE.Vector3 | null>(null);
  const targetLook = useRef<THREE.Vector3 | null>(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    if (targetPosition) {
      targetPos.current = new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z);
    }
    if (targetLookAt) {
      targetLook.current = new THREE.Vector3(targetLookAt.x, targetLookAt.y, targetLookAt.z);
    }
  }, [targetPosition, targetLookAt]);

  useFrame(({ clock }, delta) => {
    if (targetPos.current) {
      camera.position.lerp(targetPos.current, delta * 2);
      if (targetLook.current && controlsRef.current) {
        controlsRef.current.target.lerp(targetLook.current, delta * 2);
        controlsRef.current.update();
      }
    }

    const now = clock.getElapsedTime();
    if (now - lastUpdateRef.current > 0.1) {
      lastUpdateRef.current = now;
      if (controlsRef.current) {
        const pos = camera.position;
        const tgt = controlsRef.current.target;
        currentCameraView = {
          position: { x: pos.x, y: pos.y, z: pos.z },
          target: { x: tgt.x, y: tgt.y, z: tgt.z },
        };
        if (onCameraChange) {
          onCameraChange(
            { x: pos.x, y: pos.y, z: pos.z },
            { x: tgt.x, y: tgt.y, z: tgt.z }
          );
        }
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={20}
      maxDistance={300}
      minPolarAngle={0.2}
      maxPolarAngle={Math.PI / 2 - 0.1}
      target={[0, 0, 0]}
    />
  );
}

export function getCurrentCameraView() {
  return currentCameraView;
}

function SceneContent() {
  const layers = useParkStore((state) => state.layers);
  const buildings = useParkStore((state) => state.buildings);
  const roads = useParkStore((state) => state.roads);
  const warehouses = useParkStore((state) => state.warehouses);
  const vehicles = useParkStore((state) => state.vehicles);
  const platforms = useParkStore((state) => state.platforms);
  const gates = useParkStore((state) => state.gates);
  const cargoSlots = useParkStore((state) => state.cargoSlots);
  const currentWarehouseId = useParkStore((state) => state.currentWarehouseId);
  const plannedPath = useParkStore((state) => state.plannedPath);
  const currentView = useParkStore((state) => state.currentView);
  const startVehicleAnimation = useParkStore((state) => state.startVehicleAnimation);
  const loadParkData = useParkStore((state) => state.loadParkData);
  const isLoading = useParkStore((state) => state.isLoading);

  useEffect(() => {
    loadParkData();
  }, [loadParkData]);

  useEffect(() => {
    const cleanup = startVehicleAnimation();
    return cleanup;
  }, [startVehicleAnimation]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 80, 30]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={300}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <hemisphereLight args={['#87ceeb', '#2d5016', 0.3]} />

      <Stars radius={300} depth={60} count={2000} factor={7} saturation={0} fade speed={1} />

      <Ground size={[220, 180]} />

      {layers.roads && <Roads roads={roads} />}
      {layers.buildings && <Buildings buildings={buildings} />}
      {layers.warehouses && <Warehouses warehouses={warehouses} />}
      {layers.platforms && <Platforms platforms={platforms} />}
      {layers.gates && <Gates gates={gates} />}
      {layers.vehicles && <Vehicles vehicles={vehicles} showTrails={true} />}

      {layers.warehouses && currentWarehouseId && (
        <CargoSlots slots={cargoSlots} warehouseId={currentWarehouseId} />
      )}

      {layers.heatmap && <Heatmap />}

      {plannedPath && plannedPath.length > 1 && <PathLine points={plannedPath} />}

      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={250} blur={2} far={50} />

      <CameraController
        targetPosition={currentView?.position}
        targetLookAt={currentView?.target}
      />

      <fog attach="fog" args={['#1a2a3a', 150, 350]} />
    </>
  );
}

interface ParkSceneProps {
  className?: string;
}

export function ParkScene({ className }: ParkSceneProps) {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        shadows
        camera={{ position: [0, 120, 120], fov: 50, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor('#1a2a3a');
          scene.background = new THREE.Color('#1a2a3a');
        }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
