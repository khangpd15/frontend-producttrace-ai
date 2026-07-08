import apiClient, { ApiResponse } from '../../../api/axios';

// ─── Auth Request / Response Types ───────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  phone: string;
  full_name: string;
  password: string;
}

export interface RegisterResponse {
  email: string;
  phone: string;
  full_name: string;
  status: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp_code: string;
  new_password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: 'ADMIN' | 'STAFF' | 'DEALER' | 'CUSTOMER';
  avatar_url?: string;
  status: 'ACTIVE' | 'PENDING' | 'BANNED' | 'SUSPENDED';
}

// ─── Auth API Functions ───────────────────────────────────────────────────────

export const authApi = {
  register: (payload: RegisterRequest) =>
    apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', payload),

  login: (payload: LoginRequest) =>
    apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload),

  verifyOtp: (payload: VerifyOtpRequest) =>
    apiClient.post<ApiResponse<null>>('/auth/verify-otp', payload),

  resendOtp: (payload: ResendOtpRequest) =>
    apiClient.post<ApiResponse<null>>('/auth/resend-otp', payload),

  forgotPassword: (payload: ForgotPasswordRequest) =>
    apiClient.post<ApiResponse<null>>('/auth/forgot-password', payload),

  resetPassword: (payload: ResetPasswordRequest) =>
    apiClient.post<ApiResponse<null>>('/auth/reset-password', payload),

  refresh: (payload: RefreshTokenRequest) =>
    apiClient.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', payload),

  logout: (refreshToken: string) =>
    apiClient.post<ApiResponse<null>>('/auth/logout', { refresh_token: refreshToken }),

  getProfile: () =>
    apiClient.get<ApiResponse<UserProfile>>('/users/profile'),
};
