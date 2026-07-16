import apiClient, { ApiResponse } from '../../../api/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Matches backend AuditLogResponse */
export interface AuditLogResponse {
  id: string;
  user_id: string | null;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  entity_id: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLogListResponse {
  data: AuditLogResponse[];
  total: number;
  page: number;
  limit: number;
}

/** Matches backend GetAuditLogsRequest */
export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  action?: 'CREATE' | 'UPDATE' | 'DELETE';
  entity?: string;
  /** ISO 8601 datetime string e.g. "2024-01-01T00:00:00Z" */
  from_date?: string;
  to_date?: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const auditApi = {
  /**
   * GET /audits — Retrieve paginated audit logs (Admin only).
   * Supports filtering by action, entity, date range.
   */
  getLogs: (params?: GetAuditLogsParams) =>
    apiClient.get<ApiResponse<AuditLogListResponse>>('/audits', { params }),
};
