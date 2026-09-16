// src/api/allocation.api.ts
import client from './client';
import type {
  AllocationResponse,
  ManualAllocationRequest,
  RandomAllocationRequest,
  RandomAllocationResult,
  PagedResponse,
  TransferRequest,
  DeactivateRequest,
  AllocationStatus,
} from '../types/allocation.types';

const BASE_PATH = '/allocations';

export const allocationApi = {
  manualAllocate: async (data: ManualAllocationRequest): Promise<AllocationResponse> => {
    const res = await client.post<AllocationResponse>(BASE_PATH, data);
    return res.data;
  },

  randomAllocate: async (data: RandomAllocationRequest = {}): Promise<RandomAllocationResult> => {
    const res = await client.post<RandomAllocationResult>(`${BASE_PATH}/random`, data);
    return res.data;
  },

  listAll: async (
    page = 0,
    size = 20,
    status?: AllocationStatus
  ): Promise<PagedResponse<AllocationResponse>> => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (status) params.append('status', status);
    const res = await client.get<PagedResponse<AllocationResponse>>(`${BASE_PATH}?${params.toString()}`);
    return res.data;
  },

  getMentorStudents: async (mentorUserId: number): Promise<AllocationResponse[]> => {
    const res = await client.get<AllocationResponse[]>(`${BASE_PATH}/mentor/${mentorUserId}`);
    return res.data;
  },

  getStudentMentor: async (studentUserId: number): Promise<AllocationResponse> => {
    const res = await client.get<AllocationResponse>(`${BASE_PATH}/student/${studentUserId}`);
    return res.data;
  },

  transferStudent: async (id: number, data: TransferRequest): Promise<AllocationResponse> => {
    const res = await client.put<AllocationResponse>(`${BASE_PATH}/${id}/transfer`, data);
    return res.data;
  },

  deactivateAllocation: async (id: number, data: DeactivateRequest = {}): Promise<AllocationResponse> => {
    const res = await client.put<AllocationResponse>(`${BASE_PATH}/${id}/deactivate`, data);
    return res.data;
  },

  getUnallocatedStudents: async (): Promise<number[]> => {
    const res = await client.get<number[]>(`${BASE_PATH}/unallocated-students`);
    return res.data;
  },
};