import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { CompanyService } from '../../services/company.service';
import { ToastService } from '../../services/toast.service';
import {
  EmployeeListItem,
  PagedResult,
  EmployeeFilterParams
} from '../../models/employee.model';
import { Company } from '../../models/company.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, FormsModule],
  template: `
    <div class="page-header">
      <h1>Employees</h1>
      <a routerLink="/employees/new" class="btn btn-primary">Add employee</a>
    </div>

    <div class="toolbar">
      <input
        type="search"
        class="input search"
        placeholder="Search by name, email, company…"
        [ngModel]="search()"
        (ngModelChange)="onSearch($event)"
      />
      <select class="input select" [ngModel]="companyId()" (ngModelChange)="onCompanyChange($event)">
        <option [ngValue]="null">All companies</option>
        @for (c of companies(); track c.id) {
          <option [ngValue]="c.id">{{ c.name }}</option>
        }
      </select>
      <select class="input select" [ngModel]="department()" (ngModelChange)="onDepartmentChange($event)">
        <option value="">All departments</option>
        @for (d of departments(); track d) {
          <option [value]="d">{{ d }}</option>
        }
      </select>
      <select class="input select" [ngModel]="role()" (ngModelChange)="onRoleChange($event)">
        <option value="">All roles</option>
        @for (r of roles(); track r) {
          <option [value]="r">{{ r }}</option>
        }
      </select>
      <div class="toggle-wrap">
        <button
          type="button"
          class="btn btn-segmented"
          [class.active]="!includeArchived()"
          (click)="setIncludeArchived(false)"
        >
          Active
        </button>
        <button
          type="button"
          class="btn btn-segmented"
          [class.active]="includeArchived()"
          (click)="setIncludeArchived(true)"
        >
          Archived
        </button>
      </div>
    </div>

    @if (loading()) {
      <div class="skeleton-table">
        @for (i of [1,2,3,4,5]; track i) {
          <div class="skeleton-row"></div>
        }
      </div>
    } @else {
      @let r = result();
      @if (r && r.totalCount === 0) {
        <div class="empty-state">
          <p class="empty-title">{{ emptyTitle() }}</p>
          <p class="empty-desc">{{ emptyDesc() }}</p>
        </div>
      } @else if (r && r.items.length > 0) {
        <div class="table-wrap">
          <table class="app-table">
            <thead>
              <tr>
                <th><button type="button" class="sort" (click)="setSort('Name')">Name</button></th>
                <th>Salary</th>
                <th><button type="button" class="sort" (click)="setSort('Company')">Company</button></th>
                <th>Department</th>
                <th>Role</th>
                <th><button type="button" class="sort" (click)="setSort('DateCreated')">Created</button></th>
                <th class="col-actions"></th>
              </tr>
            </thead>
            <tbody>
              @for (e of r.items; track e.id) {
                <tr>
                  <td>{{ e.fullName }}</td>
                  <td>{{ e.salary | currency }}</td>
                  <td>{{ e.companyName ?? '—' }}</td>
                  <td>{{ e.department ?? '—' }}</td>
                  <td>{{ e.role ?? '—' }}</td>
                  <td>{{ e.createdAt | date:'shortDate' }}</td>
                  <td class="col-actions">
                    <a [routerLink]="['/employees', e.id]">View</a>
                    <a [routerLink]="['/employees', 'edit', e.id]">Edit</a>
                    @if (!includeArchived()) {
                      <button type="button" class="btn-link" (click)="archive(e.id)">Archive</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <span class="pagination-info">
            {{ (pageNumber() - 1) * pageSize() + 1 }}–{{ Math.min(pageNumber() * pageSize(), r.totalCount) }} of {{ r.totalCount }}
          </span>
          <div class="pagination-btns">
            <button type="button" class="btn btn-secondary" [disabled]="pageNumber() <= 1" (click)="setPage(pageNumber() - 1)">
              Previous
            </button>
            <button type="button" class="btn btn-secondary" [disabled]="pageNumber() >= r.totalPages" (click)="setPage(pageNumber() + 1)">
              Next
            </button>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: calc(var(--space) * 3); }
    .page-header h1 { margin: 0; font-size: 1.25rem; font-weight: 600; }
    .toolbar { display: flex; flex-wrap: wrap; gap: var(--space); margin-bottom: calc(var(--space) * 3); align-items: center; }
    .input { padding: calc(var(--space) * 1.5) calc(var(--space) * 2); border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); color: var(--text-primary); }
    .input.search { min-width: 220px; }
    .input.select { min-width: 140px; }
    .toggle-wrap { display: flex; }
    .btn-segmented { border-radius: 0; }
    .btn-segmented:first-child { border-radius: var(--radius) 0 0 var(--radius); }
    .btn-segmented:last-child { border-radius: 0 var(--radius) var(--radius) 0; }
    .btn-segmented.active { background: var(--accent); color: var(--surface); border-color: var(--accent); }
    .btn { padding: calc(var(--space) * 1.5) calc(var(--space) * 3); border-radius: var(--radius); font-weight: 500; border: 1px solid transparent; }
    .btn-primary { background: var(--accent); color: var(--surface); }
    .btn-primary:hover { filter: brightness(0.95); }
    .btn-secondary { background: var(--surface); color: var(--text-primary); border-color: var(--border); }
    .btn-secondary:hover:not(:disabled) { background: var(--bg); }
    .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-link { background: none; border: none; color: var(--accent); padding: 0; text-decoration: none; }
    .btn-link:hover { text-decoration: underline; }
    .skeleton-table { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
    .skeleton-row { height: 48px; background: linear-gradient(90deg, var(--border) 25%, var(--bg) 50%, var(--border) 75%); background-size: 200% 100%; animation: shimmer 1s infinite; }
    @keyframes shimmer { to { background-position: 200% 0; } }
    .empty-state { text-align: center; padding: calc(var(--space) * 8); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); }
    .empty-title { margin: 0; font-weight: 500; color: var(--text-primary); }
    .empty-desc { margin: calc(var(--space) * 2) 0 0; color: var(--text-secondary); font-size: 13px; }
    .table-wrap { overflow-x: auto; margin-bottom: calc(var(--space) * 3); }
    .app-table { width: 100%; border-collapse: collapse; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); }
    .app-table th, .app-table td { text-align: left; padding: calc(var(--space) * 2) calc(var(--space) * 3); border-bottom: 1px solid var(--border); }
    .app-table th { font-weight: 600; color: var(--text-secondary); font-size: 12px; }
    .app-table tbody tr:hover { background: var(--bg); }
    .app-table tbody tr:last-child td { border-bottom: none; }
    .col-actions { white-space: nowrap; }
    .col-actions a, .col-actions .btn-link { margin-right: calc(var(--space) * 2); }
    .sort { background: none; border: none; padding: 0; font: inherit; color: inherit; cursor: pointer; font-weight: 600; }
    .sort:hover { color: var(--accent); }
    .pagination { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space); }
    .pagination-info { color: var(--text-secondary); font-size: 13px; }
    .pagination-btns { display: flex; gap: var(--space); }
  `]
})
export class EmployeeListComponent implements OnInit {
  readonly Math = Math;

