import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  locationApi,
  ListLocationsParams,
  CreateLocationRequest,
  UpdateLocationRequest,
} from '../api/location.api';

export const locationKeys = {
  all: ['locations'] as const,
  lists: () => [...locationKeys.all, 'list'] as const,
  list: (params?: ListLocationsParams) => [...locationKeys.lists(), params] as const,
  details: () => [...locationKeys.all, 'detail'] as const,
  detail: (id: string) => [...locationKeys.details(), id] as const,
};

export function useLocationList(params?: ListLocationsParams) {
  return useQuery({
    queryKey: locationKeys.list(params),
    queryFn: async () => {
      const { data } = await locationApi.list(params);
      return data.data;
    },
  });
}

export function useLocationDetail(id: string) {
  return useQuery({
    queryKey: locationKeys.detail(id),
    queryFn: async () => {
      const { data } = await locationApi.getById(id);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLocationRequest) => locationApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLocationRequest }) =>
      locationApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => locationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
    },
  });
}
