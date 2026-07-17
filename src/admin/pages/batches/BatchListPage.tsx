import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Eye, Edit3, X, AlertCircle,
  Calendar, MapPin, Truck, HelpCircle, Inbox, Layers,
  ArrowUpRight, Activity, Trash2, ChevronLeft, ChevronRight,
  Clock, Package, CheckSquare
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

// ─── API & Hooks ─────────────────────────────────────────────────────────────
import { useBatchList } from '../../../features/batch/hooks/useBatchList';
import { useBatchDetail } from '../../../features/batch/hooks/useBatchDetail';
import { useBatchHistory } from '../../../features/batch/hooks/useBatchHistory';
import { useBatchProducts } from '../../../features/batch/hooks/useBatchProducts';
import { useBatchEvents } from '../../../features/batch/hooks/useBatchEvents';
import { useExportBatches } from '../../../features/batch/hooks/useExportBatches';
import { useLocations } from '../../../features/location/hooks/useLocations';
import { batchApi } from '../../../features/batch/api/batch.api';
import { BatchListItem, BatchStatus, ExportBatchRequest } from '../../../features/batch/api/batch.types';
import { useTraceSearch } from '../../../features/trace/hooks/useTraceSearch';
import { productApi } from '../../../features/products/api/product.api';
import type { AdminProduct, AdminProductDetailVariant } from '../../../shared/types/domain';
import { useAuthStore } from '../../../features/auth/store/auth.store';
import { parseApiError } from '../../../api/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

type DrawerMode = 'CREATE' | 'VIEW' | 'EDIT_STATUS' | 'TRACE' | 'PRODUCTS' | 'HISTORY';

interface CreateFormData {
  variant_id: string;
  prefix: string;
  quantity: number;
  manufacture_date: string;
  expiry_date: string;
  imported_at: string;
  manufacturer_name: string;
  supplier_name: string;
  origin_country: string;
  production_place: string;
}

