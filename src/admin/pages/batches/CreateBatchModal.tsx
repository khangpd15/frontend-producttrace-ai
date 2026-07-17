import React, { useState, useEffect } from 'react';
import { Package, Calendar, CheckCircle, X, MapPin, Truck } from 'lucide-react';
import Button from '../../components/ui/Button';
import { productApi } from '../../../features/products/api/product.api';
import { batchApi } from '../../../features/batch/api/batch.api';
import type { AdminProduct, AdminProductDetailVariant } from '../../../shared/types/domain';
import { parseApiError } from '../../../api/axios';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateBatchModal({ onClose, onSuccess }: Props) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [variants, setVariants] = useState<AdminProductDetailVariant[]>([]);
  
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    productId: '',
    variantId: '',
    prefix: '',
    manufactureDate: new Date().toISOString().substring(0, 10),
    expiryDate: '',
    manufacturer: '',
    supplier: '',
    originCountry: '',
    productionPlace: '',
    quantity: 100
  });

  // Load products list on mount
  useEffect(() => {
    setIsLoadingProducts(true);
    productApi.getAll({ limit: 100 })
      .then(res => {
        setProducts(res.data.data?.items ?? []);
      })
      .catch(err => {
        console.error('Lỗi tải sản phẩm', err);
        setFormError('Không thể tải danh sách sản phẩm');
      })
      .finally(() => {
        setIsLoadingProducts(false);
      });
  }, []);

  // Load variants when product changes
  useEffect(() => {
    if (!formData.productId) {
      setVariants([]);
      setFormData(prev => ({ ...prev, variantId: '' }));
      return;
    }
    setIsLoadingVariants(true);
    productApi.getById(formData.productId)
      .then(res => {
        setVariants(res.data.data?.variants ?? []);
        setFormData(prev => ({ ...prev, variantId: '' }));
      })
      .catch(err => {
        console.error('Lỗi tải biến thể', err);
        setFormError('Không thể tải danh sách biến thể sản phẩm');
        setVariants([]);
      })
      .finally(() => {
        setIsLoadingVariants(false);
      });
  }, [formData.productId]);

  const selectedProduct = products.find(p => p.id === formData.productId)?.name || '';
  const selectedVariant = variants.find(v => v.id === formData.variantId)?.name || '';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.productId) {
      setFormError('Sản phẩm là bắt buộc');
      return;
    }
    if (!formData.variantId) {
      setFormError('Biến thể sản phẩm là bắt buộc');
      return;
    }
    if (!formData.prefix.trim()) {
      setFormError('Prefix là bắt buộc (ví dụ: APL, KG)');
      return;
    }
    const cleanPrefix = formData.prefix.trim().toUpperCase();
    if (!/^[A-Z0-9]{2,20}$/.test(cleanPrefix)) {
      setFormError('Prefix phải từ 2-20 ký tự và chỉ chứa chữ cái A-Z hoặc số 0-9');
      return;
    }
    if (formData.quantity <= 0) {
      setFormError('Số lượng phải lớn hơn 0');
      return;
    }
    if (formData.quantity > 100000) {
      setFormError('Số lượng nhập tối đa là 100,000 sản phẩm');
      return;
    }
    if (!formData.manufactureDate) {
      setFormError('Ngày sản xuất là bắt buộc');
      return;
    }
    const mDate = new Date(formData.manufactureDate);
    if (mDate > new Date()) {
      setFormError('Ngày sản xuất không được lớn hơn ngày hiện tại');
      return;
    }
    if (!formData.expiryDate) {
      setFormError('Hạn sử dụng là bắt buộc');
      return;
    }
    const eDate = new Date(formData.expiryDate);
    if (eDate <= mDate) {
      setFormError('Hạn sử dụng phải lớn hơn ngày sản xuất');
      return;
    }
    if (!formData.originCountry || !formData.originCountry.trim()) {
      setFormError('Quốc gia xuất xứ là bắt buộc');
      return;
    }
    if (!formData.productionPlace || !formData.productionPlace.trim()) {
      setFormError('Địa chỉ sản xuất (nhà máy) là bắt buộc');
      return;
    }

    setIsSubmitting(true);
    try {
      await batchApi.create({
        variant_id: formData.variantId,
        prefix: cleanPrefix,
        quantity: formData.quantity,
        manufacture_date: formData.manufactureDate ? `${formData.manufactureDate}T00:00:00Z` : null,
        expiry_date: formData.expiryDate ? `${formData.expiryDate}T00:00:00Z` : null,
        imported_at: new Date().toISOString().substring(0, 10) + 'T00:00:00Z',
        manufacturer_name: formData.manufacturer || null,
        supplier_name: formData.supplier || null,
        origin_country: formData.originCountry || null,
        production_place: formData.productionPlace || null,
      });
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2500);
    } catch (err: unknown) {
      setFormError(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-slate-50 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Tạo lô sản xuất mới (Create Batch)</h3>
            <p className="text-sm text-slate-500">Chỉ dành cho Admin. Hệ thống sẽ tự động sinh Product Item.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-500" type="button" disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {formError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs shrink-0">!</div>
              <div>
                <h4 className="font-bold text-red-900">Không thể thực hiện</h4>
                <p className="text-sm text-red-700">{formError}</p>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-green-900">Batch Created Successfully</h4>
                <p className="text-sm text-green-700">{formData.quantity} Product Items have been generated.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleCreate} className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT PANEL */}
            <div className="flex-1 space-y-6 w-full">
              {/* Card 1: Product Information */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Package size={18} className="text-blue-600" /> Thông tin Sản phẩm
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Sản phẩm *</label>
                    <select 
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:border-blue-500"
                      value={formData.productId}
                      onChange={e => setFormData({...formData, productId: e.target.value})}
                      disabled={isLoadingProducts || isSubmitting || isSuccess}
                    >
                      <option value="">{isLoadingProducts ? 'Đang tải...' : '-- Chọn sản phẩm --'}</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Biến thể sản phẩm *</label>
                    <select 
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:border-blue-500"
                      value={formData.variantId}
                      onChange={e => setFormData({...formData, variantId: e.target.value})}
                      disabled={!formData.productId || isLoadingVariants || isSubmitting || isSuccess}
                    >
                      <option value="">{isLoadingVariants ? 'Đang tải...' : '-- Chọn biến thể --'}</option>
                      {variants.map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.sku})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 2: Batch Information */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Calendar size={18} className="text-blue-600" /> Thông tin Lô hàng
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Mã tiền tố lô hàng (Prefix) *</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm uppercase font-mono" 
                      placeholder="VD: BATCH, APL, KG" 
                      value={formData.prefix} 
                      onChange={e => setFormData({...formData, prefix: e.target.value})} 
                      maxLength={20}
                      disabled={isSubmitting || isSuccess}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Mã lô tự động sinh: <strong>{formData.prefix.trim().toUpperCase() || 'PREFIX'}-2026-0001</strong></p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Số lượng nhập (Quantity) *</label>
                    <input 
                      type="number" 
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" 
                      value={formData.quantity} 
                      onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} 
                      min={1}
                      disabled={isSubmitting || isSuccess}
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Ngày sản xuất</label>
                      <input 
                        type="date" 
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" 
                        value={formData.manufactureDate} 
                        onChange={e => setFormData({...formData, manufactureDate: e.target.value})} 
                        disabled={isSubmitting || isSuccess}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Hạn sử dụng</label>
                      <input 
                        type="date" 
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" 
                        value={formData.expiryDate} 
                        onChange={e => setFormData({...formData, expiryDate: e.target.value})} 
                        disabled={isSubmitting || isSuccess}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" /> Quốc gia xuất xứ (Origin)
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" 
                      placeholder="Việt Nam"
                      value={formData.originCountry} 
                      onChange={e => setFormData({...formData, originCountry: e.target.value})} 
                      disabled={isSubmitting || isSuccess}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" /> Địa chỉ sản xuất
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" 
                      placeholder="Nhà máy A, Hà Nội"
                      value={formData.productionPlace} 
                      onChange={e => setFormData({...formData, productionPlace: e.target.value})} 
                      disabled={isSubmitting || isSuccess}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Truck size={13} className="text-slate-400" /> Nhà sản xuất (Manufacturer)
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" 
                      placeholder="Tên công ty sản xuất"
                      value={formData.manufacturer} 
                      onChange={e => setFormData({...formData, manufacturer: e.target.value})} 
                      disabled={isSubmitting || isSuccess}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Truck size={13} className="text-slate-400" /> Nhà cung cấp / Logistics
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" 
                      placeholder="Tên đơn vị vận chuyển"
                      value={formData.supplier} 
                      onChange={e => setFormData({...formData, supplier: e.target.value})} 
                      disabled={isSubmitting || isSuccess}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SUMMARY PANEL */}
            <div className="w-full lg:w-[350px] bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-0 shrink-0">
              <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-200 pb-3">Tóm tắt lô hàng</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sản phẩm</span>
                  <span className="font-semibold text-slate-900 text-right max-w-[170px] truncate" title={selectedProduct}>
                    {selectedProduct || '--'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Biến thể</span>
                  <span className="font-semibold text-slate-900 text-right max-w-[170px] truncate" title={selectedVariant}>
                    {selectedVariant || '--'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Số lượng</span>
                  <span className="font-semibold text-slate-900">{formData.quantity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Mã lô (Tiền tố)</span>
                  <span className="font-mono font-bold text-blue-600">{formData.prefix.trim().toUpperCase() || '--'}</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mb-6">
                <p className="text-xs text-blue-800 font-semibold mb-1">Mục được tự động sinh</p>
                <p className="text-sm text-blue-900">
                  Tạo tự động: <strong className="text-lg">{formData.quantity.toLocaleString()}</strong> sản phẩm (Product Items)
                </p>
                <p className="text-[10px] text-blue-600 mt-2">Tất cả sản phẩm sẽ được gán trạng thái khởi đầu IN_STOCK.</p>
              </div>

              <div className="space-y-3">
                <Button 
                  type="submit"
                  disabled={!formData.productId || !formData.variantId || !formData.prefix.trim() || formData.quantity <= 0 || isSubmitting || isSuccess} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 shadow-md flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang tạo lô...
                    </>
                  ) : (
                    'Tạo Lô Hàng'
                  )}
                </Button>
                <Button variant="secondary" onClick={onClose} disabled={isSubmitting} className="w-full bg-slate-50 font-semibold py-3 border border-slate-300">
                  Hủy bỏ
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
