import React, { useState } from 'react';
import {
  ChevronLeft, Package, Layers, Tag, Calendar, Edit3,
  CheckCircle, XCircle, Clock, ShieldCheck, Box, BarChart3, Hash,
  Users, AlertCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useProductDetail } from '../../../features/products/hooks/useProducts';
import { parseApiError } from '../../../api/axios';

import {
  AdminProductDetailProductStatus as ProductStatus,
  AdminProductDetailVariantStatus as VariantStatus,
  AdminProductDetailAttributeValue as AttributeValue,
  AdminProductDetailVariant as Variant,
  AdminProductDetailProduct as Product,
} from '@shared/types/domain';

const PRODUCT_STATUS_CONFIG: Record<ProductStatus, { label: string; bg: string; dot: string; icon: React.ReactNode }> = {
  ACTIVE:       { label: 'Đang kinh doanh',    bg: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', icon: <CheckCircle size={14} /> },
  DRAFT:        { label: 'Bản nháp',            bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: <Clock size={14} /> },
  DISCONTINUED: { label: 'Ngừng kinh doanh',   bg: 'bg-red-50 text-red-700 border-red-200',       dot: 'bg-red-500',   icon: <XCircle size={14} /> },
};

export default function ProductDetailPage({ productId, onNavigate }: { productId?: string; onNavigate: (tabId: string, id?: string) => void }) {
  if (!productId) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-semibold">Thiếu mã sản phẩm.</p>
        <button onClick={() => onNavigate('products')} className="mt-4 text-blue-600 hover:underline">Quay lại danh sách</button>
      </div>
    );
  }

  const { data: product, isLoading, error, refetch } = useProductDetail(productId);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'variants'>('overview');

  if (isLoading) {
    return (
      <div className="bg-white p-8 space-y-8 min-h-screen animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-24 bg-slate-200 rounded-xl"></div>
        <div className="h-48 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto mt-12">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-505 flex items-center justify-center mb-4">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Không thể tải thông tin sản phẩm</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          {parseApiError(error)}
        </p>
        <div className="flex gap-3 mt-6">
          <Button onClick={() => onNavigate('products')} variant="secondary" className="rounded-xl px-4 text-xs font-semibold cursor-pointer">Quay lại</Button>
          <Button onClick={() => refetch()} className="rounded-xl px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Thử lại</Button>
        </div>
      </Card>
    );
  }

  // Safe mapping for snake_case/camelCase keys from JSON response
  const categoryId = (product as any).category_id || product.categoryId;
  const createdAt = (product as any).created_at || product.createdAt;
  const updatedAt = (product as any).updated_at || product.updatedAt;
  const thumbnailUrl = (product as any).thumbnail_url || product.thumbnailUrl;

  const totalVariants = product.variants?.length || 0;
  const totalBatches = (product as any).total_batches || 0;
  const totalOwners = (product as any).total_owners || 0;
  const totalWarranties = (product as any).total_warranties || 0;

  const statusCfg = PRODUCT_STATUS_CONFIG[product.status] || { label: product.status, bg: 'bg-slate-50 text-slate-705 border-slate-200', dot: 'bg-slate-400', icon: <Package size={14} /> };
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
              ID: <span className="font-mono font-semibold">PRD-{product.id ? product.id.substring(0, 8) : ''}</span>
              <span className="mx-2 text-slate-300">·</span>
              Cập nhật lần cuối: <span className="font-medium">
                {updatedAt ? new Date(updatedAt).toLocaleString('vi-VN') : '—'}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
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
          { label: 'Biến thể sản phẩm', value: totalVariants, icon: <Layers size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Lô hàng đang lưu', value: totalBatches, icon: <Package size={18} />, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Khách hàng sở hữu', value: totalOwners.toLocaleString(), icon: <Users size={18} />, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Bảo hành điện tử', value: totalWarranties.toLocaleString(), icon: <ShieldCheck size={18} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
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
            {/* Left: Image + Tags + QR Card */}
            <div className="col-span-1 space-y-5">
              {/* Product Thumbnail */}
              <div className={`w-full aspect-square rounded-2xl bg-slate-100 flex items-center justify-center shadow-md overflow-hidden border border-slate-200`}>
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package size={72} className="text-slate-300" />
                )}
              </div>
              
              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
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
              )}
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
                    { label: 'Slug / Mã định danh', value: product.slug || '—' },
                    { label: 'Danh mục', value: product.category || 'N/A' },
                    { label: 'Mã danh mục', value: categoryId || 'N/A' },
                    { label: 'Ngày tạo', value: createdAt ? new Date(createdAt).toLocaleString('vi-VN') : '—' },
                    { label: 'Cập nhật lần cuối', value: updatedAt ? new Date(updatedAt).toLocaleString('vi-VN') : '—' },
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
                <p className="text-sm text-slate-600 leading-relaxed">{product.description || 'Không có mô tả.'}</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: BIẾN THỂ ===== */}
        {activeTab === 'variants' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Hiển thị <span className="font-bold text-slate-800">{(product.variants || []).length}</span> biến thể của sản phẩm này.
              </p>
            </div>

            {(!product.variants || product.variants.length === 0) ? (
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

                    {variant.attributes && variant.attributes.length > 0 && (
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
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
