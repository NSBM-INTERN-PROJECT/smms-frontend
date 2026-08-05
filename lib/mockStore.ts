'use client';

import {
  authApi,
  userApi,
  allocationApi,
  meetingApi,
  sessionApi,
  reportApi,
} from './api';
import {
  Role,
  UserResponse,
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
  AttendanceStatus,
  SlotAllocationStatus,
  RequestStatus,
  EscalationStatus,
  AllocationStatus,
  AllocationType,
  RecipientStatus,
  ProgressStatus,
  EscalationCategory,
  EscalationRole,
  MeetingStatus,
  MeetingMode,
  DashboardSummary,
} from '@/types';
import React, { useState, useEffect } from 'react';

type Listener = () => void;

class RealDataStore {
  private users: UserResponse[] = [];
  private students: StudentProfileResponse[] = [];
  private mentors: MentorProfileResponse[] = [];
  private allocations: AllocationResponse[] = [];
  private slots: SlotResponse[] = [];
  private meetings: MeetingResponse[] = [];
  private meetingRequests: MeetingRequestResponse[] = [];
  private sessionNotes: SessionNoteResponse[] = [];
  private escalations: EscalationResponse[] = [];
  private profileRequests: ProfileChangeRequestResponse[] = [];
  private tasks: DataCollectionTaskResponse[] = [];
  private notifications: NotificationResponse[] = [];

  private adminSummary: DashboardSummary = {
    totalStudents: 0,
    totalMentors: 0,
    activeAllocations: 0,
    unallocatedStudents: 0,
    allocationPercentage: 0,
    totalMeetingsCompleted: 0,
    attendanceRate: 90,
    studentsOnTrack: 0,
    studentsNeedsAttention: 0,
    studentsAtRisk: 0,
    studentsCritical: 0,
    openEscalations: 0,
    resolvedEscalations: 0,
    totalEscalations: 0,
  };

