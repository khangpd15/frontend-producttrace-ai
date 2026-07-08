import React from 'react';
import { Home, Package, ShieldCheck, Bell, User } from 'lucide-react';
import { NavItem } from '../../types';

interface BottomNavProps {
  active: NavItem;
  setActive: (item: NavItem) => void;
}

export function BottomNav({ active, setActive }: BottomNavProps) {
  const items: { id: NavItem; icon: React.ReactNode; label: string }[] = [
    { id: 'home', icon: <Home size={24} />, label: 'Trang chủ' },
    { id: 'warranty', icon: <ShieldCheck size={24} />, label: 'Bảo hành' },
    { id: 'ownership', icon: <User size={24} />, label: 'Thông tin sở hữu' },
    { id: 'profile', icon: <User size={24} />, label: 'Cá nhân' },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 pt-2 px-2 flex justify-around items-center h-16 shadow-lg z-50">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setActive(item.id)}
          className={`flex flex-col items-center gap-1 ${
            active === item.id ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          {item.icon}
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
