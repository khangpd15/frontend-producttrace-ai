import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, Activity, HelpCircle, AlertCircle,
  Inbox, FileText, CheckCircle2, ShoppingBag, Truck, Trash2, ShieldCheck, Tag,
  Search, Package, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useBatchEvents } from '../../../features/batch/hooks/useBatchEvents';
import { useBatchDetail } from '../../../features/batch/hooks/useBatchDetail';
import { useBatchProducts } from '../../../features/batch/hooks/useBatchProducts';
import { useTraceSearch } from '../../../features/trace/hooks/useTraceSearch';

const TABS = [
  { id: 'BATCH', label: 'Sự kiện lô hàng' },
  { id: 'PRODUCT', label: 'Truy vết sản phẩm' },
] as const;

function formatDateTime(val: string | null | undefined): string {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleString('vi-VN');
  } catch {
    return val;
  }
}

function formatDate(val: string | null | undefined): string {
  if (!val) return 'Không có';
  if (val.startsWith('0001-01-01') || val.startsWith('0000-00-00')) return 'Không có';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return 'Không có';
    if (d.getFullYear() <= 1970) return 'Không có';
    return d.toLocaleDateString('vi-VN');
  } catch {
    return 'Không có';
  }
}

const EVENT_TYPE_ICONS: Record<string, any> = {
  MANUFACTURED: CheckCircle2,
  IMPORTED: Inbox,
  EXPORTED: Truck,
  SOLD: ShoppingBag,
  RECALLED: AlertCircle,
  WARRANTY: ShieldCheck,
  TRANSFER: MapPin,
  DEFAULT: Activity
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  MANUFACTURED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  IMPORTED: 'bg-blue-50 text-blue-600 border-blue-200',
  EXPORTED: 'bg-purple-50 text-purple-700 border-purple-200',
  SOLD: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  RECALLED: 'bg-rose-50 text-rose-600 border-rose-200',
  WARRANTY: 'bg-amber-50 text-amber-700 border-amber-200',
  TRANSFER: 'bg-teal-50 text-teal-600 border-teal-200',
  DEFAULT: 'bg-slate-50 text-slate-600 border-slate-200'
};

