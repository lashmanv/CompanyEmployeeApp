import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiService } from './api.service';
import {
  EmployeeListItem,
  EmployeeDetail,
  PagedResult,
  EmployeeFilterParams,
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

  getPaged(params: EmployeeFilterParams): Observable<PagedResult<EmployeeListItem>> {
    let httpParams = new HttpParams();
    if (params.search != null) httpParams = httpParams.set('search', params.search);
    if (params.companyId != null) httpParams = httpParams.set('companyId', params.companyId);
    if (params.department != null) httpParams = httpParams.set('department', params.department);
    if (params.role != null) httpParams = httpParams.set('role', params.role);
    if (params.includeArchived != null) httpParams = httpParams.set('includeArchived', params.includeArchived);
    if (params.pageNumber != null) httpParams = httpParams.set('pageNumber', params.pageNumber);
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);
    if (params.sortBy != null) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDirection != null) httpParams = httpParams.set('sortDirection', params.sortDirection);

    return this.http.get<PagedResult<EmployeeListItem>>(this.url, { params: httpParams }).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<EmployeeDetail> {
    return this.http.get<EmployeeDetail>(`${this.url}/${id}`).pipe(catchError(this.handleError));
  }

  getDepartments(): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/departments`).pipe(catchError(this.handleError));
  }

  getRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/roles`).pipe(catchError(this.handleError));
  }

  create(req: CreateEmployeeRequest): Observable<EmployeeDetail> {
    return this.http.post<EmployeeDetail>(this.url, req).pipe(catchError(this.handleError));
  }

  update(id: number, req: CreateEmployeeRequest): Observable<EmployeeDetail> {
    return this.http.put<EmployeeDetail>(`${this.url}/${id}`, req).pipe(catchError(this.handleError));
  }

  archive(id: number): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/archive`, {}).pipe(catchError(this.handleError));
  }

  addDetails(req: AddDetailsRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/details`, req).pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(catchError(this.handleError));
  }

  private handleError(err: { status?: number; error?: string }) {
    return throwError(() => err?.error ?? 'Request failed');
  }
}
