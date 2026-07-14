/**
 * useExportBatches.ts
 *
 * Hook xử lý mutation bulk export batch.
 * - Gọi POST /api/batches/export với payload ExportBatchesRequest.
 * - Trả về { exportBatches, isExporting, exportError, reset }.
 */

import { useState, useCallback } from 'react';
import { batchApi } from '../api/batch.api';
import { ExportBatchesRequest, ExportBatchesResponse } from '../api/batch.types';
import { AxiosError } from 'axios';
import { ApiError } from '../../../api/axios';

interface UseExportBatchesState {
  isExporting: boolean;
  exportError: string | null;
  exportResult: ExportBatchesResponse | null;
}

interface UseExportBatchesReturn extends UseExportBatchesState {
  exportBatches: (payload: ExportBatchesRequest) => Promise<ExportBatchesResponse | null>;
  reset: () => void;
}

/**
 * Hook để xuất nhiều batch cùng lúc.
 *
 * @example
 * const { exportBatches, isExporting, exportError } = useExportBatches();
 *
 * const result = await exportBatches({
 *   batch_ids: ['uuid1', 'uuid2'],
 *   destination_location_id: 'location-uuid',
 *   note: 'Xuất hàng cho cửa hàng A',
 * });
 */
export function useExportBatches(): UseExportBatchesReturn {
  const [state, setState] = useState<UseExportBatchesState>({
    isExporting: false,
    exportError: null,
    exportResult: null,
  });

  const exportBatches = useCallback(async (payload: ExportBatchesRequest): Promise<ExportBatchesResponse | null> => {
    setState({ isExporting: true, exportError: null, exportResult: null });
    try {
      const { data } = await batchApi.exportBatches(payload);
      const result = data.data;
      setState({ isExporting: false, exportError: null, exportResult: result });
      return result;
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message =
        axiosError.response?.data?.message ??
        axiosError.message ??
        'Xuất lô hàng thất bại. Vui lòng thử lại.';
      setState({ isExporting: false, exportError: message, exportResult: null });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isExporting: false, exportError: null, exportResult: null });
  }, []);

  return { ...state, exportBatches, reset };
}
