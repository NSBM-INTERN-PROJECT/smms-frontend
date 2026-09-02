export interface Meeting {
  id: string;
  allocationId: string;
  title: string;
  date: string;
  durationMinutes: number;
  status: string; // 'scheduled', 'completed', 'cancelled'
  meetingLink?: string;
}

export interface CreateMeetingDto {
  allocationId: string;
  title: string;
  date: string;
  durationMinutes: number;
  meetingLink?: string;
}
