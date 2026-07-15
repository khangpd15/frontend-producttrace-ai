import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, Plus, X, AlertCircle, 
  Shield, ShieldCheck, ShieldAlert, Calendar, User, HelpCircle, Inbox, Trash2, Eye
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Pagination from '../../components/ui/Pagination';
import { 
  useWarrantyList, 
  useActivateWarranty, 
  useApproveWarranty, 
  useRejectWarranty, 
  useVoidWarranty 
} from '../../../features/warranty/hooks/useWarranty';
import { parseApiError } from '../../../api/axios';

export default function WarrantyListPage({ onNavigate }: { onNavigate: (tabId: string) => void }) {
  const tableRef = useRef<HTMLDivElement>(null);

  const [activeKpiFilter, setActiveKpiFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // ── Pagination state (client-side — backend returns full list) ──────────────
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Queries & Mutations
  const { data: warranties = [], isLoading, error, refetch } = useWarrantyList();
  const activateMutation = useActivateWarranty();
  const approveMutation = useApproveWarranty();
  const rejectMutation = useRejectWarranty();
  const voidMutation = useVoidWarranty();

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'CREATE' | 'VIEW' | 'PROCESS_CLAIM'>('CREATE');
  const [selectedWarranty, setSelectedWarranty] = useState<any | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    itemCode: '',
    itemName: 'Máy lọc nước RO Kangaroo VT3',
    serialNumber: '',
    ownerName: '',
    ownerEmail: '',
    warrantyCode: '',
    policyName: 'Bảo hành chính hãng Kangaroo 24 tháng',
    policyDescription: 'Bảo hành toàn bộ linh kiện điện tử vòi nước và linh kiện máy.',
    durationMonths: 24,
    status: 'ACTIVE',
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
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

  // Calculate statistics from real data (full list)
  const stats = useMemo(() => {
    const total = warranties.length;
    const active = warranties.filter(w => w.status === 'ACTIVE').length;
    const expired = warranties.filter(w => w.status === 'EXPIRED').length;
    const pending = warranties.filter(w => w.status === 'PENDING').length;
    const cancelled = warranties.filter(w => w.status === 'CANCELLED').length;
    return { total, active, expired, pending, cancelled };
  }, [warranties]);

  // Filtered list (full, for stats)
  const filteredWarranties = useMemo(() => {
    return warranties.filter(w => {
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchCode = (w.itemCode || '').toLowerCase().includes(query);
        const matchSerial = (w.serialNumber || '').toLowerCase().includes(query);
        const matchOwner = (w.ownerName || '').toLowerCase().includes(query);
        const matchWarCode = (w.warrantyCode || '').toLowerCase().includes(query);
        if (!matchCode && !matchSerial && !matchOwner && !matchWarCode) return false;
      }
      if (filterStatus !== 'ALL' && w.status !== filterStatus) return false;
      if (activeKpiFilter !== 'ALL' && w.status !== activeKpiFilter) return false;
      return true;
    });
  }, [warranties, searchTerm, filterStatus, activeKpiFilter]);

  // Pagination derived values
  const totalItems = filteredWarranties.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const pagedWarranties = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredWarranties.slice(start, start + limit);
  }, [filteredWarranties, page, limit]);

  // Reset to page 1 on any filter change
  useEffect(() => { setPage(1); }, [searchTerm, filterStatus, activeKpiFilter, limit]);

  // Scroll table into view on page change
  useEffect(() => {
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [page]);


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
      endDate: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      invoiceNumber: 'INV-2026-' + Math.floor(10000 + Math.random() * 90000),
      note: ''
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleOpenView = (warranty: any) => {
    setDrawerMode('VIEW');
    setSelectedWarranty(warranty);
    setIsDrawerOpen(true);
  };

  const handleOpenClaimProcess = (warranty: any, e?: React.MouseEvent) => {
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

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (drawerMode === 'PROCESS_CLAIM' && selectedWarranty) {
      if (!claimResolution.reason.trim()) {
        setFormError('Vui lòng nhập lý do và hướng giải quyết bảo hành');
        return;
      }

      try {
        setFormError(null);
        if (claimResolution.decision === 'RESOLVED') {
          await approveMutation.mutateAsync({
            id: selectedWarranty.id,
            payload: {
              durationMonths: selectedWarranty.durationMonths || 24,
              policyName: selectedWarranty.policyName || 'Bảo hành kích hoạt',
            }
          });
          alert('Duyệt bảo hành thành công!');
        } else if (claimResolution.decision === 'REJECTED') {
          await rejectMutation.mutateAsync({
            id: selectedWarranty.id,
            payload: {
              reason: claimResolution.reason
            }
          });
          alert('Từ chối bảo hành thành công!');
        }
        setIsDrawerOpen(false);
      } catch (err: any) {
        setFormError(parseApiError(err));
      }
      return;
    }

    if (!formData.ownerName.trim() || !formData.serialNumber.trim()) {
      setFormError('Tên khách hàng và Serial Number là bắt buộc');
      return;
    }

    if (drawerMode === 'CREATE') {
      try {
        setFormError(null);
        await activateMutation.mutateAsync({
          itemCode: formData.itemCode.toUpperCase(),
          itemName: formData.itemName,
          serialNumber: formData.serialNumber.toUpperCase(),
          ownerName: formData.ownerName.trim(),
          ownerEmail: formData.ownerEmail.trim() || undefined,
          warrantyCode: formData.warrantyCode.toUpperCase(),
          policyName: formData.policyName,
          policyDescription: formData.policyDescription,
          durationMonths: formData.durationMonths,
          invoiceNumber: formData.invoiceNumber.toUpperCase(),
          note: formData.note
        });
        alert('Kích hoạt bảo hành điện tử thành công!');
        setIsDrawerOpen(false);
      } catch (err: any) {
        setFormError(parseApiError(err));
      }
    }
  };

  const renderStatusBadge = (status: 'INACTIVE' | 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'REJECTED' | 'CANCELLED' | string) => {
    const config: any = {
      ACTIVE: { bg: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', label: 'Đang bảo hành' },
      INACTIVE: { bg: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-400', label: 'Chưa kích hoạt' },
      EXPIRED: { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', label: 'Hết hạn bảo hành' },
      PENDING: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Chờ duyệt' },
      REJECTED: { bg: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-600', label: 'Từ chối' },
      CANCELLED: { bg: 'bg-slate-100 text-slate-600 border-slate-300', dot: 'bg-slate-400', label: 'Đã hủy' }
    };
    const c = config[status] || { bg: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-400', label: status };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
        {c.label}
      </span>
    );
  };

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 h-28 shadow-xs"></div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 h-96 animate-pulse shadow-xs"></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            Bảo hành & Khiếu nại
            <span className="text-[9px] bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md text-slate-500 font-bold uppercase tracking-wider">
              Warranty Staff / Admin
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-2xl">
            Quản lý chính sách bảo hành sản phẩm, kích hoạt bảo hành điện tử và tiếp nhận xử lý khiếu nại (Claim).
          </p>
        </div>
        <Button 
          onClick={handleOpenCreate} 
          className="rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer transition-all duration-200"
        >
          <Plus size={16} /> Kích hoạt bảo hành
        </Button>
      </div>

      {error ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto mt-12 rounded-2xl shadow-xs">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900">Không thể tải dữ liệu bảo hành</h3>
          <p className="mt-2 text-xs text-slate-500 max-w-sm">{parseApiError(error)}</p>
          <Button onClick={() => refetch()} className="mt-6 rounded-xl px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs transition-colors">Thử lại</Button>
        </Card>
      ) : isLoading ? (
        renderSkeleton()
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { id: 'ALL', label: 'Tổng hợp đồng bảo hành', value: stats.total, color: 'text-slate-900', bg: 'bg-slate-50/50 hover:bg-slate-50' },
              { id: 'ACTIVE', label: 'Đang bảo hành', value: stats.active, color: 'text-green-600', bg: 'bg-green-50/20 hover:bg-green-50/40' },
              { id: 'PENDING', label: 'Yêu cầu chờ duyệt', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50/20 hover:bg-amber-50/40' },
              { id: 'CANCELLED', label: 'Đã hủy/vô hiệu', value: stats.cancelled, color: 'text-slate-500', bg: 'bg-slate-50/20 hover:bg-slate-50/40' },
              { id: 'EXPIRED', label: 'Đã hết hạn', value: stats.expired, color: 'text-red-500', bg: 'bg-red-50/20 hover:bg-red-50/40' }
            ].map(card => (
              <div
                key={card.id}
                onClick={() => setActiveKpiFilter(activeKpiFilter === card.id ? 'ALL' : card.id as any)}
                className={`p-4 bg-white border rounded-2xl shadow-xs cursor-pointer transition-all duration-300 ${card.bg} ${
                  activeKpiFilter === card.id ? 'border-blue-400 ring-4 ring-blue-50' : 'border-slate-200/85'
                }`}
              >
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>{card.label}</span>
                  <HelpCircle size={12} className="text-slate-300" />
                </div>
                <div className={`text-2xl font-extrabold mt-2.5 tracking-tight ${card.color}`}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 w-full">
              <div className="relative w-full sm:flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm bảo hành theo Mã BH, Serial, Tên Khách hàng..." 
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white rounded-xl text-xs focus:outline-none transition-all duration-200"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"><X size={14} /></button>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">Trạng thái:</span>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full sm:w-auto bg-white border border-slate-200 rounded-xl text-xs py-2 pl-3 pr-8 cursor-pointer focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="ACTIVE">Đang bảo hành</option>
                  <option value="PENDING">Chờ duyệt</option>
                  <option value="CANCELLED">Đã hủy/vô hiệu</option>
                  <option value="EXPIRED">Đã hết hạn</option>
                </select>
              </div>
            </div>

            {(searchTerm || filterStatus !== 'ALL' || activeKpiFilter !== 'ALL') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('ALL');
                  setActiveKpiFilter('ALL');
                  setPage(1);
                }}
                className="text-xs font-bold text-blue-600 hover:underline bg-transparent border-none cursor-pointer flex-shrink-0"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Table */}
          <div ref={tableRef} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {filteredWarranties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white">
                <Inbox size={48} className="text-slate-300 mb-4" />
                <h3 className="text-base font-bold text-slate-900">Không tìm thấy bản ghi bảo hành</h3>
                <p className="text-slate-500 text-xs max-w-sm mt-1">Chưa có thiết bị nào kích hoạt chính sách bảo hành hoặc bộ lọc không khớp.</p>
                <Button onClick={handleOpenCreate} className="mt-6 bg-blue-600 text-white rounded-xl px-4 py-2 text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs transition-colors">Kích hoạt bảo hành</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm table-fixed border-collapse">
                  <thead className="text-[10px] text-slate-400 font-bold uppercase bg-slate-50/75 border-b border-slate-100">
                    <tr>
                      <th className="p-4 pl-6 font-bold tracking-wider w-[15%]">Mã BH</th>
                      <th className="p-4 font-bold tracking-wider w-[15%]">Serial</th>
                      <th className="p-4 font-bold tracking-wider w-[18%]">Khách hàng</th>
                      <th className="p-4 font-bold tracking-wider w-[22%]">Chính sách bảo hành</th>
                      <th className="p-4 font-bold tracking-wider w-[10%] text-center">Thời hạn</th>
                      <th className="p-4 font-bold tracking-wider w-[12%] text-center">Trạng thái</th>
                      <th className="p-4 pr-6 font-bold tracking-wider w-[10%] text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedWarranties.map(w => (
                      <tr 
                        key={w.id} 
                        onClick={() => handleOpenView(w)}
                        className="hover:bg-slate-50/30 cursor-pointer transition-all group"
                      >
                        <td className="p-4 pl-6 font-mono text-xs font-bold text-slate-500 truncate">{w.warrantyCode}</td>
                        <td className="p-4 font-mono text-xs font-bold text-slate-800 truncate">{w.serialNumber}</td>
                        <td className="p-4 truncate">
                          <div className="font-bold text-slate-800 text-xs">{w.ownerName}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{w.ownerEmail}</div>
                        </td>
                        <td className="p-4 truncate">
                          <div className="font-bold text-slate-800 text-xs flex items-center gap-1"><Shield size={12} className="text-slate-400" /> {w.policyName}</div>
                          <div className="text-[10px] text-slate-400 font-medium">Từ {new Date(w.startDate).toLocaleDateString('vi-VN')} đến {new Date(w.endDate).toLocaleDateString('vi-VN')}</div>
                        </td>
                        <td className="p-4 text-center text-slate-700 font-bold text-xs">{w.durationMonths} tháng</td>
                        <td className="p-4 text-center" onClick={e => e.stopPropagation()}>{renderStatusBadge(w.status)}</td>
                        <td className="p-4 pr-6 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-end gap-1">
                            {w.status === 'PENDING' && (
                              <button 
                                onClick={(e) => handleOpenClaimProcess(w, e)}
                                className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl cursor-pointer border-none bg-transparent transition-colors"
                                title="Xử lý yêu cầu bảo hành"
                              >
                                <ShieldAlert size={14} />
                              </button>
                            )}
                            <button 
                              onClick={() => handleOpenView(w)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer border-none bg-transparent transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye size={14} />
                            </button>
                            {w.status === 'ACTIVE' && (
                              <button 
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const reason = prompt(`Nhập lý do vô hiệu hóa hợp đồng bảo hành ${w.warrantyCode}:`);
                                  if (reason && reason.trim()) {
                                    try {
                                      await voidMutation.mutateAsync({
                                        id: w.id,
                                        payload: { reason: reason.trim() }
                                      });
                                      alert('Hủy bỏ/vô hiệu hóa bảo hành thành công!');
                                    } catch (err: any) {
                                      alert(parseApiError(err));
                                    }
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer border-none bg-transparent transition-colors"
                                title="Vô hiệu hóa bảo hành"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination
              page={page}
              limit={limit}
              totalItems={totalItems}
              totalPages={totalPages}
              onPageChange={setPage}
              onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
            />
          </div>
        </>
      )}

      {/* Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative bg-white w-[500px] max-h-[90vh] shadow-2xl rounded-2xl flex flex-col justify-between z-10 overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {drawerMode === 'CREATE' ? 'Kích hoạt bảo hành điện tử' : drawerMode === 'PROCESS_CLAIM' ? 'Xử lý yêu cầu bảo hành' : 'Chi tiết bảo hành'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Thông tin thời hạn và chính sách bảo hành</p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg border-none bg-transparent cursor-pointer transition-colors"><X size={18} /></button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 font-bold"><AlertCircle size={16} />{formError}</div>
              )}

              {drawerMode === 'PROCESS_CLAIM' && selectedWarranty ? (
                // Claim handling panel
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-2 text-slate-700 shadow-2xs">
                    <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Yêu cầu bảo hành đang chờ</h4>
                    <p className="text-xs font-bold text-slate-950">{selectedWarranty.ownerName} ({selectedWarranty.ownerEmail})</p>
                    <p className="text-xs font-medium text-slate-600">Thiết bị: {selectedWarranty.itemName} | Serial: {selectedWarranty.serialNumber}</p>
                    <div className="text-xs bg-white border border-amber-100 p-3 rounded-xl mt-2 font-medium leading-relaxed shadow-3xs">
                      <strong className="text-slate-800 block mb-0.5">Nội dung phản ánh:</strong> {selectedWarranty.note}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Quyết định xử lý *</label>
                      <select
                        value={claimResolution.decision}
                        onChange={e => setClaimResolution({ ...claimResolution, decision: e.target.value as any })}
                        className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-xs cursor-pointer focus:outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="RESOLVED">Chấp nhận & Duyệt kích hoạt (ACTIVE)</option>
                        <option value="REJECTED">Từ chối yêu cầu (REJECTED)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Lý do xử lý *</label>
                      <textarea 
                        value={claimResolution.reason}
                        onChange={e => setClaimResolution({ ...claimResolution, reason: e.target.value })}
                        rows={3}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors resize-none"
                        placeholder="Nêu rõ lý do duyệt hoặc từ chối..."
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Standard Form/View
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Mã bảo hành *</label>
                      <input 
                        type="text" 
                        value={formData.warrantyCode}
                        onChange={e => setFormData({ ...formData, warrantyCode: e.target.value.toUpperCase() })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="WAR-XXXXXX"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Mã sản phẩm (Item Code) *</label>
                      <input 
                        type="text" 
                        value={formData.itemCode}
                        onChange={e => setFormData({ ...formData, itemCode: e.target.value.toUpperCase() })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="ITEM-RO-KG12345"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Số Serial thiết bị *</label>
                      <input 
                        type="text" 
                        value={formData.serialNumber}
                        onChange={e => setFormData({ ...formData, serialNumber: e.target.value.toUpperCase() })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <hr className="border-slate-100 my-1" />
                  <h4 className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider"><User size={14} /> Khách hàng</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Tên khách hàng sở hữu *</label>
                      <input 
                        type="text" 
                        value={formData.ownerName}
                        onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Email</label>
                      <input 
                        type="email" 
                        value={formData.ownerEmail}
                        onChange={e => setFormData({ ...formData, ownerEmail: e.target.value })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <hr className="border-slate-100 my-1" />
                  <h4 className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider"><ShieldCheck size={14} /> Chính sách bảo hành</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Tên chính sách bảo hành</label>
                      <input 
                        type="text" 
                        value={formData.policyName}
                        onChange={e => setFormData({ ...formData, policyName: e.target.value })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Thời hạn (Tháng)</label>
                        <input 
                          type="number" 
                          value={formData.durationMonths}
                          onChange={e => setFormData({ ...formData, durationMonths: parseInt(e.target.value) || 0 })}
                          disabled={drawerMode === 'VIEW'}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Trạng thái bảo hành</label>
                        <select
                          value={formData.status}
                          onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                          disabled={drawerMode === 'VIEW'}
                          className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
                        >
                          <option value="ACTIVE">Đang bảo hành</option>
                          <option value="PENDING">Chờ duyệt</option>
                          <option value="CANCELLED">Đã hủy/vô hiệu</option>
                          <option value="EXPIRED">Đã hết hạn</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5"><Calendar size={12} /> Ngày bắt đầu</label>
                        <input 
                          type="date" 
                          value={formData.startDate}
                          onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                          disabled={drawerMode === 'VIEW'}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5"><Calendar size={12} /> Ngày kết thúc</label>
                        <input 
                          type="date" 
                          value={formData.endDate}
                          onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                          disabled={drawerMode === 'VIEW'}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Ghi chú</label>
                      <textarea 
                        value={formData.note}
                        onChange={e => setFormData({ ...formData, note: e.target.value })}
                        disabled={drawerMode === 'VIEW'}
                        rows={3}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
              <Button variant="secondary" onClick={() => setIsDrawerOpen(false)} className="rounded-xl px-4 py-2 text-xs font-bold cursor-pointer transition-colors">
                {drawerMode === 'VIEW' ? 'Đóng' : 'Hủy'}
              </Button>
              {drawerMode !== 'VIEW' && (
                <Button onClick={handleSubmitForm} className="rounded-xl px-4 py-2 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer transition-all duration-200">
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
