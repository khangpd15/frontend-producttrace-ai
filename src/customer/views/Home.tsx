import { QrCode, Search, MapPin, Bell, Package, ShieldCheck, Clock, Tag, Smartphone, Tv, Zap, Flame, Wind, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/auth.store';
import { productApi } from '../../features/products/api/product.api';
import { ownershipApi, OwnershipSummaryRes } from '../../features/ownership/api/ownership.api';
import { locationApi } from '../../features/locations/api/location.api';
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

// Hàm tính khoảng cách địa lý (Haversine)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function Home({ onScan, onBellClick }: { onScan?: () => void; onBellClick?: () => void }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [searchVal, setSearchVal] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [statTotal, setStatTotal] = useState<number | null>(null);
  const [statActive, setStatActive] = useState<number | null>(null);
  const [statExpiringSoon, setStatExpiringSoon] = useState<number | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  // Nearby Stores States
  const [nearbyStores, setNearbyStores] = useState<Array<any>>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [isStoreMode, setIsStoreMode] = useState(true);
  const [radius, setRadius] = useState<string>('');
  const [locKeyword, setLocKeyword] = useState('');

  // 1. Lấy tọa độ người dùng
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  // 2. Fetch Thống kê
  useEffect(() => {
    async function fetchStats() {
      setIsLoadingStats(true);
      try {
        const { data } = await ownershipApi.search({ page: 1, limit: 200 });
        const ownerships: OwnershipSummaryRes[] = data.data?.data || [];
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const active = ownerships.filter((o) => o.status === 'ACTIVE');
        const expiring = active.filter((o) => {
          if (!o.registration_date) return false;
          const expiryDate = new Date(o.registration_date);
          expiryDate.setFullYear(expiryDate.getFullYear() + 2);
          return expiryDate >= now && expiryDate <= thirtyDaysFromNow;
        });
        setStatTotal(ownerships.length);
        setStatActive(active.length);
        setStatExpiringSoon(expiring.length);
      } catch (err) { console.error(err); } finally { setIsLoadingStats(false); }
    }
    fetchStats();
  }, []);

  // 3. Fetch Sản phẩm
  useEffect(() => {
    async function fetchProducts() {
      setIsLoadingProducts(true);
      try {
        const { data } = await productApi.getAll({ page: 1, limit: 10, status: 'ACTIVE' });
        const items = data.data.items || [];
        setProducts(items.map((p: any, i: number) => ({
          id: p.id, name: p.name, category: p.category || 'Thiết bị', price: 'Chi tiết', status: p.status, imageUrl: p.thumbnail_url || '', isHot: i % 2 === 0,
        })));
      } catch (err) { console.error(err); } finally { setIsLoadingProducts(false); }
    }
    fetchProducts();
  }, []);

  // 4. Fetch Cửa hàng (Có Filter)
  useEffect(() => {
    async function fetchNearby() {
      try {
        const { data } = await locationApi.list({ limit: 50, status: 'ACTIVE' });
        const list = data.data?.data || [];
        const typeFilter = isStoreMode ? 'STORE' : 'WARRANTY_CENTER';
        
        let filtered = list.filter((l: any) => {
          const matchType = l.type === typeFilter;
          const keyword = locKeyword.toLowerCase().trim();
          const matchKeyword = (isStoreMode && keyword !== '') 
            ? (l.name.toLowerCase().includes(keyword) || l.inventory?.some((item: any) => item.name.toLowerCase().includes(keyword)))
            : true;
          return matchType && matchKeyword;
        });
        
        if (userCoords) {
          const searchRadiusKm = (radius.trim() === '' || isNaN(Number(radius))) ? 20 : Number(radius) / 1000;
          filtered = filtered.map((s: any) => ({ 
            ...s, distance: getDistance(userCoords.lat, userCoords.lng, s.latitude, s.longitude) 
          })).filter((s: any) => s.distance <= searchRadiusKm);
          filtered.sort((a: any, b: any) => a.distance - b.distance);
        }
        
        const uniqueList = Array.from(new Map(filtered.map((item: any) => [item.id, item])).values());
        setNearbyStores(uniqueList.slice(0, 3));
      } catch (err) { console.error(err); }
    }
    fetchNearby();
  }, [userCoords, isStoreMode, radius, locKeyword]);

  const requestLocationAndFetch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setShowFilter(false);
      }, () => alert('Vui lòng bật định vị!'));
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchVal.trim();
    if (query) navigate(`/customer/product?code=${encodeURIComponent(query)}`);
    else navigate('/customer/products');
  };

  const handleScanMock = () => {
    if (onScan) onScan();
    else {
      const code = prompt('Quét mã QR sản phẩm:');
      if (code) navigate(`/customer/product?code=${encodeURIComponent(code)}`);
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
          <button onClick={onBellClick} className="p-2 text-slate-600">
            <Bell size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-slate-600">{user?.full_name?.charAt(0) || 'U'}</span>
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
          {[
            { label: 'Sản phẩm', value: isLoadingStats ? '…' : (statTotal !== null ? String(statTotal) : '--'), icon: <Package size={16} /> },
            { label: 'Bảo hành', value: isLoadingStats ? '…' : (statActive !== null ? String(statActive) : '--'), icon: <ShieldCheck size={16} /> },
            { label: 'Sắp hết hạn', value: isLoadingStats ? '…' : (statExpiringSoon !== null ? String(statExpiringSoon) : '--'), icon: <Clock size={16} /> },
          ].map((item, i) => (
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
                onClick={() => navigate(`/customer/products?q=${encodeURIComponent(cat.name)}`)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 cursor-pointer"
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
            <div className="flex gap-2">
              <button 
                onClick={() => setShowFilter(!showFilter)} 
                className={`p-2 rounded-lg border transition-all ${showFilter ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}
              >
                <Filter size={18} />
              </button>
              <button onClick={() => navigate('/store')} className="text-sm text-blue-600 font-semibold bg-transparent border-none cursor-pointer">
                Xem mạng lưới
              </button>
            </div>
          </div>

          {/* Filter Box */}
          {showFilter && (
            <div className="flex justify-end mb-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, x: 20 }} 
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className="w-full max-w-[280px] bg-white p-3 rounded-2xl shadow-xl border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bộ lọc</span>
                  <button 
                    onClick={() => setIsStoreMode(!isStoreMode)} 
                    className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md"
                  >
                    {isStoreMode ? 'Cửa hàng' : 'Bảo hành'}
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Bán kính (m)" 
                    className="w-1/2 text-[11px] p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500" 
                    onChange={(e) => setRadius(e.target.value)} 
                  />
                  {isStoreMode && (
                    <input 
                      type="text" 
                      placeholder="Sản phẩm..." 
                      className="w-1/2 text-[11px] p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500" 
                      onChange={(e) => setLocKeyword(e.target.value)} 
                    />
                  )}
                </div>
                
                <button 
                  onClick={requestLocationAndFetch} 
                  className="w-full bg-blue-600 text-white text-[11px] font-bold py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tìm kiếm
                </button>
              </motion.div>
            </div>
          )}

          <div className="space-y-3">
            {nearbyStores.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                <p className="text-xs text-slate-400">Không tìm thấy địa điểm nào</p>
              </div>
            ) : (
              nearbyStores.map((store) => (
                <div key={store.id} className="bg-white border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                       <MapPin className="text-blue-500" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{store.name}</p>
                      <p className="text-xs text-slate-500 truncate">{store.address}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                        {store.distance !== null && store.distance !== undefined ? `Cách ${store.distance.toFixed(1)} km` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {store.inventory && store.inventory.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-50">
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Sản phẩm có sẵn:</p>
                      <div className="flex flex-wrap gap-2">
                        {store.inventory.map((item: any, idx: number) => (
                          <span key={idx} className="bg-slate-50 text-[10px] px-2 py-1 rounded border border-slate-100 text-slate-600 font-medium">
                            {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;