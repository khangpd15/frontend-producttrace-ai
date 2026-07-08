import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/auth.store';
import type { UserRole } from '../../features/auth/store/auth.store';

/**
 * GuestRoute prevents authenticated users from accessing public pages
 * (login, register, etc.) and redirects them to their role-appropriate home.
 */
export default function GuestRoute() {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Outlet />;
  }

  // Already logged in → go to home based on role
  const roleHome: Record<UserRole, string> = {
    ADMIN: '/dashboard',
    STAFF: '/dashboard',
    DEALER: '/dashboard',
    CUSTOMER: '/customer/scan',
  };

  const destination = role ? roleHome[role] : '/dashboard';
  return <Navigate to={destination} replace />;
}
