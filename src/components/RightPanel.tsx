import { useState, useEffect } from 'react';
import { X, Truck, Warehouse as WarehouseIcon, PanelLeftClose, Package, AlertTriangle, User, Hash } from 'lucide-react';
import { useParkStore } from '@/store/parkStore';
import { Tag, Progress, Table, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Vehicle, Platform, Warehouse, CargoSlot, PlatformTask } from '@/types';
import { platformApi } from '@/api';

const vehicleStatusMap: Record<string, { label: string; color: string }> = {
  moving: { label: '行驶中', color: 'green' },
  stopped: { label: '停止', color: 'orange' },
  loading: { label: '装货中', color: 'blue' },
  unloading: { label: '卸货中', color: 'purple' },
  waiting: { label: '等待中', color: 'orange' },
  violation: { label: '违停', color: 'red' },
};

const platformStatusMap: Record<string, { label: string; color: string }> = {
  idle: { label: '空闲', color: 'green' },
  occupied: { label: '占用中', color: 'red' },
  reserved: { label: '已预约', color: 'orange' },
  maintenance: { label: '维护中', color: 'default' },
};

const cargoStatusMap: Record<string, { label: string; color: string }> = {
  empty: { label: '空货位', color: 'default' },
  occupied: { label: '已占用', color: 'blue' },
  pending_out: { label: '待出库', color: 'orange' },
  abnormal: { label: '异常滞留', color: 'red' },
};

function VehicleDetail({ vehicle }: { vehicle: Vehicle }) {
  const status = vehicleStatusMap[vehicle.status] || { label: vehicle.status, color: 'default' };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck size={20} className="text-blue-400" />
          <span className="text-white font-bold text-lg">{vehicle.plateNumber}</span>
        </div>
        <Tag color={status.color}>{status.label}</Tag>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-slate-800/50 p-2 rounded">
          <div className="text-gray-400 text-xs">车辆类型</div>
          <div className="text-white">
            {vehicle.type === 'truck' && '货运卡车'}
            {vehicle.type === 'forklift' && '叉车'}
            {vehicle.type === 'van' && '厢式货车'}
            {vehicle.type === 'container' && '集装箱车'}
          </div>
        </div>
        <div className="bg-slate-800/50 p-2 rounded">
          <div className="text-gray-400 text-xs">行驶速度</div>
          <div className="text-white">{vehicle.speed.toFixed(1)} km/h</div>
        </div>
        <div className="bg-slate-800/50 p-2 rounded">
          <div className="text-gray-400 text-xs">驾驶员</div>
          <div className="text-white flex items-center gap-1">
            <User size={12} />
            {vehicle.driver || '未知'}
          </div>
        </div>
        <div className="bg-slate-800/50 p-2 rounded">
          <div className="text-gray-400 text-xs">当前任务</div>
          <div className="text-white flex items-center gap-1">
            <Hash size={12} />
            {vehicle.currentTask || '无'}
          </div>
        </div>
      </div>

      {vehicle.cargo && (
        <div className="bg-slate-800/50 p-3 rounded">
          <div className="text-gray-400 text-xs mb-1">货物信息</div>
          <div className="text-white flex items-center gap-2">
            <Package size={14} className="text-green-400" />
            {vehicle.cargo}
          </div>
        </div>
      )}

      {vehicle.status === 'violation' && (
        <div className="bg-red-900/30 border border-red-500/50 p-3 rounded flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-400" />
          <div>
            <div className="text-red-400 font-medium text-sm">违停预警</div>
            <div className="text-red-300/70 text-xs">该车辆停放在非指定区域</div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button size="small" type="primary" block>
          查看轨迹
        </Button>
        <Button size="small" block>
          调度指令
        </Button>
      </div>
    </div>
  );
}

function WarehouseDetail({ warehouse }: { warehouse: Warehouse }) {
  const occupancyRate = (warehouse.occupiedSlots / warehouse.totalSlots) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <WarehouseIcon size={20} className="text-blue-400" />
        <span className="text-white font-bold text-lg">{warehouse.name}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-slate-800/50 p-2 rounded">
          <div className="text-gray-400 text-xs">楼层数</div>
          <div className="text-white">{warehouse.floors} 层</div>
        </div>
        <div className="bg-slate-800/50 p-2 rounded">
          <div className="text-gray-400 text-xs">每层货架</div>
          <div className="text-white">{warehouse.shelvesPerFloor} 组</div>
        </div>
        <div className="bg-slate-800/50 p-2 rounded">
          <div className="text-gray-400 text-xs">总货位数</div>
          <div className="text-white">{warehouse.totalSlots}</div>
        </div>
        <div className="bg-slate-800/50 p-2 rounded">
          <div className="text-gray-400 text-xs">已占用</div>
          <div className="text-white">{warehouse.occupiedSlots}</div>
        </div>
      </div>

      <div className="bg-slate-800/50 p-3 rounded">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">库位利用率</span>
          <span className="text-white">{occupancyRate.toFixed(1)}%</span>
        </div>
        <Progress
          percent={Math.round(occupancyRate)}
          strokeColor={occupancyRate > 80 ? '#ef4444' : occupancyRate > 60 ? '#f59e0b' : '#22c55e'}
          showInfo={false}
          size="small"
        />
      </div>

      <div className="flex gap-2">
        <Button size="small" type="primary" block>
          进入仓库
        </Button>
        <Button size="small" block>
          库存统计
        </Button>
      </div>
    </div>
  );
}

