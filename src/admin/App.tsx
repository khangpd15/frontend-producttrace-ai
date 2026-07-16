/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import UserListPage from './pages/users/UserListPage';
import Dashboard from './pages/dashboard/Dashboard';
import CreateProduct from './pages/products/CreateProduct';
import ProductListPage from './pages/products/ProductList';
import CategoryListPage from './pages/categories/CategoryListPage';
import BatchListPage from './pages/batches/BatchListPage';
import OwnershipListPage from './pages/ownership/OwnershipListPage';
import WarrantyListPage from './pages/warranty/WarrantyListPage';
import StoreListPage from './pages/store/StoreListPage';
import AuditListPage from './pages/audit/AuditListPage';
import SettingsPage from './pages/settings/SettingsPage';
import NotificationListPage from './pages/notifications/NotificationListPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import EditProductPage from './pages/products/EditProductPage';
import AttributesPage from './pages/attributes/AttributesPage';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onLocationChange = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onLocationChange);
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  // Navigation handler to prevent full reload
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.getAttribute('href')?.startsWith('/')) {
        e.preventDefault();
        const href = target.getAttribute('href')!;
        window.history.pushState({}, '', href);
        setPath(href);
      }
    };
    window.addEventListener('click', handleLinkClick);
    return () => window.removeEventListener('click', handleLinkClick);
  }, []);

  const handleNavigate = (tabId: string, id?: string) => {
    const href = tabId === 'dashboard' ? '/dashboard' : `/${tabId}${id ? `?id=${id}` : ''}`;
    window.history.pushState({}, '', href);
    setPath(`/${tabId === 'dashboard' ? 'dashboard' : tabId}`.replace('//', '/'));
  };

  const renderContent = () => {
    switch (path) {
      case '/users':
        return <UserListPage />;
      case '/categories':
        return <CategoryListPage onNavigate={handleNavigate} />;
      case '/products':
        return <ProductListPage onNavigate={handleNavigate} />;
      case '/create-product':
        return <CreateProduct onNavigate={handleNavigate} />;
      case '/product-detail': {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id') || undefined;
        return <ProductDetailPage onNavigate={handleNavigate} productId={productId} />;
      }
      case '/edit-product': {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id') || undefined;
        return <EditProductPage onNavigate={handleNavigate} productId={productId} />;
      }
      case '/batches':
        return <BatchListPage onNavigate={handleNavigate} />;
      case '/ownership':
        return <OwnershipListPage onNavigate={handleNavigate} />;
      case '/warranty':
        return <WarrantyListPage onNavigate={handleNavigate} />;
      case '/store':
        return <StoreListPage onNavigate={handleNavigate} />;
      case '/audit':
        return <AuditListPage onNavigate={handleNavigate} />;
      case '/settings':
        return <SettingsPage onNavigate={handleNavigate} />;
      case '/attributes':
        return <AttributesPage onNavigate={handleNavigate} />;
      case '/notifications':
        return <NotificationListPage onNavigate={handleNavigate} />;
      case '/':
      case '/admin':
      case '/dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      default:
        return <div className="p-8">Page Not Found</div>;
    }
  }

  const getBreadcrumbs = () => {
    if (path === '/users') {
      return [{ label: 'Dashboard', href: '/' }, { label: 'Người dùng' }];
    }
    if (path === '/categories') {
      return [{ label: 'Dashboard', href: '/' }, { label: 'Danh mục sản phẩm' }];
    }
    if (path === '/products') {
      return [{ label: 'Dashboard', href: '/' }, { label: 'Sản phẩm' }];
    }
    if (path === '/create-product') {
      return [{ label: 'Dashboard', href: '/' }, { label: 'Sản phẩm', href: '/products' }, { label: 'Tạo sản phẩm' }];
    }
    if (path === '/product-detail') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      return [{ label: 'Dashboard', href: '/' }, { label: 'Sản phẩm', href: '/products' }, { label: id ? `Chi tiết sản phẩm #${id}` : 'Chi tiết sản phẩm' }];
    }
    if (path === '/edit-product') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      return [{ label: 'Dashboard', href: '/' }, { label: 'Sản phẩm', href: '/products' }, { label: 'Chi tiết', href: id ? `/product-detail?id=${id}` : '/products' }, { label: 'Chỉnh sửa' }];
    }
    if (path === '/batches') {
      return [{ label: 'Dashboard', href: '/' }, { label: 'Lô hàng' }];
    }
    if (path === '/ownership') {
      return [{ label: 'Dashboard', href: '/' }, { label: 'Lịch sử sở hữu' }];
    }
    if (path === '/warranty') {
      return [{ label: 'Dashboard', href: '/' }, { label: 'Bảo hành điện tử' }];
    }
    if (path === '/store') {
      return [{ label: 'Dashboard', href: '/' }, { label: 'Đại lý & Cửa hàng' }];
    }
    if (path === '/audit') {
      return [{ label: 'Dashboard', href: '/' }, { label: 'Nhật ký hệ thống' }];
    }
    if (path === '/settings') {
      return [{ label: 'Dashboard', href: '/' }, { label: 'Cấu hình cài đặt' }];
    }
    if (path === '/attributes') {
      return [{ label: 'Dashboard', href: '/' }, { label: 'Quản lý Thuộc tính' }];
    }
    if (path === '/notifications') {
      return [{ label: 'Dashboard', href: '/' }, { label: 'Thông báo' }];
    }
    return [{ label: 'Dashboard', href: '/' }];
  }

  return (
    <Layout breadcrumbs={getBreadcrumbs()}>
      {renderContent()}
    </Layout>
  );
}
