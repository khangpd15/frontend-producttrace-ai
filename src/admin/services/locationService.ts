import apiClient from '../../api/axios';
import { useAuthStore } from '../../features/auth/store/auth.store';

// ---- Interface khớp với struct Golang backend ----
export interface LocationPoint {
  id: string;
  code: string;
  name: string;
  type: 'WAREHOUSE' | 'STORE' | 'DEALER' | 'WARRANTY_CENTER';
  phone: string;
  email: string;
  address: string;
  ward?: string;
  district?: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  openingHours: string;   // frontend dùng tên này
  createdAt: string;
  updatedAt: string;
}

// ---- Cấu trúc response thực tế từ Golang backend ----
// GET /api/locations trả về:
// {
//   "success": true,
//   "message": "OK",
//   "data": {
//     "data": [ { ...LocationPoint, openingHoursJson: null } ]
//   }
// }
interface BackendItem {
  id: string;
  code: string;
  name: string;
  type: string;
  phone: string;
  email: string;
  address: string;
  ward?: string;
  district?: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  openingHoursJson: string | null; // tên field ở backend
  createdAt: string;
  updatedAt: string;
  ownerUserId?: string;
  geoLocation?: { latitude: number; longitude: number };
}

// ---- Helper: parse chuỗi "08:00 - 22:00" → map[string]OpeningHour (đúng cấu trúc backend) ----
//
// Backend kỳ vọng OpeningHoursJSON là map[string]{ open, close }, ví dụ:
// { "monday": { "open": "08:00", "close": "22:00" }, "tuesday": { ... }, ... }
//
// Nếu user nhập chuỗi hợp lệ ("HH:MM - HH:MM"), hàm này áp dụng giờ đó cho cả 7 ngày.
// Nếu chuỗi rỗng hoặc không hợp lệ → trả về null (backend sẽ lưu null vào JSONB).
const DAYS_OF_WEEK = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const;

type OpeningHourEntry = { open: string; close: string };
type OpeningHoursMap  = Record<string, OpeningHourEntry>;

const parseOpeningHoursToJson = (raw: string | undefined | null): OpeningHoursMap | null => {
  if (!raw || !raw.trim()) return null;

  // Hỗ trợ định dạng: "8:00 - 9:00", "08:00 - 22:00", "8:00-22:00" (có hoặc không có space)
  const match = raw.trim().match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
  if (!match) {
    console.warn('[locationService] openingHours không đúng định dạng HH:MM - HH:MM:', raw);
    return null;
  }

  const entry: OpeningHourEntry = { open: match[1], close: match[2] };
  return Object.fromEntries(DAYS_OF_WEEK.map(day => [day, entry]));
};

// ---- Helper: chuyển ngược OpeningHoursMap → chuỗi hiển thị (lấy ngày đầu tiên có dữ liệu) ----
const parseOpeningHoursToString = (json: unknown): string => {
  if (!json || typeof json !== 'object') return '';
  const map = json as OpeningHoursMap;
  const firstDay = DAYS_OF_WEEK.find(d => map[d]);
  if (!firstDay) return '';
  const { open, close } = map[firstDay];
  return `${open} - ${close}`;
};

// ---- Mapper: chuyển BackendItem → LocationPoint ----
const mapItem = (item: BackendItem): LocationPoint => {
  // openingHoursJson từ backend có thể là:
  //   - null/undefined
  //   - string JSON (PostgreSQL trả về dạng string đôi khi)
  //   - object đã được parse sẵn
  let parsedJson: unknown = item.openingHoursJson;
  if (typeof parsedJson === 'string') {
    try { parsedJson = JSON.parse(parsedJson); } catch { parsedJson = null; }
  }

  return {
    id:           item.id,
    code:         item.code,
    name:         item.name,
    type:         item.type as LocationPoint['type'],
    phone:        item.phone ?? '',
    email:        item.email ?? '',
    address:      item.address ?? '',
    ward:         item.ward,
    district:     item.district,
    city:         item.city ?? '',
    country:      item.country ?? '',
    latitude:     item.latitude ?? 0,
    longitude:    item.longitude ?? 0,
    isActive:     item.isActive ?? true,
    // Chuyển OpeningHoursMap → chuỗi "HH:MM - HH:MM" để hiển thị trên UI
    openingHours: parseOpeningHoursToString(parsedJson),
    createdAt:    item.createdAt ?? '',
    updatedAt:    item.updatedAt ?? '',
  };
};

// ---- Helper: trích xuất mảng từ bất kỳ dạng response nào ----
const extractArray = (body: any): BackendItem[] => {
  // Dạng 1: array thuần  [...]
  if (Array.isArray(body)) return body;

  // Dạng 2: { data: { data: [...] } }  ← cấu trúc backend hiện tại
  if (body?.data?.data !== undefined && Array.isArray(body.data.data)) return body.data.data;

  // Dạng 3: { data: [...] }
  if (body?.data !== undefined && Array.isArray(body.data)) return body.data;

  // Dạng 4: { locations: [...] }
  if (body?.locations !== undefined && Array.isArray(body.locations)) return body.locations;

  // Không nhận ra — in chi tiết để debug
  console.warn('[locationService] Không nhận ra định dạng response. Body nhận được:', body);
  return [];
};

// ---- Service ----
export const locationService = {
  /**
   * [GET] /api/locations
   * Cấu trúc thực tế: { success, message, data: { data: [...] } }
   */
  getAll: async (): Promise<LocationPoint[]> => {
    const response = await apiClient.get('/locations');
    const rawList = extractArray(response.data);
    return rawList.map(mapItem);
  },

  /**
   * [GET] /api/locations/:id
   */
  getById: async (id: string): Promise<LocationPoint> => {
    const response = await apiClient.get(`/locations/${id}`);
    const body = response.data;
    // Unwrap nếu có bọc { data: { ... } }
    const raw: BackendItem = body?.data?.data ?? body?.data ?? body;
    return mapItem(raw);
  },

  /**
   * [POST] /api/locations
   */
  create: async (data: Omit<LocationPoint, 'id' | 'createdAt' | 'updatedAt'>): Promise<LocationPoint> => {
    // Chuyển chuỗi "HH:MM - HH:MM" → map[string]OpeningHour đúng cấu trúc backend JSONB
    const payload = {
      ...data,
      openingHoursJson: parseOpeningHoursToJson(data.openingHours),
      openingHours: undefined,

      // Lấy User ID của người dùng đang đăng nhập
      OwnerUserID: useAuthStore.getState().user?.id || "f69418aa-2688-4b5b-aa2e-431ae94e051b",
    };
    const response = await apiClient.post('/locations', payload);
    const body = response.data;
    const raw: BackendItem = body?.data?.data ?? body?.data ?? body;
    return mapItem(raw);
  },

  /**
   * [PUT] /api/locations/:id
   */
  update: async (id: string, data: Partial<Omit<LocationPoint, 'id' | 'createdAt' | 'updatedAt'>>): Promise<LocationPoint> => {
    // Chuyển chuỗi "HH:MM - HH:MM" → map[string]OpeningHour đúng cấu trúc backend JSONB
    const payload = {
      ...data,
      openingHoursJson: parseOpeningHoursToJson(data.openingHours),
      openingHours: undefined,
    };
    const response = await apiClient.put(`/locations/${id}`, payload);
    const body = response.data;
    const raw: BackendItem = body?.data?.data ?? body?.data ?? body;
    return mapItem(raw);
  },

  /**
   * [DELETE] /api/locations/:id
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/locations/${id}`);
  },
};
