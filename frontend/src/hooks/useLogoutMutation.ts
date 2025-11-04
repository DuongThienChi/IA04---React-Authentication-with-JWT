import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { tokenStorage } from '../auth/tokenStorage';
import { useAuth } from './useAuth';

export function useLogoutMutation() {
  const { clearAuth } = useAuth();

  return useMutation({
    mutationKey: ['logout'],
    mutationFn: async () => {
      const refreshToken = tokenStorage.getValidRefreshToken();
      if (!refreshToken) {
        return;
      }
      await authApi.logout({ refreshToken });
    },
    onSettled: () => {
      clearAuth();
    },
  });
}
