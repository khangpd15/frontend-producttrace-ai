import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAttributesByCategory,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  assignVariantAttributes,
  getVariantAttributeValues,
  updateAttributeValue,
  deleteAttributeValue,
  AssignAttributeValueItem,
  AttributeValue,
  CreateAttributeRequest,
  UpdateAttributeRequest,
} from '../api/attribute.api';
import { useToast } from '../../../shared/hooks/useToast';

// Danh sách attribute definitions theo category (dùng khi tạo/sửa variant,
// và khi quản lý thuộc tính ngay trong màn Category)
export function useAttributesByCategory(categoryId?: string) {
  return useQuery({
    queryKey: ['attributes', 'by-category', categoryId],
    queryFn: () => getAttributesByCategory(categoryId as string),
    enabled: !!categoryId,
  });
}

// ===== Quản lý định nghĩa Attribute (tạo/sửa/xoá) theo Category =====
// Dùng ở màn hình Category (tạo/sửa danh mục luôn kèm quản lý thuộc tính)

export function useCreateAttribute() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (payload: CreateAttributeRequest) => createAttribute(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['attributes', 'by-category', variables.category_id] });
      toast.success('Thêm thuộc tính thành công!');
    },
    onError: () => {
      toast.error('Thêm thuộc tính thất bại. Vui lòng thử lại.');
    },
  });
}

export function useUpdateAttribute() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAttributeRequest }) =>
      updateAttribute(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attributes', 'by-category'] });
      toast.success('Cập nhật thuộc tính thành công!');
    },
    onError: () => {
      toast.error('Cập nhật thuộc tính thất bại. Vui lòng thử lại.');
    },
  });
}

export function useDeleteAttribute() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => deleteAttribute(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attributes', 'by-category'] });
      toast.success('Xóa thuộc tính thành công!');
    },
    onError: (err: any) => {
      // BE trả 409 nếu attribute đã có giá trị gán cho variant -> không cho xoá
      const status = err?.response?.status;
      if (status === 409) {
        toast.error('Không thể xoá: thuộc tính này đang được sử dụng bởi sản phẩm.');
      } else {
        toast.error('Xóa thuộc tính thất bại. Vui lòng thử lại.');
      }
    },
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
  const toast = useToast();
  return useMutation({
    mutationFn: ({ variantId, items }: { variantId: string; items: AssignAttributeValueItem[] }) =>
      assignVariantAttributes(variantId, items),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['attribute-values', 'by-variant', variables.variantId] });
      toast.success('Gán thuộc tính thành công!');
    },
    onError: () => {
      toast.error('Gán thuộc tính thất bại. Vui lòng thử lại.');
    },
  });
}

export function useUpdateAttributeValue() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AttributeValue> }) =>
      updateAttributeValue(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attribute-values'] });
      toast.success('Cập nhật giá trị thuộc tính thành công!');
    },
    onError: () => {
      toast.error('Cập nhật giá trị thuộc tính thất bại. Vui lòng thử lại.');
    },
  });
}

export function useDeleteAttributeValue() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => deleteAttributeValue(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attribute-values'] });
      toast.success('Xóa giá trị thuộc tính thành công!');
    },
    onError: () => {
      toast.error('Xóa giá trị thuộc tính thất bại. Vui lòng thử lại.');
    },
  });
}