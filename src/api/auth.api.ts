import client from './client';
import type { LoginDto, AuthResponse, OtpVerifyDto } from '../types/auth.types';

export const login = async (data: LoginDto): Promise<AuthResponse> => {
  const response = await client.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const verifyOtp = async (data: OtpVerifyDto): Promise<{ success: boolean; token?: string }> => {
  const response = await client.post<{ success: boolean; token?: string }>('/auth/otp/verify', data);
  return response.data;
};

export const getMe = async (): Promise<AuthResponse['user']> => {
  const response = await client.get<AuthResponse['user']>('/auth/me');
  return response.data;
};
