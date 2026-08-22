---
id: ADR-OPENROUTER-SHADOW-PROVIDER-001
name: openrouter-shadow-provider-decision
project: ganaconmerito
owner: ai-backend
status: accepted
artifact_type: architecture-decision
last_reviewed: 2026-08-22
---

# Decisión de modelo y proveedor para OpenRouter shadow

## Decisión inicial

- modelo exacto: `openai/gpt-4o-2024-08-06`;
- proveedor exacto: `azure`;
- endpoint: `https://openrouter.ai/api/v1/chat/completions`;
- modo: shadow no visible;
- sitio: `https://ganaconmerito.com`;
- título: `GanaConMerito Tutor Shadow`.

La aplicación rechaza cualquier modelo o proveedor distinto aunque aparezca en
las variables de entorno. El cambio de allowlist exige código, pruebas y una nueva
decisión explícita.

## Razón

La versión fijada soporta JSON Schema/structured outputs. La consulta del endpoint
público ZDR de OpenRouter del 2026-08-22 incluyó esta versión mediante Azure con
`response_format` y `structured_outputs`. Se usa una versión fechada para evitar
el drift del alias `openai/gpt-4o`.

El payload fija `only/order=["azure"]`, `allow_fallbacks=false`,
`require_parameters=true`, `data_collection="deny"` y `zdr=true`. No habilita
plugins, herramientas, búsqueda ni response healing.

## Límite

Esta decisión no demuestra que la cuenta o clave estén configuradas ni que una
llamada real haya pasado. Antes de habilitar shadow deben revocarse claves expuestas,
crear una clave nueva con límite de gasto, aplicar la migración de métricas y
ejecutar una prueba controlada sin copiar secretos a Git, logs o conversaciones.
