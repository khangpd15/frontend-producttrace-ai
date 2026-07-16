import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi, CreateProductRequest, UpdateProductRequest, ProductListParams } from '../api/product.api';
import { useToast } from '../../../shared/hooks/useToast';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: ProductListParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export function useProductList(params?: ProductListParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: async () => {
      const { data } = await productApi.getAll(params);
      return data.data;
    },
  });
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const { data } = await productApi.getById(id);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (payload: CreateProductRequest) => productApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success('Tạo sản phẩm thành công!');
    },
    onError: () => {
      toast.error('Tạo sản phẩm thất bại. Vui lòng thử lại.');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductRequest }) =>
      productApi.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      toast.success('Cập nhật sản phẩm thành công!');
    },
    onError: () => {
      toast.error('Cập nhật sản phẩm thất bại. Vui lòng thử lại.');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success('Xóa sản phẩm thành công!');
    },
    onError: () => {
      toast.error('Xóa sản phẩm thất bại. Vui lòng thử lại.');
    },
  });
}

export function useUpdateVariant() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      productApi.updateVariant(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success('Cập nhật biến thể thành công!');
    },
    onError: () => {
      toast.error('Cập nhật biến thể thất bại. Vui lòng thử lại.');
    },
  });
}

export function useDeleteVariant() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => productApi.deleteVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success('Xóa biến thể thành công!');
    },
    onError: () => {
      toast.error('Xóa biến thể thất bại. Vui lòng thử lại.');
    },
  });
}


