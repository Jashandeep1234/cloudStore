import { authApi } from "@/api/axios";
import type {
  ApiEnvelope,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/auth";

const AUTH_PREFIX = "/api/auth";

// ─── JWT Auth ──────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Login with email and password.
   * Returns envelope: { success, message, data: AuthTokens }
   */
  login: async (body: LoginRequest): Promise<AuthTokens> => {
    const res = await authApi.post<ApiEnvelope<AuthTokens>>(
      `${AUTH_PREFIX}/login`,
      body
    );
    return res.data.data;
  },

  /**
   * Register a new account.
   * Returns envelope: { success, message, data: AuthTokens }
   */
  register: async (body: RegisterRequest): Promise<AuthTokens> => {
    const res = await authApi.post<ApiEnvelope<AuthTokens>>(
      `${AUTH_PREFIX}/register`,
      body
    );
    return res.data.data;
  },

  /**
   * Refresh access token using the stored refresh token.
   */
  refreshTokens: async (
    refreshToken: string
  ): Promise<Pick<AuthTokens, "accessToken" | "refreshToken">> => {
    const res = await authApi.post<
      ApiEnvelope<Pick<AuthTokens, "accessToken" | "refreshToken">>
    >(`${AUTH_PREFIX}/refresh`, { refreshToken });
    return res.data.data;
  },

  /**
   * Logout — invalidates the refresh token on the server.
   */
  logout: async (refreshToken: string): Promise<void> => {
    await authApi.post(`${AUTH_PREFIX}/logout`, { refreshToken });
  },

  /**
   * Fetch the currently authenticated user from the auth service.
   * Pass the access token explicitly — authApi has no auto-attach interceptor.
   */
  getCurrentUser: async (accessToken?: string): Promise<User> => {
    const res = await authApi.get<ApiEnvelope<User>>(`${AUTH_PREFIX}/me`, {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });
    return res.data.data;
  },

  /**
   * Initiate Google OAuth2 login.
   * Redirects the browser to the backend's Google auth endpoint.
   * The backend will redirect the browser back to /oauth2/redirect with tokens.
   */
  googleLogin: (): void => {
    const base =
      import.meta.env.VITE_AUTH_BASE_URL ?? "http://localhost:8085";
    window.location.href = `${base}/api/auth/google`;
  },
};
