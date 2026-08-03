import { apiClient, downloadFile } from './apiClient';
import {
  UserResponse,
  AuthResponse,
  StudentProfileResponse,
  MentorProfileResponse,
  AllocationResponse,
  SlotResponse,
  MeetingResponse,
  MeetingRequestResponse,
  SessionNoteResponse,
  EscalationResponse,
  ProfileChangeRequestResponse,
  DataCollectionTaskResponse,
  NotificationResponse,
  PagedResponse,
  AttendanceStatus,
  EscalationStatus,
  EscalationCategory,
  EscalationRole,
  ProgressStatus,
  Role,
  UserStatus,
} from '@/types';

// ==========================================
// 1. Auth & Account Management
// ==========================================
export const authApi = {
  login: async (email: string, password: string = 'Password@123') => {
    const res = await apiClient.post<{ message: string; otpExpiresInSeconds: number; tempToken?: string }>(
      '/api/v1/auth/login',
      { email, password }
    );
    return res.data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const res = await apiClient.post<AuthResponse>('/api/v1/auth/verify-otp', { email, otp });
    return res.data;
  },

  resendOtp: async (email: string) => {
    const res = await apiClient.post<{ message: string; otpExpiresInSeconds: number }>(
      '/api/v1/auth/resend-otp',
      { email }
    );
    return res.data;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const res = await apiClient.post('/api/v1/auth/change-password', { oldPassword, newPassword });
    return res.data;
  },

  refresh: async (refreshToken: string) => {
    const res = await apiClient.post<AuthResponse>('/api/v1/auth/refresh', { refreshToken });
    return res.data;
  },

  logout: async (refreshToken?: string) => {
    if (refreshToken) {
      try {
        await apiClient.post('/api/v1/auth/logout', { refreshToken });
      } catch (err) {
        console.warn('Logout API error:', err);
      }
    }
  },

  // Admin Account CRUD
  getAccounts: async (page = 0, size = 100) => {
    const res = await apiClient.get<PagedResponse<UserResponse>>('/api/v1/auth/admin/accounts', {
      params: { page, size },
    });
    return res.data.content || [];
  },

  getAccountById: async (id: number) => {
    const res = await apiClient.get<UserResponse>(`/api/v1/auth/admin/accounts/${id}`);
    return res.data;
  },

  createAccount: async (data: {
    email: string;
    fullName: string;
    role: Role;
    department?: string;
    password?: string;
    username?: string;
  }) => {
    const res = await apiClient.post<UserResponse>('/api/v1/auth/admin/accounts', {
      ...data,
      username: data.username || data.email.split('@')[0],
      password: data.password || 'Password@123',
    });
    return res.data;
  },

  updateAccount: async (
    id: number,
    data: { role?: Role; status?: UserStatus; fullName?: string }
  ) => {
    const res = await apiClient.put<UserResponse>(`/api/v1/auth/admin/accounts/${id}`, data);
    return res.data;
  },

  resetPassword: async (id: number, temporaryPassword = 'Password@123') => {
    const res = await apiClient.post(`/api/v1/auth/admin/accounts/${id}/reset-password`, {
      temporaryPassword,
    });
    return res.data;
  },
};

