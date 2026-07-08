import { useNavigate } from 'react-router-dom';

/**
 * Compatibility adapter for Admin pages that still use `onNavigate(tabId)` prop.
 * Maps legacy tabId strings → React Router paths.
 *
 * Usage in AppRouter:
 *   const nav = useAdminNavigate();
 *   <Dashboard onNavigate={nav} />
 *
 * OR inside a component:
 *   const navigate = useAdminNavigate();
 *   navigate('products');  // → /products
 */

const TAB_TO_PATH: Record<string, string> = {
  dashboard:      '/dashboard',
  users:          '/users',
  categories:     '/categories',
  products:       '/products',
  'create-product': '/create-product',
  'product-detail': '/product-detail',
  'edit-product': '/edit-product',
  batches:        '/batches',
  ownership:      '/ownership',
  warranty:       '/warranty',
  store:          '/store',
  reports:        '/reports',
  audit:          '/audit',
  settings:       '/settings',
  notifications:  '/notifications',
};

export function useAdminNavigate() {
  const navigate = useNavigate();

  return (tabId: string, id?: string) => {
    const base = TAB_TO_PATH[tabId] ?? `/${tabId}`;
    const path = id ? `${base}?id=${id}` : base;
    navigate(path);
  };
}
