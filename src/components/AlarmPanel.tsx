import { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  Bell,
  BellRing,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  X,
  BarChart3,
  LocateFixed,
  Volume2,
  VolumeX,
  Car,
  Package,
  PanelLeftClose,
  DoorOpen,
  Route,
  Flame,
} from 'lucide-react';
import { useParkStore } from '@/store/parkStore';
import { Input, Button, Tag, Select, Empty, Badge, Card, Table, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Alarm, AlarmType, AlarmLevel } from '@/types';

const alarmTypeMap: Record<AlarmType, { label: string; icon: React.ReactNode }> = {
  cargo_overload: { label: '仓储超限', icon: <Package size={14} /> },
  vehicle_violation: { label: '车辆违停', icon: <Car size={14} /> },
  traffic_congestion: { label: '道路拥堵', icon: <Route size={14} /> },
  gate_abnormal: { label: '门禁异常', icon: <DoorOpen size={14} /> },
  fire_alarm: { label: '消防预警', icon: <Flame size={14} /> },
  platform_conflict: { label: '月台冲突', icon: <PanelLeftClose size={14} /> },
  cargo_abnormal: { label: '货物异常', icon: <Package size={14} /> },
};

const alarmLevelMap: Record<AlarmLevel, { label: string; color: string }> = {
  warning: { label: '一般预警', color: 'orange' },
  urgent: { label: '紧急告警', color: 'red' },
};

const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: '待处理', color: 'red' },
  acknowledged: { label: '已确认', color: 'orange' },
  resolved: { label: '已解决', color: 'green' },
};

