import { useMutation } from '@tanstack/react-query';
import { warrantyApi, CreateWarrantyClaimReq } from '../api/warranty.api';

export function useCreateWarrantyClaim() {
  return useMutation({
    mutationFn: (payload: CreateWarrantyClaimReq) => warrantyApi.createClaim(payload),
  });
}
