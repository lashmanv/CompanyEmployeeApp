namespace CompanyEmployeeApp.DTOs;

public class EmployeeDetailDto
{
    public int Id { get; init; }
    public string FirstName { get; init; } = "";
    public string LastName { get; init; } = "";
    public string FullName { get; init; } = "";
    public decimal Salary { get; init; }
    public int CompanyId { get; init; }
    public string? CompanyName { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
    public EmployeeDetailsDto? Details { get; init; }
}

public class EmployeeDetailsDto
{
    public string Email { get; init; } = "";
    public string Phone { get; init; } = "";
    public string Department { get; init; } = "";
    public string Role { get; init; } = "";
    public DateTime? JoinDate { get; init; }
    public DateTime? DateOfBirth { get; init; }
}
