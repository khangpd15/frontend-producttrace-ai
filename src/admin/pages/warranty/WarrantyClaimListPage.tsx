import { useState } from 'react';
import { ShieldAlert, Check, X, Search, Eye, Filter, RefreshCw, PenTool, CheckCircle, SearchX } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAllWarrantyClaims, useUpdateWarrantyClaimStatus } from '../../../features/warranty/hooks/useWarrantyClaim';

export default function WarrantyClaimListPage({ onNavigate }: { onNavigate?: (tabId: string) => void }) {
  const { data: claimsResponse, isPending } = useAllWarrantyClaims();
  const claims = claimsResponse?.data || [];
  const updateClaimMutation = useUpdateWarrantyClaimStatus();

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'IN_REPAIR' | 'COMPLETED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  // Lọc claims theo tab và search
  const filteredClaims = claims.filter((claim: any) => {
    const matchesTab = activeTab === 'ALL' || claim.status === activeTab;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      claim.issueTitle?.toLowerCase().includes(searchLower) ||
      claim.customerName?.toLowerCase().includes(searchLower) ||
      claim.customerPhone?.includes(searchLower);
    
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Chờ xử lý</span>;
      case 'APPROVED': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Đã tiếp nhận</span>;
      case 'IN_REPAIR': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700">Đang sửa chữa</span>;
      case 'COMPLETED': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Hoàn thành</span>;
      case 'REJECTED': return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Đã từ chối</span>;
      default: return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const handleProcessAction = async (status: string) => {
    if (!selectedClaim) return;
    try {
      await updateClaimMutation.mutateAsync({
        id: selectedClaim.id,
        data: { status, resolutionNote: resolutionNote.trim() }
      });
      setIsProcessing(false);
      setSelectedClaim(null);
      setResolutionNote('');
    } catch(err) {
      console.error(err);
    }
  };

  const openProcessModal = (claim: any) => {
    setSelectedClaim(claim);
    setResolutionNote(claim.resolutionNote || '');
    setIsProcessing(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <ShieldAlert className="text-red-500" /> Quản lý Yêu cầu Bảo hành
        </h1>
      </div>

      <div className="flex gap-4 mb-6 mt-4">
        {['ALL', 'PENDING', 'IN_REPAIR', 'COMPLETED', 'REJECTED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-semibold text-sm rounded-lg border transition-all ${
              activeTab === tab
                ? 'bg-red-50 text-red-600 border-red-200 shadow-sm'
                : 'text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab === 'ALL' ? 'Tất cả yêu cầu' :
             tab === 'PENDING' ? 'Chờ xử lý' :
             tab === 'IN_REPAIR' ? 'Đang sửa chữa' :
             tab === 'COMPLETED' ? 'Đã hoàn thành' : 'Bị từ chối'}
          </button>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex gap-3 mb-6">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm theo sự cố, tên khách hàng, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <Button variant="secondary" className="flex items-center gap-2">
            <Filter size={16} /> Lọc nâng cao
          </Button>
        </div>

        <div className="overflow-x-auto">
          {isPending ? (
            <div className="py-20 text-center text-slate-500 flex flex-col items-center">
              <RefreshCw className="animate-spin mb-4" />
              Đang tải danh sách yêu cầu...
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="py-20 text-center text-slate-500 flex flex-col items-center">
              <SearchX size={48} className="text-slate-300 mb-4" />
              <p>Không tìm thấy phiếu yêu cầu bảo hành nào phù hợp.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4">Mã Phiếu</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4 max-w-xs">Sự cố</th>
                  <th className="px-6 py-4">Ngày gửi</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClaims.map((claim: any) => (
                  <tr key={claim.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {claim.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{claim.customerName}</div>
                      <div className="text-xs text-slate-500">{claim.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-bold text-slate-800 truncate" title={claim.issueTitle}>
                        {claim.issueTitle}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5" title={claim.issueDescription}>
                        {claim.issueDescription}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(claim.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(claim.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="secondary" onClick={() => openProcessModal(claim)}>
                        Xử lý
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Process Claim Modal */}
      {isProcessing && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800">Xử lý yêu cầu bảo hành</h3>
              <button 
                onClick={() => setIsProcessing(false)}
                className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Thông tin phiếu */}
              <div className="bg-blue-50/50 border-l-4 border-blue-500 p-4 rounded-r-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-blue-900">{selectedClaim.issueTitle}</h4>
                    <p className="text-sm text-blue-800 mt-1">{selectedClaim.issueDescription}</p>
                  </div>
                  {getStatusBadge(selectedClaim.status)}
                </div>
                <div className="text-xs text-blue-700/80 pt-2 border-t border-blue-200/50">
                  <span className="font-semibold">{selectedClaim.customerName}</span> • {selectedClaim.customerPhone}
                </div>
              </div>

              {/* Ghi chú xử lý */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">Ghi chú sửa chữa & Xử lý (Nội bộ / Dành cho khách hàng)</label>
                <textarea
                  className="w-full border border-slate-200 rounded-xl p-3 h-28 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-xs text-sm"
                  placeholder="Ghi chú kết quả kiểm tra, linh kiện đã thay thế, hướng dẫn khách hàng..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                />
              </div>

              {/* Actions Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-slate-800 mb-4">Cập nhật trạng thái</h4>
                
                {selectedClaim.status === 'PENDING' && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 h-11"
                      onClick={() => handleProcessAction('APPROVED')}
                      disabled={updateClaimMutation.isPending}
                    >
                      <Check size={18} /> Tiếp nhận đơn
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 flex items-center justify-center gap-2 h-11"
                      onClick={() => handleProcessAction('REJECTED')}
                      disabled={updateClaimMutation.isPending}
                    >
                      <X size={18} /> Từ chối
                    </Button>
                  </div>
                )}

                {selectedClaim.status === 'APPROVED' && (
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      className="bg-cyan-600 hover:bg-cyan-700 flex items-center justify-center gap-2 h-11"
                      onClick={() => handleProcessAction('IN_REPAIR')}
                      disabled={updateClaimMutation.isPending}
                    >
                      <PenTool size={18} /> Gửi đến Trung tâm & Đang sửa chữa
                    </Button>
                  </div>
                )}

                {selectedClaim.status === 'IN_REPAIR' && (
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2 h-11"
                      onClick={() => handleProcessAction('COMPLETED')}
                      disabled={updateClaimMutation.isPending}
                    >
                      <CheckCircle size={18} /> Hoàn thành sửa chữa & Trả khách
                    </Button>
                  </div>
                )}

                {(selectedClaim.status === 'COMPLETED' || selectedClaim.status === 'REJECTED') && (
                  <div className="text-center py-4 bg-slate-200/50 rounded-lg text-slate-500 font-medium text-sm">
                    Yêu cầu này đã được đóng và không thể thay đổi trạng thái nữa.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
