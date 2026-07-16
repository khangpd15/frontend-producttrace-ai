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
// Khớp với BE: internal/modules/product_attribute (handler/service/dto)
// Attribute = định nghĩa thuộc tính gắn với 1 category (vd category "Điện thoại"
// có attribute "Màu sắc", "Dung lượng"...). Mỗi category có bộ attribute riêng.

export interface CreateAttributeRequest {
  category_id: string;
  code: string;
  label: string;
}

export interface UpdateAttributeRequest {
  code?: string;
  label?: string;
}

// GET /attributes?category_id=...&limit=100
// BE có thể trả thẳng mảng hoặc bọc trong đối tượng phân trang (data.data hoặc data.items)
export async function getAttributesByCategory(categoryId: string): Promise<Attribute[]> {
  const res = await api.get('/attributes', {
    params: { category_id: categoryId, limit: 100, page: 1 },
  });
  const rawData = res.data;
  const dataField = rawData && typeof rawData === 'object' && 'data' in rawData ? rawData.data : rawData;
  if (Array.isArray(dataField)) {
    return dataField as Attribute[];
  }
  if (dataField && typeof dataField === 'object') {
    if (Array.isArray(dataField.items)) {
      return dataField.items as Attribute[];
    }
    if (Array.isArray(dataField.data)) {
      return dataField.data as Attribute[];
    }
  }
  return [];
}

// POST /attributes — tạo 1 attribute (thuộc tính) mới cho 1 category
export async function createAttribute(payload: CreateAttributeRequest): Promise<Attribute> {
  const res = await api.post('/attributes', payload);
  return res.data.data as Attribute;
}

// PUT /attributes/:id — sửa code/label của 1 attribute
export async function updateAttribute(id: string, payload: UpdateAttributeRequest): Promise<Attribute> {
  const res = await api.put(`/attributes/${id}`, payload);
  return res.data.data as Attribute;
}

// DELETE /attributes/:id
// Lưu ý: BE sẽ trả lỗi 409 (Conflict) nếu attribute này đã được gán giá trị
// (attribute_values) cho 1 variant nào đó — không cho xoá để tránh mất dữ liệu.
export async function deleteAttribute(id: string): Promise<void> {
  await api.delete(`/attributes/${id}`);
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
  const rawData = res.data;
  const dataField = rawData && typeof rawData === 'object' && 'data' in rawData ? rawData.data : rawData;
  if (Array.isArray(dataField)) {
    return dataField as AttributeValue[];
  }
  if (dataField && typeof dataField === 'object') {
    if (Array.isArray(dataField.items)) {
      return dataField.items as AttributeValue[];
    }
    if (Array.isArray(dataField.data)) {
      return dataField.data as AttributeValue[];
    }
  }
  return [];
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