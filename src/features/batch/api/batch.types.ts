/**
 * batch.types.ts
 *
 * TypeScript types được map 1-to-1 từ Go Backend DTOs.
 * Không suy đoán — chỉ dùng những gì Backend thực sự trả về.
 *
 * Nguồn gốc:
 *   - BatchListItemDTO      → internal/modules/batch/dto/response/batch_list.go
 *   - BatchDetailResponse   → internal/modules/batch/dto/response/batch_detail.go
 *   - BatchHistoryResponse  → internal/modules/batch/dto/response/batch_history.go
 *   - BatchProductsResponse → internal/modules/batch/dto/response/batch_products.go
 *   - SearchBatchResponse   → internal/modules/batch/dto/response/batch_search.go
 *   - BatchCreateResponse   → internal/modules/batch/dto/response/batch_create.go
 *   - BatchStatusResponse   → internal/modules/batch/dto/response/batch_status.go
 *   - PaginationMeta        → pkg/response/pagination.go
 */

// ─── Pagination ─────────────────────────────────────────────────────────────

/** Từ pkg/response/pagination.go */
export interface PaginationMeta {
  current_page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

// ─── Batch List ──────────────────────────────────────────────────────────────

/**
 * Từ BatchListItemDTO — đây là những fields thực tế BE trả về trong list.
 * THIẾU so với FE form: importedAt, manufacturerName, supplierName,
 * productionPlace, createdAt, updatedAt → phải gọi Detail API để lấy.
 */
export interface BatchListItem {
  id: string;
  batch_code: string;
  variant_id: string;
  variant_name: string;
  quantity: number;
  manufacture_date: string | null;
  expiry_date: string | null;
  origin_country: string;
  status: BatchStatus;
}

/** Từ BatchStatsDTO */
export interface BatchStats {
  total: number;
  active: number;
  expired: number;
  recalled_blocked: number;
}

/** Từ BatchListResponse */
export interface BatchListResponse {
  items: BatchListItem[];
  meta: PaginationMeta;
  stats: BatchStats;
}

// ─── Batch Detail ────────────────────────────────────────────────────────────

/** Từ BatchDetailVariantResponse */
export interface BatchDetailVariant {
  variant_id: string;
  sku: string;
  name: string;
  barcode: string | null;
}

/** Từ BatchDetailProductResponse */
export interface BatchDetailProduct {
  product_id: string;
  product_name: string;
}

/** Từ BatchDetailResponse — response đầy đủ khi gọi GET /batches/:batchCode */
export interface BatchDetailResponse {
  id: string;
  batch_code: string;
  manufacture_date: string | null;
  expiry_date: string | null;
  imported_at: string | null;
  manufacturer_name: string | null;
  supplier_name: string | null;
  origin_country: string | null;
  production_place: string | null;
  quantity: number;
  status: BatchStatus;
  created_at: string;
  updated_at: string;
  variant: BatchDetailVariant;
  product: BatchDetailProduct;
}

// ─── Batch Events ────────────────────────────────────────────────────────────

/** Từ BatchEventDTO — response/batch_events.go */
export interface BatchEventDTO {
  event_name: string;
  detail: string;
  created_at: string;
}

// ─── Batch History ───────────────────────────────────────────────────────────

/** Từ BatchHistoryActorDTO */
export interface BatchHistoryActor {
  userId: string;
  fullName: string;
  role: string;
}

/** Từ FieldDiffDTO */
export interface FieldDiff {
  old: unknown;
  new: unknown;
}

/** Từ BatchHistoryItemDTO */
export interface BatchHistoryItem {
  logId: string;
  action: string;
  changedFields: Record<string, FieldDiff>;
  performedBy: BatchHistoryActor | null;
  ipAddress: string;
  createdAt: string;
}

/**
 * Từ GetBatchHistoryResponse.
 * NOTE: Response không có pagination meta mặc dù request có page/limit.
 * Đây là gap của Backend.
 */
export interface BatchHistoryResponse {
  batchId: string;
  batchCode: string;
  history: BatchHistoryItem[];
}

// ─── Batch Products ──────────────────────────────────────────────────────────

/** Từ BatchProductLocationDTO */
export interface BatchProductLocation {
  locationId: string;
  name: string;
  type: string;
}

/** Từ BatchProductItemDTO */
export interface BatchProductItem {
  itemId: string;
  itemCode: string;
  serialNumber: string;
  status: string;
  currentLocation: BatchProductLocation | null;
  createdAt: string;
}

/** Từ BatchProductPaginationDTO */
export interface BatchProductPagination {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

/** Từ GetBatchProductsResponse */
export interface BatchProductsResponse {
  items: BatchProductItem[];
  pagination: BatchProductPagination;
}

// ─── Batch Search ────────────────────────────────────────────────────────────

/** Từ SearchBatchItemDTO */
export interface SearchBatchItem {
  batchId: string;
  batchCode: string;
  productName: string;
  manufacturingDate: string | null;
  quantity: number;
  status: BatchStatus;
  createdAt: string;
}

/** Từ SearchBatchPaginationDTO */
export interface SearchBatchPagination {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

/** Từ SearchBatchResponse */
export interface SearchBatchResponse {
  items: SearchBatchItem[];
  pagination: SearchBatchPagination;
}

// ─── Batch Create ────────────────────────────────────────────────────────────

/** Từ CreateBatchRequest — body JSON gửi lên */
export interface CreateBatchRequest {
  variant_id: string;
  prefix: string;
  manufacture_date?: string | null;
  expiry_date?: string | null;
  imported_at?: string | null;
  manufacturer_name?: string | null;
  supplier_name?: string | null;
  origin_country?: string | null;
  production_place?: string | null;
  quantity: number;
}

/** Từ BatchCreateResponse */
export interface BatchCreateResponse {
  id: string;
  batch_code: string;
  variant_id: string;
  quantity: number;
  status: BatchStatus;
  created_at: string;
}

// ─── Batch Update Status ─────────────────────────────────────────────────────

/** Từ BatchStatusResponse */
export interface BatchStatusResponse {
  id: string;
  batch_code: string;
  status: BatchStatus;
  updated_at: string;
}

// ─── Batch Export ────────────────────────────────────────────────────────────

/** Từ ExportBatchRequest — body JSON gửi lên POST /batches/:id/export */
export interface ExportBatchRequest {
  destination_location: string;
  quantity: number;
  operator_name: string;
  notes?: string;
}

// ─── Status Enum ─────────────────────────────────────────────────────────────

/**
 * Status values được dùng trong FE.
 * NOTE: BE chưa document rõ enum — cần xác nhận BE hỗ trợ RECALLED/BLOCKED.
 */
export type BatchStatus = 'ACTIVE' | 'EXPIRED' | 'RECALLED' | 'BLOCKED' | 'DRAFT';

// ─── Query Params ────────────────────────────────────────────────────────────

/** Query params cho GET /api/batches */
export interface GetBatchListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  origin_country?: string;
}

/** Query params cho GET /api/batches/search */
export interface SearchBatchParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/** Query params cho GET /api/batches/:id/history */
export interface GetBatchHistoryParams {
  page?: number;
  limit?: number;
}

/** Query params cho GET /api/batches/:id/products */
export interface GetBatchProductsParams {
  page?: number;
  limit?: number;
  status?: string;
  keyword?: string;
}
