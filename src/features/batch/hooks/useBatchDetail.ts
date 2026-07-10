/**
 * useBatchDetail.ts
 *
 * Hook gọi GET /api/batches/:batchCode để lấy chi tiết lô hàng.
 * QUAN TRỌNG: param là batchCode (string), KHÔNG phải UUID.
 * 
 * Chỉ fetch khi batchCode được cung cấp (enabled).
 */

import { useState, useEffect, useCallback } from 'react';
import { batchApi } from '../api/batch.api';
import { BatchDetailResponse } from '../api/batch.types';
import { AxiosError } from 'axios';
import { ApiError } from '../../../api/axios';

interface UseBatchDetailState {
  detail: BatchDetailResponse | null;
  isLoading: boolean;
  error: string | null;
}

interface UseBatchDetailReturn extends UseBatchDetailState {
  refetch: () => void;
}

/**
 * Hook để lấy chi tiết một Batch theo batchCode.
 *
 * @param batchCode - Mã lô hàng (string, ví dụ: "APL-2026-0001")
 */
export function useBatchDetail(batchCode: string | null | undefined): UseBatchDetailReturn {
  const [state, setState] = useState<UseBatchDetailState>({
    detail: null,
    isLoading: false,
    error: null,
  });

  const [fetchTrigger, setFetchTrigger] = useState(0);

  const fetchData = useCallback(async () => {
    if (!batchCode) return;

    setState({ detail: null, isLoading: true, error: null });
    try {
      const { data } = await batchApi.getDetail(batchCode);
      setState({
        detail: data.data,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message ??
        axiosError.message ??
        'Không thể tải thông tin lô hàng';
      setState({
        detail: null,
        isLoading: false,
        error: message,
      });
    }
  }, [batchCode, fetchTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    setFetchTrigger(t => t + 1);
  }, []);

  return { ...state, refetch };
}
