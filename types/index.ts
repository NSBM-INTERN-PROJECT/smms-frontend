// Standard Enums matching SMMS Backend Specification (REPORT.md)

export enum Role {
  ADMIN = 'ADMIN',
  COORDINATOR = 'COORDINATOR',
  MENTOR = 'MENTOR',
  STUDENT = 'STUDENT',
  MANAGEMENT = 'MANAGEMENT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
}

export enum RiskStatus {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum AllocationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TRANSFERRED = 'TRANSFERRED',
}

export enum AllocationType {
  MANUAL = 'MANUAL',
  RANDOM = 'RANDOM',
}

export enum SlotStatus {
  OPEN = 'OPEN',
  ALLOCATED = 'ALLOCATED',
  CANCELLED = 'CANCELLED',
}

export enum SlotAllocationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  RESCHEDULE_REQUESTED = 'RESCHEDULE_REQUESTED',
}

export enum StudentResponse {
  ACCEPTED = 'ACCEPTED',
  RESCHEDULE_REQUESTED = 'RESCHEDULE_REQUESTED',
}

export enum MeetingMode {
  IN_PERSON = 'IN_PERSON',
  ONLINE = 'ONLINE',
  HYBRID = 'HYBRID',
}

export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

export enum AttendanceStatus {
  PENDING = 'PENDING',
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

export enum ProgressStatus {
  ON_TRACK = 'ON_TRACK',
  NEEDS_ATTENTION = 'NEEDS_ATTENTION',
  AT_RISK = 'AT_RISK',
  CRITICAL = 'CRITICAL',
}

export enum EscalationCategory {
  ACADEMIC = 'ACADEMIC',
  ATTENDANCE = 'ATTENDANCE',
  DISCIPLINARY = 'DISCIPLINARY',
  WELLBEING = 'WELLBEING',
  FINANCIAL = 'FINANCIAL',
  OTHER = 'OTHER',
}

export enum EscalationRole {
  COORDINATOR = 'COORDINATOR',
  HEAD_OF_DEPARTMENT = 'HEAD_OF_DEPARTMENT',
  DEAN = 'DEAN',
  COUNSELOR = 'COUNSELOR',
  ADMIN = 'ADMIN',
}

export enum EscalationStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum NotificationType {
  SLOT_ASSIGNED = 'SLOT_ASSIGNED',
  SLOT_RESPONSE = 'SLOT_RESPONSE',
  MEETING_SCHEDULED = 'MEETING_SCHEDULED',
  MEETING_RESCHEDULED = 'MEETING_RESCHEDULED',
  MEETING_CANCELLED = 'MEETING_CANCELLED',
  MEETING_REMINDER = 'MEETING_REMINDER',
  GENERAL = 'GENERAL',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum RecipientStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
}

// Data Interfaces & DTOs
export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  timestamp: string;
  path?: string;
  code?: string;
}

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  status: UserStatus;
  mustChangePassword?: boolean;
  department?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId?: number;
  email?: string;
  fullName?: string;
  role?: Role;
  user?: UserResponse;
  mustChangePassword?: boolean;
}

export interface StudentProfileResponse {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  studentId: string;
  department: string;
  degree: string;
  batch: string;
  intake: string;
  currentGpa: number;
  riskStatus: RiskStatus;
  latestProgressStatus?: ProgressStatus;
  // Extended Details
  parentName?: string;
  parentPhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  permanentAddress?: string;
  allocatedMentorId?: number;
  allocatedMentorName?: string;
  // Attendance & Engagement Metrics
  attendanceRate?: number;
  labAttendanceRate?: number;
  consecutiveAbsences?: number;
}

export interface MentorProfileResponse {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  department: string;
  specialization: string;
  designation: string;
  officeLocation: string;
  contactPhone: string;
  capacity: number;
  currentStudentCount: number;
}

export interface AllocationResponse {
  id: number;
  studentUserId: number;
  studentName: string;
  studentIdNumber: string;
  mentorUserId: number;
  mentorName: string;
  batch: string;
  department: string;
  allocationType: AllocationType;
  status: AllocationStatus;
  allocatedAt: string;
  deactivatedAt?: string | null;
}

export interface SlotResponse {
  id: number;
  mentorUserId: number;
  mentorName?: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  mode: MeetingMode;
  location?: string | null;
  meetingLink?: string | null;
  status: SlotStatus;
  assignedStudentUserId?: number | null;
  assignedStudentName?: string | null;
  allocationStatus?: SlotAllocationStatus | null;
  allocationId?: number | null;
}

export interface MeetingResponse {
  id: number;
  allocationId: number;
  mentorUserId: number;
  mentorName: string;
  studentUserId: number;
  studentName: string;
  scheduledDate: string;
  scheduledTime: string;
  mode: MeetingMode;
  location?: string | null;
  meetingLink?: string | null;
  status: MeetingStatus;
  attendanceStatus: AttendanceStatus;
  topic?: string;
  rescheduleReason?: string | null;
  notesSummary?: string | null;
}

export interface MeetingRequestResponse {
  id: number;
  studentUserId: number;
  studentName: string;
  mentorUserId: number;
  mentorName: string;
  proposedDate: string;
  proposedTime: string;
  topic: string;
  status: RequestStatus;
  reviewNotes?: string | null;
  createdAt: string;
}

export interface SessionNoteResponse {
  id: number;
  meetingId: number;
  mentorUserId: number;
  studentUserId: number;
  studentName?: string;
  discussionNotes: string;
  actionItems: string;
  progressStatus: ProgressStatus;
  followUpDate?: string | null;
  isPrivate: boolean;
  createdAt: string;
  escalationId?: number | null;
}

export interface EscalationResponse {
  id: number;
  sessionNoteId?: number;
  mentorUserId: number;
  mentorName?: string;
  studentUserId: number;
  studentName: string;
  studentBatch?: string;
  category: EscalationCategory;
  description: string;
  escalatedToRole: EscalationRole;
  escalatedToUserId?: number | null;
  status: EscalationStatus;
  resolutionNotes?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface ProfileChangeRequestResponse {
  id: number;
  studentUserId: number;
  studentName: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  reason: string;
  status: RequestStatus;
  reviewerNotes?: string | null;
  createdAt: string;
}

export interface DataCollectionTaskResponse {
  id: number;
  title: string;
  description: string;
  batch: string;
  department: string;
  dueDate: string;
  creatorMentorName: string;
  status: RecipientStatus;
}

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  linkUrl?: string;
}

export interface DashboardSummary {
  totalStudents: number;
  totalMentors: number;
  activeAllocations: number;
  unallocatedStudents: number;
  allocationPercentage: number;
  totalMeetingsCompleted: number;
  attendanceRate: number;
  studentsOnTrack: number;
  studentsNeedsAttention: number;
  studentsAtRisk: number;
  studentsCritical: number;
  openEscalations: number;
  resolvedEscalations: number;
  totalEscalations: number;
}

export interface MentorDashboardSummary {
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
}

export interface StudentDashboardSummary {
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
}

export interface MentorFilteredViewItem {
  mentorUserId: number;
  mentorName: string;
  department: string;
  specialization: string;
  capacity: number;
  currentStudentCount: number;
  students: {
    studentUserId: number;
    studentName: string;
    studentIdNumber: string;
    batch: string;
    progressStatus: ProgressStatus;
    riskStatus: RiskStatus;
  }[];
}
