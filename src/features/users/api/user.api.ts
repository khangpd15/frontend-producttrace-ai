import apiClient, { ApiResponse } from '../../../api/axios';

export interface UserResponse {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: 'ADMIN' | 'STAFF' | 'DEALER' | 'CUSTOMER';
  status: 'ACTIVE' | 'PENDING' | 'BANNED' | 'SUSPENDED';
  avatar: string;
  created_at: string;
  updated_at: string;
}

export interface UserListResponse {
  items: UserResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateUserRequest {
  email: string;
  phone: string;
  full_name: string;
  password: string;
  role: 'ADMIN' | 'STAFF' | 'DEALER' | 'CUSTOMER';
}

export interface UpdateUserRequest {
  email: string;
  phone: string;
  full_name: string;
  role: 'ADMIN' | 'STAFF' | 'DEALER' | 'CUSTOMER';
  status: 'ACTIVE' | 'PENDING' | 'BANNED' | 'SUSPENDED';
  password?: string;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}

export const userApi = {
  list: (params?: ListUsersParams) =>
    apiClient.get<ApiResponse<UserListResponse>>('/users', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<UserResponse>>(`/users/${id}`),

  create: (payload: CreateUserRequest) =>
    apiClient.post<ApiResponse<UserResponse>>('/users', payload),

  update: (id: string, payload: UpdateUserRequest) =>
    apiClient.put<ApiResponse<UserResponse>>(`/users/${id}`, payload),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/users/${id}`),
};
