import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ProtectedRoute from './guards/ProtectedRoute';
import GuestRoute from './guards/GuestRoute';
import { useAuthStore } from '../features/auth/store/auth.store';

// ─── Layouts ──────────────────────────────────────────────────────────────────
import AdminLayout from '../layouts/AdminLayout';

// ─── Auth pages (eagerly loaded) ─────────────────────────────────────────────
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import VerifyOtpPage from '../features/auth/pages/VerifyOtpPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';

// ─── Admin pages (lazy) ───────────────────────────────────────────────────────
const Dashboard           = lazy(() => import('../admin/pages/dashboard/Dashboard'));
const UserListPage         = lazy(() => import('../admin/pages/users/UserListPage'));
const ProductListPage      = lazy(() => import('../admin/pages/products/ProductList'));
const ProductDetailPage    = lazy(() => import('../admin/pages/products/ProductDetailPage'));
const CreateProduct        = lazy(() => import('../admin/pages/products/CreateProduct'));
const EditProductPage      = lazy(() => import('../admin/pages/products/EditProductPage'));
const CategoryListPage     = lazy(() => import('../admin/pages/categories/CategoryListPage'));
const BatchListPage        = lazy(() => import('../admin/pages/batches/BatchListPage'));
const OwnershipListPage    = lazy(() => import('../admin/pages/ownership/OwnershipListPage'));
const WarrantyListPage     = lazy(() => import('../admin/pages/warranty/WarrantyListPage'));
const StoreListPage        = lazy(() => import('../admin/pages/store/StoreListPage'));
const ReportsPage          = lazy(() => import('../admin/pages/reports/ReportsPage'));
const AuditListPage        = lazy(() => import('../admin/pages/audit/AuditListPage'));
const SettingsPage         = lazy(() => import('../admin/pages/settings/SettingsPage'));
const NotificationListPage = lazy(() => import('../admin/pages/notifications/NotificationListPage'));

// ─── Customer pages (lazy) ────────────────────────────────────────────────────
const CustomerHome          = lazy(() => import('../customer/views/Home'));
const CustomerProductDetail = lazy(() => import('../customer/views/ProductDetail'));
const CustomerOwnership     = lazy(() => import('../customer/views/Ownership'));
const CustomerWarranty      = lazy(() => import('../customer/views/Warranty'));
const CustomerProfile       = lazy(() => import('../customer/views/Profile'));
const VerifyPage            = lazy(() => import('../features/verify/pages/VerifyPage'));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/** Maps legacy tabId strings to real paths — adapter for existing pages */
function useNavAdapter() {
  const navigate = useNavigate();
  const tabMap: Record<string, string> = {
    dashboard: '/dashboard', users: '/users', categories: '/categories',
    products: '/products', 'create-product': '/create-product',
    'product-detail': '/product-detail', 'edit-product': '/edit-product',
    batches: '/batches', ownership: '/ownership', warranty: '/warranty',
    store: '/store', reports: '/reports', audit: '/audit',
    settings: '/settings', notifications: '/notifications',
  };
  return (tabId: string, id?: string) => {
    const base = tabMap[tabId] ?? `/${tabId}`;
    navigate(id ? `${base}?id=${id}` : base);
  };
}

/** Wrapper that injects the navigate adapter into existing admin components */
function withNav<P extends { onNavigate: (tabId: string, id?: string) => void }>(
  Component: React.ComponentType<P>,
) {
  return function WrappedComponent(props: Omit<P, 'onNavigate'>) {
    const onNavigate = useNavAdapter();
    return <Component {...(props as P)} onNavigate={onNavigate} />;
  };
}

import React from 'react';

// Wrapped versions — backward-compatible with existing props
const DashboardPage         = withNav(Dashboard as React.ComponentType<{ onNavigate: (t: string, id?: string) => void }>);
const ProductsPage          = withNav(ProductListPage as React.ComponentType<{ onNavigate: (t: string, id?: string) => void }>);
const ProductDetailWrapped  = withNav(ProductDetailPage as React.ComponentType<{ onNavigate: (t: string, id?: string) => void; productId?: string }>);
const CreateProductPage     = withNav(CreateProduct as React.ComponentType<{ onNavigate: (t: string, id?: string) => void }>);
const EditProductWrapped    = withNav(EditProductPage as React.ComponentType<{ onNavigate: (t: string, id?: string) => void; productId?: string }>);
const CategoriesPage        = withNav(CategoryListPage as React.ComponentType<{ onNavigate: (t: string, id?: string) => void }>);
const BatchesPage           = withNav(BatchListPage as React.ComponentType<{ onNavigate: (t: string, id?: string) => void }>);
const OwnershipPage         = withNav(OwnershipListPage as React.ComponentType<{ onNavigate: (t: string, id?: string) => void }>);
const WarrantyPage          = withNav(WarrantyListPage as React.ComponentType<{ onNavigate: (t: string, id?: string) => void }>);
const StorePage             = withNav(StoreListPage as React.ComponentType<{ onNavigate: (t: string, id?: string) => void }>);
const ReportsWrapped        = withNav(ReportsPage as React.ComponentType<{ onNavigate: (t: string, id?: string) => void }>);
const AuditPage             = withNav(AuditListPage as React.ComponentType<{ onNavigate: (t: string, id?: string) => void }>);
const SettingsWrapped       = withNav(SettingsPage as React.ComponentType<{ onNavigate: (t: string, id?: string) => void }>);
const NotificationsPage     = withNav(NotificationListPage as React.ComponentType<{ onNavigate: (t: string, id?: string) => void }>);

