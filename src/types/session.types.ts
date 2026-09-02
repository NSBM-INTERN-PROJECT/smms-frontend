export interface Session {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CreateSessionDto {
  name: string;
  startDate: string;
  endDate: string;
}
