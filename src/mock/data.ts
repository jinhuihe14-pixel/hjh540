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
  CargoStatus,
  VehicleStatus,
  VehicleType,
  PlatformStatus,
  PathPoint,
  SimulationConfig,
  SimulationResult,
  Shelf,
} from '@/types';

function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1));
}

export function generateBuildings(): Building[] {
  return [
    {
      id: 'bld-office-1',
      name: '综合办公楼',
      type: 'office',
      position: { x: -80, y: 0, z: -60 },
      size: { x: 30, y: 25, z: 20 },
      floors: 8,
      color: '#4a90d9',
    },
    {
      id: 'bld-service-1',
      name: '服务区',
      type: 'service',
      position: { x: -80, y: 0, z: 20 },
      size: { x: 25, y: 8, z: 15 },
      floors: 2,
      color: '#6bcb77',
    },
  ];
}

export function generateRoads(): RoadSegment[] {
  return [
    { id: 'road-main-1', name: '园区主干道', type: 'main', start: { x: -100, y: 0 }, end: { x: 100, y: 0 }, width: 12, lanes: 4, congestionLevel: 0.3 },
    { id: 'road-main-2', name: '纵向主干道', type: 'main', start: { x: 0, y: -80 }, end: { x: 0, y: 80 }, width: 12, lanes: 4, congestionLevel: 0.5 },
    { id: 'road-branch-1', name: '仓库支路1', type: 'branch', start: { x: 20, y: 20 }, end: { x: 80, y: 20 }, width: 8, lanes: 2, congestionLevel: 0.2 },
    { id: 'road-branch-2', name: '仓库支路2', type: 'branch', start: { x: 20, y: 50 }, end: { x: 80, y: 50 }, width: 8, lanes: 2, congestionLevel: 0.4 },
    { id: 'road-branch-3', name: '西区支路', type: 'branch', start: { x: -40, y: -30 }, end: { x: -40, y: 40 }, width: 8, lanes: 2, congestionLevel: 0.1 },
    { id: 'road-parking-1', name: '停车场通道', type: 'parking', start: { x: -70, y: 40 }, end: { x: -70, y: 70 }, width: 6, lanes: 1, congestionLevel: 0.6 },
  ];
}

export function generateWarehouses(): Warehouse[] {
  return [
    {
      id: 'wh-1',
      name: '1号立体仓库',
      position: { x: 50, y: 0, z: 35 },
      size: { x: 40, y: 30, z: 25 },
      floors: 5,
      shelvesPerFloor: 8,
      slotsPerShelf: 20,
      totalSlots: 800,
      occupiedSlots: 620,
    },
    {
      id: 'wh-2',
      name: '2号立体仓库',
      position: { x: 50, y: 0, z: -35 },
      size: { x: 40, y: 30, z: 25 },
      floors: 5,
      shelvesPerFloor: 8,
      slotsPerShelf: 20,
      totalSlots: 800,
      occupiedSlots: 480,
    },
    {
      id: 'wh-3',
      name: '3号立体仓库',
      position: { x: 50, y: 0, z: 0 },
      size: { x: 40, y: 30, z: 20 },
      floors: 3,
      shelvesPerFloor: 6,
      slotsPerShelf: 16,
      totalSlots: 288,
      occupiedSlots: 210,
    },
  ];
}

export function generateShelves(warehouse: Warehouse): Shelf[] {
  const shelves: Shelf[] = [];
  const shelfWidth = (warehouse.size.x - 6) / warehouse.shelvesPerFloor;
  const shelfDepth = warehouse.size.z - 8;

  for (let floor = 0; floor < warehouse.floors; floor++) {
    for (let i = 0; i < warehouse.shelvesPerFloor; i++) {
      shelves.push({
        id: `shelf-${warehouse.id}-${floor}-${i}`,
        warehouseId: warehouse.id,
        floor,
        index: i,
        position: {
          x: warehouse.position.x - warehouse.size.x / 2 + 3 + shelfWidth * i + shelfWidth / 2,
          y: floor * 6 + 3,
          z: warehouse.position.z,
        },
        size: { x: shelfWidth * 0.8, y: 5.5, z: shelfDepth },
        slotCount: warehouse.slotsPerShelf,
      });
    }
  }

  return shelves;
}

