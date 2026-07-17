import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, RotateCw, X, AlertCircle, Terminal, User,
  Activity, Inbox, Eye, Calendar, Filter, Clock
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Pagination from '../../components/ui/Pagination';
import { useAuditLogs } from '../../../features/audit/hooks/useAuditLogs';
import { parseApiError } from '../../../api/axios';
import type { AuditLog } from '../../../features/audit/api/audit.api';

// ─── Constants ────────────────────────────────────────────────────────────────
// Backend validation: action oneof=CREATE UPDATE DELETE (LOGIN/LOGOUT not supported server-side)
const SERVER_ACTIONS = ['CREATE', 'UPDATE', 'DELETE'] as const;

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-50 text-green-700 border-green-200',
  UPDATE: 'bg-blue-50 text-blue-700 border-blue-200',
  DELETE: 'bg-red-50 text-red-700 border-red-200',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActionBadge({ action }: { action: string }) {
  const cls = ACTION_COLORS[action?.toUpperCase()] ?? 'bg-slate-50 text-slate-600 border-slate-200';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${cls}`}>
      {action?.toUpperCase() ?? '—'}
    </span>
  );
}

function EntityBadge({ entity }: { entity: string }) {
  return (
    <span className="inline-flex px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
      {entity || '—'}
    </span>
  );
}

function DataDiff({
  oldData,
  newData,
}: {
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
}) {
  if (!oldData && !newData)
    return <p className="text-slate-400 text-xs italic">Không có dữ liệu chi tiết.</p>;

  const renderJson = (obj: Record<string, unknown> | null, label: string, color: string) =>
    obj ? (
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-bold mb-1 ${color}`}>{label}</p>
        <pre className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[10px] font-mono text-slate-700 overflow-auto max-h-48 whitespace-pre-wrap break-all leading-relaxed">
          {JSON.stringify(obj, null, 2)}
        </pre>
      </div>
    ) : null;

  return (
    <div className="flex flex-col gap-3 mt-2">
      {renderJson(oldData, '← Dữ liệu cũ', 'text-red-600')}
      {renderJson(newData, '→ Dữ liệu mới', 'text-green-600')}
    </div>
  );
}

function RowSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3.5 border-b border-slate-100 animate-pulse">
          <div className="h-4 bg-slate-100 rounded w-36" />
          <div className="h-4 bg-slate-100 rounded w-16" />
          <div className="h-4 bg-slate-100 rounded w-20" />
          <div className="h-4 bg-slate-100 rounded flex-1" />
          <div className="h-4 bg-slate-100 rounded w-28" />
        </div>
      ))}
    </>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AuditListPage({ onNavigate: _onNavigate }: { onNavigate: (tabId: string) => void }) {
  const tableRef = useRef<HTMLDivElement>(null);

  // ── Filter & Pagination State ────────────────────────────────────────────────
  const [page, setPage]               = useState(1);
  const [limit, setLimit]             = useState(20);
  const [filterAction, setFilterAction] = useState('');          // '' = all
  const [filterEntity, setFilterEntity] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');      // YYYY-MM-DD
  const [filterToDate, setFilterToDate]     = useState('');

  // Detail drawer
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Build query params — omit empty strings so backend ignores them
  const queryParams = useMemo(() => ({
    page,
    limit,
    ...(filterAction   ? { action: filterAction }                           : {}),
    ...(filterEntity.trim() ? { entity: filterEntity.trim() }             : {}),
    ...(filterFromDate ? { from_date: `${filterFromDate}T00:00:00Z` }     : {}),
    ...(filterToDate   ? { to_date:   `${filterToDate}T23:59:59Z` }       : {}),
  }), [page, limit, filterAction, filterEntity, filterFromDate, filterToDate]);

  const { data, isLoading, isFetching, isError, error, refetch } = useAuditLogs(queryParams);

  const logs       = data?.data  ?? [];
  const total      = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Scroll to top of table on page change
  useEffect(() => {
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [page]);

  // Reset to page 1 when any filter changes
  const applyFilter = (updater: () => void) => {
    updater();
    setPage(1);
  };

  const clearFilters = () => {
    setFilterAction('');
    setFilterEntity('');
    setFilterFromDate('');
    setFilterToDate('');
    setPage(1);
  };

  const hasActiveFilter = !!(filterAction || filterEntity.trim() || filterFromDate || filterToDate);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const formatDateShort = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return iso; }
  };

  // ── KPI stats (from current response) ────────────────────────────────────────
  const stats = useMemo(() => ({
    total,
    create: logs.filter(l => l.action === 'CREATE').length,
    update: logs.filter(l => l.action === 'UPDATE').length,
    delete: logs.filter(l => l.action === 'DELETE').length,
  }), [logs, total]);

  // ── Error state ───────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto mt-12 rounded-xl">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Không thể tải nhật ký</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">{parseApiError(error)}</p>
        <Button
          onClick={() => void refetch()}
          className="mt-6 rounded-xl px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
        >
          Thử lại
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Terminal size={22} className="text-slate-600" />
            Audit Logs
            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-semibold uppercase">
              Admin only
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Lịch sử thao tác và sự kiện hệ thống. Dữ liệu thực tế từ Backend — không có mock.
          </p>
        </div>
        <Button
          onClick={() => void refetch()}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
        >
          <RotateCw size={13} className={isFetching ? 'animate-spin' : ''} /> Làm mới
        </Button>
      </div>

      {/* ── KPI Stats ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tổng bản ghi', value: total.toLocaleString(), color: 'text-slate-900', icon: Activity, bg: 'bg-slate-50' },
          { label: 'CREATE (trang này)', value: stats.create, color: 'text-green-600', icon: Activity, bg: 'bg-green-50' },
          { label: 'UPDATE (trang này)', value: stats.update, color: 'text-blue-600',  icon: Activity, bg: 'bg-blue-50' },
          { label: 'DELETE (trang này)', value: stats.delete, color: 'text-red-600',   icon: Activity, bg: 'bg-red-50' },
        ].map(card => (
          <div key={card.label} className={`p-4 bg-white border border-slate-200 rounded-xl shadow-xs`}>
            <div className="text-[10px] text-slate-500 font-semibold uppercase flex items-center justify-between">
              <span>{card.label}</span>
              <card.icon size={12} className="text-slate-300" />
            </div>
            <div className={`text-2xl font-bold mt-2 ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap gap-3 items-end">

          {/* Entity search */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] text-slate-500 font-semibold uppercase mb-1 block">Entity</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                value={filterEntity}
                onChange={e => applyFilter(() => setFilterEntity(e.target.value))}
                placeholder="product, batch, user..."
                className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all"
              />
              {filterEntity && (
                <button
                  onClick={() => applyFilter(() => setFilterEntity(''))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Action filter */}
          <div className="min-w-[140px]">
            <label className="text-[10px] text-slate-500 font-semibold uppercase mb-1 block">Hành động</label>
            <select
              value={filterAction}
              onChange={e => applyFilter(() => setFilterAction(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg text-xs py-2 pl-2 pr-6 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="">Tất cả</option>
              {SERVER_ACTIONS.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div className="min-w-[140px]">
            <label className="text-[10px] text-slate-500 font-semibold uppercase mb-1 flex items-center gap-1">
              <Calendar size={10} /> Từ ngày
            </label>
            <input
              type="date"
              value={filterFromDate}
              onChange={e => applyFilter(() => setFilterFromDate(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg text-xs py-2 px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div className="min-w-[140px]">
            <label className="text-[10px] text-slate-500 font-semibold uppercase mb-1 flex items-center gap-1">
              <Calendar size={10} /> Đến ngày
            </label>
            <input
              type="date"
              value={filterToDate}
              onChange={e => applyFilter(() => setFilterToDate(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg text-xs py-2 px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Clear */}
          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              className="self-end text-xs font-semibold text-blue-600 hover:underline bg-transparent border-none cursor-pointer pb-2"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Active filter tags */}
        {hasActiveFilter && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {filterAction && (
              <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                <Filter size={9} /> {filterAction}
                <button onClick={() => applyFilter(() => setFilterAction(''))} className="ml-0.5 cursor-pointer bg-transparent border-none text-blue-500 hover:text-blue-700"><X size={9} /></button>
              </span>
            )}
            {filterEntity && (
              <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                entity: {filterEntity}
                <button onClick={() => applyFilter(() => setFilterEntity(''))} className="ml-0.5 cursor-pointer bg-transparent border-none text-slate-400 hover:text-slate-700"><X size={9} /></button>
              </span>
            )}
            {filterFromDate && (
              <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                <Clock size={9} /> từ {filterFromDate}
                <button onClick={() => applyFilter(() => setFilterFromDate(''))} className="ml-0.5 cursor-pointer bg-transparent border-none text-slate-400 hover:text-slate-700"><X size={9} /></button>
              </span>
            )}
            {filterToDate && (
              <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                <Clock size={9} /> đến {filterToDate}
                <button onClick={() => applyFilter(() => setFilterToDate(''))} className="ml-0.5 cursor-pointer bg-transparent border-none text-slate-400 hover:text-slate-700"><X size={9} /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div
        ref={tableRef}
        className={`bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-opacity duration-200 ${isFetching ? 'opacity-60' : ''}`}
      >
        {isLoading ? (
          <RowSkeleton />
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white">
            <Inbox size={48} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Không tìm thấy nhật ký</h3>
            <p className="text-slate-500 text-sm max-w-sm mt-1">
              Không có sự kiện nào phù hợp với bộ lọc hiện tại.
            </p>
            {hasActiveFilter && (
              <button onClick={clearFilters} className="mt-4 text-xs font-semibold text-blue-600 hover:underline border-none bg-transparent cursor-pointer">
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/75 border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pl-5 font-bold tracking-wider w-[165px]">Thời gian</th>
                  <th className="p-3.5 font-bold tracking-wider w-[90px]">Hành động</th>
                  <th className="p-3.5 font-bold tracking-wider w-[110px]">Entity</th>
                  <th className="p-3.5 font-bold tracking-wider">Entity ID</th>
                  <th className="p-3.5 font-bold tracking-wider w-[220px]">User ID</th>
                  <th className="p-3.5 pr-5 font-bold tracking-wider w-[80px] text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log: AuditLog) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="p-3.5 pl-5 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {formatDateShort(log.created_at)}
                    </td>
                    <td className="p-3.5">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="p-3.5">
                      <EntityBadge entity={log.entity} />
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-600 truncate max-w-[200px]" title={log.entity_id}>
                      {log.entity_id || '—'}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-400 truncate" title={log.user_id ?? 'System'}>
                      {log.user_id ? (
                        <span className="flex items-center gap-1">
                          <User size={10} className="text-slate-300 flex-shrink-0" />
                          {log.user_id}
                        </span>
                      ) : (
                        <span className="italic text-slate-300">System</span>
                      )}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer border-none bg-transparent transition-colors opacity-0 group-hover:opacity-100"
                        onClick={e => { e.stopPropagation(); setSelectedLog(log); }}
                        title="Xem chi tiết"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination — inside table card */}
        <Pagination
          page={page}
          limit={limit}
          totalItems={total}
          totalPages={totalPages}
          onPageChange={setPage}
          onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
          isLoading={isFetching}
        />
      </div>

      {/* ── Detail Drawer ────────────────────────────────────────────────────── */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-start justify-end p-4">
          <div className="absolute inset-0" onClick={() => setSelectedLog(null)} />
          <div className="relative bg-white w-[540px] max-h-[calc(100vh-2rem)] rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden border border-slate-100">

            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Terminal size={14} className="text-slate-400" />
                  Chi tiết Audit Log
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono break-all">{selectedLog.id}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg border-none bg-transparent cursor-pointer flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1.5">Hành động</p>
                  <ActionBadge action={selectedLog.action} />
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1.5">Entity</p>
                  <EntityBadge entity={selectedLog.entity} />
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Thời gian</p>
                  <p className="text-xs text-slate-800 font-mono">{formatDate(selectedLog.created_at)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">User</p>
                  <p className="text-xs text-slate-800 font-mono break-all">
                    {selectedLog.user_id ?? <span className="italic text-slate-400">System</span>}
                  </p>
                </div>
              </div>

              {/* Entity ID */}
              <div className="bg-slate-50 rounded-lg p-2.5">
                <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Entity ID</p>
                <p className="text-xs font-mono text-slate-800 break-all">{selectedLog.entity_id || '—'}</p>
              </div>

              {/* Data Diff */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">Dữ liệu thay đổi</p>
                <DataDiff oldData={selectedLog.old_data} newData={selectedLog.new_data} />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}