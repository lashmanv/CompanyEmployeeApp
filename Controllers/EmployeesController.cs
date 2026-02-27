using CompanyEmployeeApp.Models;
using CompanyEmployeeApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace CompanyEmployeeApp.Controllers;

/// <summary>Controller layer: HTTP API for employees. Calls services only.</summary>
[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;

    public EmployeesController(IEmployeeService employeeService) => _employeeService = employeeService;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Employee>>> GetAll() =>
        Ok(await _employeeService.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Employee>> GetById(int id)
    {
        var employee = await _employeeService.GetByIdAsync(id);
        if (employee == null) return NotFound();
        return Ok(employee);
    }

    [HttpGet("{id:int}/details")]
    public async Task<ActionResult<Employee>> GetWithDetails(int id)
    {
        var employee = await _employeeService.GetWithDetailsAsync(id);
        if (employee == null) return NotFound();
        return Ok(employee);
    }

    [HttpPost]
    public async Task<ActionResult<Employee>> Create([FromBody] CreateEmployeeRequest request)
    {
        try
        {
            var employee = await _employeeService.AddAsync(
                request.FirstName, request.LastName, request.Salary, request.CompanyId);
            return CreatedAtAction(nameof(GetById), new { id = employee.Id }, employee);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<Employee>> Update(int id, [FromBody] CreateEmployeeRequest request)
    {
        var employee = await _employeeService.UpdateAsync(
            id, request.FirstName, request.LastName, request.Salary, request.CompanyId);
        if (employee == null) return NotFound();
        return Ok(employee);
    }

    [HttpPost("details")]
    public async Task<ActionResult<EmployeeDetails>> AddDetails([FromBody] AddDetailsRequest request)
    {
        var details = await _employeeService.AddDetailsAsync(
            request.EmployeeId, request.Email, request.Phone ?? "", request.Department ?? "", request.JoinDate);
        if (details == null) return NotFound("Employee not found.");
        return CreatedAtAction(nameof(GetWithDetails), new { id = request.EmployeeId }, details);
    }

    [HttpGet("entity-demo")]
    public async Task<ActionResult<IEnumerable<string>>> EntityDemo()
    {
        var employees = await _employeeService.GetAllAsync();
        return Ok(employees.Select(e => e.GetDisplayInfo()).ToList());
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!await _employeeService.RemoveAsync(id)) return NotFound();
        return NoContent();
    }
}

public record CreateEmployeeRequest(string FirstName, string LastName, decimal Salary, int CompanyId);
public record AddDetailsRequest(int EmployeeId, string Email, string? Phone, string? Department, DateTime? JoinDate);
