import React, { useState } from 'react';
import { Tag, Smartphone, Tv, Zap, Wind, Flame } from 'lucide-react';
import { motion } from 'motion/react';

type Status = 'ACTIVE' | 'DRAFT' | 'DISCONTINUED';

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  status: Status;
  imageUrl: string;
  isHot?: boolean;
}

const ProductList: React.FC<{ onNavigate: (tabId: string, id?: string) => void }> = ({ onNavigate }) => {
  const [products] = useState<Product[]>([
    { id: '1', name: 'Máy lọc nước RO Kangaroo', category: 'Thiết bị gia dụng', price: '3.500.000đ', status: 'ACTIVE', imageUrl: '', isHot: true },
    { id: '2', name: 'Tấm pin năng lượng mặt trời JA Solar', category: 'Năng lượng', price: '2.800.000đ', status: 'ACTIVE', imageUrl: '', isHot: false },
    { id: '3', name: 'Sơn chống thấm ngoại thất Spec', category: 'Vật liệu xây dựng', price: '320.000đ', status: 'DRAFT', imageUrl: '', isHot: true },
    { id: '4', name: 'Thực phẩm chức năng Omega-3', category: 'Dược phẩm', price: '280.000đ', status: 'DISCONTINUED', imageUrl: '' },
  ]);

  const categories = [
    { name: 'Gia dụng', icon: <Wind size={24} /> },
    { name: 'Năng lượng', icon: <Zap size={24} /> },
    { name: 'Điện thoại', icon: <Smartphone size={24} /> },
    { name: 'Tivi', icon: <Tv size={24} /> },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">

      {/* Category Grid */}
      <div className="p-4 pt-4 grid grid-cols-4 gap-3">
        {categories.map((cat, i) => (
          <motion.div 
            key={i} 
            whileHover={{ scale: 1.05 }}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2"
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">{cat.icon}</div>
            <p className="text-[11px] font-semibold text-slate-700 text-center">{cat.name}</p>
          </motion.div>
        ))}
      </div>

      {/* Featured Products */}
      <div className="p-4">
        <div className="relative mb-4">
          <input type="text" placeholder="Tìm kiếm sản phẩm..." className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Tag size={16} />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Flame className="text-orange-500" size={24} /> Sản phẩm nổi bật
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {products.map(p => (
            <motion.div
              key={p.id}
              whileHover={{ y: -5 }}
              onClick={() => onNavigate('product-detail', p.id)}
              className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col cursor-pointer relative overflow-hidden"
            >
              {p.isHot && (
                <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">HOT</div>
              )}
              <div className="w-full aspect-square bg-slate-100 rounded-xl mb-3 flex items-center justify-center text-slate-400">
                <Tag size={40} />
              </div>
              <p className="text-[10px] text-slate-500 mb-1 font-medium">{p.category}</p>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-2 leading-snug">{p.name}</h3>
              <p className="text-md font-extrabold text-blue-600 mt-auto">{p.price}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
