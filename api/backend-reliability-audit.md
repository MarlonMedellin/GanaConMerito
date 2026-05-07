# Backend/API Reliability Audit Plan (Codex)

## Scope note
En este snapshot del repositorio, los handlers API estan en `src/app/api/**`. Bajo las restricciones operativas recibidas (`app/**` prohibido), no se aplicaron cambios de codigo en handlers.

## Hallazgos clave
- Contratos de error inconsistentes (`error` string vs `ok/errors[]`).
- Validacion heterogenea (zod + validacion manual de query params).
- Falta de rate limiting explicito para endpoints de alto trafico.
- Observabilidad parcial (logs no estructurados, sin request-id).
- Riesgo de latencia en agregacion de trazas (`while` paginado acumulando todo en memoria).

## Plan de endurecimiento recomendado
1. Estandarizar envelope de respuesta:
   - `ApiSuccess<T> = { ok: true, data: T, meta?: Record<string, unknown> }`
   - `ApiError = { ok: false, error: { code: string, message: string, details?: unknown } }`
2. Introducir helper comun de parseo/validacion para `json` y `searchParams`.
3. Agregar boundary global por handler con mapeo de errores consistente.
4. Incorporar rate limiting por ruta (turn, advance, upload).
5. Adoptar logging estructurado con `requestId`, `sessionId`, `profileId`.
6. Definir politica de idempotencia para mutaciones con reintentos.

## Estado
- Auditoria: completada.
- Cambios de codigo backend: bloqueados por alcance de archivos permitido/prohibido.