export function generateCargoSlots(warehouse: Warehouse): CargoSlot[] {
  const slots: CargoSlot[] = [];
  const shelfWidth = (warehouse.size.x - 6) / warehouse.shelvesPerFloor;
  const shelfDepth = warehouse.size.z - 8;
  const slotWidth = shelfWidth * 0.7;
  const slotHeight = 1.2;
  const slotDepth = 1.5;

  for (let floor = 0; floor < warehouse.floors; floor++) {
    for (let shelfIdx = 0; shelfIdx < warehouse.shelvesPerFloor; shelfIdx++) {
      const shelfX = warehouse.position.x - warehouse.size.x / 2 + 3 + shelfWidth * shelfIdx + shelfWidth / 2;
      const rowsPerShelf = Math.floor(5.5 / slotHeight);
      const colsPerShelf = Math.floor(shelfDepth / slotDepth);

      for (let row = 0; row < rowsPerShelf; row++) {
        for (let col = 0; col < colsPerShelf; col++) {
          const rand = Math.random();
          let status: CargoStatus = 'empty';
          if (rand < 0.65) status = 'occupied';
          else if (rand < 0.75) status = 'pending_out';
          else if (rand < 0.78) status = 'abnormal';

          const slot: CargoSlot = {
            id: `slot-${warehouse.id}-${floor}-${shelfIdx}-${row}-${col}`,
            warehouseId: warehouse.id,
            shelfId: `shelf-${warehouse.id}-${floor}-${shelfIdx}`,
            floor,
            row,
            col,
            position: {
              x: shelfX - slotWidth / 2 + slotWidth / 2,
              y: floor * 6 + 0.5 + row * slotHeight,
              z: warehouse.position.z - shelfDepth / 2 + col * slotDepth + slotDepth / 2,
            },
            size: { x: slotWidth * 0.9, y: slotHeight * 0.8, z: slotDepth * 0.8 },
            status,
          };

          if (status === 'occupied' || status === 'pending_out' || status === 'abnormal') {
            slot.cargoInfo = {
              id: `cargo-${warehouse.id}-${floor}-${shelfIdx}-${row}-${col}`,
              name: ['电子产品', '服装', '食品', '机械配件', '化工原料'][randomInt(0, 4)],
              type: ['A类', 'B类', 'C类', '危险品'][randomInt(0, 3)],
              batch: `B${2024}${randomInt(1000, 9999)}`,
              quantity: randomInt(10, 500),
              weight: randomRange(0.5, 10),
              inTime: `2024-${randomInt(1, 12).toString().padStart(2, '0')}-${randomInt(1, 28).toString().padStart(2, '0')}`,
              expectedOutTime: status === 'pending_out' ? `2024-${randomInt(1, 12).toString().padStart(2, '0')}-${randomInt(1, 28).toString().padStart(2, '0')}` : undefined,
              owner: ['顺丰', '京东', '圆通', '中通', '韵达'][randomInt(0, 4)],
            };
          }

          slots.push(slot);
        }
      }
    }
  }

  return slots;
}

export function generateVehicles(): Vehicle[] {
  const vehicles: Vehicle[] = [];
  const types: VehicleType[] = ['truck', 'forklift', 'van', 'container'];
  const statuses: VehicleStatus[] = ['moving', 'stopped', 'loading', 'unloading', 'waiting', 'violation'];
  const plates = ['京A12345', '沪B67890', '粤C24680', '苏D13579', '浙E98765', '鲁F11223', '冀G33445', '豫H55667'];

  for (let i = 0; i < 20; i++) {
    const type = types[randomInt(0, types.length - 1)];
    const status = i < 2 ? 'violation' : statuses[randomInt(0, statuses.length - 2)];
    const angle = randomRange(0, Math.PI * 2);
    const radius = randomRange(20, 90);

    const trail: Position3D[] = [];
    const baseX = Math.cos(angle) * radius;
    const baseZ = Math.sin(angle) * radius;

    for (let j = 0; j < 10; j++) {
      const t = j / 10;
      trail.push({
        x: baseX + Math.cos(angle + t * 0.5) * 5 * t,
        y: 0,
        z: baseZ + Math.sin(angle + t * 0.5) * 5 * t,
      });
    }

    vehicles.push({
      id: `vehicle-${i}`,
      plateNumber: plates[i % plates.length] || `苏X${10000 + i}`,
      type,
      status,
      position: { x: baseX, y: 0, z: baseZ },
      rotation: angle,
      speed: status === 'moving' ? randomRange(5, 20) : 0,
      driver: ['张师傅', '李师傅', '王师傅', '赵师傅', '刘师傅'][randomInt(0, 4)],
      cargo: type !== 'forklift' ? ['电子产品', '服装', '食品'][randomInt(0, 2)] : undefined,
      currentTask: status === 'loading' || status === 'unloading' ? `任务-${randomInt(1000, 9999)}` : undefined,
      trail,
    });
  }

  return vehicles;
}

