import { create } from 'zustand';
import type {
  LayerType,
  Building,
  RoadSegment,
  Warehouse,
  Vehicle,
  Platform,
  Gate,
  CargoSlot,
  Position3D,
  HeatmapType,
  CameraView,
  OperationLog,
  PathPoint,
} from '@/types';
import { parkApi, warehouseApi, vehicleApi, platformApi } from '@/api';

interface ParkState {
  layers: Record<LayerType, boolean>;
  buildings: Building[];
  roads: RoadSegment[];
  warehouses: Warehouse[];
  vehicles: Vehicle[];
  platforms: Platform[];
  gates: Gate[];

  selectedBuildingId: string | null;
  selectedWarehouseId: string | null;
  selectedVehicleId: string | null;
  selectedPlatformId: string | null;
  selectedSlotId: string | null;

  cargoSlots: CargoSlot[];
  currentWarehouseId: string | null;

  heatmapType: HeatmapType | null;
  showHeatmap: boolean;

  cameraViews: CameraView[];
  currentView: CameraView | null;

  operationLogs: OperationLog[];

  plannedPath: PathPoint[] | null;
  pathStart: Position3D | null;
  pathEnd: Position3D | null;

  isLoading: boolean;
  error: string | null;

  toggleLayer: (layer: LayerType) => void;
  setLayerVisible: (layer: LayerType, visible: boolean) => void;

  loadParkData: () => Promise<void>;
  loadWarehouseSlots: (warehouseId: string) => Promise<void>;

  selectBuilding: (id: string | null) => void;
  selectWarehouse: (id: string | null) => void;
  selectVehicle: (id: string | null) => void;
  selectPlatform: (id: string | null) => void;
  selectSlot: (id: string | null) => void;

  setHeatmapType: (type: HeatmapType | null) => void;
  setShowHeatmap: (show: boolean) => void;

  addCameraView: (view: CameraView) => void;
  removeCameraView: (id: string) => void;
  setCurrentView: (view: CameraView | null) => void;

  addOperationLog: (type: string, description: string) => void;
  clearLogs: () => void;

  setPlannedPath: (path: PathPoint[] | null) => void;
  setPathStart: (pos: Position3D | null) => void;
  setPathEnd: (pos: Position3D | null) => void;

  updateVehiclePosition: (vehicleId: string, position: Position3D, rotation: number) => void;
  startVehicleAnimation: () => () => void;
}

const initialLayers: Record<LayerType, boolean> = {
  buildings: true,
  roads: true,
  warehouses: true,
  vehicles: true,
  platforms: true,
  gates: true,
  heatmap: false,
};

const defaultViews: CameraView[] = [
  { id: 'view-overview', name: '园区全景', position: { x: 0, y: 150, z: 150 }, target: { x: 0, y: 0, z: 0 } },
  { id: 'view-east', name: '东区仓库', position: { x: 100, y: 80, z: 60 }, target: { x: 50, y: 0, z: 0 } },
  { id: 'view-west', name: '西区办公', position: { x: -100, y: 60, z: -40 }, target: { x: -60, y: 0, z: -30 } },
];

