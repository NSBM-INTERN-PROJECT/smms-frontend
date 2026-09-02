import client from './client';
import { Allocation, CreateAllocationDto } from '../types/allocation.types';

export const getAllocations = async (params?: { mentorId?: string; menteeId?: string; sessionId?: string }): Promise<Allocation[]> => {
  const response = await client.get<Allocation[]>('/allocations', { params });
  return response.data;
};

export const createAllocation = async (data: CreateAllocationDto): Promise<Allocation> => {
  const response = await client.post<Allocation>('/allocations', data);
  return response.data;
};
