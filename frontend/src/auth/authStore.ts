type RefreshHandler = () => Promise<string | null>;

let accessToken: string | null = null;
let accessTokenExpiresAt: string | null = null;
let refreshHandler: RefreshHandler | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const authStore = {
  setAccessToken(token: string | null, expiresAt?: string | null) {
    accessToken = token;
    accessTokenExpiresAt = expiresAt ?? null;
  },

  getAccessToken(): string | null {
    return accessToken;
  },

  getAccessTokenExpiry(): string | null {
    return accessTokenExpiresAt;
  },

  setRefreshHandler(handler: RefreshHandler | null) {
    refreshHandler = handler;
  },

  async refreshAccessToken(): Promise<string | null> {
    if (!refreshHandler) {
      return null;
    }

    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const token = await refreshHandler();
          return token;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    return refreshPromise;
  },

  clear() {
    accessToken = null;
    accessTokenExpiresAt = null;
    refreshHandler = null;
    refreshPromise = null;
  },
};
