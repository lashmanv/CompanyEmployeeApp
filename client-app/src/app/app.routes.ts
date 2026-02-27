import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CompanyListComponent } from './pages/company-list/company-list.component';
import { CompanyFormComponent } from './pages/company-form/company-form.component';
import { CompanyEmployeesComponent } from './pages/company-employees/company-employees.component';
import { EmployeeListComponent } from './pages/employee-list/employee-list.component';
import { EmployeeFormComponent } from './pages/employee-form/employee-form.component';
import { EmployeeDetailComponent } from './pages/employee-detail/employee-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'companies', component: CompanyListComponent },
  { path: 'companies/new', component: CompanyFormComponent },
  { path: 'companies/edit/:id', component: CompanyFormComponent },
  { path: 'companies/:id/employees', component: CompanyEmployeesComponent },
  { path: 'employees', component: EmployeeListComponent },
  { path: 'employees/new', component: EmployeeFormComponent },
  { path: 'employees/edit/:id', component: EmployeeFormComponent },
  { path: 'employees/:id', component: EmployeeDetailComponent }
];
