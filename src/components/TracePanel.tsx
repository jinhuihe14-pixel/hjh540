import { useState, useMemo } from 'react';
import {
  Search,
  Package,
  MapPin,
  Clock,
  Truck,
  Warehouse,
  AlertTriangle,
  CheckCircle,
  Loader,
  X,
  LocateFixed,
} from 'lucide-react';
import { useParkStore } from '@/store/parkStore';
import { Input, Button, Tag, Timeline, Badge, Empty, Card } from 'antd';
import type { TraceStepType, CargoTraceStep } from '@/types';

const stepTypeMap: Record<TraceStepType, { label: string; color: string; icon: React.ReactNode }> = {
  inbound: { label: '入库', color: 'blue', icon: <Truck size={14} /> },
  storage: { label: '存储', color: 'green', icon: <Warehouse size={14} /> },
  sorting: { label: '分拣', color: 'purple', icon: <Package size={14} /> },
  outbound: { label: '出库', color: 'orange', icon: <Truck size={14} /> },
  abnormal: { label: '异常', color: 'red', icon: <AlertTriangle size={14} /> },
};

const statusMap: Record<string, { label: string; color: string }> = {
  in_storage: { label: '在库中', color: 'blue' },
  outbound: { label: '已出库', color: 'green' },
  abnormal: { label: '异常', color: 'red' },
};

export function TracePanel() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searching, setSearching] = useState(false);

  const batchSearchResults = useParkStore((state) => state.batchSearchResults);
  const selectedBatchNo = useParkStore((state) => state.selectedBatchNo);
  const batchTrace = useParkStore((state) => state.batchTrace);
  const isLoading = useParkStore((state) => state.isLoading);
  const searchBatch = useParkStore((state) => state.searchBatch);
  const selectBatch = useParkStore((state) => state.selectBatch);
  const locateBatch = useParkStore((state) => state.locateBatch);
  const setShowTracePanel = useParkStore((state) => state.setShowTracePanel);

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    setSearching(true);
    await searchBatch(searchKeyword.trim());
    setSearching(false);
  };

  const handleSelectBatch = (batchNo: string) => {
    selectBatch(batchNo === selectedBatchNo ? null : batchNo);
  };

  const handleLocate = (batchNo: string) => {
    locateBatch(batchNo);
  };

  const selectedResult = useMemo(() => {
    return batchSearchResults.find((r) => r.batchNo === selectedBatchNo);
  }, [batchSearchResults, selectedBatchNo]);

  return (
    <div className="h-full flex flex-col bg-slate-900/95 backdrop-blur-sm">
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <Package size={20} className="text-yellow-400" />
          批次追溯
        </h2>
        <button
          onClick={() => setShowTracePanel(false)}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-700/50"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-3 border-b border-slate-700/50">
        <div className="flex gap-2">
          <Input
            placeholder="输入批次号或货物名称搜索..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<Search size={14} className="text-gray-500" />}
            allowClear
          />
          <Button type="primary" icon={<Search size={14} />} loading={searching} onClick={handleSearch}>
            搜索
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className={`border-r border-slate-700/50 overflow-y-auto transition-all ${selectedBatchNo ? 'w-1/2' : 'w-full'}`}>
          {searching || isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader size={24} className="text-blue-400 animate-spin" />
            </div>
          ) : batchSearchResults.length === 0 ? (
            <div className="p-4">
              <Empty description="暂无搜索结果" />
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {batchSearchResults.map((result) => (
                <div
                  key={result.batchNo}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    selectedBatchNo === result.batchNo
                      ? 'bg-blue-900/40 border border-blue-500/50'
                      : 'bg-slate-800/50 hover:bg-slate-700/50'
                  }`}
                  onClick={() => handleSelectBatch(result.batchNo)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-yellow-400" />
                      <span className="text-white font-medium text-sm">{result.batchNo}</span>
                    </div>
                    <Badge count={result.slotCount} size="small" showZero style={{ backgroundColor: '#3b82f6' }} />
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>货物名称</span>
                      <span className="text-gray-300">{result.cargoName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>所在仓库</span>
                      <span className="text-gray-300">{result.warehouseName}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="small"
                      type="primary"
                      ghost
                      icon={<LocateFixed size={12} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLocate(result.batchNo);
                      }}
                      block
                    >
                      3D定位
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedBatchNo && batchTrace && (
          <div className="w-1/2 overflow-y-auto p-3 space-y-3">
            <Card size="small" className="bg-slate-800/50 border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-bold">{batchTrace.batchNo}</span>
                <Tag color={statusMap[batchTrace.status]?.color || 'default'}>
                  {statusMap[batchTrace.status]?.label || batchTrace.status}
                </Tag>
              </div>
              <div className="text-xs text-gray-400 space-y-1.5">
                <div className="flex justify-between">
                  <span>货物名称</span>
                  <span className="text-white">{batchTrace.cargoName}</span>
                </div>
                <div className="flex justify-between">
                  <span>供应商</span>
                  <span className="text-white">{batchTrace.supplier}</span>
                </div>
                <div className="flex justify-between">
                  <span>订单号</span>
                  <span className="text-white">{batchTrace.orderNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>总数量</span>
                  <span className="text-white">{batchTrace.totalQuantity} 件</span>
                </div>
                <div className="flex justify-between">
                  <span>总重量</span>
                  <span className="text-white">{batchTrace.totalWeight.toFixed(2)} 吨</span>
                </div>
                <div className="flex justify-between">
                  <span>入库时间</span>
                  <span className="text-white">{batchTrace.inTime}</span>
                </div>
                {batchTrace.expectedOutTime && (
                  <div className="flex justify-between">
                    <span>预计出库</span>
                    <span className="text-white">{batchTrace.expectedOutTime}</span>
                  </div>
                )}
                {batchTrace.actualOutTime && (
                  <div className="flex justify-between">
                    <span>实际出库</span>
                    <span className="text-white">{batchTrace.actualOutTime}</span>
                  </div>
                )}
              </div>
            </Card>

            <div className="bg-slate-800/30 p-3 rounded">
              <div className="text-sm text-white font-medium mb-3 flex items-center gap-2">
                <Clock size={14} className="text-blue-400" />
                全流程轨迹
              </div>
              <Timeline
                items={batchTrace.steps.map((step: CargoTraceStep) => {
                  const stepInfo = stepTypeMap[step.type];
                  return {
                    color: step.status === 'completed' ? 'green' : step.status === 'in_progress' ? 'blue' : 'gray',
                    dot: step.status === 'completed' ? <CheckCircle size={14} className="text-green-500" /> : stepInfo.icon,
                    children: (
                      <div className="pb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Tag color={stepInfo.color} style={{ margin: 0 }}>
                            {stepInfo.label}
                          </Tag>
                          <span className="text-xs text-gray-400">{step.timestamp}</span>
                        </div>
                        <div className="text-sm text-white mb-1">{step.description}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin size={10} />
                          {step.location}
                        </div>
                        {step.operator && (
                          <div className="text-xs text-gray-500 mt-1">操作人: {step.operator}</div>
                        )}
                      </div>
                    ),
                  };
                })}
              />
            </div>

            <div className="flex gap-2">
              <Button size="small" type="primary" block icon={<LocateFixed size={14} />} onClick={() => handleLocate(selectedBatchNo)}>
                3D场景定位
              </Button>
              <Button size="small" block>
                导出台账
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
