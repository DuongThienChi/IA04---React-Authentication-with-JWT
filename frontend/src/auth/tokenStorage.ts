const REFRESH_TOKEN_KEY = 'auth.refreshToken';
const REFRESH_TOKEN_EXP_KEY = 'auth.refreshTokenExpiresAt';

const toDate = (value: string | null): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const tokenStorage = {
  set(refreshToken: string, expiresAtIso: string) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(REFRESH_TOKEN_EXP_KEY, expiresAtIso);
  },

  get(): { token: string | null; expiresAt: string | null } {
    return {
      token: localStorage.getItem(REFRESH_TOKEN_KEY),
      expiresAt: localStorage.getItem(REFRESH_TOKEN_EXP_KEY),
    };
  },

  clear() {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_EXP_KEY);
  },

  getValidRefreshToken(): string | null {
    const { token, expiresAt } = this.get();
    const expiryDate = toDate(expiresAt);
    if (!token || !expiryDate) {
      return null;
    }

    if (expiryDate.getTime() < Date.now()) {
      this.clear();
      return null;
    }

    return token;
  },
};
