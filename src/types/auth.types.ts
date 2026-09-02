export interface LoginDto {
  email: string;
  passwordHash: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}
