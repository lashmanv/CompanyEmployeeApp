# Environment variables (stateless, Azure Kubernetes–friendly)

The API is **stateless**: no in-memory session or cache. Any instance can serve any request. Safe for horizontal scaling.

Override via environment variables (e.g. in Kubernetes ConfigMap/Secret or deployment env):

| Variable | Description | Example |
|----------|-------------|---------|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string | `Host=pg;Port=5432;Database=ce;Username=...;Password=...` |
| `CORS__AllowedOrigins` | Comma-separated allowed origins | `https://app.example.com,https://www.example.com` |
| `ASPNETCORE_ENVIRONMENT` | Environment name | `Production` |
| `ASPNETCORE_URLS` | Listen URLs | `http://+:8080` |
| `Logging__LogLevel__Default` | Log level | `Information` |

## Health endpoints (Kubernetes)

- **Liveness**: `GET /health` — use for `livenessProbe` (process alive).
- **Readiness**: `GET /health/ready` — use for `readinessProbe` (DB reachable; don’t send traffic until ready).

Example probes:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```
