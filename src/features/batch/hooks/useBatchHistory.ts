/**
 * useBatchHistory.ts
 *
 * Hook gọi GET /api/batches/:id/history để lấy lịch sử thay đổi lô hàng.
 * Auth: Chỉ ADMIN / STAFF mới có quyền (BE middleware RoleMiddleware).
 *
 * NOTE: BE response không trả về pagination meta dù request có page/limit.
 * Đây là gap của Backend — đã được ghi nhận.
 */

import { useState, useEffect, useCallback } from 'react';
import { batchApi } from '../api/batch.api';
import { BatchHistoryItem, GetBatchHistoryParams } from '../api/batch.types';
import { AxiosError } from 'axios';
import { ApiError, parseApiError } from '../../../api/axios';

interface UseBatchHistoryState {
  batchId: string;
  batchCode: string;
  history: BatchHistoryItem[];
  isLoading: boolean;
  error: string | null;
}

interface UseBatchHistoryReturn extends UseBatchHistoryState {
  refetch: () => void;
}

/**
 * Hook để lấy lịch sử thay đổi của một Batch.
 *
 * @param batchId - UUID của batch
 * @param params  - Query params (page, limit)
 */
export function useBatchHistory(
  batchId: string | null | undefined,
  params?: GetBatchHistoryParams,
): UseBatchHistoryReturn {
  const [state, setState] = useState<UseBatchHistoryState>({
    batchId: '',
    batchCode: '',
    history: [],
    isLoading: false,
    error: null,
  });

  const [fetchTrigger, setFetchTrigger] = useState(0);

  const fetchData = useCallback(async () => {
    if (!batchId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { data } = await batchApi.getHistory(batchId, params);
      setState({
        batchId: data.data.batchId,
        batchCode: data.data.batchCode,
        history: data.data.history ?? [],
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: parseApiError(err),
      }));
    }
  }, [batchId, fetchTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    setFetchTrigger(t => t + 1);
  }, []);

  return { ...state, refetch };
}
