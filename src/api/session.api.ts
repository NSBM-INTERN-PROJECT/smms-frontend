import client from './client';
import type { Session, CreateSessionDto } from '../types/session.types';

export const getSessions = async (): Promise<Session[]> => {
  const response = await client.get<Session[]>('/sessions');
  return response.data;
};

export const createSession = async (data: CreateSessionDto): Promise<Session> => {
  const response = await client.post<Session>('/sessions', data);
  return response.data;
};
