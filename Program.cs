using CompanyEmployeeApp.Data;
using CompanyEmployeeApp.Services;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configuration: appsettings + environment variables (e.g. in Azure Kubernetes)
// Env vars override: ConnectionStrings__DefaultConnection, CORS__AllowedOrigins, etc.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is required (set via config or env ConnectionStrings__DefaultConnection).");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// CORS: configurable for multiple frontend origins (comma-separated; env: CORS__AllowedOrigins)
var corsValue = builder.Configuration["CORS:AllowedOrigins"] ?? "http://localhost:4200";
var allowedOrigins = corsValue.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.AddControllers();

// Health checks for Kubernetes liveness/readiness (stateless: no in-memory state)
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("db", tags: new[] { "ready" });

// Services: scoped per request (stateless)
builder.Services.AddScoped<ICompanyService, CompanyService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();

var app = builder.Build();

app.UseCors();

// K8s: /health for liveness, /health/ready for readiness (includes DB check)
app.MapHealthChecks("/health", new HealthCheckOptions
{
    Predicate = _ => true
});
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

app.MapGet("/", () => Results.Ok("Company & Employee API"));
app.MapControllers();
app.Run();
