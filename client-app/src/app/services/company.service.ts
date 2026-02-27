import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { Company, CreateCompanyRequest } from '../models/company.model';
import { Employee } from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private get url() { return `${this.api.baseUrl}/companies`; }

  constructor(
    private http: HttpClient,
    private api: ApiService
  ) {}

  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(this.url).pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.url}/${id}`).pipe(catchError(this.handleError));
  }

  getEmployees(id: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.url}/${id}/employees`).pipe(catchError(this.handleError));
  }

  create(req: CreateCompanyRequest): Observable<Company> {
    return this.http.post<Company>(this.url, req).pipe(catchError(this.handleError));
  }

  update(id: number, req: CreateCompanyRequest): Observable<Company> {
    return this.http.put<Company>(`${this.url}/${id}`, req).pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(catchError(this.handleError));
  }

  private handleError(err: { status?: number; error?: string }) {
    return throwError(() => err?.error ?? 'Request failed');
  }
}
