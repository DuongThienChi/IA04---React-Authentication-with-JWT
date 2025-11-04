import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, type AuthResponse, type LoginPayload } from '../api/auth';
import { useAuth } from './useAuth';

export function useLoginMutation() {
  const { handleAuthResponse } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, LoginPayload>({
    mutationKey: ['login'],
    mutationFn: (payload) => authApi.login(payload),
    onSuccess: (data) => {
      handleAuthResponse(data);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}
