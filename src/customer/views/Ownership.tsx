import { useState } from 'react';
import { TopAppBar } from '../components/layout/TopAppBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Clock, ChevronRight } from 'lucide-react';

const ownershipHistory = [
  { 
    id: '1', 
    name: 'Máy lọc nước RO Kangaroo VT3', 
    date: '15/09/2023', 
    ownerName: 'Nguyễn Văn An', 
    ownershipType: 'Primary', 
    status: 'Active',
    productCode: 'P001',
    description: 'Máy lọc nước RO Kangaroo VT3 với công nghệ lọc ngược thẩm thấu hiện đại.',
    quantity: 10,
    serialNumber: 'SN-987654321',
    category: 'Thiết bị gia dụng',
    variant: 'Standard',
    manufacturer: 'Kangaroo VN',
    batch: 'B-2024',
    origin: 'Vietnam',
    productionDate: '2024-01-01',
    expiryDate: '2026-01-01',
    warrantyInfo: 'Bảo hành 24 tháng'
  },
  { 
    id: '2', 
    name: 'Tấm pin năng lượng mặt trời JA Solar', 
    date: '20/12/2024', 
    ownerName: 'Trần Thị Bình', 
    ownershipType: 'Secondary', 
    status: 'Inactive',
    productCode: 'P002',
    description: 'Tấm pin năng lượng mặt trời hiệu suất cao.',
    quantity: 5,
    serialNumber: 'SN-123456789',
    category: 'Năng lượng',
    variant: 'Premium',
    manufacturer: 'JA Solar',
    batch: 'B-2025',
    origin: 'China',
    productionDate: '2024-12-01',
    expiryDate: '2027-12-01',
    warrantyInfo: 'Bảo hành 36 tháng'
  },
];

export function Ownership({ onBack, onRegister }: { onBack: () => void; onRegister: () => void }) {
  const [view, setView] = useState<'list' | 'detail' | 'transfer'>('list');
  const [selected, setSelected] = useState<any>(null);

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
            <h2 className="font-bold text-lg">{selected.name}</h2>
            <div className="border-t pt-4 space-y-2">
              <h3 className='font-semibold'>Thông tin sản phẩm</h3>
              <p className="text-sm"><span className="text-slate-500">Mã:</span> {selected.productCode}</p>
              <p className="text-sm"><span className="text-slate-500">Danh mục:</span> {selected.category}</p>
              <p className="text-sm"><span className="text-slate-500">Biến thể:</span> {selected.variant}</p>
              <p className="text-sm"><span className="text-slate-500">Mô tả:</span> {selected.description}</p>
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
              <h3 className='font-semibold'>Thông tin sở hữu & Bảo hành</h3>
              <p className="text-sm"><span className="text-slate-500">Người sở hữu:</span> {selected.ownerName}</p>
              <p className="text-sm"><span className="text-slate-500">Loại sở hữu:</span> {selected.ownershipType}</p>
              <p className="text-sm"><span className="text-slate-500">Ngày sở hữu:</span> {selected.date}</p>
              <p className="text-sm"><span className="text-slate-500">Bảo hành:</span> {selected.warrantyInfo}</p>
              <p className="text-sm"><span className="text-slate-500">Trạng thái:</span> {selected.status}</p>
            </div>
            <Button className="w-full" onClick={() => setView('transfer')}>Chuyển quyền sở hữu</Button>
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
        {ownershipHistory.map(item => (
          <Card key={item.id} className="p-4 flex items-center justify-between cursor-pointer" onClick={() => handleSelect(item)}>
            <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-sm text-slate-500">Ngày sở hữu: {item.date}</p>
                </div>
            </div>
            <ChevronRight className="text-slate-400" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Ownership;
