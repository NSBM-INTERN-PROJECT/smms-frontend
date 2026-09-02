import client from './client';
import { LoginDto, AuthResponse } from '../types/auth.types';

export const login = async (data: LoginDto): Promise<AuthResponse> => {
  const response = await client.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const getMe = async (): Promise<AuthResponse['user']> => {
  const response = await client.get<AuthResponse['user']>('/auth/me');
  return response.data;
};
