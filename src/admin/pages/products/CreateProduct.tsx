import React, { useMemo, useState } from 'react';
import {
  ChevronLeft, Save, Trash2, Edit2, AlertCircle, Plus, X, ImageIcon, Tag, ChevronDown, Search
} from 'lucide-react';

/* ============================================================
   Types — mirrored 1:1 from the DBML schema
   ============================================================ */

import {
  AdminProductStatus as ProductStatus,
  AdminVariantStatus as VariantStatus,
  AdminCreateProductCategory as Category,
  AdminAttributeDef as AttributeDef,
  AdminCreateAttributeValue as AttributeValue,
  AdminVariantImage as VariantImage,
  AdminCreateVariant as Variant,
  AdminCreateProductFormData as ProductFormData
} from '@shared/types/domain';

/* ============================================================
   Mock reference data — in production these come from
   GET /product-categories and GET /attributes?category_id=
   ============================================================ */

const CATEGORIES: Category[] = [
  { id: 'cat-001', name: 'Sữa bột', parent_id: null },
  { id: 'cat-002', name: 'Thực phẩm chức năng', parent_id: null },
  { id: 'cat-003', name: 'Mỹ phẩm', parent_id: null },
  { id: 'cat-004', name: 'Mỹ phẩm / Chăm sóc da', parent_id: 'cat-003' },
  { id: 'cat-005', name: 'Đồ điện gia dụng', parent_id: null },
];

const ATTRIBUTES: AttributeDef[] = [
  { id: 'attr-001', category_id: 'cat-001', code: 'weight', label: 'Khối lượng tịnh' },
  { id: 'attr-002', category_id: 'cat-001', code: 'age_range', label: 'Độ tuổi sử dụng' },
  { id: 'attr-003', category_id: 'cat-001', code: 'is_organic', label: 'Hữu cơ' },
  { id: 'attr-004', category_id: 'cat-004', code: 'volume', label: 'Dung tích' },
  { id: 'attr-005', category_id: 'cat-004', code: 'skin_type', label: 'Loại da phù hợp' },
  { id: 'attr-006', category_id: 'cat-005', code: 'voltage', label: 'Điện áp' },
  { id: 'attr-007', category_id: 'cat-005', code: 'warranty_months', label: 'Số tháng bảo hành mặc định' },
];

const BLANK_ATTR_VALUE: AttributeValue = { attribute_id: '', label: '', value_kind: 'text', value_text: '' };

const codify = (s: string) =>
  s.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const BLANK_VARIANT: Omit<Variant, 'ui_id'> = {
  sku: '', name: '', barcode: '', price: '', currency: 'VND', images: [], status: 'ACTIVE', attribute_values: []
};

const slugify = (s: string) =>
  s.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

/* ============================================================
   Small reusable pieces
   ============================================================ */

const Field: React.FC<{ label: string; required?: boolean; hint?: string; children: React.ReactNode; className?: string }> = ({ label, required, hint, children, className }) => (
  <div className={`space-y-1.5 ${className || ''}`}>
    <div className="flex items-baseline justify-between">
      <label className="text-xs font-bold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
    </div>
    {children}
  </div>
);

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-shadow placeholder:text-slate-400";

const CategorySelect: React.FC<{ value: string; onChange: (id: string) => void }> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const selected = CATEGORIES.find(c => c.id === value);
  const filtered = CATEGORIES.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));

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
              className="w-full text-sm outline-none" />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && <div className="px-3 py-2 text-xs text-slate-400">Không tìm thấy danh mục</div>}
            {filtered.map(c => (
              <button key={c.id} type="button"
                onClick={() => { onChange(c.id); setOpen(false); setQ(''); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer ${c.id === value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'}`}>
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
          <button type="button" onClick={() => onChange(tags.filter(x => x !== t))} className="hover:text-blue-900 cursor-pointer"><X size={10} /></button>
        </span>
      ))}
      <input value={draft} onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); } if (e.key === 'Backspace' && !draft && tags.length) onChange(tags.slice(0, -1)); }}
        onBlur={commit}
        placeholder={tags.length === 0 ? 'Nhập tag rồi nhấn Enter…' : ''}
        className="flex-1 min-w-[100px] text-sm outline-none bg-transparent" />
    </div>
  );
};