export function generatePlatforms(warehouses: Warehouse[]): Platform[] {
  const platforms: Platform[] = [];
  let platformIdx = 0;

  warehouses.forEach((warehouse) => {
    const platformCount = 4;
    const platformWidth = warehouse.size.z / platformCount;

    for (let i = 0; i < platformCount; i++) {
      const statusRand = Math.random();
      let status: PlatformStatus = 'idle';
      if (statusRand < 0.4) status = 'occupied';
      else if (statusRand < 0.6) status = 'reserved';

      const reservedTasks: PlatformTask[] = [];
      if (status === 'reserved') {
        reservedTasks.push({
          id: `task-${platformIdx}-1`,
          platformId: `platform-${platformIdx}`,
          vehicleId: `vehicle-${platformIdx + 10}`,
          vehiclePlate: `沪B${10000 + platformIdx}`,
          taskType: Math.random() > 0.5 ? 'loading' : 'unloading',
          plannedStartTime: '2024-06-07 14:00:00',
          plannedEndTime: '2024-06-07 16:00:00',
          status: 'pending',
          cargoType: ['电子产品', '服装', '食品'][randomInt(0, 2)],
          cargoWeight: randomRange(5, 25),
        });
      }

      platforms.push({
        id: `platform-${platformIdx}`,
        name: `${warehouse.name}-${i + 1}号月台`,
        warehouseId: warehouse.id,
        position: {
          x: warehouse.position.x + warehouse.size.x / 2 + 2,
          y: 0,
          z: warehouse.position.z - warehouse.size.z / 2 + platformWidth * i + platformWidth / 2,
        },
        size: { x: 6, y: 1.5, z: platformWidth * 0.8 },
        status,
        currentVehicleId: status === 'occupied' ? `vehicle-${platformIdx}` : undefined,
        currentTaskId: status === 'occupied' ? `task-${platformIdx}-0` : undefined,
        reservedTasks,
        usageRate: randomRange(30, 85),
      });

      platformIdx++;
    }
  });

  return platforms;
}

export function generateGates(): Gate[] {
  return [
    {
      id: 'gate-1',
      name: '东门（主入口）',
      type: 'both',
      position: { x: 95, y: 0, z: 0 },
      size: { x: 3, y: 6, z: 20 },
      status: 'open',
      todayTraffic: 256,
      currentQueue: 3,
    },
    {
      id: 'gate-2',
      name: '西门',
      type: 'both',
      position: { x: -95, y: 0, z: -20 },
      size: { x: 3, y: 6, z: 15 },
      status: 'open',
      todayTraffic: 128,
      currentQueue: 1,
    },
    {
      id: 'gate-3',
      name: '南门',
      type: 'entrance',
      position: { x: 0, y: 0, z: 75 },
      size: { x: 15, y: 6, z: 3 },
      status: 'busy',
      todayTraffic: 89,
      currentQueue: 5,
    },
    {
      id: 'gate-4',
      name: '北门',
      type: 'exit',
      position: { x: -30, y: 0, z: -75 },
      size: { x: 12, y: 6, z: 3 },
      status: 'open',
      todayTraffic: 167,
      currentQueue: 0,
    },
  ];
}

