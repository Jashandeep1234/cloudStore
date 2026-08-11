import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

// ─── Auth Service (port 8085) ──────────────────────────────────────────────
export const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_BASE_URL ?? "http://localhost:8085",
  headers: { "Content-Type": "application/json" },
});

// ─── Gateway API (port 8080) ───────────────────────────────────────────────
// NOTE: no default Content-Type here. A hard-coded "application/json" header
// makes axios send FormData uploads with the wrong content type (no multipart
// boundary), which the backend rejects with "Current request is not a
// multipart request". Axios sets the correct header automatically per request.
export const gatewayApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api",
});

// Alias for all existing services that import `apiClient`
export const apiClient = gatewayApi;

// ─── Request interceptor: attach Bearer token ──────────────────────────────
gatewayApi.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: 401 → refresh → retry → logout ─────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  failedQueue = [];
};

gatewayApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return gatewayApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, logout, setTokens } = useAuthStore.getState();

      if (!refreshToken) {
        logout();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const res = await authApi.post("/api/auth/refresh", { refreshToken });
        const { accessToken: newAccess, refreshToken: newRefresh } =
          res.data?.data ?? res.data;

        setTokens({ accessToken: newAccess, refreshToken: newRefresh });
        processQueue(null, newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return gatewayApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
