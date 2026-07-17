import apiClient from '../../../api/axios';

export interface CreateClaimReq {
  serialNumber: string
  issueTitle: string
  issueDescription: string
  contactPhone: string
  contactEmail?: string
}

export interface UpdateClaimStatusReq {
  status: string
  resolutionNote?: string
}

export interface WarrantyClaimResponse {
  id: string
  warrantyId: string
  productItemId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  issueTitle: string
  issueDescription: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_REPAIR' | 'COMPLETED'
  resolutionNote?: string
  createdAt: string
  updatedAt: string
}

export const warrantyClaimApi = {
  createClaim: async (data: CreateClaimReq) => {
    return apiClient.post<{ message: string; data: WarrantyClaimResponse }>('/warranty-claims', data)
  },
  
  getMyClaims: async () => {
    return apiClient.get<{ message: string; data: WarrantyClaimResponse[] }>('/warranty-claims/my')
  },
  
  getAllClaims: async () => {
    return apiClient.get<{ message: string; data: WarrantyClaimResponse[] }>('/warranty-claims')
  },
  
  updateClaimStatus: async (id: string, data: UpdateClaimStatusReq) => {
    return apiClient.put<{ message: string; data: WarrantyClaimResponse }>(`/warranty-claims/${id}/status`, data)
  },
  
  getClaimById: async (id: string) => {
    return apiClient.get<{ message: string; data: WarrantyClaimResponse }>(`/warranty-claims/${id}`)
  }
}
