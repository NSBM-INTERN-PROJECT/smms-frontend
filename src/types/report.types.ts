export interface Report {
  id: string;
  allocationId: string;
  submittedById: string;
  content: string;
  date: string;
}

export interface CreateReportDto {
  allocationId: string;
  content: string;
}
