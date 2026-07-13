/**
 * addressService.ts
 * Gọi API hành chính Việt Nam từ provinces.open-api.vn
 * Docs: https://provinces.open-api.vn/
 *
 * Cấu trúc dữ liệu:
 *   Tỉnh/TP  { code, name, districts: [] }
 *   Quận/Huyện { code, name, wards: [] }
 *   Phường/Xã  { code, name }
 */

const BASE_URL = 'https://provinces.open-api.vn/api';

export interface Province {
  code: number;
  name: string;
  division_type: string;
}

export interface District {
  code: number;
  name: string;
  division_type: string;
}

export interface Ward {
  code: number;
  name: string;
  division_type: string;
}

// ---- Cache đơn giản để tránh gọi API nhiều lần ----
let _provincesCache: Province[] | null = null;
const _districtsCache = new Map<number, District[]>();
const _wardsCache = new Map<number, Ward[]>();

export const addressService = {
  /**
   * Lấy danh sách tất cả Tỉnh/Thành phố
   * Cache kết quả sau lần gọi đầu tiên
   */
  getProvinces: async (): Promise<Province[]> => {
    if (_provincesCache) return _provincesCache;
    const res = await fetch(`${BASE_URL}/p/`);
    if (!res.ok) throw new Error(`Không thể tải danh sách tỉnh/thành phố (HTTP ${res.status})`);
    const data: Province[] = await res.json();
    _provincesCache = data;
    return data;
  },

  /**
   * Lấy danh sách Quận/Huyện theo mã tỉnh
   * @param provinceCode - Mã tỉnh (vd: 1 = Hà Nội, 79 = TP.HCM)
   */
  getDistricts: async (provinceCode: number): Promise<District[]> => {
    if (_districtsCache.has(provinceCode)) return _districtsCache.get(provinceCode)!;
    const res = await fetch(`${BASE_URL}/p/${provinceCode}?depth=2`);
    if (!res.ok) throw new Error(`Không thể tải danh sách quận/huyện (HTTP ${res.status})`);
    const data = await res.json();
    const districts: District[] = data.districts ?? [];
    _districtsCache.set(provinceCode, districts);
    return districts;
  },

  /**
   * Lấy danh sách Phường/Xã theo mã quận/huyện
   * @param districtCode - Mã quận/huyện
   */
  getWards: async (districtCode: number): Promise<Ward[]> => {
    if (_wardsCache.has(districtCode)) return _wardsCache.get(districtCode)!;
    const res = await fetch(`${BASE_URL}/d/${districtCode}?depth=2`);
    if (!res.ok) throw new Error(`Không thể tải danh sách phường/xã (HTTP ${res.status})`);
    const data = await res.json();
    const wards: Ward[] = data.wards ?? [];
    _wardsCache.set(districtCode, wards);
    return wards;
  },
};
