import React from 'react';
import { 
  Package, Layers, ShieldCheck, Users, Activity, 
  AlertTriangle, Building, ChevronRight, ArrowUpRight, 
  ShieldAlert, Sparkles, QrCode, ClipboardList, Info
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  // Stat Card Component
  const StatCard = ({ label, value, trend, color, bg, icon: Icon, tabId }: any) => (
    <div 
      onClick={() => onNavigate(tabId)}
      className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group flex justify-between items-start"
    >
      <div className="space-y-2">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${trend.startsWith('↑') || trend.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {trend}
          </span>
          <span className="text-[9px] text-slate-400 font-medium">so với tháng trước</span>
        </div>
      </div>
      <div className={`p-2.5 rounded-lg ${color} ${bg} group-hover:scale-105 transition-transform`}>
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

      {/* SECTION 1: KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard label="Tổng sản phẩm" value="1,248" trend="↑ 12.4%" color="text-blue-600" bg="bg-blue-50" icon={Package} tabId="products" />
        <StatCard label="Tổng số lô hàng" value="91" trend="↑ 8.2%" color="text-purple-600" bg="bg-purple-50" icon={Layers} tabId="batches" />
        <StatCard label="Lượt sở hữu" value="1,246" trend="↑ 10.1%" color="text-green-600" bg="bg-green-50" icon={Users} tabId="ownership" />
        <StatCard label="Đang bảo hành" value="844" trend="↑ 4.5%" color="text-blue-600" bg="bg-blue-50" icon={ShieldCheck} tabId="warranty" />
        <StatCard label="Yêu cầu chờ duyệt" value="5" trend="↓ 18%" color="text-amber-600" bg="bg-amber-50" icon={ClipboardList} tabId="warranty" />
        <StatCard label="Đại lý & Kho" value="37" trend="↑ 3%" color="text-slate-700" bg="bg-slate-50" icon={Building} tabId="store" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 2: Health Overview & Circular indicator */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
              <Activity size={16} className="text-blue-500" /> Chỉ số vận hành hệ thống (Operational Health)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="flex items-center gap-4 col-span-2">
                {/* Circular indicator simulation */}
                <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-8 border-slate-100"></div>
                  <div className="absolute inset-0 rounded-full border-8 border-green-500 border-t-transparent border-r-transparent animate-spin-slow"></div>
                  <span className="text-lg font-extrabold text-slate-800">92%</span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    Hệ thống hoạt động Khỏe mạnh (Healthy)
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Quy trình truy xuất nguồn gốc QR và bảo hành điện tử vận hành chính xác. Không ghi nhận lỗi rò rỉ bảo mật dữ liệu hoặc giả mạo mã serial.
                  </p>
                </div>
              </div>

              <div className="border-l border-slate-100 pl-6 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Tỷ lệ kích hoạt BH:</span>
                  <span className="font-bold text-slate-800">84%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Tỷ lệ sản phẩm lỗi:</span>
                  <span className="font-bold text-green-600">0.8% (An toàn)</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section 3: Product Lifecycle Funnel */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Vòng đời và dòng chảy sản phẩm (Lifecycle Flow)</h3>
            
            <div className="grid grid-cols-5 gap-3 pt-2">
              {[
                { step: '1. Sản xuất', val: '15,842', desc: 'Đã hoàn tất NSX', color: 'bg-blue-500 text-blue-500 border-blue-200' },
                { step: '2. Đóng gói', val: '15,200', desc: 'Sẵn sàng mã QR', color: 'bg-indigo-500 text-indigo-500 border-indigo-200' },
                { step: '3. Nhập đại lý', val: '11,240', desc: 'Phân phối phân khu', color: 'bg-purple-500 text-purple-500 border-purple-200' },
                { step: '4. Đã bán lẻ', val: '9,120', desc: 'Khách thanh toán', color: 'bg-green-600 text-green-600 border-green-200' },
                { step: '5. Kích hoạt BH', val: '7,980', desc: 'Sở hữu hợp lệ', color: 'bg-emerald-600 text-emerald-600 border-emerald-200' }
              ].map((funnel, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-lg border text-center space-y-1 bg-white hover:shadow-xs transition-shadow`}
                >
                  <div className="text-[9px] font-bold uppercase text-slate-400">{funnel.step}</div>
                  <div className="text-sm font-bold text-slate-800">{funnel.val}</div>
                  <div className="text-[9px] text-slate-500 leading-normal">{funnel.desc}</div>
                </div>
              ))}
            </div>
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
              <div className="py-3 flex justify-between items-start gap-4">
                <span className="leading-relaxed">Lô hàng <strong className="font-mono text-slate-900">BATCH-2026-KG01</strong> được nhập kho thành công bởi <strong>Nguyễn Kho</strong>. Số lượng: 500 chiếc.</span>
                <span className="text-slate-400 flex-shrink-0">10:15 AM</span>
              </div>
              <div className="py-3 flex justify-between items-start gap-4">
                <span className="leading-relaxed">Đăng ký quyền sở hữu mới thành công cho thiết bị <strong>Máy lọc nước RO Kangaroo VT3</strong> bởi khách hàng <strong>Nguyễn Văn A</strong>.</span>
                <span className="text-slate-400 flex-shrink-0">09:45 AM</span>
              </div>
              <div className="py-3 flex justify-between items-start gap-4">
                <span className="leading-relaxed">Kích hoạt bảo hành điện tử chính hãng <strong className="font-mono text-slate-900">WAR-JA-321104</strong> cho dự án hộ gia đình hòa lưới (Trần Thị B).</span>
                <span className="text-slate-400 flex-shrink-0">09:15 AM</span>
              </div>
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
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-800 space-y-1">
                <div className="font-bold flex items-center gap-1">🔴 Phát hiện lô sản phẩm hết hạn</div>
                <p className="text-[10px] text-red-600 leading-normal">Lô hàng BATCH-2026-SP12 (Sơn Spec) đã hết hạn sử dụng. Yêu cầu khóa mã QR.</p>
              </div>

              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-800 space-y-1">
                <div className="font-bold flex items-center gap-1">🔴 Cảnh báo đăng nhập bất thường</div>
                <p className="text-[10px] text-red-600 leading-normal">Nhận diện 3 lượt đăng nhập sai mật khẩu liên tiếp từ IP lạ ngoài lãnh thổ.</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1">🟠 Cảnh báo tồn kho dưới mức an toàn</div>
                <p className="text-[10px] text-amber-700 leading-normal">Máy lọc nước tại Showroom Cầu Giấy hiện còn dưới 15 chiếc.</p>
              </div>
            </div>
          </div>

          {/* Warranty intelligence insights */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-blue-500" /> Insight & Tối ưu hóa
            </h3>
            
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">💡 Khuyến nghị thu hồi</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tỷ lệ lỗi báo cáo của <strong>Thiết bị gia dụng</strong> đạt 1.4%. Khuyến nghị kiểm tra khâu đóng gói vận chuyển của lô hàng BATCH-2026-KG01.
              </p>
            </div>
            
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">📈 Thị phần sở hữu</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Số lượng đăng ký sở hữu mới tăng mạnh 10.1% ở khu vực TP. Hà Nội, tập trung tại Showroom Cầu Giấy.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
