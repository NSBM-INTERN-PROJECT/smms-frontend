export interface LoginDto {
  email: string;
  password: string;
}

export interface OtpSentResponse {
  message: string;
  email: string;
  expiresInSeconds: number;
  resendCooldownSeconds: number;
}

export interface User {
  id: number | string;
  email: string;
  role: string;
  name?: string;
  fullName?: string;
  mustChangePassword?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  userId?: number | string;
  email?: string;
  fullName?: string;
  role?: string;
  mustChangePassword?: boolean;
  user?: User;
}

export interface OtpVerifyDto {
  email: string;
  otpCode: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
