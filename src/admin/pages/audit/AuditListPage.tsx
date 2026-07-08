import React, { useState, useMemo } from 'react';
import { 
  Search, RotateCw, Eye, X, AlertCircle, 
  Terminal, User, ShieldAlert, Cpu, HelpCircle, Inbox, Activity, Calendar
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

import { AdminAuditLog as AuditLog } from '@shared/types/domain';

export default function AuditListPage({ onNavigate }: { onNavigate: (tabId: string) => void }) {
  const [demoState, setDemoState] = useState<'NORMAL' | 'LOADING' | 'EMPTY' | 'ERROR'>('NORMAL');
  const [activeKpiFilter, setActiveKpiFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'ERROR' | 'SECURITY'>('ALL');

  const [logs] = useState<AuditLog[]>([
    {
      id: 'log-1',
      content: 'Nhập lô hàng mới BATCH-2026-KG01 thành công. Số lượng: 500 chiếc.',
      type: 'INFO',
      actorName: 'Nguyễn Kho',
      actorEmail: 'staff.kho@producttrace.vn',
      actorRole: 'Warehouse Staff',
      ipAddress: '192.168.1.45',
      createdAt: '2026-06-25 10:15:32'
    },
    {
      id: 'log-2',
      content: 'Cảnh báo đăng nhập thất bại liên tiếp 3 lần từ địa chỉ IP nước ngoài.',
      type: 'SECURITY',
      actorName: 'Hệ thống AI',
      actorEmail: 'security-bot@producttrace.vn',
      actorRole: 'System Bot',
      ipAddress: '45.112.90.12',
      createdAt: '2026-06-25 09:30:12'
    },
    {
      id: 'log-3',
      content: 'Cập nhật trạng thái bảo hành của sản phẩm SN-OM-771120 sang Hết Hạn (EXPIRED).',
      type: 'INFO',
      actorName: 'Hệ thống Cronjob',
      actorEmail: 'cron-scheduler@producttrace.vn',
      actorRole: 'System Bot',
      ipAddress: '127.0.0.1',
      createdAt: '2026-06-25 00:00:05'
    },
    {
      id: 'log-4',
      content: 'Lỗi đồng bộ dữ liệu vị trí GPS với máy chủ bản đồ API Google Maps.',
      type: 'ERROR',
      actorName: 'Hệ thống Maps',
      actorEmail: 'geo-service@producttrace.vn',
      actorRole: 'System Bot',
      ipAddress: '192.168.1.10',
      createdAt: '2026-06-24 16:45:18'
    },
    {
      id: 'log-5',
      content: 'Thay đổi phân quyền người dùng tranthib@hotmail.com từ Dealer sang Manager.',
      type: 'WARNING',
      actorName: 'Admin User',
      actorEmail: 'admin@producttrace.vn',
      actorRole: 'Admin',
      ipAddress: '115.79.44.190',
      createdAt: '2026-06-24 14:20:00'
    },
    {
      id: 'log-6',
      content: 'Khởi tạo yêu cầu bảo hành WAR-SP-400981 cho khách hàng Lê Hoàng C.',
      type: 'INFO',
      actorName: 'Nguyễn Dealer',
      actorEmail: 'dealer.thanhxuan@producttrace.vn',
      actorRole: 'Dealer',
      ipAddress: '192.168.2.115',
      createdAt: '2026-06-24 11:00:54'
    }
  ]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Stats
  const stats = useMemo(() => {
    const total = logs.length + 8420;
    const info = logs.filter(l => l.type === 'INFO').length + 7980;
    const warning = logs.filter(l => l.type === 'WARNING').length + 290;
    const error = logs.filter(l => l.type === 'ERROR').length + 42;
    const security = logs.filter(l => l.type === 'SECURITY').length + 108;
    return { total, info, warning, error, security };
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchContent = l.content.toLowerCase().includes(query);
        const matchActor = l.actorName.toLowerCase().includes(query) || l.actorEmail.toLowerCase().includes(query);
        const matchIp = l.ipAddress.includes(query);
        if (!matchContent && !matchActor && !matchIp) return false;
      }
      if (filterType !== 'ALL' && l.type !== filterType) return false;
      if (activeKpiFilter !== 'ALL' && l.type !== activeKpiFilter) return false;
      return true;
    });
  }, [logs, searchTerm, filterType, activeKpiFilter]);

  const renderTypeBadge = (type: 'INFO' | 'WARNING' | 'ERROR' | 'SECURITY') => {
    const config = {
      INFO: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'THÔNG TIN' },
      WARNING: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'CẢNH BÁO' },
      ERROR: { bg: 'bg-red-50 text-red-700 border-red-200', label: 'LỖI HỆ THỐNG' },
      SECURITY: { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'BẢO MẬT' }
    };
    const c = config[type] || config.INFO;
    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${c.bg}`}>
        {c.label}
      </span>
    );
  };

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 h-24"></div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-100 h-96 animate-pulse"></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Demo Controls */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Demo Controls</span>
          <span className="text-xs text-blue-600 font-medium">Bấm để kiểm tra hiển thị:</span>
        </div>
        <div className="flex gap-2">
          {['NORMAL', 'LOADING', 'EMPTY', 'ERROR'].map(st => (
            <button
              key={st}
              onClick={() => setDemoState(st as any)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                demoState === st ? 'bg-blue-600 text-white' : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'
              }`}
            >
              {st === 'NORMAL' ? 'Bình thường' : st === 'LOADING' ? 'Đang tải' : st === 'EMPTY' ? 'Trống' : 'Lỗi'}
            </button>
          ))}
        </div>
      </div>

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
            Giám sát bảo mật, lịch sử thao tác của các thành viên và tiến trình tự động của hệ thống ProductTrace-AI.
          </p>
        </div>
      </div>

      {demoState === 'ERROR' ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto mt-12">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Không thể tải nhật ký</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">Đã xảy ra lỗi kết nối cơ sở dữ liệu nhật ký hệ thống.</p>
          <Button onClick={() => setDemoState('NORMAL')} className="mt-6 rounded-xl px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Thử lại</Button>
        </Card>
      ) : demoState === 'LOADING' ? (
        renderSkeleton()
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-5 gap-4">
            {[
              { id: 'ALL', label: 'Tổng số sự kiện', value: stats.total, color: 'text-slate-900' },
              { id: 'INFO', label: 'Thông tin thường', value: stats.info, color: 'text-blue-600' },
              { id: 'WARNING', label: 'Cảnh báo thay đổi', value: stats.warning, color: 'text-amber-500' },
              { id: 'ERROR', label: 'Lỗi phần mềm', value: stats.error, color: 'text-red-500' },
              { id: 'SECURITY', label: 'Sự kiện bảo mật', value: stats.security, color: 'text-purple-600' }
            ].map(card => (
              <div
                key={card.id}
                onClick={() => setActiveKpiFilter(activeKpiFilter === card.id ? 'ALL' : card.id as any)}
                className={`p-4 bg-white border rounded-xl shadow-xs cursor-pointer hover:border-slate-300 transition-all ${
                  activeKpiFilter === card.id ? 'border-blue-400 ring-2 ring-blue-50 bg-blue-50/10' : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase">
                  <span>{card.label}</span>
                  <HelpCircle size={12} className="text-slate-300" />
                </div>
                <div className={`text-2xl font-bold mt-2.5 ${card.color}`}>
                  {card.value}
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Lọc nhật ký theo nội dung, Email, IP Address..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm focus:outline-none"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"><X size={14} /></button>
                )}
              </div>

              {/* Type */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Phân loại:</span>
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 cursor-pointer"
                >
                  <option value="ALL">Tất cả loại sự kiện</option>
                  <option value="INFO">Thông tin thường (INFO)</option>
                  <option value="WARNING">Cảnh báo (WARNING)</option>
                  <option value="ERROR">Lỗi hệ thống (ERROR)</option>
                  <option value="SECURITY">Cảnh báo bảo mật (SECURITY)</option>
                </select>
              </div>
            </div>

            {(searchTerm || filterType !== 'ALL' || activeKpiFilter !== 'ALL') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('ALL');
                  setActiveKpiFilter('ALL');
                }}
                className="text-xs font-semibold text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {demoState === 'EMPTY' || filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white">
                <Inbox size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Không tìm thấy nhật ký</h3>
                <p className="text-slate-500 text-sm max-w-sm mt-1">Không có sự kiện nhật ký nào phù hợp với bộ lọc tìm kiếm.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm table-fixed border-collapse">
                  <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/75 border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 pl-5 font-bold tracking-wider w-[18%]">Thời gian</th>
                      <th className="p-3.5 font-bold tracking-wider w-[14%]">Loại sự kiện</th>
                      <th className="p-3.5 font-bold tracking-wider w-[20%]">Người thực hiện</th>
                      <th className="p-3.5 font-bold tracking-wider w-[36%]">Nội dung hoạt động</th>
                      <th className="p-3.5 pr-5 font-bold tracking-wider w-[12%] text-right">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {filteredLogs.map(log => (
                      <tr 
                        key={log.id} 
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="p-3.5 pl-5 font-mono text-xs text-slate-500">{log.createdAt}</td>
                        <td className="p-3.5">{renderTypeBadge(log.type)}</td>
                        <td className="p-3.5 truncate">
                          <div className="font-semibold text-slate-800 text-xs truncate">{log.actorName}</div>
                          <div className="text-[10px] text-slate-400 truncate">{log.actorEmail} ({log.actorRole})</div>
                        </td>
                        <td className="p-3.5 text-slate-700 text-xs font-medium leading-relaxed truncate" title={log.content}>{log.content}</td>
                        <td className="p-3.5 pr-5 text-right font-mono text-xs text-slate-400">{log.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