const NewAttributeInline: React.FC<{ existingCodes: string[]; onCreate: (def: { code: string; label: string }) => void; onCancel: () => void }> = ({ existingCodes, onCreate, onCancel }) => {
  const [label, setLabel] = useState('');
  const [code, setCode] = useState('');
  const [codeTouched, setCodeTouched] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleLabel = (v: string) => {
    setLabel(v);
    if (!codeTouched) setCode(codify(v));
  };

  const submit = () => {
    if (!label.trim()) { setErr('Tên thuộc tính (label) không được để trống.'); return; }
    const finalCode = code.trim() || codify(label);
    if (!finalCode) { setErr('Code không hợp lệ.'); return; }
    if (existingCodes.includes(finalCode)) { setErr('Code này đã tồn tại trong danh mục — chọn code khác.'); return; }
    onCreate({ code: finalCode, label: label.trim() });
  };

  return (
    <div className="absolute z-10 mt-1 left-0 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-3 space-y-2">
      <p className="text-[11px] font-bold text-slate-700">Tạo thuộc tính mới cho danh mục này</p>
      {err && <p className="text-[10px] text-red-600">{err}</p>}
      <input autoFocus value={label} onChange={e => handleLabel(e.target.value)}
        placeholder="Tên hiển thị, vd: Dung tích" className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg" />
      <input value={code} onChange={e => { setCodeTouched(true); setCode(codify(e.target.value)); }}
        placeholder="code, vd: volume" className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg font-mono" />
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel} className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 rounded-md cursor-pointer">Hủy</button>
        <button type="button" onClick={submit} className="px-2.5 py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer">Tạo & chọn</button>
      </div>
    </div>
  );
};

const ImageUrlList: React.FC<{ images: VariantImage[]; onChange: (imgs: VariantImage[]) => void }> = ({ images, onChange }) => {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...images, { url: v }]);
    setDraft('');
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="Dán URL hình ảnh rồi nhấn Enter" className={inputCls} />
        <button type="button" onClick={add} className="px-3 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer"><Plus size={16} /></button>
      </div>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group">
              <img src={img.url} alt="" className="w-full h-full object-cover" onError={e => ((e.target as HTMLImageElement).style.display = 'none')} />
              <button type="button" onClick={() => onChange(images.filter((_, idx) => idx !== i))}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ============================================================
   Main component
   ============================================================ */

