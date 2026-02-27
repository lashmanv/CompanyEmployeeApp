using CompanyEmployeeApp.Models;
using CompanyEmployeeApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace CompanyEmployeeApp.Controllers;

/// <summary>Controller layer: HTTP API for companies. Calls services only.</summary>
[ApiController]
[Route("api/[controller]")]
public class CompaniesController : ControllerBase
{
    private readonly ICompanyService _companyService;
    private readonly IEmployeeService _employeeService;

    public CompaniesController(ICompanyService companyService, IEmployeeService employeeService)
    {
        _companyService = companyService;
        _employeeService = employeeService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Company>>> GetAll() =>
        Ok(await _companyService.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Company>> GetById(int id)
    {
        var company = await _companyService.GetByIdAsync(id);
        if (company == null) return NotFound();
        return Ok(company);
    }

    [HttpGet("{id:int}/employees")]
    public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees(int id)
    {
        if (await _companyService.GetByIdAsync(id) == null) return NotFound();
        return Ok(await _employeeService.GetByCompanyIdAsync(id));
    }

    [HttpPost]
    public async Task<ActionResult<Company>> Create([FromBody] CreateCompanyRequest request)
    {
        try
        {
            var company = await _companyService.AddAsync(request.Name, request.Address ?? "");
            return CreatedAtAction(nameof(GetById), new { id = company.Id }, company);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<Company>> Update(int id, [FromBody] CreateCompanyRequest request)
    {
        try
        {
            var company = await _companyService.UpdateAsync(id, request.Name, request.Address ?? "");
            if (company == null) return NotFound();
            return Ok(company);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!await _companyService.RemoveAsync(id)) return NotFound();
        return NoContent();
    }
}

public record CreateCompanyRequest(string Name, string? Address);
