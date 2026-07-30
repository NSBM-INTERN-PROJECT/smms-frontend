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

