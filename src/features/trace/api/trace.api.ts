/**
 * trace.api.ts
 *
 * API layer cho module Trace.
 * - Dùng lại `apiClient` (Axios instance) đã có Bearer Token interceptor.
 * - GET /trace/search: Public, rate-limited 30 req/min (xử lý ở BE/Kong).
 * - POST /trace/export/*: Yêu cầu Bearer Token.
 *
 * Response export:
 *   - HTTP 200 → binary file (PDF/Excel) — dùng responseType: 'blob'
 *   - HTTP 202 → ExportJobResponse (async job)
 */

import apiClient, { ApiResponse } from '../../../api/axios';
import {
  TraceSearchParams,
  TraceSearchResponse,
  TracePDFExportRequest,
  TraceExcelExportRequest,
  ExportJobResponse,
  VerifyQRResponse,
} from './trace.types';

export const traceApi = {
  /**
   * GET /api/trace/search
   * Auth: Public (rate-limited 30 req/min bởi Kong/BE)
   * `code` bắt buộc (min=3, max=100)
   */
  search: (params: TraceSearchParams) =>
    apiClient.get<ApiResponse<TraceSearchResponse>>('/trace/search', { params }),

  /**
   * GET /api/public/verify
   * Auth: Public (Xác thực sản phẩm từ QR)
   * `item_code` và `token` bắt buộc
   */
  verifyQR: (itemCode: string, token: string) =>
    apiClient.get<ApiResponse<VerifyQRResponse>>('/public/verify', {
      params: { item_code: itemCode, token },
    }),

  /**
   * POST /api/trace/export/pdf
   * Auth: Bearer Token (authenticated users)
   * Response:
   *   - 200: PDF binary (nếu sync)
   *   - 202: ExportJobResponse (nếu async)
   * Dùng responseType: 'blob' để handle cả hai.
   */
  exportPDF: (payload: TracePDFExportRequest) =>
    apiClient.post<Blob | ApiResponse<ExportJobResponse>>('/trace/export/pdf', payload, {
      responseType: 'blob',
    }),

  /**
   * POST /api/trace/export/excel
   * Auth: Bearer Token
   * Response:
   *   - 200: Excel binary (nếu sync)
   *   - 202: ExportJobResponse (nếu async)
   */
  exportExcel: (payload: TraceExcelExportRequest) =>
    apiClient.post<Blob | ApiResponse<ExportJobResponse>>('/trace/export/excel', payload, {
      responseType: 'blob',
    }),
};

