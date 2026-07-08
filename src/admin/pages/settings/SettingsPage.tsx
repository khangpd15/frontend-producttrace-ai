import React, { useState } from 'react';
import { 
  User, Shield, Building, Settings, HelpCircle, Save, Bell, 
  Globe, AlertCircle, RefreshCw, CheckCircle, Info, Lock
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function SettingsPage({ onNavigate }: { onNavigate: (tabId: string) => void }) {
  const [demoState, setDemoState] = useState<'NORMAL' | 'LOADING' | 'ERROR'>('NORMAL');
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'SECURITY' | 'ORGANIZATION' | 'SYSTEM'>('PROFILE');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profile Form States
  const [profile, setProfile] = useState({
    fullName: 'Admin User',
    email: 'admin@producttrace.vn',
    phone: '0988.123.456',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&h=128'
  });

  // Security States
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Org states
  const [org, setOrg] = useState({
    companyName: 'Công ty Cổ phần Công nghệ ProductTrace Việt Nam',
    taxCode: '0109923812',
    address: 'Tầng 12, Tòa nhà Keangnam Landmark 72, Mễ Trì, Nam Từ Liêm, Hà Nội',
    website: 'https://producttrace.vn'
  });

  // System States
  const [sys, setSys] = useState({
    language: 'vi',
    emailNotifications: true,
    smsNotifications: false,
    auditRetentionDays: 90
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('Đã lưu các thiết lập cấu hình thành công!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-100 h-96 animate-pulse"></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Demo Controls */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Demo Controls</span>
          <span className="text-xs text-blue-600 font-medium">Bấm để kiểm tra hiển thị:</span>
        </div>
        <div className="flex gap-2">
          {['NORMAL', 'LOADING', 'ERROR'].map(st => (
            <button
              key={st}
              onClick={() => setDemoState(st as any)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                demoState === st ? 'bg-blue-600 text-white' : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'
              }`}
            >
              {st === 'NORMAL' ? 'Bình thường' : st === 'LOADING' ? 'Đang tải' : 'Lỗi'}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-500">Cấu hình hồ sơ cá nhân, bảo mật, thiết lập doanh nghiệp và thông báo.</p>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl flex items-center gap-2.5 animate-fade-in shadow-xs">
          <CheckCircle size={18} className="text-green-500" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {demoState === 'ERROR' ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto mt-12">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Không thể tải cấu hình</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">Không thể kết nối đến máy chủ thiết lập.</p>
          <Button onClick={() => setDemoState('NORMAL')} className="mt-6 rounded-xl px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Thử lại</Button>
        </Card>
      ) : demoState === 'LOADING' ? (
        renderSkeleton()
      ) : (
        <div className="grid grid-cols-4 gap-6 items-start">
          
          {/* Settings Sidebar Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-1 shadow-xs">
            {[
              { id: 'PROFILE', label: 'Hồ sơ cá nhân', icon: User },
              { id: 'SECURITY', label: 'Bảo mật tài khoản', icon: Shield },
              { id: 'ORGANIZATION', label: 'Cấu hình doanh nghiệp', icon: Building },
              { id: 'SYSTEM', label: 'Thiết lập hệ thống', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border-none bg-transparent ${
                  activeTab === tab.id 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Settings Main Content Area */}
          <Card className="col-span-3">
            <form onSubmit={handleSave}>
              {activeTab === 'PROFILE' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-sm font-bold text-slate-800">Thông tin hồ sơ của bạn</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Cập nhật ảnh đại diện và chi tiết liên lạc công việc.</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                      <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-slate-700">Ảnh đại diện</div>
                      <button 
                        type="button"
                        onClick={() => alert('Chức năng tải lên ảnh đang mở rộng!')}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer bg-white"
                      >
                        Thay đổi ảnh
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Họ và tên *</label>
                      <input 
                        type="text" 
                        value={profile.fullName}
                        onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Vai trò hệ thống</label>
                      <input 
                        type="text" 
                        value={profile.role}
                        disabled
                        className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-400 rounded-lg text-sm font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Địa chỉ Email *</label>
                      <input 
                        type="email" 
                        value={profile.email}
                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Số điện thoại</label>
                      <input 
                        type="text" 
                        value={profile.phone}
                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'SECURITY' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4 border-none flex items-center gap-2 text-slate-700">
                    <Lock size={18} className="text-slate-400" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Bảo mật & Đổi mật khẩu</h3>
                      <p className="text-[11px] text-slate-400 mt-1">Đảm bảo mật khẩu của bạn có độ dài tối thiểu 8 ký tự.</p>
                    </div>
                  </div>

                  <div className="space-y-4 max-w-md pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Mật khẩu hiện tại</label>
                      <input 
                        type="password" 
                        value={passwords.oldPassword}
                        onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Mật khẩu mới</label>
                      <input 
                        type="password" 
                        value={passwords.newPassword}
                        onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="Mật khẩu mới"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Xác nhận mật khẩu mới</label>
                      <input 
                        type="password" 
                        value={passwords.confirmPassword}
                        onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="Nhập lại mật khẩu mới"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ORGANIZATION' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-sm font-bold text-slate-800">Cấu hình Tổ chức & Doanh nghiệp</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Thông tin pháp lý phục vụ việc truy xuất nguồn gốc công khai.</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Tên doanh nghiệp / Tổ chức *</label>
                        <input 
                          type="text" 
                          value={org.companyName}
                          onChange={e => setOrg({ ...org, companyName: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Mã số thuế / Giấy phép ĐKKD *</label>
                        <input 
                          type="text" 
                          value={org.taxCode}
                          onChange={e => setOrg({ ...org, taxCode: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Địa chỉ trụ sở chính *</label>
                      <input 
                        type="text" 
                        value={org.address}
                        onChange={e => setOrg({ ...org, address: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Website doanh nghiệp</label>
                      <input 
                        type="text" 
                        value={org.website}
                        onChange={e => setOrg({ ...org, website: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'SYSTEM' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-sm font-bold text-slate-800">Thiết lập tham số Hệ thống</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Cấu hình ngôn ngữ, cảnh báo tự động và thời gian lưu giữ dữ liệu.</p>
                  </div>

                  <div className="space-y-5 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">Ngôn ngữ hiển thị (Language)</label>
                      <select 
                        value={sys.language}
                        onChange={e => setSys({ ...sys, language: e.target.value })}
                        className="bg-white border border-slate-200 rounded-lg text-xs py-2 px-3 focus:outline-none cursor-pointer"
                      >
                        <option value="vi">Tiếng Việt (Vietnamese)</option>
                        <option value="en">English (Mỹ)</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Tùy chọn Nhận thông báo (Alert options)</label>
                      <div className="space-y-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={sys.emailNotifications}
                            onChange={e => setSys({ ...sys, emailNotifications: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                          <span className="ml-2.5 text-xs text-slate-600 font-semibold flex items-center gap-1"><Bell size={12} className="text-slate-400" /> Nhận thông báo cảnh báo bảo hành & thu hồi qua Email</span>
                        </label>
                      </div>
                      <div className="space-y-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={sys.smsNotifications}
                            onChange={e => setSys({ ...sys, smsNotifications: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                          <span className="ml-2.5 text-xs text-slate-600 font-semibold flex items-center gap-1"><Bell size={12} className="text-slate-400" /> Gửi tin nhắn SMS tự động khi kích hoạt sở hữu thành công</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-semibold text-slate-700 block">Thời gian lưu giữ Nhật ký (Audit retention)</label>
                      <select 
                        value={sys.auditRetentionDays}
                        onChange={e => setSys({ ...sys, auditRetentionDays: parseInt(e.target.value) || 90 })}
                        className="bg-white border border-slate-200 rounded-lg text-xs py-2 px-3 focus:outline-none cursor-pointer"
                      >
                        <option value="30">30 ngày qua</option>
                        <option value="90">90 ngày qua (Khuyên dùng)</option>
                        <option value="180">180 ngày qua</option>
                        <option value="365">1 năm</option>
                      </select>
                    </div>

                    <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl flex gap-2.5">
                      <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={15} />
                      <p className="text-[11px] text-blue-700 leading-normal">
                        Các thiết lập hệ thống này sẽ áp dụng trực tiếp cho tài khoản của bạn và cấu hình của doanh nghiệp mà bạn đang là Đại diện Hợp pháp.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Save Button */}
              <div className="border-t border-slate-100 mt-6 pt-5 flex justify-end">
                <Button 
                  type="submit"
                  className="rounded-xl px-4 py-2 text-xs flex items-center gap-1.5 font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
                >
                  <Save size={14} /> Lưu thiết lập
                </Button>
              </div>
            </form>
          </Card>

        </div>
      )}

    </div>
  );
}
