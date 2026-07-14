import { Outlet, useLocation, useNavigate } from 'react-router-dom';

type NavItem = 'home' | 'warranty' | 'ownership' | 'profile';

export default function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab based on pathname
  let active: NavItem = 'home';
  if (location.pathname.includes('/warranty')) active = 'warranty';
  else if (location.pathname.includes('/ownership')) active = 'ownership';
  else if (location.pathname.includes('/profile')) active = 'profile';

  const handleSetActive = (item: NavItem) => {
    switch (item) {
      case 'home': navigate('/customer/scan'); break;
      case 'warranty': navigate('/customer/warranty'); break;
      case 'ownership': navigate('/customer/ownership'); break;
      case 'profile': navigate('/customer/profile'); break;
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50">
      <Outlet />
    </div>
  );
}
