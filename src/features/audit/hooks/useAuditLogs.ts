import { useQuery } from '@tanstack/react-query';
import { auditApi, GetAuditLogsParams, AuditLog, AuditListPayload } from '../api/audit.api';

// ─── Query key factory ────────────────────────────────────────────────────────
export const auditKeys = {
  all: ['audits'] as const,
  lists: () => [...auditKeys.all, 'list'] as const,
  list: (params: GetAuditLogsParams) => [...auditKeys.lists(), params] as const,
};

// ─── Response normaliser ──────────────────────────────────────────────────────
// Backend response (audit_response.go) uses json tags with snake_case:
//   id, user_id, action, entity, entity_id, old_data, new_data, created_at
// So no camelCase mapping needed — use fields directly.
function normaliseLog(item: any): AuditLog {
  let old_data: Record<string, unknown> | null = null;
  let new_data: Record<string, unknown> | null = null;

  const parseJson = (v: unknown): Record<string, unknown> | null => {
    if (!v) return null;
    if (typeof v === 'object') return v as Record<string, unknown>;
    if (typeof v === 'string') {
      try { return JSON.parse(v); } catch { return { raw: v }; }
    }
    return null;
  };

  old_data = parseJson(item.old_data ?? item.oldData);
  new_data = parseJson(item.new_data ?? item.newData);

  return {
    id: item.id,
    user_id: item.user_id ?? item.userId ?? null,
    action: item.action ?? '',
    entity: item.entity ?? '',
    entity_id: item.entity_id ?? item.entityId ?? '',
    old_data,
    new_data,
    created_at: item.created_at ?? item.createdAt ?? '',
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuditLogs(params: GetAuditLogsParams = {}) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: async (): Promise<AuditListPayload> => {
      const res = await auditApi.getLogs(params);
      const rawData = res.data.data as any;

      // Handler wraps result in: { data: [...], total, page, limit }
      const items: AuditLog[] = Array.isArray(rawData?.data)
        ? rawData.data.map(normaliseLog)
        : [];
      const total: number = typeof rawData?.total === 'number' ? rawData.total : 0;
      const page: number  = typeof rawData?.page  === 'number' ? rawData.page  : params.page  ?? 1;
      const limit: number = typeof rawData?.limit === 'number' ? rawData.limit : params.limit ?? 10;

      return { data: items, total, page, limit };
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev, // keep previous data while loading (TanStack v5)
  });
}
