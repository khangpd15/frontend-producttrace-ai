import api from '../../../api/axios';
// ⚠️ Kiểm tra lại: nếu file `api/axios.ts` của bạn export instance axios với tên khác
// (vd: `export const apiClient = ...`), đổi import này cho khớp.

// ===== Types =====

export interface Attribute {
  id: string;
  category_id: string;
  code: string;
  label: string;
  created_at: string;
}

export interface AttributeValue {
  id: string;
  product_variant_id: string;
  attribute_id: string;
  label: string;
  value_text?: string | null;
  value_number?: number | null;
  value_boolean?: boolean | null;
  created_at: string;
}

export interface AssignAttributeValueItem {
  attribute_id: string;
  label: string;
  value_text?: string | null;
  value_number?: number | null;
  value_boolean?: boolean | null;
}

// ===== Attribute definitions (theo category) =====

// GET /attributes?category_id=...&limit=100
// BE trả thẳng mảng (không kèm total/page) — xem attribute_handler.go: ListAttributes
export async function getAttributesByCategory(categoryId: string): Promise<Attribute[]> {
  const res = await api.get('/attributes', {
    params: { category_id: categoryId, limit: 100, page: 1 },
  });
  return res.data.data as Attribute[];
}

// ===== Attribute values (gắn theo variant) =====

// POST /product-variants/:variant_id/attributes
export async function assignVariantAttributes(
  variantId: string,
  items: AssignAttributeValueItem[]
): Promise<AttributeValue[]> {
  const res = await api.post(`/product-variants/${variantId}/attributes`, { items });
  return res.data.data as AttributeValue[];
}

// GET /product-variants/:id/attributes
export async function getVariantAttributeValues(variantId: string): Promise<AttributeValue[]> {
  const res = await api.get(`/product-variants/${variantId}/attributes`);
  return res.data.data as AttributeValue[];
}

// PUT /attribute-values/:id
export async function updateAttributeValue(
  id: string,
  payload: Partial<Pick<AttributeValue, 'label' | 'value_text' | 'value_number' | 'value_boolean'>>
): Promise<AttributeValue> {
  const res = await api.put(`/attribute-values/${id}`, payload);
  return res.data.data as AttributeValue;
}

// DELETE /attribute-values/:id
export async function deleteAttributeValue(id: string): Promise<void> {
  await api.delete(`/attribute-values/${id}`);
}

// ⚠️ Các đường dẫn route ở trên (/attributes, /product-variants/:id/attributes,
// /attribute-values/:id) được suy ra từ handler đã gửi, KHÔNG có router.go đi kèm
// để xác nhận chính xác. Nếu Kong Gateway / router.go của bạn đặt prefix khác
// (vd: /api/v1/attributes, /product/variants/:id/attributes...), sửa lại cho khớp.