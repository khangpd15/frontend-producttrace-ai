import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  warrantyApi,
  CustomerRequestWarrantyReq,
  CreateWarrantyReq,
  ApproveWarrantyReq,
  RejectWarrantyReq,
  VoidWarrantyReq,
} from '../api/warranty.api';

export const warrantyKeys = {
  all: ['warranties'] as const,
  lists: () => [...warrantyKeys.all, 'list'] as const,
  list: () => [...warrantyKeys.lists()] as const,
  my: () => [...warrantyKeys.all, 'my'] as const,
  details: () => [...warrantyKeys.all, 'detail'] as const,
  detail: (id: string) => [...warrantyKeys.details(), id] as const,
  byProductItem: (productItemId: string) => [...warrantyKeys.all, 'productItem', productItemId] as const,
};

export function useRequestWarranty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomerRequestWarrantyReq) => warrantyApi.requestWarranty(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warrantyKeys.all });
    },
  });
}

export function useWarrantyList() {
  return useQuery({
    queryKey: warrantyKeys.list(),
    queryFn: async () => {
      const { data } = await warrantyApi.listWarranties();
      return data.data;
    },
  });
}

export function useMyWarrantyList() {
  return useQuery({
    queryKey: warrantyKeys.my(),
    queryFn: async () => {
      const { data } = await warrantyApi.listMyWarranties();
      return data.data;
    },
  });
}

export function useWarrantyDetail(id: string) {
  return useQuery({
    queryKey: warrantyKeys.detail(id),
    queryFn: async () => {
      const { data } = await warrantyApi.getById(id);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useWarrantyByProductItem(productItemId: string) {
  return useQuery({
    queryKey: warrantyKeys.byProductItem(productItemId),
    queryFn: async () => {
      const { data } = await warrantyApi.getByProductItemId(productItemId);
      return data.data;
    },
    enabled: !!productItemId,
  });
}

export function useActivateWarranty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWarrantyReq) => warrantyApi.activateWarranty(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warrantyKeys.all });
    },
  });
}

export function useApproveWarranty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ApproveWarrantyReq }) =>
      warrantyApi.approveWarranty(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warrantyKeys.all });
    },
  });
}

export function useRejectWarranty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RejectWarrantyReq }) =>
      warrantyApi.rejectWarranty(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warrantyKeys.all });
    },
  });
}

export function useVoidWarranty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: VoidWarrantyReq }) =>
      warrantyApi.voidWarranty(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warrantyKeys.all });
    },
  });
}