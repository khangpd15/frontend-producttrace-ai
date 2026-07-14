import apiClient, { ApiResponse } from '../../../api/axios';

export interface CustomerRequestOTPReq {
  qr_code: string;
}

export interface CustomerVerifyAndRegisterReq {
  otp: string;
  product_id: string; // the product_id string (UUID)
}

export interface OwnershipSummaryRes {
  ownership_id: string;
  product_id: string;
  status: string;
  registration_date: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  product_name: string;
  product_sku: string;
}

export interface PaginatedOwnershipsRes {
  data: OwnershipSummaryRes[];
  total_items: number;
  total_pages: number;
  page: number;
  limit: number;
}

export const ownershipApi = {
  requestOTP: (payload: CustomerRequestOTPReq) =>
    apiClient.post<ApiResponse<{product_id: string}>>('/ownership/request-otp', payload),

  verifyAndRegister: (payload: CustomerVerifyAndRegisterReq) =>
    apiClient.post<ApiResponse<any>>('/ownership/register', payload),

  getMyOwnerships: (page = 1, limit = 10) =>
    apiClient.get<ApiResponse<PaginatedOwnershipsRes>>(`/ownership?page=${page}&limit=${limit}`),
};
