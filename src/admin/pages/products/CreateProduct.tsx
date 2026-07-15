import React, { useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ChevronLeft, Save, Trash2, Edit2, AlertCircle, Plus, X, ImageIcon, Tag, ChevronDown, Search
} from 'lucide-react';
import { useCreateProduct } from '../../../features/products/hooks/useProducts';
import { useCategoryList } from '../../../features/categories/hooks/useCategory';
import { useAttributesByCategory } from '../../../features/attributes/hooks/useAttributes';
import Button from '../../components/ui/Button';
import { parseApiError } from '../../../api/axios';

// Mock reference data (fallback if needed)
const MOCK_CATEGORIES = [
  { id: 'cat-001', name: 'Sữa bột', parent_id: null },
  { id: 'cat-002', name: 'Thực phẩm chức năng', parent_id: null },
  { id: 'cat-003', name: 'Mỹ phẩm', parent_id: null },
  { id: 'cat-004', name: 'Mỹ phẩm / Chăm sóc da', parent_id: 'cat-003' },
  { id: 'cat-005', name: 'Đồ điện gia dụng', parent_id: null },
];

const codify = (s: string) =>
  s.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const slugify = (s: string) =>
  s.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

// Form Validation Schema
const attributeValueSchema = z.object({
  attribute_id: z.string(),
  code: z.string(),
  label: z.string(),
  value_type: z.enum(['text', 'number', 'boolean']).default('text'),
  value_text: z.string().optional(),
  value_number: z.number().optional(),
  value_boolean: z.boolean().optional(),
});

const variantSchema = z.object({
  sku: z.string().min(1, 'SKU không được để trống'),
  name: z.string().min(1, 'Tên biến thể không được để trống'),
  barcode: z.string().optional(),
  price: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().min(0, 'Giá phải >= 0').optional()),
  currency: z.string().default('VND'),
  images: z.array(z.string()).default([]),
  status: z.string().default('ACTIVE'),
  // Tên field khớp với CreateVariantRequest.Attributes ở BE (json:"attributes"),
  // gửi kèm luôn trong payload tạo product — BE tạo product/variant/attributes
  // trong cùng 1 transaction (xem product_service.go -> CreateProduct).
  attributes: z.array(attributeValueSchema).default([]),
});

const productFormSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống').max(255, 'Tên sản phẩm tối đa 255 ký tự'),
  slug: z.string().min(1, 'Slug không được để trống'),
  category_id: z.string().min(1, 'Vui lòng chọn danh mục sản phẩm'),
  description: z.string().optional(),
  thumbnail_url: z.string().url('URL không hợp lệ').or(z.literal('')),
  tags: z.array(z.string()).default([]),
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
  variants: z.array(variantSchema).min(1, 'Sản phẩm cần ít nhất 1 biến thể'),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

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