  private listeners: Set<Listener> = new Set();
  private initialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Auto-load data in browser
      setTimeout(() => this.initialize(), 50);
    }
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public async initialize() {
    if (this.initialized) return;
    this.initialized = true;
    await this.fetchAll();
  }

  public async fetchAll() {
    try {
      await Promise.allSettled([
        this.fetchUsers(),
        this.fetchStudents(),
        this.fetchMentors(),
        this.fetchAllocations(),
        this.fetchSlots(),
        this.fetchNotifications(),
        this.fetchAdminSummary(),
        this.fetchEscalations(),
        this.fetchTasks(),
        this.fetchProfileRequests(),
      ]);
    } catch (err) {
      console.warn('Store fetchAll error:', err);
    } finally {
      this.notify();
    }
  }

  // ─── Users ──────────────────────────────────────────────────────────────────
  public async fetchUsers() {
    try {
      const data = await authApi.getAccounts(0, 500);
      if (data && data.length > 0) {
        this.users = data;
        this.notify();
      }
    } catch (err) {
      console.warn('Failed to fetch users:', err);
    }
    return this.users;
  }

  getUsers() {
    return this.users;
  }

  getUserById(id: number) {
    return this.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: Omit<UserResponse, 'id' | 'createdAt'>) {
    const newUser: UserResponse = {
      ...user,
      id: Math.floor(Math.random() * 1000) + 100,
      createdAt: new Date().toISOString(),
    };
    this.users.unshift(newUser);
    this.notify();

    // Persist to backend
    authApi
      .createAccount({
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
      })
      .then((saved) => {
        const idx = this.users.findIndex((u) => u.email === saved.email);
        if (idx !== -1) {
          this.users[idx] = saved;
          this.notify();
        }
      })
      .catch((err) => console.warn('Backend createAccount failed:', err));

    return newUser;
  }

  updateUser(id: number, data: Partial<UserResponse>) {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...data };
      this.notify();

      authApi.updateAccount(id, data).catch((err) => console.warn('Backend updateAccount failed:', err));
      return this.users[idx];
    }
    return null;
  }

  // ─── Students & Profiles ───────────────────────────────────────────────────
  public async fetchStudents(params?: { batch?: string; department?: string; riskStatus?: string }) {
    try {
      const data = await userApi.getStudents(params);
      if (data && data.length > 0) {
        this.students = data;
        this.notify();
      }
    } catch (err) {
      console.warn('Failed to fetch students:', err);
    }
    return this.students;
  }

  getStudents() {
    return this.students;
  }

  getStudentByUserId(userId: number) {
    return this.students.find((s) => s.userId === userId);
  }

  updateStudentExtendedProfile(userId: number, data: Partial<StudentProfileResponse>) {
    const idx = this.students.findIndex((s) => s.userId === userId);
    if (idx !== -1) {
      this.students[idx] = { ...this.students[idx], ...data };
      this.notify();

      userApi.updateStudent(userId, data).catch((err) => console.warn('Backend updateStudent failed:', err));
      return this.students[idx];
    }
    return null;
  }

  // ─── Mentors ───────────────────────────────────────────────────────────────
  public async fetchMentors(params?: { department?: string }) {
    try {
      const data = await userApi.getMentors(params);
      if (data && data.length > 0) {
        this.mentors = data;
        this.notify();
      }
    } catch (err) {
      console.warn('Failed to fetch mentors:', err);
    }
    return this.mentors;
  }

  getMentors() {
    return this.mentors;
  }

  getMentorByUserId(userId: number) {
    return this.mentors.find((m) => m.userId === userId);
  }

  updateMentorProfile(userId: number, data: Partial<MentorProfileResponse>) {
    const idx = this.mentors.findIndex((m) => m.userId === userId);
    if (idx !== -1) {
      this.mentors[idx] = { ...this.mentors[idx], ...data };
      this.notify();

      userApi.updateMentor(userId, data).catch((err) => console.warn('Backend updateMentor failed:', err));
      return this.mentors[idx];
    }
    return null;
  }

  updateMentorCapacity(mentorUserId: number, newCapacity: number) {
    const mentor = this.mentors.find((m) => m.userId === mentorUserId);
    if (!mentor) return null;
    mentor.capacity = Math.max(1, newCapacity);
    this.notify();

    userApi
      .updateMentor(mentorUserId, { capacity: mentor.capacity })
      .catch((err) => console.warn('Backend updateMentor capacity failed:', err));

    return mentor;
  }

  // ─── Allocations ───────────────────────────────────────────────────────────
  public async fetchAllocations(status?: string) {
    try {
      const data = await allocationApi.listAll(status);
      if (data && data.length > 0) {
        this.allocations = data;
        this.notify();
      }
    } catch (err) {
      console.warn('Failed to fetch allocations:', err);
    }
    return this.allocations;
  }

  getAllocations() {
    return this.allocations;
  }

  allocateStudent(studentUserId: number, mentorUserId: number, type: AllocationType = AllocationType.MANUAL) {
    const student = this.students.find((s) => s.userId === studentUserId);
    const mentor = this.mentors.find((m) => m.userId === mentorUserId);

    if (student) {
      student.allocatedMentorId = mentorUserId;
      student.allocatedMentorName = mentor?.fullName;
    }
    if (mentor) {
      mentor.currentStudentCount += 1;
    }

    const newAllocation: AllocationResponse = {
      id: Math.floor(Math.random() * 9000) + 100,
      studentUserId,
      studentName: student ? student.fullName : `Student ${studentUserId}`,
      studentIdNumber: student ? student.studentId : `S${studentUserId}`,
      mentorUserId,
      mentorName: mentor ? mentor.fullName : `Mentor ${mentorUserId}`,
      batch: student ? student.batch : '21.1',
      department: student ? student.department : 'Software Engineering',
      allocationType: type,
      status: AllocationStatus.ACTIVE,
      allocatedAt: new Date().toISOString(),
    };

    this.allocations.unshift(newAllocation);
    this.notify();

    allocationApi
      .manualAllocate(studentUserId, mentorUserId)
      .then((saved) => {
        const idx = this.allocations.findIndex((a) => a.studentUserId === studentUserId);
        if (idx !== -1) {
          this.allocations[idx] = saved;
          this.notify();
        }
      })
      .catch((err) => console.warn('Backend manualAllocate failed:', err));

    return newAllocation;
  }

  transferAllocation(allocationId: number, newMentorUserId: number) {
    const alloc = this.allocations.find((a) => a.id === allocationId);
    const newMentor = this.mentors.find((m) => m.userId === newMentorUserId);
    if (!alloc || !newMentor) return null;

    const oldMentor = this.mentors.find((m) => m.userId === alloc.mentorUserId);
    if (oldMentor) oldMentor.currentStudentCount = Math.max(0, oldMentor.currentStudentCount - 1);

    newMentor.currentStudentCount += 1;
    alloc.mentorUserId = newMentorUserId;
    alloc.mentorName = newMentor.fullName;
    alloc.status = AllocationStatus.TRANSFERRED;

    const student = this.students.find((s) => s.userId === alloc.studentUserId);
    if (student) {
      student.allocatedMentorId = newMentorUserId;
      student.allocatedMentorName = newMentor.fullName;
    }
    this.notify();

    allocationApi.transfer(allocationId, newMentorUserId).catch((err) => console.warn('Backend transfer failed:', err));
    return alloc;
  }

  deactivateAllocation(allocationId: number) {
    const alloc = this.allocations.find((a) => a.id === allocationId);
    if (alloc) {
      alloc.status = AllocationStatus.INACTIVE;
      alloc.deactivatedAt = new Date().toISOString();
      const student = this.students.find((s) => s.userId === alloc.studentUserId);
      if (student) {
        student.allocatedMentorId = undefined;
        student.allocatedMentorName = undefined;
      }
      const mentor = this.mentors.find((m) => m.userId === alloc.mentorUserId);
      if (mentor) {
        mentor.currentStudentCount = Math.max(0, mentor.currentStudentCount - 1);
      }
      this.notify();

      allocationApi.deactivate(allocationId).catch((err) => console.warn('Backend deactivate failed:', err));
    }
    return alloc;
  }

  transferStudent(studentUserId: number, newMentorUserId: number) {
    const existing = this.allocations.find(
      (a) => a.studentUserId === studentUserId && a.status === AllocationStatus.ACTIVE
    );
    if (existing) {
      return this.transferAllocation(existing.id, newMentorUserId);
    }
    return this.allocateStudent(studentUserId, newMentorUserId);
  }

  unallocateStudent(studentUserId: number) {
    const existing = this.allocations.find(
      (a) => a.studentUserId === studentUserId && a.status === AllocationStatus.ACTIVE
    );
    if (existing) {
      return this.deactivateAllocation(existing.id);
    }
    return null;
  }


}

export const mockStore = new RealDataStore();
export const dataStore = mockStore;

export function useStoreSync() {
  const [, setTick] = useState(0);
  useEffect(() => {
    return mockStore.subscribe(() => setTick((t) => t + 1));
  }, []);
}
