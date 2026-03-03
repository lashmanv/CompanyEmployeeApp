using CompanyEmployeeApp.DTOs;
using CompanyEmployeeApp.Models;

namespace CompanyEmployeeApp.Services;

/// <summary>Service layer: employee and employee-details operations.</summary>
public interface IEmployeeService
{
    Task<PagedResult<EmployeeListDto>> GetPagedAsync(EmployeeFilterRequest request);
    Task<EmployeeDetailDto?> GetDetailDtoAsync(int id);
    Task<IReadOnlyList<Employee>> GetAllAsync();
    Task<IReadOnlyList<Employee>> GetByCompanyIdAsync(int companyId);
    Task<Employee?> GetByIdAsync(int id);
    Task<Employee?> GetWithDetailsAsync(int id);
    Task<Employee> AddAsync(CreateEmployeeDto dto);
    Task<Employee?> UpdateAsync(int id, CreateEmployeeDto dto);
    Task<EmployeeDetails?> AddDetailsAsync(AddDetailsDto dto);
    Task<bool> ArchiveAsync(int id);
    Task<bool> RemoveAsync(int id);
    Task<IReadOnlyList<string>> GetDistinctDepartmentsAsync();
    Task<IReadOnlyList<string>> GetDistinctRolesAsync();
}
