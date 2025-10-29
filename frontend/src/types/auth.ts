export interface User {
  id: number
  email: string
  display_name: string
  avatar_url?: string
  bio?: string
  is_active: boolean
  created_at: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
  error: string | null
}

// Request/Response types for API
export interface RegisterRequest {
  email: string
  password: string
  display_name: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export interface GoogleLoginResponse {
  access_token: string
  token_type: string
  is_new_user: boolean
  needs_display_name: boolean
}

export interface RegistrationResponse {
  message: string;
}

export interface EmailVerificationResponse {
  message: string;
  success: boolean;
}

// Form data types
export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  displayName: string
  agreedToTerms: boolean
}

export interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}
