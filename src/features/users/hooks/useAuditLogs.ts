import { useQuery } from '@tanstack/react-query';
import { auditApi, GetAuditLogsParams } from '../api/audit.api';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const auditKeys = {
  all: ['audits'] as const,
  lists: () => [...auditKeys.all, 'list'] as const,
  list: (params: GetAuditLogsParams) => [...auditKeys.lists(), params] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Fetch paginated audit logs with optional filters.
 * Route: GET /audits (Admin only).
 *
 * @example
 * const { data, isLoading } = useAuditLogs({ action: 'DELETE', entity: 'User', page: 1, limit: 20 });
 */
export function useAuditLogs(params: GetAuditLogsParams = {}) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: async () => {
      const { data } = await auditApi.getLogs(params);
      return data.data; // { data: AuditLogResponse[], total, page, limit }
    },
  });
}
