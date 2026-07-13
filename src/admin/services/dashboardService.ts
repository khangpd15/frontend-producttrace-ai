import apiClient from '../../api/axios';
import { ApiResponse } from '../../api/axios';

export interface DashboardStats {
  total_products: number;
  total_batches: number;
  total_ownerships: number;
  total_under_warranty: number;
  total_pending_approval: number;
  total_locations: number;
}

export interface DashboardActivity {
  id: string;
  event_type: string;
  title: string;
  description: string;
  created_at: string;
}

export interface DashboardAlert {
  id: string;
  type: 'DANGER' | 'WARNING' | 'INFO';
  title: string;
  description: string;
}

export interface DashboardChartItem {
  time_period: string;
  production_volume: number;
  sales_volume: number;
}

export const dashboardService = {
  /**
   * GET /api/dashboard/stats
   * Lấy số liệu thống kê tổng quan cho trang Dashboard.
   * Yêu cầu Bearer Token (ADMIN, STAFF).
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data.data;
  },

  /**
   * GET /api/dashboard/activities
   * Lấy danh sách nhật ký hoạt động.
   * Yêu cầu Bearer Token (ADMIN, STAFF).
   */
  getActivities: async (limit: number = 10): Promise<DashboardActivity[]> => {
    const response = await apiClient.get<ApiResponse<DashboardActivity[]>>('/dashboard/activities', {
      params: { limit },
    });
    return response.data?.data ?? [];
  },

  /**
   * GET /api/dashboard/alerts
   * Lấy danh sách cảnh báo & rủi ro.
   * Yêu cầu Bearer Token (ADMIN, STAFF).
   */
  getAlerts: async (): Promise<DashboardAlert[]> => {
    const response = await apiClient.get<ApiResponse<DashboardAlert[]>>('/dashboard/alerts');
    return response.data?.data ?? [];
  },

  /**
   * GET /api/dashboard/charts/production-sales
   * Lấy dữ liệu sản xuất và doanh số theo thời gian để vẽ biểu đồ.
   * Yêu cầu Bearer Token (ADMIN, STAFF).
   */
  getChartData: async (): Promise<DashboardChartItem[]> => {
    const response = await apiClient.get<ApiResponse<DashboardChartItem[]>>('/dashboard/charts/production-sales');
    return response.data?.data ?? [];
  },
};
