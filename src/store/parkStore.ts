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
  Alarm,
  AlarmStatistics,
  PlatformReservation,
  ReservationFormData,
  TimeConflictResult,
  SelectionStats,
  SelectionBox,
  BatchSearchResult,
  CargoBatchTrace,
  HighlightMode,
} from '@/types';
import { parkApi, warehouseApi, vehicleApi, platformApi, alarmApi, reservationApi, traceApi } from '@/api';

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

  alarms: Alarm[];
  alarmStatistics: AlarmStatistics | null;
  showAlarmPanel: boolean;
  activeAlarmId: string | null;
  alarmSoundEnabled: boolean;
  loadAlarms: () => Promise<void>;
  loadAlarmStatistics: () => Promise<void>;
  addAlarm: (alarm: Alarm) => void;
  acknowledgeAlarm: (id: string) => void;
  resolveAlarm: (id: string) => void;
  setShowAlarmPanel: (show: boolean) => void;
  setActiveAlarmId: (id: string | null) => void;
  setAlarmSoundEnabled: (enabled: boolean) => void;
  focusAlarm: (id: string) => void;

  reservations: PlatformReservation[];
  selectedReservationId: string | null;
  showReservationPanel: boolean;
  loadReservations: (platformId?: string) => Promise<void>;
  checkTimeConflict: (platformId: string, startTime: string, endTime: string, excludeId?: string) => Promise<TimeConflictResult>;
  createReservation: (data: ReservationFormData) => Promise<PlatformReservation>;
  cancelReservation: (id: string, reason?: string) => Promise<void>;
  setSelectedReservationId: (id: string | null) => void;
  setShowReservationPanel: (show: boolean) => void;

  searchBatchKeyword: string;
  batchSearchResults: BatchSearchResult[];
  selectedBatchNo: string | null;
  batchTrace: CargoBatchTrace | null;
  highlightMode: HighlightMode;
  highlightSlotIds: string[];
  showTracePanel: boolean;
  searchBatch: (keyword: string) => Promise<void>;
  selectBatch: (batchNo: string | null) => void;
  loadBatchTrace: (batchNo: string) => Promise<void>;
  setHighlightMode: (mode: HighlightMode) => void;
  setHighlightSlotIds: (ids: string[]) => void;
  setShowTracePanel: (show: boolean) => void;
  locateBatch: (batchNo: string) => void;

  selectionBox: SelectionBox | null;
  selectionStats: SelectionStats | null;
  isSelecting: boolean;
  setSelectionBox: (box: SelectionBox | null) => void;
  setIsSelecting: (selecting: boolean) => void;
  calculateSelectionStats: () => void;

  parkName: string;
  exportScreenshot: () => Promise<string>;
  exportWithWatermark: (type: 'heatmap' | 'screenshot' | 'report') => Promise<string>;
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

  alarms: [],
  alarmStatistics: null,
  showAlarmPanel: false,
  activeAlarmId: null,
  alarmSoundEnabled: true,

  reservations: [],
  selectedReservationId: null,
  showReservationPanel: false,

  searchBatchKeyword: '',
  batchSearchResults: [],
  selectedBatchNo: null,
  batchTrace: null,
  highlightMode: 'none',
  highlightSlotIds: [],
  showTracePanel: false,

  selectionBox: null,
  selectionStats: null,
  isSelecting: false,

  parkName: '智慧物流园区',

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

  loadAlarms: async () => {
    set({ isLoading: true, error: null });
    try {
      const alarms = await alarmApi.getAlarms();
      set({ alarms, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  loadAlarmStatistics: async () => {
    try {
      const stats = await alarmApi.getAlarmStatistics();
      set({ alarmStatistics: stats });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  addAlarm: (alarm) => {
    set((state) => ({ alarms: [alarm, ...state.alarms] }));
    get().addOperationLog('告警', `新增告警: ${alarm.title}`);
  },

  acknowledgeAlarm: (id) => {
    set((state) => ({
      alarms: state.alarms.map((a) =>
        a.id === id
          ? { ...a, status: 'acknowledged' as const, acknowledgedBy: '系统管理员', acknowledgedAt: new Date().toISOString().slice(0, 19).replace('T', ' ') }
          : a
      ),
    }));
    get().addOperationLog('告警处理', `确认告警 ${id}`);
  },

  resolveAlarm: (id) => {
    set((state) => ({
      alarms: state.alarms.map((a) =>
        a.id === id
          ? { ...a, status: 'resolved' as const, resolvedAt: new Date().toISOString().slice(0, 19).replace('T', ' ') }
          : a
      ),
    }));
    get().addOperationLog('告警处理', `处理告警 ${id}`);
  },

  setShowAlarmPanel: (show) => set({ showAlarmPanel: show }),
  setActiveAlarmId: (id) => set({ activeAlarmId: id }),
  setAlarmSoundEnabled: (enabled) => set({ alarmSoundEnabled: enabled }),

  focusAlarm: (id) => {
    const alarm = get().alarms.find((a) => a.id === id);
    if (alarm) {
      set({ activeAlarmId: id, currentView: {
        id: `view-alarm-${id}`,
        name: `告警-${alarm.title}`,
        position: { x: alarm.position.x, y: 80, z: alarm.position.z + 60 },
        target: alarm.position,
      }});
      get().addOperationLog('告警定位', `定位到告警 ${alarm.title}`);
    }
  },

  loadReservations: async (platformId) => {
    set({ isLoading: true, error: null });
    try {
      const reservations = await reservationApi.getReservations(platformId);
      set({ reservations, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  checkTimeConflict: async (platformId, startTime, endTime, excludeId) => {
    return await reservationApi.checkTimeConflict(platformId, startTime, endTime, excludeId);
  },

  createReservation: async (data) => {
    const result = await reservationApi.createReservation(data);
    set((state) => ({ reservations: [result, ...state.reservations] }));
    get().addOperationLog('预约管理', `创建月台预约: ${data.vehiclePlate}`);
    return result;
  },

  cancelReservation: async (id, reason) => {
    await reservationApi.cancelReservation(id, reason);
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, status: 'cancelled' as const } : r
      ),
    }));
    get().addOperationLog('预约管理', `取消预约 ${id}`);
  },

  setSelectedReservationId: (id) => set({ selectedReservationId: id }),
  setShowReservationPanel: (show) => set({ showReservationPanel: show }),

  searchBatch: async (keyword) => {
    set({ searchBatchKeyword: keyword, isLoading: true, error: null });
    try {
      const results = await traceApi.searchBatch(keyword);
      set({ batchSearchResults: results, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  selectBatch: (batchNo) => {
    set({ selectedBatchNo: batchNo });
    if (batchNo) {
      get().loadBatchTrace(batchNo);
    } else {
      set({ batchTrace: null, highlightSlotIds: [] });
    }
  },

  loadBatchTrace: async (batchNo) => {
    set({ isLoading: true, error: null });
    try {
      const trace = await traceApi.getBatchTrace(batchNo);
      set({ batchTrace: trace, isLoading: false });
      if (trace.slotIds.length > 0) {
        set({ highlightSlotIds: trace.slotIds });
      }
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  setHighlightMode: (mode) => set({ highlightMode: mode }),
  setHighlightSlotIds: (ids) => set({ highlightSlotIds: ids }),
  setShowTracePanel: (show) => set({ showTracePanel: show }),

  locateBatch: (batchNo) => {
    const result = get().batchSearchResults.find((r) => r.batchNo === batchNo);
    if (result && result.slots.length > 0) {
      const firstSlot = result.slots[0];
      set({
        currentView: {
          id: `view-batch-${batchNo}`,
          name: `批次-${batchNo}`,
          position: { x: firstSlot.position.x, y: 60, z: firstSlot.position.z + 40 },
          target: { x: firstSlot.position.x, y: firstSlot.position.y, z: firstSlot.position.z },
        },
        highlightSlotIds: result.slots.map((s) => s.id),
      });
      if (!get().currentWarehouseId || get().currentWarehouseId !== result.warehouseId) {
        get().loadWarehouseSlots(result.warehouseId);
      }
      get().addOperationLog('批次追溯', `定位批次 ${batchNo}`);
    }
  },

  setSelectionBox: (box) => set({ selectionBox: box }),
  setIsSelecting: (selecting) => set({ isSelecting: selecting }),

  calculateSelectionStats: () => {
    const { selectionBox, cargoSlots, vehicles, warehouses } = get();
    if (!selectionBox) {
      set({ selectionStats: null });
      return;
    }

    const minX = Math.min(selectionBox.start.x, selectionBox.end.x);
    const maxX = Math.max(selectionBox.start.x, selectionBox.end.x);
    const minZ = Math.min(selectionBox.start.y, selectionBox.end.y);
    const maxZ = Math.max(selectionBox.start.y, selectionBox.end.y);

    const slotsInArea = cargoSlots.filter(
      (s) => s.position.x >= minX && s.position.x <= maxX && s.position.z >= minZ && s.position.z <= maxZ
    );
    const vehiclesInArea = vehicles.filter(
      (v) => v.position.x >= minX && v.position.x <= maxX && v.position.z >= minZ && v.position.z <= maxZ
    );

    const area = (maxX - minX) * (maxZ - minZ);
    const throughput = Math.floor(slotsInArea.filter((s) => s.status === 'occupied').length * 0.8);

    set({
      selectionStats: {
        slotCount: slotsInArea.length,
        occupiedSlots: slotsInArea.filter((s) => s.status === 'occupied').length,
        vehicleCount: vehiclesInArea.length,
        throughput,
        area,
      },
    });
  },

  exportScreenshot: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('screenshot_data_url');
      }, 500);
    });
  },

  exportWithWatermark: async (type) => {
    const timestamp = new Date().toLocaleString('zh-CN');
    const watermark = `${get().parkName} - ${timestamp}`;
    get().addOperationLog('导出', `导出${type === 'heatmap' ? '热力图' : type === 'screenshot' ? '场景截图' : '报表'}`);
    return Promise.resolve(watermark);
  },
}));
