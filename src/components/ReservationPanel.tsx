import { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Truck,
  User,
  Package,
  Plus,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  LocateFixed,
  Phone,
} from 'lucide-react';
import { useParkStore } from '@/store/parkStore';
import {
  Input,
  Button,
  Tag,
  Select,
  Empty,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  message,
  Table,
  Card,
  Badge,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { PlatformReservation, ReservationFormData } from '@/types';
import dayjs from 'dayjs';

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待确认', color: 'orange' },
  confirmed: { label: '已确认', color: 'blue' },
  in_progress: { label: '进行中', color: 'purple' },
  completed: { label: '已完成', color: 'green' },
  cancelled: { label: '已取消', color: 'default' },
  expired: { label: '已过期', color: 'gray' },
};

const taskTypeMap: Record<string, { label: string; color: string }> = {
  loading: { label: '装货', color: 'blue' },
  unloading: { label: '卸货', color: 'green' },
};

export function ReservationPanel() {
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);

  const reservations = useParkStore((state) => state.reservations);
  const platforms = useParkStore((state) => state.platforms);
  const selectedReservationId = useParkStore((state) => state.selectedReservationId);
  const loadReservations = useParkStore((state) => state.loadReservations);
  const checkTimeConflict = useParkStore((state) => state.checkTimeConflict);
  const createReservation = useParkStore((state) => state.createReservation);
  const cancelReservation = useParkStore((state) => state.cancelReservation);
  const setShowReservationPanel = useParkStore((state) => state.setShowReservationPanel);
  const setSelectedReservationId = useParkStore((state) => state.setSelectedReservationId);
  const selectPlatform = useParkStore((state) => state.selectPlatform);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (platformFilter !== 'all' && r.platformId !== platformFilter) return false;
      if (searchKeyword && !r.vehiclePlate.includes(searchKeyword) && !r.driverName.includes(searchKeyword)) return false;
      return true;
    });
  }, [reservations, statusFilter, platformFilter, searchKeyword]);

  const handleTimeChange = async () => {
    const platformId = form.getFieldValue('platformId');
    const startTime = form.getFieldValue('plannedStartTime');
    const endTime = form.getFieldValue('plannedEndTime');

    if (platformId && startTime && endTime) {
      const result = await checkTimeConflict(
        platformId,
        startTime.format('YYYY-MM-DD HH:mm:ss'),
        endTime.format('YYYY-MM-DD HH:mm:ss')
      );
      setHasConflict(result.hasConflict);
    } else {
      setHasConflict(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const startTime = values.plannedStartTime.format('YYYY-MM-DD HH:mm:ss');
      const endTime = values.plannedEndTime.format('YYYY-MM-DD HH:mm:ss');

      const conflictResult = await checkTimeConflict(values.platformId, startTime, endTime);
      if (conflictResult.hasConflict) {
        message.error('该时间段存在预约冲突，请选择其他时间');
        setSubmitting(false);
        return;
      }

      const data: ReservationFormData = {
        platformId: values.platformId,
        vehiclePlate: values.vehiclePlate,
        driverName: values.driverName,
        driverPhone: values.driverPhone,
        taskType: values.taskType,
        cargoType: values.cargoType,
        cargoWeight: values.cargoWeight,
        plannedStartTime: startTime,
        plannedEndTime: endTime,
        remark: values.remark,
      };

      await createReservation(data);
      message.success('预约提交成功');
      form.resetFields();
      setActiveTab('list');
      setHasConflict(false);
    } catch (err) {
      message.error('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (id: string) => {
    Modal.confirm({
      title: '取消预约',
      content: '确认取消该月台预约？',
      onOk: async () => {
        await cancelReservation(id, '用户取消');
        message.success('预约已取消');
      },
    });
  };

  const handleLocate = (platformId: string) => {
    selectPlatform(platformId);
  };

  const columns: ColumnsType<PlatformReservation> = [
    {
      title: '车牌号',
      dataIndex: 'vehiclePlate',
      key: 'vehiclePlate',
      width: 100,
      render: (text: string, record) => (
        <div>
          <div className="text-white text-sm font-medium flex items-center gap-1">
            <Truck size={12} className="text-blue-400" />
            {text}
          </div>
          <div className="text-gray-500 text-xs">{record.driverName}</div>
        </div>
      ),
    },
    {
      title: '月台',
      dataIndex: 'platformName',
      key: 'platformName',
      width: 120,
      render: (text: string) => <span className="text-white text-xs">{text}</span>,
    },
    {
      title: '类型',
      dataIndex: 'taskType',
      key: 'taskType',
      width: 70,
      render: (type: string) => {
        const info = taskTypeMap[type];
        return <Tag color={info.color} style={{ margin: 0 }}>{info.label}</Tag>;
      },
    },
    {
      title: '预约时间',
      key: 'time',
      width: 150,
      render: (_, record) => (
        <div className="text-xs">
          <div className="text-gray-300 flex items-center gap-1">
            <Clock size={10} />
            {record.plannedStartTime.slice(5, 16)}
          </div>
          <div className="text-gray-500 mt-0.5">至 {record.plannedEndTime.slice(11, 16)}</div>
        </div>
      ),
    },
    {
      title: '货物',
      key: 'cargo',
      width: 100,
      render: (_, record) => (
        <div className="text-xs">
          <div className="text-gray-300">{record.cargoType}</div>
          <div className="text-gray-500">{record.cargoWeight.toFixed(1)} 吨</div>
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
            onClick={() => handleLocate(record.platformId)}
          >
            定位
          </Button>
          {(record.status === 'pending' || record.status === 'confirmed') && (
            <Button
              size="small"
              danger
              ghost
              icon={<XCircle size={12} />}
              onClick={() => handleCancel(record.id)}
            >
              取消
            </Button>
          )}
        </div>
      ),
    },
  ];

  const todayCount = reservations.filter((r) => {
    const today = dayjs().format('YYYY-MM-DD');
    return r.plannedStartTime.startsWith(today);
  }).length;

  const pendingCount = reservations.filter((r) => r.status === 'pending').length;

  return (
    <div className="h-full flex flex-col bg-slate-900/95 backdrop-blur-sm">
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <Calendar size={20} className="text-green-400" />
          月台预约
          {pendingCount > 0 && (
            <Badge count={pendingCount} size="small" style={{ backgroundColor: '#f59e0b' }} />
          )}
        </h2>
        <button
          onClick={() => setShowReservationPanel(false)}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-700/50"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex gap-4 p-3 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex-1 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={16} className="text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">今日预约</span>
          </div>
          <div className="text-white text-2xl font-bold">{todayCount}</div>
        </div>
        <div className="flex-1 p-3 bg-orange-900/20 rounded-lg border border-orange-500/30">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-orange-400" />
            <span className="text-orange-400 text-sm font-medium">待确认</span>
          </div>
          <div className="text-white text-2xl font-bold">{pendingCount}</div>
        </div>
        <div className="flex-1 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-green-400 text-sm font-medium">月台数</span>
          </div>
          <div className="text-white text-2xl font-bold">{platforms.length}</div>
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
          预约列表
        </button>
        <button
          className={`px-4 py-2 text-sm transition-colors flex items-center gap-1 ${
            activeTab === 'form'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/20'
              : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
          }`}
          onClick={() => setActiveTab('form')}
        >
          <Plus size={14} />
          新建预约
        </button>
      </div>

      {activeTab === 'list' && (
        <>
          <div className="p-3 border-b border-slate-700/50 flex gap-2 flex-wrap">
            <Input
              size="small"
              placeholder="搜索车牌/司机..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: 150 }}
              prefix={<Filter size={12} className="text-gray-500" />}
              allowClear
            />
            <Select
              size="small"
              value={platformFilter}
              onChange={(val) => setPlatformFilter(val)}
              style={{ width: 140 }}
              options={[
                { value: 'all', label: '全部月台' },
                ...platforms.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
            <Select
              size="small"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              style={{ width: 110 }}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'pending', label: '待确认' },
                { value: 'confirmed', label: '已确认' },
                { value: 'in_progress', label: '进行中' },
                { value: 'completed', label: '已完成' },
                { value: 'cancelled', label: '已取消' },
              ]}
            />
            <Button size="small" onClick={() => loadReservations()}>
              刷新
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredReservations.length === 0 ? (
              <Empty description="暂无预约记录" className="mt-20" />
            ) : (
              <Table
                size="small"
                columns={columns}
                dataSource={filteredReservations}
                rowKey="id"
                pagination={{ pageSize: 10, size: 'small' }}
                rowClassName={(record) =>
                  record.id === selectedReservationId ? 'bg-blue-900/30' : ''
                }
                onRow={(record) => ({
                  onClick: () => setSelectedReservationId(record.id),
                  style: { cursor: 'pointer' },
                })}
              />
            )}
          </div>
        </>
      )}

      {activeTab === 'form' && (
        <div className="flex-1 overflow-y-auto p-4">
          <Card size="small" title="预约信息" className="bg-slate-800/50 border-slate-700/50">
            <Form
              form={form}
              layout="vertical"
              onValuesChange={handleTimeChange}
            >
              <Form.Item
                name="platformId"
                label="选择月台"
                rules={[{ required: true, message: '请选择月台' }]}
              >
                <Select
                  placeholder="请选择月台"
                  options={platforms.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                />
              </Form.Item>

              <div className="grid grid-cols-2 gap-3">
                <Form.Item
                  name="vehiclePlate"
                  label="车牌号"
                  rules={[{ required: true, message: '请输入车牌号' }]}
                >
                  <Input placeholder="请输入车牌号" prefix={<Truck size={14} className="text-gray-500" />} />
                </Form.Item>

                <Form.Item
                  name="taskType"
                  label="装卸类型"
                  rules={[{ required: true, message: '请选择装卸类型' }]}
                >
                  <Select
                    placeholder="请选择"
                    options={[
                      { value: 'loading', label: '装货' },
                      { value: 'unloading', label: '卸货' },
                    ]}
                  />
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Form.Item
                  name="driverName"
                  label="司机姓名"
                  rules={[{ required: true, message: '请输入司机姓名' }]}
                >
                  <Input placeholder="请输入姓名" prefix={<User size={14} className="text-gray-500" />} />
                </Form.Item>

                <Form.Item
                  name="driverPhone"
                  label="联系电话"
                >
                  <Input placeholder="请输入电话" prefix={<Phone size={14} className="text-gray-500" />} />
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Form.Item
                  name="plannedStartTime"
                  label="预计到港时间"
                  rules={[{ required: true, message: '请选择开始时间' }]}
                >
                  <DatePicker
                    showTime
                    style={{ width: '100%' }}
                    placeholder="选择开始时间"
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </Form.Item>

                <Form.Item
                  name="plannedEndTime"
                  label="预计离开时间"
                  rules={[{ required: true, message: '请选择结束时间' }]}
                >
                  <DatePicker
                    showTime
                    style={{ width: '100%' }}
                    placeholder="选择结束时间"
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Form.Item
                  name="cargoType"
                  label="货物类型"
                  rules={[{ required: true, message: '请输入货物类型' }]}
                >
                  <Input placeholder="请输入货物类型" prefix={<Package size={14} className="text-gray-500" />} />
                </Form.Item>

                <Form.Item
                  name="cargoWeight"
                  label="货物重量(吨)"
                  rules={[{ required: true, message: '请输入货物重量' }]}
                >
                  <InputNumber min={0} step={0.5} style={{ width: '100%' }} placeholder="吨" />
                </Form.Item>
              </div>

              <Form.Item
                name="remark"
                label="备注"
              >
                <Input.TextArea rows={2} placeholder="请输入备注信息" />
              </Form.Item>

              {hasConflict && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-400" />
                  <div>
                    <div className="text-red-400 font-medium text-sm">时间冲突</div>
                    <div className="text-red-300/70 text-xs">该时间段已有其他预约，请调整时间</div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="primary"
                  block
                  icon={<Plus size={14} />}
                  loading={submitting}
                  onClick={handleSubmit}
                  disabled={hasConflict}
                >
                  提交预约
                </Button>
                <Button onClick={() => form.resetFields()}>
                  重置
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      )}
    </div>
  );
}
