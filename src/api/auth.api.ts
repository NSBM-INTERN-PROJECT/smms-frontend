import client from './client';
import type { LoginDto, AuthResponse, OtpVerifyDto, OtpSentResponse, ChangePasswordDto } from '../types/auth.types';

export const login = async (data: LoginDto): Promise<OtpSentResponse> => {
  const response = await client.post<OtpSentResponse>('/auth/login', data);
  return response.data;
};

export const verifyOtp = async (data: OtpVerifyDto): Promise<AuthResponse> => {
  const response = await client.post<AuthResponse>('/auth/verify-otp', data);
  return response.data;
};

export const resendOtp = async (email: string): Promise<OtpSentResponse> => {
  const response = await client.post<OtpSentResponse>('/auth/resend-otp', { email });
  return response.data;
};

export const changePassword = async (data: ChangePasswordDto): Promise<void> => {
  await client.post('/auth/change-password', {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
    confirmPassword: data.confirmPassword,
  });
};

export const getMe = async (): Promise<AuthResponse['user']> => {
  const response = await client.get<AuthResponse['user']>('/auth/me');
  return response.data;
};
