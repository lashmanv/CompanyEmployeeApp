using CompanyEmployeeApp.DTOs;
using CompanyEmployeeApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace CompanyEmployeeApp.Controllers;

/// <summary>Controller layer: HTTP API for employees. Thin layer delegating to service.</summary>
[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;

    public EmployeesController(IEmployeeService employeeService) => _employeeService = employeeService;

    /// <summary>Paginated, filterable, sortable list. Query: search, companyId, department, role, includeArchived, pageNumber, pageSize, sortBy, sortDirection.</summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<EmployeeListDto>>> GetPaged(
        [FromQuery] string? search,
        [FromQuery] int? companyId,
        [FromQuery] string? department,
        [FromQuery] string? role,
        [FromQuery] bool includeArchived = false,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "Name",
        [FromQuery] string sortDirection = "asc")
    {
        var request = new EmployeeFilterRequest
        {
            Search = search,
            CompanyId = companyId,
            Department = department,
            Role = role,
            IncludeArchived = includeArchived,
            PageNumber = pageNumber,
            PageSize = pageSize,
            SortBy = sortBy,
            SortDirection = sortDirection
        };
        var result = await _employeeService.GetPagedAsync(request);
        return Ok(result);
    }

    [HttpGet("departments")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetDepartments() =>
        Ok(await _employeeService.GetDistinctDepartmentsAsync());

    [HttpGet("roles")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetRoles() =>
        Ok(await _employeeService.GetDistinctRolesAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EmployeeDetailDto>> GetById(int id)
    {
        var dto = await _employeeService.GetDetailDtoAsync(id);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeDetailDto>> Create([FromBody] CreateEmployeeDto request)
    {
        if (request.CompanyId <= 0)
            return BadRequest("CompanyId is required.");
        var employee = await _employeeService.AddAsync(request);
        var dto = await _employeeService.GetDetailDtoAsync(employee.Id);
        return CreatedAtAction(nameof(GetById), new { id = employee.Id }, dto);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<EmployeeDetailDto>> Update(int id, [FromBody] CreateEmployeeDto request)
    {
        if (request.CompanyId <= 0)
            return BadRequest("CompanyId is required.");
        var employee = await _employeeService.UpdateAsync(id, request);
        if (employee == null) return NotFound();
        var dto = await _employeeService.GetDetailDtoAsync(employee.Id);
        return Ok(dto);
    }

    [HttpPost("{id:int}/archive")]
    public async Task<IActionResult> Archive(int id)
    {
        if (!await _employeeService.ArchiveAsync(id)) return NotFound();
        return NoContent();
    }

    [HttpPost("details")]
    public async Task<IActionResult> AddDetails([FromBody] AddDetailsDto request)
    {
        var details = await _employeeService.AddDetailsAsync(request);
        if (details == null) return NotFound("Employee not found.");
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!await _employeeService.RemoveAsync(id)) return NotFound();
        return NoContent();
    }
}
