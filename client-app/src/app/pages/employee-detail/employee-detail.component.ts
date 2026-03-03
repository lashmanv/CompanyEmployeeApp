import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeDetail } from '../../models/employee.model';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    @if (loading) {
      <div class="skeleton-detail">
        <div class="skeleton-line w60"></div>
        <div class="skeleton-line w40"></div>
        <div class="skeleton-line w80"></div>
      </div>
    } @else if (employee) {
      <div class="page-header">
        <h1>{{ employee.fullName }}</h1>
        <div class="actions">
          <a [routerLink]="['/employees', 'edit', employee.id]" class="btn btn-secondary">Edit</a>
          <a routerLink="/employees" class="btn btn-secondary">← Back to employees</a>
        </div>
      </div>

      <section class="card">
        <h2 class="card-title">Basic info</h2>
        <dl class="detail-list">
          <dt>Salary</dt>
          <dd>{{ employee.salary | currency }}</dd>
          <dt>Company</dt>
          <dd>{{ employee.companyName ?? '—' }}</dd>
        </dl>
      </section>

      @if (employee.details) {
        <section class="card">
          <h2 class="card-title">Details</h2>
          <dl class="detail-list">
            <dt>Email</dt>
            <dd>{{ employee.details.email }}</dd>
            <dt>Phone</dt>
            <dd>{{ employee.details.phone || '—' }}</dd>
            <dt>Department</dt>
            <dd>{{ employee.details.department || '—' }}</dd>
            <dt>Role</dt>
            <dd>{{ employee.details.role || '—' }}</dd>
            @if (employee.details.joinDate) {
              <dt>Join date</dt>
              <dd>{{ employee.details.joinDate | date:'mediumDate' }}</dd>
            }
          </dl>
        </section>
      }

      <section class="card audit">
        <h2 class="card-title">Audit</h2>
        <dl class="detail-list">
          <dt>Created</dt>
          <dd>{{ employee.createdAt | date:'medium' }}</dd>
          <dt>Updated</dt>
          <dd>{{ employee.updatedAt | date:'medium' }}</dd>
        </dl>
      </section>
    } @else {
      <div class="empty-state">
        <p class="empty-title">Employee not found</p>
        <a routerLink="/employees">Back to employees</a>
      </div>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space); margin-bottom: calc(var(--space) * 3); }
    .page-header h1 { margin: 0; font-size: 1.25rem; font-weight: 600; }
    .actions { display: flex; gap: var(--space); }
    .btn { padding: calc(var(--space) * 1.5) calc(var(--space) * 3); border-radius: var(--radius); font-weight: 500; border: 1px solid var(--border); background: var(--surface); color: var(--text-primary); text-decoration: none; display: inline-block; }
    .btn:hover { background: var(--bg); }
    .btn-secondary { border-color: var(--border); }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: calc(var(--space) * 3); margin-bottom: calc(var(--space) * 2); }
    .card-title { margin: 0 0 calc(var(--space) * 2); font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); }
    .detail-list { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: calc(var(--space) * 1) calc(var(--space) * 3); }
    .detail-list dt { color: var(--text-secondary); font-weight: 500; }
    .detail-list dd { margin: 0; }
    .skeleton-detail { padding: calc(var(--space) * 3); }
    .skeleton-line { height: 1rem; background: var(--border); border-radius: var(--radius); margin-bottom: var(--space); }
    .skeleton-line.w40 { width: 40%; }
    .skeleton-line.w60 { width: 60%; }
    .skeleton-line.w80 { width: 80%; }
    .empty-state { padding: calc(var(--space) * 6); text-align: center; }
    .empty-title { margin: 0 0 var(--space); font-weight: 500; }
  `]
})
export class EmployeeDetailComponent implements OnInit {
  employee: EmployeeDetail | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeService
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.employeeService.getById(id).subscribe({
      next: (e) => { this.employee = e; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
