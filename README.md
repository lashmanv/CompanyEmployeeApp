# Company & Employee CRUD

A **Company** and **Employee** CRUD app: **Angular** frontend + **ASP.NET Core 8** Web API + **PostgreSQL** with **Entity Framework Core**. Includes soft delete, audit fields, server-side search/filter/sort/pagination, DTOs, validation, health checks, and environment-based configuration for stateless deployment (e.g. Azure Kubernetes).

---

## Run the app

### 1. Configuration

Set the PostgreSQL connection string (and optionally CORS) in `appsettings.json` or via environment variables:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=CompanyEmployeeApp;Username=admin;Password=admin"
  },
  "CORS": {
    "AllowedOrigins": "http://localhost:4200"
  }
}
```

For production/Kubernetes, use env vars (see [ENV.md](ENV.md)): `ConnectionStrings__DefaultConnection`, `CORS__AllowedOrigins`.

### 2. Database

**Option A – Database already exists**  
Apply migrations (creates/updates all tables). From a terminal:

```bash
cd CompanyEmployeeApp
dotnet ef database update
```

(Requires the [EF Core CLI](https://learn.microsoft.com/en-us/ef/core/cli/dotnet); install with `dotnet tool install --global dotnet-ef` if needed.)

**Option B – Create database and tables from scratch**  
From the repo root, using PostgreSQL client tools:

```bash
# Create the database (adjust -U and add -h / -p if needed)
createdb -U postgres CompanyEmployeeApp

# Create all tables via EF Core migrations
cd CompanyEmployeeApp && dotnet ef database update
```

Or with `psql` (use single quotes around the SQL so the name is one argument):

```bash
psql -U postgres -c 'CREATE DATABASE "CompanyEmployeeApp";'
cd CompanyEmployeeApp && dotnet ef database update
```

See **Database structure** below for the full schema.

### 3. Backend API

```bash
cd CompanyEmployeeApp
dotnet run
```

API runs at **http://localhost:5297**. Root `/` returns a simple message. Health: **GET /health** (liveness), **GET /health/ready** (readiness, includes DB).

### 4. Frontend

```bash
cd CompanyEmployeeApp/client-app
npm install
npm start
```

Open **http://localhost:4200**. The app loads the API base URL from **`/config.json`** at startup (default in `public/config.json`). For different environments, override that file (see [client-app/ENV.md](client-app/ENV.md)).

---

## Project structure

```
CompanyEmployeeApp/
├── Controllers/       # HTTP API (thin; call services only)
│   ├── CompaniesController.cs
│   └── EmployeesController.cs
├── DTOs/              # Request/response DTOs and paging
│   ├── PagedResult.cs
│   ├── EmployeeFilterRequest.cs
│   ├── EmployeeListDto.cs, EmployeeDetailDto.cs
│   ├── CreateEmployeeDto.cs
│   └── AddDetailsDto.cs
├── Data/
│   └── AppDbContext.cs   # EF Core DbContext, global filter (soft delete), audit on SaveChanges
├── Migrations/        # EF Core migrations
├── Models/            # Domain entities (Company, Employee, EmployeeDetails, BaseEntity)
├── Services/          # Business logic (ICompanyService, IEmployeeService)
├── Program.cs         # DI, CORS, health checks; config from env
├── appsettings.json   # Connection string, CORS, logging
├── ENV.md             # Environment variables and health probes (K8s)
└── client-app/        # Angular frontend
    ├── public/config.json   # Runtime API URL (default)
    ├── src/app/
    │   ├── pages/     # Home, companies, employees (list/detail/form)
    │   ├── services/   # API, config, toast
    │   └── models/
    └── ENV.md         # Frontend config for K8s
