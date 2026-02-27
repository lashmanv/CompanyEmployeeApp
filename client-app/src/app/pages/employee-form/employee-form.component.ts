import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { CompanyService } from '../../services/company.service';
import { CreateEmployeeRequest } from '../../models/employee.model';
import { Company } from '../../models/company.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1>{{ isEdit ? 'Edit Employee' : 'Add Employee' }}</h1>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="field">
        <label for="firstName">First name *</label>
        <input id="firstName" type="text" formControlName="firstName" />
        @if (form.get('firstName')?.invalid && form.get('firstName')?.touched) {
          <span class="err">Required.</span>
        }
      </div>
      <div class="field">
        <label for="lastName">Last name *</label>
        <input id="lastName" type="text" formControlName="lastName" />
        @if (form.get('lastName')?.invalid && form.get('lastName')?.touched) {
          <span class="err">Required.</span>
        }
      </div>
      <div class="field">
        <label for="salary">Salary *</label>
        <input id="salary" type="number" formControlName="salary" step="0.01" />
        @if (form.get('salary')?.invalid && form.get('salary')?.touched) {
          <span class="err">Must be &ge; 0.</span>
        }
      </div>
      <div class="field">
        <label for="companyId">Company *</label>
        <select id="companyId" formControlName="companyId">
          <option value="">Select company</option>
          @for (c of companies; track c.id) {
            <option [value]="c.id">{{ c.name }}</option>
          }
        </select>
        @if (form.get('companyId')?.invalid && form.get('companyId')?.touched) {
          <span class="err">Required.</span>
        }
      </div>
      <div class="actions">
        <button type="submit" [disabled]="form.invalid || saving">{{ isEdit ? 'Update' : 'Create' }}</button>
        <a routerLink="/employees" class="cancel">Cancel</a>
      </div>
    </form>
    @if (error) {
      <p class="error">{{ error }}</p>
    }
  `,
  styles: [`
    .field { margin-bottom: 1rem; }
    .field label { display: block; margin-bottom: 0.25rem; font-weight: 500; }
    .field input, .field select { width: 100%; max-width: 320px; padding: 0.5rem; }
    .err, .error { color: #b91c1c; font-size: 0.875rem; }
    .actions { margin-top: 1rem; display: flex; gap: 1rem; align-items: center; }
    .actions button { padding: 0.5rem 1rem; background: #1a1a2e; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
    .actions button:disabled { opacity: 0.6; cursor: not-allowed; }
    .cancel { color: #2563eb; text-decoration: none; }
    .cancel:hover { text-decoration: underline; }
  `]
})
export class EmployeeFormComponent implements OnInit {
  form: FormGroup;
  companies: Company[] = [];
  isEdit = false;
  id: number | null = null;
  saving = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private companyService: CompanyService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      salary: [0, [Validators.required, Validators.min(0)]],
      companyId: [null as number | null, Validators.required]
    });
  }

  ngOnInit() {
    this.companyService.getAll().subscribe({ next: (list) => (this.companies = list) });
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.isEdit = true;
      this.employeeService.getById(this.id).subscribe({
        next: (e) => this.form.patchValue({
          firstName: e.firstName,
          lastName: e.lastName,
          salary: e.salary,
          companyId: e.companyId
        }),
        error: () => this.router.navigate(['/employees'])
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    const req: CreateEmployeeRequest = {
      firstName: this.form.value.firstName,
      lastName: this.form.value.lastName,
      salary: Number(this.form.value.salary),
      companyId: Number(this.form.value.companyId)
    };
    this.saving = true;
    this.error = '';
    const next = () => { this.saving = false; this.router.navigate(['/employees']); };
    if (this.isEdit && this.id != null) {
      this.employeeService.update(this.id, req).subscribe({
        next,
        error: (e) => { this.saving = false; this.error = e?.message ?? 'Update failed'; }
      });
    } else {
      this.employeeService.create(req).subscribe({
        next,
        error: (e) => { this.saving = false; this.error = e?.message ?? 'Create failed'; }
      });
    }
  }
}
