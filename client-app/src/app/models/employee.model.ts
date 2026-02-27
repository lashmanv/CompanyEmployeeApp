export interface EmployeeDetails {
  id: number;
  employeeId: number;
  email: string;
  phone: string;
  department: string;
  dateOfBirth: string;
  joinDate: string | null;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  salary: number;
  companyId: number;
  details?: EmployeeDetails | null;
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
  joinDate?: string | null;
}
