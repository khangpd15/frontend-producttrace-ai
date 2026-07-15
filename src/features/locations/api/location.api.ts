import apiClient, { ApiResponse } from '../../../api/axios';

// ─── Request / Response Types ─────────────────────────────────────────────────

export type LocationType = 'WAREHOUSE' | 'STORE' | 'DEALER' | 'WARRANTY_CENTER';

export interface CreateLocationRequest {
  ownerUserId: string;
  code: string;
  name: string;
  type: LocationType;
  phone?: string;
  email?: string;
  address?: string;
  ward: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  openingHoursJson?: Record<string, any>;
}

export interface UpdateLocationRequest {
  name: string;
  type: LocationType;
  phone?: string;
  email?: string;
  address?: string;
  ward?: string;
  district?: string;
  city?: string;
  latitude: number;
  longitude: number;
  isActive?: boolean;
  openingHoursJson?: Record<string, any>;
}

export interface ListLocationsParams {
  page?: number;
  limit?: number;
  city?: string;
  status?: string; // ALL, ACTIVE, INACTIVE
  type?: string;   // ALL, WAREHOUSE, STORE, DEALER, WARRANTY_CENTER
  keyword?: string;
}

export interface LocationResponse {
  id: string;
  ownerUserId: string;
  code: string;
  name: string;
  type: LocationType;
  phone: string;
  email: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  openingHoursJson?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ListLocationsResponse {
  data: LocationResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Location API ─────────────────────────────────────────────────────────────

export const locationApi = {
  list: (params?: ListLocationsParams) =>
    apiClient.get<ApiResponse<ListLocationsResponse>>('/locations', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<LocationResponse>>(`/locations/${id}`),

  create: (payload: CreateLocationRequest) =>
    apiClient.post<ApiResponse<LocationResponse>>('/locations', payload),

  update: (id: string, payload: UpdateLocationRequest) =>
    apiClient.put<ApiResponse<LocationResponse>>(`/locations/${id}`, payload),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/locations/${id}`),
};
