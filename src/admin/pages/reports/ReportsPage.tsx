import React, { useState } from 'react';
import { 
  BarChart2, FileText, Calendar, Download, RefreshCw, AlertCircle, 
  TrendingUp, Layers, ShieldCheck, QrCode, ArrowUpRight, HelpCircle, Activity, Globe
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function ReportsPage({ onNavigate }: { onNavigate: (tabId: string) => void }) {
  const [demoState, setDemoState] = useState<'NORMAL' | 'LOADING' | 'EMPTY' | 'ERROR'>('NORMAL');
  const [reportRange, setReportRange] = useState('30days');

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 h-24"></div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6 animate-pulse">
        <div className="col-span-2 bg-white rounded-xl border border-slate-100 h-80"></div>
        <div className="bg-white rounded-xl border border-slate-100 h-80"></div>
      </div>
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
            System Reports & Analytics
            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-semibold uppercase">
              Role: Admin / Manager
            </span>
          </h1>
          <p className="text-sm text-slate-500">
            Xem báo cáo tổng hợp vòng đời sản phẩm, quét QR truy xuất nguồn gốc và khiếu nại bảo hành điện tử.
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <select 
            value={reportRange} 
            onChange={e => setReportRange(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl text-xs py-2 px-3 focus:outline-none"
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="90days">Quý này</option>
            <option value="year">Năm nay</option>
          </select>
          <button 
            onClick={() => {
              // Simulate export
              alert('Báo cáo đang được kết xuất thành file Excel. Vui lòng đợi trong giây lát!');
            }}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 bg-white flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {demoState === 'ERROR' ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto mt-12">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Không thể tải báo cáo</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">Đã xảy ra lỗi khi tạo bảng thống kê và biểu đồ.</p>
          <Button onClick={() => setDemoState('NORMAL')} className="mt-6 rounded-xl px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Thử lại</Button>
        </Card>
      ) : demoState === 'LOADING' ? (
        renderSkeleton()
      ) : demoState === 'EMPTY' ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center max-w-xl mx-auto mt-12">
          <BarChart2 size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900">Chưa có dữ liệu thống kê</h3>
          <p className="text-slate-500 text-sm max-w-sm mt-1">Dữ liệu hệ thống trong khoảng thời gian được chọn đang để trống.</p>
          <Button onClick={() => setReportRange('30days')} className="mt-6 bg-blue-600 text-white rounded-xl px-4 py-2 font-semibold hover:bg-blue-700 cursor-pointer">Chọn 30 ngày qua</Button>
        </Card>
      ) : (
        <>
          {/* Section 1: KPI Stats */}
          <div className="grid grid-cols-4 gap-6">
            {[
              { label: 'Sản phẩm đã bán', value: '45,210', diff: '+12.4%', up: true, desc: 'Tăng so với tháng trước', icon: Layers, color: 'text-blue-600 bg-blue-50' },
              { label: 'Lượt quét QR truy xuất', value: '189,450', diff: '+28.1%', up: true, desc: 'Lượng truy cập thông tin', icon: QrCode, color: 'text-green-600 bg-green-50' },
              { label: 'Yêu cầu bảo hành', value: '142', diff: '-4.2%', up: false, desc: 'Tỷ lệ lỗi giảm', icon: ShieldCheck, color: 'text-amber-600 bg-amber-50' },
              { label: 'Đại lý hoạt động', value: '38', diff: '+2', up: true, desc: 'Mới gia nhập tháng này', icon: Globe, color: 'text-purple-600 bg-purple-50' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-start">
                <div className="space-y-2">
                  <span className="text-xs text-slate-500 font-semibold uppercase">{stat.label}</span>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${stat.up ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {stat.diff}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{stat.desc}</span>
                  </div>
                </div>
                <div className={`p-2.5 rounded-lg ${stat.color}`}>
                  <stat.icon size={18} />
                </div>
              </div>
            ))}
          </div>

          {/* Section 2: Charts Area */}
          <div className="grid grid-cols-3 gap-6">
            
            {/* Chart 1: Production vs Sales */}
            <Card className="col-span-2 space-y-4">
              <div className="flex justify-between items-center pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Biểu đồ Lượng sản xuất & Doanh số phân phối</h3>
                  <p className="text-[11px] text-slate-400">Đơn vị tính: Nghìn sản phẩm</p>
                </div>
                <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <TrendingUp size={12} /> Sản xuất tăng đều
                </span>
              </div>

              {/* Simulated Bar Chart */}
              <div className="h-64 flex items-end justify-between pt-8 px-2 border-b border-l border-slate-100 relative">
                {/* Y-axis labels */}
                <div className="absolute left-2 top-0 text-[10px] text-slate-400">50K</div>
                <div className="absolute left-2 top-16 text-[10px] text-slate-400">35K</div>
                <div className="absolute left-2 top-32 text-[10px] text-slate-400">20K</div>
                <div className="absolute left-2 top-48 text-[10px] text-slate-400">5K</div>

                {/* Bars representing Jan-Jun */}
                {[
                  { month: 'Tháng 1', prod: 75, sale: 62 },
                  { month: 'Tháng 2', prod: 85, sale: 70 },
                  { month: 'Tháng 3', prod: 95, sale: 82 },
                  { month: 'Tháng 4', prod: 110, sale: 95 },
                  { month: 'Tháng 5', prod: 130, sale: 115 },
                  { month: 'Tháng 6', prod: 145, sale: 128 },
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                    <div className="flex gap-1 items-end w-full justify-center max-w-[60px]">
                      {/* Production Bar (Blue) */}
                      <div 
                        className="w-4 bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all relative"
                        style={{ height: `${bar.prod * 1.2}px` }}
                      >
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          NSX: {bar.prod}K
                        </span>
                      </div>
                      {/* Sales Bar (Green) */}
                      <div 
                        className="w-4 bg-green-500 rounded-t-sm hover:bg-green-600 transition-all relative"
                        style={{ height: `${bar.sale * 1.2}px` }}
                      >
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          Bán: {bar.sale}K
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{bar.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-6 text-[10px] font-bold text-slate-500 pt-2">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-xs"></span> Số lượng sản xuất</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-green-500 rounded-xs"></span> Số lượng phân phối bán ra</span>
              </div>
            </Card>

            {/* Chart 2: Category distribution */}
            <Card className="space-y-4">
              <div className="flex justify-between items-center pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Tỷ lệ Lỗi Bảo Hành</h3>
                  <p className="text-[11px] text-slate-400">Phân theo danh mục sản phẩm</p>
                </div>
              </div>

              {/* Progress list representing category failure rates */}
              <div className="space-y-4 pt-4">
                {[
                  { name: 'Thiết bị điện tử', rate: '0.8%', count: 42, color: 'bg-blue-500' },
                  { name: 'Thiết bị gia dụng', rate: '1.4%', count: 68, color: 'bg-green-500' },
                  { name: 'Vật liệu xây dựng', rate: '0.2%', count: 12, color: 'bg-purple-500' },
                  { name: 'Dược & Thực phẩm chức năng', rate: '0.1%', count: 5, color: 'bg-amber-500' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{item.name}</span>
                      <span>{item.count} ca ({item.rate})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${parseFloat(item.rate) * 50}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mt-4 flex gap-2">
                <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={14} />
                <p className="text-[10px] text-amber-700 leading-normal">
                  Chỉ số lỗi của <strong>Thiết bị gia dụng</strong> tăng nhẹ 0.2% trong tuần này. Bộ phận CSKH cần theo dõi quy trình thu hồi ở lô hàng gần nhất.
                </p>
              </div>
            </Card>

          </div>

          {/* Section 3: Detailed Report List */}
          <Card className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Hoạt động quét QR & Bảo hành gần nhất</h3>
                <p className="text-[11px] text-slate-400">Các sự kiện thực tế trong vòng 24 giờ qua</p>
              </div>
              <button 
                onClick={() => onNavigate('audit')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
              >
                Nhật ký chi tiết <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {[
                { time: '10:45', action: 'Quét QR xác thực', detail: 'Sản phẩm Máy lọc nước RO Kangaroo VT3 (SN-KG-889021) được quét tại Quận Cầu Giấy, Hà Nội.', status: 'SUCCESS' },
                { time: '09:30', action: 'Kích hoạt bảo hành điện tử', detail: 'Hợp đồng bảo hành WAR-JA-321104 kích hoạt thành công bởi Trần Thị B.', status: 'SUCCESS' },
                { time: '08:15', action: 'Tạo phiếu yêu cầu bảo hành', detail: 'Khách hàng Lê Hoàng C tạo khiếu nại bảo hành cho sơn chống thấm Spec.', status: 'PENDING' },
                { time: 'Hôm qua', action: 'Chuyển nhượng quyền sở hữu', detail: 'Sản phẩm SN-SP-400981 chuyển nhượng thành công từ Nguyễn Văn A sang Lê Hoàng C.', status: 'SUCCESS' }
              ].map((act, i) => (
                <div key={i} className="py-3.5 flex items-start gap-4 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                  <div className="text-xs font-semibold text-slate-400 w-16 pt-0.5">{act.time}</div>
                  <div className="flex-1 space-y-1">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      {act.action}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        act.status === 'SUCCESS' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                      }`}>{act.status === 'SUCCESS' ? 'Hoàn tất' : 'Chờ xử lý'}</span>
                    </div>
                    <div className="text-xs text-slate-500 leading-relaxed">{act.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

    </div>
  );
}
