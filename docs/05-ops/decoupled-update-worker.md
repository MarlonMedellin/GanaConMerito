# Decoupled Update Worker (Sprint 39)

Se desacopló `update.html` para evitar timeouts HTTP y cortes de conexión cuando `gcm-app` se reinicia durante despliegue.

## Flujo

1. `POST /api/ops/update` valida credenciales y acción.
2. El endpoint encola un job persistente y responde `202` con `jobId`.
3. `GET /api/ops/update/status?jobId=...` devuelve estado (`queued|running|success|failed|unknown`).
4. `update.html` hace polling cada 3 segundos hasta `success` o `failed`.

## Endpoints

- `POST /api/ops/update`
- `GET /api/ops/update/status?jobId=<id>`

## Worker versionado

El script `ops/run-update-job.sh` es referencia para ejecutar jobs pendientes desde el host.

- Lee `OPS_DIR/jobs/*.json`
- Actualiza `OPS_DIR/reports/<jobId>.json`
- Guarda log en `OPS_DIR/logs/<jobId>.log`
- Ejecuta pasos según `action`

## Pendiente posterior (fuera de este sprint)

La instalación/configuración operativa del worker en VPS (timer/service/supervisor y hardening) se realizará en un paso independiente.
