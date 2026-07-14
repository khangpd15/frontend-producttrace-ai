/**
 * useBatchEvents.ts
 *
 * Hook gọi GET /api/batches/:id/events để lấy danh sách events của lô hàng.
 * Auth: Bearer Token
 */

import { useState, useEffect, useCallback } from 'react';
import { batchApi } from '../api/batch.api';
import { BatchEventDTO } from '../api/batch.types';
import { AxiosError } from 'axios';
import { ApiError } from '../../../api/axios';

interface UseBatchEventsState {
  events: BatchEventDTO[];
  isLoading: boolean;
  error: string | null;
}

interface UseBatchEventsReturn extends UseBatchEventsState {
  refetch: () => void;
}

/**
 * Hook để lấy danh sách sự kiện (events) của một Batch.
 *
 * @param batchId - UUID của batch
 */
export function useBatchEvents(batchId: string | null | undefined): UseBatchEventsReturn {
  const [state, setState] = useState<UseBatchEventsState>({
    events: [],
    isLoading: false,
    error: null,
  });

  const [fetchTrigger, setFetchTrigger] = useState(0);

  const fetchData = useCallback(async () => {
    if (!batchId) return;

    setState({ events: [], isLoading: true, error: null });
    try {
      const { data } = await batchApi.getEvents(batchId);
      setState({
        events: data.data ?? [],
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message ??
        axiosError.message ??
        'Không thể tải danh sách sự kiện của lô hàng';
      setState({
        events: [],
        isLoading: false,
        error: message,
      });
    }
  }, [batchId, fetchTrigger]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    setFetchTrigger(t => t + 1);
  }, []);

  return { ...state, refetch };
}