  companies = signal<Company[]>([]);
  departments = signal<string[]>([]);
  roles = signal<string[]>([]);
  result = signal<PagedResult<EmployeeListItem> | null>(null);
  loading = signal(true);

  search = signal('');
  companyId = signal<number | null>(null);
  department = signal('');
  role = signal('');
  includeArchived = signal(false);
  pageNumber = signal(1);
  pageSize = signal(10);
  sortBy = signal('Name');
  sortDirection = signal<'asc' | 'desc'>('asc');

  emptyTitle = computed(() =>
    this.includeArchived() ? 'No archived employees' : 'No employees yet');
  emptyDesc = computed(() =>
    this.includeArchived() ? 'Archive employees from the Active view.' : 'Add your first employee to get started.');

  constructor(
    private employeeService: EmployeeService,
    private companyService: CompanyService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.companyService.getAll().subscribe({ next: (list) => this.companies.set(list) });
    this.employeeService.getDepartments().subscribe({ next: (list) => this.departments.set(list) });
    this.employeeService.getRoles().subscribe({ next: (list) => this.roles.set(list) });
    this.load();
  }

  private load() {
    this.loading.set(true);
    const params: EmployeeFilterParams = {
      search: this.search() || undefined,
      companyId: this.companyId() ?? undefined,
      department: this.department() || undefined,
      role: this.role() || undefined,
      includeArchived: this.includeArchived(),
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
      sortBy: this.sortBy(),
      sortDirection: this.sortDirection()
    };
    this.employeeService.getPaged(params).subscribe({
      next: (r) => { this.result.set(r); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Failed to load employees.'); }
    });
  }

  onSearch(value: string) {
    this.search.set(value);
    this.pageNumber.set(1);
    this.load();
  }
  onCompanyChange(value: number | null) {
    this.companyId.set(value);
    this.pageNumber.set(1);
    this.load();
  }
  onDepartmentChange(value: string) {
    this.department.set(value);
    this.pageNumber.set(1);
    this.load();
  }
  onRoleChange(value: string) {
    this.role.set(value);
    this.pageNumber.set(1);
    this.load();
  }
  setIncludeArchived(archived: boolean) {
    this.includeArchived.set(archived);
    this.pageNumber.set(1);
    this.load();
  }
  setSort(by: string) {
    const same = this.sortBy() === by;
    this.sortBy.set(by);
    this.sortDirection.set(same && this.sortDirection() === 'asc' ? 'desc' : 'asc');
    this.load();
  }
  setPage(p: number) {
    this.pageNumber.set(p);
    this.load();
  }

  archive(id: number) {
    if (!confirm('Archive this employee? You can view them under Archived.')) return;
    this.employeeService.archive(id).subscribe({
      next: () => { this.toast.success('Employee archived.'); this.load(); },
      error: (e) => this.toast.error(e?.message ?? 'Archive failed.')
    });
  }
}
