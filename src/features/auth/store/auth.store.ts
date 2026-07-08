import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, LoginRequest, UserProfile } from '../api/auth.api';
import { tokenStorage } from '../../../api/axios';

// ─── Store State / Actions ────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'STAFF' | 'DEALER' | 'CUSTOMER';

interface AuthState {
  /** Raw JWT access token (in-memory) */
  accessToken: string | null;
  /** Opaque refresh token stored in localStorage */
  refreshToken: string | null;
  /** Decoded user profile fetched after login */
  user: UserProfile | null;
  /** Convenience role accessor */
  role: UserRole | null;
  /** True while a login / refresh / profile fetch is in-flight */
  isLoading: boolean;
  /** True once we have confirmed the session (token + profile) */
  isAuthenticated: boolean;

  // ── Actions ──────────────────────────────────────────────────────────────
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  /** Called by axios interceptor after a successful silent refresh */
  setTokens: (accessToken: string, refreshToken: string) => void;
  /** Reset state (used on hard-logout / token expiry) */
  clear: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      role: null,
      isLoading: false,
      isAuthenticated: false,

      // ── login ─────────────────────────────────────────────────────────────
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login(credentials);
          const { access_token, refresh_token } = data.data;

          // Persist tokens
          tokenStorage.setAccess(access_token);
          tokenStorage.setRefresh(refresh_token);

          set({
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
          });

          // Fetch profile immediately so `user` / `role` are populated
          await get().fetchProfile();
        } finally {
          set({ isLoading: false });
        }
      },

      // ── logout ────────────────────────────────────────────────────────────
      logout: async () => {
        const refreshToken = get().refreshToken;
        try {
          if (refreshToken) {
            await authApi.logout(refreshToken);
          }
        } catch {
          // Ignore server errors on logout — clear client state regardless
        } finally {
          get().clear();
        }
      },

      // ── fetchProfile ──────────────────────────────────────────────────────
      fetchProfile: async () => {
        try {
          const { data } = await authApi.getProfile();
          set({
            user: data.data,
            role: data.data.role as UserRole,
            isAuthenticated: true,
          });
        } catch {
          // Profile fetch failure means session is invalid
          get().clear();
        }
      },

      // ── setTokens ─────────────────────────────────────────────────────────
      setTokens: (accessToken, refreshToken) => {
        tokenStorage.setAccess(accessToken);
        tokenStorage.setRefresh(refreshToken);
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      // ── clear ─────────────────────────────────────────────────────────────
      clear: () => {
        tokenStorage.clear();
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'pt-auth-store',
      // Only persist the token strings; user profile is re-fetched on reload
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
