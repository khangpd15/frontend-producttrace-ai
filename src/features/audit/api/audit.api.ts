import apiClient, { ApiResponse } from '../../../api/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;        // e.g. "CREATE", "UPDATE", "DELETE", "LOGIN"
  entity: string;        // e.g. "product", "batch", "user"
  entity_id: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditListResponse {
  items: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  entity?: string;
  user_id?: string;
  from_date?: string;
  to_date?: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const auditApi = {
  /**
   * GET /api/audits
   * Auth: Bearer Token (ADMIN only)
   */
  getLogs: (params?: GetAuditLogsParams) =>
    apiClient.get<ApiResponse<AuditListResponse>>('/audits', { params }),
};
