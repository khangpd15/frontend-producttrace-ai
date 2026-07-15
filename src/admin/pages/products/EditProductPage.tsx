import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ChevronLeft, Save, X, Trash2, Edit3,
  AlertCircle, Package, Check, Tag, Info,
  Layers, Globe, Star, Image as ImageIcon, Code, AlertTriangle, Plus
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { 
  useProductDetail, 
  useUpdateProduct, 
  useUpdateVariant, 
  useDeleteVariant 
} from '../../../features/products/hooks/useProducts';
import {
  useAttributesByCategory,
  useVariantAttributeValues,
  useAssignVariantAttributes,
  useUpdateAttributeValue,
  useDeleteAttributeValue,
} from '../../../features/attributes/hooks/useAttributes';
import { parseApiError } from '../../../api/axios';

const STATUS_OPTIONS = [
  { value: 'ACTIVE',       label: 'Đang kinh doanh' },
  { value: 'DRAFT',        label: 'Bản nháp' },
  { value: 'DISCONTINUED', label: 'Ngừng kinh doanh' },
];

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:       'bg-green-50 text-green-700 border-green-200',
  DRAFT:        'bg-amber-50 text-amber-700 border-amber-200',
  DISCONTINUED: 'bg-red-50 text-red-700 border-red-200',
};

const STATUS_DOT: Record<string, string> = {
  ACTIVE: 'bg-green-500', DRAFT: 'bg-amber-500', DISCONTINUED: 'bg-red-500',
};

const slugify = (s: string) =>
  s.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

// Form Validation Schema
const productEditFormSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống').max(255, 'Tên sản phẩm tối đa 255 ký tự'),
  slug: z.string().min(1, 'Slug không được để trống'),
  category_id: z.string().min(1, 'Vui lòng chọn danh mục sản phẩm'),
  description: z.string().optional(),
  thumbnail_url: z.string().url('URL không hợp lệ').or(z.literal('')),
  tags: z.string().optional(),
  metadata: z.string().refine((val) => {
    if (!val.trim()) return true;
    try {
      const parsed = JSON.parse(val);
      return typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null;
    } catch {
      return false;
    }
  }, 'Metadata phải là JSON Object hợp lệ'),
  status: z.enum(['DRAFT', 'ACTIVE', 'DISCONTINUED']).default('DRAFT'),
});

type ProductEditFormValues = z.infer<typeof productEditFormSchema>;

