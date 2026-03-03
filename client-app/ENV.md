# Frontend config (stateless, Azure Kubernetes–friendly)

The app is **stateless** and loads config at runtime from **`/config.json`**. Use the same image in every environment; override config by mounting a file or serving a different `config.json`.

## config.json

At startup the app fetches `/config.json` (relative to the app origin). Example:

```json
{
  "apiUrl": "https://api.example.com/api"
}
```

- **Local**: `public/config.json` is copied to the build output; edit it or override when serving.
- **Kubernetes**: Mount a ConfigMap (or generate a file from env) at the path that serves as the app root so `config.json` is available at `/config.json`.

Example ConfigMap and volume mount:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: client-app-config
data:
  config.json: |
    {"apiUrl": "https://your-api-service/api"}
---
# In your deployment (e.g. nginx serving the SPA):
volumeMounts:
  - name: config
    mountPath: /usr/share/nginx/html/config.json
    subPath: config.json
volumes:
  - name: config
    configMap:
      name: client-app-config
```

Or set `apiUrl` from an environment variable using an entrypoint script that writes `config.json` before starting the web server.
