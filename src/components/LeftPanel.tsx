import { useState, useMemo } from 'react';
import {
  Building2,
  Route,
  Warehouse,
  Truck,
  PanelLeftClose,
  MapPin,
  Thermometer,
  Eye,
  EyeOff,
  Camera,
  Play,
  Layers,
  Search,
  Package,
  AlertTriangle,
  Bell,
  Calendar,
  BoxSelect,
  Download,
  BookmarkPlus,
} from 'lucide-react';
import { useParkStore } from '@/store/parkStore';
import type { LayerType, HeatmapType, VehicleStatus, VehicleType } from '@/types';
import { Button, Input, Select, Tag } from 'antd';
import { pathApi } from '@/api';
import { getCurrentCameraView } from '@/three/ParkScene';
import { message } from 'antd';

const layerConfig: { type: LayerType; label: string; icon: React.ReactNode }[] = [
  { type: 'buildings', label: '建筑', icon: <Building2 size={18} /> },
  { type: 'roads', label: '道路', icon: <Route size={18} /> },
  { type: 'warehouses', label: '仓库', icon: <Warehouse size={18} /> },
  { type: 'platforms', label: '月台', icon: <PanelLeftClose size={18} /> },
  { type: 'vehicles', label: '车辆', icon: <Truck size={18} /> },
  { type: 'gates', label: '卡口', icon: <MapPin size={18} /> },
  { type: 'heatmap', label: '热力图', icon: <Thermometer size={18} /> },
];

const heatmapOptions: { value: HeatmapType; label: string }[] = [
  { value: 'traffic', label: '车流密度' },
  { value: 'throughput', label: '货物吞吐量' },
  { value: 'platform_usage', label: '月台使用率' },
];

const statusColors: Record<string, string> = {
  moving: 'green',
  stopped: 'orange',
  loading: 'blue',
  unloading: 'purple',
  waiting: 'orange',
  violation: 'red',
};

const statusLabels: Record<string, string> = {
  moving: '行驶中',
  stopped: '停止',
  loading: '装货中',
  unloading: '卸货中',
  waiting: '等待中',
  violation: '违停',
};

type TabType = 'layers' | 'vehicles' | 'warehouses' | 'views' | 'path';

