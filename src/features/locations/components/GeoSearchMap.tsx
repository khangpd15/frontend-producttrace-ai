import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { locationApi } from '../api/location.api';
import { LocationResponse } from '../api/location.api';

export const GeoSearchMap: React.FC = () => {
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNearbyLocations = () => {
    setLoading(true);
    setError(null);

    // Sử dụng Geolocation API của trình duyệt
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Gọi hàm getNearby từ file API (tự động dùng Mock Data nếu USE_MOCK = true)
          const response = await locationApi.getNearby({ 
            lat: latitude, 
            lng: longitude,
            radius: 5000 
          });

          // Lấy dữ liệu từ cấu trúc response
          setLocations(response.data.data.data);
        } catch (err) {
          setError("Không thể tải danh sách cửa hàng.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError("Vui lòng cho phép truy cập vị trí để tìm cửa hàng gần bạn.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-50 flex justify-between items-center">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <Navigation size={18} className="text-blue-500" /> Cửa hàng gần bạn
        </h2>
        <button 
          onClick={fetchNearbyLocations}
          disabled={loading}
          className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
        >
          {loading ? 'Đang dò...' : 'Tìm quanh đây'}
        </button>
      </div>

      {error && (
        <p className="p-4 text-red-500 text-xs bg-red-50">{error}</p>
      )}

      <div className="divide-y divide-slate-50 max-h-60 overflow-y-auto">
        {locations.length === 0 && !loading && (
          <p className="p-4 text-slate-400 text-xs text-center">Nhấn "Tìm quanh đây" để hiện cửa hàng</p>
        )}
        
        {locations.map((loc) => (
          <div key={loc.id} className="p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <MapPin size={18} />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900">{loc.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{loc.address}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};