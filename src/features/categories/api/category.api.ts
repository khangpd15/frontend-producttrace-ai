import apiClient, { ApiResponse } from '../../../api/axios';

export interface CreateCategoryRequest {
  name: string;
  code: string;
  parent_id?: string | null;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateCategoryRequest {
  name?: string;
  code?: string;
  parent_id?: string | null;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface ListCategoryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  code?: string;
  parent_id?: string | null;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: CategoryResponse[];
}

export interface ListCategoryResponse {
  data: CategoryResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const categoryApi = {
  list: (params?: ListCategoryParams) =>
    apiClient.get<ApiResponse<ListCategoryResponse>>('/categories', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<CategoryResponse>>(`/categories/${id}`),

  create: (payload: CreateCategoryRequest) =>
    apiClient.post<ApiResponse<CategoryResponse>>('/categories', payload),

  update: (id: string, payload: UpdateCategoryRequest) =>
    apiClient.put<ApiResponse<CategoryResponse>>(`/categories/${id}`, payload),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/categories/${id}`),
};
