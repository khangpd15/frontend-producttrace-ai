import { useMutation } from '@tanstack/react-query';
import { searchApi, HybridSearchRequest } from '../api/search.api';

export function useHybridSearch() {
  return useMutation({
    mutationFn: async (payload: HybridSearchRequest) => {
      const res = await searchApi.hybridSearch(payload);
      return res.data.data;
    },
  });
}
