export interface Allocation {
  id: string;
  mentorId: string;
  menteeId: string;
  sessionId: string;
  status: string; // 'pending', 'active', 'completed', 'cancelled'
  createdAt: string;
}

export interface CreateAllocationDto {
  mentorId: string;
  menteeId: string;
  sessionId: string;
}
