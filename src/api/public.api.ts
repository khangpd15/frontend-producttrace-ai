import { apiClient, ApiResponse } from './axios';

export interface VerifyQRBatchInfo {
  batch_code: string;
  manufacture_date: string | null;
  expiry_date: string | null;
  manufacturer_name: string;
  supplier_name: string;
  origin_country: string;
  production_place: string;
  batch_status: string;
}

export interface VerifyQRProductInfo {
  product_name: string;
  variant_name: string;
  variant_sku: string;
}

export interface VerifyQRResponse {
  item_code: string;
  serial_number: string;
  item_status: string;
  scanned_at: string;
  batch: VerifyQRBatchInfo;
  product: VerifyQRProductInfo;
}

export const publicApi = {
  verifyQR: (itemCode: string, token: string) =>
    apiClient.get<ApiResponse<VerifyQRResponse>>('/public/verify', {
      params: { item_code: itemCode, token },
    }),
};
