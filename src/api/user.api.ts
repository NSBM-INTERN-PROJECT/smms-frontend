import client from './client';
import type { User, CreateUserDto, UpdateUserDto } from '../types/user.types';

export const getUsers = async (role?: string): Promise<User[]> => {
  // Use auth-service to fetch all accounts
  const response = await client.get('/auth/admin/accounts', { params: { size: 100 } });
  let users = response.data.content.map((acc: any) => ({
    id: acc.id.toString(),
    email: acc.email,
    role: acc.role.toLowerCase(),
    name: acc.fullName
  }));

  if (role && role !== 'all') {
    users = users.filter((u: User) => u.role === role.toLowerCase());
  }
  
  return users;
};

export const getUser = async (id: string): Promise<User> => {
  const response = await client.get(`/auth/admin/accounts/${id}`);
  const account = response.data;
  return {
    id: account.id.toString(),
    email: account.email,
    role: account.role.toLowerCase(),
    name: account.fullName
  };
};

export const createUser = async (data: CreateUserDto): Promise<User> => {
  // 1. Create auth account in auth-service
  const accountPayload = {
    email: data.email,
    fullName: data.name || 'Unknown User',
    role: data.role.toUpperCase(),
    temporaryPassword: data.passwordHash
  };
  
  const authResponse = await client.post('/auth/admin/accounts', accountPayload);
  const account = authResponse.data;

  // 2. Create user profile in user-service
  try {
    if (data.role === 'mentor') {
      await client.post('/users/admin/profiles/mentor', {
        userId: account.id,
        fullName: account.fullName,
        employeeId: 'EMP' + Math.floor(Math.random() * 10000),
        department: 'IT'
      });
    } else if (data.role === 'student' || data.role === 'mentee') {
      await client.post('/users/admin/profiles/student', {
        userId: account.id,
        fullName: account.fullName,
        studentId: 'STU' + Math.floor(Math.random() * 10000),
        email: account.email,
        degreeProgram: 'BSc SE',
        department: 'IT',
        batch: '2024',
        intake: 'Feb',
        academicYear: 3
      });
    }
  } catch (error) {
    console.error("Profile creation failed, but account was created.", error);
  }
  
  return {
    id: account.id.toString(),
    email: account.email,
    role: account.role.toLowerCase(),
    name: account.fullName
  };
};

export const updateUser = async (id: string, data: UpdateUserDto): Promise<User> => {
  const payload = {
    fullName: data.name
  };
  const response = await client.put(`/auth/admin/accounts/${id}`, payload);
  const account = response.data;
  return {
    id: account.id.toString(),
    email: account.email,
    role: account.role.toLowerCase(),
    name: account.fullName
  };
};
