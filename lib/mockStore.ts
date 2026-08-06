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

  // ─── Slots ─────────────────────────────────────────────────────────────────
  public async fetchSlots() {
    try {
      const [mentorSlots, invitations] = await Promise.allSettled([
        meetingApi.getMySlots(),
        meetingApi.getStudentSlotInvitations(),
      ]);

      const combined: SlotResponse[] = [];
      if (mentorSlots.status === 'fulfilled' && mentorSlots.value) {
        combined.push(...mentorSlots.value);
      }
      if (invitations.status === 'fulfilled' && invitations.value) {
        combined.push(...invitations.value);
      }

      if (combined.length > 0) {
        this.slots = Array.from(new Map(combined.map((s) => [s.id, s])).values());
        this.notify();
      }
    } catch (err) {
      console.warn('Failed to fetch slots:', err);
    }
    return this.slots;
  }

  getSlots(mentorUserId?: number) {
    if (mentorUserId) return this.slots.filter((s) => s.mentorUserId === mentorUserId);
    return this.slots;
  }

  getStudentSlotInvitations(studentUserId: number) {
    return this.slots.filter(
      (s) => s.assignedStudentUserId === studentUserId && s.allocationStatus === SlotAllocationStatus.PENDING
    );
  }

  createSlot(slot: Omit<SlotResponse, 'id'>) {
    const newSlot: SlotResponse = {
      ...slot,
      id: Math.floor(Math.random() * 1000) + 50,
    };
    this.slots.unshift(newSlot);
    this.notify();

    meetingApi
      .bulkCreateSlots([slot], slot.assignedStudentUserId ? [slot.assignedStudentUserId] : undefined)
      .catch((err) => console.warn('Backend createSlot failed:', err));

    return newSlot;
  }

  respondToSlot(slotId: number, accepted: boolean, rescheduleReason?: string) {
    const slot = this.slots.find((s) => s.id === slotId);
    if (!slot) return null;

    if (accepted) {
      slot.allocationStatus = SlotAllocationStatus.CONFIRMED;
      if (slot.assignedStudentUserId) {
        const student = this.students.find((s) => s.userId === slot.assignedStudentUserId);
        const mentor = this.mentors.find((m) => m.userId === slot.mentorUserId);
        const newMeeting: MeetingResponse = {
          id: Math.floor(Math.random() * 5000) + 200,
          allocationId: slot.allocationId || 1,
          mentorUserId: slot.mentorUserId,
          mentorName: mentor ? mentor.fullName : slot.mentorName || 'Mentor',
          studentUserId: slot.assignedStudentUserId,
          studentName: student ? student.fullName : slot.assignedStudentName || 'Student',
          scheduledDate: slot.slotDate,
          scheduledTime: slot.startTime,
          mode: slot.mode,
          location: slot.location,
          meetingLink: slot.meetingLink,
          status: MeetingStatus.SCHEDULED,
          attendanceStatus: AttendanceStatus.PENDING,
          topic: 'Mentoring Consultation Session',
        };
        this.meetings.unshift(newMeeting);
      }
    } else {
      slot.allocationStatus = SlotAllocationStatus.RESCHEDULE_REQUESTED;
    }
    this.notify();

    meetingApi.respondToSlot(slotId, accepted, rescheduleReason).catch((err) => console.warn('Backend respondToSlot failed:', err));
    return slot;
  }

  // ─── Meetings ──────────────────────────────────────────────────────────────
  public async fetchMeetings(role: Role = Role.MENTOR, userId?: number) {
    try {
      const data = await meetingApi.getAllMeetingsForUser(role);
      if (data && data.length > 0) {
        this.meetings = data;
        this.notify();
      }
    } catch (err) {
      console.warn('Failed to fetch meetings:', err);
    }
    return this.meetings;
  }

  getMeetings(role: Role, userId: number) {
    if (typeof window !== 'undefined' && this.meetings.length === 0) {
      this.fetchMeetings(role, userId);
    }
    if (role === Role.STUDENT) {
      return this.meetings.filter((m) => m.studentUserId === userId);
    }
    if (role === Role.MENTOR) {
      return this.meetings.filter((m) => m.mentorUserId === userId);
    }
    return this.meetings;
  }

  markAttendance(meetingId: number, attendance: AttendanceStatus) {
    const meeting = this.meetings.find((m) => m.id === meetingId);
    if (meeting) {
      meeting.attendanceStatus = attendance;
      meeting.status = MeetingStatus.COMPLETED;
      this.notify();

      meetingApi.markAttendance(meetingId, attendance).catch((err) => console.warn('Backend markAttendance failed:', err));
    }
    return meeting;
  }

  rescheduleMeeting(meetingId: number, newDate: string, newTime: string, reason: string) {
    const meeting = this.meetings.find((m) => m.id === meetingId);
    if (meeting) {
      meeting.scheduledDate = newDate;
      meeting.scheduledTime = newTime;
      meeting.rescheduleReason = reason;
      meeting.status = MeetingStatus.RESCHEDULED;
      this.notify();

      meetingApi.reschedule(meetingId, newDate, newTime, reason).catch((err) => console.warn('Backend reschedule failed:', err));
    }
    return meeting;
  }

  cancelMeeting(meetingId: number, reason: string) {
    const meeting = this.meetings.find((m) => m.id === meetingId);
    if (meeting) {
      meeting.status = MeetingStatus.CANCELLED;
      meeting.rescheduleReason = reason;
      this.notify();

      meetingApi.cancel(meetingId, reason).catch((err) => console.warn('Backend cancel failed:', err));
    }
    return meeting;
  }

  // ─── Meeting Requests ──────────────────────────────────────────────────────
  public async fetchMeetingRequests(role: Role = Role.MENTOR) {
    try {
      const data =
        role === Role.STUDENT
          ? await meetingApi.getMyRequestsStudent()
          : await meetingApi.getPendingRequestsMentor();
      if (data && data.length > 0) {
        this.meetingRequests = data;
        this.notify();
      }
    } catch (err) {
      console.warn('Failed to fetch meeting requests:', err);
    }
    return this.meetingRequests;
  }

  getMeetingRequests(role: Role, userId: number) {
    if (typeof window !== 'undefined' && this.meetingRequests.length === 0) {
      this.fetchMeetingRequests(role);
    }
    if (role === Role.STUDENT) {
      return this.meetingRequests.filter((r) => r.studentUserId === userId);
    }
    if (role === Role.MENTOR) {
      return this.meetingRequests.filter((r) => r.mentorUserId === userId);
    }
    return this.meetingRequests;
  }

  createMeetingRequest(
    studentUserId: number,
    mentorUserId: number,
    proposedDate: string,
    proposedTime: string,
    topic: string
  ) {
    const student = this.students.find((s) => s.userId === studentUserId);
    const mentor = this.mentors.find((m) => m.userId === mentorUserId);
    const newReq: MeetingRequestResponse = {
      id: Math.floor(Math.random() * 1000) + 10,
      studentUserId,
      studentName: student ? student.fullName : 'Student',
      mentorUserId,
      mentorName: mentor ? mentor.fullName : 'Mentor',
      proposedDate,
      proposedTime,
      topic,
      status: RequestStatus.PENDING,
      createdAt: new Date().toISOString(),
    };
    this.meetingRequests.unshift(newReq);
    this.notify();

    meetingApi
      .submitRequest({
        mentorUserId,
        preferredDate: proposedDate,
        preferredTime: proposedTime,
        reason: topic,
      })
      .then((saved) => {
        const idx = this.meetingRequests.findIndex((r) => r.id === newReq.id);
        if (idx !== -1) {
          this.meetingRequests[idx] = saved;
          this.notify();
        }
      })
      .catch((err) => console.warn('Backend submitRequest failed:', err));

    return newReq;
  }

  reviewMeetingRequest(
    requestId: number,
    approve: boolean,
    notes?: string,
    scheduledDate?: string,
    scheduledTime?: string,
    meetingLink?: string,
    location?: string
  ) {
    const req = this.meetingRequests.find((r) => r.id === requestId);
    if (!req) return null;

    req.status = approve ? RequestStatus.APPROVED : RequestStatus.REJECTED;
    req.reviewNotes = notes;

    if (approve && scheduledDate && scheduledTime) {
      const newMeeting: MeetingResponse = {
        id: Math.floor(Math.random() * 5000) + 300,
        allocationId: 1,
        mentorUserId: req.mentorUserId,
        mentorName: req.mentorName,
        studentUserId: req.studentUserId,
        studentName: req.studentName,
        scheduledDate,
        scheduledTime,
        mode: meetingLink ? MeetingMode.ONLINE : MeetingMode.IN_PERSON,
        location,
        meetingLink,
        status: MeetingStatus.SCHEDULED,
        attendanceStatus: AttendanceStatus.PENDING,
        topic: req.topic,
      };
      this.meetings.unshift(newMeeting);
    }
    this.notify();

    if (approve) {
      meetingApi
        .approveRequest(requestId, {
          reviewNotes: notes,
          scheduledDate,
          scheduledTime,
          location,
          meetingLink,
        })
        .catch((err) => console.warn('Backend approveRequest failed:', err));
    } else {
      meetingApi.rejectRequest(requestId, notes).catch((err) => console.warn('Backend rejectRequest failed:', err));
    }

    return req;
  }

  // ─── Session Notes ─────────────────────────────────────────────────────────
  public async fetchSessionNotes(userId?: number, role?: Role) {
    try {
      const data =
        role === Role.STUDENT
          ? await sessionApi.getMyStudentNotes()
          : await sessionApi.getMentorNotes();
      if (data && data.length > 0) {
        this.sessionNotes = data;
        this.notify();
      }
    } catch (err) {
      console.warn('Failed to fetch session notes:', err);
    }
    return this.sessionNotes;
  }

  getSessionNotes(userId?: number, role?: Role) {
    if (typeof window !== 'undefined' && this.sessionNotes.length === 0) {
      this.fetchSessionNotes(userId, role);
    }
    if (role === Role.STUDENT && userId) {
      return this.sessionNotes.filter((n) => n.studentUserId === userId && !n.isPrivate);
    }
    if (role === Role.MENTOR && userId) {
      return this.sessionNotes.filter((n) => n.mentorUserId === userId);
    }
    return this.sessionNotes;
  }

  createSessionNote(note: Omit<SessionNoteResponse, 'id' | 'createdAt'>) {
    const newNote: SessionNoteResponse = {
      ...note,
      id: Math.floor(Math.random() * 1000) + 50,
      createdAt: new Date().toISOString(),
    };
    this.sessionNotes.unshift(newNote);

    const student = this.students.find((s) => s.userId === note.studentUserId);
    if (student) {
      student.latestProgressStatus = note.progressStatus;
    }
    this.notify();

    sessionApi
      .createNote({
        meetingId: note.meetingId,
        studentUserId: note.studentUserId,
        discussionNotes: note.discussionNotes,
        actionItems: note.actionItems || undefined,
        progressStatus: note.progressStatus || undefined,
        followUpDate: note.followUpDate || undefined,
        isPrivate: note.isPrivate,
      })
      .then((saved) => {
        const idx = this.sessionNotes.findIndex((n) => n.id === newNote.id);
        if (idx !== -1) {
          this.sessionNotes[idx] = saved;
          this.notify();
        }
      })
      .catch((err) => console.warn('Backend createNote failed:', err));

    return newNote;
  }

  // ─── Escalations ───────────────────────────────────────────────────────────
  public async fetchEscalations() {
    try {
      const data = await sessionApi.listEscalations();
      if (data && data.length > 0) {
        this.escalations = data;
        this.notify();
      }
    } catch (err) {
      console.warn('Failed to fetch escalations:', err);
    }
    return this.escalations;
  }

  getEscalations() {
    if (typeof window !== 'undefined' && this.escalations.length === 0) {
      this.fetchEscalations();
    }
    return this.escalations;
  }

  createEscalation(esc: Omit<EscalationResponse, 'id' | 'createdAt' | 'status'>) {
    const newEsc: EscalationResponse = {
      ...esc,
      id: Math.floor(Math.random() * 1000) + 20,
      status: EscalationStatus.OPEN,
      createdAt: new Date().toISOString(),
    };
    this.escalations.unshift(newEsc);
    this.notify();

    sessionApi
      .createEscalation({
        studentUserId: esc.studentUserId,
        category: esc.category,
        description: esc.description,
        escalatedToRole: esc.escalatedToRole,
        sessionNoteId: esc.sessionNoteId,
        escalatedToUserId: esc.escalatedToUserId || undefined,
      })
      .then((saved) => {
        const idx = this.escalations.findIndex((e) => e.id === newEsc.id);
        if (idx !== -1) {
          this.escalations[idx] = saved;
          this.notify();
        }
      })
      .catch((err) => console.warn('Backend createEscalation failed:', err));

    return newEsc;
  }

  resolveEscalation(escalationId: number, status: EscalationStatus, notes: string) {
    const esc = this.escalations.find((e) => e.id === escalationId);
    if (esc) {
      esc.status = status;
      esc.resolutionNotes = notes;
      if (status === EscalationStatus.RESOLVED || status === EscalationStatus.CLOSED) {
        esc.resolvedAt = new Date().toISOString();
      }
      this.notify();

      sessionApi
        .updateEscalationStatus(escalationId, { status, resolutionNotes: notes })
        .catch((err) => console.warn('Backend updateEscalationStatus failed:', err));
    }
    return esc;
  }

  // ─── Profile Change Requests ───────────────────────────────────────────────
  public async fetchProfileRequests() {
    try {
      const data = await userApi.getPendingProfileRequests();
      if (data && data.length > 0) {
        this.profileRequests = data;
        this.notify();
      }
    } catch (err) {
      console.warn('Failed to fetch profile requests:', err);
    }
    return this.profileRequests;
  }

  getProfileRequests() {
    return this.profileRequests;
  }

  createProfileChangeRequest(
    studentUserId: number,
    fieldName: string,
    oldValue: string,
    newValue: string,
    reason: string
  ) {
    const student = this.students.find((s) => s.userId === studentUserId);
    const newReq: ProfileChangeRequestResponse = {
      id: Math.floor(Math.random() * 1000) + 10,
      studentUserId,
      studentName: student ? student.fullName : 'Student',
      fieldName,
      oldValue,
      newValue,
      reason,
      status: RequestStatus.PENDING,
      createdAt: new Date().toISOString(),
    };
    this.profileRequests.unshift(newReq);
    this.notify();

    userApi
      .requestFieldUpdate({ fieldName, newValue, reason }, student?.allocatedMentorId)
      .catch((err) => console.warn('Backend requestFieldUpdate failed:', err));

    return newReq;
  }

  reviewProfileRequest(requestId: number, approve: boolean, reviewerNotes?: string) {
    const req = this.profileRequests.find((r) => r.id === requestId);
    if (!req) return null;

    req.status = approve ? RequestStatus.APPROVED : RequestStatus.REJECTED;
    req.reviewerNotes = reviewerNotes;

    if (approve) {
      const student = this.students.find((s) => s.userId === req.studentUserId);
      if (student) {
        (student as unknown as Record<string, unknown>)[req.fieldName] = req.newValue;
      }
    }
    this.notify();

    if (approve) {
      userApi.approveProfileRequest(requestId, reviewerNotes).catch((err) => console.warn('Backend approveProfileRequest failed:', err));
    } else {
      userApi.rejectProfileRequest(requestId, reviewerNotes).catch((err) => console.warn('Backend rejectProfileRequest failed:', err));
    }

    return req;
  }

  // ─── Data Tasks ────────────────────────────────────────────────────────────
  public async fetchTasks() {
    try {
      const data = await userApi.getMyTasks();
      if (data && data.length > 0) {
        this.tasks = data;
        this.notify();
      }
    } catch (err) {
      console.warn('Failed to fetch tasks:', err);
    }
    return this.tasks;
  }

  getTasks() {
    return this.tasks;
  }

  createTask(task: Omit<DataCollectionTaskResponse, 'id' | 'status'>) {
    const newTask: DataCollectionTaskResponse = {
      ...task,
      id: Math.floor(Math.random() * 1000) + 10,
      status: RecipientStatus.PENDING,
    };
    this.tasks.unshift(newTask);
    this.notify();

    userApi
      .createDataCollectionRequest({
        title: task.title,
        description: task.description,
        batch: task.batch,
        department: task.department,
        dueDate: task.dueDate,
      })
      .catch((err) => console.warn('Backend createDataCollectionRequest failed:', err));

    return newTask;
  }

  submitTask(taskId: number) {
    const t = this.tasks.find((task) => task.id === taskId);
    if (t) {
      t.status = RecipientStatus.SUBMITTED;
      this.notify();
      userApi.submitDataCollection(taskId).catch((err) => console.warn('Backend submitDataCollection failed:', err));
    }
    return t;
  }

  // ─── Notifications ─────────────────────────────────────────────────────────
  public async fetchNotifications() {
    try {
      const data = await meetingApi.getNotifications();
      if (data && data.length > 0) {
        this.notifications = data;
        this.notify();
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    }
    return this.notifications;
  }

  getNotifications() {
    return this.notifications;
  }

  markAllNotificationsRead() {
    this.notifications.forEach((n) => {
      n.read = true;
    });
    this.notify();
    meetingApi.markAllNotificationsRead().catch((err) => console.warn('Backend markAllNotificationsRead failed:', err));
  }

  // ─── Dashboard Summaries ───────────────────────────────────────────────────
  public async fetchAdminSummary() {
    try {
      const data = await reportApi.getAdminDashboard();
      if (data) {
        this.adminSummary = data;
        this.notify();
      }
    } catch (err) {
      console.warn('Failed to fetch admin summary:', err);
    }
    return this.adminSummary;
  }

  getAdminDashboardSummary() {
    if (typeof window !== 'undefined' && this.adminSummary.totalStudents === 0) {
      this.fetchAdminSummary();
    }
    return this.adminSummary;
  }

  getMentorDashboardSummary(mentorUserId: number) {
    const mentorMeetings = this.meetings.filter((m) => m.mentorUserId === mentorUserId);
    const completed = mentorMeetings.filter((m) => m.status === MeetingStatus.COMPLETED).length;
    const openEsc = this.escalations.filter(
      (e) => e.mentorUserId === mentorUserId && e.status === EscalationStatus.OPEN
    ).length;
    const pendingReqs = this.meetingRequests.filter(
      (r) => r.mentorUserId === mentorUserId && r.status === RequestStatus.PENDING
    ).length;
    const mentor = this.mentors.find((m) => m.userId === mentorUserId);

    return {
      mentorUserId,
      totalStudents: mentor ? mentor.currentStudentCount : 0,
      capacity: mentor ? mentor.capacity : 15,
      studentsOnTrack: this.students.filter((s) => s.latestProgressStatus === ProgressStatus.ON_TRACK).length,
      studentsNeedsAttention: this.students.filter(
        (s) => s.latestProgressStatus === ProgressStatus.NEEDS_ATTENTION
      ).length,
      studentsAtRisk: this.students.filter((s) => s.latestProgressStatus === ProgressStatus.AT_RISK).length,
      studentsCritical: this.students.filter((s) => s.latestProgressStatus === ProgressStatus.CRITICAL).length,
      totalMeetings: mentorMeetings.length,
      completedMeetings: completed,
      openEscalations: openEsc,
      pendingMeetingRequestsCount: pendingReqs,
    };
  }

  getStudentDashboardSummary(studentUserId: number) {
    const sMeetings = this.meetings.filter((m) => m.studentUserId === studentUserId);
    const completed = sMeetings.filter((m) => m.status === MeetingStatus.COMPLETED);
    const upcoming = sMeetings.filter((m) => m.status === MeetingStatus.SCHEDULED);
    const attended = completed.filter((m) => m.attendanceStatus === AttendanceStatus.PRESENT).length;
    const absent = completed.filter((m) => m.attendanceStatus === AttendanceStatus.ABSENT).length;
    const notes = this.sessionNotes.filter((n) => n.studentUserId === studentUserId && !n.isPrivate);
    const student = this.students.find((s) => s.userId === studentUserId);

    return {
      studentUserId,
      mentorUserId: student?.allocatedMentorId || 18,
      mentorName: student?.allocatedMentorName || 'Assigned Mentor',
      latestProgressStatus: student?.latestProgressStatus || ProgressStatus.ON_TRACK,
      totalMeetings: sMeetings.length,
      completedMeetings: completed.length,
      upcomingMeetings: upcoming.length,
      attendancePresent: attended,
      attendanceAbsent: absent,
      openEscalations: 0,
      totalSessionNotes: notes.length,
      nextMeeting: upcoming[0] || undefined,
    };
  }
}

export const mockStore = new RealDataStore();
export const dataStore = mockStore;

/**
 * Hook to force component re-render when live data from backend arrives.
 */
export function useStoreSync() {
  const [, setTick] = useState(0);
  useEffect(() => {
    return mockStore.subscribe(() => setTick((t) => t + 1));
  }, []);
}
