import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { tokenStorage } from './tokenStorage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  data: null;
}

// ─── Axios instance ───────────────────────────────────────────────────────────

const baseURL = import.meta.env.VITE_API_URL ?? '/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
  headers: { 
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  withCredentials: true,
});

// ─── Request Interceptor: attach Authorization header ─────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Định nghĩa các route không cần Token (Auth và NestJS AI Search)
    const isPublicRoute = config.url && (
      config.url.includes('/auth/') || 
      config.url.includes('/geo-search') // NestJS không cần JWT
    );

    const token = tokenStorage.getAccessToken();
    const isValidToken = token && 
      token !== 'null' && 
      token !== 'undefined' && 
      token !== '""' && 
      token.trim() !== '';

    if (isValidToken && !isPublicRoute && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response Interceptor: auto refresh on 401 ───────────────────────────────

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function subscribeToRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;

    // Chỉ refresh cho các route Auth, không refresh cho NestJS AI Search
    const isPublicAuthRoute = originalRequest?.url && (
      originalRequest.url.includes('/auth/')
    );

    if (status !== 401 || originalRequest?._retry || !isPublicAuthRoute) {
      return Promise.reject(error);
    }

    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      tokenStorage.clearTokens();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<AxiosResponse>((resolve, reject) => {
        subscribeToRefresh((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          }
          resolve(apiClient(originalRequest));
          void reject;
        });
      });
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const { data } = await axios.post<ApiResponse<{ access_token: string; refresh_token: string }>>(
        `${baseURL}/auth/refresh`,
        { refresh_token: refreshToken },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          withCredentials: true,
        },
      );

      const { access_token, refresh_token } = data.data;
      tokenStorage.setAccessToken(access_token);
      tokenStorage.setRefreshToken(refresh_token);

      apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      onRefreshed(access_token);

      if (originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      tokenStorage.clearTokens();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export function parseApiError(error: any): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) return error.message;
    return 'Hệ thống đang gặp sự cố.';
  }

  if (!error.response) return 'Không thể kết nối tới máy chủ.';

  const status = error.response.status;
  const data = error.response.data as any;

  if (status === 401) return 'Phiên đăng nhập đã hết hạn.';
  if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
  if (status === 500) return 'Hệ thống đang gặp sự cố.';

  if (data) {
    const backendMsg = data.message || data.error;
    if (backendMsg && typeof backendMsg === 'string') return backendMsg;
  }

  return 'Yêu cầu không hợp lệ.';
}

export default apiClient;