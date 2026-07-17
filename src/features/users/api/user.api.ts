import apiClient, { ApiResponse } from '../../../api/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

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

/** Matches backend SearchUserRequest (GET /users/search) */
export interface SearchUserParams {
  keyword?: string;
  role?: 'ADMIN' | 'CUSTOMER' | 'STAFF' | 'DEALER';
  status?: 'ACTIVE' | 'BANNED' | 'SUSPENDED' | 'PENDING';
  page?: number;
  limit?: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const userApi = {
  /** GET /users — Admin paginated list with filters */
  list: (params?: ListUsersParams) =>
    apiClient.get<ApiResponse<UserListResponse>>('/users', { params }),

  /** GET /users/search — Search users by keyword, role, status */
  search: (params?: SearchUserParams) =>
    apiClient.get<ApiResponse<UserListResponse>>('/users/search', { params }),

  /** GET /users/:id */
  getById: (id: string) =>
    apiClient.get<ApiResponse<UserResponse>>(`/users/${id}`),

  /** POST /users */
  create: (payload: CreateUserRequest) =>
    apiClient.post<ApiResponse<UserResponse>>('/users', payload),

  /** PUT /users/:id */
  update: (id: string, payload: UpdateUserRequest) =>
    apiClient.put<ApiResponse<UserResponse>>(`/users/${id}`, payload),

  /** DELETE /users/:id */
  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/users/${id}`),

  /** PUT /users/:id/lock — Lock (SUSPEND) a user account */
  lockAccount: (id: string) =>
    apiClient.put<ApiResponse<UserResponse>>(`/users/${id}/lock`),

  /** PUT /users/:id/unlock — Unlock (ACTIVE) a user account */
  unlockAccount: (id: string) =>
    apiClient.put<ApiResponse<UserResponse>>(`/users/${id}/unlock`),
};
