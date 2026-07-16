import apiClient, { ApiResponse } from '../../../api/axios';

// ─── Types ────────────────────────────────────────────────────────────────────
// Synced with: internal/modules/audit/dto/response/audit_response.go

export interface AuditLog {
  id: string;
  user_id: string | null;           // uuid or null for system actions
  action: string;                   // CREATE | UPDATE | DELETE
  entity: string;                   // e.g. "product", "batch", "user"
  entity_id: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;               // ISO-8601
}

/** Shape returned by GET /api/audits — wrapped inside ApiResponse.data */
export interface AuditListPayload {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

// ─── NOTE on Backend limitations ─────────────────────────────────────────────
// GetAuditLogsRequest (audit_request.go) supports:
//   page, limit, action (CREATE|UPDATE|DELETE only), entity, from_date, to_date
// Missing from backend:
//   - user_id filter   → not in DTO → cannot server-filter by user
//   - LOGIN / LOGOUT   → action validation rejects these values
//   - sort field/order → no sort support on backend

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  /** Backend only accepts: CREATE | UPDATE | DELETE (not LOGIN/LOGOUT) */
  action?: string;
  entity?: string;
  from_date?: string;   // ISO-8601 e.g. "2026-07-01T00:00:00Z"
  to_date?: string;     // ISO-8601 e.g. "2026-07-16T23:59:59Z"
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const auditApi = {
  /**
   * GET /api/audits
   * Auth: Bearer Token (ADMIN only)
   * Query: page, limit, action, entity, from_date, to_date
   */
  getLogs: (params?: GetAuditLogsParams) =>
    apiClient.get<ApiResponse<AuditListPayload>>('/audits', { params }),
};
