using CompanyEmployeeApp.Models;

namespace CompanyEmployeeApp.Services;

/// <summary>Service layer: company operations (used by Controllers).</summary>
public interface ICompanyService
{
    Task<IReadOnlyList<Company>> GetAllAsync();
    Task<Company?> GetByIdAsync(int id);
    Task<Company> AddAsync(string name, string address);
    Task<Company?> UpdateAsync(int id, string name, string address);
    Task<bool> RemoveAsync(int id);
}
