import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  warrantyApi,
  CreateWarrantyReq,
  ApproveWarrantyReq,
  RejectWarrantyReq,
  CreateWarrantyClaimReq,
  CustomerRequestWarrantyReq,
  WarrantyItem,
} from '../api/warranty.api';
import { parseApiError } from '../../../api/axios';

// Simple toast helper — no external lib required
const toast = {
  success: (msg: string) => console.log('%c✓ ' + msg, 'color: green; font-weight: bold'),
  error:   (msg: string) => console.error('%c✗ ' + msg, 'color: red; font-weight: bold'),
};

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const WARRANTY_KEYS = {
  all: ['warranties'] as const,
};

// ─── List Warranties ──────────────────────────────────────────────────────────

export function useWarrantyList() {
  return useQuery<WarrantyItem[]>({
    queryKey: WARRANTY_KEYS.all,
    queryFn: async () => {
      const response = await warrantyApi.listWarranties();
      return response.data.data; // { data: WarrantyItem[] }
    },
  });
}

// ─── Activate Warranty (Admin) ────────────────────────────────────────────────

export function useActivateWarranty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateWarrantyReq) => {
      const response = await warrantyApi.activateWarranty(payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WARRANTY_KEYS.all });
      toast.success('Kích hoạt bảo hành thành công!');
    },
    onError: (error: unknown) => {
      toast.error('Kích hoạt thất bại: ' + parseApiError(error));
    },
  });
}

// ─── Customer Request Warranty ────────────────────────────────────────────────

export function useRequestWarranty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CustomerRequestWarrantyReq) => {
      const response = await warrantyApi.requestWarranty(payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WARRANTY_KEYS.all });
      toast.success('Đã gửi yêu cầu đăng ký bảo hành!');
    },
    onError: (error: unknown) => {
      toast.error('Gửi yêu cầu thất bại: ' + parseApiError(error));
    },
  });
}

// ─── Approve Warranty (Admin) ─────────────────────────────────────────────────

export function useApproveWarranty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ApproveWarrantyReq }) => {
      const response = await warrantyApi.approveWarranty(id, payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WARRANTY_KEYS.all });
      toast.success('Xác nhận yêu cầu bảo hành thành công!');
    },
    onError: (error: unknown) => {
      toast.error('Xác nhận thất bại: ' + parseApiError(error));
    },
  });
}

// ─── Reject Warranty (Admin) ──────────────────────────────────────────────────

export function useRejectWarranty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: RejectWarrantyReq }) => {
      const response = await warrantyApi.rejectWarranty(id, payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WARRANTY_KEYS.all });
      toast.success('Đã từ chối yêu cầu bảo hành!');
    },
    onError: (error: unknown) => {
      toast.error('Từ chối thất bại: ' + parseApiError(error));
    },
  });
}

// ─── Create Warranty Claim (Customer) ─────────────────────────────────────────

export function useCreateWarrantyClaim() {
  return useMutation({
    mutationFn: (payload: CreateWarrantyClaimReq) => warrantyApi.createClaim(payload),
    onSuccess: () => toast.success('Đã gửi yêu cầu bảo hành!'),
    onError: (error: unknown) => toast.error('Gửi thất bại: ' + parseApiError(error)),
  });
}
