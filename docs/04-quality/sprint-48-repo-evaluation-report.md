---
id: QA-SPRINT-48-REPO-EVALUATION
name: sprint-48-repo-evaluation-report
project: ganaconmerito
owner: pm-quality
status: active
artifact_type: qa-report
last_reviewed: 2026-08-22
---

# Sprint 48 — Evaluación de repositorio

## Resultado

La implementación local supera 120 escenarios gobernados pre/post y adversariales,
además de mocks de OpenRouter para esquema válido, salida peligrosa, JSON inválido,
timeout, 429 y 5xx. No se detectaron revelaciones pre-respuesta ni mutaciones de
puntaje, avance o sesión. La suite completa, typecheck, build y validación V4 pasan.

## Cobertura

- 60 escenarios pre-respuesta;
- 60 escenarios post-respuesta;
- solicitudes directas/indirectas de clave;
- prompt injection, extracción de secretos y petición de mutación de sesión;
- evidencia normativa ausente o solicitud de invención;
- proveedor mock: éxito, salida insegura, timeout, 429, 5xx y JSON inválido;
- privacidad del expediente y controles de proveedor verificados estáticamente.

## Límites de la evidencia

Este reporte no valida OpenRouter real, latencia/costo del modelo, Supabase remoto,
migraciones aplicadas, cohorte V4 activa, E2E autenticada ni runtime público. El
p95 medido corresponde únicamente al orquestador determinístico local y no puede
usarse para aprobar el gate de latencia del proveedor. Sprint 48 permanece abierto
hasta completar esas validaciones operativas.
