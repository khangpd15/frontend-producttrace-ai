import React, { useState } from 'react';
import { 
  LayoutDashboard, Package, ShieldCheck, Search, Bell, Settings, ChevronDown, 
  Layers, Database, Tag, MapPin, ClipboardList, User, ChevronLeft, ChevronRight, 
  FileText, Activity, LogOut, Check, Sparkles, BellOff, Lock, SlidersHorizontal
} from 'lucide-react';
import Breadcrumb from './ui/Breadcrumb';

const MENU_CONFIG = {
  Admin: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: User, label: 'Users', href: '/users' },
    { icon: Tag, label: 'Categories', href: '/categories' },
    { icon: SlidersHorizontal, label: 'Attributes', href: '/attributes' },
    { icon: Package, label: 'Products', href: '/products' },
    { icon: Database, label: 'Batches', href: '/batches' },
    { icon: Layers, label: 'Ownership', href: '/ownership' },
    { icon: ShieldCheck, label: 'Warranty', href: '/warranty' },
    { icon: ClipboardList, label: 'Warranty Claims', href: '/warranty-claims' },
    { icon: MapPin, label: 'Store', href: '/store' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: Activity, label: 'Audit Logs', href: '/audit' },
  ],
};

export default function Layout({ children, breadcrumbs = [], role = 'Admin' }: { children: React.ReactNode, breadcrumbs?: { label: string, href?: string }[], role?: keyof typeof MENU_CONFIG }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  // Mock Login States
  const [loginEmail, setLoginEmail] = useState('admin@producttrace.vn');
  const [loginPassword, setLoginPassword] = useState('••••••••');

  const menuItems = MENU_CONFIG[role] || [];
  const activeHref = window.location.pathname;

  const notifications = [
    { id: 1, title: 'Đăng ký sở hữu mới', desc: 'Sản phẩm SN-KG-889021 được Nguyễn Văn A đăng ký.', time: '5 phút trước', unread: true },
    { id: 2, title: 'Yêu cầu bảo hành mới', desc: 'Lê Hoàng C gửi yêu cầu bảo hành cho sơn Spec.', time: '20 phút trước', unread: true },
    { id: 3, title: 'Cảnh báo tồn kho', desc: 'Số lượng tồn kho Máy lọc nước dưới mức an toàn.', time: '1 ngày trước', unread: false },
    { id: 4, title: 'Lô hàng hết hạn', desc: 'Lô hàng BATCH-2026-SP12 đã hết hạn sử dụng.', time: '2 ngày trước', unread: false }
  ];

  const handleLogout = () => {
    setIsProfileOpen(false);
    setIsLoggedOut(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedOut(false);
  };

  if (isLoggedOut) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-8 max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-xl shadow-md">
              PT
            </div>
            <h2 className="text-xl font-bold text-slate-900">ProductTrace-AI</h2>
            <p className="text-xs text-slate-400">Đăng nhập tài khoản Quản trị viên để quản lý hệ thống</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Tài khoản Email</label>
              <input 
                type="email" 
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Mật khẩu</label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm focus:outline-none"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-md cursor-pointer"
            >
              Đăng nhập
            </button>
          </form>
          
          <div className="text-center">
            <span className="text-[10px] text-slate-400">© 2026 ProductTrace-AI. All rights reserved.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 border-r border-slate-200 bg-white p-4 flex flex-col relative`}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-white border border-slate-200 rounded-full p-1.5 shadow-xs text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        <div className="flex items-center gap-2.5 px-2 mb-8 select-none">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-xs">PT</div>
            {!isCollapsed && <span className="font-extrabold text-base text-slate-900 whitespace-nowrap tracking-tight">ProductTrace-AI</span>}
        </div>
        
        <nav className="flex-1 space-y-1">
          {menuItems.map(item => {
            const isActive = activeHref === item.href;
            return (
              <a 
                key={item.label} 
                href={item.href} 
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative ${
                  isActive 
                    ? 'bg-blue-50/70 text-blue-600 font-bold shadow-3xs' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-600 rounded-r-md" />
                )}
                <item.icon size={18} className="flex-shrink-0" />
                {!isCollapsed && <span className="text-xs font-semibold whitespace-nowrap">{item.label}</span>}
                {isCollapsed && (
                  <span className="absolute left-full ml-4 px-2 py-1 bg-slate-950 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none transition-opacity">
                    {item.label}
                  </span>
                )}
              </a>
            );
          })}
        </nav>
        
        <div className="pt-4 border-t border-slate-100 mt-4">
            <a 
              href="/settings" 
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative ${
                activeHref === '/settings' 
                  ? 'bg-blue-50/70 text-blue-600 font-bold shadow-3xs' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {activeHref === '/settings' && (
                <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-600 rounded-r-md" />
              )}
              <Settings size={18} className="flex-shrink-0" />
              {!isCollapsed && <span className="text-xs font-semibold whitespace-nowrap">Settings</span>}
            </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md flex items-center justify-between px-8 relative z-40">
          <div className="flex-1 max-w-xl">
             <div className="relative">
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
               <input 
                 type="search" 
                 placeholder="Tìm kiếm nhanh thông tin..." 
                 className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all duration-200" 
               />
             </div>
          </div>
          <div className="flex items-center gap-4">
            
            {/* Notification Menu Entry */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsProfileOpen(false);
                }}
                className="text-slate-500 hover:text-blue-600 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer relative"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>

              {/* Notification Popover Dropdown */}
              {isNotificationOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)}></div>
                  <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 shadow-xl rounded-xl py-2 z-50 animate-fade-in text-slate-800">
                    <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-900">Thông báo gần đây</span>
                      <span className="text-[10px] bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-full">2 mới</span>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-3 hover:bg-slate-50 transition-colors flex gap-2.5 ${n.unread ? 'bg-blue-50/20' : ''}`}>
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.unread ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                          <div className="flex-1 space-y-0.5">
                            <div className="text-xs font-bold text-slate-900 flex justify-between items-baseline">
                              <span>{n.title}</span>
                              <span className="text-[9px] text-slate-400 font-normal">{n.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-normal">{n.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-slate-100 pt-1 text-center">
                      <button 
                        onClick={() => {
                          setIsNotificationOpen(false);
                          alert('Chức năng Xem tất cả đang phát triển!');
                        }}
                        className="text-[10px] text-blue-600 hover:underline font-bold py-1 w-full border-none bg-transparent cursor-pointer"
                      >
                        Xem tất cả thông báo
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Menu Entry */}
            <div className="relative">
              <div 
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer select-none"
              >
                  <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xs font-bold shadow-xs">AN</div>
                  <span className="text-xs font-semibold text-slate-800">Admin User</span>
                  <ChevronDown size={14} className="text-slate-400" />
              </div>

              {/* Profile Popover Dropdown */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-2.5 w-64 bg-white border border-slate-200 shadow-xl rounded-xl py-3 z-50 animate-fade-in text-slate-800">
                    <div className="px-4 pb-2 border-b border-slate-100">
                      <div className="text-xs font-bold text-slate-900">Admin User</div>
                      <div className="text-[10px] text-slate-400 font-medium">admin@producttrace.vn</div>
                      <span className="mt-1.5 inline-block text-[9px] bg-slate-100 border border-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase">Quản trị viên</span>
                    </div>

                    <div className="py-1 px-1.5 space-y-0.5">
                      <a 
                        href="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <User size={14} /> Hồ sơ cá nhân
                      </a>
                      <a 
                        href="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <Lock size={14} /> Đổi mật khẩu
                      </a>
                      <a 
                        href="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <Settings size={14} /> Cấu hình hệ thống
                      </a>
                    </div>

                    <div className="border-t border-slate-100 pt-1.5 px-1.5">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                      >
                        <LogOut size={14} /> Đăng xuất tài khoản
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>
        
        <main className="p-8 flex-1 overflow-y-auto">
          {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}
          <div className="mt-4">{children}</div>
        </main>
      </div>
    </div>
  );
}

