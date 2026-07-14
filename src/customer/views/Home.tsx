import { QrCode, Search, MapPin, Bell, Package, ShieldCheck, Clock, Tag, Smartphone, Tv, Zap, Flame, Wind } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/auth.store';
import { productApi } from '../../features/products/api/product.api';
import { AdminProduct } from '../../shared/types/domain';

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

export function Home({ onScan, onNavigate }: { onScan?: () => void; onNavigate?: (tabId: string, id?: string) => void }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchVal, setSearchVal] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoadingProducts(true);
      try {
        const { data } = await productApi.getAll({ page: 1, limit: 10, status: 'ACTIVE' });
        const items = data.data.items || [];
        const mapped: Product[] = items.map((p, index) => ({
          id: p.id,
          name: p.name,
          category: p.category || 'Thiết bị',
          price: 'Chi tiết',
          status: p.status as Status,
          imageUrl: p.thumbnail_url || '',
          isHot: index % 2 === 0, // Simulate hot tag based on index
        }));
        setProducts(mapped);
      } catch (err) {
        console.error('Failed to fetch customer products', err);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/customer/product?code=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const handleScanMock = () => {
    if (onScan) {
      onScan();
    } else {
      const code = prompt('Quét mã QR sản phẩm (nhập Serial hoặc Mã sản phẩm):');
      if (code && code.trim()) {
        navigate(`/customer/product?code=${encodeURIComponent(code.trim())}`);
      }
    }
  };

  const categories = [
    { name: 'Gia dụng', icon: <Wind size={24} /> },
    { name: 'Năng lượng', icon: <Zap size={24} /> },
    { name: 'Điện thoại', icon: <Smartphone size={24} /> },
    { name: 'Tivi', icon: <Tv size={24} /> },
  ];

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-white p-4 flex justify-between items-center shadow-sm z-10">
        <span className="font-bold text-xl text-blue-600">ProductTrace</span>
        <div className="flex items-center gap-2">
            <button className="p-2 text-slate-600"><Bell size={20} /></button>
            <div 
              onClick={() => navigate('/customer/profile')}
              className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-slate-600">{user?.full_name?.charAt(0)}</span>
              )}
            </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <section>
          <h1 className="text-xl font-bold text-slate-900">Xin chào,</h1>
          <p className="text-lg font-semibold text-slate-700">{user?.full_name || 'Khách hàng'}</p>
          <p className="text-sm text-slate-500 mt-1">Tất cả sản phẩm của bạn đều được bảo vệ và truy xuất</p>
        </section>

        {/* Summary Card Section */}
        <section className="grid grid-cols-3 gap-2">
          {[ { label: 'Sản phẩm', value: '12', icon: <Package size={16} /> }, { label: 'Bảo hành', value: '5', icon: <ShieldCheck size={16} /> }, { label: 'Sắp hết hạn', value: '2', icon: <Clock size={16} /> } ].map((item, i) => (
            <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
                <div className="text-slate-400 mb-1">{item.icon}</div>
                <span className="text-lg font-bold text-slate-900">{item.value}</span>
                <span className="text-[10px] text-slate-500 font-medium">{item.label}</span>
            </div>
          ))}
        </section>

        {/* Search Section */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Serial number, tên sản phẩm..." 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm" 
          />
        </form>

        {/* Main Actions Section */}
        <section className="grid grid-cols-2 gap-4">
          <button onClick={handleScanMock} className="bg-blue-600 rounded-2xl p-4 flex flex-col items-center gap-2 text-white shadow-lg cursor-pointer">
            <QrCode size={32} />
            <span className="font-semibold">Quét QR</span>
          </button>
          <button onClick={() => handleSearchSubmit()} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-2 text-slate-900 shadow-sm cursor-pointer">
            <Search size={32} className="text-blue-600" />
            <span className="font-semibold">Tra cứu</span>
          </button>
        </section>

        {/* Quick Banner */}
        <section className="bg-blue-100 p-4 rounded-xl text-blue-900 font-medium text-sm">
           Vừa mua sản phẩm mới? Đăng ký sở hữu để kích hoạt bảo hành.
        </section>

        {/* Categories */}
        <section className="grid grid-cols-4 gap-3">
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
        </section>
        
        {/* Featured Products */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Flame className="text-orange-500" size={24} /> Sản phẩm nổi bật
          </h2>
          {isLoadingProducts ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">Không có sản phẩm nào</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {products.map(p => (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(`/customer/product?id=${p.id}`)}
                  className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col cursor-pointer relative overflow-hidden"
                >
                  {p.isHot && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">HOT</div>
                  )}
                  <div className="w-full aspect-square bg-slate-100 rounded-xl mb-3 flex items-center justify-center text-slate-400 overflow-hidden">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Tag size={40} />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mb-1 font-medium">{p.category}</p>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-2 leading-snug">{p.name}</h3>
                  <p className="text-md font-extrabold text-blue-600 mt-auto">{p.price}</p>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Nearby Stores Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-800">Gần bạn</h2>
              <button className="text-sm text-blue-600 font-semibold bg-transparent border-none cursor-pointer">Xem bản đồ</button>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
               <MapPin className="text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Cửa hàng ủy quyền A</p>
              <p className="text-xs text-slate-500">123 Nguyễn Huệ - 500m</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
