import { useQuery } from '@tanstack/react-query';
import { auditApi, GetAuditLogsParams } from '../api/audit.api';

export function useAuditLogs(params?: GetAuditLogsParams) {
  return useQuery({
    queryKey: ['audits', params],
    queryFn: async () => {
      const res = await auditApi.getLogs(params);
      const rawData = res.data.data as any;
      
      const items = Array.isArray(rawData?.data) ? rawData.data : [];
      const total = typeof rawData?.total === 'number' ? rawData.total : 0;
      const page = typeof rawData?.page === 'number' ? rawData.page : 1;
      const limit = typeof rawData?.limit === 'number' ? rawData.limit : 20;

      const mappedItems = items.map((item: any) => {
        let old_data: Record<string, unknown> | null = null;
        let new_data: Record<string, unknown> | null = null;

        if (item.oldData) {
          try {
            old_data = typeof item.oldData === 'string' ? JSON.parse(item.oldData) : item.oldData;
          } catch {
            old_data = { raw: item.oldData };
          }
        }
        if (item.newData) {
          try {
            new_data = typeof item.newData === 'string' ? JSON.parse(item.newData) : item.newData;
          } catch {
            new_data = { raw: item.newData };
          }
        }

        return {
          id: item.id,
          user_id: item.userId,
          action: item.action,
          entity: item.entity,
          entity_id: item.entityId,
          old_data,
          new_data,
          created_at: item.createdAt,
        };
      });

      return {
        items: mappedItems,
        total,
        page,
        limit,
      };
    },
    staleTime: 30_000,
  });
}
