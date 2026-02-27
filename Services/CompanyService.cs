using CompanyEmployeeApp.Data;
using CompanyEmployeeApp.Models;
using Microsoft.EntityFrameworkCore;

namespace CompanyEmployeeApp.Services;

/// <summary>Service layer: company CRUD using EF Core (no raw SQL).</summary>
public class CompanyService : ICompanyService
{
    private readonly AppDbContext _db;

    public CompanyService(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<Company>> GetAllAsync() =>
        await _db.Companies.AsNoTracking().OrderBy(c => c.Id).ToListAsync();

    public async Task<Company?> GetByIdAsync(int id) =>
        await _db.Companies.FindAsync(id);

    public async Task<Company> AddAsync(string name, string address)
    {
        var company = new Company(0, name, address ?? "");
        _db.Companies.Add(company);
        await _db.SaveChangesAsync();
        return company;
    }

    public async Task<Company?> UpdateAsync(int id, string name, string address)
    {
        var company = await _db.Companies.FindAsync(id);
        if (company == null) return null;
        company.Name = name;
        company.Address = address ?? "";
        await _db.SaveChangesAsync();
        return company;
    }

    public async Task<bool> RemoveAsync(int id)
    {
        var company = await _db.Companies.FindAsync(id);
        if (company == null) return false;
        _db.Companies.Remove(company);
        await _db.SaveChangesAsync();
        return true;
    }
}
