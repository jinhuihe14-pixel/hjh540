import { useState } from 'react';
import { ParkScene } from '@/three/ParkScene';
import { TopBar } from '@/components/TopBar';
import { LeftPanel } from '@/components/LeftPanel';
import { RightPanel } from '@/components/RightPanel';
import { LogPanel } from '@/components/LogPanel';
import { SimulationPanel } from '@/components/SimulationPanel';
import { Button, Drawer } from 'antd';
import { Zap } from 'lucide-react';

export default function Home() {
  const [simulationOpen, setSimulationOpen] = useState(false);

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
