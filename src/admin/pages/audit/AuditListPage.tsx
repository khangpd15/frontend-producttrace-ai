import React, { useState } from 'react';
import {
  Search, RotateCw, X, AlertCircle,
  Terminal, User, HelpCircle, Inbox, Activity, ChevronLeft, ChevronRight
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAuditLogs } from '../../../features/audit/hooks/useAuditLogs';
import { parseApiError } from '../../../api/axios';
import type { AuditLog } from '../../../features/audit/api/audit.api';

const PAGE_SIZE = 20;

const ACTION_COLORS: Record<string, string> = {
  CREATE:   'bg-green-50 text-green-700 border-green-200',
  UPDATE:   'bg-blue-50 text-blue-700 border-blue-200',
  DELETE:   'bg-red-50 text-red-700 border-red-200',
  LOGIN:    'bg-purple-50 text-purple-700 border-purple-200',
  LOGOUT:   'bg-slate-50 text-slate-600 border-slate-200',
  LOCK:     'bg-orange-50 text-orange-700 border-orange-200',
  UNLOCK:   'bg-teal-50 text-teal-700 border-teal-200',
};

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
      {entity}
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
  if (!oldData && !newData) return <p className="text-slate-400 text-xs">Không có dữ liệu chi tiết.</p>;

  const renderJson = (obj: Record<string, unknown> | null, label: string, color: string) =>
    obj ? (
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-bold mb-1 ${color}`}>{label}</p>
        <pre className="bg-slate-50 border border-slate-200 rounded p-2 text-[10px] font-mono text-slate-700 overflow-auto max-h-40 whitespace-pre-wrap break-all">
          {JSON.stringify(obj, null, 2)}
        </pre>
      </div>
    ) : null;

  return (
    <div className="flex gap-3 mt-2">
      {renderJson(oldData, 'Dữ liệu cũ', 'text-red-600')}
      {renderJson(newData, 'Dữ liệu mới', 'text-green-600')}
    </div>
  );
}

export default function AuditListPage({ onNavigate: _onNavigate }: { onNavigate: (tabId: string) => void }) {
  const [page, setPage] = useState(1);
  const [searchEntity, setSearchEntity] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Build query params — only send non-empty values
  const queryParams = {
    page,
    limit: PAGE_SIZE,
    ...(filterAction !== 'ALL' ? { action: filterAction } : {}),
    ...(searchEntity.trim() ? { entity: searchEntity.trim() } : {}),
  };

  const { data, isLoading, isError, error, refetch } = useAuditLogs(queryParams);

  const logs = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void refetch();
  };

  const clearFilters = () => {
    setSearchEntity('');
    setFilterAction('ALL');
    setPage(1);
  };

  // ─── Error state ─────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto mt-12">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Không thể tải nhật ký</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">{parseApiError(error)}</p>
        <Button
          onClick={() => void refetch()}
          className="mt-6 rounded-xl px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
        >
          Thử lại
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {/* Header */}
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
            Lịch sử thao tác và sự kiện hệ thống ProductTrace-AI. Dữ liệu thực tế từ Backend.
          </p>
        </div>
        <Button
          onClick={() => void refetch()}
          className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
        >
          <RotateCw size={14} /> Làm mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tổng số log', value: total.toLocaleString(), color: 'text-slate-900', icon: Activity },
          { label: 'Trang hiện tại', value: `${page} / ${totalPages}`, color: 'text-blue-600', icon: User },
          { label: 'Kết quả mỗi trang', value: PAGE_SIZE.toString(), color: 'text-purple-600', icon: HelpCircle },
        ].map(card => (
          <div key={card.label} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="text-[10px] text-slate-500 font-semibold uppercase flex items-center justify-between">
              <span>{card.label}</span>
              <card.icon size={12} className="text-slate-300" />
            </div>
            <div className={`text-2xl font-bold mt-2 ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <form
        onSubmit={handleSearch}
        className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between"
      >
        <div className="flex items-center gap-4 flex-1 min-w-[280px]">
          {/* Entity search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchEntity}
              onChange={e => setSearchEntity(e.target.value)}
              placeholder="Lọc theo entity (product, batch, user...)"
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm focus:outline-none"
            />
            {searchEntity && (
              <button
                type="button"
                onClick={() => setSearchEntity('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Action filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Hành động:</span>
            <select
              value={filterAction}
              onChange={e => { setFilterAction(e.target.value); setPage(1); }}
              className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 cursor-pointer"
            >
              <option value="ALL">Tất cả</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGOUT">LOGOUT</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(searchEntity || filterAction !== 'ALL') && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
          <Button type="submit" className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-xl cursor-pointer">
            Tìm kiếm
          </Button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-3.5 border-b border-slate-100 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-32" />
                <div className="h-4 bg-slate-100 rounded w-20" />
                <div className="h-4 bg-slate-100 rounded flex-1" />
                <div className="h-4 bg-slate-100 rounded w-24" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white">
            <Inbox size={48} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Không tìm thấy nhật ký</h3>
            <p className="text-slate-500 text-sm max-w-sm mt-1">
              Không có sự kiện nào phù hợp với bộ lọc hiện tại.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm table-fixed border-collapse">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/75 border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pl-5 font-bold tracking-wider w-[18%]">Thời gian</th>
                  <th className="p-3.5 font-bold tracking-wider w-[12%]">Hành động</th>
                  <th className="p-3.5 font-bold tracking-wider w-[12%]">Entity</th>
                  <th className="p-3.5 font-bold tracking-wider w-[20%]">Entity ID</th>
                  <th className="p-3.5 font-bold tracking-wider w-[20%]">User ID</th>
                  <th className="p-3.5 pr-5 font-bold tracking-wider w-[18%] text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {logs.map((log: AuditLog) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="p-3.5 pl-5 font-mono text-xs text-slate-500">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="p-3.5">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="p-3.5">
                      <EntityBadge entity={log.entity} />
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-600 truncate" title={log.entity_id}>
                      {log.entity_id}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-400 truncate" title={log.user_id ?? '—'}>
                      {log.user_id ?? <span className="italic">System</span>}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        className="text-xs text-blue-600 hover:underline bg-transparent border-none cursor-pointer font-semibold"
                        onClick={e => { e.stopPropagation(); setSelectedLog(log); }}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 text-xs">
            Trang {page} / {totalPages} — Tổng {total.toLocaleString()} bản ghi
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-white"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              const pg = Math.max(1, Math.min(totalPages - 6, page - 3)) + i;
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-8 h-8 text-xs font-semibold rounded-lg cursor-pointer ${
                    pg === page
                      ? 'bg-blue-600 text-white border border-blue-600'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pg}
                </button>
              );
            })}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-white"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-start justify-end p-4">
          <div className="absolute inset-0" onClick={() => setSelectedLog(null)} />
          <div className="relative bg-white w-[520px] max-h-[calc(100vh-2rem)] rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden">

            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Chi tiết Audit Log</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">{selectedLog.id}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg border-none bg-transparent cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Hành động', value: <ActionBadge action={selectedLog.action} /> },
                  { label: 'Entity', value: <EntityBadge entity={selectedLog.entity} /> },
                  { label: 'Thời gian', value: formatDate(selectedLog.created_at) },
                  { label: 'User ID', value: selectedLog.user_id ?? 'System' },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">{item.label}</p>
                    <div className="text-xs text-slate-800 font-medium">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Entity ID */}
              <div className="bg-slate-50 rounded-lg p-2.5">
                <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Entity ID</p>
                <p className="text-xs font-mono text-slate-800 break-all">{selectedLog.entity_id}</p>
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
