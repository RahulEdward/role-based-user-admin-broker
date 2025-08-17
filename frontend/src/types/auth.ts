export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'broker' | 'user';
  is_active: boolean;
  is_2fa_enabled: boolean;
  broker_name: string;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  broker_name: string;
  api_key: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}