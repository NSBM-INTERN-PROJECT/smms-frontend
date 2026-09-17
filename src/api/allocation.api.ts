import client from './client';
import type { Allocation, CreateAllocationDto } from '../types/allocation.types';

export const getAllocations = async (params?: { mentorUserId?: string; studentUserId?: string }): Promise<Allocation[]> => {
  const response = await client.get('/allocations', { params });
  const data = response.data.content || response.data; // Handle both paginated and direct array
  return data.map((a: any) => ({
    id: a.id.toString(),
    mentorId: a.mentorUserId?.toString() || 'Unknown',
    menteeId: a.studentUserId?.toString() || 'Unknown',
    sessionId: '',
    status: a.status,
    createdAt: a.allocatedAt
  }));
};

export const createAllocation = async (data: CreateAllocationDto): Promise<Allocation> => {
  const response = await client.post('/allocations', {
    mentorUserId: data.mentorId,
    studentUserId: data.menteeId,
    notes: 'Manual allocation from admin panel'
  });
  const a = response.data;
  return {
    id: a.id.toString(),
    mentorId: a.mentorUserId?.toString() || 'Unknown',
    menteeId: a.studentUserId?.toString() || 'Unknown',
    sessionId: '',
    status: a.status,
    createdAt: a.allocatedAt
  };
};
