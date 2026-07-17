/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { NavItem } from './types';
import { BottomNav } from './components/layout/BottomNav';
import { Home } from './views/Home';
import { ProductDetail } from './views/ProductDetail';
import { Warranty } from './views/Warranty';
import { Ownership } from './views/Ownership';
import { Profile } from './views/Profile';
import { Notifications } from './views/Notifications';
import { WarrantyRequestForm } from './views/WarrantyRequestForm';
import { RegisterOwnership } from './views/RegisterOwnership';

export default function App() {
  const [active, setActive] = useState<NavItem>('home');
  const [currentView, setCurrentView] = useState<'home' | 'productDetail' | 'warrantyRequest' | 'warranty' | 'ownership' | 'profile' | 'notifications' | 'registerOwnership'>('home');
  const [history, setHistory] = useState<string[]>(['home']);
  const [registerPayload, setRegisterPayload] = useState<string>('');

  const navigateTo = (view: 'home' | 'productDetail' | 'warrantyRequest' | 'warranty' | 'ownership' | 'profile' | 'notifications' | 'registerOwnership', payload?: string) => {
    if (payload) {
      setRegisterPayload(payload);
    }
    setHistory([...history, view]);
    setCurrentView(view);
    if (['home', 'warranty', 'ownership', 'profile'].includes(view)) {
      setActive(view as NavItem);
    }
  };

  const navigateBack = () => {
    const newHistory = [...history];
    newHistory.pop();
    const prevView = newHistory[newHistory.length - 1] as 'home' | 'productDetail' | 'warrantyRequest' | 'warranty' | 'ownership' | 'profile' | 'notifications' | 'registerOwnership';
    setHistory(newHistory);
    setCurrentView(prevView);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {currentView === 'home' && <Home onScan={() => navigateTo('productDetail')} onBellClick={() => navigateTo('notifications')} onNavigate={(tab, id) => {
          if (tab === 'product-detail') navigateTo('productDetail');
      }} />}
      {currentView === 'productDetail' && <ProductDetail onBack={navigateBack} onRequestWarranty={() => navigateTo('warrantyRequest')} onRegisterOwnership={(code) => navigateTo('registerOwnership', code)} />}
      {currentView === 'warrantyRequest' && <WarrantyRequestForm onBack={navigateBack} productId="1" />}
      {currentView === 'warranty' && <Warranty onBack={navigateBack} />}
      {currentView === 'ownership' && <Ownership onBack={navigateBack} onRegister={() => navigateTo('registerOwnership')} />}
      {currentView === 'registerOwnership' && <RegisterOwnership onBack={navigateBack} onSuccess={() => navigateTo('ownership')} initialCode={registerPayload} />}
      {currentView === 'notifications' && <Notifications onBack={navigateBack} />}
      {currentView === 'profile' && <Profile onBack={navigateBack} />}
      
      <BottomNav active={active} setActive={(item) => {
        setActive(item);
        if (item === 'home') navigateTo('home');
        if (item === 'warranty') navigateTo('warranty');
        if (item === 'ownership') navigateTo('ownership');
        if (item === 'profile') navigateTo('profile');
      }} />
    </div>
  );
}
