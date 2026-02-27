namespace CompanyEmployeeApp.Models;

/// <summary>
/// OOP - ABSTRACTION & INHERITANCE: Abstract base class that provides common behavior.
/// Cannot be instantiated directly; Company and Employee inherit from it.
/// </summary>
public abstract class BaseEntity : IEntity
{
    private int _id;  // OOP - ENCAPSULATION: private field, access via property

    public int Id
    {
        get => _id;
        internal set  // Encapsulation: same assembly (and EF when loading/saving) can set
        {
            if (value < 0)
                throw new ArgumentException("Id must be non-negative.", nameof(value));
            _id = value;
        }
    }

    protected BaseEntity(int id)
    {
        Id = id;
    }

    /// <summary>
    /// OOP - POLYMORPHISM: Each derived class will override this to provide its own display logic.
    /// </summary>
    public abstract string GetDisplayInfo();
}
