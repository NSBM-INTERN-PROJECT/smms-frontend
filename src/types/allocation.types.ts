// src/types/allocation.types.ts

export type AllocationStatus = 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED';
export type AllocationType = 'MANUAL' | 'RANDOM';

export interface ManualAllocationRequest {
  mentorUserId: number;
  studentUserId: number;
  notes?: string;
}

export interface RandomAllocationRequest {
  maxPerMentor?: number;
}

export interface RandomAllocationResult {
  totalAllocated: number;
  allocations: AllocationResponse[];
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface TransferRequest {
  newMentorUserId: number;
  reason: string;
}

export interface DeactivateRequest {
  reason?: string;
}

export interface AllocationResponse {
  id: number;
  mentorUserId: number;
  studentUserId: number;
  status: AllocationStatus;
  allocationType: AllocationType;
  coordinatorUserId: number;
  allocatedDate: string;
  deactivatedDate?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}