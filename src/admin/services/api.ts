import axios from 'axios';
import { tokenStorage } from '../../api/tokenStorage';

// VITE_API_URL được cấu hình trong file .env (ví dụ: VITE_API_URL=http://localhost:8080)
// Nếu không có biến môi trường, mặc định trỏ về localhost:8080 (Golang backend)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // timeout 10 giây
});

// ---- Request Interceptor ----
// Tự động đính kèm JWT token (nếu có) vào mọi request
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response Interceptor ----
// Xử lý lỗi tập trung: 401 Unauthorized, 403 Forbidden, v.v.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ → xóa token, redirect về trang login (nếu có)
      tokenStorage.clearTokens();
      console.error('[API] Phiên đăng nhập hết hạn.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;