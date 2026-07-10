/**
 * useTraceSearch.ts
 *
 * Hook gọi GET /api/trace/search để tìm kiếm timeline sản phẩm.
 * Auth: Public — không cần Bearer Token (rate-limited 30 req/min)
 * 
 * `code` là bắt buộc (min=3, max=100).
 * Hook chỉ fetch khi `code` hợp lệ.
 */

import { useState, useCallback } from 'react';
import { traceApi } from '../api/trace.api';
import { TraceSearchParams, TraceSearchResponse } from '../api/trace.types';
import { AxiosError } from 'axios';
import { ApiError } from '../../../api/axios';

interface UseTraceSearchState {
  result: TraceSearchResponse | null;
  isLoading: boolean;
  error: string | null;
}

interface UseTraceSearchReturn extends UseTraceSearchState {
  search: (params: TraceSearchParams) => Promise<void>;
  reset: () => void;
}

/**
 * Hook để tra cứu lịch sử timeline sản phẩm theo code.
 * Không tự động fetch — gọi `search()` khi cần.
 */
export function useTraceSearch(): UseTraceSearchReturn {
  const [state, setState] = useState<UseTraceSearchState>({
    result: null,
    isLoading: false,
    error: null,
  });

  const search = useCallback(async (params: TraceSearchParams) => {
    if (!params.code || params.code.trim().length < 3) {
      setState(prev => ({
        ...prev,
        error: 'Vui lòng nhập ít nhất 3 ký tự để tìm kiếm',
      }));
      return;
    }

    setState({ result: null, isLoading: true, error: null });
    try {
      const { data } = await traceApi.search(params);
      setState({
        result: data.data,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message ??
        axiosError.message ??
        'Không thể tra cứu thông tin sản phẩm';
      setState({
        result: null,
        isLoading: false,
        error: message,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ result: null, isLoading: false, error: null });
  }, []);

  return { ...state, search, reset };
}
