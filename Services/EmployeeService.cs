using CompanyEmployeeApp.Data;
using CompanyEmployeeApp.Models;
using Microsoft.EntityFrameworkCore;

namespace CompanyEmployeeApp.Services;

/// <summary>Service layer: employee CRUD and details using EF Core.</summary>
public class EmployeeService : IEmployeeService
{
    private readonly AppDbContext _db;

    public EmployeeService(AppDbContext db) => _db = db;

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
        employee.Details = await _db.EmployeeDetails.AsNoTracking()
            .FirstOrDefaultAsync(d => d.EmployeeId == id);
        return employee;
    }

    public async Task<Employee> AddAsync(string firstName, string lastName, decimal salary, int companyId)
    {
        var employee = new Employee(0, firstName, lastName, salary, companyId);
        _db.Employees.Add(employee);
        await _db.SaveChangesAsync();
        return employee;
    }

    public async Task<Employee?> UpdateAsync(int id, string firstName, string lastName, decimal salary, int companyId)
    {
        var employee = await _db.Employees.FindAsync(id);
        if (employee == null) return null;
        employee.FirstName = firstName;
        employee.LastName = lastName;
        employee.Salary = salary;
        employee.CompanyId = companyId;
        await _db.SaveChangesAsync();
        return employee;
    }

    public async Task<EmployeeDetails?> AddDetailsAsync(int employeeId, string email, string phone, string department, DateTime? joinDate)
    {
        if (await _db.Employees.FindAsync(employeeId) == null) return null;
        // Schema: date_of_birth, join_date are DATE (nullable); store date part only
        var detail = new EmployeeDetails
        {
            EmployeeId = employeeId,
            Email = email ?? "",
            Phone = phone ?? "",
            Department = department ?? "",
            DateOfBirth = null,
            JoinDate = joinDate.HasValue ? joinDate.Value.Date : null
        };
        _db.EmployeeDetails.Add(detail);
        await _db.SaveChangesAsync();
        return detail;
    }

    public async Task<bool> RemoveAsync(int id)
    {
        var employee = await _db.Employees.FindAsync(id);
        if (employee == null) return false;
        _db.Employees.Remove(employee);
        await _db.SaveChangesAsync();
        return true;
    }
}
