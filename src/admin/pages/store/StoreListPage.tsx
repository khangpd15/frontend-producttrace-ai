import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search, Plus, Eye, Edit3, X, AlertCircle,
  MapPin, Phone, Mail, Clock, HelpCircle, Inbox, ExternalLink, Trash2, ChevronDown
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAuthStore } from '../../../features/auth/store/auth.store';
import {
  useLocationList,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation
} from '../../../features/locations/hooks/useLocation';
import { LocationResponse as LocationPoint } from '../../../features/locations/api/location.api';
import { addressService, Province, District, Ward } from '../../services/addressService';
import { parseApiError } from '../../../api/axios';

export default function StoreListPage({ onNavigate }: { onNavigate: (tabId: string) => void }) {
  const { user } = useAuthStore();
  const [activeKpiFilter, setActiveKpiFilter] = useState<'ALL' | 'WAREHOUSE' | 'STORE' | 'DEALER' | 'WARRANTY_CENTER'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterCity, setFilterCity] = useState<string>('ALL');

  // Administrative divisions states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [loadingGeocode, setLoadingGeocode] = useState(false); // true khi đang gọi Nominatim

  // Load provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const data = await addressService.getProvinces();
        setProvinces(data);
      } catch (err) {
        console.error('Error loading provinces:', err);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  const handleProvinceChange = async (provinceCode: number, provinceName: string) => {
    setSelectedProvinceCode(provinceCode || null);
    setSelectedDistrictCode(null);
    setDistricts([]);
    setWards([]);
    setFormData(prev => ({
      ...prev,
      city: provinceName,
      district: '',
      ward: ''
    }));

    if (!provinceCode) return;

    setLoadingDistricts(true);
    try {
      const data = await addressService.getDistricts(provinceCode);
      setDistricts(data);
    } catch (err) {
      console.error('Error loading districts:', err);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleDistrictChange = async (districtCode: number, districtName: string) => {
    setSelectedDistrictCode(districtCode || null);
    setWards([]);
    setFormData(prev => ({
      ...prev,
      district: districtName,
      ward: ''
    }));

    if (!districtCode) return;

    setLoadingWards(true);
    try {
      const data = await addressService.getWards(districtCode);
      setWards(data);
    } catch (err) {
      console.error('Error loading wards:', err);
    } finally {
      setLoadingWards(false);
    }
  };

  /**
   * Khi chọn Phường/Xã → cập nhật formData, sau đó tự động geocode bằng Nominatim.
   * Fallback: nếu Nominatim không tìm thấy → giữ nguyên lat/lng cũ (user tự sửa).
   */
  const handleWardChange = useCallback(async (wardName: string, district: string, city: string) => {
    setFormData(prev => ({ ...prev, ward: wardName }));
    if (!wardName || !district || !city) return;

    setLoadingGeocode(true);
    try {
      const coords = await addressService.geocodeAddress(wardName, district, city);
      if (coords) {
        setFormData(prev => ({
          ...prev,
          ward: wardName,
          latitude:  parseFloat(coords.lat.toFixed(6)),
          longitude: parseFloat(coords.lng.toFixed(6)),
        }));
      }
      // Nếu null: Nominatim không tìm thấy → giữ nguyên, user sửa tay
    } catch (e) {
      console.error('[Geocode] Nominatim error:', e);
    } finally {
      setLoadingGeocode(false);
    }
  }, []);

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'CREATE' | 'EDIT' | 'VIEW'>('CREATE');
  const [selectedLocation, setSelectedLocation] = useState<LocationPoint | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'STORE' as any,
    phone: '',
    email: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    country: 'Việt Nam',
    latitude: 0,
    longitude: 0,
    isActive: true,
    openTime: '',
    closeTime: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load locations from API (server-side pagination)
  const { data: locationsRes, isLoading, isError, refetch } = useLocationList({ page, limit });

  const locations = useMemo(() => locationsRes?.data || [], [locationsRes]);
  const total      = locationsRes?.total      ?? 0;
  const totalPages = locationsRes?.totalPages ?? 1;

  // Mutations
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();

  // Stats — dùng safe array, tính trên toàn bộ dữ liệu trang hiện tại
  const stats = useMemo(() => {
    const safeList = Array.isArray(locations) ? locations : [];
    const warehouse = safeList.filter(l => l.type === 'WAREHOUSE').length;
    const store     = safeList.filter(l => l.type === 'STORE').length;
    const dealer    = safeList.filter(l => l.type === 'DEALER').length;
    const warranty  = safeList.filter(l => l.type === 'WARRANTY_CENTER').length;
    return { total, warehouse, store, dealer, warranty };
  }, [locations, total]);

  // Client-side filter trong trang hiện tại
  const filteredLocations = useMemo(() => {
    const safeList = Array.isArray(locations) ? locations : [];
    return safeList.filter(l => {
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchCode    = l.code?.toLowerCase().includes(query);
        const matchName    = l.name?.toLowerCase().includes(query);
        const matchAddress = l.address?.toLowerCase().includes(query);
        if (!matchCode && !matchName && !matchAddress) return false;
      }
      if (filterType !== 'ALL' && l.type !== filterType) return false;
      if (filterCity !== 'ALL' && l.city !== filterCity) return false;
      if (activeKpiFilter !== 'ALL' && l.type !== activeKpiFilter) return false;
      return true;
    });
  }, [locations, searchTerm, filterType, filterCity, activeKpiFilter]);

  const cities = useMemo(() => {
    return Array.from(new Set(locations.map(l => l.city))).filter(Boolean);
  }, [locations]);

  const handleOpenCreate = () => {
    setDrawerMode('CREATE');
    setSelectedProvinceCode(null);
    setSelectedDistrictCode(null);
    setDistricts([]);
    setWards([]);
    setFormData({
      code: '',
      name: '',
      type: 'STORE',
      phone: '',
      email: '',
      address: '',
      ward: '',
      district: '',
      city: '',
      country: 'Việt Nam',
      latitude: 0,
      longitude: 0,
      isActive: true,
      openTime: '08:00',
      closeTime: '22:00'
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (loc: LocationPoint, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDrawerMode('EDIT');
    setSelectedLocation(loc);
    // Reset dropdown state
    setSelectedProvinceCode(null);
    setSelectedDistrictCode(null);
    setDistricts([]);
    setWards([]);

    // Parse giờ mở/đóng cửa
    let open = '08:00';
    let close = '22:00';
    const hoursMap = loc.openingHoursJson;
    if (hoursMap && typeof hoursMap === 'object') {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const firstDay = days.find(d => (hoursMap as any)[d]);
      if (firstDay) {
        const entry = (hoursMap as any)[firstDay];
        if (entry && entry.open && entry.close) {
          open = entry.open;
          close = entry.close;
        }
      } else if ((hoursMap as any).hours) {
        const parts = (hoursMap as any).hours.split('-');
        if (parts.length === 2) {
          open = parts[0].trim();
          close = parts[1].trim();
        }
      }
    }

    setFormData({
      code: loc.code,
      name: loc.name,
      type: loc.type,
      phone: loc.phone || '',
      email: loc.email || '',
      address: loc.address || '',
      ward: loc.ward || '',
      district: loc.district || '',
      city: loc.city || '',
      country: loc.country || 'Việt Nam',
      latitude: loc.latitude,
      longitude: loc.longitude,
      isActive: loc.isActive,
      openTime: open,
      closeTime: close
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleOpenView = (loc: LocationPoint) => {
    setDrawerMode('VIEW');
    setSelectedLocation(loc);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Bạn có chắc chắn muốn xóa địa điểm ${name}?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        alert('Xóa địa điểm thành công!');
        refetch();
      } catch (err: any) {
        alert(parseApiError(err));
      }
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setFormError('Mã và Tên địa điểm là bắt buộc');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      if (drawerMode === 'CREATE') {
        const isDuplicate = locations.some(l => l.code.toUpperCase() === formData.code.toUpperCase());
        if (isDuplicate) {
          setFormError('Mã địa điểm đã tồn tại');
          setIsSubmitting(false);
          return;
        }

        const openingHours = {
          open: formData.openTime || '08:00',
          close: formData.closeTime || '22:00'
        };
        const openingHoursJson = {
          monday: openingHours,
          tuesday: openingHours,
          wednesday: openingHours,
          thursday: openingHours,
          friday: openingHours,
          saturday: openingHours,
          sunday: openingHours
        };

        await createMutation.mutateAsync({
          ownerUserId: user?.id || '',
          code: formData.code.toUpperCase(),
          name: formData.name.trim(),
          type: formData.type,
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          ward: formData.ward.trim() || 'N/A',
          district: formData.district.trim() || 'N/A',
          city: formData.city.trim(),
          latitude: formData.latitude,
          longitude: formData.longitude,
          openingHoursJson
        });
      } else if (drawerMode === 'EDIT' && selectedLocation) {
        const openingHours = {
          open: formData.openTime || '08:00',
          close: formData.closeTime || '22:00'
        };
        const openingHoursJson = {
          monday: openingHours,
          tuesday: openingHours,
          wednesday: openingHours,
          thursday: openingHours,
          friday: openingHours,
          saturday: openingHours,
          sunday: openingHours
        };

        await updateMutation.mutateAsync({
          id: selectedLocation.id,
          payload: {
            name: formData.name.trim(),
            type: formData.type,
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            address: formData.address.trim(),
            ward: formData.ward.trim() || 'N/A',
            district: formData.district.trim() || 'N/A',
            city: formData.city.trim(),
            latitude: formData.latitude,
            longitude: formData.longitude,
            isActive: formData.isActive,
            openingHoursJson
          }
        });
      }
      setIsDrawerOpen(false);
      refetch();
    } catch (err: any) {
      setFormError(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTypeLabel = (type: 'WAREHOUSE' | 'STORE' | 'DEALER' | 'WARRANTY_CENTER') => {
    const labels = {
      WAREHOUSE: { label: 'Kho hàng', color: 'bg-slate-100 text-slate-700 border-slate-200' },
      STORE: { label: 'Cửa hàng', color: 'bg-blue-50 text-blue-700 border-blue-100' },
      DEALER: { label: 'Đại lý', color: 'bg-green-50 text-green-700 border-green-100' },
      WARRANTY_CENTER: { label: 'Trung tâm bảo hành', color: 'bg-purple-50 text-purple-700 border-purple-100' }
    };
    const target = labels[type] || labels.STORE;
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${target.color}`}>
        {target.label}
      </span>
    );
  };

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 h-24"></div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-100 h-96 animate-pulse"></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-4 md:px-6 pb-16 w-full">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Store &amp; Locations
            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-semibold uppercase">
              Role: Admin / Dealer / Shop
            </span>
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý mạng lưới kho hàng, cửa hàng bán lẻ, đại lý ủy quyền và các trung tâm bảo hành toàn quốc.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
        >
          <Plus size={16} /> Thêm địa điểm
        </Button>
      </div>

      {isError ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-slate-200 max-w-xl mx-auto mt-12">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Không thể tải dữ liệu địa điểm</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">Đã xảy ra lỗi kết nối khi tải danh sách kho/cửa hàng.</p>
          <Button onClick={() => refetch()} className="mt-6 rounded-xl px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Thử lại</Button>
        </Card>
      ) : isLoading ? (
        renderSkeleton()
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-5 gap-4">
            {[
              { id: 'ALL', label: 'Mạng lưới địa điểm', value: stats.total, color: 'text-slate-900' },
              { id: 'WAREHOUSE', label: 'Kho tổng lưu kho', value: stats.warehouse, color: 'text-slate-700' },
              { id: 'STORE', label: 'Cửa hàng chính hãng', value: stats.store, color: 'text-blue-600' },
              { id: 'DEALER', label: 'Đại lý ủy quyền', value: stats.dealer, color: 'text-green-600' },
              { id: 'WARRANTY_CENTER', label: 'Trạm bảo hành', value: stats.warranty, color: 'text-purple-600' }
            ].map(card => (
              <div
                key={card.id}
                onClick={() => setActiveKpiFilter(activeKpiFilter === card.id ? 'ALL' : card.id as any)}
                className={`p-4 bg-white border rounded-xl shadow-xs cursor-pointer hover:border-slate-300 transition-all ${activeKpiFilter === card.id ? 'border-blue-400 ring-2 ring-blue-50 bg-blue-50/10' : 'border-slate-200'
                  }`}
              >
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase">
                  <span>{card.label}</span>
                  <HelpCircle size={12} className="text-slate-300" />
                </div>
                <div className={`text-2xl font-bold mt-2.5 ${card.color}`}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo mã, tên showroom, địa chỉ..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm focus:outline-none"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"><X size={14} /></button>
                )}
              </div>

              {/* Type */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Loại hình:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 cursor-pointer"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="WAREHOUSE">Kho hàng</option>
                  <option value="STORE">Cửa hàng</option>
                  <option value="DEALER">Đại lý</option>
                  <option value="WARRANTY_CENTER">Trung tâm bảo hành</option>
                </select>
              </div>

              {/* City */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Thành phố:</span>
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 pl-2 pr-6 cursor-pointer"
                >
                  <option value="ALL">Tất cả tỉnh/TP</option>
                  {cities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {(searchTerm || filterType !== 'ALL' || filterCity !== 'ALL' || activeKpiFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('ALL');
                  setFilterCity('ALL');
                  setActiveKpiFilter('ALL');
                }}
                className="text-xs font-semibold text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredLocations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white">
                <Inbox size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Chưa có địa điểm nào</h3>
                <p className="text-slate-500 text-sm max-w-sm mt-1">Hệ thống chưa đăng ký mạng lưới phân phối và lưu kho nào.</p>
                <Button onClick={handleOpenCreate} className="mt-6 bg-blue-600 text-white rounded-xl px-4 py-2 font-semibold hover:bg-blue-700 cursor-pointer">Thêm địa điểm</Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm table-fixed border-collapse">
                  <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/75 border-b border-slate-200">
                    <tr className="h-10 align-middle">
                      <th className="p-3.5 pl-5 font-bold tracking-wider w-[10%]">Mã</th>
                      <th className="p-3.5 font-bold tracking-wider w-[20%]">Tên địa điểm</th>
                      <th className="p-3.5 font-bold tracking-wider w-[12%]">Loại</th>
                      <th className="p-3.5 font-bold tracking-wider w-[22%]">Địa chỉ</th>
                      <th className="p-3.5 font-bold tracking-wider w-[14%]">Thông tin liên hệ</th>
                      <th className="p-3.5 font-bold tracking-wider w-[10%] text-center">Hoạt động</th>
                      <th className="p-3.5 font-bold tracking-wider w-[12%] text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLocations.map(loc => (
                      <tr
                        key={loc.id}
                        onClick={() => handleOpenView(loc)}
                        className="hover:bg-slate-50/50 cursor-pointer transition-colors group h-[68px] align-middle"
                      >
                        <td className="p-3.5 pl-5 font-mono text-xs font-semibold text-slate-500 max-w-0 truncate align-middle">{loc.code}</td>
                        <td className="p-3.5 font-semibold text-slate-900 max-w-0 truncate align-middle" title={loc.name}>{loc.name}</td>
                        <td className="p-3.5 align-middle">{renderTypeLabel(loc.type)}</td>
                        <td className="p-3.5 max-w-0 align-middle">
                          <div className="font-medium text-slate-800 text-xs truncate" title={loc.address}>{loc.address}</div>
                          <div className="text-[10px] text-slate-400 truncate" title={[loc.ward, loc.district, loc.city].filter(Boolean).join(', ')}>
                            {[loc.ward, loc.district, loc.city].filter(Boolean).join(', ')}
                          </div>
                        </td>
                        <td className="p-3.5 max-w-0 align-middle">
                          <div className="text-xs text-slate-700 flex items-center gap-1 truncate"><Phone size={10} className="text-slate-400 flex-shrink-0" /> <span className="truncate">{loc.phone}</span></div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate"><Mail size={10} className="text-slate-400 flex-shrink-0" /> <span className="truncate">{loc.email}</span></div>
                        </td>
                        <td className="p-3.5 text-center align-middle" onClick={e => e.stopPropagation()}>
                          <span className={`inline-flex items-center justify-center gap-1.5 w-[100px] h-5.5 rounded-full text-[10px] font-semibold border ${loc.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${loc.isActive ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                            {loc.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center align-middle" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-center items-center gap-1 w-full">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer flex items-center justify-center"
                              title="Xem bản đồ vệ tinh"
                            >
                              <ExternalLink size={15} />
                            </a>
                            <button
                              onClick={() => handleOpenEdit(loc)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer border-none bg-transparent flex items-center justify-center"
                              title="Sửa địa điểm"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleOpenView(loc)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer border-none bg-transparent flex items-center justify-center"
                              title="Xem chi tiết"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={(e) => handleDelete(loc.id, loc.name, e)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer border-none bg-transparent flex items-center justify-center"
                              title="Xóa địa điểm"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              {totalPages > 0 && (() => {
                const getPageNumbers = () => {
                  const pages: (number | '...')[] = [];
                  if (totalPages <= 5) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    let start = Math.max(2, page - 1);
                    let end   = Math.min(totalPages - 1, page + 1);
                    if (page <= 2) end = 4;
                    else if (page >= totalPages - 1) start = totalPages - 3;
                    if (start > 2) pages.push('...');
                    for (let i = start; i <= end; i++) pages.push(i);
                    if (end < totalPages - 1) pages.push('...');
                    pages.push(totalPages);
                  }
                  return pages;
                };
                return (
                  <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                    <div className="text-xs text-slate-500 font-medium">
                      Hiển thị từ{' '}
                      <span className="font-bold text-slate-800">{total === 0 ? 0 : (page - 1) * limit + 1}</span>{' '}
                      đến{' '}
                      <span className="font-bold text-slate-800">{Math.min(page * limit, total)}</span>{' '}
                      trong tổng số{' '}
                      <span className="font-bold text-slate-800">{total}</span> địa điểm
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Page size selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">Hiển thị</span>
                        <select
                          value={limit}
                          onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                          className="bg-white border border-slate-200 rounded-lg text-xs py-1 px-2 focus:outline-none focus:border-blue-500 cursor-pointer font-bold text-slate-700"
                        >
                          {[5, 10, 20, 50].map(s => (
                            <option key={s} value={s}>{s} / trang</option>
                          ))}
                        </select>
                      </div>
                      {/* Page nav */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPage(p => Math.max(p - 1, 1))}
                          disabled={page <= 1}
                          className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-semibold text-slate-700 bg-white cursor-pointer transition-colors"
                        >Trước</button>
                        {getPageNumbers().map((num, i) =>
                          num === '...' ? (
                            <span key={`e${i}`} className="px-2 text-slate-400 text-xs">...</span>
                          ) : (
                            <button
                              key={num}
                              onClick={() => setPage(num)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                                page === num
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                              }`}
                            >{num}</button>
                          )
                        )}
                        <button
                          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                          disabled={page >= totalPages}
                          className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-semibold text-slate-700 bg-white cursor-pointer transition-colors"
                        >Sau</button>
                      </div>
                    </div>
                  </div>
                );
              })()}
              </>
            )}
          </div>
        </>
      )}

      {/* Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative bg-white w-[500px] max-h-[90vh] shadow-2xl rounded-2xl flex flex-col justify-between z-10 overflow-hidden">

            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {drawerMode === 'CREATE' ? 'Thêm địa điểm mới' : drawerMode === 'EDIT' ? 'Cập nhật địa điểm' : 'Chi tiết địa điểm'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Thông tin quản lý chi nhánh và hệ thống logistics.</p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg border-none bg-transparent cursor-pointer"><X size={18} /></button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2"><AlertCircle size={16} />{formError}</div>
              )}

              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Mã địa điểm *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      disabled={drawerMode === 'VIEW' || drawerMode === 'EDIT'}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                      placeholder="WH-HN-01"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Loại hình</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                      disabled={drawerMode === 'VIEW'}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm cursor-pointer"
                    >
                      <option value="WAREHOUSE">Kho hàng (Warehouse)</option>
                      <option value="STORE">Cửa hàng chính hãng (Store)</option>
                      <option value="DEALER">Đại lý ủy quyền (Dealer)</option>
                      <option value="WARRANTY_CENTER">Trung tâm bảo hành (Warranty Center)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tên địa điểm *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    disabled={drawerMode === 'VIEW'}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Showroom Điện Máy Cầu Giấy"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1"><Phone size={12} /> Điện thoại liên hệ</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      disabled={drawerMode === 'VIEW'}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1"><Mail size={12} /> Email nhận thông báo</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      disabled={drawerMode === 'VIEW'}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <hr className="border-slate-100 my-1" />

                {/* Địa chỉ chi tiết */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1"><MapPin size={12} /> Địa chỉ chi tiết</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    disabled={drawerMode === 'VIEW'}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Số nhà, tên đường..."
                  />
                </div>

                {/* === Cascading dropdown hành chính Việt Nam === */}

                {/* 1. Quốc gia */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Quốc gia</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    disabled={drawerMode === 'VIEW'}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Việt Nam"
                  />
                </div>

                {/* 2. Tỉnh / Thành phố */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tỉnh / Thành phố *</label>
                  {drawerMode === 'VIEW' ? (
                    <div className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700">
                      {formData.city || <span className="text-slate-400 italic">Không có</span>}
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={selectedProvinceCode ?? ''}
                        onChange={e => {
                          const code = Number(e.target.value);
                          const name = provinces.find(p => p.code === code)?.name ?? '';
                          handleProvinceChange(code, name);
                        }}
                        disabled={loadingProvinces}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm appearance-none bg-white cursor-pointer pr-8"
                      >
                        <option value="">
                          {loadingProvinces ? 'Đang tải...' : (formData.city ? `— ${formData.city} (chọn lại) —` : 'Chọn tỉnh / thành phố')}
                        </option>
                        {provinces.map(p => (
                          <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  )}
                </div>

                {/* 3. Quận / Huyện */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Quận / Huyện *</label>
                  {drawerMode === 'VIEW' ? (
                    <div className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700">
                      {formData.district || <span className="text-slate-400 italic">Không có</span>}
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={selectedDistrictCode ?? ''}
                        onChange={e => {
                          const code = Number(e.target.value);
                          const name = districts.find(d => d.code === code)?.name ?? '';
                          handleDistrictChange(code, name);
                        }}
                        disabled={!selectedProvinceCode || loadingDistricts}
                        className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm appearance-none bg-white pr-8 ${!selectedProvinceCode ? 'text-slate-400 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`}
                      >
                        <option value="">
                          {loadingDistricts ? 'Đang tải...' : !selectedProvinceCode ? (formData.district ? `— ${formData.district} (chọn tỉnh để lọc lại) —` : 'Chọn tỉnh trước') : 'Chọn quận / huyện'}
                        </option>
                        {districts.map(d => (
                          <option key={d.code} value={d.code}>{d.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  )}
                </div>

                {/* 4. Phường / Xã */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Phường / Xã *</label>
                  {drawerMode === 'VIEW' ? (
                    <div className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700">
                      {formData.ward || <span className="text-slate-400 italic">Không có</span>}
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={formData.ward}
                        onChange={e => {
                          const wardName = e.target.value;
                          handleWardChange(wardName, formData.district, formData.city);
                        }}
                        disabled={!selectedDistrictCode || loadingWards}
                        className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm appearance-none bg-white pr-8 ${!selectedDistrictCode ? 'text-slate-400 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`}
                      >
                        <option value="">
                          {loadingWards ? 'Đang tải...' : !selectedDistrictCode ? (formData.ward ? `— ${formData.ward} (chọn quận để lọc lại) —` : 'Chọn quận/huyện trước') : 'Chọn phường / xã'}
                        </option>
                        {wards.map(w => (
                          <option key={w.code} value={w.name}>{w.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  )}
                </div>

                {/* Kinh độ / Vĩ độ — tự động điền khi chọn Phường/Xã */}
                <div className={`grid grid-cols-2 gap-4 p-3 rounded-lg border transition-colors ${loadingGeocode ? 'bg-blue-50 border-blue-200' : formData.latitude !== 0 && formData.longitude !== 0 ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                  {/* Header row */}
                  <div className="col-span-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <MapPin size={10} />
                      Tọa độ địa lý
                    </span>
                    {loadingGeocode ? (
                      <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-ping" />
                        Đang tìm tọa độ...
                      </span>
                    ) : formData.latitude !== 0 && formData.longitude !== 0 ? (
                      <span className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                        Tự động điền — có thể sửa tay
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">
                        Tự điền khi chọn Phường/Xã
                      </span>
                    )}
                  </div>

                  {/* Latitude */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">Vĩ độ (Latitude)</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                      disabled={drawerMode === 'VIEW' || loadingGeocode}
                      className={`w-full px-2 py-1.5 border rounded text-xs transition-colors ${
                        loadingGeocode
                          ? 'bg-blue-50 border-blue-200 text-blue-500 cursor-wait'
                          : formData.latitude !== 0
                          ? 'bg-white border-green-300 text-slate-800'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                      placeholder="VD: 10.762622"
                    />
                  </div>

                  {/* Longitude */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">Kinh độ (Longitude)</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                      disabled={drawerMode === 'VIEW' || loadingGeocode}
                      className={`w-full px-2 py-1.5 border rounded text-xs transition-colors ${
                        loadingGeocode
                          ? 'bg-blue-50 border-blue-200 text-blue-500 cursor-wait'
                          : formData.longitude !== 0
                          ? 'bg-white border-green-300 text-slate-800'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                      placeholder="VD: 106.660172"
                    />
                  </div>

                  {/* Link kiểm tra nhanh trên Google Maps */}
                  {formData.latitude !== 0 && formData.longitude !== 0 && !loadingGeocode && (
                    <div className="col-span-2">
                      <a
                        href={`https://maps.google.com/?q=${formData.latitude},${formData.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-700 hover:underline font-medium"
                      >
                        <ExternalLink size={10} />
                        Kiểm tra trên Google Maps
                      </a>
                    </div>
                  )}
                </div>

                {/* Giờ mở cửa & Giờ đóng cửa */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1"><Clock size={12} /> Giờ mở cửa *</label>
                    <input
                      type="time"
                      value={formData.openTime}
                      onChange={e => setFormData({ ...formData, openTime: e.target.value })}
                      disabled={drawerMode === 'VIEW'}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1"><Clock size={12} /> Giờ đóng cửa *</label>
                    <input
                      type="time"
                      value={formData.closeTime}
                      onChange={e => setFormData({ ...formData, closeTime: e.target.value })}
                      disabled={drawerMode === 'VIEW'}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={drawerMode === 'CREATE' ? true : formData.isActive}
                      onChange={e => {
                        if (drawerMode === 'EDIT') setFormData({ ...formData, isActive: e.target.checked });
                      }}
                      disabled={drawerMode === 'VIEW' || drawerMode === 'CREATE'}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    <span className="ml-2 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      Trạng thái hoạt động
                      {drawerMode === 'CREATE' && (
                        <span className="text-[10px] text-slate-400 font-normal italic">
                          (Mặc định kích hoạt khi tạo mới)
                        </span>
                      )}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
              <Button variant="secondary" onClick={() => setIsDrawerOpen(false)} className="rounded-xl px-4 text-xs font-semibold cursor-pointer">
                {drawerMode === 'VIEW' ? 'Đóng' : 'Hủy'}
              </Button>
              {drawerMode !== 'VIEW' && (
                <Button onClick={handleSubmitForm} disabled={isSubmitting} className="rounded-xl px-4 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer">
                  {isSubmitting ? 'Đang lưu...' : (drawerMode === 'CREATE' ? 'Thêm địa điểm' : 'Lưu thay đổi')}
                </Button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
