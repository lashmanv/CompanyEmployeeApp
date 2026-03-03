namespace CompanyEmployeeApp.DTOs;

public class EmployeeListDto
{
    public int Id { get; init; }
    public string FirstName { get; init; } = "";
    public string LastName { get; init; } = "";
    public string FullName { get; init; } = "";
    public decimal Salary { get; init; }
    public int CompanyId { get; init; }
    public string? CompanyName { get; init; }
    public string? Department { get; init; }
    public string? Role { get; init; }
    public string? Email { get; init; }
    public DateTime CreatedAt { get; init; }
}
