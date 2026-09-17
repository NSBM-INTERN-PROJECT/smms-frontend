export interface Meeting {
  id: string;
  allocationId: string;
  mentorUserId?: string;
  studentUserId?: string;
  title: string;
  scheduledDate?: string;   // "yyyy-MM-dd"
  scheduledTime?: string;   // "HH:mm"
  date?: string;            // legacy
  durationMinutes: number;
  status: string;
  meetingLink?: string;
  location?: string;
  mode?: string;
}

export interface CreateMeetingDto {
  allocationId: string;
  studentUserId: string;
  title: string;
  scheduledDate: string;   // "yyyy-MM-dd"
  scheduledTime: string;   // "HH:mm"
  durationMinutes: number;
  meetingLink?: string;
  location?: string;
  mode?: string;
}
