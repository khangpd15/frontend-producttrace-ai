import { useState } from 'react';
import { TopAppBar } from '../components/layout/TopAppBar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Package, MapPin, User, List, ShieldCheck } from 'lucide-react';
import { ProductDetailData } from '../types';

export function ProductDetail({ onBack, onRequestWarranty, onRegisterOwnership }: { onBack: () => void; onRequestWarranty: () => void; onRegisterOwnership: () => void }) {
  const product: ProductDetailData = {
    item: { id: '1', itemCode: 'QR-123456789', serialNumber: 'SN-987654321', status: 'IN_STOCK' },
    product: { id: '1', code: 'P001', name: 'Máy lọc nước RO Kangaroo VT3', description: 'Máy lọc nước RO Kangaroo VT3 với công nghệ lọc ngược thẩm thấu hiện đại.', categoryId: 'cat1', status: 'ACTIVE', quantity: 10, createdAt: '2024-01-01', updatedAt: '2024-01-01', updatedBy: 'Admin' },
    category: { name: 'Thiết bị gia dụng', code: 'GADGET' },
    variant: { sku: 'SKU-001', name: 'Standard', price: 3500000, currency: 'VND' },
    batch: { batchCode: 'B-2024', manufactureDate: '2024-01-01', expiryDate: '2026-01-01', manufacturerName: 'Kangaroo VN', originCountry: 'Vietnam', status: 'ACTIVE' },
    location: { name: 'Kho Miền Nam', address: '123 Nguyễn Văn Linh, Q7', type: 'WAREHOUSE' },
    // ownership: { ownerName: 'Nguyễn Văn An', ownershipType: 'PRIMARY', purchaseDate: '2024-05-15', status: 'ACTIVE' },
    ownership: undefined,
    warranty: { warrantyId: 'W-987654', productId: '1', activationDate: '2024-05-15', expiryDate: '2026-05-15', warrantyStatus: 'ACTIVE', warrantyPeriodMonths: 24 },
    events: [
      { type: 'PRODUCED', title: 'Sản xuất', description: 'Sản phẩm được đóng gói', createdAt: '2024-01-01', actor: { name: 'Công nhân A', role: 'Staff' }, location: { name: 'Nhà máy 1', address: 'KCN Tân Bình' }, attachments: [] },
      { type: 'SALE', title: 'Bán hàng', description: 'Đã bán', createdAt: '2024-05-15', actor: { name: 'Cửa hàng A', role: 'Dealer' }, location: { name: 'Cửa hàng A', address: '123 Nguyễn Huệ' }, attachments: [] },
    ],
    lifecycle: ['PRODUCED', 'PACKED', 'WAREHOUSE_IN', 'SOLD'],
    documents: [],
    statistics: { scanCount: 15, transferCount: 2, warrantyCount: 0, eventCount: 2 },
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <TopAppBar title="Chi tiết sản phẩm" showBack={true} onBackClick={onBack} />
      
      <div className="pt-20 p-4 space-y-6">
        {/* Header */}
        <Card className="p-4 space-y-4">
            <div className='flex items-center gap-4'>
                <div className='w-20 h-20 bg-slate-200 rounded-lg'></div>
                <div className='flex-1'>
                    <h1 className='text-lg font-bold'>{product.product.name}</h1>
                    <p className='text-sm text-slate-500'>{product.category.name}</p>
                    <p className='text-xs text-slate-400'>{product.variant.name}</p>
                </div>
            </div>
            <div className='flex justify-between items-center'>
                <Badge variant="success">{product.item.status}</Badge>
                <Badge variant="secondary">Authentic</Badge>
            </div>
        </Card>

        {/* Specifications */}
        <Card className="p-4 space-y-2">
            <h2 className='font-bold'>Thông số kỹ thuật</h2>
            <div className='text-sm grid grid-cols-2 gap-2'>
                <p><span className='text-slate-500'>SKU:</span> {product.variant.sku}</p>
                <p><span className='text-slate-500'>Barcode:</span> N/A</p>
                <p className='col-span-2'><span className='text-slate-500'>Mô tả:</span> {product.product.description}</p>
            </div>
        </Card>

        {/* Manufacturing */}
        <Card className="p-4 space-y-2">
            <h2 className='font-bold'>Thông tin sản xuất</h2>
            <div className='text-sm grid grid-cols-2 gap-2'>
                <p><span className='text-slate-500'>NSX:</span> {product.batch.manufacturerName}</p>
                <p><span className='text-slate-500'>Lô:</span> {product.batch.batchCode}</p>
                <p><span className='text-slate-500'>Xuất xứ:</span> {product.batch.originCountry}</p>
                <p><span className='text-slate-500'>Ngày SX:</span> {product.batch.manufactureDate}</p>
                <p><span className='text-slate-500'>HSD:</span> {product.batch.expiryDate}</p>
            </div>
        </Card>

        {/* Ownership & Warranty */}
        <Card className="p-4 space-y-2">
            <h2 className='font-bold'>Sở hữu & Bảo hành</h2>
            <p className='text-sm'><span className='text-slate-500'>Chủ sở hữu:</span> {product.ownership?.ownerName || 'N/A'}</p>
            <p className='text-sm'><span className='text-slate-500'>Bảo hành:</span> {product.warranty?.warrantyStatus || 'N/A'}</p>
            {!product.ownership?.ownerName && <Button onClick={onRegisterOwnership} className='w-full'>Đăng ký sở hữu</Button>}
            <Button onClick={onRequestWarranty} className='w-full'>Yêu cầu bảo hành</Button>
        </Card>

        {/* Location */}
        <Card className="p-4 space-y-2">
            <h2 className='font-bold'>Vị trí hiện tại</h2>
            <p className='text-sm'>{product.location.name}</p>
            <p className='text-xs text-slate-500'>{product.location.address}</p>
        </Card>

        {/* Events */}
        <Card className="p-4 space-y-4">
            <h2 className='font-bold flex items-center gap-2'><List size={20} /> Lịch sử truy vết</h2>
            {product.events.map((e, i) => (
                <div key={i} className='border-l-2 border-blue-200 pl-4 py-2'>
                    <p className='font-bold text-sm'>{e.title}</p>
                    <p className='text-xs text-slate-500'>{e.description}</p>
                    <p className='text-xs text-slate-400 mt-1'>{e.createdAt} - {e.actor.name} ({e.actor.role})</p>
                    <p className='text-xs text-blue-500 mt-1 flex items-center gap-1'>
                        <MapPin size={12}/> {e.location.name}
                    </p>
                </div>
            ))}
        </Card>

        {/* Actions */}
      </div>
    </div>
  );
}

export default ProductDetail;
