import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  userApi,
  CreateUserRequest,
  UpdateUserRequest,
  ListUsersParams,
  SearchUserParams,
} from '../api/user.api';
import { parseApiError } from '../../../api/axios';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: ListUsersParams) => [...userKeys.lists(), params] as const,
  searches: () => [...userKeys.all, 'search'] as const,
  search: (params: SearchUserParams) => [...userKeys.searches(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Paginated admin user list with role/status/search filters */
export function useUserList(params: ListUsersParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const { data } = await userApi.list(params);
      return data.data;
    },
  });
}

/**
 * Search users by keyword, role, status.
 * Uses GET /users/search (SearchUserRequest on backend).
 */
export function useSearchUsers(params: SearchUserParams) {
  return useQuery({
    queryKey: userKeys.search(params),
    queryFn: async () => {
      const { data } = await userApi.search(params);
      return data.data;
    },
    enabled: !!(params.keyword || params.role || params.status),
  });
}

export function useUserDetail(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const { data } = await userApi.getById(id);
      return data.data;
    },
    enabled: !!id,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserRequest) => userApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.searches() });
    },
    onError: (err) => parseApiError(err),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserRequest }) =>
      userApi.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.searches() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
    },
    onError: (err) => parseApiError(err),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.searches() });
    },
    onError: (err) => parseApiError(err),
  });
}

/** PUT /users/:id/lock — Suspend a user account */
export function useLockAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.lockAccount(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.searches() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
    onError: (err) => parseApiError(err),
  });
}

/** PUT /users/:id/unlock — Reactivate a user account */
export function useUnlockAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.unlockAccount(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.searches() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
    onError: (err) => parseApiError(err),
  });
}
