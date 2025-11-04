import { AxiosError } from 'axios';

type ErrorBody = {
  message?: string;
  error?: string;
};

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorBody | undefined;
    return data?.message ?? data?.error ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}
