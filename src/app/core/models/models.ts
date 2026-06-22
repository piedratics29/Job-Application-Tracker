export interface User {
  id: string;
  username: string;
  email: string;
}

export type ApplicationStatus = 'Pending' | 'Interview' | 'Rejected' | 'Hired';

export const STATUS_OPTIONS: ApplicationStatus[] = ['Pending', 'Interview', 'Rejected', 'Hired'];

export interface JobApplication {
  id: string;
  userId: string;
  companyName: string;
  jobPosition: string;
  salaryOffered: number | null;
  applicationDate: string;
  status: ApplicationStatus;
  notes: string;
  createdAt: string;
}