export function generateHeatmapData(type: 'throughput' | 'traffic' | 'platform_usage'): HeatmapData[] {
  const data: HeatmapData[] = [];

  if (type === 'throughput') {
    data.push({ position: { x: 50, y: 35 }, value: 0.9, radius: 25 });
    data.push({ position: { x: 50, y: -35 }, value: 0.7, radius: 25 });
    data.push({ position: { x: 50, y: 0 }, value: 0.6, radius: 20 });
  } else if (type === 'traffic') {
    for (let i = 0; i < 15; i++) {
      data.push({
        position: {
          x: randomRange(-80, 80),
          y: randomRange(-60, 60),
        },
        value: randomRange(0.2, 0.8),
        radius: randomRange(10, 25),
      });
    }
    data.push({ position: { x: 95, y: 0 }, value: 0.9, radius: 15 });
    data.push({ position: { x: 0, y: 75 }, value: 0.85, radius: 12 });
  } else {
    data.push({ position: { x: 70, y: 35 }, value: 0.95, radius: 20 });
    data.push({ position: { x: 70, y: -35 }, value: 0.7, radius: 20 });
    data.push({ position: { x: 70, y: 0 }, value: 0.6, radius: 15 });
  }

  return data;
}

export function generatePath(start: Position3D, end: Position3D): PathPoint[] {
  const path: PathPoint[] = [];
  const segments = 20;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    path.push({
      position: {
        x: start.x + (end.x - start.x) * t,
        y: 0.5,
        z: start.z + (end.z - start.z) * t,
      },
    });
  }

  return path;
}

export function runSimulation(): SimulationResult {
  return {
    avgSpeed: randomRange(10, 25),
    maxCongestion: randomRange(0.3, 0.9),
    totalThroughput: Math.floor(randomRange(200, 800)),
    platformUtilization: randomRange(40, 90),
    hotspots: Array.from({ length: 5 }, () => ({
      x: randomRange(-80, 80),
      y: randomRange(-60, 60),
    })),
  };
}

export function generatePlatformTasks(platformId: string): PlatformTask[] {
  const tasks: PlatformTask[] = [];
  const now = new Date();

  for (let i = 0; i < 3; i++) {
    const startTime = new Date(now.getTime() + i * 7200000);
    const endTime = new Date(startTime.getTime() + 3600000 + randomRange(0, 3600000));

    tasks.push({
      id: `task-${platformId}-${i}`,
      platformId,
      vehicleId: `vehicle-${i + 10}`,
      vehiclePlate: `京A${20000 + i}`,
      taskType: i % 2 === 0 ? 'unloading' : 'loading',
      plannedStartTime: startTime.toISOString().slice(0, 19).replace('T', ' '),
      plannedEndTime: endTime.toISOString().slice(0, 19).replace('T', ' '),
      status: i === 0 ? 'in_progress' : 'pending',
      cargoType: ['电子产品', '服装', '食品'][i % 3],
      cargoWeight: randomRange(5, 30),
    });
  }

  return tasks;
}

import type {
  Alarm,
  AlarmType,
  AlarmLevel,
  AlarmStatistics,
  PlatformReservation,
  ReservationFormData,
  TimeConflictResult,
  CargoBatchTrace,
  CargoTraceStep,
  BatchSearchResult,
} from '@/types';

const alarmTypes: { type: AlarmType; title: string; level: AlarmLevel }[] = [
  { type: 'cargo_overload', title: '仓储超限预警', level: 'warning' },
  { type: 'vehicle_violation', title: '车辆违停告警', level: 'warning' },
  { type: 'traffic_congestion', title: '道路拥堵预警', level: 'warning' },
  { type: 'gate_abnormal', title: '门禁异常告警', level: 'urgent' },
  { type: 'fire_alarm', title: '消防预警', level: 'urgent' },
  { type: 'platform_conflict', title: '月台预约冲突', level: 'warning' },
  { type: 'cargo_abnormal', title: '货物异常滞留', level: 'warning' },
];

