import { apiClient } from './client';
import type { UserProfile } from './auth';

export const userApi = {
  async me(): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>('/users/me');
    return data;
  },
};