// ==========================================
// 2. Users & Profiles
// ==========================================
export const userApi = {
  getMyProfile: async () => {
    const res = await apiClient.get<UserResponse | StudentProfileResponse | MentorProfileResponse>(
      '/api/v1/users/profile/me'
    );
    return res.data;
  },

  // Student Profiles
  getStudents: async (params?: { batch?: string; department?: string; riskStatus?: string; page?: number; size?: number }) => {
    const res = await apiClient.get<PagedResponse<StudentProfileResponse>>('/api/v1/users/admin/profiles/student', {
      params: { page: 0, size: 500, ...params },
    });
    return res.data.content || [];
  },

  createStudent: async (data: Partial<StudentProfileResponse>) => {
    const res = await apiClient.post<StudentProfileResponse>('/api/v1/users/admin/profiles/student', data);
    return res.data;
  },

  updateStudent: async (userId: number, data: Partial<StudentProfileResponse>) => {
    const res = await apiClient.put<StudentProfileResponse>(`/api/v1/users/admin/profiles/student/${userId}`, data);
    return res.data;
  },

  // Mentor Profiles
  getMentors: async (params?: { department?: string; page?: number; size?: number }) => {
    const res = await apiClient.get<PagedResponse<MentorProfileResponse>>('/api/v1/users/admin/profiles/mentor', {
      params: { page: 0, size: 500, ...params },
    });
    return res.data.content || [];
  },

  createMentor: async (data: Partial<MentorProfileResponse>) => {
    const res = await apiClient.post<MentorProfileResponse>('/api/v1/users/admin/profiles/mentor', data);
    return res.data;
  },

  updateMentor: async (userId: number, data: Partial<MentorProfileResponse>) => {
    const res = await apiClient.put<MentorProfileResponse>(`/api/v1/users/admin/profiles/mentor/${userId}`, data);
    return res.data;
  },

  updateMyMentorProfile: async (data: Partial<MentorProfileResponse>) => {
    const res = await apiClient.put<MentorProfileResponse>('/api/v1/users/profiles/mentor/me', data);
    return res.data;
  },

  // Student Extended Profile
  getExtendedProfile: async () => {
    const res = await apiClient.get<Record<string, unknown>>('/api/v1/users/students/me/extended-profile');
    return res.data;
  },

  submitExtendedProfile: async (data: Record<string, unknown>) => {
    const res = await apiClient.post<Record<string, unknown>>('/api/v1/users/students/me/extended-profile', data);
    return res.data;
  },

  // Profile Update Requests
  requestFieldUpdate: async (
    data: { fieldName: string; newValue: string; reason?: string },
    mentorId: number = 18
  ) => {
    const res = await apiClient.post<ProfileChangeRequestResponse>(
      '/api/v1/users/profile-update-requests',
      data,
      { headers: { 'X-Mentor-Id': mentorId.toString() } }
    );
    return res.data;
  },

  getPendingProfileRequests: async (page = 0, size = 50) => {
    const res = await apiClient.get<PagedResponse<ProfileChangeRequestResponse>>(
      '/api/v1/users/profile-update-requests/pending',
      { params: { page, size } }
    );
    return res.data.content || [];
  },

  getMyProfileRequests: async (page = 0, size = 50) => {
    const res = await apiClient.get<PagedResponse<ProfileChangeRequestResponse>>(
      '/api/v1/users/profile-update-requests/my',
      { params: { page, size } }
    );
    return res.data.content || [];
  },

  approveProfileRequest: async (id: number, reviewerNotes?: string) => {
    const res = await apiClient.put<ProfileChangeRequestResponse>(
      `/api/v1/users/profile-update-requests/${id}/approve`,
      { reviewerNotes: reviewerNotes || 'Approved.' }
    );
    return res.data;
  },

  rejectProfileRequest: async (id: number, reviewerNotes?: string) => {
    const res = await apiClient.put<ProfileChangeRequestResponse>(
      `/api/v1/users/profile-update-requests/${id}/reject`,
      { reviewerNotes: reviewerNotes || 'Rejected.' }
    );
    return res.data;
  },

  // Data Collection Campaigns
  createDataCollectionRequest: async (data: {
    title: string;
    description: string;
    batch?: string;
    department?: string;
    dueDate: string;
  }) => {
    const res = await apiClient.post<DataCollectionTaskResponse>(
      '/api/v1/users/data-collection-requests',
      data
    );
    return res.data;
  },

  getDataCollectionRequest: async (id: number) => {
    const res = await apiClient.get<DataCollectionTaskResponse>(`/api/v1/users/data-collection-requests/${id}`);
    return res.data;
  },

  submitDataCollection: async (id: number) => {
    await apiClient.post(`/api/v1/users/data-collection-requests/${id}/submit`);
  },

  getMyTasks: async () => {
    const res = await apiClient.get<DataCollectionTaskResponse[]>('/api/v1/users/data-collection-requests/my');
    return res.data || [];
  },
};

