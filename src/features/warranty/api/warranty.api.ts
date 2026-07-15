import apiClient, { ApiResponse } from '../../../api/axios';

// ─── Request / Response Types ─────────────────────────────────────────────────

export interface CustomerRequestWarrantyReq {
  serialNumber: string;
  itemCode: string;
  ownerName: string;
  ownerEmail?: string;
  note: string;
}

export interface CreateWarrantyReq {
  itemCode: string;
  itemName?: string;
  serialNumber: string;
  ownerName: string;
  ownerEmail?: string;
  warrantyCode: string;
  policyName: string;
  policyDescription?: string;
  durationMonths: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  invoiceNumber?: string;
  note?: string;
}

export interface ApproveWarrantyReq {
  durationMonths: number;
  policyName: string;
}

export interface RejectWarrantyReq {
  reason: string;
}

export interface VoidWarrantyReq {
  reason: string;
}

export interface Warranty {
  id: string;
  itemCode: string;
  itemName: string;
  serialNumber: string;
  ownerName: string;
  ownerEmail: string;
  warrantyCode: string;
  policyName: string;
  policyDescription: string;
  durationMonths: number;
  status: string;
  startDate: string;
  endDate: string;
  invoiceNumber: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRequestWarrantyResponse {
  message: string;
  data: Warranty;
}

// ─── Warranty API ─────────────────────────────────────────────────────────────

export const warrantyApi = {
  // Create / Activate Warranty (Admin/Staff)
  activateWarranty: (payload: CreateWarrantyReq) =>
    apiClient.post<ApiResponse<Warranty>>('/warranties', payload),

  // Request Warranty (Customer)
  requestWarranty: (payload: CustomerRequestWarrantyReq) =>
    apiClient.post<CustomerRequestWarrantyResponse>('/warranties/request', payload),

  // List all warranties (Admin/Staff)
  listWarranties: () =>
    apiClient.get<ApiResponse<Warranty[]>>('/warranties'),

  // List my warranties (Customer)
  listMyWarranties: () =>
    apiClient.get<ApiResponse<Warranty[]>>('/warranties/my'),

  // Get warranty detail by ID
  getById: (id: string) =>
    apiClient.get<ApiResponse<Warranty>>(`/warranties/${id}`),

  // Get warranty by product item ID
  getByProductItemId: (productItemId: string) =>
    apiClient.get<ApiResponse<Warranty>>(`/warranties/product-item/${productItemId}`),

  // Approve warranty request (Admin/Staff)
  approveWarranty: (id: string, payload: ApproveWarrantyReq) =>
    apiClient.put<ApiResponse<Warranty>>(`/warranties/${id}/approve`, payload),

  // Reject warranty request (Admin/Staff)
  rejectWarranty: (id: string, payload: RejectWarrantyReq) =>
    apiClient.put<ApiResponse<Warranty>>(`/warranties/${id}/reject`, payload),

  // Void/Cancel warranty (Admin/Staff)
  voidWarranty: (id: string, payload: VoidWarrantyReq) =>
    apiClient.put<ApiResponse<Warranty>>(`/warranties/${id}/void`, payload),
};
