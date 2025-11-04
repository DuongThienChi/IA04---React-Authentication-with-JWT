import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { authStore } from '../auth/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const rawClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = authStore.getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const { response, config } = error;
    if (!response || response.status !== 401) {
      return Promise.reject(error);
    }

    const retryConfig = config as RetryableConfig;

    if (retryConfig._retry || (retryConfig.url ?? '').includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    retryConfig._retry = true;

    try {
      const newToken = await authStore.refreshAccessToken();
      if (!newToken) {
        return Promise.reject(error);
      }

      retryConfig.headers = retryConfig.headers ?? {};
      retryConfig.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(retryConfig);
    } catch (refreshErr) {
      return Promise.reject(refreshErr);
    }
  },
);