const CreateProduct: React.FC<{ onNavigate: (tabId: string) => void }> = ({ onNavigate }) => {
  const [productData, setProductData] = useState<ProductFormData>({
    name: '', slug: '', category_id: '', description: '', thumbnail_url: '', tags: [], metadata_json: '', status: 'DRAFT'
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [variants, setVariants] = useState<Variant[]>([]);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [variantForm, setVariantForm] = useState<Omit<Variant, 'ui_id'>>(BLANK_VARIANT);
  const [variantError, setVariantError] = useState<string | null>(null);

  // Attributes created inline by the user for the current category (in production: POST /attributes)
  const [customAttributes, setCustomAttributes] = useState<AttributeDef[]>([]);
  const [creatingAttrFor, setCreatingAttrFor] = useState<number | null>(null);

  const availableAttributes = useMemo(
    () => [...ATTRIBUTES, ...customAttributes].filter(a => a.category_id === productData.category_id),
    [productData.category_id, customAttributes]
  );

  const handleNameChange = (name: string) => {
    setProductData(p => ({ ...p, name, slug: slugTouched ? p.slug : slugify(name) }));
  };

  const validateProduct = (): string | null => {
    if (!productData.name.trim()) return 'Tên sản phẩm không được để trống.';
    if (productData.name.length > 255) return 'Tên sản phẩm tối đa 255 ký tự.';
    if (!productData.category_id) return 'Vui lòng chọn danh mục sản phẩm.';
    if (productData.thumbnail_url && !/^https?:\/\//.test(productData.thumbnail_url)) return 'Thumbnail URL phải là URL hợp lệ (http/https).';
    if (productData.metadata_json.trim()) {
      try {
        const parsed = JSON.parse(productData.metadata_json);
        if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) return 'Metadata JSON phải là một Object hợp lệ, ví dụ {"key":"value"}.';
      } catch { return 'Metadata JSON không đúng định dạng.'; }
    }
    if (variants.length === 0) return 'Sản phẩm cần ít nhất 1 biến thể (variant) trước khi lưu.';
    return null;
  };

  const handleSaveProduct = () => {
    const err = validateProduct();
    if (err) { setProductError(err); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setProductError(null);

    const payload = {
      ...productData,
      tags: productData.tags,
      metadata_json: productData.metadata_json ? JSON.parse(productData.metadata_json) : {},
      variants: variants.map(v => ({
        sku: v.sku, name: v.name, barcode: v.barcode || null,
        price: parseFloat(v.price) || 0, currency: v.currency,
        images_json: v.images.map(i => i.url),
        status: v.status,
        attribute_values: v.attribute_values,
      })),
    };
    console.log('CREATE PRODUCT PAYLOAD', payload);
    alert('Đã lưu sản phẩm thành công!');
    onNavigate('products');
  };

  const validateVariant = (v: Omit<Variant, 'ui_id'>, editingId: string | null): string | null => {
    if (!v.sku.trim()) return 'SKU không được để trống.';
    if (!v.name.trim()) return 'Tên biến thể không được để trống.';
    if (v.name.length > 255) return 'Tên biến thể tối đa 255 ký tự.';
    const priceNum = parseFloat(v.price);
    if (v.price !== '' && (isNaN(priceNum) || priceNum < 0)) return 'Giá bán phải là số ≥ 0.';

    const skuExists = variants.some(ex => ex.sku.toUpperCase() === v.sku.toUpperCase() && ex.ui_id !== editingId);
    if (skuExists) return 'SKU đã tồn tại trong sản phẩm này.';
    if (v.barcode) {
      const barcodeExists = variants.some(ex => ex.barcode === v.barcode && ex.ui_id !== editingId);
      if (barcodeExists) return 'Barcode đã tồn tại trong sản phẩm này.';
    }
    for (const av of v.attribute_values) {
      if (!av.attribute_id) return 'Vui lòng chọn thuộc tính cho mỗi dòng attribute.';
      if (av.value_kind === 'text' && !(av.value_text || '').trim()) return `Thuộc tính "${av.label}" thiếu giá trị text.`;
      if (av.value_kind === 'number' && (av.value_number === undefined || isNaN(av.value_number))) return `Thuộc tính "${av.label}" thiếu giá trị số.`;
    }
    return null;
  };

  const handleSaveVariant = () => {
    const error = validateVariant(variantForm, editingVariantId);
    if (error) { setVariantError(error); return; }
    if (editingVariantId) {
      setVariants(variants.map(v => v.ui_id === editingVariantId ? { ...variantForm, ui_id: editingVariantId } : v));
    } else {
      setVariants([...variants, { ...variantForm, ui_id: crypto.randomUUID() }]);
    }
    cancelVariantForm();
  };

  const openNewVariant = () => {
    setVariantForm(BLANK_VARIANT);
    setEditingVariantId(null);
    setVariantError(null);
    setShowVariantForm(true);
  };

  const openEditVariant = (v: Variant) => {
    const { ui_id, ...rest } = v;
    setVariantForm({ ...rest, attribute_values: rest.attribute_values.map(a => ({ ...a })), images: rest.images.map(i => ({ ...i })) });
    setEditingVariantId(ui_id);
    setVariantError(null);
    setShowVariantForm(true);
  };

  const cancelVariantForm = () => {
    setShowVariantForm(false);
    setEditingVariantId(null);
    setVariantForm(BLANK_VARIANT);
    setVariantError(null);
  };

  const handleDeleteVariant = (ui_id: string) => {
    if (confirm('Xóa biến thể này?')) setVariants(variants.filter(v => v.ui_id !== ui_id));
  };

  const addAttributeValue = () => {
    setVariantForm(f => ({ ...f, attribute_values: [...f.attribute_values, { ...BLANK_ATTR_VALUE }] }));
  };

  const updateAttributeValue = (idx: number, patch: Partial<AttributeValue>) => {
    setVariantForm(f => {
      const next = [...f.attribute_values];
      next[idx] = { ...next[idx], ...patch };
      return { ...f, attribute_values: next };
    });
  };

  const onPickAttribute = (idx: number, attribute_id: string) => {
    const def = [...ATTRIBUTES, ...customAttributes].find(a => a.id === attribute_id);
    updateAttributeValue(idx, { attribute_id, label: def?.label || '' });
  };

  const onCreateAttribute = (idx: number, def: { code: string; label: string }) => {
    const newAttr: AttributeDef = {
      id: `attr-new-${crypto.randomUUID()}`,
      category_id: productData.category_id,
      code: def.code,
      label: def.label,
    };
    setCustomAttributes(prev => [...prev, newAttr]);
    updateAttributeValue(idx, { attribute_id: newAttr.id, label: newAttr.label });
    setCreatingAttrFor(null);
  };

  const removeAttributeValue = (idx: number) => {
    setVariantForm(f => ({ ...f, attribute_values: f.attribute_values.filter((_, i) => i !== idx) }));
  };

  const statusPill = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-emerald-100 text-emerald-700',
      DRAFT: 'bg-amber-100 text-amber-700',
      INACTIVE: 'bg-slate-200 text-slate-600',
      DISCONTINUED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-slate-200 text-slate-600';
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center max-w-5xl mx-auto">
        <div>
          <button onClick={() => onNavigate('products')} className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2 font-medium cursor-pointer border-none bg-transparent">
            <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Thêm mới sản phẩm</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNavigate('products')} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer">Hủy</button>
          <button onClick={handleSaveProduct} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-semibold text-white flex items-center gap-2 cursor-pointer shadow-sm">
            <Save className="w-4 h-4" /> Lưu sản phẩm
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        {productError && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
            <AlertCircle size={18} /> {productError}
          </div>
        )}

        {/* Product information */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">Thông tin sản phẩm</h2>
          <div className="grid grid-cols-2 gap-5">
            <Field label="Tên sản phẩm" required className="col-span-2">
              <input value={productData.name} onChange={e => handleNameChange(e.target.value)} maxLength={255} className={inputCls} placeholder="VD: Sữa bột Vinamilk Optimum Gold 3" />
            </Field>

            <Field label="Slug" hint="dùng cho URL, tự sinh từ tên">
              <input value={productData.slug} onChange={e => { setSlugTouched(true); setProductData({ ...productData, slug: slugify(e.target.value) }); }} className={`${inputCls} font-mono`} placeholder="auto-generated" />
            </Field>

            <Field label="Danh mục" required>
              <CategorySelect value={productData.category_id} onChange={id => setProductData({ ...productData, category_id: id })} />
            </Field>

            <Field label="Mô tả" className="col-span-2">
              <textarea value={productData.description} onChange={e => setProductData({ ...productData, description: e.target.value })} rows={3} className={`${inputCls} resize-none`} placeholder="Mô tả ngắn về sản phẩm…" />
            </Field>

            <Field label="Ảnh đại diện (thumbnail)" className="col-span-2">
              <div className="flex gap-3 items-start">
                <div className="w-16 h-16 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {productData.thumbnail_url
                    ? <img src={productData.thumbnail_url} className="w-full h-full object-cover" onError={e => ((e.target as HTMLImageElement).style.display = 'none')} />
                    : <ImageIcon size={18} className="text-slate-300" />}
                </div>
                <input value={productData.thumbnail_url} onChange={e => setProductData({ ...productData, thumbnail_url: e.target.value })} className={inputCls} placeholder="https://…" />
              </div>
            </Field>

            <Field label="Tags" className="col-span-2">
              <TagInput tags={productData.tags} onChange={tags => setProductData({ ...productData, tags })} />
            </Field>

            <Field label="Trạng thái" required>
              <select value={productData.status} onChange={e => setProductData({ ...productData, status: e.target.value as ProductStatus })} className={`${inputCls} cursor-pointer`}>
                <option value="DRAFT">DRAFT — Bản nháp</option>
                <option value="ACTIVE">ACTIVE — Đang bán</option>
                <option value="DISCONTINUED">DISCONTINUED — Ngừng kinh doanh</option>
              </select>
            </Field>
          </div>

          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs font-bold text-blue-600 hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1">
            <ChevronDown size={12} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} /> Tuỳ chọn nâng cao (metadata_json)
          </button>
          {showAdvanced && (
            <Field label="Metadata JSON" hint="object tuỳ ý, vd seo, ghi chú nội bộ…">
              <textarea value={productData.metadata_json} onChange={e => setProductData({ ...productData, metadata_json: e.target.value })} rows={4} className={`${inputCls} font-mono bg-slate-50 resize-none`} placeholder='{"seo_title": "..."}' />
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
              <button onClick={openNewVariant} className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-blue-200">
                <Plus size={14} /> Thêm biến thể
              </button>
            )}
          </div>

          {showVariantForm && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-5 shadow-inner">
              <h3 className="text-sm font-bold text-slate-800">{editingVariantId ? 'Chỉnh sửa biến thể' : 'Thêm biến thể mới'}</h3>

              {variantError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                  <AlertCircle size={14} /> {variantError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field label="SKU" required>
                  <input value={variantForm.sku} onChange={e => setVariantForm({ ...variantForm, sku: e.target.value.toUpperCase() })} className={`${inputCls} font-mono`} placeholder="VD: VNM-OPT3-900G" />
                </Field>
                <Field label="Trạng thái" required>
                  <select value={variantForm.status} onChange={e => setVariantForm({ ...variantForm, status: e.target.value as VariantStatus })} className={`${inputCls} cursor-pointer`}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="DISCONTINUED">DISCONTINUED</option>
                  </select>
                </Field>

                <Field label="Tên biến thể" required className="col-span-2">
                  <input value={variantForm.name} onChange={e => setVariantForm({ ...variantForm, name: e.target.value })} maxLength={255} className={inputCls} placeholder="VD: Hộp thiếc 900g" />
                </Field>

                <Field label="Barcode" hint="tuỳ chọn, phải duy nhất">
                  <input value={variantForm.barcode} onChange={e => setVariantForm({ ...variantForm, barcode: e.target.value })} className={`${inputCls} font-mono`} placeholder="EAN/UPC" />
                </Field>
                <Field label="Giá bán">
                  <div className="flex gap-2">
                    <input type="number" min="0" value={variantForm.price} onChange={e => setVariantForm({ ...variantForm, price: e.target.value })} className={inputCls} placeholder="0" />
                    <select value={variantForm.currency} onChange={e => setVariantForm({ ...variantForm, currency: e.target.value as 'VND' | 'USD' })} className={`${inputCls} w-28 cursor-pointer`}>
                      <option value="VND">VND</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </Field>

                <Field label="Hình ảnh biến thể" className="col-span-2">
                  <ImageUrlList images={variantForm.images} onChange={images => setVariantForm({ ...variantForm, images })} />
                </Field>
              </div>

              {/* Attribute values, scoped to the product's category */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Thuộc tính theo danh mục</label>
                    {!productData.category_id && <p className="text-[10px] text-amber-600 mt-0.5">Chọn danh mục sản phẩm ở trên để xem các thuộc tính khả dụng.</p>}
                  </div>
                  <button type="button" onClick={addAttributeValue} disabled={!productData.category_id}
                    className="text-[11px] font-bold text-blue-600 hover:underline border-none bg-transparent cursor-pointer disabled:text-slate-300 disabled:cursor-not-allowed disabled:no-underline">
                    + Thêm thuộc tính
                  </button>
                </div>

                {variantForm.attribute_values.map((av, idx) => {
                  const usedIds = variantForm.attribute_values.filter((_, i) => i !== idx).map(a => a.attribute_id);
                  const options = availableAttributes.filter(a => !usedIds.includes(a.id) || a.id === av.attribute_id);
                  return (
                    <div key={idx} className="flex gap-2 items-start bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="relative w-1/3 shrink-0">
                        <select value={av.attribute_id} onChange={e => onPickAttribute(idx, e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg cursor-pointer">
                          <option value="">Chọn thuộc tính…</option>
                          {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                        </select>
                        <button type="button" onClick={() => setCreatingAttrFor(idx)} disabled={!productData.category_id}
                          className="mt-1 text-[10px] font-bold text-blue-600 hover:underline bg-transparent border-none cursor-pointer disabled:text-slate-300 disabled:cursor-not-allowed">
                          + Tạo thuộc tính mới
                        </button>
                        {creatingAttrFor === idx && (
                          <NewAttributeInline
                            existingCodes={availableAttributes.map(a => a.code)}
                            onCreate={def => onCreateAttribute(idx, def)}
                            onCancel={() => setCreatingAttrFor(null)}
                          />
                        )}
                      </div>

                      <select value={av.value_kind} onChange={e => updateAttributeValue(idx, { value_kind: e.target.value as AttributeValue['value_kind'] })} className="w-24 px-2 py-1.5 text-xs border border-slate-200 rounded-lg cursor-pointer">
                        <option value="text">Văn bản</option>
                        <option value="number">Số</option>
                        <option value="boolean">Đúng/Sai</option>
                      </select>

                      {av.value_kind === 'text' && (
                        <input value={av.value_text || ''} onChange={e => updateAttributeValue(idx, { value_text: e.target.value })} className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded-lg" placeholder="Giá trị…" />
                      )}
                      {av.value_kind === 'number' && (
                        <input type="number" value={av.value_number ?? ''} onChange={e => updateAttributeValue(idx, { value_number: parseFloat(e.target.value) })} className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded-lg" placeholder="Giá trị…" />
                      )}
                      {av.value_kind === 'boolean' && (
                        <select value={av.value_boolean === undefined ? '' : String(av.value_boolean)} onChange={e => updateAttributeValue(idx, { value_boolean: e.target.value === 'true' })} className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded-lg cursor-pointer">
                          <option value="">—</option>
                          <option value="true">Có</option>
                          <option value="false">Không</option>
                        </select>
                      )}

                      <button type="button" onClick={() => removeAttributeValue(idx)} className="p-1.5 text-slate-400 hover:text-red-600 rounded bg-transparent border-none cursor-pointer"><Trash2 size={14} /></button>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button onClick={cancelVariantForm} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 cursor-pointer">Hủy</button>
                <button onClick={handleSaveVariant} className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-xl text-sm font-semibold cursor-pointer shadow-sm">
                  {editingVariantId ? 'Cập nhật biến thể' : 'Lưu biến thể'}
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
              {variants.map(v => (
                <div key={v.ui_id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
                      {v.images[0] ? <img src={v.images[0].url} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-slate-300" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{v.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusPill(v.status)}`}>{v.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">SKU: {v.sku} · {(parseFloat(v.price) || 0).toLocaleString()} {v.currency}</p>
                      {v.attribute_values.length > 0 && <p className="text-[10px] text-slate-400 mt-1">{v.attribute_values.length} thuộc tính đã cấu hình</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditVariant(v)} className="p-2 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-lg cursor-pointer"><Edit2 size={14} /></button>
                    <button onClick={() => handleDeleteVariant(v.ui_id)} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg cursor-pointer"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;
