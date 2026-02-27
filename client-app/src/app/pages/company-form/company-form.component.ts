import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService } from '../../services/company.service';
import { CreateCompanyRequest } from '../../models/company.model';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1>{{ isEdit ? 'Edit Company' : 'Add Company' }}</h1>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="field">
        <label for="name">Name *</label>
        <input id="name" type="text" formControlName="name" />
        @if (form.get('name')?.invalid && form.get('name')?.touched) {
          <span class="err">Name is required.</span>
        }
      </div>
      <div class="field">
        <label for="address">Address</label>
        <input id="address" type="text" formControlName="address" />
      </div>
      <div class="actions">
        <button type="submit" [disabled]="form.invalid || saving">{{ isEdit ? 'Update' : 'Create' }}</button>
        <a routerLink="/companies" class="cancel">Cancel</a>
      </div>
    </form>
    @if (error) {
      <p class="error">{{ error }}</p>
    }
  `,
  styles: [`
    .field { margin-bottom: 1rem; }
    .field label { display: block; margin-bottom: 0.25rem; font-weight: 500; }
    .field input { width: 100%; max-width: 320px; padding: 0.5rem; }
    .err, .error { color: #b91c1c; font-size: 0.875rem; }
    .actions { margin-top: 1rem; display: flex; gap: 1rem; align-items: center; }
    .actions button { padding: 0.5rem 1rem; background: #1a1a2e; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
    .actions button:disabled { opacity: 0.6; cursor: not-allowed; }
    .cancel { color: #2563eb; text-decoration: none; }
    .cancel:hover { text-decoration: underline; }
  `]
})
export class CompanyFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  id: number | null = null;
  saving = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      address: ['']
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.isEdit = true;
      this.companyService.getById(this.id).subscribe({
        next: (c) => this.form.patchValue({ name: c.name, address: c.address }),
        error: () => this.router.navigate(['/companies'])
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    const req: CreateCompanyRequest = {
      name: this.form.value.name,
      address: this.form.value.address ?? ''
    };
    this.saving = true;
    this.error = '';
    const next = () => {
      this.saving = false;
      this.router.navigate(['/companies']);
    };
    if (this.isEdit && this.id != null) {
      this.companyService.update(this.id, req).subscribe({ next, error: (e) => { this.saving = false; this.error = e?.message ?? 'Update failed'; } });
    } else {
      this.companyService.create(req).subscribe({ next, error: (e) => { this.saving = false; this.error = e?.message ?? 'Create failed'; } });
    }
  }
}
