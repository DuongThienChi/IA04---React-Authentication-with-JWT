import { apiClient, rawClient } from './client';

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: UserProfile;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  displayName?: string;
}

export interface RefreshPayload {
  refreshToken: string;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await rawClient.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await rawClient.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  async refresh(payload: RefreshPayload): Promise<AuthResponse> {
    const { data } = await rawClient.post<AuthResponse>('/auth/refresh', payload);
    return data;
  },

  async logout(payload: RefreshPayload): Promise<void> {
    await apiClient.post('/auth/logout', payload);
  },
};
