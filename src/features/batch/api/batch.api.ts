/**
 * batch.api.ts
 *
 * API layer cho module Batch.
 * - Dùng lại `apiClient` (Axios instance) đã có Bearer Token interceptor.
 * - Không gọi fetch trực tiếp trong component.
 * - Base URL lấy từ VITE_API_URL qua apiClient.
 * - Mọi request đều đi qua Kong Gateway.
 */

import apiClient, { ApiResponse } from '../../../api/axios';
import {
  BatchListResponse,
  BatchDetailResponse,
  BatchEventDTO,
  BatchHistoryResponse,
  BatchProductsResponse,
  SearchBatchResponse,
  BatchCreateResponse,
  BatchStatusResponse,
  CreateBatchRequest,
  ExportBatchRequest,
  GetBatchListParams,
  SearchBatchParams,
  GetBatchHistoryParams,
  GetBatchProductsParams,
} from './batch.types';

export const batchApi = {
  /**
   * GET /api/batches
   * Auth: Bearer Token (ADMIN / STAFF / DEALER)
   * Role filter: non-Admin không thấy DRAFT (xử lý ở BE)
   */
  getList: (params?: GetBatchListParams) =>
    apiClient.get<ApiResponse<BatchListResponse>>('/batches', { params }),

  /**
   * GET /api/batches/search
   * Auth: Bearer Token (ADMIN / STAFF / DEALER)
   */
  search: (params?: SearchBatchParams) =>
    apiClient.get<ApiResponse<SearchBatchResponse>>('/batches/search', { params }),

  /**
   * GET /api/batches/:batchCode
   * Auth: Public — không cần Bearer Token (dùng cho QR scan)
   * QUAN TRỌNG: param là batchCode (string), KHÔNG phải UUID
   */
  getDetail: (batchCode: string) =>
    apiClient.get<ApiResponse<BatchDetailResponse>>(`/batches/${batchCode}`),

  /**
   * GET /api/batches/:id/events
   * Auth: Bearer Token
   * param :id là UUID của batch
   */
  getEvents: (batchId: string) =>
    apiClient.get<ApiResponse<BatchEventDTO[]>>(`/batches/${batchId}/events`),

  /**
   * GET /api/batches/:id/products
   * Auth: Bearer Token (ADMIN / STAFF / DEALER)
   * param :id là UUID của batch
   */
  getProducts: (batchId: string, params?: GetBatchProductsParams) =>
    apiClient.get<ApiResponse<BatchProductsResponse>>(`/batches/${batchId}/products`, { params }),

  /**
   * GET /api/batches/:id/history
   * Auth: Bearer Token (ADMIN / STAFF only)
   * param :id là UUID của batch
   */
  getHistory: (batchId: string, params?: GetBatchHistoryParams) =>
    apiClient.get<ApiResponse<BatchHistoryResponse>>(`/batches/${batchId}/history`, { params }),

  /**
   * POST /api/batches
   * Auth: Bearer Token (ADMIN / MANUFACTURER)
   * Body: CreateBatchRequest
   */
  create: (payload: CreateBatchRequest) =>
    apiClient.post<ApiResponse<BatchCreateResponse>>('/batches', payload),

  /**
   * PATCH /api/batches/:id/status
   * Auth: Bearer Token (ADMIN / MANUFACTURER)
   * param :id là UUID của batch
   */
  updateStatus: (batchId: string, status: string) =>
    apiClient.patch<ApiResponse<BatchStatusResponse>>(`/batches/${batchId}/status`, { status }),

  /**
   * DELETE /api/batches/:id
   * Auth: Bearer Token (ADMIN / MANUFACTURER)
   * param :id là UUID của batch
   */
  delete: (batchId: string) =>
    apiClient.delete<ApiResponse<null>>(`/batches/${batchId}`),

  /**
   * POST /api/batches/:id/export
   * Auth: Bearer Token (ADMIN / MANAGER / WAREHOUSE)
   * param :id là UUID của batch
   */
  export: (batchId: string, payload: ExportBatchRequest) =>
    apiClient.post<ApiResponse<null>>(`/batches/${batchId}/export`, payload),

  /**
   * GET /api/batches/export-qr/:id
   * Auth: Bearer Token (ADMIN / MANUFACTURER)
   * Response: application/pdf binary
   * Sử dụng responseType: 'blob' để download file
   */
  exportQR: (batchId: string) =>
    apiClient.get<Blob>(`/batches/export-qr/${batchId}`, { responseType: 'blob' }),
};
