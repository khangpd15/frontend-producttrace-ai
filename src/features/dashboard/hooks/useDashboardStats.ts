import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats:      () => [...dashboardKeys.all, 'stats']      as const,
  activities: () => [...dashboardKeys.all, 'activities'] as const,
  alerts:     () => [...dashboardKeys.all, 'alerts']     as const,
  charts:     () => [...dashboardKeys.all, 'charts']     as const,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async () => {
      const { data } = await dashboardApi.getStats();
      return data.data;
    },
  });
}

export function useDashboardActivities(limit = 10) {
  return useQuery({
    queryKey: [...dashboardKeys.activities(), limit],
    queryFn: async () => {
      const { data } = await dashboardApi.getActivities(limit);
      return data.data ?? [];
    },
  });
}

export function useDashboardAlerts() {
  return useQuery({
    queryKey: dashboardKeys.alerts(),
    queryFn: async () => {
      const { data } = await dashboardApi.getAlerts();
      return data.data ?? [];
    },
  });
}

export function useDashboardCharts() {
  return useQuery({
    queryKey: dashboardKeys.charts(),
    queryFn: async () => {
      const { data } = await dashboardApi.getCharts();
      return data.data ?? [];
    },
  });
}
