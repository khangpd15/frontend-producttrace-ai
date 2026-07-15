import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../components/layout/TopAppBar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Package, MapPin, User, List, ShieldCheck, AlertCircle } from 'lucide-react';
import { ProductDetailData } from '../types';
import { traceApi } from '../../features/trace/api/trace.api';
import { productApi } from '../../features/products/api/product.api';
import { ownershipApi } from '../../api/ownership.api';

export function ProductDetail({ onBack, onRequestWarranty, onRegisterOwnership }: { onBack: () => void; onRequestWarranty: () => void; onRegisterOwnership: () => void }) {
  const navigate = useNavigate();
  const [productData, setProductData] = useState<ProductDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryParams = new URLSearchParams(window.location.search);
  const codeParam = queryParams.get('code');
  const idParam = queryParams.get('id');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        let realOwnership: any = undefined;

        if (codeParam) {
          // Fetch from Trace Search API (MOCKED FOR TESTING)
          // const { data } = await traceApi.search({ code: codeParam });
          // const traceRes = data.data;

          const traceRes: any = {
            productItem: {
              itemId: '55555555-5555-5555-5555-555555555555',
              itemCode: 'PTA-2026-TEST0001',
              serialNumber: codeParam,
              status: 'IN_STOCK',
              productName: 'Laptop Test MOCK',
            },
            timeline: [],
            matchedEventsCount: 0
          };

          if (!traceRes || !traceRes.productItem) {
            setError('Không tìm thấy sản phẩm với mã đã nhập.');
            setProductData(null);
            return;
          }

          const item = traceRes.productItem;
          
          try {
            const { data: ownRes } = await ownershipApi.getById(item.itemId);
            if (ownRes.data) {
                realOwnership = {
                  ownerName: ownRes.data.owner_name,
                  status: ownRes.data.status
                };
            }
          } catch (e) {
             console.warn("No ownership found or failed to fetch", e);
          }

          // Map to ProductDetailData
          const mapped: ProductDetailData = {
            item: {
              id: item.itemId,
              itemCode: item.itemCode,
              serialNumber: item.serialNumber,
              status: item.status,
            },
            product: {
              id: '',
              code: '',
              name: item.productName,
              description: 'Thông tin được cập nhật qua Trace System.',
              categoryId: '',
              status: 'ACTIVE',
              quantity: 0,
              createdAt: '',
              updatedAt: '',
              updatedBy: '',
            },
            category: { name: 'Sản phẩm truy xuất', code: 'TRACED' },
            variant: { sku: 'N/A', name: 'Standard', price: 0, currency: 'VND' },
            batch: {
              batchCode: 'N/A',
              manufactureDate: 'N/A',
              expiryDate: 'N/A',
              manufacturerName: 'N/A',
              originCountry: 'N/A',
              status: 'ACTIVE',
            },
            location: { name: 'Hệ thống phân phối', address: 'Đang cập nhật', type: 'STORE' },
            ownership: realOwnership,
            warranty: undefined,
            events: traceRes.timeline.map((e: any) => ({
              type: e.eventType,
              title: e.title,
              description: e.description,
              createdAt: e.timestamp ? new Date(e.timestamp).toLocaleDateString('vi-VN') : '',
              actor: { name: 'Hệ thống', role: 'System' },
              location: { name: e.location || 'N/A', address: '' },
              attachments: [],
            })),
            lifecycle: [],
            documents: [],
            statistics: {
              scanCount: traceRes.matchedEventsCount || 0,
              transferCount: 0,
              warrantyCount: 0,
              eventCount: traceRes.timeline.length,
            },
          };
          setProductData(mapped);
        } else if (idParam) {
          // Fetch from Product Detail API
          const { data } = await productApi.getById(idParam);
          const p = data.data;

          if (!p) {
            setError('Không tìm thấy thông tin chi tiết sản phẩm.');
            setProductData(null);
            return;
          }

          const firstItem = p.items && p.items[0];
          const firstVariant = p.variants && p.variants[0];
          const firstBatch = p.batches && p.batches[0];

          try {
             // For generic products from catalog, we check if the user owns ANY instance of this product by name
             // (Or by code if available in backend)
             const { data: ownRes } = await ownershipApi.search({ product_name: p.name, limit: 1 });
             if (ownRes.data && ownRes.data.data && ownRes.data.data.length > 0) {
                const owned = ownRes.data.data[0];
                realOwnership = {
                  ownerName: owned.owner_name,
                  status: owned.status
                };
             }
          } catch (e) {
             console.warn("No ownership found or failed to fetch", e);
          }

          const mapped: ProductDetailData = {
            item: {
              id: firstItem ? firstItem.id : p.id,
              itemCode: firstItem ? firstItem.itemCode : 'N/A',
              serialNumber: firstItem ? firstItem.serialNumber : 'N/A',
              status: firstItem ? firstItem.status : 'N/A',
            },
            product: {
              id: p.id,
              code: p.slug,
              name: p.name,
              description: p.description,
              categoryId: p.categoryId,
              status: p.status,
              quantity: p.totalVariants,
              createdAt: p.createdAt,
              updatedAt: p.updatedAt,
              updatedBy: 'Admin',
            },
            category: { name: p.category, code: '' },
            variant: {
              sku: firstVariant ? firstVariant.sku : 'N/A',
              name: firstVariant ? firstVariant.name : 'Standard',
              price: firstVariant ? firstVariant.price : 0,
              currency: firstVariant ? firstVariant.currency : 'VND',
            },
            batch: {
              batchCode: firstBatch ? firstBatch.batchCode : 'N/A',
              manufactureDate: firstBatch ? new Date(firstBatch.manufactureDate).toLocaleDateString('vi-VN') : 'N/A',
              expiryDate: firstBatch ? new Date(firstBatch.expiryDate).toLocaleDateString('vi-VN') : 'N/A',
              manufacturerName: firstBatch ? firstBatch.supplierName : 'N/A',
              originCountry: firstBatch ? firstBatch.originCountry : 'N/A',
              status: firstBatch ? firstBatch.status : 'ACTIVE',
            },
            location: {
              name: firstItem && firstItem.locationName ? firstItem.locationName : 'Hệ thống kho',
              address: 'Đang cập nhật',
              type: 'WAREHOUSE',
            },
            ownership: realOwnership,
            warranty: undefined,
            events: p.traceEvents ? p.traceEvents.map((e) => ({
              type: e.type.toUpperCase(),
              title: e.event,
              description: e.detail,
              createdAt: e.timestamp ? new Date(e.timestamp).toLocaleDateString('vi-VN') : '',
              actor: { name: e.actor, role: '' },
              location: { name: e.location, address: '' },
              attachments: [],
            })) : [],
            lifecycle: [],
            documents: [],
            statistics: {
              scanCount: 0,
              transferCount: 0,
              warrantyCount: p.totalWarranties,
              eventCount: p.traceEvents ? p.traceEvents.length : 0,
            },
          };
          setProductData(mapped);
        } else {
          setError('Thiếu thông số truy xuất hoặc mã sản phẩm.');
        }
      } catch (err: any) {
        console.error('Failed to load product detail', err);
        setError(err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi tải dữ liệu.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [codeParam, idParam]);

  const handleBackClick = () => {
    onBack();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        <TopAppBar title="Chi tiết sản phẩm" showBack={true} onBackClick={handleBackClick} />
        <div className="pt-24 px-4 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        <TopAppBar title="Chi tiết sản phẩm" showBack={true} onBackClick={handleBackClick} />
        <div className="pt-24 px-4 max-w-md mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Lỗi tải dữ liệu</h3>
          <p className="text-sm text-slate-500">{error || 'Không tìm thấy sản phẩm.'}</p>
          <Button onClick={handleBackClick} className="w-full">Quay lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <TopAppBar title="Chi tiết sản phẩm" showBack={true} onBackClick={handleBackClick} />
      
      <div className="pt-20 p-4 space-y-6">
        {/* Header */}
        <Card className="p-4 space-y-4">
            <div className='flex items-center gap-4'>
                <div className='w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400'>
                  <Package size={32} />
                </div>
                <div className='flex-1'>
                    <h1 className='text-lg font-bold'>{productData.product.name}</h1>
                    <p className='text-sm text-slate-500'>{productData.category.name}</p>
                    <p className='text-xs text-slate-400'>{productData.variant.name}</p>
                </div>
            </div>
            <div className='flex justify-between items-center'>
                <Badge variant="success">{productData.item.status}</Badge>
                <Badge variant="secondary">Authentic</Badge>
            </div>
        </Card>

        {/* Specifications */}
        <Card className="p-4 space-y-2">
            <h2 className='font-bold'>Thông số kỹ thuật</h2>
            <div className='text-sm grid grid-cols-2 gap-2'>
                <p><span className='text-slate-500'>SKU:</span> {productData.variant.sku}</p>
                <p><span className='text-slate-500'>Barcode:</span> N/A</p>
                <p className='col-span-2'><span className='text-slate-500'>Mô tả:</span> {productData.product.description}</p>
            </div>
        </Card>

        {/* Manufacturing */}
        <Card className="p-4 space-y-2">
            <h2 className='font-bold'>Thông tin sản xuất</h2>
            <div className='text-sm grid grid-cols-2 gap-2'>
                <p><span className='text-slate-500'>NSX:</span> {productData.batch.manufacturerName}</p>
                <p><span className='text-slate-500'>Lô:</span> {productData.batch.batchCode}</p>
                <p><span className='text-slate-500'>Xuất xứ:</span> {productData.batch.originCountry}</p>
                <p><span className='text-slate-500'>Ngày SX:</span> {productData.batch.manufactureDate}</p>
                <p><span className='text-slate-500'>HSD:</span> {productData.batch.expiryDate}</p>
            </div>
        </Card>

        {/* Ownership & Warranty */}
        <Card className="p-4 space-y-2">
            <h2 className='font-bold'>Sở hữu & Bảo hành</h2>
            <p className='text-sm'><span className='text-slate-500'>Chủ sở hữu:</span> {productData.ownership?.ownerName || 'N/A'}</p>
            {productData.ownership?.status && (
              <p className='text-sm flex items-center gap-2'>
                <span className='text-slate-500'>Trạng thái:</span> 
                <Badge variant={productData.ownership.status === 'PENDING' ? 'warning' : (productData.ownership.status === 'REVOKED' ? 'error' : 'success')}>
                  {productData.ownership.status === 'PENDING' ? 'Đang chờ duyệt' : (productData.ownership.status === 'REVOKED' ? 'Bị thu hồi' : 'Đang sở hữu')}
                </Badge>
              </p>
            )}
            <p className='text-sm'><span className='text-slate-500'>Bảo hành:</span> {productData.warranty?.warrantyStatus || 'N/A'}</p>
            {(!productData.ownership?.ownerName || productData.ownership?.status === 'REVOKED') && <Button onClick={onRegisterOwnership} className='w-full cursor-pointer'>Đăng ký sở hữu</Button>}
            <Button onClick={onRequestWarranty} className='w-full cursor-pointer'>Yêu cầu bảo hành</Button>
        </Card>

        {/* Location */}
        <Card className="p-4 space-y-2">
            <h2 className='font-bold'>Vị trí hiện tại</h2>
            <p className='text-sm'>{productData.location.name}</p>
            <p className='text-xs text-slate-500'>{productData.location.address}</p>
        </Card>

        {/* Events */}
        <Card className="p-4 space-y-4">
            <h2 className='font-bold flex items-center gap-2'><List size={20} /> Lịch sử truy vết</h2>
            {productData.events.length === 0 ? (
              <p className="text-xs text-slate-500">Chưa có thông tin sự kiện truy vết nào.</p>
            ) : (
              productData.events.map((e, i) => (
                  <div key={i} className='border-l-2 border-blue-200 pl-4 py-2 relative'>
                      <div className="absolute -left-[5px] top-3.5 w-2 h-2 bg-blue-500 rounded-full" />
                      <p className='font-bold text-sm'>{e.title}</p>
                      <p className='text-xs text-slate-500'>{e.description}</p>
                      <p className='text-xs text-slate-400 mt-1'>{e.createdAt} {e.actor.name ? `- ${e.actor.name}` : ''} {e.actor.role ? `(${e.actor.role})` : ''}</p>
                      {e.location.name && (
                        <p className='text-xs text-blue-500 mt-1 flex items-center gap-1'>
                            <MapPin size={12}/> {e.location.name}
                        </p>
                      )}
                  </div>
              ))
            )}
        </Card>
      </div>
    </div>
  );
}

export default ProductDetail;
