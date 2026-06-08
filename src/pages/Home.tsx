import { useState, useEffect } from 'react';
import { ParkScene } from '@/three/ParkScene';
import { TopBar } from '@/components/TopBar';
import { LeftPanel } from '@/components/LeftPanel';
import { RightPanel } from '@/components/RightPanel';
import { LogPanel } from '@/components/LogPanel';
import { SimulationPanel } from '@/components/SimulationPanel';
import { TracePanel } from '@/components/TracePanel';
import { AlarmPanel } from '@/components/AlarmPanel';
import { ReservationPanel } from '@/components/ReservationPanel';
import { AlarmNotification } from '@/components/AlarmNotification';
import { SelectionTool } from '@/components/SelectionTool';
import { Button, Drawer } from 'antd';
import { Zap } from 'lucide-react';
import { useParkStore } from '@/store/parkStore';

export default function Home() {
  const [simulationOpen, setSimulationOpen] = useState(false);

  const showTracePanel = useParkStore((state) => state.showTracePanel);
  const showAlarmPanel = useParkStore((state) => state.showAlarmPanel);
  const showReservationPanel = useParkStore((state) => state.showReservationPanel);
  const loadAlarms = useParkStore((state) => state.loadAlarms);
  const setShowTracePanel = useParkStore((state) => state.setShowTracePanel);
  const setShowAlarmPanel = useParkStore((state) => state.setShowAlarmPanel);
  const setShowReservationPanel = useParkStore((state) => state.setShowReservationPanel);

  useEffect(() => {
    loadAlarms();
  }, [loadAlarms]);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-slate-950">
      <TopBar />

      <div className="absolute top-16 left-0 right-0 bottom-0">
        <ParkScene className="w-full h-full" />
      </div>

      <div className="absolute top-20 left-0 bottom-12">
        <LeftPanel />
      </div>

      <div className="absolute top-20 right-0 bottom-12">
        <RightPanel />
      </div>

      <LogPanel />

      <AlarmNotification />
      <SelectionTool />

      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<Zap size={20} />}
        className="absolute bottom-16 right-6 z-20 shadow-lg"
        onClick={() => setSimulationOpen(true)}
      />

      <Drawer
        title="车流模拟推演"
        placement="right"
        onClose={() => setSimulationOpen(false)}
        open={simulationOpen}
        width={360}
        styles={{
          header: { background: '#1e293b', borderBottom: '1px solid #334155', color: 'white' },
          body: { background: '#0f172a', padding: '16px' },
          content: { background: '#0f172a' },
        }}
      >
        <SimulationPanel />
      </Drawer>

      <Drawer
        title="批次追溯"
        placement="left"
        onClose={() => setShowTracePanel(false)}
        open={showTracePanel}
        width={700}
        styles={{
          header: { background: '#1e293b', borderBottom: '1px solid #334155', color: 'white', padding: '12px 16px' },
          body: { background: '#0f172a', padding: 0 },
          content: { background: '#0f172a' },
        }}
        destroyOnClose
      >
        <TracePanel />
      </Drawer>

      <Drawer
        title="告警中心"
        placement="right"
        onClose={() => setShowAlarmPanel(false)}
        open={showAlarmPanel}
        width={500}
        styles={{
          header: { background: '#1e293b', borderBottom: '1px solid #334155', color: 'white', padding: '12px 16px' },
          body: { background: '#0f172a', padding: 0 },
          content: { background: '#0f172a' },
        }}
        destroyOnClose
      >
        <AlarmPanel />
      </Drawer>

      <Drawer
        title="月台预约管理"
        placement="right"
        onClose={() => setShowReservationPanel(false)}
        open={showReservationPanel}
        width={520}
        styles={{
          header: { background: '#1e293b', borderBottom: '1px solid #334155', color: 'white', padding: '12px 16px' },
          body: { background: '#0f172a', padding: 0 },
          content: { background: '#0f172a' },
        }}
        destroyOnClose
      >
        <ReservationPanel />
      </Drawer>

      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg px-4 py-2 text-xs text-gray-400 flex items-center gap-4 border border-slate-700/50">
          <span>鼠标左键: 旋转视角</span>
          <span>鼠标右键: 平移</span>
          <span>滚轮: 缩放</span>
          <span>点击对象: 查看详情</span>
        </div>
      </div>
    </div>
  );
}