export function generateAlarms(): Alarm[] {
  const alarms: Alarm[] = [];
  const now = new Date();

  for (let i = 0; i < 15; i++) {
    const typeInfo = alarmTypes[randomInt(0, alarmTypes.length - 1)];
    const timestamp = new Date(now.getTime() - randomInt(0, 86400000 * 3));
    const statusRand = Math.random();
    let status: Alarm['status'] = 'active';
    if (statusRand > 0.7) status = 'resolved';
    else if (statusRand > 0.4) status = 'acknowledged';

    const positions: Record<string, Position3D> = {
      vehicle_violation: { x: randomRange(-80, 80), y: 0, z: randomRange(-50, 50) },
      cargo_overload: { x: 50, y: randomRange(5, 25), z: randomRange(-30, 30) },
      traffic_congestion: { x: randomRange(-60, 60), y: 0, z: 0 },
      gate_abnormal: { x: randomInt(0, 1) === 0 ? 95 : -95, y: 0, z: randomRange(-20, 20) },
      fire_alarm: { x: randomRange(-60, 60), y: 5, z: randomRange(-40, 40) },
      platform_conflict: { x: 70, y: 0, z: randomRange(-30, 30) },
      cargo_abnormal: { x: 50, y: randomRange(5, 20), z: randomRange(-20, 20) },
    };

    const targetTypes: Record<AlarmType, Alarm['targetType']> = {
      vehicle_violation: 'vehicle',
      cargo_overload: 'cargo',
      traffic_congestion: 'road',
      gate_abnormal: 'gate',
      fire_alarm: 'cargo',
      platform_conflict: 'platform',
      cargo_abnormal: 'cargo',
    };

    alarms.push({
      id: `alarm-${1000 + i}`,
      type: typeInfo.type,
      level: typeInfo.level,
      title: typeInfo.title,
      description: `${typeInfo.title}，请及时处理。详细信息：${['区域A', '区域B', '1号仓', '2号仓', '东门', '西门'][randomInt(0, 5)]}`,
      timestamp: timestamp.toISOString().slice(0, 19).replace('T', ' '),
      position: positions[typeInfo.type],
      targetId: `target-${i}`,
      targetType: targetTypes[typeInfo.type],
      status,
      acknowledgedBy: status !== 'active' ? '调度员张工' : undefined,
      acknowledgedAt: status !== 'active' ? new Date(timestamp.getTime() + randomInt(60000, 3600000)).toISOString().slice(0, 19).replace('T', ' ') : undefined,
      resolvedAt: status === 'resolved' ? new Date(timestamp.getTime() + randomInt(3600000, 7200000)).toISOString().slice(0, 19).replace('T', ' ') : undefined,
    });
  }

  return alarms.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function generateAlarmStatistics(): AlarmStatistics {
  const alarms = generateAlarms();
  const byDate: { date: string; count: number }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 86400000);
    byDate.push({
      date: date.toISOString().slice(0, 10),
      count: randomInt(5, 20),
    });
  }

  const byType: Record<AlarmType, number> = {
    cargo_overload: randomInt(2, 8),
    vehicle_violation: randomInt(3, 10),
    traffic_congestion: randomInt(2, 6),
    gate_abnormal: randomInt(1, 4),
    fire_alarm: randomInt(0, 2),
    platform_conflict: randomInt(1, 5),
    cargo_abnormal: randomInt(2, 7),
  };

  const urgent = alarms.filter((a) => a.level === 'urgent' && a.status === 'active').length;
  const warning = alarms.filter((a) => a.level === 'warning' && a.status === 'active').length;

  return {
    total: alarms.length,
    urgent,
    warning,
    byType,
    byDate,
  };
}

