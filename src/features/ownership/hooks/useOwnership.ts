import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ownershipApi,
  SearchOwnershipsParams,
  CustomerRequestOTPReq,
  CustomerRegisterReq,
  AdminRequestOTPReq,
  AdminRegisterReq,
  TransferOwnershipReq,
} from '../api/ownership.api';

export const ownershipKeys = {
  all: ['ownerships'] as const,
  lists: () => [...ownershipKeys.all, 'list'] as const,
  list: (params?: SearchOwnershipsParams) => [...ownershipKeys.lists(), params] as const,
  details: () => [...ownershipKeys.all, 'detail'] as const,
  detail: (id: string) => [...ownershipKeys.details(), id] as const,
};

export function useOwnershipList(params?: SearchOwnershipsParams) {
  return useQuery({
    queryKey: ownershipKeys.list(params),
    queryFn: async () => {
      const { data } = await ownershipApi.search(params);
      return data.data;
    },
  });
}

export function useOwnershipDetail(id: string) {
  return useQuery({
    queryKey: ownershipKeys.detail(id),
    queryFn: async () => {
      const { data } = await ownershipApi.getById(id);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useRequestOTP() {
  return useMutation({
    mutationFn: (payload: CustomerRequestOTPReq) => ownershipApi.requestOTP(payload),
  });
}

export function useRegisterOwnership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomerRegisterReq) => ownershipApi.register(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ownershipKeys.lists() });
    },
  });
}

export function useAdminRequestOTP() {
  return useMutation({
    mutationFn: (payload: AdminRequestOTPReq) => ownershipApi.adminRequestOTP(payload),
  });
}

export function useAdminRegisterOwnership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminRegisterReq) => ownershipApi.adminRegister(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ownershipKeys.lists() });
    },
  });
}

export function useTransferOwnership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TransferOwnershipReq }) =>
      ownershipApi.transfer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ownershipKeys.all });
    },
  });
}

export function useDeleteOwnership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ownershipApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ownershipKeys.lists() });
    },
  });
}
