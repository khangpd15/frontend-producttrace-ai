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

export interface GetNearbyParams {
  lat: number;
  lng: number;
  radius?: number;
  type: 'STORE' | 'WARRANTY_CENTER';
  product?: string;
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

export const locationApis = {
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
// ─── Location API ─────────────────────────────────────────────────────────────
const USE_MOCK = false;

// ─── Mock Data Generators ─────────────────────────────────────────────────────

const MOCK_PRODUCTS = [
  'iPhone 15 Pro', 'MacBook Air M3', 'Samsung S24 Ultra', 'iPad Pro M4', 
  'Dell XPS 13', 'Asus ROG Ally', 'Sony WH-1000XM5', 'LG OLED TV', 
  'Dyson V15', 'Xiaomi Robot Vacuum', 'AirPods Pro 2', 'Apple Watch S9'
];

const generateCoords = (baseLat: number, baseLng: number, index: number) => ({
  lat: baseLat + (index * 0.02),
  lng: baseLng + (index * 0.02)
});

// Tạo 10 Cửa hàng (Stores) kèm Inventory ngẫu nhiên
const MOCK_STORES: LocationResponse[] = Array.from({ length: 10 }).map((_, i) => {
  const coords = generateCoords(10.0, 105.7, i);
  
  // Random lấy 3 sản phẩm ngẫu nhiên cho mỗi cửa hàng
  const randomInventory = [...MOCK_PRODUCTS]
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .map(p => ({
      name: p,
      price: `${(Math.floor(Math.random() * 20) + 5)} triệu đ`
    }));

  return {
    id: `store-${i + 1}`,
    ownerUserId: 'admin',
    code: `ST-${100 + i}`,
    name: `Cửa hàng ProductTrace Quận ${i + 1}`,
    type: 'STORE',
    phone: `029231000${i}`,
    email: `store${i + 1}@pt.com`,
    address: `${5 + i * 5} Đường 30/4, P.Xuân Khánh, Ninh Kiều, Cần Thơ`,
    ward: 'Xuân Khánh', district: 'Ninh Kiều', city: 'Cần Thơ', country: 'VN',
    latitude: coords.lat,
    longitude: coords.lng,
    isActive: true,
    openingHoursJson: { open: '08:00', close: '22:00' },
    createdAt: '2026-01-01', updatedAt: '2026-01-01',
    // @ts-ignore: Bổ sung field inventory để UI sử dụng
    inventory: randomInventory 
  };
});

const MOCK_WARRANTY: LocationResponse[] = Array.from({ length: 3 }).map((_, i) => {
  const coords = generateCoords(10.2, 105.9, i);
  return {
    id: `war-${i + 1}`,
    ownerUserId: 'admin',
    code: `WR-${300 + i}`,
    name: `Trung tâm Bảo hành ${i + 1}`,
    type: 'WARRANTY_CENTER',
    phone: `029238888${i}`,
    email: `service${i + 1}@pt.com`,
    address: `${15 + i * 20} Đường Lê Lợi, P.Cái Khế, Ninh Kiều, Cần Thơ`,
    ward: 'Cái Khế', district: 'Ninh Kiều', city: 'Cần Thơ', country: 'VN',
    latitude: coords.lat,
    longitude: coords.lng,
    isActive: true,
    openingHoursJson: { open: '08:00', close: '18:00' },
    createdAt: '2026-01-01', updatedAt: '2026-01-01'
  };
});

// ─── API Implementation ───────────────────────────────────────────────────────
export const locationApi = {
  list: (params: ListLocationsParams) => {
  if (USE_MOCK) {
    const allLocations = [...MOCK_STORES, ...MOCK_WARRANTY];
    
    // Loại bỏ trùng lặp dựa trên ID
    const uniqueLocations = allLocations.filter((v, i, a) => 
      a.findIndex(v2 => (v2.id === v.id)) === i
    );

    const filtered = uniqueLocations.filter(l => 
      (params.status ? l.isActive === (params.status === 'ACTIVE') : true)
    );

    return Promise.resolve({
      data: { success: true, data: { data: filtered, total: filtered.length } }
    } as any);
  }
  return apiClient.get<ApiResponse<ListLocationsResponse>>('/locations', { params });
  },

  getNearby: (params: GetNearbyParams) => {
    if (USE_MOCK) {
      // Xác định chế độ: tìm Cửa hàng hay Trung tâm bảo hành
      const isStore = params.type === 'STORE';
      const source = isStore ? MOCK_STORES : MOCK_WARRANTY;
      
      // Lọc theo bán kính (giả lập 1 độ ~ 111km, nên bán kính 5000m ~ 0.045 độ)
      const filtered = source.filter(item => {
        // Tính khoảng cách sơ bộ để giả lập "Báo không tìm thấy"
        const dist = Math.sqrt(Math.pow(item.latitude - params.lat, 2) + Math.pow(item.longitude - params.lng, 2)) * 111000;
        return dist <= (params.radius || 5000);
      });

      if (filtered.length === 0) {
        return Promise.resolve({ data: { success: true, data: { data: [] } } } as any);
      }

      // Map dữ liệu và trả về
      const data = filtered.map((item, index) => ({
        ...item,
        distance: parseFloat((Math.random() * 5).toFixed(1)),
        inventory: (isStore && params.product) 
          ? MOCK_PRODUCTS.filter(p => p.toLowerCase().includes(params.product!.toLowerCase())).map(p => ({ name: p, price: '10.000.000đ' }))
          : (isStore ? MOCK_PRODUCTS.slice(0, 3).map(p => ({ name: p, price: '10.000.000đ' })) : undefined)
      }));

      return Promise.resolve({ data: { success: true, data: { data: data } } } as any);
    }
    return apiClient.get<ApiResponse<any>>('/geo-search/nearest', { params });
  },

  getById: (id: string) => apiClient.get<ApiResponse<LocationResponse>>(`/locations/${id}`),
  create: (payload: any) => apiClient.post<ApiResponse<LocationResponse>>('/locations', payload),
  update: (id: string, payload: any) => apiClient.put<ApiResponse<LocationResponse>>(`/locations/${id}`, payload),
  delete: (id: string) => apiClient.delete<ApiResponse<null>>(`/locations/${id}`),
};