// ==========================================
// 3. Allocations
// ==========================================
export const allocationApi = {
  listAll: async (status?: string, page = 0, size = 500) => {
    const res = await apiClient.get<PagedResponse<AllocationResponse>>('/api/v1/allocations', {
      params: { page, size, ...(status && status !== 'ALL' ? { status } : {}) },
    });
    return res.data.content || [];
  },

  manualAllocate: async (studentUserId: number, mentorUserId: number) => {
    const res = await apiClient.post<AllocationResponse>('/api/v1/allocations', {
      studentUserId,
      mentorUserId,
    });
    return res.data;
  },

  randomAllocate: async (params?: {
    batch?: string;
    department?: string;
    studentIds?: number[];
    skipFullMentors?: boolean;
  }) => {
    const res = await apiClient.post<{
      totalEligibleStudents: number;
      allocatedCount: number;
      skippedCount: number;
      allocations: AllocationResponse[];
    }>('/api/v1/allocations/random', params || {});
    return res.data;
  },

  getMentorStudents: async (mentorUserId: number) => {
    const res = await apiClient.get<AllocationResponse[]>(`/api/v1/allocations/mentor/${mentorUserId}`);
    return res.data || [];
  },

  getStudentMentor: async (studentUserId: number) => {
    const res = await apiClient.get<AllocationResponse>(`/api/v1/allocations/student/${studentUserId}`);
    return res.data;
  },

  transfer: async (allocationId: number, newMentorUserId: number, reason?: string) => {
    const res = await apiClient.put<AllocationResponse>(`/api/v1/allocations/${allocationId}/transfer`, {
      newMentorUserId,
      reason: reason || 'Mentor reallocation',
    });
    return res.data;
  },

  deactivate: async (allocationId: number, reason?: string) => {
    const res = await apiClient.put<AllocationResponse>(`/api/v1/allocations/${allocationId}/deactivate`, {
      reason: reason || 'Deactivated',
    });
    return res.data;
  },

  getUnallocatedStudents: async () => {
    const res = await apiClient.get<number[]>('/api/v1/allocations/unallocated-students');
    return res.data || [];
  },
};

