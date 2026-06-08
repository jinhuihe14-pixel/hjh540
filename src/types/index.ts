export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Position2D {
  x: number;
  y: number;
}

export type LayerType = 'buildings' | 'roads' | 'warehouses' | 'vehicles' | 'platforms' | 'gates' | 'heatmap';

export type CargoStatus = 'empty' | 'occupied' | 'pending_out' | 'abnormal';

export type VehicleStatus = 'moving' | 'stopped' | 'loading' | 'unloading' | 'waiting' | 'violation';

export type VehicleType = 'truck' | 'forklift' | 'van' | 'container';

export type PlatformStatus = 'idle' | 'occupied' | 'reserved' | 'maintenance';

export type GateStatus = 'open' | 'closed' | 'busy';

export interface Building {
  id: string;
  name: string;
  type: 'office' | 'warehouse' | 'service' | 'other';
  position: Position3D;
  size: Position3D;
  floors: number;
  color: string;
}

export interface RoadSegment {
  id: string;
  name: string;
  type: 'main' | 'branch' | 'parking';
  start: Position2D;
  end: Position2D;
  width: number;
  lanes: number;
  congestionLevel: number;
}

export interface Warehouse {
  id: string;
  name: string;
  position: Position3D;
  size: Position3D;
  floors: number;
  shelvesPerFloor: number;
  slotsPerShelf: number;
  totalSlots: number;
  occupiedSlots: number;
}

export interface Shelf {
  id: string;
  warehouseId: string;
  floor: number;
  index: number;
  position: Position3D;
  size: Position3D;
  slotCount: number;
}

export interface CargoSlot {
  id: string;
  warehouseId: string;
  shelfId: string;
  floor: number;
  row: number;
  col: number;
  position: Position3D;
  size: Position3D;
  status: CargoStatus;
  cargoInfo?: CargoInfo;
}

export interface CargoInfo {
  id: string;
  name: string;
  type: string;
  batch: string;
  quantity: number;
  weight: number;
  inTime: string;
  expectedOutTime?: string;
  owner: string;
  supplier?: string;
  orderNo?: string;
  spec?: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: VehicleType;
  status: VehicleStatus;
  position: Position3D;
  rotation: number;
  speed: number;
  driver?: string;
  cargo?: string;
  currentTask?: string;
  trail: Position3D[];
}

export interface Platform {
  id: string;
  name: string;
  warehouseId: string;
  position: Position3D;
  size: Position3D;
  status: PlatformStatus;
  currentVehicleId?: string;
  currentTaskId?: string;
  reservedTasks: PlatformTask[];
  usageRate: number;
}

export interface PlatformTask {
  id: string;
  platformId: string;
  vehicleId: string;
  vehiclePlate: string;
  taskType: 'loading' | 'unloading';
  plannedStartTime: string;
  plannedEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  cargoType: string;
  cargoWeight: number;
}

export interface Gate {
  id: string;
  name: string;
  type: 'entrance' | 'exit' | 'both';
  position: Position3D;
  size: Position3D;
  status: GateStatus;
  todayTraffic: number;
  currentQueue: number;
}

export interface TrajectoryPoint {
  timestamp: number;
  position: Position3D;
  speed: number;
  status: VehicleStatus;
}

export interface PathPoint {
  position: Position3D;
  roadId?: string;
}

export interface HeatmapData {
  position: Position2D;
  value: number;
  radius: number;
}

export type HeatmapType = 'throughput' | 'traffic' | 'platform_usage';

export interface CameraView {
  id: string;
  name: string;
  position: Position3D;
  target: Position3D;
}

export interface OperationLog {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  user?: string;
}

export interface SelectionBox {
  start: Position2D;
  end: Position2D;
}

export interface SimulationConfig {
  vehicleCount: number;
  duration: number;
  speedMultiplier: number;
  peakHour: boolean;
}

export interface SimulationResult {
  avgSpeed: number;
  maxCongestion: number;
  totalThroughput: number;
  platformUtilization: number;
  hotspots: Position2D[];
}

export type TraceStepType = 'inbound' | 'storage' | 'sorting' | 'outbound' | 'abnormal';

export interface CargoTraceStep {
  id: string;
  type: TraceStepType;
  timestamp: string;
  location: string;
  position: Position3D;
  operator?: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
}

export interface CargoBatchTrace {
  batchNo: string;
  cargoName: string;
  supplier: string;
  orderNo: string;
  totalQuantity: number;
  totalWeight: number;
  inTime: string;
  expectedOutTime?: string;
  actualOutTime?: string;
  status: 'in_storage' | 'outbound' | 'abnormal';
  steps: CargoTraceStep[];
  slotIds: string[];
}

export type AlarmLevel = 'warning' | 'urgent';
export type AlarmType = 'cargo_overload' | 'vehicle_violation' | 'traffic_congestion' | 'gate_abnormal' | 'fire_alarm' | 'platform_conflict' | 'cargo_abnormal';

export interface Alarm {
  id: string;
  type: AlarmType;
  level: AlarmLevel;
  title: string;
  description: string;
  timestamp: string;
  position: Position3D;
  targetId: string;
  targetType: 'vehicle' | 'cargo' | 'platform' | 'gate' | 'road';
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface AlarmStatistics {
  total: number;
  urgent: number;
  warning: number;
  byType: Record<AlarmType, number>;
  byDate: { date: string; count: number }[];
}

export interface PlatformReservation {
  id: string;
  platformId: string;
  platformName: string;
  vehicleId: string;
  vehiclePlate: string;
  driverName: string;
  driverPhone?: string;
  taskType: 'loading' | 'unloading';
  cargoType: string;
  cargoWeight: number;
  plannedStartTime: string;
  plannedEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  createTime: string;
  remark?: string;
}

export interface ReservationFormData {
  platformId: string;
  vehiclePlate: string;
  driverName: string;
  driverPhone?: string;
  taskType: 'loading' | 'unloading';
  cargoType: string;
  cargoWeight: number;
  plannedStartTime: string;
  plannedEndTime: string;
  remark?: string;
}

export interface TimeConflictResult {
  hasConflict: boolean;
  conflictingReservations: PlatformReservation[];
}

export interface SelectionStats {
  slotCount: number;
  occupiedSlots: number;
  vehicleCount: number;
  throughput: number;
  area: number;
}

export interface ExportConfig {
  parkName: string;
  timestamp: string;
  type: 'heatmap' | 'screenshot' | 'report';
}

export type HighlightMode = 'row' | 'column' | 'shelf' | 'none';

export interface BatchSearchResult {
  batchNo: string;
  cargoName: string;
  warehouseId: string;
  warehouseName: string;
  slotCount: number;
  slots: CargoSlot[];
}
