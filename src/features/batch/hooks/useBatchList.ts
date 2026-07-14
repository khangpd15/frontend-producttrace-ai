/**
 * useBatchList.ts
 *
 * Hook gọi GET /api/batches để lấy danh sách lô hàng có phân trang và filter.
 * Trả về: items, pagination meta, stats, loading, error, và hàm refetch.
 */

import { useState, useEffect, useCallback } from 'react';
import { batchApi } from '../api/batch.api';
import {
  BatchListItem,
  BatchListResponse,
  BatchStats,
  PaginationMeta,
  GetBatchListParams,
} from '../api/batch.types';
import { AxiosError } from 'axios';
import { ApiError } from '../../../api/axios';

interface UseBatchListState {
  items: BatchListItem[];
  meta: PaginationMeta | null;
  stats: BatchStats | null;
  isLoading: boolean;
  error: string | null;
}

interface UseBatchListReturn extends UseBatchListState {
  refetch: () => void;
}

/**
 * Hook để lấy danh sách Batch với filter, search và pagination.
 *
 * @param params - Query params (page, limit, search, status, origin_country)
 */
export function useBatchList(params?: GetBatchListParams): UseBatchListReturn {
  const [state, setState] = useState<UseBatchListState>({
    items: [],
    meta: null,
    stats: null,
    isLoading: true,
    error: null,
  });

  const { page, limit, search, status, origin_country } = params || {};
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { data } = await batchApi.getList({
        page,
        limit,
        search,
        status,
        origin_country,
      });
      const payload: BatchListResponse = data.data;
      setState({
        items: payload.items ?? [],
        meta: payload.meta ?? null,
        stats: payload.stats ?? null,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message ??
        axiosError.message ??
        'Không thể tải danh sách lô hàng';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, [page, limit, search, status, origin_country, fetchTrigger]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    setFetchTrigger(t => t + 1);
  }, []);

  return { ...state, refetch };
}
