/**
 * useLocations.ts
 *
 * Hook lấy danh sách Location từ Backend để populate Dropdown xuất kho.
 * - Gọi GET /api/locations?status=ACTIVE&limit=100 khi mount.
 * - Không cần auth (public endpoint).
 * - Cache kết quả trong session để tránh gọi lại nhiều lần.
 */

import { useState, useEffect } from 'react';
import { locationApi } from '../api/location.api';
import { LocationItem } from '../api/location.types';
import { AxiosError } from 'axios';
import { ApiError } from '../../../api/axios';

interface UseLocationsState {
  locations: LocationItem[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook lấy danh sách Location để populate dropdown.
 * Mặc định lấy tối đa 100 location đang ACTIVE.
 */
export function useLocations(): UseLocationsState {
  const [state, setState] = useState<UseLocationsState>({
    locations: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const { data } = await locationApi.getList({
          status: 'ACTIVE',
          limit: 100,
          page: 1,
        });
        if (!cancelled) {
          setState({
            locations: data.data?.data ?? [],
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          const axiosError = err as AxiosError<ApiError>;
          const message =
            axiosError.response?.data?.message ??
            axiosError.message ??
            'Không thể tải danh sách địa điểm';
          setState({ locations: [], isLoading: false, error: message });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
