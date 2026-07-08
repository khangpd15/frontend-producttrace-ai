import React, { useState } from 'react';
import {
  ChevronLeft, Save, X, Plus, Trash2, Edit3,
  AlertCircle, Package, Check, Tag, Info,
  Layers, Globe, Star, Image as ImageIcon, Code
} from 'lucide-react';
import Button from '../../components/ui/Button';

import {
  AdminProductStatus as ProductStatus,
  AdminVariantStatus as VariantStatus,
  AdminEditAttributeValue as AttributeValue,
  AdminEditVariant as Variant,
  AdminEditProductFormData as ProductFormData
} from '@shared/types/domain';

// Mock seeded data per product ID
const MOCK_PRODUCT_DATA: Record<string, { form: ProductFormData; variants: Variant[] }> = {
  '1': {
    form: {
      name: 'Máy lọc nước RO Kangaroo VT3',
      slug: 'may-loc-nuoc-ro-kangaroo-vt3',
      category_id: 'CAT-HOME-001',
      category: 'Thiết bị gia dụng',
      description: 'Máy lọc nước RO Kangaroo VT3 với công nghệ lọc ngược thẩm thấu hiện đại 9 lõi lọc.',
      thumbnail_url: 'https://example.com/thumbnail1.jpg',
      tags: 'Gia dụng, Lọc nước, Kangaroo, RO Technology',
      status: 'ACTIVE',
    },
    variants: [
      { 
        id: 'v1', sku: 'KG-VT3-TRANG', name: 'Màu Trắng - 9 lõi', barcode: '8938514050123', 
        price: 3500000, currency: 'VND', images_json: '[]', status: 'ACTIVE', 
        attributes: [
          { label: 'Màu sắc', value_text: 'Trắng' },
          { label: 'Trọng lượng (kg)', value_number: 8.5 }
        ]
      },
    ],
  },
};

const BLANK_FORM: ProductFormData = {
  name: '', slug: '', category_id: '', category: '',
  description: '', thumbnail_url: '', tags: '', status: 'DRAFT',
};

const BLANK_VARIANT: Variant = {
  id: '', sku: '', name: '', barcode: '',
  price: 0, currency: 'VND', images_json: '[]', status: 'ACTIVE', attributes: []
};

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'ACTIVE',       label: 'Đang kinh doanh' },
  { value: 'DRAFT',        label: 'Bản nháp' },
  { value: 'DISCONTINUED', label: 'Ngừng kinh doanh' },
];

const STATUS_BADGE: Record<ProductStatus, string> = {
  ACTIVE:       'bg-green-50 text-green-700 border-green-200',
  DRAFT:        'bg-amber-50 text-amber-700 border-amber-200',
  DISCONTINUED: 'bg-red-50 text-red-700 border-red-200',
};
const STATUS_DOT: Record<ProductStatus, string> = {
  ACTIVE: 'bg-green-500', DRAFT: 'bg-amber-500', DISCONTINUED: 'bg-red-500',
};

