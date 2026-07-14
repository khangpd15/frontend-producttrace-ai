import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShieldCheck, Bell, Settings, ChevronDown,
  Layers, Database, Tag, MapPin, ClipboardList, User, ChevronLeft, ChevronRight,
  FileText, Activity, LogOut,
} from 'lucide-react';
import { useAuthStore } from '../features/auth/store/auth.store';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',       to: '/dashboard' },
  { icon: User,            label: 'Người dùng',      to: '/users' },
  { icon: Tag,             label: 'Danh mục',         to: '/categories' },
  { icon: Package,         label: 'Sản phẩm',         to: '/products' },
  { icon: Database,        label: 'Lô hàng',          to: '/batches' },
  { icon: Layers,          label: 'Sở hữu',           to: '/ownership' },
  { icon: ShieldCheck,     label: 'Bảo hành',         to: '/warranty' },
  { icon: MapPin,          label: 'Đại lý',           to: '/store' },
  { icon: Bell,            label: 'Thông báo',        to: '/notifications' },
  { icon: Activity,        label: 'Audit Logs',       to: '/audit' },
] as const;

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase()
    : 'PT';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 border-r border-slate-200 bg-white p-4 flex flex-col relative flex-shrink-0`}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-8 bg-white border border-slate-200 rounded-full p-1.5 shadow-xs text-slate-400 hover:text-blue-600 transition-colors cursor-pointer z-10"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 mb-8 select-none">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            PT
          </div>
          {!collapsed && (
            <span className="font-extrabold text-base text-slate-900 whitespace-nowrap tracking-tight">
              ProductTrace-AI
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-xs font-semibold ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{label}</span>}
              {collapsed && (
                <span className="absolute left-full ml-4 px-2 py-1 bg-slate-950 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none transition-opacity">
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Settings link */}
        <div className="pt-4 border-t border-slate-100 mt-4">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-xs font-semibold ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Settings size={18} className="flex-shrink-0" />
            {!collapsed && <span>Settings</span>}
          </NavLink>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 z-40">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <input
                type="search"
                placeholder="Tìm kiếm..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-4 py-1.5 text-xs focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Profile menu */}
          <div className="relative ml-4">
            <div
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer select-none"
            >
              <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xs font-bold shadow-xs">
                {initials}
              </div>
              <span className="text-xs font-semibold text-slate-800">
                {user?.full_name ?? 'Admin'}
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2.5 w-56 bg-white border border-slate-200 shadow-xl rounded-xl py-3 z-50 text-slate-800">
                  <div className="px-4 pb-2 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900">
                      {user?.full_name ?? '—'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">{user?.email ?? '—'}</div>
                    <span className="mt-1.5 inline-block text-[9px] bg-slate-100 border border-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase">
                      {user?.role ?? 'ADMIN'}
                    </span>
                  </div>

                  <div className="py-1 px-1.5">
                    <NavLink
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <FileText size={14} /> Hồ sơ cá nhân
                    </NavLink>
                  </div>

                  <div className="border-t border-slate-100 pt-1.5 px-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <LogOut size={14} /> Đăng xuất
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content rendered by nested <Route> */}
        <main className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
