import React, { useState } from 'react';
import {
  ChevronLeft, Package, Layers, Tag, Calendar, Edit3,
  CheckCircle, XCircle, X, Clock, AlertTriangle, QrCode,
  MapPin, ShieldCheck, Box, BarChart3, Globe, Hash,
  TrendingUp, Users, Truck, ExternalLink, Download,
  ChevronDown, ChevronUp, Activity, Archive, LayoutList, Code, FileJson, Trash2
} from 'lucide-react';
import Button from '../../components/ui/Button';

import {
  AdminProductDetailProductStatus as ProductStatus,
  AdminProductDetailVariantStatus as VariantStatus,
  AdminProductDetailBatchStatus as BatchStatus,
  AdminProductDetailItemStatus as ItemStatus,
  AdminProductDetailAttributeValue as AttributeValue,
  AdminProductDetailVariant as Variant,
  AdminProductDetailBatch as Batch,
  AdminProductDetailProductItem as ProductItem,
  AdminProductDetailTraceEvent as TraceEvent,
  AdminProductDetailProduct as Product
} from '@shared/types/domain';

const MOCK_PRODUCTS: Record<string, Product> = {
  '1': {
    id: '1',
    name: 'Máy lọc nước RO Kangaroo VT3',
    slug: 'may-loc-nuoc-ro-kangaroo-vt3',
    category: 'Thiết bị gia dụng',
    categoryId: 'CAT-HOME-001',
    description: 'Máy lọc nước RO Kangaroo VT3 với công nghệ lọc ngược thẩm thấu hiện đại 9 lõi lọc. Loại bỏ 99.9% vi khuẩn, kim loại nặng và tạp chất.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1621217742914-72a39211fb85?w=200&h=200&fit=crop',
    status: 'ACTIVE',
    createdAt: '2026-06-24',
    updatedAt: '2026-06-25',
    tags: ['Gia dụng', 'Lọc nước', 'Kangaroo', 'RO Technology'],
    totalVariants: 3,
    totalBatches: 12,
    totalOwners: 847,
    totalWarranties: 632,
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
    batches: [
      { id: 'b1', batchCode: 'BATCH-2026-KG01', variantName: 'Màu Trắng - 9 lõi', quantity: 250, manufactureDate: '2026-01-15', expiryDate: '2031-01-15', originCountry: 'Việt Nam', supplierName: 'Kangaroo Group', status: 'ACTIVE', importedAt: '2026-02-01' },
    ],
    items: [
      { 
        id: 'i1', variantName: 'Màu Trắng - 9 lõi', batchCode: 'BATCH-2026-KG01', itemCode: 'ITEM-KG-0001', serialNumber: 'SN-KG-889021', status: 'REGISTERED', producedAt: '2026-01-15', locationName: 'Khách hàng Nguyễn Văn A',
        traceEvents: [
          { id: 'te1', event: 'Sản xuất', detail: 'Sản xuất tại nhà máy', actor: 'Kangaroo', location: 'HN', timestamp: '2026-01-15 07:00', type: 'manufacture' },
          { id: 'te2', event: 'Đã bán', detail: 'Đã bán cho khách hàng', actor: 'Đại lý A', location: 'TP.HCM', timestamp: '2026-06-20 10:00', type: 'activate' }
        ]
      },
      { id: 'i2', variantName: 'Màu Trắng - 9 lõi', batchCode: 'BATCH-2026-KG01', itemCode: 'ITEM-KG-0002', serialNumber: 'SN-KG-889022', status: 'IN_STOCK', producedAt: '2026-01-15', locationName: 'Kho tổng Cầu Giấy' },
    ],
    traceEvents: [
      { id: 'e1', event: 'Sản xuất hoàn tất', detail: 'Lô hàng BATCH-2026-KG01 xuất xưởng với 250 đơn vị', actor: 'Kangaroo Factory HN', location: 'Khu công nghiệp Thạch Thất, Hà Nội', timestamp: '2026-01-15 07:00', type: 'manufacture' },
    ]
  }
};

