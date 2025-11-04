import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { authApi, type AuthResponse, type UserProfile } from '../api/auth';
import { tokenStorage } from '../auth/tokenStorage';
import { authStore } from '../auth/authStore';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  accessTokenExpiresAt: string | null;
}

interface AuthContextValue extends AuthState {
  isHydrating: boolean;
  handleAuthResponse: (response: AuthResponse) => void;
  clearAuth: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  accessTokenExpiresAt: null,
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const [isHydrating, setIsHydrating] = useState(true);

  const clearAuth = useCallback(() => {
    setAuthState(initialState);
    tokenStorage.clear();
    authStore.clear();
    queryClient.removeQueries();
  }, [queryClient]);

  const handleAuthResponse = useCallback(
    (response: AuthResponse) => {
      setAuthState({
        user: response.user,
        accessToken: response.accessToken,
        accessTokenExpiresAt: response.accessTokenExpiresAt,
      });
      tokenStorage.set(response.refreshToken, response.refreshTokenExpiresAt);
      authStore.setAccessToken(response.accessToken, response.accessTokenExpiresAt);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    [queryClient],
  );

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = tokenStorage.getValidRefreshToken();
    if (!refreshToken) {
      clearAuth();
      return null;
    }

    try {
      const response = await authApi.refresh({ refreshToken });
      handleAuthResponse(response);
      return response.accessToken;
    } catch (error) {
      clearAuth();
      throw error;
    }
  }, [clearAuth, handleAuthResponse]);

  useEffect(() => {
    authStore.setRefreshHandler(refreshAccessToken);
    return () => authStore.setRefreshHandler(null);
  }, [refreshAccessToken]);

  useEffect(() => {
    const bootstrap = async () => {
      if (tokenStorage.getValidRefreshToken()) {
        try {
          await refreshAccessToken();
        } catch (error) {
          console.warn('Failed to refresh access token during bootstrap', error);
        }
      }
      setIsHydrating(false);
    };

    void bootstrap();
  }, [refreshAccessToken]);

  useEffect(() => {
    authStore.setAccessToken(authState.accessToken, authState.accessTokenExpiresAt);
  }, [authState.accessToken, authState.accessTokenExpiresAt]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...authState,
      isHydrating,
      handleAuthResponse,
      clearAuth,
      refreshAccessToken,
    }),
    [authState, isHydrating, handleAuthResponse, clearAuth, refreshAccessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
