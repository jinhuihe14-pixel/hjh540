import { Truck, Package, Activity, Clock, Zap, AlertTriangle, Bell, Calendar, Download } from 'lucide-react';
import { useParkStore } from '@/store/parkStore';
import { parkApi } from '@/api';
import { useEffect, useState } from 'react';
import { Button, Dropdown, Badge, message } from 'antd';

interface OverviewData {
  totalVehicles: number;
  totalCargo: number;
  platformUsage: number;
  todayThroughput: number;
}

export function TopBar() {
  const [overview, setOverview] = useState<OverviewData>({
    totalVehicles: 0,
    totalCargo: 0,
    platformUsage: 0,
    todayThroughput: 0,
  });
  const vehicles = useParkStore((state) => state.vehicles);
  const alarms = useParkStore((state) => state.alarms);
  const reservations = useParkStore((state) => state.reservations);
  const setShowAlarmPanel = useParkStore((state) => state.setShowAlarmPanel);
  const setShowReservationPanel = useParkStore((state) => state.setShowReservationPanel);
  const exportWithWatermark = useParkStore((state) => state.exportWithWatermark);

  const violationCount = vehicles.filter((v) => v.status === 'violation').length;
  const movingCount = vehicles.filter((v) => v.status === 'moving').length;
  const activeAlarmCount = alarms.filter((a) => a.status === 'active').length;
  const urgentAlarmCount = alarms.filter((a) => a.status === 'active' && a.level === 'urgent').length;
  const todayReservations = reservations.filter((r) => {
    const today = new Date().toISOString().slice(0, 10);
    return r.plannedStartTime.startsWith(today);
  }).length;

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    parkApi.getOverview().then(setOverview);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleExport = (type: 'heatmap' | 'screenshot' | 'report') => {
    exportWithWatermark(type);
    message.success(`${type === 'heatmap' ? '热力图' : type === 'screenshot' ? '场景截图' : '报表'}导出成功，已附带园区名称与时间戳`);
  };

  const stats = [
    { label: '在园车辆', value: overview.totalVehicles, icon: <Truck size={18} />, color: 'text-blue-400', sub: `行驶中 ${movingCount}` },
    { label: '库存货物', value: overview.totalCargo, icon: <Package size={18} />, color: 'text-green-400', sub: '件' },
    { label: '月台利用率', value: `${overview.platformUsage}%`, icon: <Activity size={18} />, color: 'text-yellow-400', sub: '今日平均' },
    { label: '今日吞吐量', value: overview.todayThroughput, icon: <Zap size={18} />, color: 'text-purple-400', sub: '吨' },
  ];

  return (
    <div className="absolute top-0 left-0 right-0 h-16 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50 z-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
          <Activity size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg">智慧物流园区3D可视化平台</h1>
          <p className="text-gray-400 text-xs">Smart Logistics Park Visualization</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`${stat.color}`}>{stat.icon}</div>
            <div>
              <div className="text-white font-bold text-lg">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label} · {stat.sub}</div>
            </div>
          </div>
        ))}

        {violationCount > 0 && (
          <div className="flex items-center gap-2 bg-red-900/30 px-3 py-1.5 rounded-lg border border-red-500/50 animate-pulse">
            <AlertTriangle size={18} className="text-red-400" />
            <div>
              <div className="text-red-400 font-bold text-sm">{violationCount} 辆违停</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Dropdown
          menu={{
            items: [
              {
                key: 'screenshot',
                label: '场景截图',
                icon: <Download size={14} />,
                onClick: () => handleExport('screenshot'),
              },
              {
                key: 'heatmap',
                label: '热力图导出',
                icon: <Download size={14} />,
                onClick: () => handleExport('heatmap'),
              },
              {
                key: 'report',
                label: '报表导出',
                icon: <Download size={14} />,
                onClick: () => handleExport('report'),
              },
            ],
          }}
          placement="bottomRight"
        >
          <Button type="text" icon={<Download size={18} className="text-gray-400" />} className="text-gray-400 hover:text-white" />
        </Dropdown>

        <button
          onClick={() => setShowReservationPanel(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <Calendar size={18} className="text-green-400" />
          <span className="text-gray-300 text-sm">预约</span>
          {todayReservations > 0 && (
            <Badge count={todayReservations} size="small" style={{ backgroundColor: '#22c55e' }} />
          )}
        </button>

        <button
          onClick={() => setShowAlarmPanel(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
            urgentAlarmCount > 0
              ? 'bg-red-900/40 hover:bg-red-900/60 border border-red-500/50'
              : 'bg-slate-800/50 hover:bg-slate-700/50'
          }`}
        >
          <Bell size={18} className={urgentAlarmCount > 0 ? 'text-red-400 animate-pulse' : 'text-yellow-400'} />
          <span className={urgentAlarmCount > 0 ? 'text-red-400 text-sm' : 'text-gray-300 text-sm'}>告警</span>
          {activeAlarmCount > 0 && (
            <Badge count={activeAlarmCount} size="small" style={{ backgroundColor: urgentAlarmCount > 0 ? '#ef4444' : '#f59e0b' }} />
          )}
        </button>

        <div className="text-right ml-2">
          <div className="text-white font-mono text-lg">
            {currentTime.toLocaleTimeString('zh-CN', { hour12: false })}
          </div>
          <div className="text-gray-400 text-xs flex items-center gap-1 justify-end">
            <Clock size={12} />
            {currentTime.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </div>
        </div>
      </div>
    </div>
  );
}
