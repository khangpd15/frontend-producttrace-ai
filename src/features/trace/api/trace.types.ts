/**
 * trace.types.ts
 *
 * TypeScript types map 1-to-1 từ Go Backend DTOs cho module Trace.
 *
 * Nguồn gốc:
 *   - TraceSearchRequest  → internal/modules/trace/dto/request/trace.go
 *   - TraceSearchResponse → internal/modules/trace/dto/response/trace.go
 *   - PDFExportRequest    → internal/modules/trace/dto/request/trace.go
 *   - ExcelExportRequest  → internal/modules/trace/dto/request/trace.go
 *   - ExportJobResponse   → internal/modules/trace/dto/response/trace.go
 */

// ─── Trace Search ────────────────────────────────────────────────────────────

/**
 * Query params cho GET /api/trace/search
 * `code` là bắt buộc (min=3, max=100) — có thể là product code hoặc serial number
 */
export interface TraceSearchParams {
  code: string;
  fromDate?: string;       // ISO date string, optional
  toDate?: string;         // ISO date string, optional
  eventTypes?: string;     // comma-separated, e.g. "MANUFACTURED,SOLD"
}

/** Từ ProductItemDTO */
export interface TraceProductItem {
  itemId: string;
  itemCode: string;
  serialNumber: string;
  status: string;
  productName: string;
  thumbnailUrl: string;
}

/** Từ TimelineEventDTO */
export interface TraceTimelineEvent {
  eventId: string;
  eventType: string;
  title: string;
  description: string;
  location: string;
  timestamp: string;
}

/** Từ FilterAppliedDTO */
export interface TraceFilterApplied {
  fromDate?: string | null;
  toDate?: string | null;
  eventTypes?: string[];
}

/**
 * Từ TraceSearchResponse
 * productItem có thể null nếu không tìm thấy sản phẩm
 * warning sẽ có giá trị nếu tìm kiếm không chính xác
 */
export interface TraceSearchResponse {
  productItem: TraceProductItem | null;
  warning: string;
  filterApplied: TraceFilterApplied | null;
  matchedEventsCount: number | null;
  timeline: TraceTimelineEvent[];
}

// ─── Trace Export PDF ────────────────────────────────────────────────────────

/**
 * Body JSON cho POST /api/trace/export/pdf
 * productItemId là UUID bắt buộc
 */
export interface TracePDFExportRequest {
  productItemId: string;
  theme?: 'WARM_MINIMAL' | 'CLASSIC_NAVY';
  includeAuditLogs?: boolean;
}

// ─── Trace Export Excel ──────────────────────────────────────────────────────

/**
 * Body JSON cho POST /api/trace/export/excel
 * productItemId hoặc batchId là optional — ít nhất một cái cần có
 */
export interface TraceExcelExportRequest {
  productItemId?: string;
  batchId?: string;
  fromDate?: string;
  toDate?: string;
}

// ─── Export Job Response ─────────────────────────────────────────────────────

/**
 * Từ ExportJobResponse — trả về khi export được xử lý async (HTTP 202)
 * Nếu file nhỏ: trả về binary trực tiếp (HTTP 200)
 */
export interface ExportJobResponse {
  jobId: string;
  status: string;
  estimatedTimeSeconds: number;
}

// ─── Verify QR Response ──────────────────────────────────────────────────────

export interface VerifyQRBatchInfo {
  batchCode: string;
  manufactureDate: string | null;
  expiryDate: string | null;
  manufacturerName: string;
  supplierName: string;
  originCountry: string;
  productionPlace: string;
  batchStatus: string;
}

export interface VerifyQRProductInfo {
  productName: string;
  description: string;
  thumbnailUrl: string;
  categoryName: string;
  variantName: string;
  variantSKU: string;
  barcode: string;
}

export interface VerifyQROwnership {
  ownerName: string;
  registeredAt: string;
  ownershipType: string;
  status: string;
}

export interface VerifyQRWarranty {
  claimNumber: string;
  status: string;
  createdAt: string;
}

export interface VerifyQRLocation {
  name: string;
  type: string;
  address: string;
  city: string;
}

export interface VerifyQREvent {
  eventType: string;
  title: string;
  description: string;
  location: string;
  actorName: string;
  occurredAt: string;
}

export interface VerifyQRResponse {
  itemCode: string;
  serialNumber: string;
  itemStatus: string;
  scannedAt: string;
  product: VerifyQRProductInfo;
  batch: VerifyQRBatchInfo;
  ownership: VerifyQROwnership | null;
  warranty: VerifyQRWarranty | null;
  location: VerifyQRLocation | null;
  traceHistory: VerifyQREvent[];
}

