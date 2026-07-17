import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Eye, Edit3, X, AlertCircle,
  Calendar, MapPin, Truck, HelpCircle, Inbox, Layers,
  ArrowUpRight, ArrowDownRight, Activity, Trash2, ChevronLeft, ChevronRight,
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
import { batchApi } from '../../../features/batch/api/batch.api';
import { BatchListItem, BatchStatus } from '../../../features/batch/api/batch.types';
import { useAuthStore } from '../../../features/auth/store/auth.store';
import { parseApiError } from '../../../api/axios';

// ─── Modals ──────────────────────────────────────────────────────────────────
import CreateBatchModal from './CreateBatchModal';
import ExportBatchModal from './ExportBatchModal';
import ImportBatchModal from './ImportBatchModal';

// ─── Types ────────────────────────────────────────────────────────────────────
type DrawerMode = 'VIEW' | 'EDIT_STATUS' | 'TRACE' | 'HISTORY';
type ModalMode = 'NONE' | 'CREATE' | 'EXPORT' | 'IMPORT';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { bg: string; dot: string; label: string }> = {
  ACTIVE: { bg: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', label: 'Đang hoạt động' },
  EXPIRED: { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', label: 'Hết hạn sử dụng' },
  RECALLED: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Đã thu hồi' },
  BLOCKED: { bg: 'bg-slate-100 text-slate-600 border-slate-300', dot: 'bg-slate-400', label: 'Bị khóa' },
  DRAFT: { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-400', label: 'Nháp' },
  CREATED: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500', label: 'Mới tạo' },
  IN_STOCK: { bg: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', label: 'Trong kho' },
  SHIPPED: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'Đã xuất kho' },
  IN_TRANSIT: { bg: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500', label: 'Đang vận chuyển' },
  DELIVERED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Đã giao hàng' },
  SOLD_OUT: { bg: 'bg-neutral-50 text-neutral-700 border-neutral-200', dot: 'bg-neutral-500', label: 'Hết hàng' },
  CLOSED: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'Đã đóng' },
};

// function renderStatusBadge(status: string) {
//   const c = STATUS_CONFIG[status.toUpperCase()] ?? STATUS_CONFIG['ACTIVE'];
//   return (
//     <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${c.bg}`}>
//       <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
//       {c.label}
//     </span>
//   );
// }

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
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
    // { label: 'Trạng thái', value: renderStatusBadge(detail.status) },
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
          {/* {renderStatusBadge(item.status)} */}
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

// ─── DrawerTracePanel ───────────────────────────────────────────────────────
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

// ─── Main BatchListPage Component ─────────────────────────────────────────────
export default function BatchListPage({ onNavigate }: { onNavigate?: (tabId: string, id?: string) => void } = {}) {
  const { role } = useAuthStore();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOrigin, setFilterOrigin] = useState('');
  const [activeKpiFilter, setActiveKpiFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'RECALLED_BLOCKED'>('ALL');
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Checkbox Selection
  const [selectedBatchIds, setSelectedBatchIds] = useState<Set<string>>(new Set());

  // Modal State
  const [activeModal, setActiveModal] = useState<ModalMode>('NONE');

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('VIEW');
  const [selectedBatch, setSelectedBatch] = useState<BatchListItem | null>(null);
  const [newStatus, setNewStatus] = useState<BatchStatus>('ACTIVE');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Batch list via Hook
  const { items, meta, stats, isLoading, error, refetch } = useBatchList({
    page,
    limit: 10,
    search: searchTerm || undefined,
    status: filterStatus || (activeKpiFilter === 'ACTIVE' ? 'ACTIVE' : activeKpiFilter === 'EXPIRED' ? 'EXPIRED' : activeKpiFilter === 'RECALLED_BLOCKED' ? 'RECALLED' : undefined),
    origin_country: filterOrigin || undefined,
  });

  // Reset checkboxes when filters change
  useEffect(() => {
    setSelectedBatchIds(new Set());
  }, [page, searchTerm, filterStatus, filterOrigin, activeKpiFilter]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearchTerm(value);
      setPage(1);
    }, 400);
  };

  const displayStats = stats ?? { total: 0, active: 0, expired: 0, recalled_blocked: 0 };

  // Checkbox Handlers
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

  const selectedBatchObjects = items.filter(b => selectedBatchIds.has(b.id));

  // Filter click hander
  const handleKpiClick = (id: typeof activeKpiFilter) => {
    setActiveKpiFilter(prev => prev === id ? 'ALL' : id);
    setPage(1);
    setFilterStatus('');
  };

  // Actions handlers
  const openView = (batch: BatchListItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedBatch(batch);
    setFormError(null);
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

  const clearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setFilterStatus('');
    setFilterOrigin('');
    setActiveKpiFilter('ALL');
    setPage(1);
  };

  const hasFilters = searchTerm || filterStatus || filterOrigin || activeKpiFilter !== 'ALL';

  const drawerTitle: Record<DrawerMode, string> = {
    VIEW: 'Chi tiết lô hàng',
    EDIT_STATUS: 'Cập nhật trạng thái',
    TRACE: 'Truy xuất nguồn gốc',
    HISTORY: 'Lịch sử thay đổi',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Quản lý lô hàng (Batch Management)
            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-semibold uppercase">
              Admin / Staff / Dealer
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Chỉ Admin/Manufacturer được thao tác tạo mới. Product Item được quản lý tự động theo Batch.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              if (selectedBatchIds.size === 0) {
                alert("Vui lòng chọn ít nhất một lô hàng.");
                return;
              }
              const invalid = selectedBatchObjects.filter(b => b.status !== 'IN_STOCK');
              if (invalid.length > 0) {
                alert("Chỉ cho phép xuất các lô hàng ở trạng thái IN_STOCK. Lô hàng không hợp lệ: " + invalid.map(x => x.batch_code).join(', '));
                return;
              }
              setActiveModal('EXPORT');
            }}
            className="rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 font-semibold shadow-xs cursor-pointer"
          >
            <ArrowUpRight size={16} /> Xuất Lô Hàng {selectedBatchIds.size > 0 ? `(${selectedBatchIds.size})` : ''}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setActiveModal('IMPORT')}
            className="rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 font-semibold shadow-xs cursor-pointer"
          >
            <ArrowDownRight size={16} /> Nhập Lô Hàng
          </Button>
          {(role === 'ADMIN' || (role as string) === 'MANUFACTURER') && (
            <Button
              onClick={() => setActiveModal('CREATE')}
              className="rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
            >
              <Plus size={16} /> Tạo Lô Hàng
            </Button>
          )}
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

      {/* Loading state */}
      {isLoading && !error && <Skeleton />}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* KPI Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          </div> */}

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Tìm mã lô hàng, sản phẩm, xuất xứ..."
                className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                value={searchInput}
                onChange={e => handleSearchChange(e.target.value)}
              />
              {searchInput && (
                <button onClick={() => handleSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold">Lọc trạng thái:</span>
                <select
                  value={filterStatus}
                  onChange={e => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                    setActiveKpiFilter('ALL');
                  }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 outline-none cursor-pointer"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="CREATED">Mới tạo</option>
                  <option value="IN_STOCK">Trong kho</option>
                  <option value="SHIPPED">Đã xuất kho</option>
                  <option value="IN_TRANSIT">Đang vận chuyển</option>
                  <option value="DELIVERED">Đã giao hàng</option>
                  <option value="SOLD_OUT">Hết hàng</option>
                  <option value="ACTIVE">Hoạt động (Legacy)</option>
                  <option value="EXPIRED">Hết hạn</option>
                  <option value="RECALLED">Thu hồi</option>
                  <option value="BLOCKED">Bị khóa</option>
                  <option value="CLOSED">Đã đóng</option>
                  <option value="DRAFT">Nháp</option>
                </select>
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-xs font-semibold text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Selected info notification */}
          {selectedBatchIds.size > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <span className="text-sm text-purple-700 font-semibold">
                Đã chọn <strong>{selectedBatchIds.size}</strong> lô hàng để xuất kho.
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveModal('EXPORT')}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 bg-transparent border-none cursor-pointer"
                >
                  <ArrowUpRight size={13} /> Tiếp tục xuất
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

          {/* Main Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white">
                <Inbox size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Không tìm thấy lô hàng</h3>
                <p className="text-slate-500 text-sm max-w-sm mt-1">
                  {hasFilters
                    ? 'Vui lòng điều chỉnh bộ lọc hoặc xóa điều kiện tìm kiếm.'
                    : 'Hệ thống chưa có lô hàng nào.'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse table-fixed">
                    <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-4 w-12 text-center">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 cursor-pointer w-4 h-4"
                            onChange={handleSelectAll}
                            checked={isAllSelected}
                            ref={el => {
                              if (el) el.indeterminate = isIndeterminate;
                            }}
                          />
                        </th>
                        <th className="p-4 font-bold w-[18%]">Mã Lô Hàng</th>
                        <th className="p-4 font-bold w-[25%]">Sản phẩm</th>
                        <th className="p-4 font-bold text-center w-[10%]">Số lượng</th>
                        <th className="p-4 font-bold text-center w-[12%]">NSX</th>
                        <th className="p-4 font-bold text-center w-[12%]">HSD</th>
                        <th className="p-4 font-bold text-center w-[12%]">Trạng thái</th>
                        <th className="p-4 font-bold text-right w-[11%]">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map(batch => (
                        <tr key={batch.id} className={`hover:bg-slate-50/50 transition-colors group ${selectedBatchIds.has(batch.id) ? 'bg-purple-50/20' : ''}`}>
                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 cursor-pointer w-4 h-4"
                              checked={selectedBatchIds.has(batch.id)}
                              onChange={() => handleSelectRow(batch.id)}
                            />
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-800 truncate" onClick={() => openView(batch)}>
                            {batch.batch_code}
                          </td>
                          <td className="p-4 font-semibold text-slate-900 truncate" onClick={() => openView(batch)}>
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-slate-100 rounded text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 shrink-0">
                                <Layers size={14} />
                              </div>
                              <span className="truncate">{batch.variant_name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center font-bold text-slate-700" onClick={() => openView(batch)}>
                            {batch.quantity.toLocaleString()}
                          </td>
                          <td className="p-4 text-center text-slate-500 text-xs" onClick={() => openView(batch)}>
                            {formatDate(batch.manufacture_date)}
                          </td>
                          <td className="p-4 text-center text-slate-500 text-xs" onClick={() => openView(batch)}>
                            {formatDate(batch.expiry_date)}
                          </td>
                          {/* <td className="p-4 text-center" onClick={() => openView(batch)}>
                            {renderStatusBadge(batch.status)}
                          </td> */}
                          <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  navigate(`/batches/${batch.id}/trace?code=${batch.batch_code}`);
                                }}
                                className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg cursor-pointer transition-colors border-none bg-transparent"
                                title="Truy xuất nguồn gốc"
                              >
                                <Activity size={15} />
                              </button>
                              <button
                                onClick={e => openEditStatus(batch, e)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors border-none bg-transparent"
                                title="Cập nhật trạng thái"
                              >
                                <Edit3 size={15} />
                              </button>

                              {(role === 'ADMIN' || (role as string) === 'MANUFACTURER') && (
                                <button
                                  onClick={e => handleDelete(batch, e)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors border-none bg-transparent"
                                  title="Xóa lô hàng"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {meta && meta.total_pages > 1 && (
                  <div className="p-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500 bg-slate-50">
                    <div>
                      Hiển thị trang <strong>{page}</strong> trên <strong>{meta.total_pages}</strong> ({meta.total_items} lô hàng)
                    </div>
                    <div className="flex gap-1 items-center">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer text-xs"
                      >
                        Trước
                      </button>
                      <span className="px-3 py-1 bg-blue-600 text-white rounded font-bold text-xs">{page}</span>
                      <button
                        onClick={() => setPage(p => Math.min(meta.total_pages, p + 1))}
                        disabled={page >= meta.total_pages}
                        className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer text-xs"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Render Modals */}
      {activeModal === 'CREATE' && (
        <CreateBatchModal
          onClose={() => setActiveModal('NONE')}
          onSuccess={() => { refetch(); }}
        />
      )}
      {activeModal === 'EXPORT' && (
        <ExportBatchModal
          selectedBatches={selectedBatchObjects}
          onClose={() => setActiveModal('NONE')}
          onSuccess={() => {
            setSelectedBatchIds(new Set());
            refetch();
          }}
        />
      )}
      {activeModal === 'IMPORT' && (
        <ImportBatchModal
          onClose={() => setActiveModal('NONE')}
          onSuccess={() => { refetch(); }}
        />
      )}

      {/* ─── Drawer ──────────────────────────────────────────────────────────── */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative bg-white w-125 max-h-[90vh] rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">{drawerTitle[drawerMode]}</h3>
                {selectedBatch && (
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">{selectedBatch.batch_code}</p>
                )}
              </div>
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

              {/* ── EDIT_STATUS: Cập nhật trạng thái ─────────────────────── */}
              {drawerMode === 'EDIT_STATUS' && (
                <form id="status-form" onSubmit={handleSubmitStatus} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Trạng thái mới *</label>
                    <select
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value as BatchStatus)}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm cursor-pointer outline-none focus:border-blue-500"
                    >
                      <option value="CREATED">Mới tạo</option>
                      <option value="IN_STOCK">Trong kho</option>
                      <option value="SHIPPED">Đã xuất kho</option>
                      <option value="IN_TRANSIT">Đang vận chuyển</option>
                      <option value="DELIVERED">Đã giao hàng</option>
                      <option value="SOLD_OUT">Hết hàng</option>
                      <option value="ACTIVE">Hoạt động (Legacy)</option>
                      <option value="EXPIRED">Hết hạn</option>
                      <option value="RECALLED">Đã thu hồi</option>
                      <option value="BLOCKED">Bị khóa</option>
                      <option value="CLOSED">Đã đóng</option>
                    </select>
                  </div>
                </form>
              )}

              {/* ── VIEW: Chi tiết lô hàng ───────────────────────────────── */}
              {drawerMode === 'VIEW' && selectedBatch && (
                <DrawerDetailPanel batchCode={selectedBatch.batch_code} />
              )}

              {/* ── HISTORY: Lịch sử thay đổi ───────────────────────────── */}
              {drawerMode === 'HISTORY' && selectedBatch && (
                <DrawerHistoryPanel batchId={selectedBatch.id} />
              )}


              {/* ── TRACE: Truy xuất nguồn gốc ───────────────────────────── */}
              {drawerMode === 'TRACE' && selectedBatch && (
                <DrawerTracePanel batch={selectedBatch} />
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

              <Button variant="secondary" onClick={() => setIsDrawerOpen(false)} className="rounded-xl px-4 text-xs font-semibold cursor-pointer border-slate-300">
                {drawerMode === 'VIEW' || drawerMode === 'HISTORY' || drawerMode === 'TRACE' ? 'Đóng' : 'Hủy'}
              </Button>

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
