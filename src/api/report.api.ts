import client from './client';
import type { Report, CreateReportDto } from '../types/report.types';

export const getReports = async (allocationId?: string): Promise<Report[]> => {
  const response = await client.get<Report[]>('/reports', { params: { allocationId } });
  return response.data;
};

export const createReport = async (data: CreateReportDto): Promise<Report> => {
  const response = await client.post<Report>('/reports', data);
  return response.data;
};
