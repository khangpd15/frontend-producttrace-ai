/**
 * location.api.ts
 *
 * API layer cho module Location.
 * - GET /api/locations — public endpoint, không cần auth (theo router.go).
 * - Dùng apiClient để đồng nhất với các module khác.
 */

import apiClient, { ApiResponse } from '../../../api/axios';
import { ListLocationsResponse, GetLocationsParams } from './location.types';

export const locationApi = {
  /**
   * GET /api/locations
   * Auth: Public (không cần Bearer Token).
   * Trả về danh sách location có phân trang và filter.
   */
  getList: (params?: GetLocationsParams) =>
    apiClient.get<ApiResponse<ListLocationsResponse>>('/locations', { params }),
};
