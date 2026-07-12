import apiClient, { ApiResponse } from '../../../api/axios';

// ─── Request / Response Types ─────────────────────────────────────────────────

export interface CustomerRequestOTPReq {
  qr_code: string;
}

export interface AdminRequestOTPReq {
  qr_code: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
}

export interface OTPResponse {
  message: string;
  email: string;
}

export interface CustomerRegisterReq {
  otp: string;
  product_id: string; // matches product_item_id UUID
}

export interface AdminRegisterReq {
  otp: string;
  product_id: string;
  owner_email: string;
}

export interface TransferOwnershipReq {
  new_owner_name: string;
  new_owner_email: string;
  new_owner_phone?: string;
  new_owner_address?: string;
}

export interface OwnershipSummaryRes {
  ownership_id: string;
  product_id: string;
  status: 'ACTIVE' | 'TRANSFERRED' | 'REVOKED';
  registration_date: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  product_name: string;
  product_sku: string;
}

export interface OwnershipHistoryItem {
  ownership_id: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  status: string;
  registration_date: string;
  ended_at?: string;
}

export interface OwnershipDetailRes {
  ownership_id: string;
  product_id: string;
  status: 'ACTIVE' | 'TRANSFERRED' | 'REVOKED';
  registration_date: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  product_name: string;
  product_sku: string;
  ownership_history: OwnershipHistoryItem[];
}

export interface SearchOwnershipsParams {
  page?: number;
  limit?: number;
  ownership_status?: string;
  product_item_id?: string;
  owner_id?: string;
  product_code?: string;
  product_name?: string;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
}

export interface PaginatedOwnershipsRes {
  data: OwnershipSummaryRes[];
  total_items: number;
  total_pages: number;
  page: number;
  limit: number;
}

// ─── Ownership API ────────────────────────────────────────────────────────────

export const ownershipApi = {
  // Request OTP (Customer)
  requestOTP: (payload: CustomerRequestOTPReq) =>
    apiClient.post<ApiResponse<OTPResponse>>('/ownership/request-otp', payload),

  // Verify OTP & Register (Customer)
  register: (payload: CustomerRegisterReq) =>
    apiClient.post<ApiResponse<OwnershipDetailRes>>('/ownership/register', payload),

  // Request OTP (Admin/Dealer)
  adminRequestOTP: (payload: AdminRequestOTPReq) =>
    apiClient.post<ApiResponse<OTPResponse>>('/ownership/admin/request-otp', payload),

  // Verify OTP & Register (Admin/Dealer)
  adminRegister: (payload: AdminRegisterReq) =>
    apiClient.post<ApiResponse<OwnershipDetailRes>>('/ownership/admin/register', payload),

  // Transfer Ownership (Customer/Admin)
  transfer: (id: string, payload: TransferOwnershipReq) =>
    apiClient.put<ApiResponse<OwnershipDetailRes>>(`/ownership/${id}/transfer`, payload),

  // Search & List Ownerships
  search: (params?: SearchOwnershipsParams) =>
    apiClient.get<ApiResponse<PaginatedOwnershipsRes>>('/ownership', { params }),

  // Get Ownership Detail
  getById: (id: string) =>
    apiClient.get<ApiResponse<OwnershipDetailRes>>(`/ownership/detail/${id}`),

  // Revoke/Delete Ownership (Admin/Staff)
  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/ownership/${id}`),
};
