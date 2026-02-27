import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CompanyService } from '../../services/company.service';
import { Company } from '../../models/company.model';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-company-employees',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <h1>Employees at {{ company?.name }}</h1>
    <p><a routerLink="/companies">← Back to Companies</a></p>
    @if (loading) {
      <p>Loading…</p>
    } @else if (company) {
      <table class="table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Salary</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (e of employees; track e.id) {
            <tr>
              <td>{{ e.id }}</td>
              <td>{{ e.fullName }}</td>
              <td>{{ e.salary | currency }}</td>
              <td><a [routerLink]="['/employees', e.id]">View</a></td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
  styles: [`
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
  `]
})
export class CompanyEmployeesComponent implements OnInit {
  company: Company | null = null;
  employees: Employee[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private companyService: CompanyService
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.companyService.getById(id).subscribe({
      next: (c) => { this.company = c; },
      error: () => {}
    });
    this.companyService.getEmployees(id).subscribe({
      next: (list) => { this.employees = list; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
