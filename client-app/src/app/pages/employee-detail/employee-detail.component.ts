import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { CompanyService } from '../../services/company.service';
import { Employee } from '../../models/employee.model';
import { Company } from '../../models/company.model';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    @if (loading) {
      <p>Loading…</p>
    } @else if (employee) {
      <h1>{{ employee.fullName }}</h1>
      <p>
        <a [routerLink]="['/employees', 'edit', employee.id]">Edit</a>
        <a routerLink="/employees">← Back to Employees</a>
      </p>
      <section class="card">
        <h2>Basic info</h2>
        <p><strong>Id:</strong> {{ employee.id }}</p>
        <p><strong>Salary:</strong> {{ employee.salary | currency }}</p>
        <p><strong>Company:</strong> {{ companyName(employee.companyId) }}</p>
      </section>
      @if (employee.details) {
        <section class="card">
          <h2>Details</h2>
          <p><strong>Email:</strong> {{ employee.details.email }}</p>
          <p><strong>Phone:</strong> {{ employee.details.phone }}</p>
          <p><strong>Department:</strong> {{ employee.details.department }}</p>
          @if (employee.details.joinDate) {
            <p><strong>Join date:</strong> {{ employee.details.joinDate | date }}</p>
          }
        </section>
      } @else {
        <section class="card">
          <p>No extra details for this employee.</p>
        </section>
      }
    } @else {
      <p>Employee not found.</p>
      <a routerLink="/employees">Back to Employees</a>
    }
  `,
  styles: [`
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-top: 1rem; }
    .card h2 { margin: 0 0 0.5rem 0; font-size: 1rem; }
    .card p { margin: 0.25rem 0; }
    a { margin-right: 1rem; color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
  `]
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null;
  companies: Company[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private companyService: CompanyService
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.companyService.getAll().subscribe({ next: (list) => (this.companies = list) });
    this.employeeService.getWithDetails(id).subscribe({
      next: (e) => { this.employee = e; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  companyName(id: number): string {
    return this.companies.find(c => c.id === id)?.name ?? '—';
  }
}
