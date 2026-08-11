// Auth types — matches backend response envelope and user model

export interface User {
  id: number;
  email: string;
  name: string;
  picture?: string;
  roles?: string[];
}

/** Backend wraps auth responses in this envelope */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}