const Field: React.FC<{ label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode; className?: string }> = ({ label, required, hint, error, children, className }) => (
  <div className={`space-y-1.5 ${className || ''}`}>
    <div className="flex items-baseline justify-between">
      <label className="text-xs font-bold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
    </div>
    {children}
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-shadow placeholder:text-slate-400";

export default function EditProductPage({
  productId,
  onNavigate,
}: {
  productId?: string;
  onNavigate: (tabId: string, id?: string) => void;
}) {
  if (!productId) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-semibold">Thiếu mã sản phẩm.</p>
        <button onClick={() => onNavigate('products')} className="mt-4 text-blue-600 hover:underline bg-transparent border-none cursor-pointer">Quay lại danh sách</button>
      </div>
    );
  }

  const { data: product, isLoading, error, refetch } = useProductDetail(productId);
  const updateProductMutation = useUpdateProduct();
  const updateVariantMutation = useUpdateVariant();
  const deleteVariantMutation = useDeleteVariant();

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [variantError, setVariantError] = useState<string | null>(null);

  // Attribute definitions của category sản phẩm này (bộ field cố định cho mọi biến thể)
  const { data: categoryAttributes = [] } = useAttributesByCategory(product?.categoryId);
  // Attribute values đã gán sẵn cho variant đang mở trong drawer
  const { data: existingAttributeValues = [] } = useVariantAttributeValues(editingVariant?.id);
  const assignAttributesMutation = useAssignVariantAttributes();
  const updateAttributeValueMutation = useUpdateAttributeValue();
  const deleteAttributeValueMutation = useDeleteAttributeValue();

  // Mỗi khi mở drawer cho 1 variant khác, nạp lại attribute values đã có của variant đó
  useEffect(() => {
    if (!editingVariant) return;
    const draft: typeof attributeDraft = {};
    categoryAttributes.forEach(attr => {
      const existing = existingAttributeValues.find(av => av.attribute_id === attr.id);
      draft[attr.id] = existing
        ? {
            attribute_value_id: existing.id,
            value_type: existing.value_number !== null && existing.value_number !== undefined
              ? 'number'
              : (existing.value_boolean !== null && existing.value_boolean !== undefined ? 'boolean' : 'text'),
            value_text: existing.value_text || '',
            value_number: existing.value_number !== null && existing.value_number !== undefined ? String(existing.value_number) : '',
            value_boolean: !!existing.value_boolean,
          }
        : { attribute_value_id: null, value_type: 'text', value_text: '', value_number: '', value_boolean: false };
    });
    setAttributeDraft(draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingVariant?.id, categoryAttributes, existingAttributeValues]);

  // Variant fields
  const [variantSku, setVariantSku] = useState('');
  const [variantName, setVariantName] = useState('');
  const [variantBarcode, setVariantBarcode] = useState('');
  const [variantPrice, setVariantPrice] = useState('');
  const [variantCurrency, setVariantCurrency] = useState('VND');
  const [variantStatus, setVariantStatus] = useState('ACTIVE');
  const [variantImages, setVariantImages] = useState<string[]>([]);
  const [imageDraft, setImageDraft] = useState('');

  // Draft nhập/sửa attribute values cho biến thể đang mở trong drawer.
  // Key = attribute_id. attribute_value_id null nghĩa là chưa gán (sẽ tạo mới khi lưu).
  const [attributeDraft, setAttributeDraft] = useState<Record<string, {
    attribute_value_id: string | null;
    value_type: 'text' | 'number' | 'boolean';
    value_text: string;
    value_number: string;
    value_boolean: boolean;
  }>>({});

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(productEditFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      category_id: '',
      description: '',
      thumbnail_url: '',
      tags: '',
      metadata: '',
      status: 'DRAFT'
    }
  });

  // Populate data when loaded
  useEffect(() => {
    if (product) {
      setValue('name', product.name || '');
      setValue('slug', product.slug || '');
      setValue('category_id', product.categoryId || '');
      setValue('description', product.description || '');
      setValue('thumbnail_url', product.thumbnailUrl || '');
      setValue('tags', (product.tags || []).join(', '));
      setValue('metadata', JSON.stringify((product as any).metadata || {}, null, 2));
      setValue('status', product.status as any || 'DRAFT');
    }
  }, [product, setValue]);

  const productName = watch('name');

  // Auto slug
  useEffect(() => {
    if (productName && !product) {
      setValue('slug', slugify(productName));
    }
  }, [productName, product, setValue]);

  if (isLoading) {
    return (
      <div className="bg-slate-50 p-8 space-y-8 min-h-screen animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-48 bg-slate-200 rounded-xl"></div>
        <div className="h-48 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto mt-12">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Không thể tải thông tin sản phẩm</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          {parseApiError(error)}
        </p>
        <div className="flex gap-3 mt-6">
          <Button onClick={() => onNavigate('product-detail', productId)} variant="secondary" className="rounded-xl px-4 text-xs font-semibold cursor-pointer">Quay lại</Button>
          <Button onClick={() => refetch()} className="rounded-xl px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Thử lại</Button>
        </div>
      </Card>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const onSubmit = async (values: ProductEditFormValues) => {
    try {
      const payload = {
        name: values.name,
        slug: values.slug,
        category_id: values.category_id,
        description: values.description,
        thumbnail_url: values.thumbnail_url || undefined,
        tags: values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        metadata: values.metadata ? JSON.parse(values.metadata) : {},
        status: values.status,
      };

      await updateProductMutation.mutateAsync({ id: productId, payload });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      alert('Cập nhật sản phẩm thành công!');
      onNavigate('product-detail', productId);
    } catch (err: any) {
      alert(parseApiError(err));
    }
  };

  const handleOpenEditVariant = (v: any) => {
    setEditingVariant(v);
    setVariantSku(v.sku || '');
    setVariantName(v.name || '');
    setVariantBarcode(v.barcode || '');
    setVariantPrice(v.price !== undefined ? String(v.price) : '');
    setVariantCurrency(v.currency || 'VND');
    setVariantStatus(v.status || 'ACTIVE');
    
    let parsedImages: string[] = [];
    if (v.images) {
      try {
        parsedImages = JSON.parse(v.images);
      } catch {
        parsedImages = [];
      }
    }
    setVariantImages(v.images || []);
    setVariantError(null);
    setIsDrawerOpen(true);
  };

  const handleSaveVariant = async () => {
    if (!variantSku.trim()) { setVariantError('SKU không được để trống.'); return; }
    if (!variantName.trim()) { setVariantError('Tên biến thể không được để trống.'); return; }

    const priceNum = variantPrice === '' ? undefined : parseFloat(variantPrice);
    if (priceNum !== undefined && (isNaN(priceNum) || priceNum < 0)) {
      setVariantError('Giá bán phải là số hợp lệ >= 0.');
      return;
    }

    try {
      const payload = {
        sku: variantSku.toUpperCase(),
        name: variantName,
        barcode: variantBarcode || undefined,
        price: priceNum,
        currency: variantCurrency,
        status: variantStatus,
        images: variantImages,
      };

      await updateVariantMutation.mutateAsync({ id: editingVariant.id, payload });

      // Đồng bộ attribute values: tạo mới nếu chưa có, update nếu đã có và đổi giá trị,
      // xoá nếu người dùng đã xoá giá trị đi.
      const toCreate: any[] = [];
      for (const attr of categoryAttributes) {
        const d = attributeDraft[attr.id];
        if (!d) continue;

        const hasValue =
          (d.value_type === 'text' && d.value_text.trim()) ||
          (d.value_type === 'number' && d.value_number !== '') ||
          (d.value_type === 'boolean');

        if (!hasValue) {
          // Không có giá trị nhập -> nếu trước đó đã gán thì xoá đi
          if (d.attribute_value_id) {
            await deleteAttributeValueMutation.mutateAsync(d.attribute_value_id);
          }
          continue;
        }

        const valuePayload = {
          label: attr.label,
          value_text: d.value_type === 'text' ? d.value_text.trim() : undefined,
          value_number: d.value_type === 'number' ? Number(d.value_number) : undefined,
          value_boolean: d.value_type === 'boolean' ? d.value_boolean : undefined,
        };

        if (d.attribute_value_id) {
          await updateAttributeValueMutation.mutateAsync({ id: d.attribute_value_id, payload: valuePayload });
        } else {
          toCreate.push({ attribute_id: attr.id, ...valuePayload });
        }
      }

      if (toCreate.length > 0) {
        await assignAttributesMutation.mutateAsync({ variantId: editingVariant.id, items: toCreate });
      }

      setIsDrawerOpen(false);
      refetch();
      alert('Cập nhật biến thể thành công!');
    } catch (err: any) {
      setVariantError(parseApiError(err));
    }
  };

  const handleDeleteVariant = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa biến thể này?')) {
      try {
        await deleteVariantMutation.mutateAsync(id);
        refetch();
        alert('Xóa biến thể thành công!');
      } catch (err: any) {
        alert(parseApiError(err));
      }
    }
  };

  const handleAddImage = () => {
    const url = imageDraft.trim();
    if (url && /^https?:\/\//.test(url)) {
      setVariantImages([...variantImages, url]);
      setImageDraft('');
    } else {
      alert('Vui lòng nhập URL hình ảnh hợp lệ.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-7xl mx-auto pb-20">
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
            type="button"
            onClick={() => onNavigate('product-detail', productId)}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
            title="Quay lại chi tiết"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chỉnh sửa sản phẩm</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_BADGE[watch('status')] || 'bg-gray-50'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[watch('status')] || 'bg-gray-400'}`}></span>
                {STATUS_OPTIONS.find(s => s.value === watch('status'))?.label || watch('status')}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              ID: <span className="font-mono font-semibold">PRD-{productId.substring(0, 8)}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onNavigate('product-detail', productId)}
            className="rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={updateProductMutation.isPending}
            className="rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer border-none"
          >
            <Save size={15} /> {updateProductMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>

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
                <Field label="Tên sản phẩm" required error={errors.name?.message as string}>
                  <input {...register('name')} className={inputCls} placeholder="Ví dụ: Máy lọc nước RO Kangaroo" />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Slug" required error={errors.slug?.message as string}>
                  <input {...register('slug')} className={`${inputCls} font-mono`} placeholder="may-loc-nuoc-ro-kangaroo" />
                </Field>
              </div>
              
              <Field label="Mã Danh mục" required error={errors.category_id?.message as string}>
                <input {...register('category_id')} className={inputCls} placeholder="Ví dụ: CAT-HOME-001" />
              </Field>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Trạng thái kinh doanh</label>
                <select
                  {...register('status')}
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
              <Field label="Thumbnail URL" error={errors.thumbnail_url?.message as string}>
                <input {...register('thumbnail_url')} className={inputCls} placeholder="https://..." />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Nội dung mô tả chi tiết" error={errors.description?.message as string}>
                <textarea
                  {...register('description')}
                  rows={5}
                  placeholder="Nhập mô tả đầy đủ, thông số kỹ thuật và đặc điểm nổi bật..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none resize-none transition-colors"
                />
              </Field>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers size={15} className="text-slate-400" /> Biến thể sản phẩm
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                  {(product.variants || []).length} biến thể
                </span>
              </h2>
            </div>

            {(!product.variants || product.variants.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                <Layers size={36} className="mb-3 opacity-40" />
                <p className="text-sm font-semibold text-slate-500">Chưa có biến thể nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {product.variants.map((v) => (
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
                        type="button"
                        onClick={() => handleOpenEditVariant(v)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                        title="Sửa biến thể"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
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
                {...register('tags')}
                rows={3}
                placeholder="Ví dụ: Gia dụng, Lọc nước, Kangaroo"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-xs focus:outline-none resize-none transition-colors"
              />
            </div>
            {watch('tags')?.trim() && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {watch('tags')!.split(',').map((tag: string) => tag.trim()).filter(Boolean).map((tag: string) => (
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
                { label: 'Tổng biến thể', value: (product.variants || []).length },
                { label: 'Đang bán',      value: (product.variants || []).filter(v => v.status === 'ACTIVE').length },
                { label: 'Bản nháp',      value: (product.variants || []).filter(v => v.status !== 'ACTIVE').length },
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
              <li className="flex gap-2"><span className="text-blue-400 font-bold">•</span> Thay đổi thông tin sản phẩm và biến thể sẽ cập nhật tức thời trên blockchain & QR search.</li>
              <li className="flex gap-2"><span className="text-blue-400 font-bold">•</span> Xóa biến thể sẽ không thể khôi phục các lô hàng của biến thể đó.</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <Button
              type="submit"
              disabled={updateProductMutation.isPending}
              className="w-full justify-center rounded-xl py-2.5 text-sm flex items-center gap-2 font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer border-none"
            >
              <Save size={15} /> {updateProductMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onNavigate('product-detail', productId)}
              className="w-full justify-center rounded-xl py-2.5 text-sm font-semibold cursor-pointer"
            >
              Hủy chỉnh sửa
            </Button>
          </div>
        </div>
      </div>

      {/* ===== VARIANT DRAWER (EDIT ONLY) ===== */}
      {isDrawerOpen && editingVariant && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative bg-white w-[540px] max-h-[90vh] shadow-2xl rounded-2xl flex flex-col z-10 overflow-hidden">

            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-gray-50 rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">Chỉnh sửa biến thể</h3>
                <p className="text-xs text-slate-500 mt-0.5">Cập nhật thông tin biến thể: {editingVariant.sku}</p>
              </div>
              <button
                type="button"
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
                    value={variantSku}
                    onChange={(e) => setVariantSku(e.target.value)}
                    placeholder="KG-VT3-TRANG"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Trạng thái</label>
                  <select
                    value={variantStatus}
                    onChange={(e) => setVariantStatus(e.target.value)}
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
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  placeholder="Ví dụ: Màu Trắng - 9 lõi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Barcode (EAN/UPC)</label>
                <input
                  value={variantBarcode}
                  onChange={(e) => setVariantBarcode(e.target.value)}
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
                    value={variantPrice}
                    onChange={(e) => setVariantPrice(e.target.value)}
                    placeholder="3500000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Đơn vị tiền tệ</label>
                  <select
                    value={variantCurrency}
                    onChange={(e) => setVariantCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="VND">VND - Đồng</option>
                    <option value="USD">USD - Đô la</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Hình ảnh biến thể</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input value={imageDraft} onChange={e => setImageDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddImage(); } }}
                      placeholder="Dán URL hình ảnh rồi nhấn Enter" className={inputCls} />
                    <button type="button" onClick={handleAddImage} className="px-3 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer bg-white"><Plus size={16} /></button>
                  </div>
                  {variantImages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {variantImages.map((url, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setVariantImages(variantImages.filter((_, idx) => idx !== i))}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity border-none">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Thuộc tính (Attributes) — theo danh mục của sản phẩm */}
              <div className="pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Thuộc tính (Attributes)</label>
                {categoryAttributes.length === 0 ? (
                  <p className="text-xs text-slate-400 mt-2">Danh mục sản phẩm này chưa có thuộc tính nào được khai báo.</p>
                ) : (
                  <div className="mt-2 space-y-3">
                    {categoryAttributes.map(attr => {
                      const d = attributeDraft[attr.id] || { attribute_value_id: null, value_type: 'text', value_text: '', value_number: '', value_boolean: false };
                      return (
                        <div key={attr.id} className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-500">{attr.label} <span className="text-slate-300 font-normal">({attr.code})</span></label>
                          <div className="flex gap-2">
                            <select
                              value={d.value_type}
                              onChange={e => setAttributeDraft(prev => ({ ...prev, [attr.id]: { ...d, value_type: e.target.value as 'text' | 'number' | 'boolean' } }))}
                              className="w-24 px-2 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-xs focus:outline-none cursor-pointer shrink-0"
                            >
                              <option value="text">Text</option>
                              <option value="number">Số</option>
                              <option value="boolean">Có/Không</option>
                            </select>
                            {d.value_type === 'text' && (
                              <input
                                value={d.value_text}
                                onChange={e => setAttributeDraft(prev => ({ ...prev, [attr.id]: { ...d, value_text: e.target.value } }))}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none"
                                placeholder={`Nhập ${attr.label.toLowerCase()}…`}
                              />
                            )}
                            {d.value_type === 'number' && (
                              <input
                                type="number"
                                value={d.value_number}
                                onChange={e => setAttributeDraft(prev => ({ ...prev, [attr.id]: { ...d, value_number: e.target.value } }))}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none"
                                placeholder="0"
                              />
                            )}
                            {d.value_type === 'boolean' && (
                              <select
                                value={d.value_boolean ? '1' : '0'}
                                onChange={e => setAttributeDraft(prev => ({ ...prev, [attr.id]: { ...d, value_boolean: e.target.value === '1' } }))}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none cursor-pointer"
                              >
                                <option value="0">Không</option>
                                <option value="1">Có</option>
                              </select>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2 flex-shrink-0">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-xl px-4 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleSaveVariant}
                disabled={updateVariantMutation.isPending}
                className="rounded-xl px-4 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer border-none"
              >
                {updateVariantMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}