const STATUS_CONFIG: Record<string, { bg: string; dot: string; label: string }> = {
  ACTIVE: { bg: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', label: 'Đang hoạt động' },
  EXPIRED: { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', label: 'Hết hạn sử dụng' },
  RECALLED: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Đã thu hồi' },
  BLOCKED: { bg: 'bg-slate-100 text-slate-600 border-slate-300', dot: 'bg-slate-400', label: 'Bị khóa' },
  DRAFT: { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-400', label: 'Nháp' },
  SOLD: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'Đã bán' },
  CREATED: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500', label: 'Mới tạo' },
  IN_STOCK: { bg: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', label: 'Trong kho' },
  SHIPPED: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'Đã xuất kho' },
  IN_TRANSIT: { bg: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500', label: 'Đang vận chuyển' },
  DELIVERED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Đã giao hàng' },
  SOLD_OUT: { bg: 'bg-neutral-50 text-neutral-700 border-neutral-200', dot: 'bg-neutral-500', label: 'Hết hàng' },
  CLOSED: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'Đã đóng' },
};

function renderStatusBadge(status: string) {
  const c = STATUS_CONFIG[status.toUpperCase()] ?? {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
    label: status
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export default function BatchTracePage() {
  const { batchId } = useParams<{ batchId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const batchCode = searchParams.get('code');
  const initialItemCode = searchParams.get('itemCode') || '';

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'BATCH' | 'PRODUCT'>(initialItemCode ? 'PRODUCT' : 'BATCH');
  const [selectedItemCode, setSelectedItemCode] = useState<string | null>(initialItemCode || null);

  const [productsPage, setProductsPage] = useState(1);
  const [productsKeyword, setProductsKeyword] = useState('');
  const [productsStatus, setProductsStatus] = useState('');

  const { detail } = useBatchDetail(batchCode);
  const { events, isLoading: isLoadingEvents, error: eventsError, refetch: refetchEvents } = useBatchEvents(batchId);
  
  const { items: batchProducts, pagination: productsPagination, isLoading: isLoadingProducts, error: productsError, refetch: refetchProducts } = useBatchProducts(batchId, {
    page: productsPage,
    limit: 10,
    keyword: productsKeyword || undefined,
    status: productsStatus || undefined,
  });

  const { result: traceResult, isLoading: isLoadingTrace, error: traceError, search: searchTrace } = useTraceSearch();

  useEffect(() => {
    if (selectedItemCode) {
      searchTrace({ code: selectedItemCode });
    }
  }, [selectedItemCode, searchTrace]);

  const handleBack = () => {
    navigate('/batches');
  };

  const handleTraceClick = (itemCode: string) => {
    setSelectedItemCode(itemCode);
    setSearchParams({ code: batchCode || '', itemCode });
  };

  const handleBackToProducts = () => {
    setSelectedItemCode(null);
    setSearchParams({ code: batchCode || '' });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold w-fit transition-colors bg-transparent border-none cursor-pointer"
      >
        <ArrowLeft size={14} /> Quay lại danh sách lô hàng
      </button>

      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Truy xuất nguồn gốc
              </h1>
              {batchCode && (
                <span className="font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-xs">
                  Batch: {batchCode}
                </span>
              )}
              {detail && renderStatusBadge(detail.status)}
            </div>
            {detail && (
              <p className="text-xs text-slate-500">
                Sản phẩm: <span className="font-semibold text-slate-700">{detail.product.product_name}</span>
                {' '}— Biến thể: <span className="font-semibold text-slate-700">{detail.variant.name} ({detail.variant.sku})</span>
              </p>
            )}
          </div>
        </div>

        {detail && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Xuất xứ:</span>
              <span className="font-semibold text-slate-700">{detail.origin_country || 'Không có'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Số lượng:</span>
              <span className="font-semibold text-slate-700">{detail.quantity.toLocaleString()} sản phẩm</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Ngày sản xuất:</span>
              <span className="font-semibold text-slate-700">{formatDate(detail.manufacture_date)}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Hạn sử dụng:</span>
              <span className="font-semibold text-slate-700">{formatDate(detail.expiry_date)}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Ngày nhập kho:</span>
              <span className="font-semibold text-slate-700">{formatDate(detail.imported_at)}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Nhà sản xuất:</span>
              <span className="font-semibold text-slate-700">{detail.manufacturer_name || 'Không có'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Nhà cung cấp:</span>
              <span className="font-semibold text-slate-700">{detail.supplier_name || 'Không có'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Địa chỉ SX:</span>
              <span className="font-semibold text-slate-700">{detail.production_place || 'Không có'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id);
              if (t.id === 'PRODUCT' && initialItemCode) {
                setSelectedItemCode(initialItemCode);
              }
            }}
            className={`pb-3 text-sm font-semibold transition-all bg-transparent border-none cursor-pointer relative ${
              activeTab === t.id ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.label}
            {activeTab === t.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="mt-4">
        {activeTab === 'BATCH' && (
          <div className="space-y-6">
            {isLoadingEvents ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
              </div>
            ) : eventsError ? (
              <Card className="flex flex-col items-center justify-center py-12 text-center border-slate-200">
                <AlertCircle size={24} className="text-rose-500 mb-2" />
                <p className="text-sm font-semibold text-slate-800">{eventsError}</p>
                <Button onClick={refetchEvents} className="mt-4 text-xs">Thử lại</Button>
              </Card>
            ) : events.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
                <Inbox size={40} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-500">Chưa có sự kiện nào được ghi nhận cho lô hàng này.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-200 pl-6 ml-4 space-y-6">
                {events.map((event, index) => {
                  const nameUpper = event.event_name.toUpperCase();
                  const colorClass = EVENT_TYPE_COLORS[nameUpper] ?? EVENT_TYPE_COLORS.DEFAULT;
                  const Icon = EVENT_TYPE_ICONS[nameUpper] ?? EVENT_TYPE_ICONS.DEFAULT;
                  return (
                    <div key={index} className="relative group">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${colorClass} shadow-xs z-10 transition-transform group-hover:scale-110`}>
                        <Icon size={12} />
                      </div>

                      {/* Event Card */}
                      <div className="bg-white p-4 rounded-xl border border-slate-100 hover:border-slate-200 shadow-xs hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-slate-900">{event.event_name}</h4>
                          <span className="text-[10px] text-slate-400 font-semibold">{formatDateTime(event.created_at)}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{event.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'PRODUCT' && (
          <div className="space-y-6">
            {selectedItemCode ? (
              // Specific Product Item Timeline view
              <div className="space-y-6">
                <button
                  onClick={handleBackToProducts}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold w-fit transition-colors bg-transparent border-none cursor-pointer"
                >
                  &larr; Quay lại danh sách sản phẩm
                </button>

                {isLoadingTrace ? (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
                  </div>
                ) : traceError ? (
                  <Card className="flex flex-col items-center justify-center py-12 text-center border-slate-200">
                    <AlertCircle size={24} className="text-rose-500 mb-2" />
                    <p className="text-sm font-semibold text-slate-800">{traceError}</p>
                  </Card>
                ) : traceResult ? (
                  <div className="space-y-6">
                    {/* Warning message from BE if search matches partially */}
                    {traceResult.warning && (
                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex gap-2 items-start">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <p>{traceResult.warning}</p>
                      </div>
                    )}

                    {/* Product Detail Card */}
                    {traceResult.productItem && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase">Thông tin sản phẩm</p>
                          <h4 className="text-sm font-bold text-slate-900 mt-0.5">{traceResult.productItem.productName}</h4>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">
                            Mã: {traceResult.productItem.itemCode} | S/N: {traceResult.productItem.serialNumber}
                          </p>
                        </div>
                        <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                          Trạng thái: <span className="text-blue-600 font-bold">{traceResult.productItem.status}</span>
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    {(!traceResult.timeline || traceResult.timeline.length === 0) ? (
                      <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
                        <Inbox size={40} className="mx-auto mb-2 text-slate-300" />
                        <p className="text-sm text-slate-500">Chưa ghi nhận sự kiện vòng đời nào.</p>
                      </div>
                    ) : (
                      <div className="relative border-l-2 border-slate-200 pl-6 ml-4 space-y-6">
                        {traceResult.timeline.map((event, index) => {
                          const typeUpper = event.eventType.toUpperCase();
                          const colorClass = EVENT_TYPE_COLORS[typeUpper] ?? EVENT_TYPE_COLORS.DEFAULT;
                          const Icon = EVENT_TYPE_ICONS[typeUpper] ?? EVENT_TYPE_ICONS.DEFAULT;
                          return (
                            <div key={event.eventId} className="relative group">
                              {/* Timeline dot */}
                              <div className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${colorClass} shadow-xs z-10 transition-transform group-hover:scale-110`}>
                                <Icon size={12} />
                              </div>

                              {/* Event Card */}
                              <div className="bg-white p-4 rounded-xl border border-slate-100 hover:border-slate-200 shadow-xs hover:shadow-md transition-all">
                                <div className="flex justify-between items-start">
                                  <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                                  <span className="text-[10px] text-slate-400 font-semibold">{formatDateTime(event.timestamp)}</span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1">{event.description}</p>
                                {event.location && (
                                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-2 bg-slate-50 px-2 py-1 rounded w-fit">
                                    <MapPin size={11} /> {event.location}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
                    <Inbox size={40} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm text-slate-500">Không tìm thấy dữ liệu truy vết sản phẩm.</p>
                  </div>
                )}
              </div>
            ) : (
              // Products List view inside tab
              <div className="space-y-6">
                {/* Search & Filter */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-70">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        value={productsKeyword}
                        onChange={e => { setProductsKeyword(e.target.value); setProductsPage(1); }}
                        placeholder="Tìm theo mã sản phẩm hoặc số serial..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Trạng thái:</span>
                      <select
                        value={productsStatus}
                        onChange={e => { setProductsStatus(e.target.value); setProductsPage(1); }}
                        className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 cursor-pointer"
                      >
                        <option value="">Tất cả</option>
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="SOLD">Đã bán</option>
                        <option value="EXPIRED">Hết hạn</option>
                        <option value="RECALLED">Thu hồi</option>
                        <option value="BLOCKED">Bị khóa</option>
                      </select>
                    </div>
                  </div>
                  <Button
                    onClick={refetchProducts}
                    className="rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
                  >
                    <RefreshCw size={16} className={isLoadingProducts ? 'animate-spin' : ''} />
                  </Button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  {isLoadingProducts ? (
                    <div className="space-y-4 p-6 animate-pulse">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-12 bg-slate-100 rounded-lg" />
                      ))}
                    </div>
                  ) : productsError ? (
                    <div className="p-6 text-center">
                      <p className="text-sm font-semibold text-rose-500">{productsError}</p>
                    </div>
                  ) : batchProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white">
                      <Package size={48} className="text-slate-300 mb-4" />
                      <h3 className="text-lg font-bold text-slate-900">Không tìm thấy sản phẩm</h3>
                      <p className="text-slate-500 text-sm max-w-sm mt-1">
                        Không có sản phẩm nào khớp với điều kiện tìm kiếm.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm table-fixed border-collapse">
                        <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/75 border-b border-slate-200">
                          <tr>
                            <th className="p-3.5 pl-5 font-bold tracking-wider w-[25%]">Mã Sản Phẩm</th>
                            <th className="p-3.5 font-bold tracking-wider w-[25%]">Số Serial (S/N)</th>
                            <th className="p-3.5 font-bold tracking-wider w-[20%]">Vị trí hiện tại</th>
                            <th className="p-3.5 font-bold tracking-wider w-[15%] text-center">Trạng thái</th>
                            <th className="p-3.5 font-bold tracking-wider w-[15%] text-center">Ngày tạo</th>
                            <th className="p-3.5 pr-5 font-bold tracking-wider w-[12%] text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {batchProducts.map(item => (
                            <tr key={item.itemId} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-3.5 pl-5 font-mono font-bold text-slate-800 truncate">
                                {item.itemCode}
                              </td>
                              <td className="p-3.5 font-mono text-slate-600 truncate">
                                {item.serialNumber}
                              </td>
                              <td className="p-3.5 text-slate-600 truncate">
                                {item.currentLocation ? (
                                  <span className="flex items-center gap-1">
                                    <MapPin size={13} className="text-slate-400 shrink-0" />
                                    {item.currentLocation.name}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-normal italic">Chưa xác định</span>
                                )}
                              </td>
                              <td className="p-3.5 text-center">
                                {renderStatusBadge(item.status)}
                              </td>
                              <td className="p-3.5 text-center text-slate-500 text-xs">
                                {formatDateTime(item.createdAt)}
                              </td>
                              <td className="p-3.5 pr-5 text-right">
                                <button
                                  onClick={() => handleTraceClick(item.itemCode)}
                                  className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg cursor-pointer border-none bg-transparent"
                                  title="Xem truy vết nguồn gốc sản phẩm"
                                >
                                  <Activity size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination */}
                  {productsPagination && productsPagination.totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <span className="text-xs text-slate-500">
                        Hiển thị {batchProducts.length} / {productsPagination.totalRecords.toLocaleString()} sản phẩm
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setProductsPage(p => Math.max(1, p - 1))}
                          disabled={productsPage <= 1}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 cursor-pointer bg-white"
                        >
                          <ChevronLeft size={15} />
                        </button>
                        <span className="text-xs font-semibold text-slate-700">
                          {productsPage} / {productsPagination.totalPages}
                        </span>
                        <button
                          onClick={() => setProductsPage(p => Math.min(productsPagination.totalPages, p + 1))}
                          disabled={productsPage >= productsPagination.totalPages}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 cursor-pointer bg-white"
                        >
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