// ==========================================
// 4. Meetings & Slots
// ==========================================
export const meetingApi = {
  // Slots
  bulkCreateSlots: async (slots: Partial<SlotResponse>[], studentUserIds?: number[]) => {
    const res = await apiClient.post<{
      totalRequested: number;
      createdCount: number;
      assignedCount: number;
      slots: SlotResponse[];
    }>('/api/v1/meetings/slots', { slots, studentUserIds });
    return res.data;
  },

  getMySlots: async (page = 0, size = 100) => {
    const res = await apiClient.get<PagedResponse<SlotResponse>>('/api/v1/meetings/slots/mentor/me', {
      params: { page, size },
    });
    return res.data.content || [];
  },

  cancelSlot: async (slotId: number) => {
    const res = await apiClient.put<SlotResponse>(`/api/v1/meetings/slots/${slotId}/cancel`);
    return res.data;
  },

  getStudentSlotInvitations: async () => {
    const res = await apiClient.get<SlotResponse[]>('/api/v1/meetings/slots/student/me/invitations');
    return res.data || [];
  },

  respondToSlot: async (slotId: number, accepted: boolean, rescheduleReason?: string) => {
    const res = await apiClient.put(`/api/v1/meetings/slots/${slotId}/respond`, {
      response: accepted ? 'ACCEPTED' : 'RESCHEDULE_REQUESTED',
      rescheduleReason,
    });
    return res.data;
  },

  // Meetings
  getTodaysMeetings: async () => {
    const res = await apiClient.get<MeetingResponse[]>('/api/v1/meetings/mentor/me/today');
    return res.data || [];
  },

  getUpcomingMeetingsMentor: async () => {
    const res = await apiClient.get<MeetingResponse[]>('/api/v1/meetings/mentor/me/upcoming');
    return res.data || [];
  },

  getMentorMeetingHistory: async (page = 0, size = 100) => {
    const res = await apiClient.get<PagedResponse<MeetingResponse>>('/api/v1/meetings/mentor/me/history', {
      params: { page, size },
    });
    return res.data.content || [];
  },

  getStudentUpcoming: async () => {
    const res = await apiClient.get<MeetingResponse[]>('/api/v1/meetings/student/me/upcoming');
    return res.data || [];
  },

  getStudentMeetingHistory: async (page = 0, size = 100) => {
    const res = await apiClient.get<PagedResponse<MeetingResponse>>('/api/v1/meetings/student/me/history', {
      params: { page, size },
    });
    return res.data.content || [];
  },

  getAllMeetingsForUser: async (role: Role) => {
    if (role === Role.STUDENT) {
      const [upcoming, history] = await Promise.all([
        meetingApi.getStudentUpcoming(),
        meetingApi.getStudentMeetingHistory(),
      ]);
      const combined = [...upcoming, ...history];
      return Array.from(new Map(combined.map((m) => [m.id, m])).values());
    } else {
      const [today, upcoming, history] = await Promise.all([
        meetingApi.getTodaysMeetings(),
        meetingApi.getUpcomingMeetingsMentor(),
        meetingApi.getMentorMeetingHistory(),
      ]);
      const combined = [...today, ...upcoming, ...history];
      return Array.from(new Map(combined.map((m) => [m.id, m])).values());
    }
  },

  markAttendance: async (meetingId: number, status: AttendanceStatus, notes?: string) => {
    const res = await apiClient.put<MeetingResponse>(`/api/v1/meetings/${meetingId}/attendance`, {
      status,
      notes,
    });
    return res.data;
  },

  reschedule: async (meetingId: number, newDate: string, newTime: string, reason?: string) => {
    const res = await apiClient.put<MeetingResponse>(`/api/v1/meetings/${meetingId}/reschedule`, {
      newDate,
      newTime,
      reason,
    });
    return res.data;
  },

  cancel: async (meetingId: number, reason?: string) => {
    const res = await apiClient.put<MeetingResponse>(`/api/v1/meetings/${meetingId}/cancel`, {
      reason,
    });
    return res.data;
  },

  complete: async (meetingId: number) => {
    const res = await apiClient.put<MeetingResponse>(`/api/v1/meetings/${meetingId}/complete`);
    return res.data;
  },

  // Meeting Requests
  submitRequest: async (data: {
    mentorUserId: number;
    preferredDate: string;
    preferredTime: string;
    reason: string;
  }) => {
    const res = await apiClient.post<MeetingRequestResponse>('/api/v1/meetings/requests', data);
    return res.data;
  },

  getPendingRequestsMentor: async (page = 0, size = 50) => {
    const res = await apiClient.get<PagedResponse<MeetingRequestResponse>>(
      '/api/v1/meetings/requests/mentor/me/pending',
      { params: { page, size } }
    );
    return res.data.content || [];
  },

  getMyRequestsStudent: async (page = 0, size = 50) => {
    const res = await apiClient.get<PagedResponse<MeetingRequestResponse>>(
      '/api/v1/meetings/requests/student/me',
      { params: { page, size } }
    );
    return res.data.content || [];
  },

  approveRequest: async (
    id: number,
    data: {
      reviewNotes?: string;
      scheduledDate?: string;
      scheduledTime?: string;
      mode?: string;
      location?: string;
      meetingLink?: string;
    }
  ) => {
    const res = await apiClient.put<MeetingResponse>(`/api/v1/meetings/requests/${id}/approve`, data);
    return res.data;
  },

  rejectRequest: async (id: number, reviewNotes?: string) => {
    const res = await apiClient.put<MeetingRequestResponse>(`/api/v1/meetings/requests/${id}/reject`, {
      reviewNotes: reviewNotes || 'Declined.',
    });
    return res.data;
  },

  // Notifications
  getNotifications: async (page = 0, size = 50) => {
    const res = await apiClient.get<PagedResponse<NotificationResponse>>('/api/v1/meetings/notifications', {
      params: { page, size },
    });
    return res.data.content || [];
  },

  getUnreadNotificationCount: async () => {
    const res = await apiClient.get<number>('/api/v1/meetings/notifications/unread-count');
    return res.data ?? 0;
  },

  markAllNotificationsRead: async () => {
    await apiClient.put('/api/v1/meetings/notifications/mark-all-read');
  },
};

