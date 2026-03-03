using System.ComponentModel.DataAnnotations;

namespace CompanyEmployeeApp.DTOs;

public class AddDetailsDto
{
    public int EmployeeId { get; init; }

    [Required, MinLength(1), MaxLength(500)]
    [EmailAddress]
    public string Email { get; init; } = "";

    [MaxLength(50)]
    public string? Phone { get; init; }

    [MaxLength(200)]
    public string? Department { get; init; }

    [MaxLength(100)]
    public string? Role { get; init; }

    public DateTime? JoinDate { get; init; }
}
