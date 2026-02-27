namespace CompanyEmployeeApp.Models;

/// <summary>
/// OOP - ABSTRACTION: Interface defines a contract that entities must follow.
/// Any class implementing IEntity guarantees it has an Id and can be displayed.
/// </summary>
public interface IEntity
{
    int Id { get; }
    string GetDisplayInfo();
}