export function AlarmPanel() {
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list');
  const [typeFilter, setTypeFilter] = useState<AlarmType | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<AlarmLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [searchKeyword, setSearchKeyword] = useState('');

  const alarms = useParkStore((state) => state.alarms);
  const alarmStatistics = useParkStore((state) => state.alarmStatistics);
  const activeAlarmId = useParkStore((state) => state.activeAlarmId);
  const alarmSoundEnabled = useParkStore((state) => state.alarmSoundEnabled);
  const loadAlarms = useParkStore((state) => state.loadAlarms);
  const loadAlarmStatistics = useParkStore((state) => state.loadAlarmStatistics);
  const acknowledgeAlarm = useParkStore((state) => state.acknowledgeAlarm);
  const resolveAlarm = useParkStore((state) => state.resolveAlarm);
  const setShowAlarmPanel = useParkStore((state) => state.setShowAlarmPanel);
  const setActiveAlarmId = useParkStore((state) => state.setActiveAlarmId);
  const setAlarmSoundEnabled = useParkStore((state) => state.setAlarmSoundEnabled);
  const focusAlarm = useParkStore((state) => state.focusAlarm);

  useEffect(() => {
    loadAlarms();
    loadAlarmStatistics();
  }, [loadAlarms, loadAlarmStatistics]);

  const filteredAlarms = useMemo(() => {
    return alarms.filter((alarm) => {
      if (typeFilter !== 'all' && alarm.type !== typeFilter) return false;
      if (levelFilter !== 'all' && alarm.level !== levelFilter) return false;
      if (statusFilter !== 'all' && alarm.status !== statusFilter) return false;
      if (searchKeyword && !alarm.title.includes(searchKeyword) && !alarm.description.includes(searchKeyword)) return false;
      return true;
    });
  }, [alarms, typeFilter, levelFilter, statusFilter, searchKeyword]);

  const handleAcknowledge = (id: string) => {
    acknowledgeAlarm(id);
    message.success('告警已确认');
  };

  const handleResolve = (id: string) => {
    Modal.confirm({
      title: '确认处理',
      content: '确认该告警已处理完成？',
      onOk: () => {
        resolveAlarm(id);
        message.success('告警已处理');
      },
    });
  };

  const handleFocus = (alarm: Alarm) => {
    setActiveAlarmId(alarm.id);
    focusAlarm(alarm.id);
  };

  const activeCount = alarms.filter((a) => a.status === 'active').length;
  const urgentCount = alarms.filter((a) => a.level === 'urgent' && a.status === 'active').length;

  const columns: ColumnsType<Alarm> = [
    {
      title: '告警类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: AlarmType) => {
        const info = alarmTypeMap[type];
        return (
          <div className="flex items-center gap-1">
            <span className="text-gray-400">{info.icon}</span>
            <span className="text-xs text-white">{info.label}</span>
          </div>
        );
      },
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: AlarmLevel) => {
        const info = alarmLevelMap[level];
        return <Tag color={info.color} style={{ margin: 0 }}>{info.label}</Tag>;
      },
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record) => (
        <div>
          <div className="text-white text-sm font-medium">{text}</div>
          <div className="text-gray-500 text-xs mt-0.5">{record.description}</div>
        </div>
      ),
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 140,
      render: (time: string) => (
        <div className="text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Clock size={10} />
            {time.slice(11)}
          </div>
          <div className="mt-0.5">{time.slice(0, 10)}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const info = statusMap[status];
        return <Tag color={info.color} style={{ margin: 0 }}>{info.label}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <div className="flex gap-1">
          <Button
            size="small"
            type="primary"
            ghost
            icon={<LocateFixed size={12} />}
            onClick={() => handleFocus(record)}
          >
            定位
          </Button>
          {record.status === 'active' && (
            <Button
              size="small"
              icon={<CheckCircle size={12} />}
              onClick={() => handleAcknowledge(record.id)}
            >
              确认
            </Button>
          )}
          {record.status !== 'resolved' && (
            <Button
              size="small"
              type="default"
              icon={<XCircle size={12} />}
              onClick={() => handleResolve(record.id)}
            >
              处理
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900/95 backdrop-blur-sm">
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <Bell size={20} className="text-red-400" />
          告警中心
          {activeCount > 0 && (
            <Badge count={activeCount} size="small" style={{ backgroundColor: '#ef4444' }} />
          )}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAlarmSoundEnabled(!alarmSoundEnabled)}
            className={`p-1.5 rounded transition-colors ${
              alarmSoundEnabled ? 'text-green-400 bg-green-900/30' : 'text-gray-500 bg-slate-800/50'
            }`}
            title={alarmSoundEnabled ? '关闭告警声音' : '开启告警声音'}
          >
            {alarmSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            onClick={() => setShowAlarmPanel(false)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-700/50"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex gap-4 p-3 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex-1 p-3 bg-red-900/20 rounded-lg border border-red-500/30">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-red-400" />
            <span className="text-red-400 text-sm font-medium">紧急告警</span>
          </div>
          <div className="text-white text-2xl font-bold">{urgentCount}</div>
        </div>
        <div className="flex-1 p-3 bg-orange-900/20 rounded-lg border border-orange-500/30">
          <div className="flex items-center gap-2 mb-1">
            <BellRing size={16} className="text-orange-400" />
            <span className="text-orange-400 text-sm font-medium">一般预警</span>
          </div>
          <div className="text-white text-2xl font-bold">
            {activeCount - urgentCount}
          </div>
        </div>
        <div className="flex-1 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-green-400 text-sm font-medium">已处理</span>
          </div>
          <div className="text-white text-2xl font-bold">
            {alarms.filter((a) => a.status === 'resolved').length}
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-700/50">
        <button
          className={`px-4 py-2 text-sm transition-colors ${
            activeTab === 'list'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/20'
              : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
          }`}
          onClick={() => setActiveTab('list')}
        >
          告警列表
        </button>
        <button
          className={`px-4 py-2 text-sm transition-colors ${
            activeTab === 'stats'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/20'
              : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
          }`}
          onClick={() => setActiveTab('stats')}
        >
          统计分析
        </button>
      </div>

      {activeTab === 'list' && (
        <>
          <div className="p-3 border-b border-slate-700/50 flex gap-2 flex-wrap">
            <Input
              size="small"
              placeholder="搜索告警..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: 200 }}
              prefix={<Filter size={12} className="text-gray-500" />}
              allowClear
            />
            <Select
              size="small"
              value={typeFilter}
              onChange={(val) => setTypeFilter(val as AlarmType | 'all')}
              style={{ width: 120 }}
              options={[
                { value: 'all', label: '全部类型' },
                ...Object.entries(alarmTypeMap).map(([key, val]) => ({
                  value: key,
                  label: val.label,
                })),
              ]}
            />
            <Select
              size="small"
              value={levelFilter}
              onChange={(val) => setLevelFilter(val as AlarmLevel | 'all')}
              style={{ width: 110 }}
              options={[
                { value: 'all', label: '全部等级' },
                { value: 'urgent', label: '紧急' },
                { value: 'warning', label: '一般' },
              ]}
            />
            <Select
              size="small"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              style={{ width: 110 }}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'active', label: '待处理' },
                { value: 'acknowledged', label: '已确认' },
                { value: 'resolved', label: '已解决' },
              ]}
            />
            <Button size="small" onClick={() => loadAlarms()}>
              刷新
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredAlarms.length === 0 ? (
              <Empty description="暂无告警" className="mt-20" />
            ) : (
              <Table
                size="small"
                columns={columns}
                dataSource={filteredAlarms}
                rowKey="id"
                pagination={{ pageSize: 10, size: 'small' }}
                rowClassName={(record) =>
                  record.id === activeAlarmId ? 'bg-blue-900/30' : ''
                }
                onRow={(record) => ({
                  onClick: () => setActiveAlarmId(record.id),
                  style: { cursor: 'pointer' },
                })}
              />
            )}
          </div>
        </>
      )}

      {activeTab === 'stats' && alarmStatistics && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <Card size="small" title="按类型统计" className="bg-slate-800/50 border-slate-700/50">
            <div className="space-y-2">
              {Object.entries(alarmStatistics.byType).map(([type, count]) => {
                const info = alarmTypeMap[type as AlarmType];
                const total = Object.values(alarmStatistics.byType).reduce((a, b) => a + b, 0);
                const percent = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={type}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300 flex items-center gap-1">
                        {info.icon}
                        {info.label}
                      </span>
                      <span className="text-white">{count} 次</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card size="small" title="近7日趋势" className="bg-slate-800/50 border-slate-700/50">
            <div className="space-y-2">
              {alarmStatistics.byDate.map((item) => (
                <div key={item.date}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">{item.date.slice(5)}</span>
                    <span className="text-white">{item.count} 次</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(item.count / 30) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card size="small" title="告警汇总" className="bg-slate-800/50 border-slate-700/50">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/50 p-3 rounded">
                <div className="text-gray-400 text-xs mb-1">告警总数</div>
                <div className="text-white text-xl font-bold">{alarmStatistics.total}</div>
              </div>
              <div className="bg-slate-900/50 p-3 rounded">
                <div className="text-gray-400 text-xs mb-1">紧急告警</div>
                <div className="text-red-400 text-xl font-bold">{alarmStatistics.urgent}</div>
              </div>
              <div className="bg-slate-900/50 p-3 rounded">
                <div className="text-gray-400 text-xs mb-1">一般预警</div>
                <div className="text-orange-400 text-xl font-bold">{alarmStatistics.warning}</div>
              </div>
              <div className="bg-slate-900/50 p-3 rounded">
                <div className="text-gray-400 text-xs mb-1">处理率</div>
                <div className="text-green-400 text-xl font-bold">
                  {alarmStatistics.total > 0
                    ? (((alarmStatistics.total - (alarmStatistics.urgent + alarmStatistics.warning)) / alarmStatistics.total) * 100).toFixed(1)
                    : 0}%
                </div>
              </div>
            </div>
          </Card>

          <Button type="primary" block icon={<BarChart3 size={14} />}>
            导出告警报表
          </Button>
        </div>
      )}
    </div>
  );
}
