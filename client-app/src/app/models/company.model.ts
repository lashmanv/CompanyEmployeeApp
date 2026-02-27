export interface Company {
  id: number;
  name: string;
  address: string;
}

export interface CreateCompanyRequest {
  name: string;
  address?: string;
}
