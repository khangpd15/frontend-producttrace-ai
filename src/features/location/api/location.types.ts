/**
 * location.types.ts
 *
 * TypeScript types được map từ Location module của Go Backend.
 * Nguồn: internal/modules/location/dto/location_dto.go
 */

/** Loại địa điểm */
export type LocationType = 'WAREHOUSE' | 'STORE' | 'DEALER' | 'WARRANTY_CENTER';

/** Map từ LocationResponse DTO của Backend */
export interface LocationItem {
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
  createdAt: string;
  updatedAt: string;
}

/** Map từ ListLocationsResponse */
export interface ListLocationsResponse {
  data: LocationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Query params cho GET /api/locations */
export interface GetLocationsParams {
  page?: number;
  limit?: number;
  city?: string;
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE';
  type?: 'ALL' | LocationType;
  keyword?: string;
}