export const useParkStore = create<ParkState>((set, get) => ({
  layers: initialLayers,
  buildings: [],
  roads: [],
  warehouses: [],
  vehicles: [],
  platforms: [],
  gates: [],

  selectedBuildingId: null,
  selectedWarehouseId: null,
  selectedVehicleId: null,
  selectedPlatformId: null,
  selectedSlotId: null,

  cargoSlots: [],
  currentWarehouseId: null,

  heatmapType: 'traffic',
  showHeatmap: false,

  cameraViews: defaultViews,
  currentView: null,

  operationLogs: [],

  plannedPath: null,
  pathStart: null,
  pathEnd: null,

  isLoading: false,
  error: null,

  toggleLayer: (layer) => {
    set((state) => ({
      layers: { ...state.layers, [layer]: !state.layers[layer] },
    }));
    get().addOperationLog('图层控制', `${layer} 图层${get().layers[layer] ? '显示' : '隐藏'}`);
  },

  setLayerVisible: (layer, visible) => {
    set((state) => ({
      layers: { ...state.layers, [layer]: visible },
    }));
  },

  loadParkData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [buildings, roads, warehouses, vehicles, platforms, gates] = await Promise.all([
        parkApi.getBuildings(),
        parkApi.getRoads(),
        warehouseApi.getWarehouses(),
        vehicleApi.getVehicles(),
        platformApi.getPlatforms(),
        parkApi.getGates(),
      ]);

      set({
        buildings,
        roads,
        warehouses,
        vehicles,
        platforms,
        gates,
        isLoading: false,
      });

      get().addOperationLog('数据加载', '园区数据加载完成');
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  loadWarehouseSlots: async (warehouseId) => {
    set({ isLoading: true, error: null });
    try {
      const slots = await warehouseApi.getCargoSlots(warehouseId);
      set({ cargoSlots: slots, currentWarehouseId: warehouseId, isLoading: false });
      get().addOperationLog('仓库查询', `加载 ${warehouseId} 货位数据`);
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  selectBuilding: (id) => set({ selectedBuildingId: id }),
  selectWarehouse: (id) => set({ selectedWarehouseId: id }),
  selectVehicle: (id) => {
    set({ selectedVehicleId: id });
    if (id) {
      const vehicle = get().vehicles.find((v) => v.id === id);
      if (vehicle) {
        get().addOperationLog('车辆查询', `选中车辆 ${vehicle.plateNumber}`);
      }
    }
  },
  selectPlatform: (id) => set({ selectedPlatformId: id }),
  selectSlot: (id) => set({ selectedSlotId: id }),

  setHeatmapType: (type) => set({ heatmapType: type }),
  setShowHeatmap: (show) => {
    set({ showHeatmap: show, layers: { ...get().layers, heatmap: show } });
    if (show) {
      get().addOperationLog('热力图', `显示${get().heatmapType}热力图`);
    }
  },

  addCameraView: (view) => {
    set((state) => ({ cameraViews: [...state.cameraViews, view] }));
    get().addOperationLog('视角收藏', `收藏视角 ${view.name}`);
  },

  removeCameraView: (id) => {
    set((state) => ({ cameraViews: state.cameraViews.filter((v) => v.id !== id) }));
  },

  setCurrentView: (view) => set({ currentView: view }),

  addOperationLog: (type, description) => {
    const log: OperationLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      type,
      description,
    };
    set((state) => ({ operationLogs: [log, ...state.operationLogs].slice(0, 500) }));
  },

  clearLogs: () => set({ operationLogs: [] }),

  setPlannedPath: (path) => set({ plannedPath: path }),
  setPathStart: (pos) => set({ pathStart: pos }),
  setPathEnd: (pos) => set({ pathEnd: pos }),

  updateVehiclePosition: (vehicleId, position, rotation) => {
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              position,
              rotation,
              trail: [...v.trail.slice(-20), { ...position }],
            }
          : v
      ),
    }));
  },

  startVehicleAnimation: () => {
    let animationId: number;
    let lastTime = 0;

    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (delta > 0 && delta < 1) {
        const state = get();
        state.vehicles.forEach((vehicle) => {
          if (vehicle.status === 'moving' && vehicle.speed > 0) {
            const speed = vehicle.speed * delta * 2;
            const newX = vehicle.position.x + Math.cos(vehicle.rotation) * speed;
            const newZ = vehicle.position.z + Math.sin(vehicle.rotation) * speed;

            if (Math.abs(newX) < 95 && Math.abs(newZ) < 70) {
              get().updateVehiclePosition(
                vehicle.id,
                { x: newX, y: 0, z: newZ },
                vehicle.rotation
              );
            } else {
              set((s) => ({
                vehicles: s.vehicles.map((v) =>
                  v.id === vehicle.id ? { ...v, rotation: v.rotation + Math.PI } : v
                ),
              }));
            }
          }
        });
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  },
}));
