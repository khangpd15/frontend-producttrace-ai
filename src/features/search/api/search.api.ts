import { aiApiClient, ApiResponse } from '../../../api/axios';

export interface SearchFilters {
  category?: string;
  manufacturer?: string;
  province?: string;
}

export interface HybridSearchRequest {
    query: string;
    category?: string;
    manufacturer?: string;
    province?: string;
    limit?: number;
}

export interface SearchResultItem {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail_url?: string;
  score?: number;
  manufacturer?: string;
  province?: string;
  tags?: string[];
}

export interface HybridSearchResponse {
  results: SearchResultItem[];
  total: number;
  scores?: Record<string, number>;
}

export const searchApi = {
  /**
   * POST /search/hybrid
   * Nest AI hybrid search
   */
  hybridSearch: (payload: HybridSearchRequest) =>
    aiApiClient.post<ApiResponse<HybridSearchResponse>>('/search/hybrid', payload),
};