const PRODUCT_STATUS_CONFIG: Record<ProductStatus, { label: string; bg: string; dot: string; icon: React.ReactNode }> = {
  ACTIVE:       { label: 'Đang kinh doanh',    bg: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', icon: <CheckCircle size={14} /> },
  DRAFT:        { label: 'Bản nháp',            bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: <Clock size={14} /> },
  DISCONTINUED: { label: 'Ngừng kinh doanh',   bg: 'bg-red-50 text-red-700 border-red-200',       dot: 'bg-red-500',   icon: <XCircle size={14} /> },
};

const BATCH_STATUS_CONFIG: Record<BatchStatus, { label: string; bg: string; dot: string }> = {
  ACTIVE:   { label: 'Đang lưu hành', bg: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  EXPIRED:  { label: 'Hết hạn',       bg: 'bg-red-50 text-red-700 border-red-200',       dot: 'bg-red-500' },
  RECALLED: { label: 'Thu hồi',       bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  BLOCKED:  { label: 'Bị khóa',       bg: 'bg-slate-100 text-slate-600 border-slate-300', dot: 'bg-slate-400' },
};

const ITEM_STATUS_CONFIG: Record<ItemStatus, { label: string; bg: string }> = {
  IN_STOCK: { label: 'Tồn kho', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  IN_TRANSIT: { label: 'Đang giao', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  AT_DEALER: { label: 'Tại đại lý', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  SOLD: { label: 'Đã bán', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REGISTERED: { label: 'Đã đăng ký', bg: 'bg-green-50 text-green-700 border-green-200' },
  WARRANTY_ACTIVE: { label: 'Đang bảo hành', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  RETURNED: { label: 'Trả hàng', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  RECALLED: { label: 'Thu hồi', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
  LOST: { label: 'Thất lạc', bg: 'bg-red-50 text-red-700 border-red-200' },
  DAMAGED: { label: 'Hư hỏng', bg: 'bg-red-50 text-red-700 border-red-200' },
};

const TRACE_TYPE_CONFIG: Record<TraceEvent['type'], { color: string; bg: string; icon: React.ReactNode }> = {
  manufacture: { color: 'text-blue-600',   bg: 'bg-blue-100',   icon: <Box size={14} /> },
  import:      { color: 'text-green-600',  bg: 'bg-green-100',  icon: <Truck size={14} /> },
  transfer:    { color: 'text-purple-600', bg: 'bg-purple-100', icon: <MapPin size={14} /> },
  activate:    { color: 'text-cyan-600',   bg: 'bg-cyan-100',   icon: <Users size={14} /> },
  warranty:    { color: 'text-indigo-600', bg: 'bg-indigo-100', icon: <ShieldCheck size={14} /> },
  claim:       { color: 'text-red-600',    bg: 'bg-red-100',    icon: <AlertTriangle size={14} /> },
};

export default function ProductDetailPage({ productId, onNavigate }: { productId?: string; onNavigate: (tabId: string, id?: string) => void }) {
  const product = MOCK_PRODUCTS[productId || '1'] || MOCK_PRODUCTS['1'];
  const [activeTab, setActiveTab] = useState<'overview' | 'variants' | 'batches' | 'items' | 'traceability'>('overview');
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ProductItem | null>(null);
  const [isItemTraceOpen, setIsItemTraceOpen] = useState(false);

  const statusCfg = PRODUCT_STATUS_CONFIG[product.status];
  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {/* Back + Title */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('products')}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
            title="Quay lại danh sách"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{product.name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                {statusCfg.label}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              ID: <span className="font-mono font-semibold">PRD-{product.id.padStart(6, '0')}</span>
              <span className="mx-2 text-slate-300">·</span>
              Cập nhật lần cuối: <span className="font-medium">{product.updatedAt}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 font-semibold cursor-pointer"
          >
            <Download size={15} /> Xuất QR
          </Button>
          <Button
            onClick={() => onNavigate('edit-product', product.id)}
            className="rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
          >
            <Edit3 size={15} /> Chỉnh sửa
          </Button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Biến thể sản phẩm', value: product.totalVariants, icon: <Layers size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Lô hàng đang lưu', value: product.totalBatches, icon: <Package size={18} />, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Khách hàng sở hữu', value: product.totalOwners.toLocaleString(), icon: <Users size={18} />, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Bảo hành điện tử', value: product.totalWarranties.toLocaleString(), icon: <ShieldCheck size={18} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
            <div className={`${kpi.bg} ${kpi.color} p-3 rounded-xl flex-shrink-0`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{kpi.label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${kpi.color}`}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 px-6 overflow-x-auto">
          {[
            { key: 'overview',     label: 'Tổng quan',        icon: <BarChart3 size={15} /> },
            { key: 'variants',     label: 'Biến thể',         icon: <Layers size={15} /> },
            { key: 'batches',      label: 'Lô hàng',          icon: <Package size={15} /> },
            { key: 'items',        label: 'Sản phẩm (Items)', icon: <LayoutList size={15} /> },
            { key: 'traceability', label: 'Truy xuất nguồn gốc', icon: <Activity size={15} /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap -mb-px ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== TAB: TỔNG QUAN ===== */}
        {activeTab === 'overview' && (
          <div className="p-6 grid grid-cols-3 gap-6">
            {/* Left: Image + Tags */}
            <div className="col-span-1 space-y-5">
              {/* Product Thumbnail */}
              <div className={`w-full aspect-square rounded-2xl bg-slate-100 flex items-center justify-center shadow-md overflow-hidden border border-slate-200`}>
                {product.thumbnailUrl ? (
                  <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package size={72} className="text-slate-300" />
                )}
              </div>

              {/* Tags */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tags sản phẩm</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-full">
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* QR Info */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <QrCode size={14} />
                  Thông tin truy xuất QR
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Quét mã QR trên bao bì sản phẩm để tra cứu thông tin truy xuất nguồn gốc, lịch sử vòng đời và bảo hành điện tử.
                </p>
                <button className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-none">
                  <ExternalLink size={11} /> Xem trang truy xuất QR
                </button>
              </div>
            </div>

            {/* Right: Product Details */}
            <div className="col-span-2 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Hash size={14} className="text-slate-400" /> Thông tin cơ bản
                </h3>
                <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  {[
                    { label: 'Tên sản phẩm', value: product.name },
                    { label: 'Slug', value: product.slug },
                    { label: 'Danh mục', value: product.category },
                    { label: 'Mã danh mục', value: product.categoryId },
                    { label: 'Ngày tạo', value: product.createdAt },
                    { label: 'Cập nhật lần cuối', value: product.updatedAt },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col gap-0.5">
                      <dt className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{item.label}</dt>
                      <dd className="text-sm font-semibold text-slate-800">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">Mô tả sản phẩm</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: BIẾN THỂ ===== */}
        {activeTab === 'variants' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Hiển thị <span className="font-bold text-slate-800">{product.variants.length}</span> biến thể của sản phẩm này.
              </p>
            </div>

            {product.variants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Layers size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Chưa có biến thể nào</h3>
                <p className="text-sm text-slate-500 mt-1">Sản phẩm này chưa được cấu hình biến thể.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {product.variants.map((variant) => (
                  <div key={variant.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Box size={18} className="text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-sm">{variant.name}</h4>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                              variant.status === 'ACTIVE'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${variant.status === 'ACTIVE' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                              {variant.status === 'ACTIVE' ? 'Đang bán' : 'Không hoạt động'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 font-mono">SKU: {variant.sku} | Barcode: {variant.barcode || '—'}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-blue-600">{formatPrice(variant.price)}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mb-2">Thuộc tính (Attributes)</p>
                      <div className="flex flex-wrap gap-3">
                        {variant.attributes.map((attr, idx) => (
                          <div key={idx} className="flex gap-2 text-xs bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            <span className="font-medium text-slate-500">{attr.label}:</span>
                            <span className="font-bold text-slate-800">
                              {attr.value_text || attr.value_number || (attr.value_boolean ? 'Có' : 'Không')}
                            </span>
                          </div>
                        ))}
                        {variant.attributes.length === 0 && <span className="text-xs text-slate-400 italic">Không có thuộc tính.</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== TAB: LÔ HÀNG ===== */}
        {activeTab === 'batches' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Hiển thị <span className="font-bold text-slate-800">{product.batches.length}</span> lô hàng liên quan đến sản phẩm này.
              </p>
            </div>

            {product.batches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Archive size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Chưa có lô hàng nào</h3>
                <p className="text-sm text-slate-500 mt-1">Sản phẩm này chưa có lô hàng được nhập kho.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {product.batches.map((batch) => {
                  const batchCfg = BATCH_STATUS_CONFIG[batch.status];
                  const isExpanded = expandedBatch === batch.id;
                  return (
                    <div key={batch.id} className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-all">
                      <button
                        className="w-full flex items-center justify-between p-4 text-left cursor-pointer bg-white hover:bg-slate-50/50 transition-colors border-none"
                        onClick={() => setExpandedBatch(isExpanded ? null : batch.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package size={16} className="text-slate-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm font-mono">{batch.batchCode}</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${batchCfg.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${batchCfg.dot}`}></span>
                                {batchCfg.label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{batch.variantName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8 text-right">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Số lượng</p>
                            <p className="text-sm font-bold text-slate-800">{batch.quantity.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">NSX</p>
                            <p className="text-sm font-semibold text-slate-700">{batch.manufactureDate}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">HSD</p>
                            <p className="text-sm font-semibold text-slate-700">{batch.expiryDate}</p>
                          </div>
                          {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-6 pb-5 pt-3 border-t border-slate-100 bg-slate-50/50 grid grid-cols-3 gap-6">
                          {[
                            { label: 'Xuất xứ', value: batch.originCountry, icon: <Globe size={13} className="text-slate-400" /> },
                            { label: 'Nhà cung cấp', value: batch.supplierName, icon: <Truck size={13} className="text-slate-400" /> },
                            { label: 'Ngày nhập kho', value: batch.importedAt, icon: <Calendar size={13} className="text-slate-400" /> },
                          ].map(item => (
                            <div key={item.label}>
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1 mb-1">
                                {item.icon} {item.label}
                              </p>
                              <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== TAB: SẢN PHẨM (ITEMS) ===== */}
        {activeTab === 'items' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Hiển thị <span className="font-bold text-slate-800">{product.items.length}</span> đơn vị sản phẩm cụ thể.
              </p>
              <div className="relative w-64">
                <input type="text" placeholder="Tìm theo Serial/Item Code..." className="w-full pl-3 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs" />
              </div>
            </div>

            {product.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <LayoutList size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Chưa có sản phẩm nào</h3>
                <p className="text-sm text-slate-500 mt-1">Sản phẩm này chưa có đơn vị sản phẩm (Item) nào được tạo.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-xs text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Mã Item</th>
                      <th className="px-4 py-3">Serial Number</th>
                      <th className="px-4 py-3">Biến thể</th>
                      <th className="px-4 py-3">Lô hàng</th>
                      <th className="px-4 py-3">Vị trí hiện tại</th>
                      <th className="px-4 py-3 text-center">Trạng thái</th>
                      <th className="px-4 py-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                      <tbody className="divide-y divide-slate-100">
                    {product.items.map(item => {
                      const st = ITEM_STATUS_CONFIG[item.status] || { label: item.status, bg: 'bg-slate-100 text-slate-600 border-slate-200' };
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-slate-800">{item.itemCode}</td>
                          <td className="px-4 py-3 font-mono text-slate-600">{item.serialNumber}</td>
                          <td className="px-4 py-3 text-slate-700">{item.variantName}</td>
                          <td className="px-4 py-3 text-slate-600 text-xs">{item.batchCode}</td>
                          <td className="px-4 py-3 text-slate-700">{item.locationName}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${st.bg}`}>
                              {st.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button 
                              onClick={() => { setSelectedItem(item); setIsItemTraceOpen(true); }}
                              className="text-blue-600 hover:text-blue-800 cursor-pointer bg-transparent border-none p-1"
                              title="Truy xuất"
                            >
                              <Activity size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Item Trace Modal */}
        {isItemTraceOpen && selectedItem && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="font-bold">Truy xuất Item: {selectedItem.itemCode}</h3>
                <button onClick={() => setIsItemTraceOpen(false)}><X size={20} /></button>
              </div>
              <div className="p-6">
                 {selectedItem.traceEvents && selectedItem.traceEvents.length > 0 ? (
                    <div className="space-y-4">
                      {selectedItem.traceEvents.map(ev => (
                        <div key={ev.id} className="flex gap-3">
                          <div className="text-xs font-bold text-slate-500 w-24">{ev.timestamp}</div>
                          <div className="flex-1 text-sm font-semibold text-slate-800">{ev.event} - {ev.detail} ({ev.location})</div>
                        </div>
                      ))}
                    </div>
                 ) : (
                   <p className="text-slate-500 text-sm">Không có dữ liệu sự kiện.</p>
                 )}
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: TRUY XUẤT NGUỒN GỐC ===== */}
        {activeTab === 'traceability' && (
          <div className="p-6">
            {product.traceEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Activity size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Chưa có sự kiện truy xuất</h3>
                <p className="text-sm text-slate-500 mt-1">Sản phẩm này chưa có lịch sử vòng đời được ghi nhận.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[22px] top-5 bottom-5 w-0.5 bg-slate-200 z-0" />

                <div className="space-y-0">
                  {product.traceEvents.map((ev, idx) => {
                    const cfg = TRACE_TYPE_CONFIG[ev.type];
                    const isLast = idx === product.traceEvents.length - 1;
                    return (
                      <div key={ev.id} className={`relative flex gap-5 ${!isLast ? 'pb-6' : ''}`}>
                        {/* Circle icon */}
                        <div className={`relative z-10 w-11 h-11 rounded-full ${cfg.bg} ${cfg.color} flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm`}>
                          {cfg.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-sm transition-shadow min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-900">{ev.event}</h4>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{ev.detail}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap flex-shrink-0">{ev.timestamp}</span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-5 text-[11px]">
                            <div className="flex items-center gap-1 text-slate-500">
                              <Users size={11} className="text-slate-400" />
                              <span className="font-semibold text-slate-700">{ev.actor}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500">
                              <MapPin size={11} className="text-slate-400" />
                              <span className="font-semibold text-slate-700">{ev.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
