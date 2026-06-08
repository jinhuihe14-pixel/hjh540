import type {
  Building,
  RoadSegment,
  Warehouse,
  CargoSlot,
  Vehicle,
  Platform,
  PlatformTask,
  Gate,
  HeatmapData,
  Position3D,
  HeatmapType,
  PathPoint,
  SimulationConfig,
  SimulationResult,
  Shelf,
  Alarm,
  AlarmStatistics,
  PlatformReservation,
  ReservationFormData,
  TimeConflictResult,
  CargoBatchTrace,
  BatchSearchResult,
} from '@/types';
import { api } from './request';
import * as mock from '@/mock/data';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const parkApi = {
  getBuildings: async (): Promise<Building[]> => {
    if (USE_MOCK) return mock.generateBuildings();
    return api.get<Building[]>('/park/buildings');
  },

  getRoads: async (): Promise<RoadSegment[]> => {
    if (USE_MOCK) return mock.generateRoads();
    return api.get<RoadSegment[]>('/park/roads');
  },

  getGates: async (): Promise<Gate[]> => {
    if (USE_MOCK) return mock.generateGates();
    return api.get<Gate[]>('/park/gates');
  },

  getOverview: async (): Promise<{
    totalVehicles: number;
    totalCargo: number;
    platformUsage: number;
    todayThroughput: number;
  }> => {
    if (USE_MOCK) {
      return {
        totalVehicles: 20,
        totalCargo: 1580,
        platformUsage: 65,
        todayThroughput: 638,
      };
    }
    return api.get('/park/overview');
  },
};

export const warehouseApi = {
  getWarehouses: async (): Promise<Warehouse[]> => {
    if (USE_MOCK) return mock.generateWarehouses();
    return api.get<Warehouse[]>('/warehouses');
  },

  getWarehouse: async (id: string): Promise<Warehouse> => {
    if (USE_MOCK) {
      const warehouses = mock.generateWarehouses();
      const wh = warehouses.find((w) => w.id === id);
      if (!wh) throw new Error('Warehouse not found');
      return wh;
    }
    return api.get<Warehouse>(`/warehouses/${id}`);
  },

  getShelves: async (warehouseId: string): Promise<Shelf[]> => {
    if (USE_MOCK) {
      const warehouses = mock.generateWarehouses();
      const wh = warehouses.find((w) => w.id === warehouseId);
      if (!wh) return [];
      return mock.generateShelves(wh);
    }
    return api.get<Shelf[]>(`/warehouses/${warehouseId}/shelves`);
  },

  getCargoSlots: async (warehouseId: string): Promise<CargoSlot[]> => {
    if (USE_MOCK) {
      const warehouses = mock.generateWarehouses();
      const wh = warehouses.find((w) => w.id === warehouseId);
      if (!wh) return [];
      return mock.generateCargoSlots(wh);
    }
    return api.get<CargoSlot[]>(`/warehouses/${warehouseId}/slots`);
  },

  getSlotDetail: async (slotId: string): Promise<CargoSlot> => {
    if (USE_MOCK) {
      const warehouses = mock.generateWarehouses();
      for (const wh of warehouses) {
        const slots = mock.generateCargoSlots(wh);
        const slot = slots.find((s) => s.id === slotId);
        if (slot) return slot;
      }
      throw new Error('Slot not found');
    }
    return api.get<CargoSlot>(`/warehouses/slots/${slotId}`);
  },

  searchCargo: async (keyword: string): Promise<CargoSlot[]> => {
    if (USE_MOCK) {
      const allSlots: CargoSlot[] = [];
      const warehouses = mock.generateWarehouses();
      for (const wh of warehouses) {
        const slots = mock.generateCargoSlots(wh);
        allSlots.push(...slots.filter((s) => s.cargoInfo?.name.includes(keyword) || s.cargoInfo?.batch.includes(keyword)));
      }
      return allSlots.slice(0, 20);
    }
    return api.get<CargoSlot[]>('/warehouses/cargo/search', { keyword });
  },
};