// ==========================================
// 5. Sessions & Escalations
// ==========================================
export const sessionApi = {
  createNote: async (data: {
    meetingId: number;
    studentUserId: number;
    discussionNotes: string;
    actionItems?: string;
    progressStatus?: ProgressStatus;
    followUpDate?: string;
    isPrivate?: boolean;
  }) => {
    const res = await apiClient.post<SessionNoteResponse>('/api/v1/sessions/notes', data);
    return res.data;
  },

  getNoteByMeeting: async (meetingId: number) => {
    const res = await apiClient.get<SessionNoteResponse>(`/api/v1/sessions/notes/meeting/${meetingId}`);
    return res.data;
  },

  getStudentNotes: async (studentUserId: number, page = 0, size = 100) => {
    const res = await apiClient.get<PagedResponse<SessionNoteResponse>>(
      `/api/v1/sessions/notes/student/${studentUserId}`,
      { params: { page, size } }
    );
    return res.data.content || [];
  },

  getMyStudentNotes: async (page = 0, size = 100) => {
    const res = await apiClient.get<PagedResponse<SessionNoteResponse>>('/api/v1/sessions/notes/student/me', {
      params: { page, size },
    });
    return res.data.content || [];
  },

  getMentorNotes: async (page = 0, size = 100) => {
    const res = await apiClient.get<PagedResponse<SessionNoteResponse>>('/api/v1/sessions/notes/mentor/me', {
      params: { page, size },
    });
    return res.data.content || [];
  },

  updateNote: async (id: number, data: Partial<SessionNoteResponse>) => {
    const res = await apiClient.put<SessionNoteResponse>(`/api/v1/sessions/notes/${id}`, data);
    return res.data;
  },

  getProgressSummary: async () => {
    const res = await apiClient.get<Array<{
      studentUserId: number;
      latestProgressStatus: ProgressStatus;
      openEscalations: number;
      lastSessionDate: string;
    }>>('/api/v1/sessions/notes/my-students/summary');
    return res.data || [];
  },

  // Escalations
  createEscalation: async (data: {
    studentUserId: number;
    category: EscalationCategory;
    description: string;
    escalatedToRole: EscalationRole;
    sessionNoteId?: number;
    escalatedToUserId?: number;
  }) => {
    const res = await apiClient.post<EscalationResponse>('/api/v1/sessions/escalations', data);
    return res.data;
  },

  listEscalations: async (params?: {
    page?: number;
    size?: number;
    status?: EscalationStatus;
    category?: EscalationCategory;
  }) => {
    const res = await apiClient.get<PagedResponse<EscalationResponse>>('/api/v1/sessions/escalations', {
      params: { page: 0, size: 500, ...params },
    });
    return res.data.content || [];
  },

  getStudentEscalations: async (studentUserId: number, page = 0, size = 50) => {
    const res = await apiClient.get<PagedResponse<EscalationResponse>>(
      `/api/v1/sessions/escalations/student/${studentUserId}`,
      { params: { page, size } }
    );
    return res.data.content || [];
  },

  getMyEscalations: async (page = 0, size = 50) => {
    const res = await apiClient.get<PagedResponse<EscalationResponse>>('/api/v1/sessions/escalations/my', {
      params: { page, size },
    });
    return res.data.content || [];
  },

  updateEscalationStatus: async (
    id: number,
    data: { status: EscalationStatus; resolutionNotes?: string }
  ) => {
    const res = await apiClient.put<EscalationResponse>(`/api/v1/sessions/escalations/${id}/status`, data);
    return res.data;
  },
};