export function generateReservations(platformId?: string): PlatformReservation[] {
  const warehouses = generateWarehouses();
  const platforms = generatePlatforms(warehouses);
  const targetPlatforms = platformId ? platforms.filter((p) => p.id === platformId) : platforms;
  const reservations: PlatformReservation[] = [];
  const now = new Date();

  const statuses: PlatformReservation['status'][] = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
  const drivers = ['张师傅', '李师傅', '王师傅', '赵师傅', '刘师傅', '陈师傅'];

  for (let i = 0; i < 20; i++) {
    const platform = targetPlatforms[i % targetPlatforms.length];
    const startOffset = randomInt(-2, 48);
    const startTime = new Date(now.getTime() + startOffset * 3600000);
    const duration = randomInt(1, 4);
    const endTime = new Date(startTime.getTime() + duration * 3600000);
    const statusIndex = startOffset < 0 ? randomInt(3, 4) : startOffset === 0 ? randomInt(1, 2) : randomInt(0, 1);

    reservations.push({
      id: `resv-${2024000 + i}`,
      platformId: platform.id,
      platformName: platform.name,
      vehicleId: `vehicle-${i + 5}`,
      vehiclePlate: ['京A', '沪B', '粤C', '苏D', '浙E', '鲁F'][randomInt(0, 5)] + randomInt(10000, 99999),
      driverName: drivers[randomInt(0, drivers.length - 1)],
      driverPhone: `138${randomInt(10000000, 99999999)}`,
      taskType: Math.random() > 0.5 ? 'loading' : 'unloading',
      cargoType: ['电子产品', '服装', '食品', '机械配件', '化工原料'][randomInt(0, 4)],
      cargoWeight: randomRange(5, 30),
      plannedStartTime: startTime.toISOString().slice(0, 19).replace('T', ' '),
      plannedEndTime: endTime.toISOString().slice(0, 19).replace('T', ' '),
      actualStartTime: statusIndex >= 2 ? startTime.toISOString().slice(0, 19).replace('T', ' ') : undefined,
      actualEndTime: statusIndex >= 3 ? endTime.toISOString().slice(0, 19).replace('T', ' ') : undefined,
      status: statuses[Math.min(statusIndex, statuses.length - 1)],
      createTime: new Date(now.getTime() - randomInt(3600000, 86400000)).toISOString().slice(0, 19).replace('T', ' '),
      remark: Math.random() > 0.7 ? '请优先安排装卸' : undefined,
    });
  }

  return reservations.sort((a, b) => new Date(a.plannedStartTime).getTime() - new Date(b.plannedStartTime).getTime());
}

export function checkTimeConflict(
  platformId: string,
  startTime: string,
  endTime: string,
  excludeId?: string
): TimeConflictResult {
  const reservations = generateReservations(platformId);
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  const conflictingReservations = reservations.filter((r) => {
    if (excludeId && r.id === excludeId) return false;
    if (r.status === 'cancelled' || r.status === 'completed') return false;
    const rStart = new Date(r.plannedStartTime).getTime();
    const rEnd = new Date(r.plannedEndTime).getTime();
    return start < rEnd && end > rStart;
  });

  return {
    hasConflict: conflictingReservations.length > 0,
    conflictingReservations,
  };
}

export function createReservation(data: ReservationFormData): PlatformReservation {
  const warehouses = generateWarehouses();
  const platforms = generatePlatforms(warehouses);
  const platform = platforms.find((p) => p.id === data.platformId) || platforms[0];

  return {
    id: `resv-${Date.now()}`,
    platformId: data.platformId,
    platformName: platform.name,
    vehicleId: `vehicle-${randomInt(100, 999)}`,
    vehiclePlate: data.vehiclePlate,
    driverName: data.driverName,
    driverPhone: data.driverPhone,
    taskType: data.taskType,
    cargoType: data.cargoType,
    cargoWeight: data.cargoWeight,
    plannedStartTime: data.plannedStartTime,
    plannedEndTime: data.plannedEndTime,
    status: 'pending',
    createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    remark: data.remark,
  };
}

export function searchBatch(keyword: string): BatchSearchResult[] {
  const warehouses = generateWarehouses();
  const results: BatchSearchResult[] = [];

  warehouses.forEach((warehouse) => {
    const slots = generateCargoSlots(warehouse);
    const occupiedSlots = slots.filter(
      (s) => s.cargoInfo && (s.cargoInfo.batch.includes(keyword) || s.cargoInfo.name.includes(keyword))
    );

    if (occupiedSlots.length > 0) {
      const batchMap = new Map<string, CargoSlot[]>();
      occupiedSlots.forEach((slot) => {
        const batch = slot.cargoInfo!.batch;
        if (!batchMap.has(batch)) {
          batchMap.set(batch, []);
        }
        batchMap.get(batch)!.push(slot);
      });

      batchMap.forEach((batchSlots, batchNo) => {
        if (results.length < 10) {
          results.push({
            batchNo,
            cargoName: batchSlots[0].cargoInfo!.name,
            warehouseId: warehouse.id,
            warehouseName: warehouse.name,
            slotCount: batchSlots.length,
            slots: batchSlots.slice(0, 20),
          });
        }
      });
    }
  });

  return results.slice(0, 10);
}