export const vehicleApi = {
  getVehicles: async (): Promise<Vehicle[]> => {
    if (USE_MOCK) return mock.generateVehicles();
    return api.get<Vehicle[]>('/vehicles');
  },

  getVehicle: async (id: string): Promise<Vehicle> => {
    if (USE_MOCK) {
      const vehicles = mock.generateVehicles();
      const v = vehicles.find((veh) => veh.id === id);
      if (!v) throw new Error('Vehicle not found');
      return v;
    }
    return api.get<Vehicle>(`/vehicles/${id}`);
  },

  getVehicleTrajectory: async (vehicleId: string, startTime?: string, endTime?: string): Promise<Position3D[]> => {
    if (USE_MOCK) {
      const vehicles = mock.generateVehicles();
      const v = vehicles.find((veh) => veh.id === vehicleId);
      return v?.trail || [];
    }
    return api.get<Position3D[]>(`/vehicles/${vehicleId}/trajectory`, { startTime, endTime });
  },

  getViolationVehicles: async (): Promise<Vehicle[]> => {
    if (USE_MOCK) {
      const vehicles = mock.generateVehicles();
      return vehicles.filter((v) => v.status === 'violation');
    }
    return api.get<Vehicle[]>('/vehicles/violations');
  },
};

export const platformApi = {
  getPlatforms: async (): Promise<Platform[]> => {
    if (USE_MOCK) {
      const warehouses = mock.generateWarehouses();
      return mock.generatePlatforms(warehouses);
    }
    return api.get<Platform[]>('/platforms');
  },

  getPlatform: async (id: string): Promise<Platform> => {
    if (USE_MOCK) {
      const warehouses = mock.generateWarehouses();
      const platforms = mock.generatePlatforms(warehouses);
      const p = platforms.find((plat) => plat.id === id);
      if (!p) throw new Error('Platform not found');
      return p;
    }
    return api.get<Platform>(`/platforms/${id}`);
  },

  getPlatformTasks: async (platformId: string): Promise<PlatformTask[]> => {
    if (USE_MOCK) return mock.generatePlatformTasks(platformId);
    return api.get<PlatformTask[]>(`/platforms/${platformId}/tasks`);
  },

  getRecommendedPlatform: async (vehicleId: string): Promise<{ platform: Platform; path: PathPoint[] }> => {
    if (USE_MOCK) {
      const warehouses = mock.generateWarehouses();
      const platforms = mock.generatePlatforms(warehouses);
      const idlePlatforms = platforms.filter((p) => p.status === 'idle');
      const platform = idlePlatforms[0] || platforms[0];
      const path = mock.generatePath({ x: 90, y: 0, z: 0 }, platform.position);
      return { platform, path };
    }
    return api.get(`/platforms/recommend`, { vehicleId });
  },

  assignPlatform: async (platformId: string, vehicleId: string, taskType: 'loading' | 'unloading'): Promise<PlatformTask> => {
    if (USE_MOCK) {
      return {
        id: `task-${Date.now()}`,
        platformId,
        vehicleId,
        vehiclePlate: '京A12345',
        taskType,
        plannedStartTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        plannedEndTime: new Date(Date.now() + 7200000).toISOString().slice(0, 19).replace('T', ' '),
        status: 'pending',
        cargoType: '通用货物',
        cargoWeight: 10,
      };
    }
    return api.post<PlatformTask>(`/platforms/${platformId}/assign`, { vehicleId, taskType });
  },
};

export const heatmapApi = {
  getHeatmapData: async (type: HeatmapType): Promise<HeatmapData[]> => {
    if (USE_MOCK) return mock.generateHeatmapData(type);
    return api.get<HeatmapData[]>('/heatmap', { type });
  },
};

export const pathApi = {
  planPath: async (start: Position3D, end: Position3D): Promise<PathPoint[]> => {
    if (USE_MOCK) return mock.generatePath(start, end);
    return api.post<PathPoint[]>('/path/plan', { start, end });
  },
};

export const simulationApi = {
  runSimulation: async (config: SimulationConfig): Promise<SimulationResult> => {
    if (USE_MOCK) return mock.runSimulation(config);
    return api.post<SimulationResult>('/simulation/run', config);
  },
};

