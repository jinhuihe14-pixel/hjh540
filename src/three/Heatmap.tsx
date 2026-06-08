import { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import type { HeatmapData } from '@/types';
import { heatmapApi } from '@/api';
import { useParkStore } from '@/store/parkStore';

interface HeatmapProps {
  data?: HeatmapData[];
  opacity?: number;
}

export function Heatmap({ data: propData, opacity = 0.6 }: HeatmapProps) {
  const heatmapType = useParkStore((state) => state.heatmapType);
  const showHeatmap = useParkStore((state) => state.showHeatmap);
  const [heatData, setHeatData] = useState<HeatmapData[]>([]);

  useEffect(() => {
    if (!showHeatmap || propData) return;
    if (heatmapType) {
      heatmapApi.getHeatmapData(heatmapType).then(setHeatData);
    }
  }, [heatmapType, showHeatmap, propData]);

  const texture = useMemo(() => {
    if (!showHeatmap) return null;

    const data = propData || heatData;
    if (!data || data.length === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const scale = 512 / 200;

    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 512, 512);

    data.forEach((point) => {
      const x = (point.position.x + 100) * scale;
      const y = (point.position.y + 80) * scale;
      const radius = point.radius * scale;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      const alpha = point.value * 0.8;
      gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha})`);
      gradient.addColorStop(0.3, `rgba(255, 165, 0, ${alpha * 0.8})`);
      gradient.addColorStop(0.6, `rgba(255, 255, 0, ${alpha * 0.5})`);
      gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [propData, heatData, showHeatmap]);

  if (!showHeatmap || !texture) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
      <planeGeometry args={[200, 160]} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}
