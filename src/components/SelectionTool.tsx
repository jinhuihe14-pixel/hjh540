import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useParkStore } from '@/store/parkStore';
import { X } from 'lucide-react';

export function SelectionTool() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const endPos = useRef<{ x: number; y: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const isSelecting = useParkStore((state) => state.isSelecting);
  const setSelectionBox = useParkStore((state) => state.setSelectionBox);
  const setIsSelecting = useParkStore((state) => state.setIsSelecting);
  const calculateSelectionStats = useParkStore((state) => state.calculateSelectionStats);
  const selectionStats = useParkStore((state) => state.selectionStats);
  const selectionBox = useParkStore((state) => state.selectionBox);

  useEffect(() => {
    const canvas = document.querySelector('canvas');
    canvasRef.current = canvas;
    if (!canvas) return;

    const getWorldPosition = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(x, y);
      const camera = new THREE.PerspectiveCamera(50, rect.width / rect.height, 0.1, 1000);
      camera.position.set(0, 120, 120);
      camera.lookAt(0, 0, 0);
      raycaster.setFromCamera(mouse, camera);

      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersect = new THREE.Vector3();
      raycaster.ray.intersectPlane(groundPlane, intersect);

      return intersect;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!isSelecting) return;
      const rect = canvas.getBoundingClientRect();
      startPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      endPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setIsDragging(true);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isSelecting || !startPos.current) return;
      const rect = canvas.getBoundingClientRect();
      endPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      if (boxRef.current) {
        const left = Math.min(startPos.current.x, endPos.current.x);
        const top = Math.min(startPos.current.y, endPos.current.y);
        const width = Math.abs(endPos.current.x - startPos.current.x);
        const height = Math.abs(endPos.current.y - startPos.current.y);
        boxRef.current.style.left = `${left}px`;
        boxRef.current.style.top = `${top}px`;
        boxRef.current.style.width = `${width}px`;
        boxRef.current.style.height = `${height}px`;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isSelecting || !startPos.current || !endPos.current) return;

      const rect = canvas.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;

      const width = Math.abs(endX - startPos.current.x);
      const height = Math.abs(endY - startPos.current.y);

      if (width > 10 && height > 10) {
        const left = Math.min(startPos.current.x, endX);
        const top = Math.min(startPos.current.y, endY);
        const right = Math.max(startPos.current.x, endX);
        const bottom = Math.max(startPos.current.y, endY);

        const worldStart = getWorldPosition(left + rect.left, top + rect.top);
        const worldEnd = getWorldPosition(right + rect.left, bottom + rect.top);

        if (worldStart && worldEnd) {
          setSelectionBox({
            start: { x: worldStart.x, y: worldStart.z },
            end: { x: worldEnd.x, y: worldEnd.z },
          });
          setTimeout(() => calculateSelectionStats(), 50);
        }
      }

      startPos.current = null;
      endPos.current = null;
      setIsDragging(false);
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [isSelecting, setSelectionBox, calculateSelectionStats]);

  if (!isSelecting) return null;

  return (
    <>
      <div
        ref={boxRef}
        className="absolute pointer-events-none border-2 border-blue-400 bg-blue-400/20 z-20 rounded-sm"
        style={{ display: 'none' }}
      />

      {selectionBox && selectionStats && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700/50 p-4 min-w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              框选区域统计
            </h3>
            <button
              onClick={() => {
                setSelectionBox(null);
                setIsSelecting(false);
              }}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-slate-700/50 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800/50 p-2 rounded">
              <div className="text-gray-400 text-xs">货位总数</div>
              <div className="text-white text-lg font-bold">{selectionStats.slotCount}</div>
            </div>
            <div className="bg-slate-800/50 p-2 rounded">
              <div className="text-gray-400 text-xs">已占用</div>
              <div className="text-green-400 text-lg font-bold">{selectionStats.occupiedSlots}</div>
            </div>
            <div className="bg-slate-800/50 p-2 rounded">
              <div className="text-gray-400 text-xs">车辆数量</div>
              <div className="text-blue-400 text-lg font-bold">{selectionStats.vehicleCount}</div>
            </div>
            <div className="bg-slate-800/50 p-2 rounded">
              <div className="text-gray-400 text-xs">吞吐量</div>
              <div className="text-yellow-400 text-lg font-bold">{selectionStats.throughput}</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            区域面积: {selectionStats.area.toFixed(1)} ㎡
          </div>
        </div>
      )}

      {isSelecting && !selectionBox && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-blue-900/80 backdrop-blur-sm rounded-lg shadow-lg border border-blue-500/50 px-4 py-2 text-blue-200 text-sm">
          在场景中拖拽鼠标框选区域
        </div>
      )}
    </>
  );
}