/** Form data cho modal xuất kho mới — không còn quantity và operator_name */
interface ExportBulkFormData {
  destination_location_id: string;
  note: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { bg: string; dot: string; label: string }> = {
  ACTIVE: { bg: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', label: 'Đang hoạt động' },
  EXPIRED: { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', label: 'Hết hạn sử dụng' },
  RECALLED: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Đã thu hồi' },
  BLOCKED: { bg: 'bg-slate-100 text-slate-600 border-slate-300', dot: 'bg-slate-400', label: 'Bị khóa' },
  DRAFT: { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-400', label: 'Nháp' },
};
function renderStatusBadge(status: string | undefined | null) {
  if (!status) return null;
  const c = STATUS_CONFIG[status.toUpperCase()] ?? {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
    label: status,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}


function formatDate(val: string | null | undefined): string {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleDateString('vi-VN');
  } catch {
    return val;
  }
}

function formatDateTime(val: string | null | undefined): string {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleString('vi-VN');
  } catch {
    return val;
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 h-24" />
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-100 h-96 animate-pulse" />
    </div>
  );
}

// ─── DrawerDetailPanel ───────────────────────────────────────────────────────

function DrawerDetailPanel({ batchCode }: { batchCode: string }) {
  const { detail, isLoading, error } = useBatchDetail(batchCode);

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 bg-slate-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-red-700 text-sm flex items-center gap-2">
        <AlertCircle size={16} /> {error}
      </div>
    );
  }

  if (!detail) return null;

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: 'Mã lô hàng', value: <span className="font-mono font-bold">{detail.batch_code}</span> },
    { label: 'Sản phẩm', value: detail.product.product_name },
    { label: 'Biến thể', value: `${detail.variant.name} (${detail.variant.sku})` },
    { label: 'Số lượng', value: detail.quantity.toLocaleString() + ' sản phẩm' },
    { label: 'Trạng thái', value: renderStatusBadge(detail.status) },
    { label: 'Ngày sản xuất', value: formatDate(detail.manufacture_date) },
    { label: 'Hạn sử dụng', value: formatDate(detail.expiry_date) },
    { label: 'Ngày nhập kho', value: formatDateTime(detail.imported_at) },
    { label: 'Nhà sản xuất', value: detail.manufacturer_name ?? '—' },
    { label: 'Nhà cung cấp', value: detail.supplier_name ?? '—' },
    { label: 'Xuất xứ', value: detail.origin_country ?? '—' },
    { label: 'Địa chỉ SX', value: detail.production_place ?? '—' },
    { label: 'Tạo lúc', value: formatDateTime(detail.created_at) },
    { label: 'Cập nhật', value: formatDateTime(detail.updated_at) },
  ];

  return (
    <div className="space-y-2.5">
      {fields.map(f => (
        <div key={f.label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
          <span className="text-xs text-slate-500 font-semibold">{f.label}</span>
          <span className="text-xs text-slate-800 font-medium text-right max-w-[60%]">{f.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── DrawerHistoryPanel ───────────────────────────────────────────────────────

function DrawerHistoryPanel({ batchId }: { batchId: string }) {
  const { history, isLoading, error } = useBatchHistory(batchId);

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-red-700 text-sm flex items-center gap-2">
        <AlertCircle size={16} /> {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <Clock size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">Chưa có lịch sử thay đổi</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map(h => (
        <div key={h.logId} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-800">{h.action}</span>
            <span className="text-[10px] text-slate-400">{formatDateTime(h.createdAt)}</span>
          </div>
          {h.performedBy && (
            <p className="text-[11px] text-slate-500">
              Bởi: <strong>{h.performedBy.fullName}</strong> ({h.performedBy.role})
            </p>
          )}
          {Object.keys(h.changedFields ?? {}).length > 0 && (
            <div className="mt-2 space-y-1">
              {Object.entries(h.changedFields).map(([field, diff]) => (
                <div key={field} className="text-[10px] text-slate-500 flex items-center gap-2">
                  <span className="font-semibold text-slate-700">{field}:</span>
                  <span className="line-through text-red-400">{String(diff.old ?? '—')}</span>
                  <span>→</span>
                  <span className="text-green-600 font-semibold">{String(diff.new ?? '—')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── DrawerProductsPanel ──────────────────────────────────────────────────────

function DrawerProductsPanel({ batchId, batchCode }: { batchId: string; batchCode: string }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { items, pagination, isLoading, error } = useBatchProducts(batchId, { page, limit: 10 });

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-lg" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-red-700 text-sm flex items-center gap-2">
        <AlertCircle size={16} /> {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <Package size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">Chưa có sản phẩm nào trong lô</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={() => navigate(`/batches/${batchId}/products?code=${batchCode}`)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-transparent border-none cursor-pointer"
        >
          Xem dạng toàn trang →
        </button>
      </div>

      {items.map(item => (
        <div key={item.itemId} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-slate-800 font-mono">{item.itemCode}</p>
            <p className="text-[11px] text-slate-500">SN: {item.serialNumber}</p>
            {item.currentLocation && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin size={10} /> {item.currentLocation.name}
              </p>
            )}
          </div>
          {renderStatusBadge(item.status)}
        </div>
      ))}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer border-none bg-transparent"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-slate-500">
            {page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer border-none bg-transparent"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function DrawerTracePanel({ batch }: { batch: BatchListItem }) {
  const navigate = useNavigate();
  const { events, isLoading, error } = useBatchEvents(batch.id);

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-red-700 text-sm flex items-center gap-2">
        <AlertCircle size={16} /> {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => navigate(`/batches/${batch.id}/trace?code=${batch.batch_code}`)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-transparent border-none cursor-pointer"
        >
          Xem dạng toàn trang →
        </button>
      </div>

      {events.length > 0 ? (
        <div className="border-l-2 border-slate-200 pl-4 space-y-4">
          {events.map((event, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
              <p className="text-sm font-semibold text-slate-900">{event.event_name}</p>
              <p className="text-xs text-slate-500">{event.detail}</p>
              <p className="text-[10px] text-slate-400 mt-1">{formatDateTime(event.created_at)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">
          <Activity size={28} className="mx-auto mb-2 opacity-40" />
          <p className="text-xs">Không có sự kiện nào</p>
        </div>
      )}
    </div>
  );
}

// ─── ExportBatchesModal ───────────────────────────────────────────────────────

interface ExportBatchesModalProps {
  selectedBatches: BatchListItem[];
  onClose: () => void;
  onSuccess: () => void;
}

function ExportBatchesModal({ selectedBatches, onClose, onSuccess }: ExportBatchesModalProps) {
  const { locations, isLoading: isLoadingLocations } = useLocations();
  const { exportBatches, isExporting, exportError, reset } = useExportBatches();

  const [form, setForm] = useState<ExportBulkFormData>({
    destination_location_id: '',
    note: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.destination_location_id) {
      setFormError('Vui lòng chọn địa điểm xuất');
      return;
    }

    const result = await exportBatches({
      batch_ids: selectedBatches.map(b => b.id),
      destination_location_id: form.destination_location_id,
      note: form.note,
    });

    if (result) {
      onSuccess();
      onClose();
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const errorMsg = formError ?? exportError;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={handleClose} />
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl z-10 overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare size={18} className="text-blue-600" />
                Xuất lô hàng
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Đang xuất <span className="font-bold text-blue-600">{selectedBatches.length}</span> lô hàng
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg border-none bg-transparent cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <form id="export-batches-form" onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 border border-red-100">
                <AlertCircle size={15} className="shrink-0" /> {errorMsg}
              </div>
            )}

            {/* Danh sách lô đã chọn */}
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Lô hàng sẽ được xuất:</p>
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 space-y-1.5 max-h-36 overflow-y-auto">
                {selectedBatches.map(b => (
                  <div key={b.id} className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-slate-800">{b.batch_code}</span>
                    {renderStatusBadge(b.status)}
                  </div>
                ))}
              </div>
            </div>

            {/* Destination Location Dropdown */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Địa điểm xuất đến <span className="text-red-500">*</span>
              </label>
              {isLoadingLocations ? (
                <div className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-400 bg-slate-50">
                  Đang tải danh sách địa điểm...
                </div>
              ) : locations.length === 0 ? (
                <div className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm text-red-500 bg-red-50">
                  Không có địa điểm nào khả dụng
                </div>
              ) : (
                <select
                  value={form.destination_location_id}
                  onChange={e => setForm({ ...form, destination_location_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm cursor-pointer focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 transition-all"
                >
                  <option value="">-- Chọn địa điểm --</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                      {loc.city ? ` — ${loc.city}` : ''}
                      {loc.type ? ` (${loc.type})` : ''}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-[10px] text-slate-400 mt-1">
                Chỉ các địa điểm đang hoạt động được hiển thị
              </p>
            </div>

            {/* Note */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Ghi chú <span className="text-slate-400 font-normal">(tùy chọn)</span>
              </label>
              <textarea
                value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 transition-all"
                placeholder="Mục đích xuất lô hàng, ghi chú cho kho..."
              />
            </div>

            {/* Info note */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
              <strong>Lưu ý:</strong> Thao tác này sẽ xuất <strong>toàn bộ sản phẩm</strong> trong các lô đã chọn.
              Nếu một lô có lỗi, toàn bộ giao dịch sẽ bị hủy.
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="rounded-xl px-4 text-xs font-semibold cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="export-batches-form"
              disabled={isExporting || !form.destination_location_id}
              className="rounded-xl px-4 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              {isExporting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xuất...
                </>
              ) : (
                <>
                  <ArrowUpRight size={14} />
                  Xuất {selectedBatches.length} lô hàng
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BatchListPage({ onNavigate }: { onNavigate: (tabId: string) => void }) {
  const { role } = useAuthStore();
  const navigate = useNavigate();

  // ── Filter & Pagination state ────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOrigin, setFilterOrigin] = useState('');
  const [activeKpiFilter, setActiveKpiFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'RECALLED_BLOCKED'>('ALL');
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Checkbox Selection state ─────────────────────────────────────────────
  const [selectedBatchIds, setSelectedBatchIds] = useState<Set<string>>(new Set());
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // ── Fetch dữ liệu từ API ─────────────────────────────────────────────────
  const statusParam = (() => {
    if (filterStatus && filterStatus !== 'ALL') return filterStatus;
    if (activeKpiFilter === 'ACTIVE') return 'ACTIVE';
    if (activeKpiFilter === 'EXPIRED') return 'EXPIRED';
    if (activeKpiFilter === 'RECALLED_BLOCKED') return 'RECALLED,BLOCKED';
    return undefined;
  })();

  const { items, meta, stats, isLoading, error, refetch } = useBatchList({
    page,
    limit: 10,
    search: searchTerm || undefined,
    status: statusParam,
    origin_country: filterOrigin && filterOrigin !== 'ALL' ? filterOrigin : undefined,
  });

  // ── Drawer state ─────────────────────────────────────────────────────────
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('CREATE');
  const [selectedBatch, setSelectedBatch] = useState<BatchListItem | null>(null);

  // ── Product & Variant selection state for Create Form ─────────────────────
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [variants, setVariants] = useState<AdminProductDetailVariant[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);

  // ── Form state ───────────────────────────────────────────────────────────
  const [createForm, setCreateForm] = useState<CreateFormData>({
    variant_id: '',
    prefix: '',
    quantity: 100,
    manufacture_date: '',
    expiry_date: '',
    imported_at: '',
    manufacturer_name: '',
    supplier_name: '',
    origin_country: '',
    production_place: '',
  });

  const [newStatus, setNewStatus] = useState<BatchStatus>('ACTIVE');
  const [exportForm, setExportForm] = useState<ExportBatchRequest>({
    destination_location: '',
    quantity: 1,
    operator_name: '',
    notes: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Reset selection khi data thay đổi ───────────────────────────────────
  useEffect(() => {
    setSelectedBatchIds(new Set());
  }, [page, searchTerm, filterStatus, filterOrigin, activeKpiFilter]);

  // ── Product & Variant Fetching ───────────────────────────────────────────
  useEffect(() => {
    if (!selectedProductId) {
      setVariants([]);
      setCreateForm(prev => ({ ...prev, variant_id: '' }));
      return;
    }
    setIsLoadingVariants(true);
    productApi.getById(selectedProductId).then(res => {
      setVariants(res.data.data.variants || []);
      setCreateForm(prev => ({ ...prev, variant_id: '' }));
    }).catch(err => {
      console.error('Lỗi tải biến thể', err);
      setVariants([]);
    }).finally(() => {
      setIsLoadingVariants(false);
    });
  }, [selectedProductId]);

  // ── Search debounce ──────────────────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearchTerm(value);
      setPage(1);
    }, 400);
  };

  // ── Computed stats ───────────────────────────────────────────────────────
  const displayStats = stats ?? { total: 0, active: 0, expired: 0, recalled_blocked: 0 };

  // ── Checkbox Handlers ─────────────────────────────────────────────────────
  const isAllSelected = items.length > 0 && items.every(b => selectedBatchIds.has(b.id));
  const isIndeterminate = items.some(b => selectedBatchIds.has(b.id)) && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      const next = new Set(selectedBatchIds);
      items.forEach(b => next.delete(b.id));
      setSelectedBatchIds(next);
    } else {
      const next = new Set(selectedBatchIds);
      items.forEach(b => next.add(b.id));
      setSelectedBatchIds(next);
    }
  };

  const handleSelectRow = (batchId: string) => {
    const next = new Set(selectedBatchIds);
    if (next.has(batchId)) {
      next.delete(batchId);
    } else {
      next.add(batchId);
    }
    setSelectedBatchIds(next);
  };

  /** Các batch đang được chọn (lấy từ items hiện tại + giữ lại ID đã chọn từ trang khác) */
  const selectedBatchObjects = items.filter(b => selectedBatchIds.has(b.id));

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleKpiClick = (id: typeof activeKpiFilter) => {
    setActiveKpiFilter(prev => prev === id ? 'ALL' : id);
    setPage(1);
    setFilterStatus('');
  };

  const openCreate = () => {
    setCreateForm({
      variant_id: '',
      prefix: '',
      quantity: 100,
      manufacture_date: new Date().toISOString().substring(0, 10),
      expiry_date: '',
      imported_at: new Date().toISOString().substring(0, 10),
      manufacturer_name: '',
      supplier_name: '',
      origin_country: '',
      production_place: '',
    });
    setFormError(null);
    setSelectedProductId('');
    setVariants([]);

    if (products.length === 0) {
      setIsLoadingProducts(true);
      productApi.getAll({ limit: 100 }).then(res => {
        setProducts(res.data.data.items || []);
      }).catch(err => {
        console.error('Lỗi tải sản phẩm', err);
      }).finally(() => {
        setIsLoadingProducts(false);
      });
    }

    setDrawerMode('CREATE');
    setIsDrawerOpen(true);
  };

  const openView = (batch: BatchListItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedBatch(batch);
    setDrawerMode('VIEW');
    setIsDrawerOpen(true);
  };

  const openEditStatus = (batch: BatchListItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedBatch(batch);
    setNewStatus(batch.status as BatchStatus);
    setFormError(null);
    setDrawerMode('EDIT_STATUS');
    setIsDrawerOpen(true);
  };

  const openTrace = (batch: BatchListItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedBatch(batch);
    setDrawerMode('TRACE');
    setIsDrawerOpen(true);
  };

  const openProducts = (batch: BatchListItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedBatch(batch);
    setDrawerMode('PRODUCTS');
    setIsDrawerOpen(true);
  };

  const openHistory = (batch: BatchListItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedBatch(batch);
    setDrawerMode('HISTORY');
    setIsDrawerOpen(true);
  };

  // ── Submit Create ─────────────────────────────────────────────────────────

  const handleSubmitCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!createForm.variant_id.trim()) {
      setFormError('Variant ID là bắt buộc');
      return;
    }
    if (!createForm.prefix.trim()) {
      setFormError('Prefix là bắt buộc (ví dụ: APL, KG)');
      return;
    }
    if (createForm.quantity < 1) {
      setFormError('Số lượng phải lớn hơn 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await batchApi.create({
        variant_id: createForm.variant_id.trim(),
        prefix: createForm.prefix.trim().toUpperCase(),
        quantity: createForm.quantity,
        manufacture_date: createForm.manufacture_date ? `${createForm.manufacture_date}T00:00:00Z` : null,
        expiry_date: createForm.expiry_date ? `${createForm.expiry_date}T00:00:00Z` : null,
        imported_at: createForm.imported_at ? `${createForm.imported_at}T00:00:00Z` : null,
        manufacturer_name: createForm.manufacturer_name || null,
        supplier_name: createForm.supplier_name || null,
        origin_country: createForm.origin_country || null,
        production_place: createForm.production_place || null,
      });
      setIsDrawerOpen(false);
      refetch();
    } catch (err: unknown) {
      setFormError(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  }, [createForm, refetch]);

  // ── Submit Update Status ──────────────────────────────────────────────────

  const handleSubmitStatus = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      await batchApi.updateStatus(selectedBatch.id, newStatus);
      setIsDrawerOpen(false);
      refetch();
    } catch (err: unknown) {
      setFormError(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedBatch, newStatus, refetch]);

  // ── Submit Export ─────────────────────────────────────────────────────────

  const handleSubmitExport = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    setFormError(null);

    if (!exportForm.destination_location.trim()) {
      setFormError('Địa điểm xuất đến là bắt buộc');
      return;
    }
    if (exportForm.quantity < 1) {
      setFormError('Số lượng xuất phải lớn hơn 0');
      return;
    }
    if (!exportForm.operator_name.trim()) {
      setFormError('Tên người thực hiện là bắt buộc');
      return;
    }

    setIsSubmitting(true);
    try {
      await batchApi.export(selectedBatch.id, {
        destination_location: exportForm.destination_location.trim(),
        quantity: exportForm.quantity,
        operator_name: exportForm.operator_name.trim(),
        notes: exportForm.notes,
      });
      setIsDrawerOpen(false);
      refetch();
    } catch (err: unknown) {
      setFormError(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedBatch, exportForm, refetch]);

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = useCallback(async (batch: BatchListItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm(`Bạn có chắc muốn xóa lô hàng "${batch.batch_code}"?`)) return;
    try {
      await batchApi.delete(batch.id);
      refetch();
    } catch (err: unknown) {
      alert(parseApiError(err));
    }
  }, [refetch]);

  // ── Clear filters ────────────────────────────────────────────────────────

  const clearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setFilterStatus('');
    setFilterOrigin('');
    setActiveKpiFilter('ALL');
    setPage(1);
  };

  const hasFilters = searchTerm || filterStatus || filterOrigin || activeKpiFilter !== 'ALL';

  // ─── Drawer title ───────────────────────────────────────────────────────
  const drawerTitle: Record<DrawerMode, string> = {
    CREATE: 'Nhập lô hàng mới',
    VIEW: 'Chi tiết lô hàng',
    EDIT_STATUS: 'Cập nhật trạng thái',
    TRACE: 'Truy xuất nguồn gốc',
    PRODUCTS: 'Danh sách sản phẩm',
    HISTORY: 'Lịch sử thay đổi',
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Batch Management
            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-semibold uppercase">
              Admin / Staff / Dealer
            </span>
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý lô hàng nhập kho, xuất xứ nguồn gốc và số lượng sản phẩm.
          </p>
        </div>
        <div className="flex gap-3">
          {/* Nút Xuất lô hàng — chỉ hiển thị khi có ít nhất 1 batch được chọn */}
          {selectedBatchIds.size > 0 && (
            <Button
              onClick={() => setIsExportModalOpen(true)}
              className="rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-sm cursor-pointer transition-all"
            >
              <ArrowUpRight size={16} />
              Xuất lô hàng ({selectedBatchIds.size})
            </Button>
          )}
          <Button
            onClick={() => {
              setIsDrawerOpen(false);
              openCreate();
            }}
            className="rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
          >
            <Plus size={16} /> Nhập lô hàng
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && !isLoading && (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Không thể tải dữ liệu lô hàng</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">{parseApiError(error)}</p>
          <Button onClick={refetch} className="mt-6 rounded-xl px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
            Thử lại
          </Button>
        </Card>
      )}

      {/* Loading skeleton */}
      {isLoading && !error && <Skeleton />}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6">
            {[
              { id: 'ALL' as const, label: 'Tổng số lô hàng', value: displayStats.total, color: 'text-slate-900' },
              { id: 'ACTIVE' as const, label: 'Đang lưu hành', value: displayStats.active, color: 'text-green-600' },
              { id: 'EXPIRED' as const, label: 'Lô hết hạn', value: displayStats.expired, color: 'text-red-500' },
              { id: 'RECALLED_BLOCKED' as const, label: 'Đã thu hồi / Khóa', value: displayStats.recalled_blocked, color: 'text-amber-500' },
            ].map(card => (
              <div
                key={card.id}
                onClick={() => handleKpiClick(card.id)}
                className={`p-5 bg-white border rounded-xl shadow-xs cursor-pointer hover:border-slate-300 transition-all ${activeKpiFilter === card.id
                  ? 'border-blue-400 ring-2 ring-blue-50 bg-blue-50/10'
                  : 'border-slate-200'
                  }`}
              >
                <div className="flex justify-between items-center text-xs text-slate-500 font-semibold uppercase">
                  <span>{card.label}</span>
                  <HelpCircle size={14} className="text-slate-300" />
                </div>
                <div className={`text-3xl font-bold mt-2 ${card.color}`}>
                  {card.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-70">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => handleSearchChange(e.target.value)}
                  placeholder="Tìm lô hàng theo mã, sản phẩm, xuất xứ..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
                {searchInput && (
                  <button onClick={() => handleSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Trạng thái:</span>
                <select
                  value={filterStatus}
                  onChange={e => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                    setActiveKpiFilter('ALL');
                  }}
                  className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 cursor-pointer"
                >
                  <option value="">Tất cả</option>
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="EXPIRED">Hết hạn</option>
                  <option value="RECALLED">Thu hồi</option>
                  <option value="BLOCKED">Bị khóa</option>
                  <option value="DRAFT">Nháp</option>
                </select>
              </div>
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Selection info bar */}
          {selectedBatchIds.size > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <span className="text-sm text-purple-700 font-semibold">
                Đã chọn <strong>{selectedBatchIds.size}</strong> lô hàng
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 bg-transparent border-none cursor-pointer"
                >
                  <ArrowUpRight size={13} /> Xuất lô hàng
                </button>
                <button
                  onClick={() => setSelectedBatchIds(new Set())}
                  className="text-xs text-purple-400 hover:text-purple-600 bg-transparent border-none cursor-pointer"
                >
                  Bỏ chọn tất cả
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white">
                <Inbox size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Không tìm thấy lô hàng</h3>
                <p className="text-slate-500 text-sm max-w-sm mt-1">
                  {hasFilters
                    ? 'Vui lòng điều chỉnh bộ lọc hoặc xóa điều kiện tìm kiếm.'
                    : 'Hệ thống chưa có lô hàng nào. Bắt đầu bằng cách nhập lô hàng mới.'}
                </p>
                {!hasFilters && (
                  <Button onClick={openCreate} className="mt-6 bg-blue-600 text-white rounded-xl px-4 py-2 font-semibold hover:bg-blue-700 cursor-pointer">
                    Nhập lô hàng
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm table-fixed border-collapse">
                  <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/75 border-b border-slate-200">
                    <tr>
                      {/* Checkbox Select All */}
                      <th className="p-3.5 pl-4 w-10">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={el => {
                            if (el) el.indeterminate = isIndeterminate;
                          }}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer accent-blue-600"
                          title="Chọn tất cả"
                        />
                      </th>
                      <th className="p-3.5 font-bold tracking-wider w-[12%]">Mã Lô Hàng</th>
                      <th className="p-3.5 font-bold tracking-wider w-[22%]">Sản phẩm</th>
                      <th className="p-3.5 font-bold tracking-wider w-[8%] text-center">Số lượng</th>
                      <th className="p-3.5 font-bold tracking-wider w-[10%] text-center">NSX</th>
                      <th className="p-3.5 font-bold tracking-wider w-[10%] text-center">HSD</th>
                      <th className="p-3.5 font-bold tracking-wider w-[10%]">Xuất xứ</th>
                      <th className="p-3.5 font-bold tracking-wider w-[13%] text-center">Trạng thái</th>
                      <th className="p-3.5 pr-5 font-bold tracking-wider w-[13%] text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map(batch => (
                      <tr
                        key={batch.id}
                        className={`hover:bg-slate-50/50 cursor-pointer transition-colors group ${selectedBatchIds.has(batch.id) ? 'bg-purple-50/40' : ''}`}
                      >
                        {/* Checkbox */}
                        <td className="p-3.5 pl-4" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedBatchIds.has(batch.id)}
                            onChange={() => handleSelectRow(batch.id)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer accent-blue-600"
                          />
                        </td>
                        <td
                          className="p-3.5 font-mono font-bold text-slate-800 truncate"
                          onClick={() => openView(batch)}
                        >
                          {batch.batch_code}
                        </td>
                        <td
                          className="p-3.5 font-semibold text-slate-900 truncate"
                          onClick={() => openView(batch)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-slate-100 rounded text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 shrink-0">
                              <Layers size={14} />
                            </div>
                            <span className="truncate">{batch.variant_name}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-center font-semibold text-slate-700" onClick={() => openView(batch)}>
                          {batch.quantity.toLocaleString()}
                        </td>
                        <td className="p-3.5 text-center text-slate-500 text-xs" onClick={() => openView(batch)}>
                          {formatDate(batch.manufacture_date)}
                        </td>
                        <td className="p-3.5 text-center text-slate-500 text-xs" onClick={() => openView(batch)}>
                          {formatDate(batch.expiry_date)}
                        </td>
                        <td className="p-3.5 text-slate-600 truncate" onClick={() => openView(batch)}>
                          {batch.origin_country || '—'}
                        </td>
                        <td className="p-3.5 text-center" onClick={e => e.stopPropagation()}>
                          {renderStatusBadge(batch.status)}
                        </td>
                        <td className="p-3.5 pr-5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                navigate(`/batches/${batch.id}/trace?code=${batch.batch_code}`);
                              }}
                              className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg cursor-pointer border-none bg-transparent"
                              title="Truy xuất nguồn gốc"
                            >
                              <Activity size={15} />
                            </button>
                            <button
                              onClick={e => openEditStatus(batch, e)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer border-none bg-transparent"
                              title="Cập nhật trạng thái"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={e => openView(batch, e)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer border-none bg-transparent"
                              title="Xem chi tiết"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={e => handleDelete(batch, e)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer border-none bg-transparent"
                              title="Xóa lô hàng"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {meta && meta.total_pages > 1 && (
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs text-slate-500">
                  Hiển thị {items.length} / {meta.total_items.toLocaleString()} lô hàng
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 cursor-pointer bg-white"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <span className="text-xs font-semibold text-slate-700">
                    {page} / {meta.total_pages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(meta.total_pages, p + 1))}
                    disabled={page >= meta.total_pages}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 cursor-pointer bg-white"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── Export Batches Modal ─────────────────────────────────────────── */}
      {isExportModalOpen && (
        <ExportBatchesModal
          selectedBatches={selectedBatchObjects}
          onClose={() => setIsExportModalOpen(false)}
          onSuccess={() => {
            setSelectedBatchIds(new Set());
            refetch();
          }}
        />
      )}

      {/* ─── Drawer ──────────────────────────────────────────────────────────── */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative bg-white w-125 max-h-[90vh] rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden">

            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">{drawerTitle[drawerMode]}</h3>
                {selectedBatch && drawerMode !== 'CREATE' && (
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">{selectedBatch.batch_code}</p>
                )}
              </div>

              {/* Extra actions khi VIEW */}
              {drawerMode === 'VIEW' && selectedBatch && (
                <div className="flex gap-1 mr-2">
                  {(role === 'ADMIN' || role === 'STAFF') && (
                    <button
                      onClick={() => setDrawerMode('HISTORY')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer border-none bg-transparent flex items-center gap-1"
                    >
                      <Clock size={13} /> Lịch sử
                    </button>
                  )}
                  <button
                    onClick={() => setDrawerMode('PRODUCTS')}
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer border-none bg-transparent flex items-center gap-1"
                  >
                    <Package size={13} /> Sản phẩm
                  </button>
                </div>
              )}

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg border-none bg-transparent cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">

              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} /> {formError}
                </div>
              )}

              {/* ── VIEW: Chi tiết ─────────────────────────────────────────── */}
              {drawerMode === 'VIEW' && selectedBatch && (
                <DrawerDetailPanel batchCode={selectedBatch.batch_code} />
              )}

              {/* ── HISTORY: Lịch sử ──────────────────────────────────────── */}
              {drawerMode === 'HISTORY' && selectedBatch && (
                <DrawerHistoryPanel batchId={selectedBatch.id} />
              )}

              {/* ── PRODUCTS: Sản phẩm trong lô ──────────────────────────── */}
              {drawerMode === 'PRODUCTS' && selectedBatch && (
                <DrawerProductsPanel batchId={selectedBatch.id} batchCode={selectedBatch.batch_code} />
              )}

              {/* ── TRACE: Truy xuất ──────────────────────────────────────── */}
              {drawerMode === 'TRACE' && selectedBatch && (
                <DrawerTracePanel batch={selectedBatch} />
              )}

              {/* ── EDIT_STATUS: Cập nhật trạng thái ─────────────────────── */}
              {drawerMode === 'EDIT_STATUS' && (
                <form id="status-form" onSubmit={handleSubmitStatus} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Trạng thái mới *</label>
                    <select
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value as BatchStatus)}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm cursor-pointer"
                    >
                      <option value="ACTIVE">Đang hoạt động</option>
                      <option value="EXPIRED">Hết hạn</option>
                      <option value="RECALLED">Đã thu hồi</option>
                      <option value="BLOCKED">Bị khóa</option>
                      <option value="DRAFT">Nháp</option>
                    </select>
                  </div>
                </form>
              )}

              {/* ── CREATE: Nhập lô hàng mới ──────────────────────────────── */}
              {drawerMode === 'CREATE' && (
                <form id="create-form" onSubmit={handleSubmitCreate} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Sản phẩm *</label>
                      <select
                        value={selectedProductId}
                        onChange={e => setSelectedProductId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-blue-500 focus:outline-none"
                        disabled={isLoadingProducts}
                      >
                        <option value="">{isLoadingProducts ? 'Đang tải...' : '-- Chọn sản phẩm --'}</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Biến thể (SKU) *</label>
                      <select
                        value={createForm.variant_id}
                        onChange={e => setCreateForm({ ...createForm, variant_id: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-blue-500 focus:outline-none"
                        disabled={!selectedProductId || isLoadingVariants}
                      >
                        <option value="">{isLoadingVariants ? 'Đang tải...' : '-- Chọn biến thể --'}</option>
                        {variants.map(v => (
                          <option key={v.id} value={v.id}>{v.name} ({v.sku})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Prefix *</label>
                    <input
                      type="text"
                      value={createForm.prefix}
                      onChange={e => setCreateForm({ ...createForm, prefix: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono uppercase focus:border-blue-500 focus:outline-none"
                      placeholder="VD: APL, KG, JA (2-20 ký tự, chỉ chữ cái)"
                      maxLength={20}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Mã lô sẽ được tạo tự động: <strong>{createForm.prefix || 'PREFIX'}-2026-0001</strong>
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Số lượng nhập *</label>
                    <input
                      type="number"
                      value={createForm.quantity}
                      onChange={e => setCreateForm({ ...createForm, quantity: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      min={0}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                        <Calendar size={11} /> Ngày sản xuất
                      </label>
                      <input
                        type="date"
                        value={createForm.manufacture_date}
                        onChange={e => setCreateForm({ ...createForm, manufacture_date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                        <Calendar size={11} /> Hạn sử dụng
                      </label>
                      <input
                        type="date"
                        value={createForm.expiry_date}
                        onChange={e => setCreateForm({ ...createForm, expiry_date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Quốc gia xuất xứ</label>
                      <input
                        type="text"
                        value={createForm.origin_country}
                        onChange={e => setCreateForm({ ...createForm, origin_country: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="Việt Nam"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Nhà sản xuất</label>
                      <input
                        type="text"
                        value={createForm.manufacturer_name}
                        onChange={e => setCreateForm({ ...createForm, manufacturer_name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="Tên nhà máy"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                      <MapPin size={11} /> Địa chỉ sản xuất
                    </label>
                    <input
                      type="text"
                      value={createForm.production_place}
                      onChange={e => setCreateForm({ ...createForm, production_place: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      placeholder="Địa chỉ chi tiết nhà máy"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                      <Truck size={11} /> Nhà cung cấp / Logistics
                    </label>
                    <input
                      type="text"
                      value={createForm.supplier_name}
                      onChange={e => setCreateForm({ ...createForm, supplier_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      placeholder="Tên đơn vị vận chuyển/cung cấp"
                    />
                  </div>
                </form>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50 shrink-0">
              {drawerMode === 'VIEW' && selectedBatch && (role === 'ADMIN' || (role as string) === 'MANUFACTURER') && (
                <Button
                  onClick={async () => {
                    try {
                      const res = await batchApi.exportQR(selectedBatch.id);
                      const url = window.URL.createObjectURL(new Blob([res.data]));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `QR_${selectedBatch.batch_code}.pdf`);
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                    } catch (err) {
                      console.error('Lỗi tải file QR PDF', err);
                      alert('Không thể tải mã QR, vui lòng thử lại.');
                    }
                  }}
                  className="rounded-xl px-4 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm cursor-pointer border-none"
                >
                  Xuất QR Code (PDF)
                </Button>
              )}
              <Button variant="secondary" onClick={() => setIsDrawerOpen(false)} className="rounded-xl px-4 text-xs font-semibold cursor-pointer">
                {drawerMode === 'VIEW' || drawerMode === 'HISTORY' || drawerMode === 'PRODUCTS' || drawerMode === 'TRACE' ? 'Đóng' : 'Hủy'}
              </Button>

              {drawerMode === 'CREATE' && (
                <Button
                  type="submit"
                  form="create-form"
                  disabled={isSubmitting}
                  className="rounded-xl px-4 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Nhập lô hàng'}
                </Button>
              )}

              {drawerMode === 'EDIT_STATUS' && (
                <Button
                  type="submit"
                  form="status-form"
                  disabled={isSubmitting}
                  className="rounded-xl px-4 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
