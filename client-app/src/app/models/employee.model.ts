export interface EmployeeDetailsDto {
  email: string;
  phone: string;
  department: string;
  role: string;
  joinDate: string | null;
  dateOfBirth: string | null;
}

export interface EmployeeDetail {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  salary: number;
  companyId: number;
  companyName: string | null;
  createdAt: string;
  updatedAt: string;
  details?: EmployeeDetailsDto | null;
}

export interface EmployeeListItem {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  salary: number;
  companyId: number;
  companyName: string | null;
  department: string | null;
  role: string | null;
  email: string | null;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface EmployeeFilterParams {
  search?: string;
  companyId?: number;
  department?: string;
  role?: string;
  includeArchived?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  salary: number;
  companyId: number;
}

export interface AddDetailsRequest {
  employeeId: number;
  email: string;
  phone?: string;
  department?: string;
  role?: string;
  joinDate?: string | null;
}
