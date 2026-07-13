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
    // Exclude public auth endpoints from getting the Authorization header
    const isPublicAuthRoute = config.url && (
      config.url.includes('/auth/login') ||
      config.url.includes('/auth/register') ||
      config.url.includes('/auth/verify-otp') ||
      config.url.includes('/auth/resend-otp') ||
      config.url.includes('/auth/forgot-password') ||
      config.url.includes('/auth/reset-password') ||
      config.url.includes('/auth/refresh')
    );

    const token = tokenStorage.getAccessToken();
    // Validate that the token is not a falsy string representation or empty
    const isValidToken = token && 
      token !== 'null' && 
      token !== 'undefined' && 
      token !== '""' && 
      token.trim() !== '';

    if (isValidToken && !isPublicAuthRoute && config.headers) {
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

    // Exclude public auth endpoints from token refresh
    const isPublicAuthRoute = originalRequest?.url && (
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/register') ||
      originalRequest.url.includes('/auth/verify-otp') ||
      originalRequest.url.includes('/auth/resend-otp') ||
      originalRequest.url.includes('/auth/forgot-password') ||
      originalRequest.url.includes('/auth/reset-password') ||
      originalRequest.url.includes('/auth/refresh')
    );

    // Only attempt refresh on 401, if we haven't retried yet, and if it's not a public auth endpoint
    if (status !== 401 || originalRequest?._retry || isPublicAuthRoute) {
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

export function parseApiError(error: any): string {
  // If it's not an Axios error
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) return error.message;
    return 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.';
  }

  // Network/Connection error (no response received)
  if (!error.response) {
    return 'Không thể kết nối tới máy chủ.';
  }

  const status = error.response.status;
  const data = error.response.data as any;

  // 401 Unauthorized
  if (status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }

  // 403 Forbidden
  if (status === 403) {
    return 'Bạn không có quyền thực hiện thao tác này.';
  }

  // 500 Internal Server Error
  if (status === 500) {
    return 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.';
  }

  // Check if backend message/error is available and is a friendly explanation
  if (data) {
    const backendMsg = data.message || data.error;
    
    // Check for raw validation errors to return friendly Vietnamese messages
    const checkValidationMsg = (msg: string): string | null => {
      if (msg.includes('Field validation') || msg.includes('failed on the')) {
        if (msg.includes("'Limit'") && msg.includes("'max'")) {
          return 'Giới hạn số lượng hiển thị vượt quá tối đa cho phép.';
        }
        return 'Thông tin yêu cầu không hợp lệ. Vui lòng kiểm tra lại.';
      }
      return null;
    };

    if (backendMsg && typeof backendMsg === 'string') {
      const friendlyValMsg = checkValidationMsg(backendMsg);
      if (friendlyValMsg) return friendlyValMsg;

      if (
        backendMsg !== 'INTERNAL_ERROR' &&
        backendMsg !== 'UNKNOWN_ERROR' &&
        !backendMsg.includes('Internal Server Error') &&
        !backendMsg.includes('gorm') &&
        !backendMsg.includes('SQL')
      ) {
        return backendMsg;
      }
    }

    if (data.details) {
      if (typeof data.details === 'string') {
        const friendlyValMsg = checkValidationMsg(data.details);
        if (friendlyValMsg) return friendlyValMsg;
        return data.details;
      }
      if (Array.isArray(data.details)) {
        const joinedDetails = data.details.join('\n');
        const friendlyValMsg = checkValidationMsg(joinedDetails);
        if (friendlyValMsg) return friendlyValMsg;
        return joinedDetails;
      }
    }
  }

  return 'Yêu cầu không hợp lệ. Vui lòng thử lại.';
}

export default apiClient;