export default function EditProductPage({
  productId,
  onNavigate,
}: {
  productId?: string;
  onNavigate: (tabId: string, id?: string) => void;
}) {
  const seed = MOCK_PRODUCT_DATA[productId || '1'] || { form: BLANK_FORM, variants: [] };

  const [formData, setFormData] = useState<ProductFormData>(seed.form);
  const [variants, setVariants] = useState<Variant[]>(seed.variants);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Variant drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [variantForm, setVariantForm] = useState<Variant>(BLANK_VARIANT);
  const [variantError, setVariantError] = useState<string | null>(null);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  /* ---------- Product save ---------- */
  const handleSave = () => {
    if (!formData.name.trim()) {
      setFormError('Tên sản phẩm không được để trống.');
      return;
    }
    setFormError(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  /* ---------- Variant CRUD ---------- */
  const openCreateVariant = () => {
    setDrawerMode('CREATE');
    setVariantForm(BLANK_VARIANT);
    setVariantError(null);
    setIsDrawerOpen(true);
  };

  const openEditVariant = (v: Variant) => {
    setDrawerMode('EDIT');
    setVariantForm({ ...v });
    setVariantError(null);
    setIsDrawerOpen(true);
  };

  const validateVariant = (v: Variant): string | null => {
    if (!v.sku.trim()) return 'SKU không được để trống.';
    if (!v.name.trim()) return 'Tên biến thể không được để trống.';
    if (v.price < 0) return 'Giá không hợp lệ.';
    try {
      JSON.parse(v.images_json || '[]');
    } catch {
      return 'Images JSON không hợp lệ.';
    }
    const duplicate = variants.some(
      (ex) => ex.sku.toUpperCase() === v.sku.toUpperCase() && ex.id !== v.id
    );
    if (duplicate) return 'SKU đã tồn tại trong danh sách biến thể.';
    return null;
  };

  const handleSaveVariant = () => {
    const err = validateVariant(variantForm);
    if (err) { setVariantError(err); return; }

    if (drawerMode === 'CREATE') {
      setVariants([...variants, { ...variantForm, id: 'v-' + Date.now() }]);
    } else {
      setVariants(variants.map((v) => (v.id === variantForm.id ? variantForm : v)));
    }
    setIsDrawerOpen(false);
  };

  const handleDeleteVariant = (id: string) => {
    if (confirm('Xóa biến thể này?')) setVariants(variants.filter((v) => v.id !== id));
  };

  const handleAddAttribute = () => {
    setVariantForm({
      ...variantForm,
      attributes: [...variantForm.attributes, { label: '', value_text: '' }]
    });
  };
  
  const updateAttribute = (idx: number, field: keyof AttributeValue, value: any) => {
    const newAttrs = [...variantForm.attributes];
    newAttrs[idx] = { ...newAttrs[idx], [field]: value };
    setVariantForm({ ...variantForm, attributes: newAttrs });
  };
  
  const removeAttribute = (idx: number) => {
    const newAttrs = [...variantForm.attributes];
    newAttrs.splice(idx, 1);
    setVariantForm({ ...variantForm, attributes: newAttrs });
  };

  /* ---------- Field helper ---------- */
  const field = (
    label: string,
    value: string,
    key: keyof ProductFormData,
    placeholder = '',
    required = false,
    type: 'input' | 'textarea' | 'select' = 'input'
  ) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-700 block">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
          rows={5}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none resize-none transition-colors"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none transition-colors"
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">

      {/* Success toast */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 z-50 bg-white border border-green-200 shadow-xl rounded-xl px-5 py-3 flex items-center gap-3 animate-fade-in">
          <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <Check size={14} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Lưu thành công!</p>
            <p className="text-xs text-slate-500">Thông tin sản phẩm đã được cập nhật.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('product-detail', productId)}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
            title="Quay lại chi tiết"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chỉnh sửa sản phẩm</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_BADGE[formData.status]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[formData.status]}`}></span>
                {STATUS_OPTIONS.find(s => s.value === formData.status)?.label}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              ID: <span className="font-mono font-semibold">PRD-{(productId || '1').padStart(6, '0')}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => onNavigate('product-detail', productId)}
            className="rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            className="rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
          >
            <Save size={15} /> Lưu thay đổi
          </Button>
        </div>
      </div>

      {/* Form error */}
      {formError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={16} />
          {formError}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">

        {/* ===== LEFT: Main form ===== */}
        <div className="col-span-2 space-y-6">

          {/* Basic Info */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Info size={15} className="text-slate-400" /> Thông tin cơ bản
            </h2>

            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                {field('Tên sản phẩm', formData.name, 'name', 'Ví dụ: Máy lọc nước RO Kangaroo', true)}
              </div>
              <div className="col-span-2">
                {field('Slug', formData.slug, 'slug', 'may-loc-nuoc-ro-kangaroo', true)}
              </div>
              
              {field('Mã Danh mục', formData.category_id, 'category_id', 'Ví dụ: CAT-HOME-001')}
              {field('Danh mục sản phẩm', formData.category, 'category', 'Ví dụ: Thiết bị gia dụng')}

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Trạng thái kinh doanh</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none transition-colors cursor-pointer"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Media & Details */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <ImageIcon size={15} className="text-slate-400" /> Hình ảnh & Mô tả
            </h2>
            <div className="col-span-2">
              {field('Thumbnail URL', formData.thumbnail_url, 'thumbnail_url', 'https://...')}
            </div>
            {field('Nội dung mô tả chi tiết', formData.description, 'description',
              'Nhập mô tả đầy đủ, thông số kỹ thuật và đặc điểm nổi bật của sản phẩm...', false, 'textarea')}
          </div>

          {/* Variants */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers size={15} className="text-slate-400" /> Biến thể sản phẩm
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                  {variants.length} biến thể
                </span>
              </h2>
              <button
                onClick={openCreateVariant}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
              >
                <Plus size={13} /> Thêm biến thể
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                <Layers size={36} className="mb-3 opacity-40" />
                <p className="text-sm font-semibold text-slate-500">Chưa có biến thể nào</p>
                <p className="text-xs text-slate-400 mt-1">Nhấn &ldquo;Thêm biến thể&rdquo; để bắt đầu.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {variants.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-all group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xs">
                        <Package size={15} className="text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900 truncate">{v.name}</span>
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            v.status === 'ACTIVE'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${v.status === 'ACTIVE' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                            {v.status === 'ACTIVE' ? 'Đang bán' : 'Nháp'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-400 font-medium">
                          <span className="font-mono">SKU: {v.sku}</span>
                          <span>·</span>
                          <span>{formatPrice(v.price)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => openEditVariant(v)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                        title="Sửa biến thể"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteVariant(v.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                        title="Xóa biến thể"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== RIGHT: Sidebar ===== */}
        <div className="col-span-1 space-y-5">

          {/* Tags */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100 uppercase tracking-wider">
              <Tag size={13} className="text-slate-400" /> Tags sản phẩm
            </h2>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Danh sách tags (phân cách bằng dấu phẩy)</label>
              <textarea
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                rows={3}
                placeholder="Ví dụ: Gia dụng, Lọc nước, Kangaroo"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-xs focus:outline-none resize-none transition-colors"
              />
            </div>
            {formData.tags.trim() && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-full">
                    <Tag size={9} />{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100 uppercase tracking-wider">
              <Star size={13} className="text-slate-400" /> Tóm tắt biến thể
            </h2>
            <dl className="space-y-2.5 text-xs">
              {[
                { label: 'Tổng biến thể', value: variants.length },
                { label: 'Đang bán',      value: variants.filter(v => v.status === 'ACTIVE').length },
                { label: 'Bản nháp',      value: variants.filter(v => v.status === 'INACTIVE').length },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <dt className="text-slate-500 font-medium">{item.label}</dt>
                  <dd className="font-bold text-slate-900">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Origin info */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100 uppercase tracking-wider">
              <Globe size={13} className="text-slate-400" /> Lưu ý chỉnh sửa
            </h2>
            <ul className="space-y-2 text-[11px] text-slate-500 leading-relaxed">
              <li className="flex gap-2"><span className="text-blue-400 font-bold">•</span> Thay đổi trạng thái chỉ có hiệu lực khi sản phẩm có ít nhất 1 biến thể đang bán.</li>
              <li className="flex gap-2"><span className="text-blue-400 font-bold">•</span> Xóa biến thể sẽ ẩn toàn bộ dữ liệu lô hàng liên quan.</li>
              <li className="flex gap-2"><span className="text-blue-400 font-bold">•</span> Tags phân cách nhau bằng dấu phẩy, không có khoảng trắng đầu/cuối.</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleSave}
              className="w-full justify-center rounded-xl py-2.5 text-sm flex items-center gap-2 font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
            >
              <Save size={15} /> Lưu thay đổi
            </Button>
            <Button
              variant="secondary"
              onClick={() => onNavigate('product-detail', productId)}
              className="w-full justify-center rounded-xl py-2.5 text-sm font-semibold cursor-pointer"
            >
              Hủy chỉnh sửa
            </Button>
          </div>
        </div>
      </div>

      {/* ===== VARIANT DRAWER ===== */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative bg-white w-[540px] max-h-[90vh] shadow-2xl rounded-2xl flex flex-col z-10 overflow-hidden">

            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {drawerMode === 'CREATE' ? 'Thêm biến thể mới' : 'Sửa biến thể'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Điền đầy đủ thông tin SKU và định giá.</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg border-none bg-transparent cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {variantError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  <AlertCircle size={14} />{variantError}
                </div>
              )}

              {/* SKU & Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">SKU <span className="text-red-500">*</span></label>
                  <input
                    value={variantForm.sku}
                    onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                    placeholder="KG-VT3-TRANG"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Trạng thái</label>
                  <select
                    value={variantForm.status}
                    onChange={(e) => setVariantForm({ ...variantForm, status: e.target.value as VariantStatus })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="ACTIVE">Đang bán (ACTIVE)</option>
                    <option value="INACTIVE">Không hoạt động (INACTIVE)</option>
                    <option value="DISCONTINUED">Ngừng bán (DISCONTINUED)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tên biến thể <span className="text-red-500">*</span></label>
                <input
                  value={variantForm.name}
                  onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                  placeholder="Ví dụ: Màu Trắng - 9 lõi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Barcode (EAN/UPC)</label>
                <input
                  value={variantForm.barcode}
                  onChange={(e) => setVariantForm({ ...variantForm, barcode: e.target.value })}
                  placeholder="8938514050123"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none font-mono"
                />
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Giá bán <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min={0}
                    value={variantForm.price}
                    onChange={(e) => setVariantForm({ ...variantForm, price: parseFloat(e.target.value) || 0 })}
                    placeholder="3500000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Đơn vị tiền tệ</label>
                  <select
                    value={variantForm.currency}
                    onChange={(e) => setVariantForm({ ...variantForm, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="VND">VND - Đồng</option>
                    <option value="USD">USD - Đô la</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Hình ảnh JSON (images_json)</label>
                <textarea
                  value={variantForm.images_json}
                  onChange={(e) => setVariantForm({ ...variantForm, images_json: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none font-mono resize-none"
                />
              </div>

              {/* Attributes */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Thuộc tính (Attributes)</label>
                  <button type="button" onClick={handleAddAttribute} className="text-xs text-blue-600 hover:underline">
                    + Thêm thuộc tính
                  </button>
                </div>
                {variantForm.attributes.map((attr, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <input 
                      placeholder="Label (vd: Màu sắc)"
                      value={attr.label}
                      onChange={e => updateAttribute(idx, 'label', e.target.value)}
                      className="w-1/3 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50"
                    />
                    <input 
                      placeholder="Value text"
                      value={attr.value_text || ''}
                      onChange={e => updateAttribute(idx, 'value_text', e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50"
                    />
                    <input 
                      placeholder="Value number"
                      type="number"
                      value={attr.value_number || ''}
                      onChange={e => updateAttribute(idx, 'value_number', parseFloat(e.target.value) || undefined)}
                      className="w-1/4 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50"
                    />
                    <button type="button" onClick={() => removeAttribute(idx)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors border-none bg-transparent cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {variantForm.attributes.length === 0 && (
                  <p className="text-[11px] text-slate-400 italic">Không có thuộc tính nào.</p>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2 flex-shrink-0">
              <Button
                variant="secondary"
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-xl px-4 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSaveVariant}
                className="rounded-xl px-4 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
              >
                {drawerMode === 'CREATE' ? 'Thêm biến thể' : 'Lưu thay đổi'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
