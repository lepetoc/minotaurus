export interface AuthBody {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface AuthErrorResponse {
  error: string;
}
