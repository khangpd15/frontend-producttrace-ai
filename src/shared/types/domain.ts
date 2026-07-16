export type NavItem = 'home' | 'warranty' | 'ownership' | 'profile';

export interface ProductItem {
  id: string;
  itemCode: string;
  serialNumber: string;
  status: string;
  metadataJson?: any;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  categoryId: string;
  thumbnailUrl?: string;
  status: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface Variant {
  sku: string;
  name: string;
  barcode?: string;
  price: number;
  currency: string;
  imagesJson?: any;
}

export interface Batch {
  batchCode: string;
  manufactureDate: string;
  expiryDate: string;
  manufacturerName: string;
  originCountry: string;
  status: string;
}

export interface Location {
  name: string;
  address: string;
  type: string;
}

export interface Ownership {
  ownerName: string;
  ownershipType: string;
  purchaseDate: string;
  status: string;
}

export interface Warranty {
  id: string;
  product_item_id: string;
  owner_id?: string;
  itemCode: string;
  itemName: string;
  serialNumber: string;
  ownerName: string;
  ownerEmail: string;
  warrantyCode: string;
  policyName: string;
  policyDescription: string;
  durationMonths: number;
  status: string;
  startDate: string;
  endDate: string;
  invoiceNumber: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
}

export interface Statistics {
  scanCount: number;
  transferCount: number;
  warrantyCount: number;
  eventCount: number;
}

export interface ProductEvent {
  type: string;
  title: string;
  description: string;
  createdAt: string;
  actor: { name: string; role: string };
  location: { name: string; address: string };
  attachments: { url: string; name: string; type: string }[];
}

export interface ProductDetailData {
  item: ProductItem;
  product: Product;
  category: { name: string; code: string };
  variant: Variant;
  batch: Batch;
  location: Location;
  ownership?: Ownership;
  warranty?: Warranty;
  events: ProductEvent[];
  lifecycle: string[];
  documents: Document[];
  statistics: Statistics;
}

// ==========================================
// ADMIN MODULE TYPES & INTERFACES
// ==========================================

export type AdminProductStatus = 'ACTIVE' | 'DRAFT' | 'DISCONTINUED';
export type AdminVariantStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
export type AdminBatchStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
export type AdminItemStatus = 'ACTIVE' | 'INACTIVE' | 'SOLD';

export interface AdminAttributeDef {
  id: string;
  category_id: string;
  code: string;
  label: string;
}

export interface AdminCreateAttributeValue {
  attribute_id: string;
  label: string;
  value_kind: 'text' | 'number' | 'boolean';
  value_text?: string;
  value_number?: number;
  value_boolean?: boolean;
}

export interface AdminEditAttributeValue {
  label: string;
  value_text?: string;
  value_number?: number;
  value_boolean?: boolean;
}

export interface AdminVariantImage {
  url: string;
}

export interface AdminCreateVariant {
  ui_id: string;
  sku: string;
  name: string;
  barcode: string;
  price: string;
  currency: 'VND' | 'USD';
  images: AdminVariantImage[];
  status: AdminVariantStatus;
  attribute_values: AdminCreateAttributeValue[];
}

export interface AdminEditVariant {
  id: string;
  sku: string;
  name: string;
  barcode: string;
  price: number;
  currency: string;
  images_json: string;
  status: AdminVariantStatus;
  attributes: AdminEditAttributeValue[];
}

export interface AdminCreateProductFormData {
  name: string;
  slug: string;
  category_id: string;
  description: string;
  thumbnail_url: string;
  tags: string[];
  metadata_json: string;
  status: AdminProductStatus;
}

export interface AdminEditProductFormData {
  name: string;
  slug: string;
  category_id: string;
  category: string;
  description: string;
  thumbnail_url: string;
  tags: string;
  status: AdminProductStatus;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  category_id: string;
  description: string;
  thumbnail_url: string;
  status: AdminProductStatus;
  variants_count: number;
  batches_count: number;
  items_count: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBatch {
  id: string;
  batchCode: string;
  manufactureDate: string;
  expiryDate: string;
  manufacturerName: string;
  originCountry: string;
  status: AdminBatchStatus;
  createdAt: string;
  updatedAt: string;
  itemName?: string;
}

export interface AdminWarranty {
  id: string;
  warrantyCode: string;
  itemName: string;
  serialNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: 'ACTIVE' | 'EXPIRED' | 'VOIDED';
  activatedAt: string;
  expiresAt: string;
  periodMonths: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'DEALER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  phone: string;
  lastLogin: string;
  createdAt: string;
}

export interface AdminLocationPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  manager: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AdminNotificationItem {
  id: string;
  title: string;
  content: string;
  type: 'INFO' | 'WARNING' | 'ALERT';
  targetRole: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  content: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SECURITY';
  actorName: string;
  actorEmail: string;
  actorRole: string;
  ipAddress: string;
  createdAt: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  code: string;
  slug: string;
  parentId: string | null;
  description: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  icon: string;
  updatedAt: string;
  createdAt: string;
}

export interface AdminOwnership {
  id: string;
  itemCode: string;
  itemName: string;
  serialNumber: string;
  ownerName: string;
  ownerEmail: string;
  status: 'ACTIVE' | 'TRANSFERRED' | 'REVOKED' | 'PENDING';
  ownershipType: 'PRIMARY' | 'TRANSFERRED';
  ownedAt: string;
  purchaseDate: string;
  purchaseLocation: string;
  invoiceNumber: string;
  createdAt: string;
  updatedAt: string;
}

// Page-specific Admin Types
export type AdminProductDetailProductStatus = 'ACTIVE' | 'DRAFT' | 'DISCONTINUED';
export type AdminProductDetailVariantStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
export type AdminProductDetailBatchStatus = 'ACTIVE' | 'EXPIRED' | 'RECALLED' | 'BLOCKED';
export type AdminProductDetailItemStatus = 'IN_STOCK' | 'IN_TRANSIT' | 'AT_DEALER' | 'SOLD' | 'REGISTERED' | 'WARRANTY_ACTIVE' | 'RETURNED' | 'RECALLED' | 'LOST' | 'DAMAGED';

export interface AdminProductDetailAttributeValue {
  label: string;
  value_text?: string;
  value_number?: number;
  value_boolean?: boolean;
}

export interface AdminProductDetailVariant {
  id: string;
  sku: string;
  name: string;
  barcode: string;
  price: number;
  currency: string;
  images_json: string;
  status: AdminProductDetailVariantStatus;
  attributes: AdminProductDetailAttributeValue[];
}

export interface AdminProductDetailBatch {
  id: string;
  batchCode: string;
  variantName: string;
  quantity: number;
  manufactureDate: string;
  expiryDate: string;
  originCountry: string;
  supplierName: string;
  status: AdminProductDetailBatchStatus;
  importedAt: string;
}

export interface AdminProductDetailProductItem {
  id: string;
  variantName: string;
  batchCode: string;
  itemCode: string;
  serialNumber: string;
  status: AdminProductDetailItemStatus;
  producedAt: string;
  locationName: string;
  traceEvents?: AdminProductDetailTraceEvent[];
}

export interface AdminProductDetailTraceEvent {
  id: string;
  event: string;
  detail: string;
  actor: string;
  location: string;
  timestamp: string;
  type: 'manufacture' | 'import' | 'transfer' | 'activate' | 'warranty' | 'claim';
}

export interface AdminProductDetailProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryId: string;
  description: string;
  thumbnailUrl: string;
  status: AdminProductDetailProductStatus;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  totalVariants: number;
  totalBatches: number;
  totalOwners: number;
  totalWarranties: number;
  variants: AdminProductDetailVariant[];
  batches: AdminProductDetailBatch[];
  items: AdminProductDetailProductItem[];
  traceEvents: AdminProductDetailTraceEvent[];
}

export interface AdminBatchListBatch {
  id: string;
  batchCode: string;
  itemName: string;
  manufactureDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  quantity: number;
  scannedCount: number;
  originCountry: string;
  createdAt: string;
  updatedAt: string;
}

export type AdminProductListStatus = 'ACTIVE' | 'DRAFT' | 'DISCONTINUED';

export interface AdminProductListProduct {
  id: string;
  name: string;
  category: string;
  variants: number;
  batches: number;
  status: AdminProductListStatus;
  date: string;
}

export interface AdminCreateProductCategory {
  id: string;
  name: string;
  parent_id: string | null;
}

export interface AdminBatchListPageBatch {
  id: string;
  variantId: string;
  variantName: string;
  batchCode: string;
  manufactureDate: string;
  expiryDate: string;
  importedAt: string;
  manufacturerName: string;
  supplierName: string;
  originCountry: string;
  productionPlace: string;
  quantity: number;
  status: 'ACTIVE' | 'EXPIRED' | 'RECALLED' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
}

export interface AdminWarrantyListPageWarranty {
  id: string;
  product_item_id: string;
  owner_id?: string;
  itemCode: string;
  itemName: string;
  serialNumber: string;
  ownerName: string;
  ownerEmail: string;
  warrantyCode: string;
  policyName: string;
  policyDescription: string;
  durationMonths: number;
  status: 'INACTIVE' | 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CLAIMED' | 'RESOLVED' | 'REJECTED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  invoiceNumber: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserListUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'STAFF' | 'DEALER' | 'CUSTOMER';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  date: string;
}

export interface AdminStoreListPageLocationPoint {
  id: string;
  code: string;
  name: string;
  type: 'WAREHOUSE' | 'STORE' | 'DEALER' | 'WARRANTY_CENTER';
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  openingHours: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminNotificationListPageNotificationItem {
  id: string;
  title: string;
  content: string;
  type: 'SYSTEM' | 'BUSINESS' | 'ALERT';
  targetRole: 'ALL' | 'STAFF' | 'DEALER' | 'CUSTOMER';
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}








