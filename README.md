# Company & Employee CRUD – Learning Project

A simple **Company** and **Employee** CRUD app for learning and interview prep: **Angular** frontend + **ASP.NET Core 8** Web API + **PostgreSQL**, using **Entity Framework Core** and basic **OOP** in the backend.

**Design:** Minimal layers (Models → Data → Services → Controllers), async throughout, no raw SQL or extra abstractions. Easy to step through and debug.

---

## Run the full-stack app

### 1. Database (PostgreSQL)

Create a database and user, then set the connection string in `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=companyemployee;Username=companyuser;Password=companypass"
}
```

Create the **database** and **tables** yourself. The app expects this exact schema (lowercase snake_case):

**companies**
```sql
CREATE TABLE public.companies (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT
);
```

**employees**
```sql
CREATE TABLE public.employees (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    salary NUMERIC(12,2),
    company_id INT NOT NULL,
    CONSTRAINT fk_employees_company
        FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
);
```

**employee_details**
```sql
CREATE TABLE public.employee_details (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL UNIQUE,
    email TEXT,
    phone TEXT,
    department TEXT,
    date_of_birth DATE,
    join_date DATE,
    CONSTRAINT fk_employee_details_employee
        FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE
);
```

### 2. Start the .NET API

```bash
cd CompanyEmployeeApp
dotnet run
```

API runs at **http://localhost:5297**. Root `/` returns a simple message.

### 3. Start the Angular frontend (optional)

In a second terminal:

```bash
cd CompanyEmployeeApp/client-app
npm install
npm start
```

Open **http://localhost:4200**.

---

## Project structure

```
CompanyEmployeeApp/
├── Models/           # Domain entities (Company, Employee, EmployeeDetails, BaseEntity, IEntity)
├── Data/
│   └── AppDbContext.cs   # EF Core DbContext – only place that talks to the DB
├── Services/         # Business logic; use AppDbContext (async)
│   ├── ICompanyService.cs / CompanyService.cs
│   └── IEmployeeService.cs / EmployeeService.cs
├── Controllers/      # HTTP API; call services only (async)
│   ├── CompaniesController.cs
│   └── EmployeesController.cs
├── Program.cs        # DI: DbContext, services; CORS
├── appsettings.json # Connection string
└── client-app/       # Angular frontend (optional)
```

- **Models:** Entities and interfaces; no DB or HTTP.
- **Data:** `AppDbContext` with `DbSet<Company>`, `DbSet<Employee>`, `DbSet<EmployeeDetails>`. One small Fluent API block for Employee ↔ EmployeeDetails one-to-one.
- **Services:** Async CRUD via `_db.Companies`, `_db.Employees`, `_db.EmployeeDetails` and `SaveChangesAsync()`.
- **Controllers:** Async actions that call service methods and return JSON.

---

## How the app connects to the database

1. **appsettings.json** – `ConnectionStrings:DefaultConnection` (Host, Port, Database, Username, Password).
2. **Program.cs** – `AddDbContext<AppDbContext>(options => options.UseNpgsql(...))` so each request gets a scoped `AppDbContext`.
3. **AppDbContext** – Exposes `Companies`, `Employees`, `EmployeeDetails`. EF maps these to the PostgreSQL tables (by convention).
4. **Services** – Receive `AppDbContext` via DI; use `FindAsync`, `ToListAsync`, `Add`, `Remove`, `SaveChangesAsync`.
5. **Controllers** – Receive `ICompanyService` / `IEmployeeService`; no direct DB access.

**Request flow:** `HTTP → Controller (async) → Service (async) → AppDbContext → PostgreSQL`.

---

## API overview

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/companies` | List all companies |
| GET | `/api/companies/{id}` | Get company by id |
| GET | `/api/companies/{id}/employees` | Get employees of a company |
| POST | `/api/companies` | Create company (body: `{ "name", "address" }`) |
| PUT | `/api/companies/{id}` | Update company |
| DELETE | `/api/companies/{id}` | Delete company |
| GET | `/api/employees` | List all employees |
| GET | `/api/employees/{id}` | Get employee by id |
| GET | `/api/employees/{id}/details` | Get employee with full details |
| GET | `/api/employees/entity-demo` | OOP demo: polymorphic `GetDisplayInfo()` |
| POST | `/api/employees` | Create employee (body: `firstName`, `lastName`, `salary`, `companyId`) |
| PUT | `/api/employees/{id}` | Update employee |
| POST | `/api/employees/details` | Add details to an employee |
| DELETE | `/api/employees/{id}` | Delete employee |

---

## OOP in the backend

- **Encapsulation:** Private fields + public properties with validation (Models).
- **Abstraction:** `IEntity`, `ICompanyService`, `IEmployeeService`; controllers depend on interfaces.
- **Inheritance:** `Company` and `Employee` inherit from `BaseEntity` (Id, `GetDisplayInfo()`).
- **Polymorphism:** Each entity overrides `GetDisplayInfo()`; `GET /api/employees/entity-demo` returns their strings.
- **Composition:** Company has many Employees; Employee has optional EmployeeDetails.
- **Dependency injection:** `Program.cs` registers `AppDbContext`, `CompanyService`, `EmployeeService`; controllers and services receive them via constructors.

---

## Tech stack

- **Backend:** ASP.NET Core 8, Entity Framework Core 8, Npgsql (PostgreSQL).
- **Frontend:** Angular (in `client-app/`).

Use this repo to practice a clean **EF Core + async** CRUD API and to brush up on **OOP** and **layered design** for interviews.
