import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, Activity, HelpCircle, AlertCircle,
  Inbox, FileText, CheckCircle2, ShoppingBag, Truck, Trash2, ShieldCheck, Tag
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
  EXPORTED: 'bg-purple-50 text-purple-600 border-purple-200',
  SOLD: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  RECALLED: 'bg-rose-50 text-rose-600 border-rose-200',
  WARRANTY: 'bg-amber-50 text-amber-600 border-amber-200',
  TRANSFER: 'bg-teal-50 text-teal-600 border-teal-200',
  DEFAULT: 'bg-slate-50 text-slate-600 border-slate-200'
};

export default function BatchTracePage() {
  const { batchId } = useParams<{ batchId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const batchCode = searchParams.get('code');
  const initialItemCode = searchParams.get('itemCode') || '';

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'BATCH' | 'PRODUCT'>(initialItemCode ? 'PRODUCT' : 'BATCH');

  const { detail } = useBatchDetail(batchCode);
  const { events, isLoading: isLoadingEvents, error: eventsError, refetch: refetchEvents } = useBatchEvents(batchId);
  const { items: batchProducts } = useBatchProducts(batchId, { page: 1, limit: 1 });
  const { result: traceResult, isLoading: isLoadingTrace, error: traceError, search: searchTrace } = useTraceSearch();

  useEffect(() => {
    if (initialItemCode) {
      searchTrace({ code: initialItemCode });
      setActiveTab('PRODUCT');
    } else if (batchProducts && batchProducts.length > 0) {
      const defaultCode = batchProducts[0].itemCode;
      searchTrace({ code: defaultCode });
    }
  }, [initialItemCode, batchProducts, searchTrace]);

  const handleBack = () => {
    navigate('/batches');
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
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Truy xuất nguồn gốc
            </h1>
            {batchCode && (
              <span className="font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-xs">
                Batch: {batchCode}
              </span>
            )}
          </div>
          {detail && (
            <p className="text-xs text-slate-500">
              Sản phẩm: <span className="font-semibold text-slate-700">{detail.product.product_name}</span>
              {' '}— Biến thể: <span className="font-semibold text-slate-700">{detail.variant.name} ({detail.variant.sku})</span>
            </p>
          )}
        </div>

        {detail && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0">
            <div>
              <span className="text-slate-400">Xuất xứ:</span>{' '}
              <span className="font-semibold text-slate-700">{detail.origin_country || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400">Số lượng:</span>{' '}
              <span className="font-semibold text-slate-700">{detail.quantity.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400">NSX:</span>{' '}
              <span className="font-semibold text-slate-700">{formatDateTime(detail.manufacture_date).split(' ')[0] || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400">HSD:</span>{' '}
              <span className="font-semibold text-slate-700">{formatDateTime(detail.expiry_date).split(' ')[0] || '—'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
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
            {/* Trace Result */}
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
                <p className="text-sm text-slate-500">Không tìm thấy sản phẩm trong lô hàng này để truy vết.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
