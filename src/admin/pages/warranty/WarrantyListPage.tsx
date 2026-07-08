import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, RotateCw, Eye, Edit3, X, AlertCircle, 
  FileText, Shield, ShieldCheck, ShieldAlert, Calendar, User, Info, HelpCircle, Inbox, Tag, AlertTriangle, Trash2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

import { AdminWarrantyListPageWarranty as Warranty } from '@shared/types/domain';

export default function WarrantyListPage({ onNavigate }: { onNavigate: (tabId: string) => void }) {
  const [demoState, setDemoState] = useState<'NORMAL' | 'LOADING' | 'EMPTY' | 'ERROR'>('NORMAL');
  const [activeKpiFilter, setActiveKpiFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'CLAIMED' | 'RESOLVED'>('ALL');

  const [warranties, setWarranties] = useState<Warranty[]>([
    {
      id: 'w-1',
      itemCode: 'ITEM-RO-KNG00125',
      itemName: 'Máy lọc nước RO Kangaroo VT3',
      serialNumber: 'SN-KG-889021',
      ownerName: 'Nguyễn Văn A',
      ownerEmail: 'nguyenvana@gmail.com',
      warrantyCode: 'WAR-KG-889021',
      policyName: 'Bảo hành chính hãng Kangaroo 24 tháng',
      policyDescription: 'Bảo hành toàn bộ phần điện, vòi, màng lọc RO lỗi sản xuất',
      durationMonths: 24,
      status: 'ACTIVE',
      startDate: '2026-02-15',
      endDate: '2028-02-15',
      invoiceNumber: 'INV-2026-00918',
      note: 'Sản phẩm hoạt động bình thường',
      createdAt: '2026-02-15',
      updatedAt: '2026-02-15 14:30'
    },
    {
      id: 'w-2',
      itemCode: 'ITEM-SP-JA450-0988',
      itemName: 'Tấm pin mặt trời JA Solar 450W',
      serialNumber: 'SN-JA-321104',
      ownerName: 'Trần Thị B',
      ownerEmail: 'tranthib@hotmail.com',
      warrantyCode: 'WAR-JA-321104',
      policyName: 'Bảo hành hiệu suất 12 năm',
      policyDescription: 'Bảo hành hiệu suất tấm pin không giảm quá 20% trong 12 năm',
      durationMonths: 144,
      status: 'ACTIVE',
      startDate: '2026-03-10',
      endDate: '2038-03-10',
      invoiceNumber: 'INV-2026-01254',
      note: 'Dự án hộ gia đình hòa lưới',
      createdAt: '2026-03-10',
      updatedAt: '2026-03-10 09:15'
    },
    {
      id: 'w-3',
      itemCode: 'ITEM-SN-SPEC-77312',
      itemName: 'Sơn chống thấm Spec Damp-proof 5L',
      serialNumber: 'SN-SP-400981',
      ownerName: 'Lê Hoàng C',
      ownerEmail: 'lehoangc@yahoo.com',
      warrantyCode: 'WAR-SP-400981',
      policyName: 'Bảo hành màu sơn 60 tháng',
      policyDescription: 'Bảo hành chống bong tróc, bay màu sơn trong điều kiện thời tiết thường',
      durationMonths: 60,
      status: 'CLAIMED',
      startDate: '2025-06-15',
      endDate: '2030-06-15',
      invoiceNumber: 'INV-2025-10492',
      note: 'Khách báo màu sơn mặt nam bị loang lổ sau mưa bão',
      createdAt: '2025-06-15',
      updatedAt: '2026-06-25 09:00'
    },
    {
      id: 'w-4',
      itemCode: 'ITEM-OM-PRE-882190',
      itemName: 'Omega-3 Premium Nordic',
      serialNumber: 'SN-OM-771120',
      ownerName: 'Phạm Minh D',
      ownerEmail: 'phamminhd@gmail.com',
      warrantyCode: 'WAR-OM-771120',
      policyName: 'Bảo hành chính hãng đổi trả 1 tháng',
      policyDescription: 'Bảo hành đổi trả nếu có lỗi đóng gói hoặc hỏng hóc trong vận chuyển',
      durationMonths: 1,
      status: 'EXPIRED',
      startDate: '2026-01-05',
      endDate: '2026-02-05',
      invoiceNumber: 'INV-2026-00041',
      note: 'Hết hạn bảo hành đổi trả',
      createdAt: '2026-01-05',
      updatedAt: '2026-02-05 00:00'
    }
  ]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'CREATE' | 'EDIT' | 'VIEW' | 'PROCESS_CLAIM'>('CREATE');
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    itemCode: '',
    itemName: 'Máy lọc nước RO Kangaroo VT3',
    serialNumber: '',
    ownerName: '',
    ownerEmail: '',
    warrantyCode: '',
    policyName: 'Bảo hành chính hãng Kangaroo 24 tháng',
    policyDescription: '',
    durationMonths: 24,
    status: 'ACTIVE' as any,
    startDate: '',
    endDate: '',
    invoiceNumber: '',
    note: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Claim processing states
  const [claimResolution, setClaimResolution] = useState({
    decision: 'RESOLVED' as 'RESOLVED' | 'REJECTED' | 'CANCELLED',
    reason: '',
    actionTaken: ''
  });

  // Stats
  const stats = useMemo(() => {
    const total = warranties.length + 840;
    const active = warranties.filter(w => w.status === 'ACTIVE').length + 795;
    const expired = warranties.filter(w => w.status === 'EXPIRED').length + 38;
    const claimed = warranties.filter(w => w.status === 'CLAIMED').length + 5;
    const resolved = warranties.filter(w => w.status === 'RESOLVED').length + 2;
    return { total, active, expired, claimed, resolved };
  }, [warranties]);

  // Filtered warranties
  const filteredWarranties = useMemo(() => {
    return warranties.filter(w => {
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchCode = w.itemCode.toLowerCase().includes(query);
        const matchSerial = w.serialNumber.toLowerCase().includes(query);
        const matchOwner = w.ownerName.toLowerCase().includes(query);
        const matchWarCode = w.warrantyCode.toLowerCase().includes(query);
        if (!matchCode && !matchSerial && !matchOwner && !matchWarCode) return false;
      }
      if (filterStatus !== 'ALL' && w.status !== filterStatus) return false;
      if (activeKpiFilter !== 'ALL' && w.status !== activeKpiFilter) return false;
      return true;
    });
  }, [warranties, searchTerm, filterStatus, activeKpiFilter]);

  const handleOpenCreate = () => {
    setDrawerMode('CREATE');
    const serial = 'SN-KG-' + Math.floor(100000 + Math.random() * 900000);
    setFormData({
      itemCode: 'ITEM-RO-KG' + Math.floor(100000 + Math.random() * 900000),
      itemName: 'Máy lọc nước RO Kangaroo VT3',
      serialNumber: serial,
      ownerName: '',
      ownerEmail: '',
      warrantyCode: 'WAR-KG-' + Math.floor(100000 + Math.random() * 900000),
      policyName: 'Bảo hành chính hãng Kangaroo 24 tháng',
      policyDescription: 'Bảo hành toàn bộ linh kiện điện tử vòi nước và linh kiện máy.',
      durationMonths: 24,
      status: 'ACTIVE',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(Date.now() + 365*2*24*60*60*1000).toISOString().substring(0, 10), // 2 years
      invoiceNumber: 'INV-2026-' + Math.floor(10000 + Math.random() * 90000),
      note: ''
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (warranty: Warranty, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDrawerMode('EDIT');
    setSelectedWarranty(warranty);
    setFormData({
      itemCode: warranty.itemCode,
      itemName: warranty.itemName,
      serialNumber: warranty.serialNumber,
      ownerName: warranty.ownerName,
      ownerEmail: warranty.ownerEmail,
      warrantyCode: warranty.warrantyCode,
      policyName: warranty.policyName,
      policyDescription: warranty.policyDescription,
      durationMonths: warranty.durationMonths,
      status: warranty.status,
      startDate: warranty.startDate,
      endDate: warranty.endDate,
      invoiceNumber: warranty.invoiceNumber,
      note: warranty.note
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleOpenView = (warranty: Warranty) => {
    setDrawerMode('VIEW');
    setSelectedWarranty(warranty);
    setIsDrawerOpen(true);
  };

  const handleOpenClaimProcess = (warranty: Warranty, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDrawerMode('PROCESS_CLAIM');
    setSelectedWarranty(warranty);
    setClaimResolution({
      decision: 'RESOLVED',
      reason: '',
      actionTaken: ''
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (drawerMode === 'PROCESS_CLAIM' && selectedWarranty) {
      if (!claimResolution.reason.trim()) {
        setFormError('Vui lòng nhập lý do và hướng giải quyết bảo hành');
        return;
      }

      setWarranties(warranties.map(w => w.id === selectedWarranty.id ? {
        ...w,
        status: claimResolution.decision,
        note: `Giải quyết bảo hành: ${claimResolution.reason} - Hướng xử lý: ${claimResolution.actionTaken}`,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      } : w));

      setIsDrawerOpen(false);
      return;
    }

    if (!formData.ownerName.trim() || !formData.serialNumber.trim()) {
      setFormError('Tên khách hàng và Serial Number là bắt buộc');
      return;
    }

    if (drawerMode === 'CREATE') {
      const isDuplicate = warranties.some(w => w.warrantyCode.toUpperCase() === formData.warrantyCode.toUpperCase());
      if (isDuplicate) {
        setFormError('Mã bảo hành này đã tồn tại');
        return;
      }

      const newWarranty: Warranty = {
        id: 'w-' + Date.now(),
        itemCode: formData.itemCode.toUpperCase(),
        itemName: formData.itemName,
        serialNumber: formData.serialNumber.toUpperCase(),
        ownerName: formData.ownerName.trim(),
        ownerEmail: formData.ownerEmail.trim(),
        warrantyCode: formData.warrantyCode.toUpperCase(),
        policyName: formData.policyName,
        policyDescription: formData.policyDescription,
        durationMonths: formData.durationMonths,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate,
        invoiceNumber: formData.invoiceNumber.toUpperCase(),
        note: formData.note,
        createdAt: new Date().toISOString().substring(0, 10),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      setWarranties([newWarranty, ...warranties]);
    } else if (drawerMode === 'EDIT' && selectedWarranty) {
      setWarranties(warranties.map(w => w.id === selectedWarranty.id ? {
        ...w,
        serialNumber: formData.serialNumber.toUpperCase(),
        ownerName: formData.ownerName.trim(),
        ownerEmail: formData.ownerEmail.trim(),
        policyName: formData.policyName,
        durationMonths: formData.durationMonths,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate,
        invoiceNumber: formData.invoiceNumber.toUpperCase(),
        note: formData.note,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      } : w));
    }

    setIsDrawerOpen(false);
  };

  const renderStatusBadge = (status: 'INACTIVE' | 'ACTIVE' | 'EXPIRED' | 'CLAIMED' | 'RESOLVED' | 'REJECTED' | 'CANCELLED') => {
    const config = {
      ACTIVE: { bg: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', label: 'Đang bảo hành' },
      INACTIVE: { bg: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-400', label: 'Chưa kích hoạt' },
      EXPIRED: { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', label: 'Hết hạn bảo hành' },
      CLAIMED: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Chờ bảo hành' },
      RESOLVED: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'Đã xử lý xong' },
      REJECTED: { bg: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-600', label: 'Từ chối bảo hành' },
      CANCELLED: { bg: 'bg-slate-100 text-slate-600 border-slate-300', dot: 'bg-slate-400', label: 'Đã hủy' }
    };
    const c = config[status] || config.ACTIVE;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
        {c.label}
      </span>
    );
  };

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 h-24"></div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-100 h-96 animate-pulse"></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Demo Controls */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Demo Controls</span>
          <span className="text-xs text-blue-600 font-medium">Bấm để kiểm tra hiển thị:</span>
        </div>
        <div className="flex gap-2">
          {['NORMAL', 'LOADING', 'EMPTY', 'ERROR'].map(st => (
            <button
              key={st}
              onClick={() => setDemoState(st as any)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
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
            Warranty Claims & Policies
            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-semibold uppercase">
              Role: Warranty Staff / Admin
            </span>
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý chính sách bảo hành sản phẩm, kích hoạt bảo hành điện tử và tiếp nhận xử lý khiếu nại (Claim).
          </p>
        </div>
        <Button 
          onClick={handleOpenCreate} 
          className="rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
        >
          <Plus size={16} /> Kích hoạt bảo hành
        </Button>
      </div>

      {demoState === 'ERROR' ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto mt-12">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Không thể tải dữ liệu bảo hành</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">Đã xảy ra lỗi kết nối khi tải danh sách hợp đồng bảo hành.</p>
          <Button onClick={() => setDemoState('NORMAL')} className="mt-6 rounded-xl px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Thử lại</Button>
        </Card>
      ) : demoState === 'LOADING' ? (
        renderSkeleton()
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-5 gap-4">
            {[
              { id: 'ALL', label: 'Hợp đồng bảo hành', value: stats.total, color: 'text-slate-900' },
              { id: 'ACTIVE', label: 'Đang bảo hành', value: stats.active, color: 'text-green-600' },
              { id: 'CLAIMED', label: 'Yêu cầu bảo hành', value: stats.claimed, color: 'text-amber-500' },
              { id: 'RESOLVED', label: 'Đã hoàn thành', value: stats.resolved, color: 'text-blue-600' },
              { id: 'EXPIRED', label: 'Đã hết hạn', value: stats.expired, color: 'text-slate-400' }
            ].map(card => (
              <div
                key={card.id}
                onClick={() => setActiveKpiFilter(activeKpiFilter === card.id ? 'ALL' : card.id as any)}
                className={`p-4 bg-white border rounded-xl shadow-xs cursor-pointer hover:border-slate-300 transition-all ${
                  activeKpiFilter === card.id ? 'border-blue-400 ring-2 ring-blue-50 bg-blue-50/10' : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase">
                  <span>{card.label}</span>
                  <HelpCircle size={12} className="text-slate-300" />
                </div>
                <div className={`text-2xl font-bold mt-2.5 ${card.color}`}>
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
                  placeholder="Tìm bảo hành theo Mã BH, Serial, Tên Khách hàng..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm focus:outline-none"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"><X size={14} /></button>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Trạng thái:</span>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 cursor-pointer"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="ACTIVE">Đang bảo hành</option>
                  <option value="EXPIRED">Hết hạn</option>
                  <option value="CLAIMED">Yêu cầu bảo hành</option>
                  <option value="RESOLVED">Xử lý xong</option>
                  <option value="REJECTED">Từ chối bảo hành</option>
                </select>
              </div>
            </div>

            {(searchTerm || filterStatus !== 'ALL' || activeKpiFilter !== 'ALL') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('ALL');
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
            {demoState === 'EMPTY' || filteredWarranties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white">
                <Inbox size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Không tìm thấy bản ghi bảo hành</h3>
                <p className="text-slate-500 text-sm max-w-sm mt-1">Chưa có thiết bị nào kích hoạt chính sách bảo hành.</p>
                <Button onClick={handleOpenCreate} className="mt-6 bg-blue-600 text-white rounded-xl px-4 py-2 font-semibold hover:bg-blue-700 cursor-pointer">Kích hoạt bảo hành</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm table-fixed border-collapse">
                  <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/75 border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 pl-5 font-bold tracking-wider w-[15%]">Mã BH</th>
                      <th className="p-3.5 font-bold tracking-wider w-[15%]">Serial</th>
                      <th className="p-3.5 font-bold tracking-wider w-[18%]">Khách hàng</th>
                      <th className="p-3.5 font-bold tracking-wider w-[22%]">Chính sách bảo hành</th>
                      <th className="p-3.5 font-bold tracking-wider w-[10%] text-center">Thời hạn</th>
                      <th className="p-3.5 font-bold tracking-wider w-[12%] text-center">Trạng thái</th>
                      <th className="p-3.5 pr-5 font-bold tracking-wider w-[10%] text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWarranties.map(w => (
                      <tr 
                        key={w.id} 
                        onClick={() => handleOpenView(w)}
                        className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
                      >
                        <td className="p-3.5 pl-5 font-mono text-xs font-semibold text-slate-600 truncate">{w.warrantyCode}</td>
                        <td className="p-3.5 font-mono text-xs font-semibold text-slate-900 truncate">{w.serialNumber}</td>
                        <td className="p-3.5 truncate">
                          <div className="font-semibold text-slate-800 text-xs">{w.ownerName}</div>
                          <div className="text-[10px] text-slate-400">{w.ownerEmail}</div>
                        </td>
                        <td className="p-3.5 truncate">
                          <div className="font-semibold text-slate-800 text-xs flex items-center gap-1"><Shield size={12} className="text-slate-400" /> {w.policyName}</div>
                          <div className="text-[10px] text-slate-400">Từ {w.startDate} đến {w.endDate}</div>
                        </td>
                        <td className="p-3.5 text-center text-slate-700 font-semibold text-xs">{w.durationMonths} tháng</td>
                        <td className="p-3.5 text-center" onClick={e => e.stopPropagation()}>{renderStatusBadge(w.status)}</td>
                        <td className="p-3.5 pr-5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-end gap-1">
                            {w.status === 'CLAIMED' && (
                              <button 
                                onClick={(e) => handleOpenClaimProcess(w, e)}
                                className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg cursor-pointer border-none bg-transparent"
                                title="Xử lý yêu cầu bảo hành"
                              >
                                <ShieldAlert size={15} />
                              </button>
                            )}
                            <button 
                              onClick={() => handleOpenEdit(w)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer border-none bg-transparent"
                              title="Sửa bảo hành"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button 
                              onClick={() => handleOpenView(w)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer border-none bg-transparent"
                              title="Xem chi tiết"
                            >
                              <Eye size={15} />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Bạn có chắc chắn muốn xóa bản ghi bảo hành ${w.warrantyCode}?`)) {
                                  setWarranties(warranties.filter(item => item.id !== w.id));
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer border-none bg-transparent"
                              title="Xóa bảo hành"
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
          <div className="relative bg-white w-[500px] max-h-[90vh] shadow-2xl rounded-2xl flex flex-col justify-between z-10 overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {drawerMode === 'CREATE' ? 'Kích hoạt bảo hành điện tử' : drawerMode === 'EDIT' ? 'Cập nhật bảo hành' : drawerMode === 'PROCESS_CLAIM' ? 'Xử lý yêu cầu bảo hành' : 'Chi tiết bảo hành'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Thông tin thời hạn và chính sách bảo hành chính hãng.</p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg border-none bg-transparent cursor-pointer"><X size={18} /></button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2"><AlertCircle size={16} />{formError}</div>
              )}

              {drawerMode === 'PROCESS_CLAIM' && selectedWarranty ? (
                // Claim handling panel
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-slate-700">
                    <h4 className="text-xs font-bold text-amber-800">YÊU CẦU BẢO HÀNH ĐANG CHỜ</h4>
                    <p className="text-xs font-semibold">{selectedWarranty.ownerName} ({selectedWarranty.ownerEmail})</p>
                    <p className="text-xs">Thiết bị: {selectedWarranty.itemName} | Serial: {selectedWarranty.serialNumber}</p>
                    <div className="text-xs bg-white border border-amber-100 p-2.5 rounded-lg mt-2 font-medium">
                      <strong>Nội dung phản ánh:</strong> {selectedWarranty.note}
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Quyết định xử lý *</label>
                      <select
                        value={claimResolution.decision}
                        onChange={e => setClaimResolution({ ...claimResolution, decision: e.target.value as any })}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm cursor-pointer"
                      >
                        <option value="RESOLVED">Chấp nhận & Đã khắc phục (RESOLVED)</option>
                        <option value="REJECTED">Từ chối bảo hành (REJECTED)</option>
                        <option value="CANCELLED">Hủy hồ sơ (CANCELLED)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Mô tả lý do xử lý *</label>
                      <textarea 
                        value={claimResolution.reason}
                        onChange={e => setClaimResolution({ ...claimResolution, reason: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="Nêu rõ lý do chấp nhận hoặc từ chối..."
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Biện pháp xử lý / linh kiện thay thế</label>
                      <input 
                        type="text" 
                        value={claimResolution.actionTaken}
                        onChange={e => setClaimResolution({ ...claimResolution, actionTaken: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="Ví dụ: Thay màng lọc RO mới, sửa vòi bị rò nước..."
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Standard Form/View
                <div className="space-y-4">
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Mã bảo hành *</label>
                      <input 
                        type="text" 
                        value={formData.warrantyCode}
                        onChange={e => setFormData({ ...formData, warrantyCode: e.target.value.toUpperCase() })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                        placeholder="WAR-XXXXXX"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Số Serial thiết bị *</label>
                      <input 
                        type="text" 
                        value={formData.serialNumber}
                        onChange={e => setFormData({ ...formData, serialNumber: e.target.value.toUpperCase() })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>

                  <hr className="border-slate-100 my-1" />
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1"><User size={14} /> KHÁCH HÀNG</h4>
                  
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Tên khách hàng sở hữu *</label>
                      <input 
                        type="text" 
                        value={formData.ownerName}
                        onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
                      <input 
                        type="email" 
                        value={formData.ownerEmail}
                        onChange={e => setFormData({ ...formData, ownerEmail: e.target.value })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <hr className="border-slate-100 my-1" />
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1"><ShieldCheck size={14} /> CHÍNH SÁCH BẢO HÀNH</h4>

                  <div className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Tên chính sách bảo hành</label>
                      <input 
                        type="text" 
                        value={formData.policyName}
                        onChange={e => setFormData({ ...formData, policyName: e.target.value })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Thời hạn (Tháng)</label>
                        <input 
                          type="number" 
                          value={formData.durationMonths}
                          onChange={e => setFormData({ ...formData, durationMonths: parseInt(e.target.value) || 0 })}
                          disabled={drawerMode === 'VIEW'}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Trạng thái bảo hành</label>
                        <select
                          value={formData.status}
                          onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                          disabled={drawerMode === 'VIEW'}
                          className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm"
                        >
                          <option value="ACTIVE">Đang bảo hành</option>
                          <option value="INACTIVE">Chưa kích hoạt</option>
                          <option value="EXPIRED">Đã hết hạn</option>
                          <option value="CLAIMED">Yêu cầu bảo hành</option>
                          <option value="RESOLVED">Giải quyết xong</option>
                          <option value="REJECTED">Từ chối bảo hành</option>
                          <option value="CANCELLED">Đã hủy</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1"><Calendar size={12} /> Ngày bắt đầu</label>
                        <input 
                          type="date" 
                          value={formData.startDate}
                          onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                          disabled={drawerMode === 'VIEW'}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1"><Calendar size={12} /> Ngày kết thúc</label>
                        <input 
                          type="date" 
                          value={formData.endDate}
                          onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                          disabled={drawerMode === 'VIEW'}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Số Hóa Đơn mua hàng</label>
                      <input 
                        type="text" 
                        value={formData.invoiceNumber}
                        onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Ghi chú</label>
                      <textarea 
                        value={formData.note}
                        onChange={e => setFormData({ ...formData, note: e.target.value })}
                        disabled={drawerMode === 'VIEW'}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
              <Button variant="secondary" onClick={() => setIsDrawerOpen(false)} className="rounded-xl px-4 text-xs font-semibold cursor-pointer">
                {drawerMode === 'VIEW' ? 'Đóng' : 'Hủy'}
              </Button>
              {drawerMode !== 'VIEW' && (
                <Button onClick={handleSubmitForm} className="rounded-xl px-4 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer">
                  {drawerMode === 'CREATE' ? 'Kích hoạt bảo hành' : drawerMode === 'PROCESS_CLAIM' ? 'Xác nhận xử lý' : 'Lưu'}
                </Button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
