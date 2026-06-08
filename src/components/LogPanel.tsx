import { useState } from 'react';
import { ChevronUp, ChevronDown, FileText, Download, Trash2, Play, Square } from 'lucide-react';
import { useParkStore } from '@/store/parkStore';
import { Button, Tag } from 'antd';

export function LogPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const logs = useParkStore((state) => state.operationLogs);
  const clearLogs = useParkStore((state) => state.clearLogs);
  const addOperationLog = useParkStore((state) => state.addOperationLog);

  const typeColors: Record<string, string> = {
    '图层控制': 'blue',
    '车辆查询': 'green',
    '仓库查询': 'cyan',
    '数据加载': 'purple',
    '视角收藏': 'orange',
    '热力图': 'red',
    '默认': 'default',
  };

  const handleExport = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `operation-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addOperationLog('数据导出', '导出操作日志');
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 z-10 transition-all duration-300"
      style={{ height: isExpanded ? '240px' : '44px' }}
    >
      <div
        className="h-11 px-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-blue-400" />
          <span className="text-white text-sm font-medium">操作日志</span>
          <Tag color="blue" style={{ marginLeft: 8 }}>{logs.length} 条</Tag>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button size="small" icon={<Download size={14} />} onClick={handleExport}>
            导出
          </Button>
          <Button size="small" danger icon={<Trash2 size={14} />} onClick={clearLogs}>
            清空
          </Button>
          {isExpanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronUp size={18} className="text-gray-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="h-[calc(100%-44px)] overflow-y-auto px-4 py-2">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-center py-8 text-sm">暂无操作日志</div>
          ) : (
            <div className="space-y-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-slate-800/50 text-sm"
                >
                  <span className="text-gray-500 font-mono text-xs w-36 flex-shrink-0">
                    {log.timestamp}
                  </span>
                  <Tag color={typeColors[log.type] || 'default'} style={{ margin: 0 }}>
                    {log.type}
                  </Tag>
                  <span className="text-gray-300">{log.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
