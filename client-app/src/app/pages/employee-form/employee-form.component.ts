import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { CompanyService } from '../../services/company.service';
import { ToastService } from '../../services/toast.service';
import { CreateEmployeeRequest } from '../../models/employee.model';
import { Company } from '../../models/company.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterLink],
  template: `
    <h1>{{ isEdit ? 'Edit employee' : 'Add employee' }}</h1>
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">
      <div class="field">
        <label for="firstName">First name</label>
        <input id="firstName" type="text" formControlName="firstName" class="input" />
        @if (form.get('firstName')?.invalid && form.get('firstName')?.touched) {
          <span class="field-error">Required.</span>
        }
      </div>
      <div class="field">
        <label for="lastName">Last name</label>
        <input id="lastName" type="text" formControlName="lastName" class="input" />
        @if (form.get('lastName')?.invalid && form.get('lastName')?.touched) {
          <span class="field-error">Required.</span>
        }
      </div>
      <div class="field">
        <label for="salary">Salary</label>
        <input id="salary" type="number" formControlName="salary" step="0.01" class="input" />
        @if (form.get('salary')?.invalid && form.get('salary')?.touched) {
          <span class="field-error">Must be 0 or greater.</span>
        }
      </div>
      <div class="field">
        <label for="companyId">Company</label>
        <select id="companyId" formControlName="companyId" class="input">
          <option [ngValue]="null">Select company</option>
          @for (c of companies; track c.id) {
            <option [ngValue]="c.id">{{ c.name }}</option>
          }
        </select>
        @if (form.get('companyId')?.invalid && form.get('companyId')?.touched) {
          <span class="field-error">Required.</span>
        }
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving">
          {{ isEdit ? 'Update' : 'Create' }}
        </button>
        <a routerLink="/employees" class="btn btn-secondary">Cancel</a>
      </div>
    </form>
  `,
  styles: [`
    .form { max-width: 400px; }
    .field { margin-bottom: calc(var(--space) * 3); }
    .field label { display: block; margin-bottom: var(--space); font-weight: 500; font-size: 13px; color: var(--text-primary); }
    .input { width: 100%; padding: calc(var(--space) * 1.5) calc(var(--space) * 2); border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); }
    .input.ng-invalid.ng-touched { border-color: var(--text-secondary); }
    .field-error { display: block; margin-top: var(--space); font-size: 12px; color: var(--text-secondary); }
    .form-actions { display: flex; gap: var(--space); margin-top: calc(var(--space) * 4); }
    .btn { padding: calc(var(--space) * 1.5) calc(var(--space) * 3); border-radius: var(--radius); font-weight: 500; border: 1px solid transparent; cursor: pointer; text-decoration: none; display: inline-block; font: inherit; }
    .btn-primary { background: var(--accent); color: var(--surface); }
    .btn-primary:hover:not(:disabled) { filter: brightness(0.95); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: var(--surface); color: var(--text-primary); border-color: var(--border); }
    .btn-secondary:hover { background: var(--bg); }
  `]
})
export class EmployeeFormComponent implements OnInit {
  form: FormGroup;
  companies: Company[] = [];
  isEdit = false;
  id: number | null = null;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private companyService: CompanyService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
      lastName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
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
    const done = () => { this.saving = false; this.router.navigate(['/employees']); };
    const fail = (msg: string) => { this.saving = false; this.toast.error(msg); };
    if (this.isEdit && this.id != null) {
      this.employeeService.update(this.id, req).subscribe({
        next: () => { this.toast.success('Employee updated.'); done(); },
        error: (e) => fail(e?.message ?? 'Update failed.')
      });
    } else {
      this.employeeService.create(req).subscribe({
        next: () => { this.toast.success('Employee created.'); done(); },
        error: (e) => fail(e?.message ?? 'Create failed.')
      });
    }
  }
}
