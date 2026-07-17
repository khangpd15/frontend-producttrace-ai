import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../shared/hooks/useToast';
import { parseApiError } from '../../../api/axios';
import {
  warrantyClaimApi,
  CreateClaimReq,
  UpdateClaimStatusReq,
} from '../api/warrantyClaim.api';

const QUERY_KEYS = {
  allClaims: ['all-warranty-claims'],
  myClaims: ['my-warranty-claims'],
  claimDetail: (id: string) => ['warranty-claim', id],
};

export function useAllWarrantyClaims() {
  return useQuery({
    queryKey: QUERY_KEYS.allClaims,
    queryFn: async () => {
      const response = await warrantyClaimApi.getAllClaims();
      return response.data;
    },
  });
}

export function useMyWarrantyClaims() {
  return useQuery({
    queryKey: QUERY_KEYS.myClaims,
    queryFn: async () => {
      const response = await warrantyClaimApi.getMyClaims();
      return response.data;
    },
  });
}

export function useCreateWarrantyClaim() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: CreateClaimReq) => warrantyClaimApi.createClaim(data),
    onSuccess: () => {
      toast.success('Gửi yêu cầu bảo hành/sửa chữa thành công');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myClaims });
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });
}

export function useUpdateWarrantyClaimStatus() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClaimStatusReq }) =>
      warrantyClaimApi.updateClaimStatus(id, data),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái phần mềm thành công');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allClaims });
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });
}
