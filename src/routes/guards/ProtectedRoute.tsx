import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/auth.store';
import type { UserRole } from '../../features/auth/store/auth.store';

interface ProtectedRouteProps {
  /** If provided, only these roles can access this route */
  allowedRoles?: UserRole[];
  /** Where to redirect unauthorized users (default: /login) */
  redirectTo?: string;
}

/**
 * ProtectedRoute guards a set of nested routes.
 *
 * Usage in router:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 *   <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
 *     <Route path="/admin/users" element={<UserList />} />
 *   </Route>
 */
export default function ProtectedRoute({
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, role } = useAuthStore();

  // Not logged in → redirect to login preserving intended destination
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Role check (only if allowedRoles is specified)
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    if (!role) {
      return <Navigate to={redirectTo} replace />;
    }
    // Redirect to appropriate home based on role
    const roleHome: Record<UserRole, string> = {
      ADMIN: '/dashboard',
      STAFF: '/dashboard',
      DEALER: '/dashboard',
      CUSTOMER: '/customer/scan',
    };
    return <Navigate to={roleHome[role] ?? '/login'} replace />;
  }

  return <Outlet />;
}