export function getBatchTrace(batchNo: string): CargoBatchTrace {
  const warehouses = generateWarehouses();
  let foundWarehouse: Warehouse | null = null;
  let batchSlots: CargoSlot[] = [];

  for (const wh of warehouses) {
    const slots = generateCargoSlots(wh);
    const matchingSlots = slots.filter((s) => s.cargoInfo?.batch === batchNo);
    if (matchingSlots.length > 0) {
      foundWarehouse = wh;
      batchSlots = matchingSlots;
      break;
    }
  }

  const wh = foundWarehouse || warehouses[0];
  const allSlots = foundWarehouse ? generateCargoSlots(foundWarehouse) : generateCargoSlots(warehouses[0]);
  const firstSlot = batchSlots[0] || allSlots.find((s) => s.cargoInfo) || allSlots[0];
  const cargoInfo = firstSlot.cargoInfo || {
    id: 'cargo-demo',
    name: '电子产品',
    type: 'A类',
    batch: batchNo,
    quantity: 100,
    weight: 5,
    inTime: '2024-01-15',
    owner: '顺丰',
  };

  const now = new Date();
  const steps: CargoTraceStep[] = [
    {
      id: 'step-1',
      type: 'inbound',
      timestamp: new Date(now.getTime() - 86400000 * 5).toISOString().slice(0, 19).replace('T', ' '),
      location: '东门-入库验收区',
      position: { x: 90, y: 0, z: 0 },
      operator: '入库员王强',
      description: '货物到达园区，完成验收登记',
      status: 'completed',
    },
    {
      id: 'step-2',
      type: 'storage',
      timestamp: new Date(now.getTime() - 86400000 * 5 + 3600000 * 2).toISOString().slice(0, 19).replace('T', ' '),
      location: `${wh.name}-1层货架`,
      position: firstSlot.position,
      operator: '叉车工李明',
      description: '货物上架存储，分配货位',
      status: 'completed',
    },
    {
      id: 'step-3',
      type: 'sorting',
      timestamp: new Date(now.getTime() - 86400000 * 2).toISOString().slice(0, 19).replace('T', ' '),
      location: '分拣中心B区',
      position: { x: 30, y: 0, z: 50 },
      operator: '分拣员张芳',
      description: '按订单进行分拣打包',
      status: batchSlots.some((s) => s.status === 'pending_out') ? 'in_progress' : 'completed',
    },
    {
      id: 'step-4',
      type: 'outbound',
      timestamp: new Date(now.getTime() + 86400000).toISOString().slice(0, 19).replace('T', ' '),
      location: '2号月台',
      position: { x: 70, y: 0, z: -20 },
      operator: '出库员赵伟',
      description: '装车出库，发往目的地',
      status: batchSlots.some((s) => s.status === 'pending_out') ? 'pending' : 'completed',
    },
  ];

  if (batchSlots.some((s) => s.status === 'abnormal')) {
    steps.push({
      id: 'step-abnormal',
      type: 'abnormal',
      timestamp: new Date(now.getTime() - 86400000).toISOString().slice(0, 19).replace('T', ' '),
      location: `${wh.name}-异常品区`,
      position: { x: 55, y: 3, z: 25 },
      operator: '质检员陈静',
      description: '发现质量异常，待处理',
      status: 'in_progress',
    });
  }

  return {
    batchNo,
    cargoName: cargoInfo.name,
    supplier: ['深圳华为', '杭州阿里', '北京京东', '上海圆通'][randomInt(0, 3)],
    orderNo: `ORD${2024}${randomInt(100000, 999999)}`,
    totalQuantity: batchSlots.reduce((sum, s) => sum + (s.cargoInfo?.quantity || 0), 0) || cargoInfo.quantity * 10,
    totalWeight: batchSlots.reduce((sum, s) => sum + (s.cargoInfo?.weight || 0), 0) || cargoInfo.weight * 10,
    inTime: cargoInfo.inTime,
    expectedOutTime: cargoInfo.expectedOutTime,
    actualOutTime: batchSlots.every((s) => s.status === 'empty') ? new Date().toISOString().slice(0, 10) : undefined,
    status: batchSlots.some((s) => s.status === 'abnormal') ? 'abnormal' : batchSlots.some((s) => s.status === 'occupied' || s.status === 'pending_out') ? 'in_storage' : 'outbound',
    steps,
    slotIds: batchSlots.map((s) => s.id),
  };
}
