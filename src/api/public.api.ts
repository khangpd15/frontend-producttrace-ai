import { apiClient, ApiResponse } from './axios';

// ─── Sub-types matching BE Go JSON tags (camelCase) ───────────────────────────

export interface VerifyQRProductInfo {
  productName: string;
  description: string;
  thumbnailUrl: string;
  categoryName: string;
  variantName: string;
  variantSku: string;
  barcode: string;
}

export interface VerifyQRBatchInfo {
  batchCode: string;
  manufactureDate: string | null;
  expiryDate: string | null;
  manufacturerName: string;
  supplierName: string;
  originCountry: string;
  productionPlace: string;
  batchStatus: string;
}

export interface VerifyQROwnership {
  ownerName: string;
  registeredAt: string;
  ownershipType: string;
  status: string;
}

export interface VerifyQRWarranty {
  claimNumber: string;
  status: string;
  createdAt: string;
}

export interface VerifyQRLocation {
  name: string;
  type: string;
  address: string;
  city: string;
}

export interface VerifyQREvent {
  eventType: string;
  title: string;
  description: string;
  location: string;
  actorName: string;
  occurredAt: string;
}

export interface VerifyQRResponse {
  itemCode: string;
  serialNumber: string;
  itemStatus: string;
  scannedAt: string;
  product: VerifyQRProductInfo;
  batch: VerifyQRBatchInfo;
  ownership: VerifyQROwnership | null;
  warranty: VerifyQRWarranty | null;
  location: VerifyQRLocation | null;
  traceHistory: VerifyQREvent[];
}

export const publicApi = {
  verifyQR: (itemCode: string, token: string) =>
    apiClient.get<ApiResponse<VerifyQRResponse>>('/public/verify', {
      params: { item_code: itemCode, token },
    }),
};
