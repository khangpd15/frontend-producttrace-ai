import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { tokenStorage } from './tokenStorage';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Standard API response envelope from Go backend */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

/** Standard API error shape */
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
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response Interceptor: auto refresh on 401 ───────────────────────────────

/** Track ongoing refresh to avoid multiple simultaneous refresh calls */
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

    // Only attempt refresh on 401 and if we haven't retried yet
    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = tokenStorage.getRefreshToken();

    // No refresh token → force logout
    if (!refreshToken) {
      tokenStorage.clearTokens();
      // Redirect to login without importing router (avoids circular deps)
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Another request is already refreshing — queue this one
    if (isRefreshing) {
      return new Promise<AxiosResponse>((resolve, reject) => {
        subscribeToRefresh((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          }
          resolve(apiClient(originalRequest));
          void reject; // eslint-disable-line @typescript-eslint/no-unused-vars
        });
      });
    }

    // First 401 — start the refresh flow
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

      // Update axios default header
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // Notify all queued requests
      onRefreshed(access_token);

      // Retry original request with new token
      if (originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh failed — logout
      tokenStorage.clearTokens();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
