import React, { useState, useEffect } from 'react';
import { 
  Package, Layers, ShieldCheck, Users, Activity, 
  AlertTriangle, Building, ChevronRight, ArrowUpRight, 
  ShieldAlert, Sparkles, QrCode, ClipboardList, Info
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { dashboardService, DashboardStats, DashboardActivity, DashboardAlert, DashboardChartItem } from '../../services/dashboardService';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [chartData, setChartData] = useState<DashboardChartItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('[Dashboard] Lỗi khi tải thống kê:', err);
      setError(err.response?.data?.message || err.message || 'Đã xảy ra lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    setActivitiesLoading(true);
    try {
      const data = await dashboardService.getActivities(10);
      setActivities(data);
    } catch (err: any) {
      console.error('[Dashboard] Lỗi khi tải nhật ký hoạt động:', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchAlerts = async () => {
    setAlertsLoading(true);
    try {
      const data = await dashboardService.getAlerts();
      setAlerts(data);
    } catch (err: any) {
      console.error('[Dashboard] Lỗi khi tải cảnh báo:', err);
    } finally {
      setAlertsLoading(false);
    }
  };

  const fetchChartData = async () => {
    setChartLoading(true);
    try {
      const data = await dashboardService.getChartData();
      setChartData(data);
    } catch (err: any) {
      console.error('[Dashboard] Lỗi khi tải dữ liệu biểu đồ:', err);
    } finally {
      setChartLoading(false);
    }
  };

  const fetchAllData = () => {
    fetchStats();
    fetchActivities();
    fetchAlerts();
    fetchChartData();
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatPeriod = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return `Tháng ${date.getMonth() + 1}`;
    } catch {
      return '';
    }
  };

  const getStatValue = (val: number | undefined | null, fallback: string) => {
    if (val === undefined || val === null) return fallback;
    return val.toLocaleString();
  };

  // Stat Card Component
  const StatCard = ({ label, value, trend, color, bg, icon: Icon, tabId, loading }: any) => (
    <div 
      onClick={() => onNavigate(tabId)}
      className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group flex justify-between items-start"
    >
      <div className="space-y-2 w-full">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
        {loading ? (
          <div className="h-8 w-16 bg-slate-100 animate-pulse rounded"></div>
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Chào mừng quay trở lại, Admin User! <Sparkles className="text-blue-500" size={18} />
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Hệ thống **ProductTrace-AI** đang hoạt động ổn định. Dưới đây là tình trạng tổng quan vòng đời sản phẩm, số lượng phân phối, đăng ký quyền sở hữu và bảo hành điện tử của doanh nghiệp.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center justify-center pointer-events-none pr-12">
          <Activity size={180} className="text-blue-600" />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={16} />
            <span>Lỗi tải dữ liệu từ backend: <strong>{error}</strong>. Đang hiển thị số liệu mặc định.</span>
          </div>
          <button 
            onClick={fetchStats} 
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-semibold rounded-lg transition-colors border-none cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* SECTION 1: KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard 
          label="Tổng sản phẩm" 
          value={getStatValue(stats?.total_products, "1,248")} 
          trend="↑ 12.4%" 
          color="text-blue-600" 
          bg="bg-blue-50" 
          icon={Package} 
          tabId="products" 
          loading={loading}
        />
        <StatCard 
          label="Tổng số lô hàng" 
          value={getStatValue(stats?.total_batches, "91")} 
          trend="↑ 8.2%" 
          color="text-purple-600" 
          bg="bg-purple-50" 
          icon={Layers} 
          tabId="batches" 
          loading={loading}
        />
        <StatCard 
          label="Lượt sở hữu" 
          value={getStatValue(stats?.total_ownerships, "1,246")} 
          trend="↑ 10.1%" 
          color="text-green-600" 
          bg="bg-green-50" 
          icon={Users} 
          tabId="ownership" 
          loading={loading}
        />
        <StatCard 
          label="Đang bảo hành" 
          value={getStatValue(stats?.total_under_warranty, "844")} 
          trend="↑ 4.5%" 
          color="text-blue-600" 
          bg="bg-blue-50" 
          icon={ShieldCheck} 
          tabId="warranty" 
          loading={loading}
        />
        <StatCard 
          label="Yêu cầu chờ duyệt" 
          value={getStatValue(stats?.total_pending_approval, "5")} 
          trend="↓ 18%" 
          color="text-amber-600" 
          bg="bg-amber-50" 
          icon={ClipboardList} 
          tabId="warranty" 
          loading={loading}
        />
        <StatCard 
          label="Đại lý & Kho" 
          value={getStatValue(stats?.total_locations, "37")} 
          trend="↑ 3%" 
          color="text-slate-700" 
          bg="bg-slate-50" 
          icon={Building} 
          tabId="store" 
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Production vs Sales Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity size={16} className="text-blue-500" /> Biểu đồ Lượng sản xuất & Doanh số phân phối
                </h3>
                <p className="text-[10px] text-slate-400">Đơn vị tính: Nghìn sản phẩm (K)</p>
              </div>
              <div className="flex gap-4 text-[9px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-blue-500 rounded-xs"></span> Sản xuất
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-xs"></span> Tiêu thụ
                </span>
              </div>
            </div>

            {chartLoading ? (
              <div className="h-64 bg-slate-50/50 rounded-xl flex flex-col items-center justify-center gap-2 border border-slate-100">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] text-slate-400 font-semibold">Đang tải dữ liệu biểu đồ...</span>
              </div>
            ) : (
              <div>
                <div className="h-64 flex items-end justify-between pt-6 pb-2 pr-4 ml-12 border-b border-l border-slate-200 relative mt-4">
                  {/* Grid lines and Y-axis labels */}
                  {(() => {
                    const displayedChartData = Array.isArray(chartData) && chartData.length > 0 ? chartData : [
                      { time_period: '2025-01-01T00:00:00Z', production_volume: 45.2, sales_volume: 38.1 },
                      { time_period: '2025-02-01T00:00:00Z', production_volume: 50.0, sales_volume: 42.5 },
                      { time_period: '2025-03-01T00:00:00Z', production_volume: 55.4, sales_volume: 48.0 },
                      { time_period: '2025-04-01T00:00:00Z', production_volume: 62.1, sales_volume: 54.3 },
                      { time_period: '2025-05-01T00:00:00Z', production_volume: 68.5, sales_volume: 60.1 },
                      { time_period: '2025-06-01T00:00:00Z', production_volume: 75.0, sales_volume: 66.8 }
                    ];

                    const maxVal = Math.max(
                      ...displayedChartData.map(d => Math.max(d.production_volume || 0, d.sales_volume || 0)),
                      10
                    );

                    return (
                      <>
                        {Array.from({ length: 4 }).map((_, idx) => {
                          const val = Math.round((maxVal / 3) * (3 - idx));
                          const bottomPercent = ((3 - idx) / 3) * 100;
                          return (
                            <React.Fragment key={idx}>
                              {/* Grid line */}
                              <div 
                                className="absolute left-0 right-0 border-t border-slate-100 border-dashed pointer-events-none"
                                style={{ bottom: `${bottomPercent}%` }}
                              />
                              {/* Y label */}
                              <div 
                                className="absolute -left-12 text-[8px] text-slate-400 font-mono font-bold w-10 text-right -translate-y-1/2"
                                style={{ bottom: `${bottomPercent}%` }}
                              >
                                {val}K
                              </div>
                            </React.Fragment>
                          );
                        })}

                        {/* Bars representing each period */}
                        {displayedChartData.map((item, idx) => {
                          const prodPercent = ((item.production_volume || 0) / maxVal) * 85;
                          const salesPercent = ((item.sales_volume || 0) / maxVal) * 85;
                          return (
                            <div key={idx} className="flex flex-col items-center gap-2 flex-1 group z-10">
                              <div className="flex gap-1 items-end w-full justify-center max-w-[64px] h-full relative">
                                {/* Production Bar (Blue) */}
                                <div 
                                  className="w-3 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xs hover:from-blue-500 hover:to-blue-300 transition-all relative group/bar cursor-pointer"
                                  style={{ height: `${prodPercent}%` }}
                                >
                                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none font-bold">
                                    NSX: {item.production_volume}K
                                  </div>
                                </div>
                                {/* Sales Bar (Green) */}
                                <div 
                                  className="w-3 bg-gradient-to-t from-green-600 to-green-400 rounded-t-xs hover:from-green-500 hover:to-green-300 transition-all relative group/bar2 cursor-pointer"
                                  style={{ height: `${salesPercent}%` }}
                                >
                                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow-lg opacity-0 group-hover/bar2:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none font-bold">
                                    Bán: {item.sales_volume}K
                                  </div>
                                </div>
                              </div>
                              <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">
                                {formatPeriod(item.time_period)}
                              </span>
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Recent Activity Stream */}
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
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded w-12"></div>
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

        {/* Sidebar Panel */}
        <div className="space-y-6">
          
          {/* Critical Alerts & Risks */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldAlert size={16} className="text-red-500" /> Cảnh báo & Rủi ro
            </h3>

            <div className="space-y-3">
              {alertsLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-lg animate-pulse space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                  </div>
                ))
              ) : alerts.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  🟢 Hệ thống an toàn, chưa ghi nhận cảnh báo.
                </div>
              ) : (
                alerts.map((alert) => {
                  const isDanger = alert?.type === 'DANGER';
                  const isWarning = alert?.type === 'WARNING';
                  const bgClass = isDanger ? 'bg-red-50 border-red-100' : isWarning ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100';
                  const textClass = isDanger ? 'text-red-800' : isWarning ? 'text-amber-800' : 'text-blue-800';
                  const descClass = isDanger ? 'text-red-600' : isWarning ? 'text-amber-700' : 'text-blue-700';
                  const emoji = isDanger ? '🔴' : isWarning ? '🟠' : '🔵';
                  return (
                    <div key={alert?.id} className={`p-3 border rounded-lg text-xs space-y-1 ${bgClass} ${textClass}`}>
                      <div className="font-bold flex items-center gap-1">
                        {emoji} {alert?.title}
                      </div>
                      <p className={`text-[10px] leading-normal ${descClass}`}>
                        {alert?.description}
                      </p>
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