const CategorySelect: React.FC<{ value: string; onChange: (id: string) => void }> = ({ value, onChange }) => {
  const { data: categoryListResp } = useCategoryList({ limit: 100 });
  const categories = categoryListResp?.data || [];

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const selected = categories.find(c => c.id === value);
  const filtered = categories.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className={`${inputCls} flex items-center justify-between text-left cursor-pointer ${!selected ? 'text-slate-400' : ''}`}>
        {selected ? selected.name : 'Chọn danh mục sản phẩm…'}
        <ChevronDown size={14} className="text-slate-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100 flex items-center gap-2">
            <Search size={14} className="text-slate-400" />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm danh mục…"
              className="w-full text-sm outline-none border-none bg-transparent focus:ring-0" />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && <div className="px-3 py-2 text-xs text-slate-400">Không tìm thấy danh mục</div>}
            {filtered.map(c => (
              <button key={c.id} type="button"
                onClick={() => { onChange(c.id); setOpen(false); setQ(''); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-none bg-transparent ${c.id === value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'}`}>
                {c.parent_id && <span className="text-slate-400">↳ </span>}{c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TagInput: React.FC<{ tags: string[]; onChange: (tags: string[]) => void }> = ({ tags, onChange }) => {
  const [draft, setDraft] = useState('');
  const commit = () => {
    const v = draft.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setDraft('');
  };
  return (
    <div className={`${inputCls} flex flex-wrap gap-1.5 items-center min-h-[42px] cursor-text`} onClick={e => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}>
      {tags.map(t => (
        <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
          <Tag size={10} />{t}
          <button type="button" onClick={() => onChange(tags.filter(x => x !== t))} className="hover:text-blue-900 cursor-pointer border-none bg-transparent"><X size={10} /></button>
        </span>
      ))}
      <input value={draft} onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); } if (e.key === 'Backspace' && !draft && tags.length) onChange(tags.slice(0, -1)); }}
        onBlur={commit}
        placeholder={tags.length === 0 ? 'Nhập tag rồi nhấn Enter…' : ''}
        className="flex-1 min-w-[100px] text-sm outline-none bg-transparent border-none focus:ring-0" />
    </div>
  );
};

export default function CreateProduct({ onNavigate }: { onNavigate: (tabId: string) => void }) {
  const createMutation = useCreateProduct();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);

  // Variant modal form state
  const [variantName, setVariantName] = useState('');
  const [variantSku, setVariantSku] = useState('');
  const [variantBarcode, setVariantBarcode] = useState('');
  const [variantPrice, setVariantPrice] = useState('');
  const [variantCurrency, setVariantCurrency] = useState('VND');
  const [variantImages, setVariantImages] = useState<string[]>([]);
  const [imageDraft, setImageDraft] = useState('');
  const [variantError, setVariantError] = useState<string | null>(null);
  // Giá trị attribute đang nhập cho biến thể trong form (map theo attribute_id)
  const [attributeDraft, setAttributeDraft] = useState<Record<string, {
    value_type: 'text' | 'number' | 'boolean';
    value_text: string;
    value_number: string;
    value_boolean: boolean;
  }>>({});

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      category_id: '',
      description: '',
      thumbnail_url: '',
      tags: [],
      metadata: '',
      status: 'DRAFT',
      variants: [],
    }
  });

  const { fields: variantsFields, append, remove, update } = useFieldArray({
    control,
    name: 'variants'
  });
  const variants = variantsFields as any[];

  const productName = watch('name');
  const selectedCategoryId = watch('category_id');

  // Attribute definitions của category đang chọn — quyết định các field nhập
  // cho attributes của mỗi biến thể. Đổi category sẽ đổi luôn bộ field này.
  const { data: categoryAttributes = [], isLoading: isLoadingAttributes } = useAttributesByCategory(selectedCategoryId || undefined);

  // Sync slug
  React.useEffect(() => {
    setValue('slug', slugify(productName));
  }, [productName, setValue]);

  // Reset draft nhập attribute mỗi khi đổi danh mục (attribute set đổi theo category)
  React.useEffect(() => {
    setAttributeDraft({});
  }, [selectedCategoryId]);

  // Khởi tạo draft nhập attributes rỗng, sẵn field cho từng attribute của category
  const buildEmptyAttributeDraft = () => {
    const draft: typeof attributeDraft = {};
    categoryAttributes.forEach(attr => {
      draft[attr.id] = { value_type: 'text', value_text: '', value_number: '', value_boolean: false };
    });
    return draft;
  };

  const handleOpenNewVariant = () => {
    setVariantName('');
    setVariantSku('');
    setVariantBarcode('');
    setVariantPrice('');
    setVariantCurrency('VND');
    setVariantImages([]);
    setEditingVariantIndex(null);
    setVariantError(null);
    setAttributeDraft(buildEmptyAttributeDraft());
    setShowVariantForm(true);
  };

  const handleOpenEditVariant = (index: number) => {
    const v = variants[index];
    setVariantName(v.name);
    setVariantSku(v.sku);
    setVariantBarcode(v.barcode || '');
    setVariantPrice(v.price !== undefined ? String(v.price) : '');
    setVariantCurrency(v.currency || 'VND');
    setVariantImages(v.images || []);
    setEditingVariantIndex(index);
    setVariantError(null);

    // Nạp lại attribute values đã nhập trước đó cho biến thể này (nếu có),
    // field nào chưa có giá trị thì để trống theo bộ attribute hiện tại của category
    const draft = buildEmptyAttributeDraft();
    (v.attributes || []).forEach((av: any) => {
      draft[av.attribute_id] = {
        value_type: av.value_type || 'text',
        value_text: av.value_text || '',
        value_number: av.value_number !== undefined && av.value_number !== null ? String(av.value_number) : '',
        value_boolean: !!av.value_boolean,
      };
    });
    setAttributeDraft(draft);
    setShowVariantForm(true);
  };

  const handleSaveVariant = () => {
    if (!variantSku.trim()) { setVariantError('SKU không được để trống.'); return; }
    if (!variantName.trim()) { setVariantError('Tên biến thể không được để trống.'); return; }
    
    const priceNum = variantPrice === '' ? undefined : parseFloat(variantPrice);
    if (priceNum !== undefined && (isNaN(priceNum) || priceNum < 0)) {
      setVariantError('Giá bán phải là số hợp lệ >= 0.');
      return;
    }

    // Chỉ giữ lại attribute nào người dùng thực sự có nhập giá trị
    const attributes = categoryAttributes
      .map(attr => {
        const d = attributeDraft[attr.id];
        if (!d) return null;
        if (d.value_type === 'text' && !d.value_text.trim()) return null;
        if (d.value_type === 'number' && d.value_number === '') return null;
        return {
          attribute_id: attr.id,
          code: attr.code,
          label: attr.label,
          value_type: d.value_type,
          value_text: d.value_type === 'text' ? d.value_text.trim() : undefined,
          value_number: d.value_type === 'number' ? Number(d.value_number) : undefined,
          value_boolean: d.value_type === 'boolean' ? d.value_boolean : undefined,
        };
      })
      .filter(Boolean);

    const payload = {
      sku: variantSku.toUpperCase(),
      name: variantName,
      barcode: variantBarcode || undefined,
      price: priceNum,
      currency: variantCurrency,
      images: variantImages,
      status: 'ACTIVE',
      attributes,
    };

    if (editingVariantIndex !== null) {
      update(editingVariantIndex, payload);
    } else {
      append(payload);
    }

    setShowVariantForm(false);
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

  const onSubmit = async (values: ProductFormValues) => {
    try {
      const payload = {
        name: values.name,
        slug: values.slug,
        category_id: values.category_id,
        description: values.description,
        thumbnail_url: values.thumbnail_url || undefined,
        tags: values.tags,
        metadata: values.metadata ? JSON.parse(values.metadata) : {},
        status: values.status,
        variants: values.variants.map(v => ({
          sku: v.sku,
          name: v.name,
          barcode: v.barcode || undefined,
          price: v.price,
          currency: v.currency,
          images: v.images,
          // Gửi kèm attributes ngay trong variant — BE tạo product + variant +
          // attribute values trong cùng 1 transaction (xem CreateVariantRequest.Attributes).
          attributes: (v.attributes || []).map((it: any) => ({
            attribute_id: it.attribute_id,
            label: it.label,
            value_text: it.value_text,
            value_number: it.value_number,
            value_boolean: it.value_boolean,
          })),
        })),
      };

      await createMutation.mutateAsync(payload);
      alert('Tạo sản phẩm thành công!');
      onNavigate('products');
    } catch (err: any) {
      alert(parseApiError(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center max-w-5xl mx-auto">
        <div>
          <button type="button" onClick={() => onNavigate('products')} className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2 font-medium cursor-pointer border-none bg-transparent">
            <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Thêm mới sản phẩm</h1>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => onNavigate('products')} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer">Hủy</button>
          <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl text-sm font-semibold text-white flex items-center gap-2 cursor-pointer shadow-xs">
            <Save className="w-4 h-4" /> {createMutation.isPending ? 'Đang lưu...' : 'Lưu sản phẩm'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        {errors.variants && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
            <AlertCircle size={18} /> {(errors.variants as any).message}
          </div>
        )}

        {/* Product information */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">Thông tin sản phẩm</h2>
          <div className="grid grid-cols-2 gap-5">
            <Field label="Tên sản phẩm" required error={errors.name?.message as string} className="col-span-2">
              <input {...register('name')} className={inputCls} placeholder="VD: Sữa bột Vinamilk Optimum Gold 3" />
            </Field>

            <Field label="Slug" hint="dùng cho URL, tự sinh từ tên" error={errors.slug?.message as string}>
              <input {...register('slug')} className={`${inputCls} font-mono`} placeholder="auto-generated" />
            </Field>

            <Field label="Danh mục" required error={errors.category_id?.message as string}>
              <CategorySelect value={watch('category_id')} onChange={id => setValue('category_id', id, { shouldValidate: true })} />
            </Field>

            <Field label="Mô tả" error={errors.description?.message as string} className="col-span-2">
              <textarea {...register('description')} rows={3} className={`${inputCls} resize-none`} placeholder="Mô tả ngắn về sản phẩm…" />
            </Field>

            <Field label="Ảnh đại diện (thumbnail)" error={errors.thumbnail_url?.message as string} className="col-span-2">
              <div className="flex gap-3 items-start">
                <div className="w-16 h-16 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {watch('thumbnail_url')
                    ? <img src={watch('thumbnail_url')} className="w-full h-full object-cover" onError={e => ((e.target as HTMLImageElement).style.display = 'none')} />
                    : <ImageIcon size={18} className="text-slate-300" />}
                </div>
                <input {...register('thumbnail_url')} className={inputCls} placeholder="https://…" />
              </div>
            </Field>

            <Field label="Tags" className="col-span-2">
              <TagInput tags={watch('tags') || []} onChange={tags => setValue('tags', tags)} />
            </Field>

            <Field label="Trạng thái" required error={errors.status?.message as string}>
              <select {...register('status')} className={`${inputCls} cursor-pointer`}>
                <option value="DRAFT">DRAFT — Bản nháp</option>
                <option value="ACTIVE">ACTIVE — Đang bán</option>
                <option value="DISCONTINUED">DISCONTINUED — Ngừng kinh doanh</option>
              </select>
            </Field>
          </div>

          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs font-bold text-blue-600 hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1">
            <ChevronDown size={12} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} /> Tuỳ chọn nâng cao (metadata)
          </button>
          {showAdvanced && (
            <Field label="Metadata JSON" hint="object tuỳ ý, vd seo, ghi chú nội bộ…" error={errors.metadata?.message as string}>
              <textarea {...register('metadata')} rows={4} className={`${inputCls} font-mono bg-slate-50 resize-none`} placeholder='{"seo_title": "..."}' />
            </Field>
          )}
        </div>

        {/* Variants */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Biến thể sản phẩm ({variants.length})</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Mỗi biến thể có SKU, giá và hình ảnh riêng — cần ít nhất 1 biến thể.</p>
            </div>
            {!showVariantForm && (
              <button type="button" onClick={handleOpenNewVariant} className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-blue-200">
                <Plus size={14} /> Thêm biến thể
              </button>
            )}
          </div>

          {showVariantForm && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-5 shadow-inner">
              <h3 className="text-sm font-bold text-slate-800">{editingVariantIndex !== null ? 'Chỉnh sửa biến thể' : 'Thêm biến thể mới'}</h3>

              {variantError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                  <AlertCircle size={14} /> {variantError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field label="SKU" required>
                  <input value={variantSku} onChange={e => setVariantSku(e.target.value.toUpperCase())} className={`${inputCls} font-mono`} placeholder="VD: VNM-OPT3-900G" />
                </Field>

                <Field label="Tên biến thể" required className="col-span-2">
                  <input value={variantName} onChange={e => setVariantName(e.target.value)} className={inputCls} placeholder="VD: Hộp thiếc 900g" />
                </Field>

                <Field label="Barcode" hint="tuỳ chọn, phải duy nhất">
                  <input value={variantBarcode} onChange={e => setVariantBarcode(e.target.value)} className={`${inputCls} font-mono`} placeholder="EAN/UPC" />
                </Field>
                <Field label="Giá bán">
                  <div className="flex gap-2">
                    <input type="number" min="0" value={variantPrice} onChange={e => setVariantPrice(e.target.value)} className={inputCls} placeholder="0" />
                    <select value={variantCurrency} onChange={e => setVariantCurrency(e.target.value)} className={`${inputCls} w-28 cursor-pointer`}>
                      <option value="VND">VND</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </Field>

                <Field label="Hình ảnh biến thể" className="col-span-2">
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
                </Field>
              </div>

              {/* Thuộc tính (Attributes) — bộ field phụ thuộc vào danh mục sản phẩm đã chọn */}
              <div className="pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Thuộc tính (Attributes)</h4>
                {!selectedCategoryId ? (
                  <p className="text-xs text-slate-400">Vui lòng chọn danh mục sản phẩm trước để hiển thị thuộc tính tương ứng.</p>
                ) : isLoadingAttributes ? (
                  <p className="text-xs text-slate-400">Đang tải danh sách thuộc tính…</p>
                ) : categoryAttributes.length === 0 ? (
                  <p className="text-xs text-slate-400">Danh mục này chưa có thuộc tính nào được khai báo.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {categoryAttributes.map(attr => {
                      const d = attributeDraft[attr.id] || { value_type: 'text', value_text: '', value_number: '', value_boolean: false };
                      return (
                        <Field key={attr.id} label={attr.label} hint={attr.code}>
                          <div className="flex gap-2">
                            <select
                              value={d.value_type}
                              onChange={e => setAttributeDraft(prev => ({
                                ...prev,
                                [attr.id]: { ...d, value_type: e.target.value as 'text' | 'number' | 'boolean' }
                              }))}
                              className={`${inputCls} w-24 cursor-pointer shrink-0`}
                            >
                              <option value="text">Text</option>
                              <option value="number">Số</option>
                              <option value="boolean">Có/Không</option>
                            </select>

                            {d.value_type === 'text' && (
                              <input
                                value={d.value_text}
                                onChange={e => setAttributeDraft(prev => ({ ...prev, [attr.id]: { ...d, value_text: e.target.value } }))}
                                className={inputCls}
                                placeholder={`Nhập ${attr.label.toLowerCase()}…`}
                              />
                            )}
                            {d.value_type === 'number' && (
                              <input
                                type="number"
                                value={d.value_number}
                                onChange={e => setAttributeDraft(prev => ({ ...prev, [attr.id]: { ...d, value_number: e.target.value } }))}
                                className={inputCls}
                                placeholder="0"
                              />
                            )}
                            {d.value_type === 'boolean' && (
                              <select
                                value={d.value_boolean ? '1' : '0'}
                                onChange={e => setAttributeDraft(prev => ({ ...prev, [attr.id]: { ...d, value_boolean: e.target.value === '1' } }))}
                                className={`${inputCls} cursor-pointer`}
                              >
                                <option value="0">Không</option>
                                <option value="1">Có</option>
                              </select>
                            )}
                          </div>
                        </Field>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowVariantForm(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 cursor-pointer">Hủy</button>
                <button type="button" onClick={handleSaveVariant} className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-xl text-sm font-semibold cursor-pointer shadow-sm border-none">
                  {editingVariantIndex !== null ? 'Cập nhật biến thể' : 'Lưu biến thể'}
                </button>
              </div>
            </div>
          )}

          {!showVariantForm && variants.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-sm text-slate-500 font-medium">Chưa có biến thể nào được thêm.</p>
              <p className="text-xs text-slate-400 mt-1">Bấm "Thêm biến thể" để bắt đầu khai báo SKU đầu tiên.</p>
            </div>
          ) : !showVariantForm && (
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div key={v.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
                      {v.images?.[0] ? <img src={v.images[0]} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-slate-300" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{v.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">{v.status}</span>
                        {v.attributes?.length > 0 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                            {v.attributes.length} thuộc tính
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">SKU: {v.sku} · {v.price ? v.price.toLocaleString() : 0} {v.currency}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleOpenEditVariant(i)} className="p-2 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-lg cursor-pointer"><Edit2 size={14} /></button>
                    <button type="button" onClick={() => remove(i)} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg cursor-pointer"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}