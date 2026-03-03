using System.Text.RegularExpressions;
using CompanyEmployeeApp.Models;
using Microsoft.EntityFrameworkCore;

namespace CompanyEmployeeApp.Data;

/// <summary>
/// Data layer: EF Core DbContext. Matches PostgreSQL schema:
/// public.companies, public.employees, public.employee_details (lowercase snake_case).
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<EmployeeDetails> EmployeeDetails => Set<EmployeeDetails>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Table names: exactly match your DDL (companies, employees, employee_details)
        modelBuilder.Entity<Company>().ToTable("companies");
        modelBuilder.Entity<Employee>().ToTable("employees");
        modelBuilder.Entity<EmployeeDetails>().ToTable("employee_details");

        // Column names: lowercase snake_case
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entity.GetProperties())
                property.SetColumnName(ToSnakeCase(property.Name));
        }

        // companies.address is TEXT (nullable); when DB has NULL, model gets ""
        modelBuilder.Entity<Company>()
            .Property(c => c.Address)
            .HasConversion<string?>(v => v, v => v ?? "");

        // employee_details.date_of_birth and join_date are DATE (not timestamp)
        modelBuilder.Entity<EmployeeDetails>()
            .Property(d => d.DateOfBirth)
            .HasColumnType("date");
        modelBuilder.Entity<EmployeeDetails>()
            .Property(d => d.JoinDate)
            .HasColumnType("date");

        // Employee <-> EmployeeDetails one-to-one; FK matches fk_employee_details_employee
        modelBuilder.Entity<Employee>()
            .HasOne(e => e.Details)
            .WithOne()
            .HasForeignKey<EmployeeDetails>(d => d.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        // Soft delete: exclude archived employees by default (use IgnoreQueryFilters() to include)
        modelBuilder.Entity<Employee>().HasQueryFilter(e => !e.IsDeleted);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
                entry.Entity.UpdatedAt = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }
        return await base.SaveChangesAsync(cancellationToken);
    }

    static string ToSnakeCase(string name)
    {
        if (string.IsNullOrEmpty(name)) return name;
        var snake = Regex.Replace(name, @"([a-z])([A-Z])", "$1_$2");
        return snake.ToLowerInvariant();
    }
}
