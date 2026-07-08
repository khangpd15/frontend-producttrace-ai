import { useState } from 'react';
import { TopAppBar } from '../components/layout/TopAppBar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ShieldCheck, AlertTriangle, Upload, Check } from 'lucide-react';

const ownedProducts = [
  { id: '1', name: 'Máy lọc nước RO Kangaroo VT3', status: 'Còn bảo hành', expireDate: '15/09/2026' },
  { id: '2', name: 'Tấm pin năng lượng mặt trời JA Solar', status: 'Còn bảo hành', expireDate: '20/12/2027' },
];

export function Warranty({ onBack }: { onBack: () => void }) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [view, setView] = useState<'list' | 'detail' | 'form'>('list');
  const [submitted, setSubmitted] = useState(false);

  const handleCreateClaim = (product: any) => {
    setSelectedProduct(product);
    setView('form');
    setSubmitted(false);
  };

  const handleViewDetail = (product: any) => {
    setSelectedProduct(product);
    setView('detail');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-4">
        <TopAppBar title="Yêu cầu bảo hành" showBack={true} onBackClick={() => { setView('list'); setSubmitted(false); }} />
        <div className="p-4 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mt-10">
            <Check size={32} />
          </div>
          <h2 className="text-xl font-bold">Yêu cầu đã được gửi!</h2>
          <p className="text-slate-500">Chúng tôi sẽ sớm liên hệ với bạn để hỗ trợ.</p>
          <Button onClick={() => { setView('list'); setSubmitted(false); }} className="w-full">Quay lại danh sách</Button>
        </div>
      </div>
    );
  }

  if (view === 'detail') {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-4">
        <TopAppBar title="Chi tiết bảo hành" showBack={true} onBackClick={() => setView('list')} />
        <div className="p-4 space-y-4">
          <Card className="p-4 space-y-3">
            <h2 className="font-bold text-lg">{selectedProduct?.name}</h2>
            <div className='border-t pt-2 space-y-1'>
                <p className='text-sm'><span className='text-slate-500'>Mã bảo hành:</span> W-12345</p>
                <p className='text-sm'><span className='text-slate-500'>Ngày kích hoạt:</span> 15/09/2024</p>
                <p className='text-sm'><span className='text-slate-500'>Hạn bảo hành:</span> {selectedProduct?.expireDate}</p>
                <p className='text-sm'><span className='text-slate-500'>Trạng thái:</span> <Badge variant="success">{selectedProduct?.status}</Badge></p>
            </div>
            <Button onClick={() => handleCreateClaim(selectedProduct)} className="w-full flex gap-2 items-center"><AlertTriangle size={16}/> Tạo yêu cầu bảo hành</Button>
          </Card>
        </div>
      </div>
    );
  }

  if (view === 'form') {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-4">
        <TopAppBar title="Tạo yêu cầu bảo hành" showBack={true} onBackClick={() => setView('list')} />
        <div className="p-4 space-y-4">
          <Card className="p-4">
            <h3 className="font-bold">{selectedProduct?.name}</h3>
            <p className="text-sm text-slate-500">Mã sản phẩm: {selectedProduct?.id}</p>
          </Card>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả sự cố</label>
            <textarea className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."></textarea>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Hình ảnh/Video lỗi</label>
            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50">
              <Upload />
              <span className="text-sm mt-2">Tải lên hình ảnh/video</span>
            </div>
          </div>
          
          <Button onClick={() => setSubmitted(true)} className="w-full">Gửi yêu cầu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-4">
      <TopAppBar title="Sản phẩm của tôi" showBack={true} onBackClick={onBack} />
      <div className="p-4 space-y-4">
        <div className="relative">
          <input type="text" placeholder="Tìm kiếm sản phẩm..." className="w-full pl-4 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm" />
        </div>
        {ownedProducts.map(product => (
          <Card key={product.id} className="p-4 space-y-3">
            <div className='flex items-center gap-2'>
              <ShieldCheck className='text-green-500'/>
              <h2 className="font-bold text-lg">{product.name}</h2>
            </div>
            <Button onClick={() => handleViewDetail(product)} variant="secondary" className="w-full">Xem chi tiết bảo hành</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