export function LeftPanel() {
  const layers = useParkStore((state) => state.layers);
  const toggleLayer = useParkStore((state) => state.toggleLayer);
  const heatmapType = useParkStore((state) => state.heatmapType);
  const setHeatmapType = useParkStore((state) => state.setHeatmapType);
  const showHeatmap = useParkStore((state) => state.showHeatmap);
  const setShowHeatmap = useParkStore((state) => state.setShowHeatmap);
  const cameraViews = useParkStore((state) => state.cameraViews);
  const setCurrentView = useParkStore((state) => state.setCurrentView);
  const addCameraView = useParkStore((state) => state.addCameraView);
  const setPathStart = useParkStore((state) => state.setPathStart);
  const setPathEnd = useParkStore((state) => state.setPathEnd);
  const setPlannedPath = useParkStore((state) => state.setPlannedPath);
  const pathStart = useParkStore((state) => state.pathStart);
  const pathEnd = useParkStore((state) => state.pathEnd);
  const setShowTracePanel = useParkStore((state) => state.setShowTracePanel);
  const setShowAlarmPanel = useParkStore((state) => state.setShowAlarmPanel);
  const setShowReservationPanel = useParkStore((state) => state.setShowReservationPanel);
  const alarms = useParkStore((state) => state.alarms);
  const setIsSelecting = useParkStore((state) => state.setIsSelecting);
  const isSelecting = useParkStore((state) => state.isSelecting);
  const exportWithWatermark = useParkStore((state) => state.exportWithWatermark);

  const vehicles = useParkStore((state) => state.vehicles);
  const warehouses = useParkStore((state) => state.warehouses);
  const selectVehicle = useParkStore((state) => state.selectVehicle);
  const selectWarehouse = useParkStore((state) => state.selectWarehouse);
  const selectedVehicleId = useParkStore((state) => state.selectedVehicleId);
  const selectedWarehouseId = useParkStore((state) => state.selectedWarehouseId);
  const loadWarehouseSlots = useParkStore((state) => state.loadWarehouseSlots);
  const addOperationLog = useParkStore((state) => state.addOperationLog);

  const [activeTab, setActiveTab] = useState<TabType>('layers');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<VehicleType | 'all'>('all');

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (vehicleSearch && !v.plateNumber.toLowerCase().includes(vehicleSearch.toLowerCase())) return false;
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      if (typeFilter !== 'all' && v.type !== typeFilter) return false;
      return true;
    });
  }, [vehicles, vehicleSearch, statusFilter, typeFilter]);

  const violationCount = vehicles.filter((v) => v.status === 'violation').length;
  const movingCount = vehicles.filter((v) => v.status === 'moving').length;

  const handlePlanPath = async () => {
    if (pathStart && pathEnd) {
      const path = await pathApi.planPath(pathStart, pathEnd);
      setPlannedPath(path);
      addOperationLog('路径规划', '规划完成');
    }
  };

  const handleSetStart = () => {
    setPathStart({ x: 90, y: 0.5, z: 0 });
  };

  const handleSetEnd = () => {
    setPathEnd({ x: 50, y: 0.5, z: 35 });
  };

  const handleClearPath = () => {
    setPathStart(null);
    setPathEnd(null);
    setPlannedPath(null);
  };

  const handleSaveView = () => {
    const currentView = getCurrentCameraView();
    if (currentView) {
      const newView = {
        id: `view-${Date.now()}`,
        name: `自定义视角 ${cameraViews.length - 2}`,
        position: currentView.position,
        target: currentView.target,
      };
      addCameraView(newView);
      message.success('视角已收藏');
    } else {
      message.warning('无法获取当前视角');
    }
  };

  const handleSelectVehicle = (id: string) => {
    selectVehicle(id === selectedVehicleId ? null : id);
  };

  const handleSelectWarehouse = (id: string) => {
    if (id === selectedWarehouseId) {
      selectWarehouse(null);
    } else {
      selectWarehouse(id);
      loadWarehouseSlots(id);
    }
  };

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'layers', label: '图层', icon: <Layers size={14} /> },
    { key: 'vehicles', label: '车辆', icon: <Truck size={14} /> },
    { key: 'warehouses', label: '仓库', icon: <Warehouse size={14} /> },
    { key: 'views', label: '视角', icon: <Camera size={14} /> },
    { key: 'path', label: '路径', icon: <Route size={14} /> },
  ];

  return (
    <div className="absolute left-4 top-4 bottom-4 w-72 bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-2xl border border-slate-700/50 z-10 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <Layers size={20} className="text-blue-400" />
          控制面板
        </h2>
      </div>

      <div className="flex border-b border-slate-700/50 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`flex-1 min-w-[50px] py-2 text-xs flex items-center justify-center gap-1 transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600/30 text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'layers' && (
          <div className="space-y-2">
            {layerConfig.map((layer) => (
              <div
                key={layer.type}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                  layers[layer.type] ? 'bg-slate-800/50 text-white' : 'bg-slate-800/20 text-gray-500'
                } hover:bg-slate-700/50`}
                onClick={() => toggleLayer(layer.type)}
              >
                <div className="flex items-center gap-2">
                  <span className={layers[layer.type] ? 'text-blue-400' : 'text-gray-600'}>
                    {layer.icon}
                  </span>
                  <span className="text-sm">{layer.label}</span>
                </div>
                {layers[layer.type] ? (
                  <Eye size={16} className="text-green-400" />
                ) : (
                  <EyeOff size={16} className="text-gray-600" />
                )}
              </div>
            ))}

            {layers.heatmap && (
              <div className="mt-4 p-3 bg-slate-800/50 rounded">
                <div className="text-sm text-gray-300 mb-2">热力图类型</div>
                <Select
                  size="small"
                  value={heatmapType}
                  onChange={(val) => {
                    setHeatmapType(val as HeatmapType);
                    setShowHeatmap(true);
                  }}
                  style={{ width: '100%' }}
                  options={heatmapOptions.map((opt) => ({ value: opt.value, label: opt.label }))}
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    size="small"
                    type={showHeatmap ? 'primary' : 'default'}
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    block
                  >
                    {showHeatmap ? '隐藏热力' : '显示热力'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'vehicles' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300 flex items-center gap-1">
                <Truck size={14} />
                在园车辆
              </span>
              <span className="text-gray-500 text-xs">共 {filteredVehicles.length} 辆</span>
            </div>

            <div className="flex gap-2 flex-wrap">
              {violationCount > 0 && (
                <Tag color="red" icon={<AlertTriangle size={10} />}>
                  {violationCount} 违停
                </Tag>
              )}
              <Tag color="green">{movingCount} 行驶中</Tag>
            </div>

            <Input
              size="small"
              placeholder="搜索车牌号..."
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
              prefix={<Search size={14} className="text-gray-500" />}
              allowClear
            />

            <div className="flex gap-2">
              <Select
                size="small"
                value={statusFilter}
                onChange={(val) => setStatusFilter(val as any)}
                style={{ flex: 1 }}
                options={[
                  { value: 'all', label: '全部状态' },
                  { value: 'moving', label: '行驶中' },
                  { value: 'stopped', label: '停止' },
                  { value: 'loading', label: '装货中' },
                  { value: 'unloading', label: '卸货中' },
                  { value: 'violation', label: '违停' },
                ]}
              />
              <Select
                size="small"
                value={typeFilter}
                onChange={(val) => setTypeFilter(val as any)}
                style={{ flex: 1 }}
                options={[
                  { value: 'all', label: '全部类型' },
                  { value: 'truck', label: '卡车' },
                  { value: 'forklift', label: '叉车' },
                  { value: 'van', label: '厢货' },
                  { value: 'container', label: '集装箱' },
                ]}
              />
            </div>

            <div className="space-y-1 max-h-[320px] overflow-y-auto">
              {filteredVehicles.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-4">暂无匹配车辆</div>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`p-2 rounded cursor-pointer transition-colors flex items-center justify-between ${
                      selectedVehicleId === vehicle.id
                        ? 'bg-blue-900/40 border border-blue-500/50'
                        : 'bg-slate-800/50 hover:bg-slate-700/50'
                    }`}
                    onClick={() => handleSelectVehicle(vehicle.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Truck
                        size={14}
                        className={vehicle.status === 'violation' ? 'text-red-400' : 'text-blue-400'}
                      />
                      <span className="text-white text-sm">{vehicle.plateNumber}</span>
                    </div>
                    <Tag color={statusColors[vehicle.status]} style={{ margin: 0, fontSize: '10px', padding: '0 6px' }}>
                      {statusLabels[vehicle.status]}
                    </Tag>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'warehouses' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300 flex items-center gap-1">
                <Warehouse size={14} />
                仓库列表
              </span>
              <span className="text-gray-500 text-xs">共 {warehouses.length} 个</span>
            </div>

            <div className="space-y-2">
              {warehouses.map((wh) => {
                const rate = (wh.occupiedSlots / wh.totalSlots) * 100;
                return (
                  <div
                    key={wh.id}
                    className={`p-3 rounded cursor-pointer transition-colors ${
                      selectedWarehouseId === wh.id
                        ? 'bg-blue-900/40 border border-blue-500/50'
                        : 'bg-slate-800/50 hover:bg-slate-700/50'
                    }`}
                    onClick={() => handleSelectWarehouse(wh.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">{wh.name}</span>
                      <span className="text-xs text-gray-400">{wh.floors}层</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">库位利用率</span>
                      <span className="text-white">{rate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          rate > 80 ? 'bg-red-500' : rate > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      <span>
                        <Package size={10} className="inline mr-1" />
                        {wh.occupiedSlots}/{wh.totalSlots}
                      </span>
                      <span>{wh.shelvesPerFloor * wh.floors} 组货架</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'views' && (
          <div className="space-y-2">
            <Button size="small" icon={<Camera size={14} />} onClick={handleSaveView} block>
              保存当前视角
            </Button>
            <div className="h-2" />
            {cameraViews.map((view) => (
              <div
                key={view.id}
                className="flex items-center justify-between p-2 rounded bg-slate-800/50 hover:bg-slate-700/50 cursor-pointer transition-colors"
                onClick={() => {
                  setCurrentView(view);
                  addOperationLog('视角跳转', `跳转至 ${view.name}`);
                }}
              >
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-blue-400" />
                  <span className="text-sm text-white">{view.name}</span>
                </div>
                <Play size={14} className="text-gray-400" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'path' && (
          <div className="space-y-3">
            <div className="text-sm text-gray-300">路径规划</div>

            <div className="p-2 bg-slate-800/50 rounded">
              <div className="text-xs text-gray-400 mb-1">起点</div>
              <div className="flex gap-2">
                <Input
                  size="small"
                  placeholder="选择起点位置"
                  value={pathStart ? `(${pathStart.x.toFixed(1)}, ${pathStart.z.toFixed(1)})` : ''}
                  readOnly
                />
                <Button size="small" onClick={handleSetStart}>
                  选择
                </Button>
              </div>
            </div>

            <div className="p-2 bg-slate-800/50 rounded">
              <div className="text-xs text-gray-400 mb-1">终点</div>
              <div className="flex gap-2">
                <Input
                  size="small"
                  placeholder="选择终点位置"
                  value={pathEnd ? `(${pathEnd.x.toFixed(1)}, ${pathEnd.z.toFixed(1)})` : ''}
                  readOnly
                />
                <Button size="small" onClick={handleSetEnd}>
                  选择
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="primary"
                size="small"
                onClick={handlePlanPath}
                block
                disabled={!pathStart || !pathEnd}
              >
                规划路径
              </Button>
              <Button size="small" onClick={handleClearPath}>
                清除
              </Button>
            </div>

            <div className="p-2 bg-slate-800/30 rounded text-xs text-gray-400">
              <div className="font-medium text-gray-300 mb-1">快捷点位：</div>
              <div className="flex flex-wrap gap-1">
                {[
                  { name: '东门', pos: { x: 90, y: 0.5, z: 0 } },
                  { name: '西门', pos: { x: -90, y: 0.5, z: -20 } },
                  { name: '1号仓', pos: { x: 50, y: 0.5, z: 35 } },
                  { name: '2号仓', pos: { x: 50, y: 0.5, z: -35 } },
                ].map((item) => (
                  <Tag
                    key={item.name}
                    color="blue"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      if (!pathStart) {
                        setPathStart(item.pos);
                      } else {
                        setPathEnd(item.pos);
                      }
                    }}
                  >
                    {item.name}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-700/50 space-y-2">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => setShowTracePanel(true)}
            className="flex flex-col items-center gap-1 p-2 rounded bg-slate-800/50 hover:bg-slate-700/50 transition-colors text-xs"
            title="批次追溯"
          >
            <Package size={16} className="text-yellow-400" />
            <span className="text-gray-300">追溯</span>
          </button>
          <button
            onClick={() => setShowAlarmPanel(true)}
            className="flex flex-col items-center gap-1 p-2 rounded bg-slate-800/50 hover:bg-slate-700/50 transition-colors text-xs relative"
            title="告警中心"
          >
            <Bell size={16} className="text-red-400" />
            <span className="text-gray-300">告警</span>
            {alarms.filter((a) => a.status === 'active').length > 0 && (
              <span className="absolute top-0 right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {alarms.filter((a) => a.status === 'active').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowReservationPanel(true)}
            className="flex flex-col items-center gap-1 p-2 rounded bg-slate-800/50 hover:bg-slate-700/50 transition-colors text-xs"
            title="月台预约"
          >
            <Calendar size={16} className="text-green-400" />
            <span className="text-gray-300">预约</span>
          </button>
          <button
            onClick={() => setIsSelecting(!isSelecting)}
            className={`flex flex-col items-center gap-1 p-2 rounded transition-colors text-xs ${
              isSelecting ? 'bg-blue-600/50 text-white' : 'bg-slate-800/50 hover:bg-slate-700/50'
            }`}
            title="区域框选"
          >
            <BoxSelect size={16} className={isSelecting ? 'text-white' : 'text-blue-400'} />
            <span className={isSelecting ? 'text-white' : 'text-gray-300'}>框选</span>
          </button>
        </div>

        <div className="flex gap-2">
          <Button
            size="small"
            icon={<Download size={12} />}
            onClick={() => exportWithWatermark('screenshot')}
            block
          >
            导出截图
          </Button>
          <Button
            size="small"
            icon={<BookmarkPlus size={12} />}
            onClick={handleSaveView}
            block
          >
            收藏视角
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Input
            size="small"
            placeholder="全局搜索..."
            prefix={<Search size={14} className="text-gray-500" />}
          />
        </div>
      </div>
    </div>
  );
}
