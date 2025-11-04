import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, type AuthResponse, type RegisterPayload } from '../api/auth';
import { useAuth } from './useAuth';

export function useRegisterMutation() {
  const { handleAuthResponse } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, RegisterPayload>({
    mutationKey: ['register'],
    mutationFn: (payload) => authApi.register(payload),
    onSuccess: (data) => {
      handleAuthResponse(data);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}
