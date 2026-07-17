import React, { useState } from 'react';
import { locationApi } from '../api/location.api';
import { Loader2 } from 'lucide-react'; // Cài thêm icon loading nếu bạn có, hoặc dùng text

interface GeoFilterPanelProps {
  onSearchSuccess: (data: any[]) => void;
}

export const GeoFilterPanel: React.FC<GeoFilterPanelProps> = ({ onSearchSuccess }) => {
  const [radius, setRadius] = useState('5000');
  const [productKeyword, setProductKeyword] = useState('');
  const [isStoreMode, setIsStoreMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    // 1. Kiểm tra đầu vào cơ bản
    if (parseInt(radius) < 0) {
      alert("Bán kính không thể âm!");
      return;
    }

    setIsLoading(true);
    try {
      const params = {
        lat: 10.034,
        lng: 105.783,
        radius: parseInt(radius) || 5000,
        type: isStoreMode ? ('STORE' as const) : ('WARRANTY_CENTER' as const),
        product: isStoreMode ? productKeyword : undefined,
      };

      const result = await locationApi.getNearby(params);
      
      // 2. Xử lý dữ liệu an toàn
      const data = result.data?.data || [];
      
      if (data.length === 0) {
        alert("Không tìm thấy địa điểm nào trong phạm vi này.");
      }
      
      onSearchSuccess(data);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      alert("Đã có lỗi xảy ra khi kết nối tới máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 w-80 bg-white p-4 shadow-2xl border border-slate-200 rounded-2xl z-50">
      <h3 className="font-bold text-sm mb-3 text-slate-800">Tìm kiếm nhanh</h3>
      
      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setIsStoreMode(true)}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg ${isStoreMode ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
        >
          Cửa hàng
        </button>
        <button 
          onClick={() => setIsStoreMode(false)}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg ${!isStoreMode ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
        >
          Bảo hành
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Phạm vi (mét)</label>
          <input 
            type="number"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>

        {isStoreMode && (
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Sản phẩm</label>
            <input 
              type="text"
              placeholder="Ví dụ: iPhone..."
              value={productKeyword}
              onChange={(e) => setProductKeyword(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        )}

        <button 
          onClick={handleSearch}
          disabled={isLoading}
          className={`w-full py-2 bg-blue-600 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
        >
          {isLoading ? (
             <>
               <Loader2 className="animate-spin" size={16} /> Đang tìm...
             </>
          ) : 'Tìm kiếm'}
        </button>
      </div>
    </div>
  );
};