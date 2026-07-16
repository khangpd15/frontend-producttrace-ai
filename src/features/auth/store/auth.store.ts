import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, LoginRequest, UserProfile } from '../api/auth.api';
import { tokenStorage } from '../../../api/tokenStorage';

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
  /** Hydration state for Zustand persist */
  _hasHydrated: boolean;

  // ── Actions ──────────────────────────────────────────────────────────────
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  /** Called by axios interceptor after a successful silent refresh */
  setTokens: (accessToken: string, refreshToken: string) => void;
  /** Reset state (used on hard-logout / token expiry) */
  clear: () => void;
  setHasHydrated: (state: boolean) => void;
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
      _hasHydrated: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          // Clear any stale tokens from previous sessions before attempting a new login
          tokenStorage.clearTokens();
          
          const { data } = await authApi.login(credentials);
          const { access_token, refresh_token } = data.data;


          // Persist tokens in localStorage immediately
          tokenStorage.setAccessToken(access_token);
          tokenStorage.setRefreshToken(refresh_token);


          // Fetch profile using the newly set token before updating isAuthenticated state
          // to prevent React Router race conditions / premature redirects
          const profileRes = await authApi.getProfile();

          set({
            accessToken: access_token,
            refreshToken: refresh_token,
            user: profileRes.data.data,
            role: profileRes.data.data.role as UserRole,
            isAuthenticated: true,
          });
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
        set({ isLoading: true });
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
        } finally {
          set({ isLoading: false });
        }
      },

      // ── setTokens ─────────────────────────────────────────────────────────
      setTokens: (accessToken, refreshToken) => {
        tokenStorage.setAccessToken(accessToken);
        tokenStorage.setRefreshToken(refreshToken);
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      // ── clear ─────────────────────────────────────────────────────────────
      clear: () => {
        tokenStorage.clearTokens();
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
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
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
