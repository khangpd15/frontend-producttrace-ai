import apiClient, { ApiResponse } from '../../../api/axios';

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_products: number;
  total_batches: number;
  total_ownerships: number;
  total_under_warranty: number;
  total_pending_approval: number;
  total_locations: number;
}

// ─── Activities ───────────────────────────────────────────────────────────────

export interface DashboardActivity {
  id: string;
  event_type: string;
  title: string;
  description: string;
  created_at: string;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export interface DashboardAlert {
  id: string;
  type: 'DANGER' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  created_at: string;
}

// ─── Charts ───────────────────────────────────────────────────────────────────

export interface ChartDataPoint {
  time_period: string;
  production_volume: number;
  sales_volume: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const dashboardApi = {
  getStats: () =>
    apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats'),

  getActivities: (limit = 10) =>
    apiClient.get<ApiResponse<DashboardActivity[]>>('/dashboard/activities', {
      params: { limit },
    }),

  getAlerts: () =>
    apiClient.get<ApiResponse<DashboardAlert[]>>('/dashboard/alerts'),

  getCharts: () =>
    apiClient.get<ApiResponse<ChartDataPoint[]>>('/dashboard/charts/production-sales'),
};
