import { useState } from 'react';
import { Play, Pause, RotateCcw, Zap, TrendingUp, Clock } from 'lucide-react';
import { Button, Slider, Switch, Card, Progress, Statistic } from 'antd';
import { simulationApi } from '@/api';
import type { SimulationConfig, SimulationResult } from '@/types';
import { useParkStore } from '@/store/parkStore';

export function SimulationPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [config, setConfig] = useState<SimulationConfig>({
    vehicleCount: 50,
    duration: 30,
    speedMultiplier: 1,
    peakHour: false,
  });
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [progress, setProgress] = useState(0);
  const addOperationLog = useParkStore((state) => state.addOperationLog);

  const handleStart = async () => {
    setIsRunning(true);
    setProgress(0);
    addOperationLog('模拟推演', `开始模拟: ${config.vehicleCount}辆车, ${config.duration}分钟`);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          simulationApi.runSimulation(config).then((res) => {
            setResult(res);
          });
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const handleStop = () => {
    setIsRunning(false);
    addOperationLog('模拟推演', '停止模拟');
  };

  const handleReset = () => {
    setIsRunning(false);
    setProgress(0);
    setResult(null);
  };

  return (
    <Card
      size="small"
      title={
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" />
          <span className="text-white">车流模拟推演</span>
        </div>
      }
      className="bg-slate-800/90 border-slate-700"
      styles={{ header: { borderBottom: '1px solid #334155' }, body: { padding: '12px' } }}
    >
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>车辆数量</span>
            <span className="text-white">{config.vehicleCount} 辆</span>
          </div>
          <Slider
            min={10}
            max={200}
            value={config.vehicleCount}
            onChange={(val) => setConfig({ ...config, vehicleCount: val as number })}
            disabled={isRunning}
            tooltip={{ formatter: (val) => `${val} 辆` }}
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>模拟时长</span>
            <span className="text-white">{config.duration} 分钟</span>
          </div>
          <Slider
            min={5}
            max={120}
            value={config.duration}
            onChange={(val) => setConfig({ ...config, duration: val as number })}
            disabled={isRunning}
            tooltip={{ formatter: (val) => `${val} 分钟` }}
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>播放速度</span>
            <span className="text-white">{config.speedMultiplier}x</span>
          </div>
          <Slider
            min={0.5}
            max={5}
            step={0.5}
            value={config.speedMultiplier}
            onChange={(val) => setConfig({ ...config, speedMultiplier: val as number })}
            disabled={isRunning}
            tooltip={{ formatter: (val) => `${val}x 速度` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">高峰时段模式</span>
          <Switch
            checked={config.peakHour}
            onChange={(checked) => setConfig({ ...config, peakHour: checked })}
            disabled={isRunning}
            size="small"
          />
        </div>

        {isRunning && (
          <div className="py-2">
            <Progress percent={progress} size="small" status="active" />
            <div className="text-xs text-gray-400 text-center mt-1">
              模拟进行中...
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {!isRunning ? (
            <Button type="primary" icon={<Play size={14} />} onClick={handleStart} block>
              开始模拟
            </Button>
          ) : (
            <Button danger icon={<Pause size={14} />} onClick={handleStop} block>
              暂停模拟
            </Button>
          )}
          <Button icon={<RotateCcw size={14} />} onClick={handleReset} disabled={isRunning}>
            重置
          </Button>
        </div>

        {result && (
          <div className="pt-3 border-t border-slate-700 space-y-2">
            <div className="text-sm text-gray-300 font-medium flex items-center gap-1">
              <TrendingUp size={14} className="text-green-400" />
              模拟结果
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-900/50 p-2 rounded text-center">
                <div className="text-lg font-bold text-blue-400">{result.avgSpeed.toFixed(1)}</div>
                <div className="text-xs text-gray-400">平均速度 km/h</div>
              </div>
              <div className="bg-slate-900/50 p-2 rounded text-center">
                <div className="text-lg font-bold text-red-400">{(result.maxCongestion * 100).toFixed(0)}%</div>
                <div className="text-xs text-gray-400">最大拥堵</div>
              </div>
              <div className="bg-slate-900/50 p-2 rounded text-center">
                <div className="text-lg font-bold text-green-400">{result.totalThroughput}</div>
                <div className="text-xs text-gray-400">总吞吐量 吨</div>
              </div>
              <div className="bg-slate-900/50 p-2 rounded text-center">
                <div className="text-lg font-bold text-yellow-400">{result.platformUtilization.toFixed(1)}%</div>
                <div className="text-xs text-gray-400">月台利用率</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
