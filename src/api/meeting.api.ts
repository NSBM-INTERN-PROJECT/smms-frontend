import client from './client';
import type { Meeting, CreateMeetingDto } from '../types/meeting.types';

const mapMeeting = (m: any): Meeting => ({
  id: m.id?.toString() || '',
  allocationId: m.allocationId?.toString() || '',
  mentorUserId: m.mentorUserId?.toString(),
  studentUserId: m.studentUserId?.toString(),
  title: m.title,
  scheduledDate: m.scheduledDate,
  scheduledTime: m.scheduledTime,
  date: m.scheduledDate && m.scheduledTime ? `${m.scheduledDate}T${m.scheduledTime}` : m.date,
  durationMinutes: m.durationMinutes || 30,
  status: m.status || 'SCHEDULED',
  meetingLink: m.meetingLink,
  location: m.location,
  mode: m.mode,
});

export const getMeetings = async (): Promise<Meeting[]> => {
  // Fetch upcoming + history for mentor
  const [upcoming, history] = await Promise.all([
    client.get('/meetings/mentor/me/upcoming').then(r => r.data).catch(() => []),
    client.get('/meetings/mentor/me/history').then(r => r.data?.content || r.data || []).catch(() => []),
  ]);
  const all = [...upcoming, ...history];
  // deduplicate by id
  const seen = new Set<string>();
  return all.filter((m: any) => {
    const key = m.id?.toString();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map(mapMeeting);
};

export const createMeeting = async (data: CreateMeetingDto): Promise<Meeting> => {
  const response = await client.post('/meetings/schedule', {
    allocationId: Number(data.allocationId),
    studentUserId: Number(data.studentUserId),
    title: data.title,
    scheduledDate: data.scheduledDate,
    scheduledTime: data.scheduledTime,
    durationMinutes: data.durationMinutes,
    meetingLink: data.meetingLink,
    location: data.location,
    mode: data.mode || 'PHYSICAL',
  });
  return mapMeeting(response.data);
};
