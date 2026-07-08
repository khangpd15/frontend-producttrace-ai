import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, RotateCw, Eye, Edit3, X, AlertCircle, 
  User, Calendar, MapPin, Receipt, ArrowLeftRight, HelpCircle, Inbox, Layers, ClipboardList, Trash2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

import { AdminOwnership as Ownership } from '@shared/types/domain';

export default function OwnershipListPage({ onNavigate }: { onNavigate: (tabId: string) => void }) {
  const [demoState, setDemoState] = useState<'NORMAL' | 'LOADING' | 'EMPTY' | 'ERROR'>('NORMAL');
  const [activeKpiFilter, setActiveKpiFilter] = useState<'ALL' | 'ACTIVE' | 'TRANSFERRED' | 'REVOKED'>('ALL');

  const [ownerships, setOwnerships] = useState<Ownership[]>([
    {
      id: 'o-1',
      itemCode: 'ITEM-RO-KNG00125',
      itemName: 'Máy lọc nước RO Kangaroo VT3',
      serialNumber: 'SN-KG-889021',
      ownerName: 'Nguyễn Văn A',
      ownerEmail: 'nguyenvana@gmail.com',
      status: 'ACTIVE',
      ownershipType: 'PRIMARY',
      ownedAt: '2026-02-15 14:30',
      purchaseDate: '2026-02-15',
      purchaseLocation: 'Điện Máy Xanh Cầu Giấy',
      invoiceNumber: 'INV-2026-00918',
      createdAt: '2026-02-15',
      updatedAt: '2026-02-15 14:30'
    },
    {
      id: 'o-2',
      itemCode: 'ITEM-SP-JA450-0988',
      itemName: 'Tấm pin mặt trời JA Solar 450W',
      serialNumber: 'SN-JA-321104',
      ownerName: 'Trần Thị B',
      ownerEmail: 'tranthib@hotmail.com',
      status: 'ACTIVE',
      ownershipType: 'PRIMARY',
      ownedAt: '2026-03-10 09:15',
      purchaseDate: '2026-03-08',
      purchaseLocation: 'SolarPower Dealer Thanh Xuân',
      invoiceNumber: 'INV-2026-01254',
      createdAt: '2026-03-10',
      updatedAt: '2026-03-10 09:15'
    },
    {
      id: 'o-3',
      itemCode: 'ITEM-SN-SPEC-77312',
      itemName: 'Sơn chống thấm Spec Damp-proof 5L',
      serialNumber: 'SN-SP-400981',
      ownerName: 'Lê Hoàng C',
      ownerEmail: 'lehoangc@yahoo.com',
      status: 'TRANSFERRED',
      ownershipType: 'TRANSFERRED',
      ownedAt: '2026-04-20 16:00',
      purchaseDate: '2025-12-15',
      purchaseLocation: 'Đại lý Vật liệu xây dựng Hùng Cường',
      invoiceNumber: 'INV-2025-10492',
      createdAt: '2025-12-15',
      updatedAt: '2026-04-20 16:00'
    },
    {
      id: 'o-4',
      itemCode: 'ITEM-OM-PRE-882190',
      itemName: 'Omega-3 Premium Nordic',
      serialNumber: 'SN-OM-771120',
      ownerName: 'Phạm Minh D',
      ownerEmail: 'phamminhd@gmail.com',
      status: 'REVOKED',
      ownershipType: 'PRIMARY',
      ownedAt: '2026-01-05 11:20',
      purchaseDate: '2026-01-05',
      purchaseLocation: 'Pharmacity Nguyễn Trãi',
      invoiceNumber: 'INV-2026-00041',
      createdAt: '2026-01-05',
      updatedAt: '2026-05-18 10:00'
    }
  ]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'CREATE' | 'EDIT' | 'VIEW' | 'TRANSFER'>('CREATE');
  const [selectedOwnership, setSelectedOwnership] = useState<Ownership | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    itemCode: '',
    itemName: 'Máy lọc nước RO Kangaroo VT3',
    serialNumber: '',
    ownerName: '',
    ownerEmail: '',
    ownershipType: 'PRIMARY' as any,
    purchaseDate: '',
    purchaseLocation: '',
    invoiceNumber: '',
    status: 'ACTIVE' as any
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Transfer Form state
  const [transferData, setTransferData] = useState({
    newOwnerName: '',
    newOwnerEmail: '',
    transferNote: ''
  });

  // Stats
  const stats = useMemo(() => {
    const total = ownerships.length + 1242;
    const active = ownerships.filter(o => o.status === 'ACTIVE').length + 1150;
    const transferred = ownerships.filter(o => o.status === 'TRANSFERRED').length + 80;
    const revoked = ownerships.filter(o => o.status === 'REVOKED').length + 12;
    return { total, active, transferred, revoked };
  }, [ownerships]);

  // Filtered ownerships
  const filteredOwnerships = useMemo(() => {
    return ownerships.filter(o => {
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchCode = o.itemCode.toLowerCase().includes(query);
        const matchSerial = o.serialNumber.toLowerCase().includes(query);
        const matchOwner = o.ownerName.toLowerCase().includes(query) || o.ownerEmail.toLowerCase().includes(query);
        if (!matchCode && !matchSerial && !matchOwner) return false;
      }
      if (filterType !== 'ALL' && o.ownershipType !== filterType) return false;
      if (filterStatus !== 'ALL' && o.status !== filterStatus) return false;
      if (activeKpiFilter !== 'ALL' && o.status !== activeKpiFilter) return false;
      return true;
    });
  }, [ownerships, searchTerm, filterType, filterStatus, activeKpiFilter]);

  const handleOpenCreate = () => {
    setDrawerMode('CREATE');
    setFormData({
      itemCode: 'ITEM-RO-KG' + Math.floor(100000 + Math.random() * 900000),
      itemName: 'Máy lọc nước RO Kangaroo VT3',
      serialNumber: 'SN-KG-' + Math.floor(100000 + Math.random() * 900000),
      ownerName: '',
      ownerEmail: '',
      ownershipType: 'PRIMARY',
      purchaseDate: new Date().toISOString().substring(0, 10),
      purchaseLocation: 'Điện Máy Xanh Cầu Giấy',
      invoiceNumber: 'INV-2026-' + Math.floor(10000 + Math.random() * 90000),
      status: 'ACTIVE'
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleOpenTransfer = (ownership: Ownership, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDrawerMode('TRANSFER');
    setSelectedOwnership(ownership);
    setTransferData({
      newOwnerName: '',
      newOwnerEmail: '',
      transferNote: ''
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleOpenView = (ownership: Ownership) => {
    setDrawerMode('VIEW');
    setSelectedOwnership(ownership);
    setIsDrawerOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (drawerMode === 'TRANSFER' && selectedOwnership) {
      if (!transferData.newOwnerName.trim() || !transferData.newOwnerEmail.trim()) {
        setFormError('Vui lòng nhập đầy đủ tên và email của người sở hữu mới');
        return;
      }

      // Transfer logic: Update selected ownership status to TRANSFERRED
      // And create a new ownership record with the new owner
      const updatedList = ownerships.map(o => {
        if (o.id === selectedOwnership.id) {
          return {
            ...o,
            status: 'TRANSFERRED' as const,
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
        }
        return o;
      });

      const newRecord: Ownership = {
        id: 'o-' + Date.now(),
        itemCode: selectedOwnership.itemCode,
        itemName: selectedOwnership.itemName,
        serialNumber: selectedOwnership.serialNumber,
        ownerName: transferData.newOwnerName.trim(),
        ownerEmail: transferData.newOwnerEmail.trim(),
        status: 'ACTIVE',
        ownershipType: 'TRANSFERRED',
        ownedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        purchaseDate: selectedOwnership.purchaseDate,
        purchaseLocation: selectedOwnership.purchaseLocation,
        invoiceNumber: selectedOwnership.invoiceNumber,
        createdAt: new Date().toISOString().substring(0, 10),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      setOwnerships([newRecord, ...updatedList]);
      setIsDrawerOpen(false);
      return;
    }

    // Create logic
    if (!formData.ownerName.trim() || !formData.ownerEmail.trim()) {
      setFormError('Thông tin khách hàng sở hữu là bắt buộc');
      return;
    }

    if (drawerMode === 'CREATE') {
      const newOwnership: Ownership = {
        id: 'o-' + Date.now(),
        itemCode: formData.itemCode.toUpperCase(),
        itemName: formData.itemName,
        serialNumber: formData.serialNumber.toUpperCase(),
        ownerName: formData.ownerName.trim(),
        ownerEmail: formData.ownerEmail.trim(),
        status: formData.status,
        ownershipType: formData.ownershipType,
        ownedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        purchaseDate: formData.purchaseDate,
        purchaseLocation: formData.purchaseLocation,
        invoiceNumber: formData.invoiceNumber.toUpperCase(),
        createdAt: new Date().toISOString().substring(0, 10),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setOwnerships([newOwnership, ...ownerships]);
    }
    setIsDrawerOpen(false);
  };

  const renderStatusBadge = (status: 'ACTIVE' | 'TRANSFERRED' | 'REVOKED') => {
    const config = {
      ACTIVE: { bg: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', label: 'Đang sở hữu' },
      TRANSFERRED: { bg: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-400', label: 'Đã chuyển nhượng' },
      REVOKED: { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', label: 'Bị thu hồi' }
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
            Ownership Management
            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-semibold uppercase">
              Role: Admin / Dealer
            </span>
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý quyền sở hữu sản phẩm của khách hàng, lịch sử chuyển nhượng và thông tin mua hàng.
          </p>
        </div>
        <Button 
          onClick={handleOpenCreate} 
          className="rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
        >
          <Plus size={16} /> Đăng ký sở hữu
        </Button>
      </div>

      {demoState === 'ERROR' ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto mt-12">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Không thể tải dữ liệu sở hữu</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">Đã xảy ra lỗi hệ thống khi tải lịch sử sở hữu.</p>
          <Button onClick={() => setDemoState('NORMAL')} className="mt-6 rounded-xl px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Thử lại</Button>
        </Card>
      ) : demoState === 'LOADING' ? (
        renderSkeleton()
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6">
            {[
              { id: 'ALL', label: 'Tổng lượt sở hữu', value: stats.total, color: 'text-slate-900' },
              { id: 'ACTIVE', label: 'Đang kích hoạt', value: stats.active, color: 'text-green-600' },
              { id: 'TRANSFERRED', label: 'Đã chuyển nhượng', value: stats.transferred, color: 'text-slate-500' },
              { id: 'REVOKED', label: 'Bị thu hồi', value: stats.revoked, color: 'text-red-500' }
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
                  placeholder="Tìm theo Serial, mã SP hoặc tên chủ sở hữu..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"><X size={14} /></button>
                )}
              </div>

              {/* Ownership Type */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Loại sở hữu:</span>
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 cursor-pointer"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="PRIMARY">Sở hữu đầu (Primary)</option>
                  <option value="TRANSFERRED">Nhận chuyển nhượng</option>
                </select>
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
                  <option value="ACTIVE">Đang sở hữu</option>
                  <option value="TRANSFERRED">Đã chuyển nhượng</option>
                  <option value="REVOKED">Bị thu hồi</option>
                </select>
              </div>
            </div>

            {(searchTerm || filterType !== 'ALL' || filterStatus !== 'ALL' || activeKpiFilter !== 'ALL') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('ALL');
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
            {demoState === 'EMPTY' || filteredOwnerships.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white">
                <Inbox size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Không tìm thấy bản ghi</h3>
                <p className="text-slate-500 text-sm max-w-sm mt-1">Chưa có ai đăng ký sở hữu thiết bị hoặc bộ lọc không đúng.</p>
                <Button onClick={handleOpenCreate} className="mt-6 bg-blue-600 text-white rounded-xl px-4 py-2 font-semibold hover:bg-blue-700 cursor-pointer">Đăng ký sở hữu</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm table-fixed border-collapse">
                  <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/75 border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 pl-5 font-bold tracking-wider w-[18%]">Mã Sản Phẩm / Serial</th>
                      <th className="p-3.5 font-bold tracking-wider w-[22%]">Sản phẩm</th>
                      <th className="p-3.5 font-bold tracking-wider w-[20%]">Chủ sở hữu</th>
                      <th className="p-3.5 font-bold tracking-wider w-[12%]">Loại</th>
                      <th className="p-3.5 font-bold tracking-wider w-[12%]">Kích hoạt</th>
                      <th className="p-3.5 font-bold tracking-wider w-[16%] text-center">Trạng thái</th>
                      <th className="p-3.5 pr-5 font-bold tracking-wider w-[12%] text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOwnerships.map(o => (
                      <tr 
                        key={o.id} 
                        onClick={() => handleOpenView(o)}
                        className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
                      >
                        <td className="p-3.5 pl-5 truncate">
                          <div className="font-mono text-xs text-slate-500 font-semibold">{o.itemCode}</div>
                          <div className="font-mono text-[10px] text-slate-400">{o.serialNumber}</div>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-900 truncate">{o.itemName}</td>
                        <td className="p-3.5 truncate">
                          <div className="font-semibold text-slate-800 text-xs flex items-center gap-1"><User size={12} className="text-slate-400" /> {o.ownerName}</div>
                          <div className="text-[10px] text-slate-400">{o.ownerEmail}</div>
                        </td>
                        <td className="p-3.5">
                          {o.ownershipType === 'PRIMARY' ? (
                            <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded font-semibold">Đầu tiên</span>
                          ) : (
                            <span className="text-[10px] bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded font-semibold">Chuyển nhượng</span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-500 text-xs">{o.ownedAt.split(' ')[0]}</td>
                        <td className="p-3.5 text-center" onClick={e => e.stopPropagation()}>{renderStatusBadge(o.status)}</td>
                        <td className="p-3.5 pr-5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-end gap-1">
                            {o.status === 'ACTIVE' && (
                              <button 
                                onClick={(e) => handleOpenTransfer(o, e)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer border-none bg-transparent"
                                title="Chuyển nhượng quyền sở hữu"
                              >
                                <ArrowLeftRight size={15} />
                              </button>
                            )}
                             {/* Delete Ownership */}
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 if (confirm(`Bạn có chắc chắn muốn xóa bản ghi sở hữu ${o.itemName}?`)) {
                                   setOwnerships(prev => prev.filter(item => item.id !== o.id));
                                 }
                               }}
                               className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer border-none bg-transparent"
                               title="Xóa bản ghi"
                             >
                               <Trash2 size={15} />
                             </button>
                            <button 
                              onClick={() => handleOpenView(o)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer border-none bg-transparent"
                              title="Xem chi tiết & Timeline"
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
          <div className="relative bg-white w-[500px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col justify-between z-10 overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {drawerMode === 'CREATE' ? 'Đăng ký sở hữu sản phẩm' : drawerMode === 'TRANSFER' ? 'Chuyển nhượng sở hữu' : 'Chi tiết sở hữu'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Thông tin vòng đời và quyền sở hữu hợp pháp sản phẩm.</p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg border-none bg-transparent cursor-pointer"><X size={18} /></button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2"><AlertCircle size={16} />{formError}</div>
              )}

              {drawerMode === 'TRANSFER' && selectedOwnership ? (
                // Transfer ownership form
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-slate-700">SẢN PHẨM HIỆN TẠI</h4>
                    <div className="text-sm font-semibold text-slate-900">{selectedOwnership.itemName}</div>
                    <div className="text-xs text-slate-500">Mã: {selectedOwnership.itemCode} | Serial: {selectedOwnership.serialNumber}</div>
                    <div className="text-xs text-slate-500 mt-1">Chủ sở hữu hiện tại: <strong>{selectedOwnership.ownerName}</strong> ({selectedOwnership.ownerEmail})</div>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Tên người sở hữu mới *</label>
                      <input 
                        type="text" 
                        value={transferData.newOwnerName}
                        onChange={e => setTransferData({ ...transferData, newOwnerName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="Nhập tên đầy đủ của người nhận"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Email người sở hữu mới *</label>
                      <input 
                        type="email" 
                        value={transferData.newOwnerEmail}
                        onChange={e => setTransferData({ ...transferData, newOwnerEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Lý do / Ghi chú chuyển nhượng</label>
                      <textarea 
                        value={transferData.transferNote}
                        onChange={e => setTransferData({ ...transferData, transferNote: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="Ví dụ: Chuyển giao xe cũ, tặng quà..."
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Create or View Info
                <div className="space-y-4">
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Mã Sản phẩm (Item Code) *</label>
                      <input 
                        type="text" 
                        value={formData.itemCode}
                        onChange={e => setFormData({ ...formData, itemCode: e.target.value.toUpperCase() })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                        placeholder="ITEM-RO-XXXXX"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Số Serial (Serial Number) *</label>
                      <input 
                        type="text" 
                        value={formData.serialNumber}
                        onChange={e => setFormData({ ...formData, serialNumber: e.target.value.toUpperCase() })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                        placeholder="SN-XXXXXX"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Sản phẩm</label>
                      <select
                        value={formData.itemName}
                        onChange={e => setFormData({ ...formData, itemName: e.target.value })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm"
                      >
                        <option value="Máy lọc nước RO Kangaroo VT3">Máy lọc nước RO Kangaroo VT3</option>
                        <option value="Tấm pin mặt trời JA Solar 450W">Tấm pin mặt trời JA Solar 450W</option>
                        <option value="Sơn chống thấm Spec Damp-proof 5L">Sơn chống thấm Spec Damp-proof 5L</option>
                        <option value="Omega-3 Premium Nordic">Omega-3 Premium Nordic</option>
                      </select>
                    </div>
                  </div>

                  <hr className="border-slate-100 my-2" />
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1"><User size={14} /> THÔNG TIN NGƯỜI SỞ HỮU</h4>

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
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Email liên lạc *</label>
                      <input 
                        type="email" 
                        value={formData.ownerEmail}
                        onChange={e => setFormData({ ...formData, ownerEmail: e.target.value })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <hr className="border-slate-100 my-2" />
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1"><Receipt size={14} /> THÔNG TIN MUA BÁN</h4>

                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1"><Calendar size={12} /> Ngày mua</label>
                        <input 
                          type="date" 
                          value={formData.purchaseDate}
                          onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                          disabled={drawerMode === 'VIEW'}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Số Hóa Đơn</label>
                        <input 
                          type="text" 
                          value={formData.invoiceNumber}
                          onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                          disabled={drawerMode === 'VIEW'}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                          placeholder="INV-YYYY-XXXXX"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1"><MapPin size={12} /> Đại lý / Cửa hàng giao dịch</label>
                      <input 
                        type="text" 
                        value={formData.purchaseLocation}
                        onChange={e => setFormData({ ...formData, purchaseLocation: e.target.value })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="Tên đại lý bán hàng"
                      />
                    </div>
                  </div>

                  {drawerMode === 'VIEW' && selectedOwnership && (
                    <div className="mt-6 pt-4 border-t border-slate-100 space-y-4">
                      <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1"><ClipboardList size={14} /> Lịch sử vòng đời sản phẩm (Traceability Timeline)</h4>
                      <div className="relative pl-6 space-y-4 border-l-2 border-slate-100 ml-2 py-1">
                        <div className="relative">
                          <span className="absolute -left-[31px] top-0 w-4 h-4 bg-green-100 border border-green-300 rounded-full flex items-center justify-center"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span></span>
                          <div className="text-xs font-bold text-slate-800">Đã kích hoạt sở hữu và bảo hành</div>
                          <div className="text-[10px] text-slate-400">{selectedOwnership.ownedAt}</div>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-[31px] top-0 w-4 h-4 bg-blue-100 border border-blue-300 rounded-full flex items-center justify-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span></span>
                          <div className="text-xs font-bold text-slate-800">Xuất kho đại lý bán hàng</div>
                          <div className="text-[10px] text-slate-400">{selectedOwnership.purchaseDate} 10:00</div>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-[31px] top-0 w-4 h-4 bg-slate-100 border border-slate-300 rounded-full flex items-center justify-center"><span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span></span>
                          <div className="text-xs font-bold text-slate-800">Sản xuất & Đóng gói hoàn tất</div>
                          <div className="text-[10px] text-slate-400">{selectedOwnership.createdAt} 08:00</div>
                        </div>
                      </div>
                    </div>
                  )}
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
                  {drawerMode === 'CREATE' ? 'Đăng ký sở hữu' : drawerMode === 'TRANSFER' ? 'Xác nhận chuyển nhượng' : 'Lưu'}
                </Button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