export const alarmApi = {
  getAlarms: async (status?: string, type?: string, level?: string): Promise<Alarm[]> => {
    if (USE_MOCK) {
      let alarms = mock.generateAlarms();
      if (status) alarms = alarms.filter((a) => a.status === status);
      if (type) alarms = alarms.filter((a) => a.type === type);
      if (level) alarms = alarms.filter((a) => a.level === level);
      return alarms;
    }
    return api.get<Alarm[]>('/alarms', { status, type, level });
  },

  getAlarm: async (id: string): Promise<Alarm> => {
    if (USE_MOCK) {
      const alarms = mock.generateAlarms();
      const alarm = alarms.find((a) => a.id === id);
      if (!alarm) throw new Error('Alarm not found');
      return alarm;
    }
    return api.get<Alarm>(`/alarms/${id}`);
  },

  getAlarmStatistics: async (): Promise<AlarmStatistics> => {
    if (USE_MOCK) return mock.generateAlarmStatistics();
    return api.get<AlarmStatistics>('/alarms/statistics');
  },

  acknowledgeAlarm: async (id: string, operator: string): Promise<Alarm> => {
    if (USE_MOCK) {
      const alarms = mock.generateAlarms();
      const alarm = alarms.find((a) => a.id === id);
      if (!alarm) throw new Error('Alarm not found');
      return {
        ...alarm,
        status: 'acknowledged',
        acknowledgedBy: operator,
        acknowledgedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };
    }
    return api.post<Alarm>(`/alarms/${id}/acknowledge`, { operator });
  },

  resolveAlarm: async (id: string, operator: string, remark?: string): Promise<Alarm> => {
    if (USE_MOCK) {
      const alarms = mock.generateAlarms();
      const alarm = alarms.find((a) => a.id === id);
      if (!alarm) throw new Error('Alarm not found');
      return {
        ...alarm,
        status: 'resolved',
        resolvedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };
    }
    return api.post<Alarm>(`/alarms/${id}/resolve`, { operator, remark });
  },
};

export const reservationApi = {
  getReservations: async (platformId?: string, status?: string): Promise<PlatformReservation[]> => {
    if (USE_MOCK) {
      let reservations = mock.generateReservations(platformId);
      if (status) reservations = reservations.filter((r) => r.status === status);
      return reservations;
    }
    return api.get<PlatformReservation[]>('/reservations', { platformId, status });
  },

  getReservation: async (id: string): Promise<PlatformReservation> => {
    if (USE_MOCK) {
      const reservations = mock.generateReservations();
      const resv = reservations.find((r) => r.id === id);
      if (!resv) throw new Error('Reservation not found');
      return resv;
    }
    return api.get<PlatformReservation>(`/reservations/${id}`);
  },

  checkTimeConflict: async (
    platformId: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<TimeConflictResult> => {
    if (USE_MOCK) return mock.checkTimeConflict(platformId, startTime, endTime, excludeId);
    return api.get<TimeConflictResult>('/reservations/check-conflict', { platformId, startTime, endTime, excludeId });
  },

  createReservation: async (data: ReservationFormData): Promise<PlatformReservation> => {
    if (USE_MOCK) return mock.createReservation(data);
    return api.post<PlatformReservation>('/reservations', data);
  },

  cancelReservation: async (id: string, reason?: string): Promise<void> => {
    if (USE_MOCK) return;
    return api.post(`/reservations/${id}/cancel`, { reason });
  },
};

export const traceApi = {
  searchBatch: async (keyword: string): Promise<BatchSearchResult[]> => {
    if (USE_MOCK) return mock.searchBatch(keyword);
    return api.get<BatchSearchResult[]>('/trace/batch/search', { keyword });
  },

  getBatchTrace: async (batchNo: string): Promise<CargoBatchTrace> => {
    if (USE_MOCK) return mock.getBatchTrace(batchNo);
    return api.get<CargoBatchTrace>(`/trace/batch/${batchNo}`);
  },
};