```

- **Controllers** use DTOs for employee list/detail/create/update; companies use request records.
- **Services** are scoped; all persistence goes through `AppDbContext` (stateless, no in-memory session/cache).
- **Frontend** is stateless; API URL comes from `/config.json`.

---

## Database structure

PostgreSQL schema (snake_case). Created/updated by `dotnet ef database update`.

### Table: `companies`

| Column       | Type                     | Description        |
|-------------|--------------------------|--------------------|
| `id`        | integer (PK, identity)   | Primary key        |
| `name`      | text, NOT NULL           | Company name       |
| `address`   | text, NOT NULL           | Address (stored as "" if null) |
| `created_at` | timestamp with time zone | Set on insert      |
| `updated_at` | timestamp with time zone | Set on insert/update |

### Table: `employees`

| Column       | Type                     | Description        |
|-------------|--------------------------|--------------------|
| `id`        | integer (PK, identity)   | Primary key        |
| `first_name`| text, NOT NULL           | First name         |
| `last_name` | text, NOT NULL           | Last name         |
| `salary`    | numeric, NOT NULL        | Salary             |
| `company_id`| integer, NOT NULL        | FK → companies(id), ON DELETE CASCADE |
| `is_deleted`| boolean, NOT NULL        | Soft delete (archived when true) |
| `created_at`| timestamp with time zone | Set on insert      |
| `updated_at`| timestamp with time zone | Set on insert/update |

**Index:** `IX_employees_company_id` on `company_id`.

### Table: `employee_details`

| Column        | Type                     | Description        |
|--------------|--------------------------|--------------------|
| `id`         | integer (PK, identity)   | Primary key        |
| `employee_id`| integer, NOT NULL UNIQUE | FK → employees(id), ON DELETE CASCADE |
| `email`      | text, NOT NULL           | Email              |
| `phone`      | text, NOT NULL           | Phone              |
| `department` | text, NOT NULL           | Department         |
| `role`       | text, NOT NULL           | Role (e.g. Developer, Manager) |
| `date_of_birth` | date, nullable         | Date of birth      |
| `join_date`  | date, nullable           | Join date          |

**Unique index:** `IX_employee_details_employee_id` on `employee_id` (one-to-one with employee).

---

## API overview

### Companies

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/companies` | List all companies |
| GET | `/api/companies/{id}` | Get company by id |
| GET | `/api/companies/{id}/employees` | Get employees of a company (active only) |
| POST | `/api/companies` | Create (body: `{ "name", "address" }`) |
| PUT | `/api/companies/{id}` | Update |
| DELETE | `/api/companies/{id}` | Delete company |

### Employees

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/employees` | **Paged list** (query: `search`, `companyId`, `department`, `role`, `includeArchived`, `pageNumber`, `pageSize`, `sortBy`, `sortDirection`) |
| GET | `/api/employees/departments` | Distinct departments (for filters) |
| GET | `/api/employees/roles` | Distinct roles (for filters) |
| GET | `/api/employees/{id}` | Employee detail (with audit; includes archived) |
| POST | `/api/employees` | Create (body: `CreateEmployeeDto`: `firstName`, `lastName`, `salary`, `companyId`) |
| PUT | `/api/employees/{id}` | Update |
| POST | `/api/employees/{id}/archive` | Soft delete (archive) |
| POST | `/api/employees/details` | Add/update details (body: `AddDetailsDto`: `employeeId`, `email`, `phone`, `department`, `role`, `joinDate`) |
| DELETE | `/api/employees/{id}` | Hard delete |

### Health (Kubernetes)

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/health` | Liveness |
| GET | `/health/ready` | Readiness (includes DB check) |

---

## Features

- **Soft delete**: Employees use `IsDeleted`; list defaults to active; archive via **POST /api/employees/{id}/archive**; filter with `includeArchived=true`.
- **Audit**: `CreatedAt`, `UpdatedAt` on companies and employees (set in `SaveChangesAsync`).
- **Search & filter**: By name/email/company, and by department, role, company (server-side).
- **Sort & pagination**: Server-side (`sortBy`: Name, DateCreated, Company; `sortDirection`, `pageNumber`, `pageSize`).
- **Validation**: DataAnnotations on DTOs; Angular form validation with inline errors.
- **Stateless & configurable**: No in-memory session; config and CORS from appsettings + environment variables for scaling in Azure Kubernetes.

---

## Tech stack

- **Backend:** ASP.NET Core 8, EF Core 8, Npgsql (PostgreSQL), health checks.
- **Frontend:** Angular 19, standalone components; runtime config via `/config.json`.

---

## Configuration and deployment

- **Backend:** See [ENV.md](ENV.md) for environment variables and Kubernetes health probe examples.
- **Frontend:** See [client-app/ENV.md](client-app/ENV.md) for configuring the API URL (e.g. ConfigMap in K8s).
