import apiClient from '../../../api/axios';

// ─── Request / Response Types ─────────────────────────────────────────────────

export interface CreateWarrantyClaimReq {
  product_id: string; // product_item_id UUID
  issue_title: string;
  issue_description: string;
  contact_phone: string;
  contact_email?: string;
  preferred_service_center?: string; // UUID of service center
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
  // Create Warranty Claim (Customer)
  createClaim: (payload: CreateWarrantyClaimReq) =>
    apiClient.post<CreateWarrantyClaimResponse>('/warranty-claims', payload),
};
