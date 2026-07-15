import { useQuery } from '@tanstack/react-query';
import { auditApi, GetAuditLogsParams } from '../api/audit.api';

export function useAuditLogs(params?: GetAuditLogsParams) {
  return useQuery({
    queryKey: ['audits', params],
    queryFn: async () => {
      const res = await auditApi.getLogs(params);
      return res.data.data;
    },
    staleTime: 30_000,
  });
}
