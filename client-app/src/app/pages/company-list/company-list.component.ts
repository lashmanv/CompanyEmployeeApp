import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CompanyService } from '../../services/company.service';
import { Company } from '../../models/company.model';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1>Companies</h1>
    <p><a routerLink="/companies/new" class="btn">Add Company</a></p>
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
            <th>Address</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (c of companies; track c.id) {
            <tr>
              <td>{{ c.id }}</td>
              <td>{{ c.name }}</td>
              <td>{{ c.address }}</td>
              <td>
                <a [routerLink]="['/companies', 'edit', c.id]">Edit</a>
                <button type="button" (click)="delete(c.id)" class="link-btn">Delete</button>
                <a [routerLink]="['/companies', c.id, 'employees']">Employees</a>
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
    .link-btn { background: none; border: none; color: #2563eb; cursor: pointer; padding: 0; margin-right: 1rem; }
    .link-btn:hover { text-decoration: underline; }
    a { margin-right: 1rem; color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
  `]
})
export class CompanyListComponent implements OnInit {
  companies: Company[] = [];
  loading = true;
  error = '';

  constructor(private companyService: CompanyService) {}

  ngOnInit() {
    this.companyService.getAll().subscribe({
      next: (list) => {
        this.companies = list;
        this.loading = false;
      },
      error: (err) => {
        this.error = typeof err === 'string' ? err : 'Failed to load companies';
        this.loading = false;
      }
    });
  }

  delete(id: number) {
    if (!confirm('Delete this company?')) return;
    this.companyService.delete(id).subscribe({
      next: () => this.companies = this.companies.filter(c => c.id !== id),
      error: (e) => this.error = e?.message ?? 'Delete failed'
    });
  }
}
