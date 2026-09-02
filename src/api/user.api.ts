import client from './client';
import { User, CreateUserDto, UpdateUserDto } from '../types/user.types';

export const getUsers = async (role?: string): Promise<User[]> => {
  const response = await client.get<User[]>('/users', { params: { role } });
  return response.data;
};

export const getUser = async (id: string): Promise<User> => {
  const response = await client.get<User>(`/users/${id}`);
  return response.data;
};

export const createUser = async (data: CreateUserDto): Promise<User> => {
  const response = await client.post<User>('/users', data);
  return response.data;
};

export const updateUser = async (id: string, data: UpdateUserDto): Promise<User> => {
  const response = await client.patch<User>(`/users/${id}`, data);
  return response.data;
};
