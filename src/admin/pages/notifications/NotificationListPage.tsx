import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, RotateCw, Eye, Edit3, X, AlertCircle, Trash2,
  Bell, HelpCircle, Inbox, Tag, AlertTriangle, UserCheck, ShieldAlert
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

import { AdminNotificationListPageNotificationItem as NotificationItem } from '@shared/types/domain';

export default function NotificationListPage({ onNavigate }: { onNavigate: (tabId: string) => void }) {
  const [demoState, setDemoState] = useState<'NORMAL' | 'LOADING' | 'EMPTY' | 'ERROR'>('NORMAL');
  const [activeKpiFilter, setActiveKpiFilter] = useState<'ALL' | 'SYSTEM' | 'BUSINESS' | 'ALERT'>('ALL');

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'nt-1',
      title: 'Đăng ký sở hữu mới thành công',
      content: 'Sản phẩm Máy lọc nước RO Kangaroo VT3 (SN-KG-889021) đã được Nguyễn Văn A đăng ký sở hữu.',
      type: 'BUSINESS',
      targetRole: 'ALL',
      status: 'ACTIVE',
      createdAt: '2026-06-25 10:15',
      updatedAt: '2026-06-25 10:15'
    },
    {
      id: 'nt-2',
      title: 'Yêu cầu bảo hành mới cần xử lý',
      content: 'Khách hàng Lê Hoàng C gửi khiếu nại bảo hành cho sản phẩm sơn chống thấm Spec.',
      type: 'ALERT',
      targetRole: 'STAFF',
      status: 'ACTIVE',
      createdAt: '2026-06-25 09:30',
      updatedAt: '2026-06-25 09:30'
    },
    {
      id: 'nt-3',
      title: 'Bảo trì hệ thống định kỳ',
      content: 'Hệ thống sẽ được bảo trì nâng cấp công nghệ định kỳ vào lúc 23:00 ngày 28/06/2026.',
      type: 'SYSTEM',
      targetRole: 'ALL',
      status: 'ACTIVE',
      createdAt: '2026-06-24 15:00',
      updatedAt: '2026-06-24 15:00'
    },
    {
      id: 'nt-4',
      title: 'Lô hàng hết hạn sử dụng',
      content: 'Cảnh báo: Lô hàng BATCH-2026-SP12 đã chính thức hết hạn sử dụng.',
      type: 'ALERT',
      targetRole: 'STAFF',
      status: 'ARCHIVED',
      createdAt: '2026-06-23 00:00',
      updatedAt: '2026-06-23 00:00'
    }
  ]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'CREATE' | 'EDIT' | 'VIEW'>('CREATE');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'BUSINESS' as any,
    targetRole: 'ALL' as any,
    status: 'ACTIVE' as any
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Stats
  const stats = useMemo(() => {
    const total = notifications.length + 420;
    const system = notifications.filter(n => n.type === 'SYSTEM').length + 80;
    const business = notifications.filter(n => n.type === 'BUSINESS').length + 300;
    const alertType = notifications.filter(n => n.type === 'ALERT').length + 40;
    return { total, system, business, alertType };
  }, [notifications]);

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(query);
        const matchContent = n.content.toLowerCase().includes(query);
        if (!matchTitle && !matchContent) return false;
      }
      if (filterType !== 'ALL' && n.type !== filterType) return false;
      if (filterRole !== 'ALL' && n.targetRole !== filterRole) return false;
      if (activeKpiFilter !== 'ALL' && n.type !== activeKpiFilter) return false;
      return true;
    });
  }, [notifications, searchTerm, filterType, filterRole, activeKpiFilter]);

  const handleOpenCreate = () => {
    setDrawerMode('CREATE');
    setFormData({
      title: '',
      content: '',
      type: 'BUSINESS',
      targetRole: 'ALL',
      status: 'ACTIVE'
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (n: NotificationItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDrawerMode('EDIT');
    setSelectedNotification(n);
    setFormData({
      title: n.title,
      content: n.content,
      type: n.type,
      targetRole: n.targetRole,
      status: n.status
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleOpenView = (n: NotificationItem) => {
    setDrawerMode('VIEW');
    setSelectedNotification(n);
    setIsDrawerOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      setNotifications(notifications.filter(n => n.id !== id));
      alert('Đã xóa thông báo thành công!');
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setFormError('Tiêu đề và nội dung là bắt buộc');
      return;
    }

    if (drawerMode === 'CREATE') {
      const newNotification: NotificationItem = {
        id: 'nt-' + Date.now(),
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type,
        targetRole: formData.targetRole,
        status: formData.status,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setNotifications([newNotification, ...notifications]);
    } else if (drawerMode === 'EDIT' && selectedNotification) {
      setNotifications(notifications.map(n => n.id === selectedNotification.id ? {
        ...n,
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type,
        targetRole: formData.targetRole,
        status: formData.status,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      } : n));
    }
    setIsDrawerOpen(false);
  };

  const renderTypeBadge = (type: 'SYSTEM' | 'BUSINESS' | 'ALERT') => {
    const config = {
      SYSTEM: { bg: 'bg-blue-50 text-blue-700 border-blue-100', label: 'Hệ thống' },
      BUSINESS: { bg: 'bg-green-50 text-green-700 border-green-100', label: 'N nghiệp vụ' },
      ALERT: { bg: 'bg-amber-50 text-amber-700 border-amber-100', label: 'Cảnh báo' }
    };
    const c = config[type] || config.BUSINESS;
    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${c.bg}`}>
        {c.label}
      </span>
    );
  };

  const renderStatusBadge = (status: 'ACTIVE' | 'ARCHIVED') => {
    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Đã gửi
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        Đã lưu trữ
      </span>
    );
  };

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 h-24"></div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-100 h-96 animate-pulse"></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Demo Controls */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Demo Controls</span>
          <span className="text-xs text-blue-600 font-medium">Bấm để chuyển đổi nhanh các trạng thái hiển thị của UI/UX:</span>
        </div>
        <div className="flex gap-2">
          {['NORMAL', 'LOADING', 'EMPTY', 'ERROR'].map(st => (
            <button
              key={st}
              onClick={() => setDemoState(st as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                demoState === st ? 'bg-blue-600 text-white' : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'
              }`}
            >
              {st === 'NORMAL' ? 'Bình thường' : st === 'LOADING' ? 'Đang tải' : st === 'EMPTY' ? 'Trống' : 'Lỗi'}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Notification Management
            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-semibold uppercase">
              Role: Admin
            </span>
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý thông báo hệ thống, thông báo nghiệp vụ và cảnh báo gửi tới các vai trò thành viên trong hệ thống.
          </p>
        </div>
        <Button 
          onClick={handleOpenCreate} 
          className="rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
        >
          <Plus size={16} /> Tạo thông báo
        </Button>
      </div>

      {demoState === 'ERROR' ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto mt-12">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Không thể tải dữ liệu thông báo</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">Đã xảy ra lỗi kết nối khi tải danh sách thông báo.</p>
          <Button onClick={() => setDemoState('NORMAL')} className="mt-6 rounded-xl px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Thử lại</Button>
        </Card>
      ) : demoState === 'LOADING' ? (
        renderSkeleton()
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6">
            {[
              { id: 'ALL', label: 'Tổng số thông báo', value: stats.total, color: 'text-slate-900' },
              { id: 'BUSINESS', label: 'Thông báo nghiệp vụ', value: stats.business, color: 'text-green-600' },
              { id: 'SYSTEM', label: 'Thông báo hệ thống', value: stats.system, color: 'text-blue-600' },
              { id: 'ALERT', label: 'Cảnh báo rủi ro', value: stats.alertType, color: 'text-amber-500' }
            ].map(card => (
              <div
                key={card.id}
                onClick={() => setActiveKpiFilter(activeKpiFilter === card.id ? 'ALL' : card.id as any)}
                className={`p-5 bg-white border rounded-xl shadow-xs cursor-pointer hover:border-slate-300 transition-all ${
                  activeKpiFilter === card.id ? 'border-blue-400 ring-2 ring-blue-50 bg-blue-50/10' : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center text-xs text-slate-500 font-semibold uppercase">
                  <span>{card.label}</span>
                  <HelpCircle size={14} className="text-slate-300" />
                </div>
                <div className={`text-3xl font-bold mt-2 ${card.color}`}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm thông báo theo tiêu đề, nội dung..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm focus:outline-none"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"><X size={14} /></button>
                )}
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Loại:</span>
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 cursor-pointer"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="SYSTEM">Hệ thống (SYSTEM)</option>
                  <option value="BUSINESS">N nghiệp vụ (BUSINESS)</option>
                  <option value="ALERT">Cảnh báo (ALERT)</option>
                </select>
              </div>

              {/* Target Role Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Đối tượng nhận:</span>
                <select 
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 cursor-pointer"
                >
                  <option value="ALL">Tất cả vai trò</option>
                  <option value="STAFF">Nhân viên kho (STAFF)</option>
                  <option value="DEALER">Đại lý (DEALER)</option>
                  <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
                </select>
              </div>
            </div>

            {(searchTerm || filterType !== 'ALL' || filterRole !== 'ALL' || activeKpiFilter !== 'ALL') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('ALL');
                  setFilterRole('ALL');
                  setActiveKpiFilter('ALL');
                }}
                className="text-xs font-semibold text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {demoState === 'EMPTY' || filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white">
                <Inbox size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Không tìm thấy thông báo</h3>
                <p className="text-slate-500 text-sm max-w-sm mt-1">Hệ thống chưa tạo thông báo nào gửi đi.</p>
                <Button onClick={handleOpenCreate} className="mt-6 bg-blue-600 text-white rounded-xl px-4 py-2 font-semibold hover:bg-blue-700 cursor-pointer">Tạo thông báo</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm table-fixed border-collapse">
                  <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/75 border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 pl-5 font-bold tracking-wider w-[24%]">Tiêu đề thông báo</th>
                      <th className="p-3.5 font-bold tracking-wider w-[12%]">Loại</th>
                      <th className="p-3.5 font-bold tracking-wider w-[14%]">Nhóm người nhận</th>
                      <th className="p-3.5 font-bold tracking-wider w-[22%]">Nội dung tóm tắt</th>
                      <th className="p-3.5 font-bold tracking-wider w-[12%] text-center">Trạng thái</th>
                      <th className="p-3.5 font-bold tracking-wider w-[10%] text-center">Ngày tạo</th>
                      <th className="p-3.5 pr-5 font-bold tracking-wider w-[10%] text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredNotifications.map(n => (
                      <tr 
                        key={n.id} 
                        onClick={() => handleOpenView(n)}
                        className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
                      >
                        <td className="p-3.5 pl-5 font-semibold text-slate-950 truncate flex items-center gap-2">
                          <div className="p-1 bg-slate-100 rounded text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 flex-shrink-0">
                            <Bell size={14} />
                          </div>
                          <span className="truncate">{n.title}</span>
                        </td>
                        <td className="p-3.5">{renderTypeBadge(n.type)}</td>
                        <td className="p-3.5">
                          {n.targetRole === 'ALL' ? (
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">Tất cả mọi người</span>
                          ) : (
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold border border-blue-100">{n.targetRole}</span>
                          )}
                        </td>
                        <td className="p-3.5 text-xs text-slate-500 truncate" title={n.content}>{n.content}</td>
                        <td className="p-3.5 text-center" onClick={e => e.stopPropagation()}>{renderStatusBadge(n.status)}</td>
                        <td className="p-3.5 text-center text-xs text-slate-400 font-medium">{n.createdAt.split(' ')[0]}</td>
                        <td className="p-3.5 pr-5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-end gap-1">
                            <button 
                              onClick={(e) => handleOpenEdit(n, e)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer border-none bg-transparent"
                              title="Sửa thông báo"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button 
                              onClick={(e) => handleDelete(n.id, e)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer border-none bg-transparent"
                              title="Xóa thông báo"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative bg-white w-[500px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col justify-between z-10 overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {drawerMode === 'CREATE' ? 'Tạo thông báo mới' : drawerMode === 'EDIT' ? 'Cập nhật thông báo' : 'Chi tiết thông báo'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Thông báo và tin nhắn quảng bá tới người dùng.</p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg border-none bg-transparent cursor-pointer"><X size={18} /></button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2"><AlertCircle size={16} />{formError}</div>
              )}

              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tiêu đề thông báo *</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    disabled={drawerMode === 'VIEW'}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Ví dụ: Bảo trì hệ thống bảo hành"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Loại thông báo</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                      disabled={drawerMode === 'VIEW'}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm cursor-pointer"
                    >
                      <option value="SYSTEM">Hệ thống (SYSTEM)</option>
                      <option value="BUSINESS">Nghiệp vụ (BUSINESS)</option>
                      <option value="ALERT">Cảnh báo rủi ro (ALERT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Nhóm nhận</label>
                    <select
                      value={formData.targetRole}
                      onChange={e => setFormData({ ...formData, targetRole: e.target.value as any })}
                      disabled={drawerMode === 'VIEW'}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm cursor-pointer"
                    >
                      <option value="ALL">Tất cả mọi người</option>
                      <option value="STAFF">Staff Kho (STAFF)</option>
                      <option value="DEALER">Đại lý (DEALER)</option>
                      <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    disabled={drawerMode === 'VIEW'}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm cursor-pointer"
                  >
                    <option value="ACTIVE">Hoạt động (Gửi ngay)</option>
                    <option value="ARCHIVED">Lưu trữ (Ẩn)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Nội dung chi tiết thông báo *</label>
                  <textarea 
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    disabled={drawerMode === 'VIEW'}
                    rows={6}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Nhập nội dung đầy đủ của thông báo..."
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
              <Button variant="secondary" onClick={() => setIsDrawerOpen(false)} className="rounded-xl px-4 text-xs font-semibold cursor-pointer">
                {drawerMode === 'VIEW' ? 'Đóng' : 'Hủy'}
              </Button>
              {drawerMode !== 'VIEW' && (
                <Button onClick={handleSubmitForm} className="rounded-xl px-4 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer">
                  {drawerMode === 'CREATE' ? 'Gửi thông báo' : 'Lưu thay đổi'}
                </Button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