function PlatformDetail({ platform }: { platform: Platform }) {
  const [tasks, setTasks] = useState<PlatformTask[]>([]);
  const status = platformStatusMap[platform.status] || { label: platform.status, color: 'default' };

  useEffect(() => {
    platformApi.getPlatformTasks(platform.id).then(setTasks);
  }, [platform.id]);

  const columns: ColumnsType<PlatformTask> = [
    {
      title: '车牌号',
      dataIndex: 'vehiclePlate',
      key: 'vehiclePlate',
      render: (text) => <span className="text-xs">{text}</span>,
    },
    {
      title: '类型',
      dataIndex: 'taskType',
      key: 'taskType',
      render: (type) => (
        <Tag color={type === 'loading' ? 'blue' : 'green'}>
          {type === 'loading' ? '装货' : '卸货'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s) => {
        const colors: Record<string, string> = {
          pending: 'orange',
          in_progress: 'blue',
          completed: 'green',
          cancelled: 'default',
        };
        const labels: Record<string, string> = {
          pending: '待执行',
          in_progress: '进行中',
          completed: '已完成',
          cancelled: '已取消',
        };
        return <Tag color={colors[s] || 'default'}>{labels[s] || s}</Tag>;
      },
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PanelLeftClose size={20} className="text-green-400" />
          <span className="text-white font-bold">{platform.name}</span>
        </div>
        <Tag color={status.color}>{status.label}</Tag>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-slate-800/50 p-2 rounded">
          <div className="text-gray-400 text-xs">使用率</div>
          <div className="text-white">{platform.usageRate.toFixed(1)}%</div>
        </div>
        <div className="bg-slate-800/50 p-2 rounded">
          <div className="text-gray-400 text-xs">预约任务</div>
          <div className="text-white">{platform.reservedTasks.length} 个</div>
        </div>
      </div>

      <div className="bg-slate-800/50 p-2 rounded">
        <div className="text-gray-400 text-xs mb-2">作业任务</div>
        <Table
          size="small"
          columns={columns}
          dataSource={tasks}
          pagination={false}
          rowKey="id"
        />
      </div>

      <div className="flex gap-2">
        <Button size="small" type="primary" block>
          分配车辆
        </Button>
        <Button size="small" block>
          预约管理
        </Button>
      </div>
    </div>
  );
}

function SlotDetail({ slot }: { slot: CargoSlot }) {
  const status = cargoStatusMap[slot.status] || { label: slot.status, color: 'default' };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package size={20} className="text-yellow-400" />
          <span className="text-white font-bold">货位详情</span>
        </div>
        <Tag color={status.color}>{status.label}</Tag>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-slate-800/50 p-2 rounded">
          <div className="text-gray-400 text-xs">楼层</div>
          <div className="text-white">第 {slot.floor + 1} 层</div>
        </div>
        <div className="bg-slate-800/50 p-2 rounded">
          <div className="text-gray-400 text-xs">货架</div>
          <div className="text-white">{slot.row + 1} 排 {slot.col + 1} 列</div>
        </div>
      </div>

      {slot.cargoInfo && (
        <div className="bg-slate-800/50 p-3 rounded space-y-2">
          <div className="text-gray-400 text-xs">货物信息</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">名称</span>
              <span className="text-white">{slot.cargoInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">批次</span>
              <span className="text-white">{slot.cargoInfo.batch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">类型</span>
              <span className="text-white">{slot.cargoInfo.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">数量</span>
              <span className="text-white">{slot.cargoInfo.quantity} 件</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">重量</span>
              <span className="text-white">{slot.cargoInfo.weight.toFixed(2)} 吨</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">入库时间</span>
              <span className="text-white">{slot.cargoInfo.inTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">货主</span>
              <span className="text-white">{slot.cargoInfo.owner}</span>
            </div>
          </div>
        </div>
      )}

      {slot.status === 'abnormal' && (
        <div className="bg-red-900/30 border border-red-500/50 p-3 rounded flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-400" />
          <div>
            <div className="text-red-400 font-medium text-sm">异常滞留</div>
            <div className="text-red-300/70 text-xs">货物滞留时间超过预期</div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button size="small" type="primary" block>
          出库操作
        </Button>
        <Button size="small" block>
          移库
        </Button>
      </div>
    </div>
  );
}

export function RightPanel() {
  const selectedVehicleId = useParkStore((state) => state.selectedVehicleId);
  const selectedWarehouseId = useParkStore((state) => state.selectedWarehouseId);
  const selectedPlatformId = useParkStore((state) => state.selectedPlatformId);
  const selectedSlotId = useParkStore((state) => state.selectedSlotId);

  const vehicles = useParkStore((state) => state.vehicles);
  const warehouses = useParkStore((state) => state.warehouses);
  const platforms = useParkStore((state) => state.platforms);
  const cargoSlots = useParkStore((state) => state.cargoSlots);

  const selectVehicle = useParkStore((state) => state.selectVehicle);
  const selectWarehouse = useParkStore((state) => state.selectWarehouse);
  const selectPlatform = useParkStore((state) => state.selectPlatform);
  const selectSlot = useParkStore((state) => state.selectSlot);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedWarehouse = warehouses.find((w) => w.id === selectedWarehouseId);
  const selectedPlatform = platforms.find((p) => p.id === selectedPlatformId);
  const selectedSlot = cargoSlots.find((s) => s.id === selectedSlotId);

  const hasContent = selectedVehicle || selectedWarehouse || selectedPlatform || selectedSlot;

  if (!hasContent) return null;

  const handleClose = () => {
    selectVehicle(null);
    selectWarehouse(null);
    selectPlatform(null);
    selectSlot(null);
  };

  return (
    <div className="absolute right-4 top-4 bottom-4 w-80 bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-2xl border border-slate-700/50 z-10 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-slate-700/50 flex items-center justify-between">
        <h3 className="text-white font-bold">详情信息</h3>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-700/50"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {selectedVehicle && <VehicleDetail vehicle={selectedVehicle} />}
        {selectedWarehouse && !selectedSlot && <WarehouseDetail warehouse={selectedWarehouse} />}
        {selectedPlatform && <PlatformDetail platform={selectedPlatform} />}
        {selectedSlot && <SlotDetail slot={selectedSlot} />}
      </div>
    </div>
  );
}
