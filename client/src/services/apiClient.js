import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const baseConfig = {
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
};

export const publicApi = axios.create(baseConfig);
export const apiClient = axios.create(baseConfig);

let authHandlers = {
  getAccessToken: () => null,
  setAccessToken: () => {},
  refreshToken: null,
  onAuthFailed: () => {},
};

let refreshPromise = null;

export const registerAuthHandlers = (handlers) => {
  authHandlers = {
    ...authHandlers,
    ...handlers,
  };
};

apiClient.interceptors.request.use((config) => {
  const token = authHandlers.getAccessToken?.();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const responseStatus = error.response?.status;
    const originalRequest = error.config;

    if (
      responseStatus !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.skipAuthRefresh
    ) {
      return Promise.reject(error);
    }

    if (typeof authHandlers.refreshToken !== 'function') {
      authHandlers.onAuthFailed?.();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = authHandlers.refreshToken().finally(() => {
          refreshPromise = null;
        });
      }

      const nextAccessToken = await refreshPromise;

      if (!nextAccessToken) {
        throw new Error('Refresh endpoint returned no access token');
      }

      authHandlers.setAccessToken?.(nextAccessToken);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      authHandlers.onAuthFailed?.();
      return Promise.reject(refreshError);
    }
  },
);
