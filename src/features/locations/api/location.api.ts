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

// Bật cờ này thành true để dùng dữ liệu giả (Mock) khi không có server
const USE_MOCK = true; 

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

  // Tìm kiếm địa điểm gần người dùng
  getNearby: (params: { lat: number; lng: number; radius?: number }) => {
    if (USE_MOCK) {
      return Promise.resolve({
        data: {
          data: {
            data: [
              { 
                id: 'mock-1', 
                name: 'Cửa hàng giả lập (Mock)', 
                address: '123 Đường Test, Quận 1', 
                phone: '0909000000', 
                latitude: params.lat, 
                longitude: params.lng 
              } as LocationResponse
            ],
            total: 1, page: 1, limit: 10, totalPages: 1
          }
        }
      } as any);
    }

    return apiClient.get<ApiResponse<ListLocationsResponse>>('/locations/nearby', { 
      params 
    });
  },
};