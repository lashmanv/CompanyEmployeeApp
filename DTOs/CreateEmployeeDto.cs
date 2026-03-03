using System.ComponentModel.DataAnnotations;

namespace CompanyEmployeeApp.DTOs;

public class CreateEmployeeDto
{
    [Required, MinLength(1), MaxLength(200)]
    public string FirstName { get; init; } = "";

    [Required, MinLength(1), MaxLength(200)]
    public string LastName { get; init; } = "";

    [Range(0, double.MaxValue)]
    public decimal Salary { get; init; }

    public int CompanyId { get; init; }
}
