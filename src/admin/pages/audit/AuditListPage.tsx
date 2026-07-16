import React, { useState } from 'react';
import { 
  Search, X, AlertCircle, HelpCircle, Inbox, 
  ChevronLeft, ChevronRight, RefreshCw, Database,
  PlusCircle, Edit2, Trash2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAuditLogs } from '../../../features/users/hooks/useAuditLogs';
import { parseApiError } from '../../../api/axios';

export default function AuditListPage({ onNavigate }: { onNavigate: (tabId: string) => void }) {
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState<'CREATE' | 'UPDATE' | 'DELETE' | ''>('');
  const [filterEntity, setFilterEntity] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data, isLoading, error, refetch } = useAuditLogs({
    page,
    limit: 15,
    action: filterAction || undefined,
    entity: filterEntity || undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  });

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 15);

  const hasActiveFilters = filterAction || filterEntity || fromDate || toDate;

  const clearFilters = () => {
    setFilterAction('');
    setFilterEntity('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  // ─── Badges ────────────────────────────────────────────────────────────────

  const ActionBadge = ({ action }: { action: 'CREATE' | 'UPDATE' | 'DELETE' }) => {
    const config = {
      CREATE: { cls: 'bg-green-50 text-green-700 border-green-200', icon: <PlusCircle size={10} />, label: 'TẠO MỚI' },
      UPDATE: { cls: 'bg-blue-50 text-blue-700 border-blue-200',  icon: <Edit2 size={10} />,   label: 'CẬP NHẬT' },
      DELETE: { cls: 'bg-red-50 text-red-700 border-red-200',     icon: <Trash2 size={10} />,  label: 'XÓA' },
    };
    const c = config[action] ?? config.UPDATE;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${c.cls}`}>
        {c.icon}
        {c.label}
      </span>
    );
  };

  // ─── Skeleton ──────────────────────────────────────────────────────────────

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 h-24" />
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-100 h-96 animate-pulse" />
    </div>
  );

  // ─── Stats cards ───────────────────────────────────────────────────────────

  const stats = [
    { label: 'Tổng bản ghi', value: total, color: 'text-slate-900' },
    { label: 'Trang hiện tại', value: `${page} / ${totalPages || 1}`, color: 'text-blue-600' },
    { label: 'Bản ghi / trang', value: logs.length, color: 'text-indigo-600' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Audit Logs
            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-semibold uppercase">
              Role: System Admin
            </span>
          </h1>
          <p className="text-sm text-slate-500">
            Giám sát lịch sử thao tác (CREATE / UPDATE / DELETE) trên toàn hệ thống ProductTrace-AI.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer bg-white disabled:opacity-50"
          title="Làm mới dữ liệu"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {error ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto mt-12">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Không thể tải nhật ký</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">{parseApiError(error)}</p>
          <Button onClick={() => refetch()} className="mt-6 rounded-xl px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
            Thử lại
          </Button>
        </Card>
      ) : isLoading ? (
        renderSkeleton()
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map(s => (
              <div key={s.label} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase">
                  <span>{s.label}</span>
                  <HelpCircle size={12} className="text-slate-300" />
                </div>
                <div className={`text-2xl font-bold mt-2.5 ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center">

            {/* Action filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Hành động:</span>
              <select
                value={filterAction}
                onChange={(e) => { setFilterAction(e.target.value as any); setPage(1); }}
                className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 cursor-pointer"
              >
                <option value="">Tất cả</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            {/* Entity filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Entity:</span>
              <div className="relative">
                <Database size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={filterEntity}
                  onChange={(e) => { setFilterEntity(e.target.value); setPage(1); }}
                  placeholder="vd: User, Batch..."
                  className="pl-7 pr-3 py-1.5 bg-white border border-slate-200 focus:bg-white rounded-lg text-xs focus:outline-none w-36"
                />
                {filterEntity && (
                  <button onClick={() => { setFilterEntity(''); setPage(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer">
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>

            {/* Date range */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Từ:</span>
              <input
                type="datetime-local"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 px-2 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Đến:</span>
              <input
                type="datetime-local"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 px-2 cursor-pointer"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-blue-600 hover:underline bg-transparent border-none cursor-pointer ml-auto"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white">
                <Inbox size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Không tìm thấy nhật ký</h3>
                <p className="text-slate-500 text-sm max-w-sm mt-1">
                  {hasActiveFilters ? 'Không có sự kiện nào phù hợp với bộ lọc.' : 'Chưa có nhật ký nào trong hệ thống.'}
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="mt-4 text-sm font-semibold text-blue-600 hover:underline cursor-pointer bg-transparent border-none">
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm table-fixed border-collapse">
                    <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/75 border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 pl-5 font-bold tracking-wider w-[17%]">Thời gian</th>
                        <th className="p-3.5 font-bold tracking-wider w-[12%]">Hành động</th>
                        <th className="p-3.5 font-bold tracking-wider w-[14%]">Entity</th>
                        <th className="p-3.5 font-bold tracking-wider w-[20%]">Entity ID</th>
                        <th className="p-3.5 font-bold tracking-wider w-[20%]">User ID</th>
                        <th className="p-3.5 pr-5 font-bold tracking-wider w-[17%] text-right">Dữ liệu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3.5 pl-5 font-mono text-xs text-slate-500">
                            {new Date(log.created_at).toLocaleString('vi-VN', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit', second: '2-digit'
                            })}
                          </td>
                          <td className="p-3.5">
                            <ActionBadge action={log.action} />
                          </td>
                          <td className="p-3.5 text-xs font-semibold text-slate-700 truncate">{log.entity}</td>
                          <td className="p-3.5 font-mono text-[10px] text-slate-400 truncate" title={log.entity_id}>
                            {log.entity_id}
                          </td>
                          <td className="p-3.5 font-mono text-[10px] text-slate-400 truncate" title={log.user_id ?? '—'}>
                            {log.user_id ?? <span className="text-slate-300">—</span>}
                          </td>
                          <td className="p-3.5 pr-5 text-right">
                            <div className="flex justify-end gap-1.5">
                              {log.old_data && (
                                <span
                                  className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold border bg-slate-50 text-slate-600 border-slate-200 cursor-help"
                                  title={JSON.stringify(log.old_data, null, 2)}
                                >
                                  OLD
                                </span>
                              )}
                              {log.new_data && (
                                <span
                                  className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold border bg-indigo-50 text-indigo-600 border-indigo-200 cursor-help"
                                  title={JSON.stringify(log.new_data, null, 2)}
                                >
                                  NEW
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-150">
                    <div className="text-xs text-slate-500">
                      Trang <span className="font-semibold">{page}</span> / <span className="font-semibold">{totalPages}</span> (Tổng {total} bản ghi)
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
