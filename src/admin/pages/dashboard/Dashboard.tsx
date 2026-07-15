import React, { useState, useMemo } from 'react';
import {
  Package, Layers, ShieldCheck, Users, Activity,
  AlertTriangle, Building, ClipboardList, ShieldAlert, Sparkles,
  Plus, ArrowRight, CheckCircle2, AlertCircle, Info
} from 'lucide-react';
import Button from '../../components/ui/Button';
import {
  useDashboardStats,
  useDashboardActivities,
  useDashboardAlerts,
  useDashboardCharts,
} from '../../../features/dashboard/hooks/useDashboardStats';
import { parseApiError } from '../../../api/axios';

const cleanVietnameseEncoding = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/M\?\?y t\?\?nh b\?\?ng/g, 'Máy tính bảng')
    .replace(/Kho Trung T\?\?m Th\?\?/g, 'Kho Trung Tâm Thủ Đức')
    .replace(/Kho Trung T\?\?m/g, 'Kho Trung Tâm')
    .replace(/Kho H\?\? N\?\?i/g, 'Kho Hà Nội')
    .replace(/Trung T\?\?m Th\?\?/g, 'Trung Tâm Thủ Đức')
    .replace(/Trung T\?\?m/g, 'Trung Tâm')
    .replace(/c\?\?nh b\?\?o t\?\?n kho d\?\?\?\?i m\?\?\?\?c an to\?\?n/gi, 'cảnh báo tồn kho dưới mức an toàn')
    .replace(/c\?\?nh b\?\?o/gi, 'cảnh báo')
    .replace(/t\?\?n kho d\?\?\?\?i m\?\?\?\?c an to\?\?n/gi, 'tồn kho dưới mức an toàn')
    .replace(/hi\?\?n c\?\?n d\?\?\?\?i 15 chi\?\?c/g, 'hiện còn dưới 15 chiếc')
    .replace(/T\?\?n th\?\?c t\?\?:/g, 'Tồn thực tế:')
    .replace(/chi\?\?c\)/g, 'chiếc)')
    .replace(/L\?\? h\?\?ng/g, 'Lô hàng')
    .replace(/đ\?\? h\?\?t h\?\?n/g, 'đã hết hạn')
    .replace(/s\?\? d\?\?ng/g, 'sử dụng')
    .replace(/Y\?\?u c\?\?u kh\?\?a m\?\? QR/g, 'Yêu cầu khóa mã QR')
    .replace(/đ\?\?ng g\?\?i/g, 'đóng gói')
    .replace(/s\?\?n xu\?\?t/g, 'sản xuất')
    .replace(/nh\?\?p kho/g, 'nhập kho')
    .replace(/th\?\?nh c\?\?ng/g, 'thành công')
    .replace(/b\?\?i kh\?\?ch h\?\?ng/g, 'bởi khách hàng')
    .replace(/b\?\?i/g, 'bởi')
    .replace(/thi\?\?t b\?\?/g, 'thiết bị')
    .replace(/K\?\?ch ho\?\?t b\?\?o h\?\?nh/g, 'Kích hoạt bảo hành')
    .replace(/đi\?\?n t\?\? ch\?\?nh h\?\?ng/g, 'điện tử chính hãng')
    .replace(/Ph\?\?t hi\?\?n l\?\? s\?\?n ph\?\?m h\?\?t h\?\?n/g, 'Phát hiện lô sản phẩm hết hạn')
    .replace(/T\?\?\.HCM/g, 'TP.HCM')
    .replace(/đ\?\?/g, 'đã');
};

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();
  const { data: activities = [], isLoading: activitiesLoading } = useDashboardActivities(10);
  const { data: alerts = [], isLoading: alertsLoading } = useDashboardAlerts();
  const { data: chartData = [], isLoading: chartLoading } = useDashboardCharts();

  const [activeAlertTab, setActiveAlertTab] = useState<'ALL' | 'DANGER' | 'WARNING' | 'INFO'>('ALL');

  // Filter alerts by priority level
  const alertsGroup = useMemo(() => {
    return {
      ALL: alerts,
      DANGER: alerts.filter(a => a?.type === 'DANGER'),
      WARNING: alerts.filter(a => a?.type === 'WARNING'),
      INFO: alerts.filter(a => a?.type === 'INFO'),
    };
  }, [alerts]);

  const activeAlertsList = alertsGroup[activeAlertTab] || [];

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

  const StatCard = ({ label, value, trend, color, bg, icon: Icon, tabId }: any) => {
    const isUp = trend.startsWith('↑') || trend.startsWith('+');
    return (
      <div
        onClick={() => onNavigate(tabId)}
        className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between h-[130px] relative overflow-hidden shadow-xs hover:-translate-y-0.5"
      >
        <div className="flex justify-between items-start">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">{label}</p>
          <div className={`p-2 rounded-xl ${color} ${bg} group-hover:scale-110 transition-transform duration-300 flex-shrink-0 shadow-3xs`}>
            <Icon size={16} />
          </div>
        </div>
        <div className="mt-2">
          {isLoading ? (
            <div className="h-7 w-20 bg-slate-100 animate-pulse rounded" />
          ) : (
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
          )}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
              isUp ? 'bg-emerald-50 text-emerald-705 border-emerald-100' : 'bg-rose-50 text-rose-705 border-rose-100'
            }`}>
              {trend}
            </span>
            <span className="text-[9px] text-slate-400 font-semibold">so với tháng trước</span>
          </div>
        </div>
      </div>
    );
  };

  const SkeletonCard = () => (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse flex flex-col justify-between h-[130px]">
      <div className="flex justify-between items-start">
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="w-8 h-8 bg-slate-200 rounded-xl" />
      </div>
      <div className="space-y-2 mt-4">
        <div className="h-6 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-5/6" />
      </div>
    </div>
  );

  // ── Error state ─────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <AlertTriangle className="text-red-500 w-12 h-12 animate-bounce" />
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
          <LoaderSpinner />
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
      <div className="flex gap-2 items-stretch mt-4">
        {/* Y-axis */}
        <div
          className="flex flex-col justify-between items-end pr-3 pb-6 min-w-[40px]"
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
          className="flex-1 border-b border-l border-slate-200/60 relative overflow-x-auto scrollbar-thin pb-4"
          style={{ height: CHART_H + 40 }}
        >
          {/* Scrollable Container with dynamic minWidth */}
          <div 
            className="relative h-full"
            style={{ minWidth: `${Math.max(500, chartData.length * 45)}px` }}
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
              className="absolute inset-0 pb-6 grid items-end gap-4 px-4"
              style={{ gridTemplateColumns: `repeat(${chartData.length}, 1fr)` }}
            >
              {chartData.map((item, idx) => {
                const prodH = Math.max(((item.production_volume || 0) / maxVal) * (CHART_H - 24), 0);
                const salesH = Math.max(((item.sales_volume || 0) / maxVal) * (CHART_H - 24), 0);
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                    <div className="flex gap-1.5 items-end justify-center w-full max-w-[60px] mx-auto">
                      {/* Production bar (blue) */}
                      {prodH > 0 ? (
                        <div className="relative group/prod flex-1" style={{ height: `${prodH}px` }}>
                          <div className="w-full h-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md cursor-pointer hover:from-blue-500 hover:to-blue-350 transition-all duration-250 shadow-3xs" />
                          <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2.5 py-1 rounded shadow-md opacity-0 group-hover/prod:opacity-100 transition-opacity duration-150 whitespace-nowrap z-25 pointer-events-none font-bold">
                            NSX: {item.production_volume.toLocaleString()}
                          </div>
                        </div>
                      ) : <div className="flex-1" />}
                      {/* Sales bar (green) */}
                      {salesH > 0 ? (
                        <div className="relative group/sales flex-1" style={{ height: `${salesH}px` }}>
                          <div className="w-full h-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md cursor-pointer hover:from-emerald-500 hover:to-emerald-350 transition-all duration-250 shadow-3xs" />
                          <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2.5 py-1 rounded shadow-md opacity-0 group-hover/sales:opacity-100 transition-opacity duration-150 whitespace-nowrap z-25 pointer-events-none font-bold">
                            Bán: {item.sales_volume.toLocaleString()}
                          </div>
                        </div>
                      ) : <div className="flex-1" />}
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap leading-none mt-1">
                      {formatPeriod(item.time_period)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-white to-slate-50 p-6 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
            Chào mừng quay trở lại, Admin! <Sparkles className="text-blue-500 animate-pulse" size={18} />
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Hệ thống ProductTrace-AI đang hoạt động ổn định. Dưới đây là tình trạng tổng quan vòng đời sản phẩm, số lượng phân phối, đăng ký quyền sở hữu và bảo hành điện tử.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 opacity-[0.03] flex items-center justify-center pointer-events-none pr-12">
          <Activity size={180} className="text-blue-600 animate-pulse" />
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Activity size={16} className="text-blue-500" /> Thao tác nhanh
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('products')}
            className="flex items-center justify-between p-4 bg-blue-50/40 hover:bg-blue-50 border border-blue-100 hover:border-blue-300 rounded-xl transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl group-hover:scale-105 transition-transform shadow-2xs">
                <Plus size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Thêm sản phẩm</h4>
                <p className="text-[10px] text-slate-400">Đăng ký sản phẩm mới</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('batches')}
            className="flex items-center justify-between p-4 bg-purple-50/40 hover:bg-purple-50 border border-purple-100 hover:border-purple-300 rounded-xl transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-600 text-white rounded-xl group-hover:scale-105 transition-transform shadow-2xs">
                <Layers size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Tạo lô hàng</h4>
                <p className="text-[10px] text-slate-400">Nhập lô hàng sản xuất</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('ownership')}
            className="flex items-center justify-between p-4 bg-emerald-50/40 hover:bg-emerald-50 border border-emerald-100 hover:border-emerald-300 rounded-xl transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl group-hover:scale-105 transition-transform shadow-2xs">
                <Users size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Cấp sở hữu</h4>
                <p className="text-[10px] text-slate-400">Đăng ký khách sở hữu</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('warranty')}
            className="flex items-center justify-between p-4 bg-amber-50/40 hover:bg-amber-50 border border-amber-100 hover:border-amber-300 rounded-xl transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-600 text-white rounded-xl group-hover:scale-105 transition-transform shadow-2xs">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Duyệt bảo hành</h4>
                <p className="text-[10px] text-slate-400">Kiểm tra yêu cầu chờ duyệt</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard label="Tổng sản phẩm" value={stats?.total_products.toLocaleString() ?? '0'} trend="↑ 12.4%" color="text-blue-600" bg="bg-blue-50" icon={Package} tabId="products" />
          <StatCard label="Tổng số lô hàng" value={stats?.total_batches.toLocaleString() ?? '0'} trend="↑ 8.2%" color="text-purple-600" bg="bg-purple-50" icon={Layers} tabId="batches" />
          <StatCard label="Lượt sở hữu" value={stats?.total_ownerships.toLocaleString() ?? '0'} trend="↑ 10.1%" color="text-emerald-600" bg="bg-emerald-50" icon={Users} tabId="ownership" />
          <StatCard label="Đang bảo hành" value={stats?.total_under_warranty.toLocaleString() ?? '0'} trend="↑ 4.5%" color="text-blue-600" bg="bg-blue-50" icon={ShieldCheck} tabId="warranty" />
          <StatCard label="Yêu cầu chờ duyệt" value={stats?.total_pending_approval.toLocaleString() ?? '0'} trend="↓ 18%" color="text-amber-600" bg="bg-amber-50" icon={ClipboardList} tabId="warranty" />
          <StatCard label="Đại lý & Kho" value={stats?.total_locations.toLocaleString() ?? '0'} trend="↑ 3%" color="text-slate-700" bg="bg-slate-50" icon={Building} tabId="store" />
        </div>
      )}

      {/* Main grid: chart+activities | alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity size={16} className="text-blue-500" /> Biểu đồ Sản xuất & Tiêu thụ
                </h3>
                <p className="text-[9px] text-slate-400 font-medium">Đơn vị tính: Sản phẩm</p>
              </div>
              <div className="flex gap-3 text-[9px] font-bold text-slate-500 bg-slate-50/80 px-3 py-1.5 rounded-lg border border-slate-100">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" /> Sản xuất</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Tiêu thụ</span>
              </div>
            </div>

            {renderChart()}
          </div>

          {/* Activities Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Nhật ký hoạt động hôm nay</h3>
              <button
                onClick={() => onNavigate('audit')}
                className="text-[11px] font-bold text-blue-650 hover:underline bg-transparent border-none cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>
            
            {/* Visual Vertical Timeline */}
            <div className="relative pl-6 border-l border-slate-150 text-xs text-slate-700 space-y-5 py-2">
              {activitiesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="relative animate-pulse flex justify-between gap-4">
                    <div className="absolute -left-[30px] w-2 h-2 rounded-full bg-slate-200 mt-1.5" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-12" />
                  </div>
                ))
              ) : activities.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-6">
                  Không có hoạt động nào ghi nhận trong hôm nay.
                </div>
              ) : (
                activities.map((act) => (
                  <div key={act?.id} className="relative flex justify-between items-start gap-4 group">
                    {/* Circle timeline dot marker */}
                    <div className="absolute -left-[30px] w-2.5 h-2.5 rounded-full bg-blue-500 border border-white group-hover:scale-125 transition-transform duration-200 mt-1.5" />
                    
                    <span className="leading-relaxed text-slate-650">
                      {act?.title && (
                        <span className="font-bold text-slate-800">{cleanVietnameseEncoding(act.title)} — </span>
                      )}
                      {cleanVietnameseEncoding(act?.description)}
                    </span>
                    <span className="text-slate-400 flex-shrink-0 font-mono text-[10px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                      {act?.created_at ? formatTime(act.created_at) : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right column — Tabbed Warning Panel */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldAlert size={16} className="text-red-500" /> Cảnh báo & Rủi ro
              </h3>
            </div>

            {/* Category tabs control */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl text-[10px] font-bold">
              {(['ALL', 'DANGER', 'WARNING', 'INFO'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveAlertTab(t)}
                  className={`flex-1 py-1.5 rounded-lg transition-all border-none cursor-pointer text-center ${
                    activeAlertTab === t 
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t === 'ALL' && `Tất cả (${alerts.length})`}
                  {t === 'DANGER' && `Nguy cấp (${alertsGroup.DANGER.length})`}
                  {t === 'WARNING' && `Cảnh báo (${alertsGroup.WARNING.length})`}
                  {t === 'INFO' && `Thông tin (${alertsGroup.INFO.length})`}
                </button>
              ))}
            </div>

            {/* Grouped alerts lists */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {alertsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-105 rounded-xl animate-pulse space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-5/6" />
                  </div>
                ))
              ) : activeAlertsList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  🟢 Không có cảnh báo thuộc nhóm này.
                </div>
              ) : (
                activeAlertsList.map((alert) => {
                  const isDanger = alert?.type === 'DANGER';
                  const isWarning = alert?.type === 'WARNING';
                  const bgClass = isDanger 
                    ? 'bg-rose-50/50 border-rose-100' 
                    : isWarning 
                      ? 'bg-amber-50/50 border-amber-100' 
                      : 'bg-blue-50/50 border-blue-105';
                  const textClass = isDanger ? 'text-rose-950' : isWarning ? 'text-amber-950' : 'text-blue-950';
                  const descClass = isDanger ? 'text-rose-800' : isWarning ? 'text-amber-800' : 'text-blue-800';
                  
                  return (
                    <div 
                      key={alert?.id} 
                      className={`p-4 border rounded-xl text-xs space-y-1.5 transition-all hover:shadow-2xs break-words whitespace-pre-wrap ${bgClass} ${textClass}`}
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        {isDanger && <AlertCircle size={14} className="text-rose-550 flex-shrink-0" />}
                        {isWarning && <AlertTriangle size={14} className="text-amber-550 flex-shrink-0" />}
                        {!isDanger && !isWarning && <Info size={14} className="text-blue-550 flex-shrink-0" />}
                        <span>{cleanVietnameseEncoding(alert?.title)}</span>
                      </div>
                      <p className={`text-[10px] leading-relaxed font-medium ${descClass}`}>{cleanVietnameseEncoding(alert?.description)}</p>
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

function LoaderSpinner() {
  return (
    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  );
}
