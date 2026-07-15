import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAttributesByCategory,
  assignVariantAttributes,
  getVariantAttributeValues,
  updateAttributeValue,
  deleteAttributeValue,
  AssignAttributeValueItem,
  AttributeValue,
} from '../api/attribute.api';

// Danh sách attribute definitions theo category (dùng khi tạo/sửa variant)
export function useAttributesByCategory(categoryId?: string) {
  return useQuery({
    queryKey: ['attributes', 'by-category', categoryId],
    queryFn: () => getAttributesByCategory(categoryId as string),
    enabled: !!categoryId,
  });
}

// Danh sách attribute values đã gán cho 1 variant (dùng ở trang edit)
export function useVariantAttributeValues(variantId?: string) {
  return useQuery({
    queryKey: ['attribute-values', 'by-variant', variantId],
    queryFn: () => getVariantAttributeValues(variantId as string),
    enabled: !!variantId,
  });
}

// Gán (tạo mới) attribute values cho 1 variant — dùng sau khi tạo variant xong
export function useAssignVariantAttributes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, items }: { variantId: string; items: AssignAttributeValueItem[] }) =>
      assignVariantAttributes(variantId, items),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['attribute-values', 'by-variant', variables.variantId] });
    },
  });
}

export function useUpdateAttributeValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AttributeValue> }) =>
      updateAttributeValue(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attribute-values'] });
    },
  });
}

export function useDeleteAttributeValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAttributeValue(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attribute-values'] });
    },
  });
}