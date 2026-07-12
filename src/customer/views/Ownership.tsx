import { useState } from 'react';
import { TopAppBar } from '../components/layout/TopAppBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Clock, ChevronRight } from 'lucide-react';
import { useOwnershipList, useOwnershipDetail, useTransferOwnership } from '../../features/ownership/hooks/useOwnership';
import { traceApi } from '../../features/trace/api/trace.api';

export function Ownership({ onBack, onRegister }: { onBack: () => void; onRegister: () => void }) {
  const [view, setView] = useState<'list' | 'detail' | 'transfer'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Transfer Form State
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [transferError, setTransferError] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  // Fetch all customer ownerships
  const { data: ownershipsRes, isLoading: isListLoading, refetch: refetchList } = useOwnershipList();

  // Fetch ownership detail if selected
  const { data: detailData, isLoading: isDetailLoading } = useOwnershipDetail(selectedId || '');

  // Transfer mutation
  const transferMutation = useTransferOwnership();

  const handleSelect = (item: any) => {
    setSelectedId(item.ownership_id);
    setSelectedProductId(item.product_id);
    setView('detail');
  };

  const handleTransferSubmit = async () => {
    if (!selectedProductId) return;
    if (!newOwnerEmail.trim()) {
      setTransferError('Vui lòng nhập email người nhận');
      return;
    }

    setTransferError(null);
    setIsTransferring(true);

    try {
      await transferMutation.mutateAsync({
        product_id: selectedProductId,
        new_owner_email: newOwnerEmail.trim(),
      });
      alert('Chuyển quyền sở hữu thành công!');
      setNewOwnerEmail('');
      setView('list');
      refetchList();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Chuyển quyền sở hữu thất bại.';
      setTransferError(msg);
    } finally {
      setIsTransferring(false);
    }
  };

  const filteredOwnerships = (ownershipsRes?.data || []).filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.product_name.toLowerCase().includes(query) ||
      item.product_sku.toLowerCase().includes(query) ||
      item.owner_name.toLowerCase().includes(query)
    );
  });

  if (view === 'transfer' && detailData) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-4">
        <TopAppBar title="Chuyển quyền sở hữu" showBack={true} onBackClick={() => setView('detail')} />
        <div className="p-4">
          <Card className="p-4 space-y-4">
            <h2 className="font-bold text-lg">{detailData.product_name}</h2>
            <p className="text-sm text-slate-500">SKU: {detailData.product_sku}</p>

            {transferError && (
              <div className="p-3 text-xs bg-red-100 border border-red-200 text-red-700 rounded-lg">
                {transferError}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Email người nhận mới</label>
                <input
                  type="email"
                  placeholder="Nhập email người nhận"
                  value={newOwnerEmail}
                  onChange={(e) => setNewOwnerEmail(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setView('detail')} disabled={isTransferring}>
                  Quay lại
                </Button>
                <Button className="flex-1" onClick={handleTransferSubmit} disabled={isTransferring}>
                  {isTransferring ? 'Đang chuyển...' : 'Xác nhận chuyển'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (view === 'detail' && detailData) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-4">
        <TopAppBar title="Chi tiết sở hữu" showBack={true} onBackClick={() => setView('list')} />
        <div className="p-4 space-y-4">
          {isDetailLoading ? (
            <div className="text-center py-8 text-slate-500">Đang tải chi tiết...</div>
          ) : (
            <Card className="p-4 space-y-4">
              <h2 className="font-bold text-lg">{detailData.product_name}</h2>
              <div className="border-t pt-4 space-y-2">
                <h3 className="font-semibold text-sm text-slate-800">Thông tin sản phẩm</h3>
                <p className="text-sm">
                  <span className="text-slate-500">Mã SKU:</span> {detailData.product_sku}
                </p>
                <p className="text-sm">
                  <span className="text-slate-500">ID Sản phẩm:</span> {detailData.product_id}
                </p>
              </div>
              <div className="border-t pt-4 space-y-2">
                <h3 className="font-semibold text-sm text-slate-800">Thông tin sở hữu hiện tại</h3>
                <p className="text-sm">
                  <span className="text-slate-500">Người sở hữu:</span> {detailData.owner_name}
                </p>
                <p className="text-sm">
                  <span className="text-slate-500">Email:</span> {detailData.owner_email}
                </p>
                <p className="text-sm">
                  <span className="text-slate-500">Số điện thoại:</span> {detailData.owner_phone}
                </p>
                <p className="text-sm">
                  <span className="text-slate-500">Ngày đăng ký:</span>{' '}
                  {new Date(detailData.registration_date).toLocaleDateString('vi-VN')}
                </p>
                <p className="text-sm">
                  <span className="text-slate-500">Trạng thái:</span>{' '}
                  <span
                    className={`font-semibold ${
                      detailData.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {detailData.status}
                  </span>
                </p>
              </div>

              {detailData.ownership_history && detailData.ownership_history.length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <h3 className="font-semibold text-sm text-slate-800">Lịch sử sở hữu</h3>
                  <div className="space-y-3">
                    {detailData.ownership_history.map((hist, index) => (
                      <div key={index} className="text-xs bg-slate-50 p-2 rounded border border-slate-100 space-y-1">
                        <p className="font-semibold text-slate-700">{hist.owner_name}</p>
                        <p className="text-slate-500">{hist.owner_email} | {hist.owner_phone}</p>
                        <p className="text-slate-400">
                          {new Date(hist.registration_date).toLocaleDateString('vi-VN')} 
                          {hist.ended_at ? ` - ${new Date(hist.ended_at).toLocaleDateString('vi-VN')}` : ' (Hiện tại)'}
                        </p>
                        <p className="text-slate-500">Trạng thái: {hist.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detailData.status === 'ACTIVE' && (
                <Button className="w-full" onClick={() => setView('transfer')}>
                  Chuyển quyền sở hữu
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-4">
      <TopAppBar title="Lịch sử sở hữu" showBack={true} onBackClick={onBack} />
      <div className="p-4 space-y-4">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium" onClick={onRegister}>
          Đăng ký sở hữu mới
        </Button>
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm đã sở hữu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isListLoading ? (
          <div className="text-center py-12 text-slate-500">Đang tải danh sách sở hữu...</div>
        ) : filteredOwnerships.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Bạn chưa đăng ký sở hữu sản phẩm nào.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOwnerships.map((item) => (
              <Card
                key={item.ownership_id}
                className="p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSelect(item)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">{item.product_name}</h3>
                    <p className="text-xs text-slate-400">SKU: {item.product_sku}</p>
                    <p className="text-xs text-slate-500">
                      Ngày sở hữu: {new Date(item.registration_date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.status}
                  </span>
                  <ChevronRight className="text-slate-400" size={16} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Ownership;
