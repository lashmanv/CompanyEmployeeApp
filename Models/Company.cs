namespace CompanyEmployeeApp.Models;

/// <summary>
/// OOP - INHERITANCE: Company inherits from BaseEntity (is-a relationship).
/// </summary>
public class Company : BaseEntity
{
    private string _name = string.Empty;   // Encapsulation
    private string _address = string.Empty;

    public string Name
    {
        get => _name;
        set
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Company name cannot be empty.", nameof(value));
            _name = value.Trim();
        }
    }

    public string Address
    {
        get => _address;
        set => _address = value ?? string.Empty;
    }

    /// <summary>
    /// One company has many employees (composition - has-a relationship).
    /// </summary>
    public IList<Employee> Employees { get; } = new List<Employee>();

    public Company(int id, string name, string address = "") : base(id)
    {
        Name = name;
        Address = address;
    }

    /// <summary>
    /// OOP - POLYMORPHISM: Override provides Company-specific display logic.
    /// </summary>
    public override string GetDisplayInfo() =>
        $"Company: {Name} (Id: {Id}) - {Address}";
}
