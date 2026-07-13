/**
 * useBatchProducts.ts
 *
 * Hook gọi GET /api/batches/:id/products để lấy danh sách sản phẩm trong lô.
 * Auth: Bearer Token (ADMIN / STAFF / DEALER)
 */

import { useState, useEffect, useCallback } from 'react';
import { batchApi } from '../api/batch.api';
import {
  BatchProductItem,
  BatchProductPagination,
  GetBatchProductsParams,
} from '../api/batch.types';
import { AxiosError } from 'axios';
import { ApiError, parseApiError } from '../../../api/axios';

interface UseBatchProductsState {
  items: BatchProductItem[];
  pagination: BatchProductPagination | null;
  isLoading: boolean;
  error: string | null;
}

interface UseBatchProductsReturn extends UseBatchProductsState {
  refetch: () => void;
}

/**
 * Hook để lấy danh sách sản phẩm trong một Batch.
 *
 * @param batchId - UUID của batch
 * @param params  - Query params (page, limit, status, keyword)
 */
export function useBatchProducts(
  batchId: string | null | undefined,
  params?: GetBatchProductsParams,
): UseBatchProductsReturn {
  const [state, setState] = useState<UseBatchProductsState>({
    items: [],
    pagination: null,
    isLoading: false,
    error: null,
  });

  const [fetchTrigger, setFetchTrigger] = useState(0);

  const fetchData = useCallback(async () => {
    if (!batchId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { data } = await batchApi.getProducts(batchId, params);
      setState({
        items: data.data.items ?? [],
        pagination: data.data.pagination ?? null,
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
