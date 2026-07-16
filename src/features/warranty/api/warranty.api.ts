import apiClient from '../../../api/axios';

// ─── Shared Warranty Type (matches backend WarrantyResponse DTO) ──────────────

export interface WarrantyItem {
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
  status: string; // 'INACTIVE' | 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CLAIMED' | 'RESOLVED' | 'REJECTED' | 'CANCELLED'
  startDate: string;
  endDate: string;
  invoiceNumber: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Request Types ─────────────────────────────────────────────────────────────

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

export interface CustomerRequestWarrantyReq {
  serialNumber: string;
  itemCode: string;
  ownerName: string;
  ownerEmail?: string;
  note?: string;
}

export interface ApproveWarrantyReq {
  durationMonths: number;
  policyName: string;
}

export interface RejectWarrantyReq {
  reason: string;
}

// ─── Response envelopes ────────────────────────────────────────────────────────

export interface WarrantyListResponse {
  data: WarrantyItem[];
}

export interface WarrantySingleResponse {
  message: string;
  data: WarrantyItem;
}

// ─── Warranty Claim (Customer) ─────────────────────────────────────────────────

export interface CreateWarrantyClaimReq {
  product_id: string;
  issue_title: string;
  issue_description: string;
  contact_phone: string;
  contact_email?: string;
  preferred_service_center?: string;
  attachments?: string[];
}

export interface WarrantyClaim {
  id: string;
  claim_number: string;
  product_id: string;
  issue_title: string;
  issue_description: string;
  contact_phone: string;
  contact_email?: string;
  preferred_service_center_id?: string;
  attachments?: string[];
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export interface CreateWarrantyClaimResponse {
  message: string;
  data: WarrantyClaim;
}

// ─── Warranty API ─────────────────────────────────────────────────────────────

export const warrantyApi = {
  // List Warranties (Admin) - returns { data: WarrantyItem[] }
  listWarranties: () =>
    apiClient.get<WarrantyListResponse>('/warranties'),

  // Activate Warranty (Admin) - returns { message, data: WarrantyItem }
  activateWarranty: (payload: CreateWarrantyReq) =>
    apiClient.post<WarrantySingleResponse>('/warranties', payload),

  // Customer Requests Warranty - returns { message, data: WarrantyItem }
  requestWarranty: (payload: CustomerRequestWarrantyReq) =>
    apiClient.post<WarrantySingleResponse>('/warranties/request', payload),

  // Approve Warranty (Admin) - returns { message, data: WarrantyItem }
  approveWarranty: (id: string, payload: ApproveWarrantyReq) =>
    apiClient.put<WarrantySingleResponse>(`/warranties/${id}/approve`, payload),

  // Reject Warranty (Admin) - returns { message, data: WarrantyItem }
  rejectWarranty: (id: string, payload: RejectWarrantyReq) =>
    apiClient.put<WarrantySingleResponse>(`/warranties/${id}/reject`, payload),

  // Create Warranty Claim (Customer)
  createClaim: (payload: CreateWarrantyClaimReq) =>
    apiClient.post<CreateWarrantyClaimResponse>('/warranty-claims', payload),
};
