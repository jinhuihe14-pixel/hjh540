import { useEffect, useState } from 'react';
import { Bell, AlertTriangle, X, LocateFixed, Check } from 'lucide-react';
import { useParkStore } from '@/store/parkStore';
import type { Alarm } from '@/types';

export function AlarmNotification() {
  const [visibleAlarms, setVisibleAlarms] = useState<Alarm[]>([]);
  const alarms = useParkStore((state) => state.alarms);
  const setActiveAlarmId = useParkStore((state) => state.setActiveAlarmId);
  const focusAlarm = useParkStore((state) => state.focusAlarm);
  const acknowledgeAlarm = useParkStore((state) => state.acknowledgeAlarm);

  useEffect(() => {
    const activeAlarms = alarms.filter((a) => a.status === 'active');
    const recentAlarms = activeAlarms.filter((a) => {
      const alarmTime = new Date(a.timestamp).getTime();
      const now = Date.now();
      return now - alarmTime < 300000;
    });
    setVisibleAlarms(recentAlarms.slice(0, 5));
  }, [alarms]);

  const handleClose = (id: string) => {
    setVisibleAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  const handleFocus = (alarm: Alarm) => {
    setActiveAlarmId(alarm.id);
    focusAlarm(alarm.id);
    handleClose(alarm.id);
  };

  const handleAcknowledge = (alarm: Alarm) => {
    acknowledgeAlarm(alarm.id);
    handleClose(alarm.id);
  };

  if (visibleAlarms.length === 0) return null;

  return (
    <div className="absolute top-20 right-4 z-30 space-y-2 w-80">
      {visibleAlarms.map((alarm) => (
        <div
          key={alarm.id}
          className={`bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-2xl border overflow-hidden animate-slide-in ${
            alarm.level === 'urgent' ? 'border-red-500/70' : 'border-orange-500/70'
          }`}
        >
          <div
            className={`px-3 py-2 flex items-center justify-between ${
              alarm.level === 'urgent'
                ? 'bg-red-900/40 border-b border-red-500/30'
                : 'bg-orange-900/40 border-b border-orange-500/30'
            }`}
          >
            <div className="flex items-center gap-2">
              {alarm.level === 'urgent' ? (
                <AlertTriangle size={16} className="text-red-400 animate-pulse" />
              ) : (
                <Bell size={16} className="text-orange-400" />
              )}
              <span
                className={`text-sm font-medium ${
                  alarm.level === 'urgent' ? 'text-red-400' : 'text-orange-400'
                }`}
              >
                {alarm.level === 'urgent' ? '紧急告警' : '一般预警'}
              </span>
            </div>
            <button
              onClick={() => handleClose(alarm.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-3">
            <div className="text-white font-medium text-sm mb-1">{alarm.title}</div>
            <div className="text-gray-400 text-xs mb-3">{alarm.description}</div>
            <div className="text-gray-500 text-xs mb-3">
              {new Date(alarm.timestamp).toLocaleString('zh-CN')}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleFocus(alarm)}
                className="flex-1 px-2 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-400 text-xs rounded transition-colors flex items-center justify-center gap-1"
              >
                <LocateFixed size={12} />
                3D定位
              </button>
              <button
                onClick={() => handleAcknowledge(alarm)}
                className="flex-1 px-2 py-1.5 bg-green-600/30 hover:bg-green-600/50 text-green-400 text-xs rounded transition-colors flex items-center justify-center gap-1"
              >
                <Check size={12} />
                确认
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
