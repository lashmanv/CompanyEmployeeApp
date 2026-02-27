namespace CompanyEmployeeApp.Models;

/// <summary>
/// OOP - ENCAPSULATION: EmployeeDetails holds extra info for an Employee.
/// This is a separate class (composition) - Employee "has-a" EmployeeDetails.
/// Implements IEntity so it can be used polymorphically where needed.
/// </summary>
public class EmployeeDetails : IEntity
{
    private string _email = string.Empty;
    private string _phone = string.Empty;
    private string _department = string.Empty;

    public int Id { get; set; }  // Details record id (e.g. 1, 2, 3...)
    public int EmployeeId { get; set; }  // Links to Employee

    public string Email
    {
        get => _email;
        set => _email = value ?? string.Empty;
    }

    public string Phone
    {
        get => _phone;
        set => _phone = value ?? string.Empty;
    }

    public string Department
    {
        get => _department;
        set => _department = value ?? string.Empty;
    }

    // DB: date_of_birth DATE (nullable), join_date DATE (nullable)
    public DateTime? DateOfBirth { get; set; }
    public DateTime? JoinDate { get; set; }

    /// <summary>
    /// IEntity implementation - polymorphism: same method name, different behavior.
    /// </summary>
    public string GetDisplayInfo() =>
        $"Details for EmployeeId {EmployeeId}: {Department} | {Email} | {Phone}";
}
