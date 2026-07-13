import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, Eye, X, AlertCircle, 
  User, Calendar, MapPin, Receipt, ArrowLeftRight, HelpCircle, Inbox, ClipboardList, Trash2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { 
  useOwnershipList, 
  useDeleteOwnership, 
  useTransferOwnership, 
  useAdminRequestOTP, 
  useAdminRegisterOwnership 
} from '../../../features/ownership/hooks/useOwnership';
import { traceApi } from '../../../features/trace/api/trace.api';

export default function OwnershipListPage({ onNavigate }: { onNavigate: (tabId: string) => void }) {
  const [activeKpiFilter, setActiveKpiFilter] = useState<'ALL' | 'ACTIVE' | 'TRANSFERRED' | 'REVOKED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'CREATE' | 'EDIT' | 'VIEW' | 'TRANSFER'>('CREATE');
  const [selectedOwnership, setSelectedOwnership] = useState<any | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    itemCode: '',
    itemName: 'Máy lọc nước RO Kangaroo VT3',
    serialNumber: '', // will be used as the QR code search input
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownershipType: 'PRIMARY',
    purchaseDate: new Date().toISOString().substring(0, 10),
    purchaseLocation: 'Điện Máy Xanh Cầu Giấy',
    invoiceNumber: '',
    status: 'ACTIVE'
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transfer Form state
  const [transferData, setTransferData] = useState({
    newOwnerName: '',
    newOwnerEmail: '',
  });

  // Timeline events for selected ownership
  const [timeline, setTimeline] = useState<any[]>([]);
  const [isTimelineLoading, setIsTimelineLoading] = useState(false);

  // Fetch ownership list from backend
  const { data: ownershipsRes, isLoading, refetch } = useOwnershipList();
  
  // Mutations
  const deleteMutation = useDeleteOwnership();
  const transferMutation = useTransferOwnership();
  const requestOTPMutation = useAdminRequestOTP();
  const registerMutation = useAdminRegisterOwnership();

  // Load timeline when viewing an ownership
  useEffect(() => {
    if (selectedOwnership?.product_id) {
      setIsTimelineLoading(true);
      traceApi.search({ code: selectedOwnership.product_id })
        .then(res => {
          setTimeline(res.data.data?.timeline || []);
        })
        .catch(() => {
          setTimeline([]);
        })
        .finally(() => {
          setIsTimelineLoading(false);
        });
    } else {
      setTimeline([]);
    }
  }, [selectedOwnership]);

  // Stats
  const stats = useMemo(() => {
    const list = ownershipsRes?.data || [];
    const total = list.length;
    const active = list.filter(o => o.status === 'ACTIVE').length;
    const transferred = list.filter(o => o.status === 'TRANSFERRED').length;
    const revoked = list.filter(o => o.status === 'REVOKED').length;
    return { total, active, transferred, revoked };
  }, [ownershipsRes]);

  // Filtered ownerships
  const filteredOwnerships = useMemo(() => {
    const list = ownershipsRes?.data || [];
    return list.filter(o => {
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchCode = o.product_sku.toLowerCase().includes(query);
        const matchSerial = o.product_id.toLowerCase().includes(query);
        const matchOwner = o.owner_name.toLowerCase().includes(query) || o.owner_email.toLowerCase().includes(query);
        if (!matchCode && !matchSerial && !matchOwner) return false;
      }
      if (filterStatus !== 'ALL' && o.status !== filterStatus) return false;
      if (activeKpiFilter !== 'ALL' && o.status !== activeKpiFilter) return false;
      return true;
    });
  }, [ownershipsRes, searchTerm, filterStatus, activeKpiFilter]);

  const handleOpenCreate = () => {
    setDrawerMode('CREATE');
    setFormData({
      itemCode: '',
      itemName: 'Máy lọc nước RO Kangaroo VT3',
      serialNumber: '',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      ownershipType: 'PRIMARY',
      purchaseDate: new Date().toISOString().substring(0, 10),
      purchaseLocation: 'Điện Máy Xanh Cầu Giấy',
      invoiceNumber: 'INV-2026-' + Math.floor(10000 + Math.random() * 90000),
      status: 'ACTIVE'
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleOpenTransfer = (ownership: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDrawerMode('TRANSFER');
    setSelectedOwnership(ownership);
    setTransferData({
      newOwnerName: '',
      newOwnerEmail: '',
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleOpenView = (ownership: any) => {
    setDrawerMode('VIEW');
    setSelectedOwnership(ownership);
    setIsDrawerOpen(true);
  };

  const handleDeleteClick = async (ownership: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Bạn có chắc chắn muốn xóa bản ghi sở hữu này?`)) {
      try {
        await deleteMutation.mutateAsync(ownership.ownership_id);
        alert('Xóa bản ghi sở hữu thành công!');
        refetch();
      } catch (err: any) {
        alert(err.response?.data?.error || 'Không thể xóa bản ghi sở hữu.');
      }
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (drawerMode === 'TRANSFER' && selectedOwnership) {
      if (!transferData.newOwnerName.trim()) {
        setFormError('Vui lòng nhập tên của người sở hữu mới');
        return;
      }
      if (!transferData.newOwnerEmail.trim()) {
        setFormError('Vui lòng nhập email của người sở hữu mới');
        return;
      }

      setFormError(null);
      setIsSubmitting(true);

      try {
        await transferMutation.mutateAsync({
          id: selectedOwnership.ownership_id,
          payload: {
            new_owner_name: transferData.newOwnerName.trim() || transferData.newOwnerEmail.trim(),
            new_owner_email: transferData.newOwnerEmail.trim(),
          },
        });
        alert('Chuyển quyền sở hữu thành công!');
        setIsDrawerOpen(false);
        refetch();
      } catch (err: any) {
        setFormError(err.response?.data?.error || 'Có lỗi xảy ra khi chuyển nhượng.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (drawerMode === 'CREATE') {
      if (!formData.serialNumber.trim()) {
        setFormError('Vui lòng nhập Số Serial / Mã QR sản phẩm.');
        return;
      }
      if (!formData.ownerName.trim() || !formData.ownerEmail.trim() || !formData.ownerPhone.trim()) {
        setFormError('Thông tin khách hàng sở hữu là bắt buộc');
        return;
      }

      setFormError(null);
      setIsSubmitting(true);

      try {
        // Step 1: Trace search to verify item exists and get its product_id (UUID)
        const traceRes = await traceApi.search({ code: formData.serialNumber.trim() });
        const productItem = traceRes.data.data?.productItem;

        if (!productItem || !productItem.itemId) {
          setFormError('Không tìm thấy sản phẩm hợp lệ với mã/serial này.');
          setIsSubmitting(false);
          return;
        }

        const resolvedProductId = productItem.itemId;

        // Step 2: Request Admin OTP
        await requestOTPMutation.mutateAsync({
          qr_code: formData.serialNumber.trim(),
          owner_name: formData.ownerName.trim(),
          owner_email: formData.ownerEmail.trim(),
          owner_phone: formData.ownerPhone.trim(),
        });

        setIsSubmitting(false);
        
        // Step 3: Prompt admin/dealer for OTP input
        const otpInput = window.prompt(`Chúng tôi đã gửi mã xác thực đến email ${formData.ownerEmail}. Vui lòng nhập mã OTP 6 số để hoàn tất:`);
        if (!otpInput) {
          return;
        }

        setIsSubmitting(true);
        await registerMutation.mutateAsync({
          otp: otpInput.trim(),
          product_id: resolvedProductId,
          owner_name: formData.ownerName.trim(),
          owner_email: formData.ownerEmail.trim(),
          owner_phone: formData.ownerPhone.trim() || undefined,
        });

        alert('Đăng ký quyền sở hữu thành công!');
        setIsDrawerOpen(false);
        refetch();
      } catch (err: any) {
        setFormError(err.response?.data?.error || 'Có lỗi xảy ra khi thực hiện đăng ký.');
      } finally {
        setIsSubmitting(false);
      }
    }
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

      {isLoading ? (
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
                  placeholder="Tìm theo Serial, SKU hoặc tên chủ sở hữu..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"><X size={14} /></button>
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
                  <option value="ACTIVE">Đang sở hữu</option>
                  <option value="TRANSFERRED">Đã chuyển nhượng</option>
                  <option value="REVOKED">Bị thu hồi</option>
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
            {filteredOwnerships.length === 0 ? (
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
                      <th className="p-3.5 pl-5 font-bold tracking-wider w-[22%]">Mã SKU / ID Sản phẩm</th>
                      <th className="p-3.5 font-bold tracking-wider w-[22%]">Tên sản phẩm</th>
                      <th className="p-3.5 font-bold tracking-wider w-[24%]">Chủ sở hữu</th>
                      <th className="p-3.5 font-bold tracking-wider w-[14%]">Ngày Đăng ký</th>
                      <th className="p-3.5 font-bold tracking-wider w-[18%] text-center">Trạng thái</th>
                      <th className="p-3.5 pr-5 font-bold tracking-wider w-[12%] text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOwnerships.map(o => (
                      <tr 
                        key={o.ownership_id} 
                        onClick={() => handleOpenView(o)}
                        className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
                      >
                        <td className="p-3.5 pl-5 truncate">
                          <div className="font-mono text-xs text-slate-500 font-semibold">{o.product_sku}</div>
                          <div className="font-mono text-[10px] text-slate-400 truncate">{o.product_id}</div>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-900 truncate">{o.product_name}</td>
                        <td className="p-3.5 truncate">
                          <div className="font-semibold text-slate-800 text-xs flex items-center gap-1">
                            <User size={12} className="text-slate-400 flex-shrink-0" /> {o.owner_name}
                          </div>
                          <div className="text-[10px] text-slate-400">{o.owner_email} | {o.owner_phone}</div>
                        </td>
                        <td className="p-3.5 text-slate-500 text-xs">
                          {new Date(o.registration_date).toLocaleDateString('vi-VN')}
                        </td>
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
                            <button 
                              onClick={(e) => handleDeleteClick(o, e)}
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
                    <div className="text-sm font-semibold text-slate-900">{selectedOwnership.product_name}</div>
                    <div className="text-xs text-slate-500 font-mono">SKU: {selectedOwnership.product_sku}</div>
                    <div className="text-xs text-slate-500 font-mono">ID: {selectedOwnership.product_id}</div>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Tên người sở hữu mới *</label>
                      <input 
                        type="text" 
                        value={transferData.newOwnerName}
                        onChange={e => setTransferData({ ...transferData, newOwnerName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Họ và tên người nhận"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Email người sở hữu mới *</label>
                      <input 
                        type="email" 
                        value={transferData.newOwnerEmail}
                        onChange={e => setTransferData({ ...transferData, newOwnerEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Create or View Info
                <div className="space-y-4">
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Số Serial / Mã QR sản phẩm *</label>
                      <input 
                        type="text" 
                        value={formData.serialNumber}
                        onChange={e => setFormData({ ...formData, serialNumber: e.target.value.toUpperCase() })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ví dụ: SN-987654321 hoặc QR code"
                      />
                    </div>
                    {drawerMode === 'VIEW' && selectedOwnership && (
                      <>
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1 font-mono text-slate-500">ID Sản phẩm</label>
                          <input 
                            type="text" 
                            value={selectedOwnership.product_id}
                            disabled
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">Tên sản phẩm</label>
                          <input 
                            type="text" 
                            value={selectedOwnership.product_name}
                            disabled
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">Mã SKU</label>
                          <input 
                            type="text" 
                            value={selectedOwnership.product_sku}
                            disabled
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <hr className="border-slate-100 my-2" />
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1"><User size={14} /> THÔNG TIN NGƯỜI SỞ HỮU</h4>

                  <div className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Tên khách hàng sở hữu *</label>
                      <input 
                        type="text" 
                        value={drawerMode === 'VIEW' ? selectedOwnership?.owner_name : formData.ownerName}
                        onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Email liên lạc *</label>
                      <input 
                        type="email" 
                        value={drawerMode === 'VIEW' ? selectedOwnership?.owner_email : formData.ownerEmail}
                        onChange={e => setFormData({ ...formData, ownerEmail: e.target.value })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Số điện thoại *</label>
                      <input 
                        type="text" 
                        value={drawerMode === 'VIEW' ? selectedOwnership?.owner_phone : formData.ownerPhone}
                        onChange={e => setFormData({ ...formData, ownerPhone: e.target.value })}
                        disabled={drawerMode === 'VIEW'}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="0987654321"
                      />
                    </div>
                  </div>

                  {drawerMode === 'VIEW' && selectedOwnership && (
                    <div className="mt-6 pt-4 border-t border-slate-100 space-y-4">
                      <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1"><ClipboardList size={14} /> Lịch sử vòng đời sản phẩm (Traceability Timeline)</h4>
                      {isTimelineLoading ? (
                        <div className="text-center py-4 text-xs text-slate-400">Đang tải timeline...</div>
                      ) : timeline.length === 0 ? (
                        <div className="text-center py-4 text-xs text-slate-400">Không có dữ liệu timeline.</div>
                      ) : (
                        <div className="relative pl-6 space-y-4 border-l-2 border-slate-100 ml-2 py-1">
                          {timeline.map((ev, idx) => (
                            <div key={idx} className="relative">
                              <span className="absolute -left-[31px] top-0 w-4 h-4 bg-blue-100 border border-blue-300 rounded-full flex items-center justify-center">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                              </span>
                              <div className="text-xs font-bold text-slate-800">{ev.title}</div>
                              <div className="text-[10px] text-slate-500">{ev.description}</div>
                              {ev.location && <div className="text-[10px] text-slate-400 flex items-center gap-0.5"><MapPin size={10} /> {ev.location}</div>}
                              <div className="text-[9px] text-slate-400">{new Date(ev.timestamp).toLocaleString('vi-VN')}</div>
                            </div>
                          ))}
                        </div>
                      )}
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
                <Button onClick={handleSubmitForm} disabled={isSubmitting} className="rounded-xl px-4 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer">
                  {isSubmitting ? 'Đang thực hiện...' : (drawerMode === 'CREATE' ? 'Đăng ký sở hữu' : 'Xác nhận chuyển nhượng')}
                </Button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
