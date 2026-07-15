import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BottomNav } from '../customer/components/layout/BottomNav';
import { NavItem } from '../customer/types';

export default function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Map pathnames to NavItem IDs
  const getActiveTab = (): NavItem => {
    const path = location.pathname;
    if (path.startsWith('/customer/warranty')) return 'warranty';
    if (path.startsWith('/customer/ownership')) return 'ownership';
    if (path.startsWith('/customer/profile')) return 'profile';
    return 'home';
  };

  const handleTabChange = (item: NavItem) => {
    if (item === 'home') navigate('/customer/scan');
    if (item === 'warranty') navigate('/customer/warranty');
    if (item === 'ownership') navigate('/customer/ownership');
    if (item === 'profile') navigate('/customer/profile');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Content wrapper with padding to prevent BottomNav overlap */}
      <main className="flex-1 pb-16">
        <Outlet />
      </main>

      {/* Persistent bottom navigation */}
      <BottomNav active={getActiveTab()} setActive={handleTabChange} />
    </div>
  );
}
