import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiService } from './api.service';
import {
  Employee,
  CreateEmployeeRequest,
  AddDetailsRequest
} from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private get url() { return `${this.api.baseUrl}/employees`; }

  constructor(
    private http: HttpClient,
    private api: ApiService
  ) {}

  getAll(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.url).pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.url}/${id}`).pipe(catchError(this.handleError));
  }

  getWithDetails(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.url}/${id}/details`).pipe(catchError(this.handleError));
  }

  create(req: CreateEmployeeRequest): Observable<Employee> {
    return this.http.post<Employee>(this.url, req).pipe(catchError(this.handleError));
  }

  update(id: number, req: CreateEmployeeRequest): Observable<Employee> {
    return this.http.put<Employee>(`${this.url}/${id}`, req).pipe(catchError(this.handleError));
  }

  addDetails(req: AddDetailsRequest): Observable<unknown> {
    return this.http.post(`${this.url}/details`, req).pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(catchError(this.handleError));
  }

  private handleError(err: { status?: number; error?: string }) {
    return throwError(() => err?.error ?? 'Request failed');
  }
}
