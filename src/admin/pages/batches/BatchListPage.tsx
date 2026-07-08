import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, RotateCw, Eye, Edit3, X, AlertCircle, 
  Calendar, MapPin, Truck, HelpCircle, Inbox, Tag, AlertTriangle, Layers, Download,
  ArrowUpRight, Activity, Trash2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

import { AdminBatchListPageBatch as Batch } from '@shared/types/domain';

export default function BatchListPage({ onNavigate }: { onNavigate: (tabId: string) => void }) {
  const [demoState, setDemoState] = useState<'NORMAL' | 'LOADING' | 'EMPTY' | 'ERROR'>('NORMAL');
  const [activeKpiFilter, setActiveKpiFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'RECALLED' | 'BLOCKED'>('ALL');

  const [batches, setBatches] = useState<Batch[]>([
    {
      id: 'b-1',
      variantId: 'v-1',
      variantName: 'Máy lọc nước RO Kangaroo VT3',
      batchCode: 'BATCH-2026-KG01',
      manufactureDate: '2026-01-10',
      expiryDate: '2029-01-10',
      importedAt: '2026-01-15 08:30',
      manufacturerName: 'Kangaroo Group JSC',
      supplierName: 'Kangaroo Logistics',
      originCountry: 'Việt Nam',
      productionPlace: 'KCN Từ Liêm, Hà Nội, Việt Nam',
      quantity: 500,
      status: 'ACTIVE',
      createdAt: '2026-01-15',
      updatedAt: '2026-06-25 10:00'
    },
    {
      id: 'b-2',
      variantId: 'v-2',
      variantName: 'Tấm pin năng lượng mặt trời JA Solar 450W',
      batchCode: 'BATCH-2026-JA05',
      manufactureDate: '2025-11-20',
      expiryDate: '2040-11-20',
      importedAt: '2026-02-01 10:15',
      manufacturerName: 'JA Solar Co., Ltd.',
      supplierName: 'GreenEnergy Imp-Exp',
      originCountry: 'Trung Quốc',
      productionPlace: 'Shanghai Industry Zone, China',
      quantity: 1200,
      status: 'ACTIVE',
      createdAt: '2026-02-01',
      updatedAt: '2026-06-24 11:30'
    },
    {
      id: 'b-3',
      variantId: 'v-3',
      variantName: 'Sơn chống thấm Spec Damp-proof 5L',
      batchCode: 'BATCH-2026-SP12',
      manufactureDate: '2025-05-15',
      expiryDate: '2026-05-15',
      importedAt: '2025-06-01 14:00',
      manufacturerName: '4Oranges Co., Ltd.',
      supplierName: 'Spec Distribution North',
      originCountry: 'Việt Nam',
      productionPlace: 'KCN Long An, Việt Nam',
      quantity: 800,
      status: 'EXPIRED',
      createdAt: '2025-06-01',
      updatedAt: '2026-05-15 00:00'
    },
    {
      id: 'b-4',
      variantId: 'v-4',
      variantName: 'Thực phẩm chức năng Omega-3 Premium',
      batchCode: 'BATCH-2025-OM88',
      manufactureDate: '2024-10-10',
      expiryDate: '2026-10-10',
      importedAt: '2024-11-05 09:00',
      manufacturerName: 'Nordic Pharma Group',
      supplierName: 'PharmaTrade JSC',
      originCountry: 'Na Uy',
      productionPlace: 'Oslo Biotech Valley, Norway',
      quantity: 2000,
      status: 'RECALLED',
      createdAt: '2024-11-05',
      updatedAt: '2026-04-12 15:30'
    },
    {
      id: 'b-5',
      variantId: 'v-5',
      variantName: 'Sữa bột dinh dưỡng Alpha Gold 900g',
      batchCode: 'BATCH-2026-AG09',
      manufactureDate: '2026-02-14',
      expiryDate: '2028-02-14',
      importedAt: '2026-03-01 07:45',
      manufacturerName: 'Fonterra Co-operative Group',
      supplierName: 'NewMilk Vietnam',
      originCountry: 'New Zealand',
      productionPlace: 'Auckland, New Zealand',
      quantity: 1500,
      status: 'BLOCKED',
      createdAt: '2026-03-01',
      updatedAt: '2026-05-20 09:15'
    }
  ]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterOrigin, setFilterOrigin] = useState<string>('ALL');
  
  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'CREATE' | 'EDIT' | 'VIEW' | 'EXPORT' | 'TRACE'>('CREATE');
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    batchCode: '',
    variantName: 'Máy lọc nước RO Kangaroo VT3',
    quantity: 100,
    manufactureDate: '',
    expiryDate: '',
    manufacturerName: '',
    supplierName: '',
    originCountry: 'Việt Nam',
    productionPlace: '',
    status: 'ACTIVE' as any
  });
  
  // Export Form data
  const [exportData, setExportData] = useState({
    batchId: '',
    destinationLocation: 'Showroom Điện Máy Cầu Giấy',
    quantity: 50,
    operatorName: 'Nguyễn Văn Kho',
    notes: ''
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const total = batches.length + 86; // simulated total
    const active = batches.filter(b => b.status === 'ACTIVE').length + 75;
    const expired = batches.filter(b => b.status === 'EXPIRED').length + 5;
    const recalled = batches.filter(b => b.status === 'RECALLED').length + 3;
    const blocked = batches.filter(b => b.status === 'BLOCKED').length + 3;
    return { total, active, expired, recalled, blocked };
  }, [batches]);

  // Filtered batches
  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchCode = b.batchCode.toLowerCase().includes(query);
        const matchName = b.variantName.toLowerCase().includes(query);
        const matchOrigin = b.originCountry.toLowerCase().includes(query);
        if (!matchCode && !matchName && !matchOrigin) return false;
      }
      if (filterStatus !== 'ALL' && b.status !== filterStatus) return false;
      if (filterOrigin !== 'ALL' && b.originCountry !== filterOrigin) return false;
      if (activeKpiFilter !== 'ALL' && b.status !== activeKpiFilter) return false;
      return true;
    });
  }, [batches, searchTerm, filterStatus, filterOrigin, activeKpiFilter]);

  // Unique origins for filter dropdown
  const origins = useMemo(() => {
    return Array.from(new Set(batches.map(b => b.originCountry)));
  }, [batches]);

  const handleOpenCreate = () => {
    setDrawerMode('CREATE');
    setFormData({
      batchCode: 'BATCH-2026-NEW' + Math.floor(Math.random() * 1000),
      variantName: 'Máy lọc nước RO Kangaroo VT3',
      quantity: 250,
      manufactureDate: new Date().toISOString().substring(0, 10),
      expiryDate: new Date(Date.now() + 365*24*60*60*1000*3).toISOString().substring(0, 10), // 3 years
      manufacturerName: 'Kangaroo Group JSC',
      supplierName: 'Kangaroo Logistics',
      originCountry: 'Việt Nam',
      productionPlace: 'Hà Nội, Việt Nam',
      status: 'ACTIVE'
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleOpenExport = () => {
    setDrawerMode('EXPORT');
    setExportData({
      batchId: batches[0]?.id || '',
      destinationLocation: 'Showroom Điện Máy Cầu Giấy',
      quantity: 50,
      operatorName: 'Nguyễn Văn Kho',
      notes: ''
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (batch: Batch, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDrawerMode('EDIT');
    setSelectedBatch(batch);
    setFormData({
      batchCode: batch.batchCode,
      variantName: batch.variantName,
      quantity: batch.quantity,
      manufactureDate: batch.manufactureDate,
      expiryDate: batch.expiryDate,
      manufacturerName: batch.manufacturerName,
      supplierName: batch.supplierName,
      originCountry: batch.originCountry,
      productionPlace: batch.productionPlace,
      status: batch.status
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleOpenTrace = (batch: Batch, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDrawerMode('TRACE');
    setSelectedBatch(batch);
    setIsDrawerOpen(true);
  };

  const handleOpenView = (batch: Batch) => {
    setDrawerMode('VIEW');
    setSelectedBatch(batch);
    setIsDrawerOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (drawerMode === 'EXPORT') {
      const selectedId = exportData.batchId;
      const targetBatch = batches.find(b => b.id === selectedId);
      if (!targetBatch) {
        setFormError('Lô hàng xuất không hợp lệ');
        return;
      }
      if (exportData.quantity <= 0) {
        setFormError('Số lượng xuất phải lớn hơn 0');
        return;
      }
      if (targetBatch.quantity < exportData.quantity) {
        setFormError(`Số lượng xuất vượt quá số lượng hiện có của lô hàng (Tối đa ${targetBatch.quantity} sản phẩm)`);
        return;
      }

      // Deduct from batch
      setBatches(batches.map(b => b.id === selectedId ? {
        ...b,
        quantity: b.quantity - exportData.quantity,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      } : b));

      setIsDrawerOpen(false);
      alert(`Đã xuất thành công ${exportData.quantity} sản phẩm từ lô hàng ${targetBatch.batchCode} đến địa điểm ${exportData.destinationLocation}!`);
      return;
    }

    if (!formData.batchCode.trim()) {
      setFormError('Mã lô hàng là bắt buộc');
      return;
    }
    if (formData.quantity <= 0) {
      setFormError('Số lượng nhập phải lớn hơn 0');
      return;
    }

    if (drawerMode === 'CREATE') {
      const isDuplicate = batches.some(b => b.batchCode.toUpperCase() === formData.batchCode.toUpperCase());
      if (isDuplicate) {
        setFormError('Mã lô hàng này đã tồn tại trong hệ thống');
        return;
      }

      const newBatch: Batch = {
        id: 'b-' + Date.now(),
        variantId: 'v-new',
        variantName: formData.variantName,
        batchCode: formData.batchCode.toUpperCase(),
        manufactureDate: formData.manufactureDate,
        expiryDate: formData.expiryDate,
        importedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        manufacturerName: formData.manufacturerName,
        supplierName: formData.supplierName,
        originCountry: formData.originCountry,
        productionPlace: formData.productionPlace,
        quantity: formData.quantity,
        status: formData.status,
        createdAt: new Date().toISOString().substring(0, 10),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setBatches([newBatch, ...batches]);
    } else if (drawerMode === 'EDIT' && selectedBatch) {
      setBatches(batches.map(b => b.id === selectedBatch.id ? {
        ...b,
        batchCode: formData.batchCode.toUpperCase(),
        quantity: formData.quantity,
        manufactureDate: formData.manufactureDate,
        expiryDate: formData.expiryDate,
        manufacturerName: formData.manufacturerName,
        supplierName: formData.supplierName,
        originCountry: formData.originCountry,
        productionPlace: formData.productionPlace,
        status: formData.status,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      } : b));
    }
    setIsDrawerOpen(false);
  };

  const renderStatusBadge = (status: 'ACTIVE' | 'EXPIRED' | 'RECALLED' | 'BLOCKED') => {
    const config = {
      ACTIVE: { bg: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', label: 'Đang hoạt động' },
      EXPIRED: { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', label: 'Hết hạn sử dụng' },
      RECALLED: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Đã thu hồi' },
      BLOCKED: { bg: 'bg-slate-100 text-slate-600 border-slate-300', dot: 'bg-slate-400', label: 'Bị khóa' }
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
            Batch Management
            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-semibold uppercase">
              Role: Warehouse Staff / Admin
            </span>
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý lô hàng nhập kho, xuất xứ nguồn gốc và số lượng sản phẩm.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleOpenExport} 
            className="rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
          >
            <ArrowUpRight size={16} /> Xuất lô hàng
          </Button>
          <Button 
            onClick={handleOpenCreate} 
            className="rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
          >
            <Plus size={16} /> Nhập lô hàng
          </Button>
        </div>
      </div>

      {demoState === 'ERROR' ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto mt-12">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Không thể tải dữ liệu lô hàng</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">Đã xảy ra lỗi hệ thống khi tải danh sách lô hàng.</p>
          <Button onClick={() => setDemoState('NORMAL')} className="mt-6 rounded-xl px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Thử lại</Button>
        </Card>
      ) : demoState === 'LOADING' ? (
        renderSkeleton()
      ) : (
        <>
          {/* Section 1: KPI Cards */}
          <div className="grid grid-cols-4 gap-6">
            {[
              { id: 'ALL', label: 'Tổng số lô hàng', value: stats.total, color: 'text-slate-900' },
              { id: 'ACTIVE', label: 'Đang lưu hành', value: stats.active, color: 'text-green-600' },
              { id: 'EXPIRED', label: 'Lô hết hạn', value: stats.expired, color: 'text-red-500' },
              { id: 'RECALLED', label: 'Đã thu hồi / Khóa', value: stats.recalled + stats.blocked, color: 'text-amber-500' }
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

          {/* Section 2: Search & Filter */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-70">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm lô hàng theo mã, sản phẩm, xuất xứ..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"><X size={14} /></button>
                )}
              </div>

              {/* Filter Status */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Trạng thái:</span>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 cursor-pointer"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="EXPIRED">Hết hạn</option>
                  <option value="RECALLED">Thu hồi</option>
                  <option value="BLOCKED">Bị khóa</option>
                </select>
              </div>

              {/* Filter Origin */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Xuất xứ:</span>
                <select 
                  value={filterOrigin}
                  onChange={(e) => setFilterOrigin(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 cursor-pointer"
                >
                  <option value="ALL">Tất cả quốc gia</option>
                  {origins.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            {(searchTerm || filterStatus !== 'ALL' || filterOrigin !== 'ALL' || activeKpiFilter !== 'ALL') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('ALL');
                  setFilterOrigin('ALL');
                  setActiveKpiFilter('ALL');
                }}
                className="text-xs font-semibold text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Section 3: Batch Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {demoState === 'EMPTY' || filteredBatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white">
                <Inbox size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Không tìm thấy lô hàng</h3>
                <p className="text-slate-500 text-sm max-w-sm mt-1">Vui lòng điều chỉnh bộ lọc hoặc tạo lô hàng mới đầu tiên.</p>
                <Button onClick={handleOpenCreate} className="mt-6 bg-blue-600 text-white rounded-xl px-4 py-2 font-semibold hover:bg-blue-700 cursor-pointer">Nhập lô hàng</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm table-fixed border-collapse">
                  <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/75 border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 pl-5 font-bold tracking-wider w-[18%]">Mã Lô Hàng</th>
                      <th className="p-3.5 font-bold tracking-wider w-[24%]">Sản phẩm</th>
                      <th className="p-3.5 font-bold tracking-wider w-[10%] text-center">Số lượng</th>
                      <th className="p-3.5 font-bold tracking-wider w-[12%] text-center">NSX</th>
                      <th className="p-3.5 font-bold tracking-wider w-[12%] text-center">HSD</th>
                      <th className="p-3.5 font-bold tracking-wider w-[12%]">Xuất xứ</th>
                      <th className="p-3.5 font-bold tracking-wider w-[15%] text-center">Trạng thái</th>
                      <th className="p-3.5 pr-5 font-bold tracking-wider w-[10%] text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBatches.map(batch => (
                      <tr 
                        key={batch.id} 
                        onClick={() => handleOpenView(batch)}
                        className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
                      >
                        <td className="p-3.5 pl-5 font-mono font-bold text-slate-800 truncate flex items-center gap-2">
                          {batch.batchCode}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-900 truncate">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-slate-100 rounded text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 shrink-0">
                              <Layers size={14} />
                            </div>
                            <span className="truncate">{batch.variantName}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-center font-semibold text-slate-700">{batch.quantity.toLocaleString()}</td>
                        <td className="p-3.5 text-center text-slate-500 text-xs">{batch.manufactureDate}</td>
                        <td className="p-3.5 text-center text-slate-500 text-xs">{batch.expiryDate}</td>
                        <td className="p-3.5 text-slate-600 truncate">{batch.originCountry}</td>
                        <td className="p-3.5 text-center" onClick={e => e.stopPropagation()}>{renderStatusBadge(batch.status)}</td>
                        <td className="p-3.5 pr-5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-end gap-1">
                            <button 
                              onClick={(e) => handleOpenTrace(batch, e)}
                              className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg cursor-pointer border-none bg-transparent"
                              title="Truy xuất nguồn gốc"
                            >
                              <Activity size={15} />
                            </button>
                            <button 
                              onClick={() => handleOpenEdit(batch)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer border-none bg-transparent"
                              title="Sửa lô hàng"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button 
                              onClick={() => handleOpenView(batch)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer border-none bg-transparent"
                              title="Xem chi tiết"
                            >
                              <Eye size={15} />
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
          <div className="relative bg-white w-125 max-h-[90vh] rounded-2xl shadow-2xl flex flex-col justify-between z-10 overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {drawerMode === 'CREATE' ? 'Nhập lô hàng mới' : drawerMode === 'EDIT' ? 'Cập nhật lô hàng' : drawerMode === 'EXPORT' ? 'Xuất lô hàng' : drawerMode === 'TRACE' ? 'Truy xuất nguồn gốc' : 'Chi tiết lô hàng'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {drawerMode === 'EXPORT' ? 'Xuất sản phẩm từ lô hàng đến đại lý hoặc cửa hàng phân phối.' : drawerMode === 'TRACE' ? `Lịch sử sự kiện của lô hàng ${selectedBatch?.batchCode}` : 'Thông tin quản lý và phân phối lô hàng trong hệ thống.'}
                </p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg border-none bg-transparent cursor-pointer"><X size={18} /></button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2"><AlertCircle size={16} />{formError}</div>
              )}

              {drawerMode === 'EXPORT' ? (
                // Export Form Fields
                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Lô hàng xuất *</label>
                    <select
                      value={exportData.batchId}
                      onChange={e => setExportData({ ...exportData, batchId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm cursor-pointer"
                    >
                      {batches.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.batchCode} ({b.variantName} - Còn {b.quantity} chiếc)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Địa điểm xuất đến *</label>
                    <select
                      value={exportData.destinationLocation}
                      onChange={e => setExportData({ ...exportData, destinationLocation: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm cursor-pointer"
                    >
                      <option value="Showroom Điện Máy Cầu Giấy">Showroom Điện Máy Cầu Giấy (ST-CG-02)</option>
                      <option value="Đại lý phân phối Solar Sài Gòn">Đại lý phân phối Solar Sài Gòn (DL-HCM-05)</option>
                      <option value="Trung tâm bảo hành miền Trung">Trung tâm bảo hành miền Trung (WC-DN-01)</option>
                      <option value="Kho Bình Dương - KCN Sóng Thần">Kho Bình Dương - KCN Sóng Thần (WH-BD-02)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Số lượng xuất *</label>
                    <input 
                      type="number" 
                      value={exportData.quantity}
                      onChange={e => setExportData({ ...exportData, quantity: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Người thực hiện xuất *</label>
                    <input 
                      type="text" 
                      value={exportData.operatorName}
                      onChange={e => setExportData({ ...exportData, operatorName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Ghi chú xuất lô</label>
                    <textarea 
                      value={exportData.notes}
                      onChange={e => setExportData({ ...exportData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      placeholder="Mục đích xuất lô hàng..."
                    />
                  </div>
                </div>
              ) : drawerMode === 'TRACE' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-xs text-slate-500 font-semibold mb-2">Thông tin lô hàng:</p>
                    <p className="text-sm font-bold text-slate-900">{selectedBatch?.variantName}</p>
                    <p className="text-xs text-slate-600 font-mono">Mã lô: {selectedBatch?.batchCode}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lịch sử sự kiện:</p>
                    <div className="border-l-2 border-slate-200 pl-4 space-y-4">
                      {[
                        { event: 'Nhập kho', detail: 'Sản phẩm được nhập vào kho tổng.', date: '2026-06-01' },
                        { event: 'Kiểm tra chất lượng', detail: 'Đạt chuẩn kiểm định.', date: '2026-06-05' }
                      ].map((ev, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                          <p className="text-sm font-semibold text-slate-900">{ev.event}</p>
                          <p className="text-xs text-slate-500">{ev.detail}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{ev.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Standard Import Form Fields
                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Mã Lô Hàng *</label>
                    <input 
                      type="text" 
                      value={formData.batchCode}
                      onChange={e => setFormData({ ...formData, batchCode: e.target.value.toUpperCase() })}
                      disabled={drawerMode === 'VIEW'}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:border-blue-500 focus:outline-none"
                      placeholder="BATCH-2026-XXXX"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Sản phẩm biến thể</label>
                    <select
                      value={formData.variantName}
                      onChange={e => setFormData({ ...formData, variantName: e.target.value })}
                      disabled={drawerMode === 'VIEW'}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm"
                    >
                      <option value="Máy lọc nước RO Kangaroo VT3">Máy lọc nước RO Kangaroo VT3</option>
                      <option value="Tấm pin năng lượng mặt trời JA Solar 450W">Tấm pin năng lượng mặt trời JA Solar 450W</option>
                      <option value="Sơn chống thấm Spec Damp-proof 5L">Sơn chống thấm Spec Damp-proof 5L</option>
                      <option value="Thực phẩm chức năng Omega-3 Premium">Thực phẩm chức năng Omega-3 Premium</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Số lượng nhập *</label>
                      <input 
                        type="number" 
                        value={formData.quantity}
                        onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Trạng thái</label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm"
                      >
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="EXPIRED">Hết hạn</option>
                        <option value="RECALLED">Đã thu hồi</option>
                        <option value="BLOCKED">Bị khóa</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1 items-center gap-1"><Calendar size={12} /> Ngày sản xuất</label>
                      <input 
                        type="date" 
                        value={formData.manufactureDate}
                        onChange={e => setFormData({ ...formData, manufactureDate: e.target.value })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1"><Calendar size={12} /> Hạn sử dụng</label>
                      <input 
                        type="date" 
                        value={formData.expiryDate}
                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Quốc gia xuất xứ</label>
                      <input 
                        type="text" 
                        value={formData.originCountry}
                        onChange={e => setFormData({ ...formData, originCountry: e.target.value })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="Việt Nam"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Nhà sản xuất</label>
                      <input 
                        type="text" 
                        value={formData.manufacturerName}
                        onChange={e => setFormData({ ...formData, manufacturerName: e.target.value })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="Tên nhà máy"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1 items-center gap-1"><MapPin size={12} /> Địa chỉ sản xuất</label>
                    <input 
                      type="text" 
                      value={formData.productionPlace}
                      onChange={e => setFormData({ ...formData, productionPlace: e.target.value })}
                      disabled={drawerMode === 'VIEW'}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      placeholder="Địa chỉ chi tiết nhà máy"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1 items-center gap-1"><Truck size={12} /> Nhà cung cấp / Logistics</label>
                    <input 
                      type="text" 
                      value={formData.supplierName}
                      onChange={e => setFormData({ ...formData, supplierName: e.target.value })}
                      disabled={drawerMode === 'VIEW'}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      placeholder="Tên đơn vị vận chuyển/cung cấp"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
              <Button variant="secondary" onClick={() => setIsDrawerOpen(false)} className="rounded-xl px-4 text-xs font-semibold cursor-pointer">
                {drawerMode === 'VIEW' ? 'Đóng' : 'Hủy'}
              </Button>
              {drawerMode !== 'VIEW' && drawerMode !== 'TRACE' && (
                <Button onClick={handleSubmitForm} className="rounded-xl px-4 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer">
                  {drawerMode === 'CREATE' ? 'Nhập lô hàng' : drawerMode === 'EXPORT' ? 'Xuất lô hàng' : 'Lưu thay đổi'}
                </Button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
