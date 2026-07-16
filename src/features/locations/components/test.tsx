import { locationApi } from '@/features/locations/api/location.api';

export const TestComponent = () => {
  const handleTestApi = async () => {
    try {
      console.log("Đang gọi API tới NestJS...");
      // Tọa độ ví dụ
      const res = await locationApi.getNearby({ lat: 10.776, lng: 106.700 });
      console.log("Kết quả từ NestJS:", res.data);
      alert("Kết nối thành công! Kiểm tra F12 Console.");
    } catch (err) {
      console.error("Lỗi rồi:", err);
      alert("Lỗi: " + JSON.stringify(err));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <button 
        onClick={handleTestApi}
        style={{ padding: '10px', background: 'red', color: 'white' }}
      >
        TEST API NESTJS
      </button>
    </div>
  );
};