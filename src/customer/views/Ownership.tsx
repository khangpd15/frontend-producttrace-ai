import { useState, useEffect } from 'react';
import { TopAppBar } from '../components/layout/TopAppBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Clock, ChevronRight } from 'lucide-react';
import { ownershipApi, OwnershipSummaryRes } from '../../features/ownership/api/ownership.api';

export function Ownership({ onBack, onRegister }: { onBack: () => void; onRegister: () => void }) {
  const [view, setView] = useState<'list' | 'detail' | 'transfer'>('list');
  const [selected, setSelected] = useState<any>(null);
  const [ownershipHistory, setOwnershipHistory] = useState<OwnershipSummaryRes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerships = async () => {
      try {
        setLoading(true);
        const { data } = await ownershipApi.search({ page: 1, limit: 20 });
        setOwnershipHistory(data.data?.data || []);
      } catch (err) {
        console.error('Lỗi khi tải danh sách quyền sở hữu', err);
      } finally {
        setLoading(false);
      }
    };
    if (view === 'list') {
      fetchOwnerships();
    }
  }, [view]);

  useEffect(() => {
    // Real-time EventSource Setup for Customer
    const token = localStorage.getItem('producttrace_access_token');
    if (!token) return;
    
    let sse: EventSource;
    try {
      sse = new EventSource(`http://localhost:8080/api/ownership/stream?token=${token}`);
      
      sse.onmessage = (event) => {
        if (event.data === 'OWNERSHIP_VERDICT') {
          // Báo cho UI của customer là đăng ký đã đổi trạng thái (Approve hoặc Reject)
          alert('TRẠNG THÁI ĐĂNG KÝ VỪA MỚI ĐƯỢC ADMIN CẬP NHẬT!');
          if (view === 'list') {
            // refresh data
            const fetchOwnerships = async () => {
              try {
                setLoading(true);
                const { data } = await ownershipApi.search({ page: 1, limit: 20 });
                setOwnershipHistory(data.data?.data || []);
              } catch (err) {} finally {
                setLoading(false);
              }
            };
            fetchOwnerships();
          } else {
             // force back to list to refresh smoothly
             setView('list');
          }
        }
      };

      sse.onerror = (err) => {
        console.error('SSE Error:', err);
        sse.close();
      };
    } catch (err) {
      console.warn('Real-time updates failed to initialize.', err);
    }
    
    return () => {
      if (sse) sse.close();
    };
  }, [view]);

  const handleSelect = (item: any) => {
    setSelected(item);
    setView('detail');
  };

  if (view === 'transfer' && selected) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-4">
        <TopAppBar title="Chuyển quyền sở hữu" showBack={true} onBackClick={() => setView('detail')} />
        <div className="p-4">
          <Card className="p-4 space-y-4">
            <h2 className="font-bold text-lg">{selected.name}</h2>
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium">Người nhận mới</label>
                    <input type="text" placeholder="Nhập tên người nhận" className="w-full p-3 border rounded-lg" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Email người nhận</label>
                    <input type="email" placeholder="Nhập email người nhận" className="w-full p-3 border rounded-lg" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Số điện thoại</label>
                    <input type="tel" placeholder="Nhập số điện thoại" className="w-full p-3 border rounded-lg" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Lý do chuyển</label>
                    <textarea placeholder="Nhập lý do chuyển..." className="w-full p-3 border rounded-lg h-24" />
                </div>
                <Button className="w-full" onClick={() => setView('list')}>Xác nhận chuyển quyền</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (view === 'detail' && selected) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-4">
        <TopAppBar title="Chi tiết sở hữu" showBack={true} onBackClick={() => setView('list')} />
        <div className="p-4 space-y-4">
          <Card className="p-4 space-y-4">
            <h2 className="font-bold text-lg">{selected.product_name}</h2>
            <div className="border-t pt-4 space-y-2">
              <h3 className='font-semibold'>Thông tin sản phẩm</h3>
              <p className="text-sm"><span className="text-slate-500">SKU:</span> {selected.product_sku}</p>
            </div>
            <div className="border-t pt-4 space-y-2">
              <h3 className='font-semibold'>Thông tin sản xuất</h3>
              <p className="text-sm"><span className="text-slate-500">NSX:</span> {selected.manufacturer}</p>
              <p className="text-sm"><span className="text-slate-500">Lô:</span> {selected.batch}</p>
              <p className="text-sm"><span className="text-slate-500">Xuất xứ:</span> {selected.origin}</p>
              <p className="text-sm"><span className="text-slate-500">Ngày SX:</span> {selected.productionDate}</p>
              <p className="text-sm"><span className="text-slate-500">HSD:</span> {selected.expiryDate}</p>
            </div>
            <div className="border-t pt-4 space-y-2">
              <h3 className='font-semibold'>Thông tin sở hữu</h3>
              <p className="text-sm"><span className="text-slate-500">Người sở hữu:</span> {selected.owner_name}</p>
              <p className="text-sm"><span className="text-slate-500">SĐT:</span> {selected.owner_phone}</p>
              <p className="text-sm"><span className="text-slate-500">Email:</span> {selected.owner_email}</p>
              <p className="text-sm"><span className="text-slate-500">Ngày sở hữu:</span> {new Date(selected.registration_date).toLocaleDateString('vi-VN')}</p>
              <p className="text-sm"><span className="text-slate-500">Trạng thái:</span> 
                 {selected.status === 'PENDING' ? (
                   <span className="ml-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">Đang chờ duyệt</span>
                 ) : selected.status === 'ACTIVE' ? (
                   <span className="ml-1 text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">Đã kích hoạt</span>
                 ) : selected.status}
              </p>
            </div>
            {selected.status !== 'PENDING' && (
              <Button className="w-full" onClick={() => setView('transfer')}>Chuyển quyền sở hữu</Button>
            )}
            </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-4">
      <TopAppBar title="Lịch sử sở hữu" showBack={true} onBackClick={onBack} />
      <div className="p-4 space-y-4">
        <Button className="w-full" onClick={onRegister}>Đăng ký sở hữu mới</Button>
        <div className="relative">
          <input type="text" placeholder="Tìm kiếm lịch sử sở hữu..." className="w-full pl-4 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm" />
        </div>
        {loading ? (
          <p className="text-center text-slate-500">Đang tải...</p>
        ) : ownershipHistory.length === 0 ? (
          <p className="text-center text-slate-500 text-sm">Chưa đăng ký sở hữu thiết bị nào.</p>
        ) : (
          ownershipHistory.map(item => (
            <Card key={item.ownership_id} className="p-4 flex items-center justify-between cursor-pointer" onClick={() => handleSelect(item)}>
              <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold flex items-center gap-2">
                       {item.product_name}
                       {item.status === 'PENDING' && <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-bold uppercase">Chờ duyệt</span>}
                    </h3>
                    <p className="text-sm text-slate-500">Ngày sở hữu: {new Date(item.registration_date).toLocaleDateString('vi-VN')}</p>
                  </div>
              </div>
              <ChevronRight className="text-slate-400" />
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default Ownership;
