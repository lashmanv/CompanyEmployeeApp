namespace CompanyEmployeeApp.DTOs;

/// <summary>Query parameters for employee list: search, filters, sort, pagination.</summary>
public class EmployeeFilterRequest
{
    public string? Search { get; init; }
    public int? CompanyId { get; init; }
    public string? Department { get; init; }
    public string? Role { get; init; }
    public bool IncludeArchived { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string SortBy { get; init; } = "Name";
    public string SortDirection { get; init; } = "asc";
}
