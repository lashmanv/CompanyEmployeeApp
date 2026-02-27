using CompanyEmployeeApp.Models;

namespace CompanyEmployeeApp.Services;

/// <summary>Service layer: employee and employee-details operations.</summary>
public interface IEmployeeService
{
    Task<IReadOnlyList<Employee>> GetAllAsync();
    Task<IReadOnlyList<Employee>> GetByCompanyIdAsync(int companyId);
    Task<Employee?> GetByIdAsync(int id);
    Task<Employee?> GetWithDetailsAsync(int id);
    Task<Employee> AddAsync(string firstName, string lastName, decimal salary, int companyId);
    Task<Employee?> UpdateAsync(int id, string firstName, string lastName, decimal salary, int companyId);
    Task<EmployeeDetails?> AddDetailsAsync(int employeeId, string email, string phone, string department, DateTime? joinDate);
    Task<bool> RemoveAsync(int id);
}
