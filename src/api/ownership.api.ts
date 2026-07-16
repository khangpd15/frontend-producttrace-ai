import apiClient, { ApiResponse } from "./axios";

export interface Ownership {
  id: string;
  itemCode: string;
  itemName: string;
  serialNumber: string;
  ownerName: string;
  ownerEmail: string;
  status: string;
  ownershipType: string;
  ownedAt: string;
  purchaseDate: string;
  purchaseLocation: string;
  invoiceNumber: string;
  createdAt: string;
  updatedAt: string;
}

export const ownershipApi = {
  getOwnerships(page = 1, limit = 20) {
    return apiClient.get<ApiResponse<any>>(
      `/ownership?page=${page}&limit=${limit}`
    );
  },
  adminRequestOTP(payload: { qr_code: string, owner_name: string, owner_email: string, owner_phone?: string }) {
    return apiClient.post<ApiResponse<any>>('/ownership/admin/request-otp', payload);
  },
  adminVerifyAndRegister(payload: { otp: string, product_id: string, owner_name: string, owner_email: string, owner_phone?: string }) {
    return apiClient.post<ApiResponse<any>>('/ownership/admin/register', payload);
  },
  transferOwnership(id: string, payload: { new_owner_name: string, new_owner_email: string, new_owner_phone?: string, new_owner_address?: string }) {
    return apiClient.post<ApiResponse<any>>(`/ownership/${id}/transfer`, payload);
  },
  deleteOwnership(id: string) {
    return apiClient.delete<ApiResponse<any>>(`/ownership/${id}`);
  },
  adminApproveOwnership(payload: { ownership_id: string }) {
    return apiClient.put<ApiResponse<any>>('/ownership/admin/approve', payload);
  },
  adminRejectOwnership(payload: { ownership_id: string }) {
    return apiClient.put<ApiResponse<any>>('/ownership/admin/reject', payload);
  }
};