// ─── ProductDetail reads id from URL query string ────────────────────────────
function ProductDetailRoute() {
  const id = new URLSearchParams(window.location.search).get('id') ?? undefined;
  const onNavigate = useNavAdapter();
  return <ProductDetailPage productId={id} onNavigate={onNavigate} />;
}

function EditProductRoute() {
  const id = new URLSearchParams(window.location.search).get('id') ?? undefined;
  const onNavigate = useNavAdapter();
  return <EditProductPage productId={id} onNavigate={onNavigate} />;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export default function AppRouter() {
  const { isAuthenticated, user, fetchProfile, isLoading, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user && !isLoading) {
      fetchProfile().catch(() => {});
    }
  }, [isAuthenticated, user, fetchProfile, isLoading]);

  // Wait for Zustand hydration to finish on initial mount
  if (!_hasHydrated) {
    return <PageLoader />;
  }

  // If authenticated but profile has not loaded yet, block routing to prevent race conditions
  if (isAuthenticated && !user) {
    return <PageLoader />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Root */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public QR Verification */}
          <Route path="/verify" element={<VerifyPage />} />

          {/* Guest-only */}
          <Route element={<GuestRoute />}>
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/register"        element={<RegisterPage />} />
            <Route path="/verify-otp"      element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Protected: Admin / Staff / Dealer */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'DEALER']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/dashboard"     element={<DashboardPage />} />
              <Route path="/categories"    element={<CategoriesPage />} />
              <Route path="/products"      element={<ProductsPage />} />
              <Route path="/create-product" element={<CreateProductPage />} />
              <Route path="/product-detail" element={<ProductDetailRoute />} />
              <Route path="/edit-product"  element={<EditProductRoute />} />
              <Route path="/batches"       element={<BatchesPage />} />
              <Route path="/ownership"     element={<OwnershipPage />} />
              <Route path="/warranty"      element={<WarrantyPage />} />
              <Route path="/store"         element={<StorePage />} />
              <Route path="/reports"       element={<ReportsWrapped />} />
              <Route path="/audit"         element={<AuditPage />} />
              <Route path="/settings"      element={<SettingsWrapped />} />
              <Route path="/notifications" element={<NotificationsPage />} />

              {/* Admin-only */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/users" element={<UserListPage />} />
              </Route>
            </Route>
          </Route>

          {/* Protected: Customer */}
          <Route element={<ProtectedRoute />}>
            <Route path="/customer/scan" element={
              <CustomerHome 
                onScan={() => {
                  const code = prompt('Quét mã QR sản phẩm (nhập Serial hoặc Mã sản phẩm):');
                  if (code && code.trim()) {
                    window.location.href = `/customer/product?code=${encodeURIComponent(code.trim())}`;
                  }
                }} 
                onNavigate={(tabId, id) => {
                  if (tabId === 'product-detail' && id) {
                    window.location.href = `/customer/product?id=${id}`;
                  }
                }} 
              />
            } />
            <Route path="/customer/product" element={
              <CustomerProductDetail 
                onBack={() => window.history.back()} 
                onRequestWarranty={() => window.location.href = '/customer/warranty'} 
                onRegisterOwnership={() => window.location.href = '/customer/ownership'} 
              />
            } />
            <Route path="/customer/ownership" element={
              <CustomerOwnership 
                onBack={() => window.history.back()} 
                onRegister={() => window.location.href = '/customer/ownership'} 
              />
            } />
            <Route path="/customer/warranty" element={
              <CustomerWarranty onBack={() => window.history.back()} />
            } />
            <Route path="/customer/profile" element={
              <CustomerProfile onBack={() => window.history.back()} />
            } />
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
                <h1 className="text-6xl font-extrabold text-slate-200">404</h1>
                <p className="text-slate-500 text-sm">Trang không tồn tại</p>
                <a href="/dashboard" className="text-blue-600 hover:underline text-sm font-semibold">
                  ← Quay về trang chủ
                </a>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