// ==========================================
// 6. Reports & Dashboards
// ==========================================
export const reportApi = {
  getAdminDashboard: async () => {
    const res = await apiClient.get<{
      totalStudents: number;
      allocatedStudents: number;
      unallocatedStudents: number;
      totalMentors: number;
      totalAllocations: number;
      totalMeetings: number;
      completedMeetings: number;
      scheduledMeetings: number;
      cancelledMeetings: number;
      presentCount: number;
      absentCount: number;
      lateCount: number;
      studentsOnTrack: number;
      studentsNeedsAttention: number;
      studentsAtRisk: number;
      studentsCritical: number;
      openEscalations: number;
      resolvedEscalations: number;
      totalEscalations: number;
    }>('/api/v1/dashboard');
    const d = res.data;
    const totalStudents = d.totalStudents || 0;
    const activeAllocations = d.allocatedStudents || 0;
    const allocationPercentage =
      totalStudents > 0 ? Math.round((activeAllocations / totalStudents) * 100) : 0;

    return {
      totalStudents,
      activeAllocations,
      unallocatedStudents: d.unallocatedStudents || 0,
      allocationPercentage,
      totalMentors: d.totalMentors || 0,
      totalMeetings: d.totalMeetings || 0,
      completedMeetings: d.completedMeetings || 0,
      totalMeetingsCompleted: d.completedMeetings || 0,
      attendanceRate:
        d.presentCount && (d.presentCount + d.absentCount > 0)
          ? Math.round((d.presentCount / (d.presentCount + d.absentCount)) * 100)
          : 92,
      studentsOnTrack: d.studentsOnTrack || 0,
      studentsNeedsAttention: d.studentsNeedsAttention || 0,
      studentsAtRisk: d.studentsAtRisk || 0,
      studentsCritical: d.studentsCritical || 0,
      openEscalations: d.openEscalations || 0,
      resolvedEscalations: d.resolvedEscalations || 0,
      totalEscalations: d.totalEscalations || 0,
    };
  },

  getMentorDashboard: async (_mentorUserId?: number) => {
    const res = await apiClient.get<{
      mentorUserId: number;
      totalStudents: number;
      capacity: number;
      studentsOnTrack: number;
      studentsNeedsAttention: number;
      studentsAtRisk: number;
      studentsCritical: number;
      totalMeetings: number;
      completedMeetings: number;
      openEscalations: number;
      pendingMeetingRequestsCount: number;
      studentSummaries: Array<{
        studentUserId: number;
        latestProgressStatus: ProgressStatus;
        openEscalations: number;
        lastSessionDate: string;
      }>;
    }>('/api/v1/dashboard/mentor');
    return res.data;
  },

  getStudentDashboard: async (_studentUserId?: number) => {
    const res = await apiClient.get<{
      studentUserId: number;
      mentorUserId: number;
      mentorName: string;
      latestProgressStatus: ProgressStatus;
      totalMeetings: number;
      completedMeetings: number;
      upcomingMeetings: number;
      attendancePresent: number;
      attendanceAbsent: number;
      openEscalations: number;
      totalSessionNotes: number;
      nextMeeting?: MeetingResponse;
    }>('/api/v1/dashboard/student');
    return res.data;
  },

  getMentorStudentView: async (filter?: Record<string, unknown>) => {
    const res = await apiClient.post<Array<{
      mentorUserId: number;
      mentorName: string;
      department: string;
      capacity: number;
      allocatedStudentsCount: number;
      students: StudentProfileResponse[];
    }>>('/api/v1/dashboard/mentor/students', filter || {});
    return res.data || [];
  },

  exportStudentsCsv: (batch?: string, department?: string) => {
    const query = new URLSearchParams();
    if (batch) query.append('batch', batch);
    if (department) query.append('department', department);
    return downloadFile(`/api/v1/reports/students/export/csv?${query.toString()}`, 'student-progress.csv');
  },

  exportAllocationsCsv: (status?: string) => {
    const query = new URLSearchParams();
    if (status && status !== 'ALL') query.append('status', status);
    return downloadFile(`/api/v1/reports/allocations/export/csv?${query.toString()}`, 'allocations.csv');
  },

  exportEscalationsCsv: (status?: string, category?: string) => {
    const query = new URLSearchParams();
    if (status && status !== 'ALL') query.append('status', status);
    if (category && category !== 'ALL') query.append('category', category);
    return downloadFile(`/api/v1/reports/escalations/export/csv?${query.toString()}`, 'escalations.csv');
  },

  exportStudentsExcel: (batch?: string, department?: string) => {
    const query = new URLSearchParams();
    if (batch) query.append('batch', batch);
    if (department) query.append('department', department);
    return downloadFile(`/api/v1/reports/students/export/excel?${query.toString()}`, 'student-progress.xlsx');
  },
};
