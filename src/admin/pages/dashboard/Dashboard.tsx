import React from 'react';
import {
  Package, Layers, ShieldCheck, Users, Activity,
  AlertTriangle, Building, ClipboardList, ShieldAlert, Sparkles,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import {
  useDashboardStats,
  useDashboardActivities,
  useDashboardAlerts,
  useDashboardCharts,
} from '../../../features/dashboard/hooks/useDashboardStats';
import { parseApiError } from '../../../api/axios';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();
  const { data: activities = [], isLoading: activitiesLoading } = useDashboardActivities(10);
  const { data: alerts = [],     isLoading: alertsLoading }     = useDashboardAlerts();
  const { data: chartData = [],  isLoading: chartLoading }      = useDashboardCharts();

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  const formatPeriod = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `Th${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch { return ''; }
  };

  // ── Sub-components ──────────────────────────────────────────────────────────

  const StatCard = ({ label, value, trend, color, bg, icon: Icon, tabId }: any) => (
    <div
      onClick={() => onNavigate(tabId)}
      className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group flex justify-between items-start"
    >
      <div className="space-y-2 w-full">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
        {isLoading ? (
          <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
        ) : (
          <div className="text-2xl font-bold text-slate-900">{value}</div>
        )}
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${trend.startsWith('↑') || trend.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {trend}
          </span>
          <span className="text-[9px] text-slate-400 font-medium">so với tháng trước</span>
        </div>
      </div>
      <div className={`p-2.5 rounded-lg ${color} ${bg} group-hover:scale-105 transition-transform flex-shrink-0`}>
        <Icon size={18} />
      </div>
    </div>
  );

  const SkeletonCard = () => (
    <div className="bg-white p-5 rounded-xl border border-slate-200 animate-pulse flex justify-between items-start">
      <div className="space-y-3 w-2/3">
        <div className="h-2.5 bg-slate-200 rounded w-1/2" />
        <div className="h-7 bg-slate-200 rounded w-3/4" />
        <div className="h-2 bg-slate-200 rounded w-5/6" />
      </div>
      <div className="w-9 h-9 bg-slate-200 rounded-lg" />
    </div>
  );

  // ── Error state ─────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <AlertTriangle className="text-red-500 w-12 h-12" />
        <h2 className="text-lg font-bold text-slate-800">Không thể tải dữ liệu Dashboard</h2>
        <p className="text-slate-500 text-sm">{parseApiError(error)}</p>
        <Button onClick={() => refetch()} className="bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-blue-700">
          Thử lại
        </Button>
      </div>
    );
  }

  // ── Chart renderer ──────────────────────────────────────────────────────────

  const renderChart = () => {
    if (chartLoading) {
      return (
        <div className="h-64 bg-slate-50/50 rounded-xl flex flex-col items-center justify-center gap-2 border border-slate-100">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] text-slate-400 font-semibold">Đang tải dữ liệu biểu đồ...</span>
        </div>
      );
    }
    if (chartData.length === 0) {
      return (
        <div className="h-64 bg-slate-50/50 rounded-xl flex flex-col items-center justify-center gap-2 border border-dashed border-slate-200">
          <Activity size={32} className="text-slate-300" />
          <span className="text-xs text-slate-400">Chưa có dữ liệu biểu đồ</span>
        </div>
      );
    }

    const maxVal = Math.max(
      ...chartData.map(d => Math.max(d.production_volume || 0, d.sales_volume || 0)),
      1
    );
    const yTicks = 4;
    const CHART_H = 200; // px

    return (
      <div className="flex gap-2 items-stretch mt-2">
        {/* Y-axis */}
        <div
          className="flex flex-col justify-between items-end pr-2 pb-6 min-w-[40px]"
          style={{ height: CHART_H + 24 }}
        >
          {Array.from({ length: yTicks + 1 }).map((_, i) => (
            <span key={i} className="text-[9px] text-slate-400 font-mono leading-none">
              {Math.round((maxVal / yTicks) * (yTicks - i))}
            </span>
          ))}
        </div>

        {/* Drawing area */}
        <div
          className="flex-1 border-b border-l border-slate-200 relative overflow-visible"
          style={{ height: CHART_H + 24 }}
        >
          {/* Grid lines */}
          {Array.from({ length: yTicks + 1 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-dashed border-slate-100 pointer-events-none"
              style={{ bottom: `${((yTicks - i) / yTicks) * CHART_H}px` }}
            />
          ))}

          {/* Bars */}
          <div
            className="absolute inset-0 pb-6 grid items-end gap-3 px-4"
            style={{ gridTemplateColumns: `repeat(${chartData.length}, 1fr)` }}
          >
            {chartData.map((item, idx) => {
              const prodH  = Math.max(((item.production_volume || 0) / maxVal) * (CHART_H - 24), 0);
              const salesH = Math.max(((item.sales_volume || 0) / maxVal) * (CHART_H - 24), 0);
              return (
                <div key={idx} className="flex flex-col items-center gap-1 h-full">
                  <div className="flex gap-1 items-end justify-center flex-1 w-full">
                    {/* Production bar (blue) */}
                    {prodH > 0 ? (
                      <div className="relative group/prod flex-1" style={{ height: `${prodH}px` }}>
                        <div className="w-full h-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm cursor-pointer hover:from-blue-500 hover:to-blue-300 transition-all" />
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow-lg opacity-0 group-hover/prod:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none font-bold">
                          NSX: {item.production_volume}
                        </div>
                      </div>
                    ) : <div className="flex-1" />}
                    {/* Sales bar (green) */}
                    {salesH > 0 ? (
                      <div className="relative group/sales flex-1" style={{ height: `${salesH}px` }}>
                        <div className="w-full h-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-sm cursor-pointer hover:from-green-500 hover:to-green-300 transition-all" />
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow-lg opacity-0 group-hover/sales:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none font-bold">
                          Bán: {item.sales_volume}
                        </div>
                      </div>
                    ) : <div className="flex-1" />}
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap leading-none">
                    {formatPeriod(item.time_period)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ── Main render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Chào mừng quay trở lại, Admin! <Sparkles className="text-blue-500" size={18} />
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Hệ thống ProductTrace-AI đang hoạt động ổn định. Dưới đây là tình trạng tổng quan vòng đời sản phẩm, số lượng phân phối, đăng ký quyền sở hữu và bảo hành điện tử.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center justify-center pointer-events-none pr-12">
          <Activity size={180} className="text-blue-600" />
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard label="Tổng sản phẩm"     value={stats?.total_products.toLocaleString()       ?? '0'} trend="↑ 12.4%" color="text-blue-600"   bg="bg-blue-50"   icon={Package}       tabId="products"  />
          <StatCard label="Tổng số lô hàng"   value={stats?.total_batches.toLocaleString()         ?? '0'} trend="↑ 8.2%"  color="text-purple-600" bg="bg-purple-50" icon={Layers}        tabId="batches"   />
          <StatCard label="Lượt sở hữu"       value={stats?.total_ownerships.toLocaleString()      ?? '0'} trend="↑ 10.1%" color="text-green-600"  bg="bg-green-50"  icon={Users}         tabId="ownership" />
          <StatCard label="Đang bảo hành"     value={stats?.total_under_warranty.toLocaleString()  ?? '0'} trend="↑ 4.5%"  color="text-blue-600"   bg="bg-blue-50"   icon={ShieldCheck}   tabId="warranty"  />
          <StatCard label="Yêu cầu chờ duyệt" value={stats?.total_pending_approval.toLocaleString()?? '0'} trend="↓ 18%"   color="text-amber-600"  bg="bg-amber-50"  icon={ClipboardList}  tabId="warranty"  />
          <StatCard label="Đại lý &amp; Kho"  value={stats?.total_locations.toLocaleString()       ?? '0'} trend="↑ 3%"    color="text-slate-700"  bg="bg-slate-50"  icon={Building}      tabId="store"     />
        </div>
      )}

      {/* Main grid: chart+activities | alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity size={16} className="text-blue-500" /> Biểu đồ Sản xuất &amp; Tiêu thụ
                </h3>
                <p className="text-[10px] text-slate-400">Đơn vị tính: Sản phẩm</p>
              </div>
              <div className="flex gap-4 text-[9px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-blue-500 rounded-xs" /> Sản xuất</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-500 rounded-xs" /> Tiêu thụ</span>
              </div>
            </div>
            {renderChart()}
          </div>

          {/* Activities */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Nhật ký hoạt động hôm nay</h3>
              <button
                onClick={() => onNavigate('audit')}
                className="text-[11px] font-bold text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>
            <div className="divide-y divide-slate-100 text-xs text-slate-700">
              {activitiesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="py-3 flex justify-between items-start gap-4 animate-pulse">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-12" />
                  </div>
                ))
              ) : activities.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Không có hoạt động nào ghi nhận trong hôm nay.
                </div>
              ) : (
                activities.map((act) => (
                  <div key={act?.id} className="py-3 flex justify-between items-start gap-4">
                    <span className="leading-relaxed">
                      {act?.title && (
                        <span className="font-semibold text-slate-800">{act.title} — </span>
                      )}
                      {act?.description}
                    </span>
                    <span className="text-slate-400 flex-shrink-0">
                      {act?.created_at ? formatTime(act.created_at) : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right column — Alerts */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldAlert size={16} className="text-red-500" /> Cảnh báo &amp; Rủi ro
            </h3>
            <div className="space-y-3">
              {alertsLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-lg animate-pulse space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-5/6" />
                  </div>
                ))
              ) : alerts.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  🟢 Hệ thống an toàn, chưa ghi nhận cảnh báo.
                </div>
              ) : (
                alerts.map((alert) => {
                  const isDanger  = alert?.type === 'DANGER';
                  const isWarning = alert?.type === 'WARNING';
                  const bgClass   = isDanger ? 'bg-red-50 border-red-100'    : isWarning ? 'bg-amber-50 border-amber-100'   : 'bg-blue-50 border-blue-100';
                  const textClass = isDanger ? 'text-red-800'                : isWarning ? 'text-amber-800'                 : 'text-blue-800';
                  const descClass = isDanger ? 'text-red-600'                : isWarning ? 'text-amber-700'                 : 'text-blue-700';
                  const emoji     = isDanger ? '🔴'                          : isWarning ? '🟠'                             : '🔵';
                  return (
                    <div key={alert?.id} className={`p-3 border rounded-lg text-xs space-y-1 ${bgClass} ${textClass}`}>
                      <div className="font-bold flex items-center gap-1">{emoji} {alert?.title}</div>
                      <p className={`text-[10px] leading-normal ${descClass}`}>{alert?.description}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
