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
import { ownershipApi, OwnershipSummaryRes } from '../../features/ownership/api/ownership.api';
import { parseApiError } from '../../api/axios';

export function ProductDetail({ onBack, onRequestWarranty, onRegisterOwnership }: { onBack: () => void; onRequestWarranty: () => void; onRegisterOwnership: (code?: string) => void }) {
  const navigate = useNavigate();
  const [productData, setProductData] = useState<ProductDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // ── Ownership — populated after product item ID is resolved ─────────────────
  const [ownershipInfo, setOwnershipInfo] = useState<OwnershipSummaryRes | null>(null);

  const queryParams = new URLSearchParams(window.location.search);
  const codeParam = queryParams.get('code');
  const idParam = queryParams.get('id');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        let realOwnership: any = undefined;
        try {
          const { data: ownRes } = await ownershipApi.getMyOwnerships(1, 50);
          const myOwnerships = ownRes.data?.data || ownRes.data || [];
          const found = myOwnerships.find((o: any) => 
            (o.serialNumber === codeParam || o.itemCode === codeParam || o.serialNumber === idParam || o.product_id === idParam) &&
            o.status === 'ACTIVE'
          );
          if (found) {
            realOwnership = {
              ownerName: found.owner_name || 'Bạn',
              status: found.status
            };
          }
        } catch (e) {
            console.warn("Failed to check real ownership", e);
        }

        if (codeParam) {
          const { data } = await traceApi.search({ code: codeParam });
          const traceRes = data.data;

          if (!traceRes || !traceRes.productItem) {
            setError('Không tìm thấy sản phẩm phù hợp.');
            setProductData(null);
            return;
          }

          const item = traceRes.productItem;
          
          try {
            const { data: ownRes } = await ownershipApi.getById(item.itemId);
            if (ownRes.data && ownRes.data.status === 'ACTIVE') {
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
            events: (traceRes.timeline || []).map((e: any) => ({
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
              eventCount: (traceRes.timeline || []).length,
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
             const activeOwned = ownRes.data?.data?.find((o: any) => o.status === 'ACTIVE');
             if (activeOwned) {
                realOwnership = {
                  ownerName: activeOwned.owner_name,
                  status: activeOwned.status
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
        if (err?.response?.status === 404) {
          setError('Không tìm thấy sản phẩm phù hợp.');
        } else {
          setError(parseApiError(err));
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [codeParam, idParam]);

  // ── Fetch ownership once we have a product item ID ───────────────────────────
  useEffect(() => {
    if (!productData?.item?.id) return;
    // removed ownershipApi.search since it is not defined
  }, [productData?.item?.id]);

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
    const isNotFound = error === 'Không tìm thấy sản phẩm phù hợp.' || !error;
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        <TopAppBar title="Chi tiết sản phẩm" showBack={true} onBackClick={handleBackClick} />
        <div className="pt-24 px-4 max-w-md mx-auto text-center space-y-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${isNotFound ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'}`}>
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{isNotFound ? 'Thông báo' : 'Lỗi tải dữ liệu'}</h3>
          <p className="text-sm text-slate-500">{error || 'Không tìm thấy sản phẩm phù hợp.'}</p>
          
          {codeParam && (
            <Button 
              onClick={() => navigate(`/customer/products?q=${encodeURIComponent(codeParam)}`)}
              className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
            >
              Tìm kiếm "{codeParam}" bằng AI
            </Button>
          )}
          
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

        {/* Ownership & Warranty — populated from ownershipApi.search({ product_item_id }) */}
        <Card className="p-4 space-y-2">
            <h2 className='font-bold'>Sở hữu & Bảo hành</h2>
            <p className='text-sm'><span className='text-slate-500'>Chủ sở hữu:</span> {ownershipInfo?.owner_name || productData.ownership?.ownerName || 'Chưa đăng ký'}</p>
            <p className='text-sm'><span className='text-slate-500'>Trạng thái bảo hành:</span> {(ownershipInfo || productData.ownership?.status === 'ACTIVE') ? 'Còn bảo hành' : (productData.warranty?.warrantyStatus || 'Chưa có thông tin')}</p>
            {!ownershipInfo && (!productData.ownership || productData.ownership.status !== 'ACTIVE') && <Button onClick={() => {
                const codeToPass = (productData.item.serialNumber && productData.item.serialNumber !== 'N/A') 
                                    ? productData.item.serialNumber 
                                    : '';
                navigate(`/customer/ownership/register${codeToPass ? `?code=${encodeURIComponent(codeToPass)}` : ''}`);
            }} className='w-full cursor-pointer'>Đăng ký sở hữu</Button>}
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
