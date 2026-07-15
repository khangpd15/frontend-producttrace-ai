import apiClient, { ApiResponse } from '../../../api/axios';
import type { AdminProduct, AdminProductDetailProduct } from '../../../shared/types/domain';

// ─── Request / Response Types ─────────────────────────────────────────────────

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category_id?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateVariantRequest {
  sku: string;
  name: string;
  barcode?: string;
  price?: number;
  currency?: string;
  images: string[];
}

export interface CreateProductRequest {
  name: string;
  slug: string;
  category_id: string;
  description?: string;
  thumbnail_url?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  status: 'ACTIVE' | 'DRAFT' | 'DISCONTINUED';
  variants: CreateVariantRequest[];
}

export interface UpdateProductRequest {
  name?: string;
  slug?: string;
  category_id?: string;
  description?: string;
  thumbnail_url?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  status?: 'ACTIVE' | 'DRAFT' | 'DISCONTINUED';
}

export interface UpdateVariantRequest {
  sku?: string;
  name?: string;
  barcode?: string;
  price?: number;
  currency?: string;
  images?: string[];
  status?: string;
}

// ─── Product API ──────────────────────────────────────────────────────────────

export const productApi = {
  getAll: (params?: ProductListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<AdminProduct>>>('/products', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<AdminProductDetailProduct>>(`/products/${id}`),

  create: (payload: CreateProductRequest) =>
    apiClient.post<ApiResponse<AdminProduct>>('/products', payload),

  update: (id: string, payload: UpdateProductRequest) =>
    apiClient.put<ApiResponse<AdminProduct>>(`/products/${id}`, payload),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/products/${id}`),

  // Variant management endpoints
  updateVariant: (id: string, payload: UpdateVariantRequest) =>
    apiClient.put<ApiResponse<any>>(`/variants/${id}`, payload),

  deleteVariant: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/variants/${id}`),
};
