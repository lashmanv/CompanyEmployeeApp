import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { CompanyService } from '../../services/company.service';
import { Employee } from '../../models/employee.model';
import { Company } from '../../models/company.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <h1>Employees</h1>
    <p><a routerLink="/employees/new" class="btn">Add Employee</a></p>
    @if (loading) {
      <p>Loading…</p>
    } @else if (error) {
      <p class="error">{{ error }}</p>
    } @else {
      <table class="table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Salary</th>
            <th>Company</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (e of employees; track e.id) {
            <tr>
              <td>{{ e.id }}</td>
              <td>{{ e.fullName }}</td>
              <td>{{ e.salary | currency }}</td>
              <td>{{ companyName(e.companyId) }}</td>
              <td>
                <a [routerLink]="['/employees', e.id]">View</a>
                <a [routerLink]="['/employees', 'edit', e.id]">Edit</a>
                <button type="button" (click)="delete(e.id)" class="link-btn">Delete</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
  styles: [`
    .btn { display: inline-block; padding: 0.5rem 1rem; background: #1a1a2e; color: #fff; text-decoration: none; border-radius: 6px; margin-bottom: 1rem; }
    .btn:hover { background: #2d2d44; }
    .error { color: #b91c1c; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb; }
    .link-btn { background: none; border: none; color: #2563eb; cursor: pointer; padding: 0; margin-left: 1rem; }
    .link-btn:hover { text-decoration: underline; }
    a { margin-right: 1rem; color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
  `]
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  companies: Company[] = [];
  loading = true;
  error = '';

  constructor(
    private employeeService: EmployeeService,
    private companyService: CompanyService
  ) {}

  ngOnInit() {
    this.companyService.getAll().subscribe({ next: (list) => (this.companies = list) });
    this.employeeService.getAll().subscribe({
      next: (list) => { this.employees = list; this.loading = false; },
      error: (err) => { this.error = typeof err === 'string' ? err : 'Failed to load employees'; this.loading = false; }
    });
  }

  companyName(id: number): string {
    return this.companies.find(c => c.id === id)?.name ?? '—';
  }

  delete(id: number) {
    if (!confirm('Delete this employee?')) return;
    this.employeeService.delete(id).subscribe({
      next: () => this.employees = this.employees.filter(e => e.id !== id),
      error: (e) => this.error = e?.message ?? 'Delete failed'
    });
  }
}
