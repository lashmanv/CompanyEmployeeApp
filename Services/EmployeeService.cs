using CompanyEmployeeApp.Data;
using CompanyEmployeeApp.DTOs;
using CompanyEmployeeApp.Models;
using Microsoft.EntityFrameworkCore;

namespace CompanyEmployeeApp.Services;

/// <summary>Service layer: employee CRUD, details, search, filter, sort, pagination, soft delete.</summary>
public class EmployeeService : IEmployeeService
{
    private readonly AppDbContext _db;

    public EmployeeService(AppDbContext db) => _db = db;

    public async Task<PagedResult<EmployeeListDto>> GetPagedAsync(EmployeeFilterRequest request)
    {
        var query = _db.Employees.AsNoTracking()
            .Include(e => e.Company)
            .Include(e => e.Details)
            .AsQueryable();

        if (request.IncludeArchived)
            query = query.IgnoreQueryFilters();
        else
            query = query.Where(e => !e.IsDeleted);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim().ToLower();
            query = query.Where(e =>
                (e.FirstName + " " + e.LastName).ToLower().Contains(term) ||
                (e.LastName + " " + e.FirstName).ToLower().Contains(term) ||
                (e.Details != null && e.Details.Email.ToLower().Contains(term)) ||
                (e.Company != null && e.Company.Name.ToLower().Contains(term)));
        }

        if (request.CompanyId.HasValue && request.CompanyId.Value > 0)
            query = query.Where(e => e.CompanyId == request.CompanyId.Value);

        if (!string.IsNullOrWhiteSpace(request.Department))
            query = query.Where(e => e.Details != null && e.Details.Department == request.Department);

        if (!string.IsNullOrWhiteSpace(request.Role))
            query = query.Where(e => e.Details != null && e.Details.Role == request.Role);

        var totalCount = await query.CountAsync();

        query = request.SortBy?.ToLowerInvariant() switch
        {
            "datecreated" or "createdat" => request.SortDirection?.Equals("desc", StringComparison.OrdinalIgnoreCase) == true
                ? query.OrderByDescending(e => e.CreatedAt)
                : query.OrderBy(e => e.CreatedAt),
            "company" => request.SortDirection?.Equals("desc", StringComparison.OrdinalIgnoreCase) == true
                ? query.OrderByDescending(e => e.Company != null ? e.Company.Name : "")
                : query.OrderBy(e => e.Company != null ? e.Company.Name : ""),
            _ => request.SortDirection?.Equals("desc", StringComparison.OrdinalIgnoreCase) == true
                ? query.OrderByDescending(e => e.LastName).ThenByDescending(e => e.FirstName)
                : query.OrderBy(e => e.LastName).ThenBy(e => e.FirstName)
        };

        var pageNumber = Math.Max(1, request.PageNumber);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new EmployeeListDto
            {
                Id = e.Id,
                FirstName = e.FirstName,
                LastName = e.LastName,
                FullName = e.FirstName + " " + e.LastName,
                Salary = e.Salary,
                CompanyId = e.CompanyId,
                CompanyName = e.Company != null ? e.Company.Name : null,
                Department = e.Details != null ? e.Details.Department : null,
                Role = e.Details != null ? e.Details.Role : null,
                Email = e.Details != null ? e.Details.Email : null,
                CreatedAt = e.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<EmployeeListDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<EmployeeDetailDto?> GetDetailDtoAsync(int id)
    {
        var employee = await _db.Employees.AsNoTracking()
            .IgnoreQueryFilters()
            .Include(e => e.Company)
            .Include(e => e.Details)
            .FirstOrDefaultAsync(e => e.Id == id);
        if (employee == null) return null;

        return new EmployeeDetailDto
        {
            Id = employee.Id,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            FullName = employee.FullName,
            Salary = employee.Salary,
            CompanyId = employee.CompanyId,
            CompanyName = employee.Company?.Name,
            CreatedAt = employee.CreatedAt,
            UpdatedAt = employee.UpdatedAt,
            Details = employee.Details == null ? null : new EmployeeDetailsDto
            {
                Email = employee.Details.Email,
                Phone = employee.Details.Phone,
                Department = employee.Details.Department,
                Role = employee.Details.Role,
                JoinDate = employee.Details.JoinDate,
                DateOfBirth = employee.Details.DateOfBirth
            }
        };
    }

    public async Task<IReadOnlyList<Employee>> GetAllAsync() =>
        await _db.Employees.AsNoTracking().OrderBy(e => e.Id).ToListAsync();

    public async Task<IReadOnlyList<Employee>> GetByCompanyIdAsync(int companyId) =>
        await _db.Employees.AsNoTracking().Where(e => e.CompanyId == companyId).OrderBy(e => e.Id).ToListAsync();

    public async Task<Employee?> GetByIdAsync(int id) =>
        await _db.Employees.FindAsync(id);

    public async Task<Employee?> GetWithDetailsAsync(int id)
    {
        var employee = await _db.Employees.FindAsync(id);
        if (employee == null) return null;
        await _db.Entry(employee).Reference(e => e.Details).LoadAsync();
        return employee;
    }

    public async Task<Employee> AddAsync(CreateEmployeeDto dto)
    {
        var employee = new Employee(0, dto.FirstName.Trim(), dto.LastName.Trim(), dto.Salary, dto.CompanyId);
        _db.Employees.Add(employee);
        await _db.SaveChangesAsync();
        return employee;
    }

    public async Task<Employee?> UpdateAsync(int id, CreateEmployeeDto dto)
    {
        var employee = await _db.Employees.FindAsync(id);
        if (employee == null) return null;
        employee.FirstName = dto.FirstName.Trim();
        employee.LastName = dto.LastName.Trim();
        employee.Salary = dto.Salary;
        employee.CompanyId = dto.CompanyId;
        await _db.SaveChangesAsync();
        return employee;
    }

    public async Task<EmployeeDetails?> AddDetailsAsync(AddDetailsDto dto)
    {
        var employee = await _db.Employees.FindAsync(dto.EmployeeId);
        if (employee == null) return null;
        var detail = new EmployeeDetails
        {
            EmployeeId = dto.EmployeeId,
            Email = dto.Email.Trim(),
            Phone = dto.Phone ?? "",
            Department = dto.Department ?? "",
            Role = dto.Role ?? "",
            DateOfBirth = null,
            JoinDate = dto.JoinDate?.Date
        };
        _db.EmployeeDetails.Add(detail);
        await _db.SaveChangesAsync();
        return detail;
    }

    public async Task<bool> ArchiveAsync(int id)
    {
        var employee = await _db.Employees.IgnoreQueryFilters().FirstOrDefaultAsync(e => e.Id == id);
        if (employee == null) return false;
        employee.IsDeleted = true;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveAsync(int id)
    {
        var employee = await _db.Employees.FindAsync(id);
        if (employee == null) return false;
        _db.Employees.Remove(employee);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<IReadOnlyList<string>> GetDistinctDepartmentsAsync() =>
        await _db.EmployeeDetails.AsNoTracking()
            .Where(d => d.Department != null && d.Department != "")
            .Select(d => d.Department)
            .Distinct()
            .OrderBy(x => x)
            .ToListAsync();

    public async Task<IReadOnlyList<string>> GetDistinctRolesAsync() =>
        await _db.EmployeeDetails.AsNoTracking()
            .Where(d => d.Role != null && d.Role != "")
            .Select(d => d.Role)
            .Distinct()
            .OrderBy(x => x)
            .ToListAsync();
}
