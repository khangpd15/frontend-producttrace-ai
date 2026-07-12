import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  categoryApi,
  ListCategoryParams,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../api/category.api';

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params?: ListCategoryParams) => [...categoryKeys.lists(), params] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export function useCategoryList(params?: ListCategoryParams) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: async () => {
      const { data } = await categoryApi.list(params);
      return data.data;
    },
  });
}

export function useCategoryDetail(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: async () => {
      const { data } = await categoryApi.getById(id);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryRequest) => categoryApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryRequest }) =>
      categoryApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}
