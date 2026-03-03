namespace CompanyEmployeeApp.Models;

/// <summary>
/// OOP - INHERITANCE: Employee inherits from BaseEntity.
/// Employee has-a EmployeeDetails (composition).
/// </summary>
public class Employee : BaseEntity
{
    private string _firstName = string.Empty;
    private string _lastName = string.Empty;
    private decimal _salary;

    public string FirstName
    {
        get => _firstName;
        set
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("First name cannot be empty.", nameof(value));
            _firstName = value.Trim();
        }
    }

    public string LastName
    {
        get => _lastName;
        set
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Last name cannot be empty.", nameof(value));
            _lastName = value.Trim();
        }
    }

    public string FullName => $"{FirstName} {LastName}";  // Computed property

    public decimal Salary
    {
        get => _salary;
        set
        {
            if (value < 0)
                throw new ArgumentException("Salary cannot be negative.", nameof(value));
            _salary = value;
        }
    }

    public int CompanyId { get; set; }

    /// <summary>Navigation to company (for queries/sorting).</summary>
    public Company? Company { get; set; }

    /// <summary>Soft delete: when true, employee is archived and excluded from default queries.</summary>
    public bool IsDeleted { get; set; }

    /// <summary>
    /// Navigation: Employee has-one EmployeeDetails (composition).
    /// </summary>
    public EmployeeDetails? Details { get; set; }

    public Employee(int id, string firstName, string lastName, decimal salary, int companyId) : base(id)
    {
        FirstName = firstName;
        LastName = lastName;
        Salary = salary;
        CompanyId = companyId;
    }

    public override string GetDisplayInfo() =>
        $"Employee: {FullName} (Id: {Id}) - Salary: {Salary:C}";
}
