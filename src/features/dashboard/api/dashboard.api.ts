import apiClient, { ApiResponse } from '../../../api/axios';

export interface DashboardStats {
  total_products: number;
  total_batches: number;
  total_ownerships: number;
  total_under_warranty: number;
  total_pending_approval: number;
  total_locations: number;
}

export const dashboardApi = {
  getStats: () => apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats'),
};
