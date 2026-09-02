import client from './client';
import { Meeting, CreateMeetingDto } from '../types/meeting.types';

export const getMeetings = async (allocationId?: string): Promise<Meeting[]> => {
  const response = await client.get<Meeting[]>('/meetings', { params: { allocationId } });
  return response.data;
};

export const createMeeting = async (data: CreateMeetingDto): Promise<Meeting> => {
  const response = await client.post<Meeting>('/meetings', data);
  return response.data;
};
