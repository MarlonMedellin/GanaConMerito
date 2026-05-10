Status: legacy-reference
Replaced by: docs/02-delivery/sprint-log.md
Canonical reference: docs/project/status.md; docs/02-delivery/sprint-log.md; docs/02-delivery/change-log.md
Do not use for: priorización actual, estado ejecutivo, roadmap vigente
Last reviewed: 2026-05-10

## Legacy authority context
- Este documento ya NO es fuente ejecutiva porque representa tablero histórico de ejecución Sprint 33.
- Para seguimiento vigente consultar `docs/02-delivery/sprint-log.md` y `docs/project/status.md`.
- Sigue siendo útil para auditoría histórica del plan de ejecución de ese sprint.
---

# Sprint 33 Execution Board

## Objetivo del tablero
Centralizar la ejecucion operativa del Sprint 33 para que cada frente tenga prioridad, responsable funcional, criterio de cierre y dependencias visibles.

## Estado general

- Sprint: 33 — Stabilization, Governance and Runtime Confidence
- Estado: ACTIVE
- Semaforo: amarillo
- Rama: `sprint-33-stabilization-governance`
- Tipo de sprint: estabilizacion tecnica y gobernanza
- Runtime validado en este bloque: no

## Reglas del sprint

1. No abrir features nuevas.
2. No expandir Tutor GCM.
3. No declarar cierre productivo sin runtime.
4. No promover `source_verified` sin anexos oficiales.
5. Priorizar P0/P1 antes de mejoras P2.
6. Separar trabajo repo-only de trabajo que requiere entorno de ejecucion.

## Swimlanes operativas

| Lane | Rol lider | Objetivo | Estado |
|---|---|---|---|
| Delivery Governance | PM-Delivery | ordenar tablero, backlog y cierre | active |
| Backend/API | PM-Backend | desbloquear contratos API y boundaries | pending |
| AppSec | PM-AppSec | cerrar riesgos P0/P1 | pending |
| QA | PM-QA | estabilizar gates y reducir flakiness | pending |
| Data | PM-Data | reducir riesgos de migraciones y concurrencia | pending |
| DevOps | PM-DevOps | fortalecer release, rollback y CI | pending |
| Observability | PM-Observability | alinear tracing, logs y eventos | pending |
| Product/UX | PM-Product / PM-UX | congelar expansion y priorizar UX P0/P1 | pending |

## Priorizacion P0/P1

### P0 — Bloqueantes de confianza

| ID | Frente | Tarea | Resultado esperado | Estado |
|---|---|---|---|---|
| P0-01 | Backend/API | permitir trabajo sobre `src/app/api/**` | Sprint 04 deja de estar blocked | pending |
| P0-02 | AppSec | endurecer callback origin allowlist | callback solo acepta origenes permitidos | pending |
| P0-03 | AppSec | middleware privado con enforcement real | rutas privadas no pasan sin sesion | pending |
| P0-04 | QA | corregir idempotency gate fragil | assertion basada en senal estable | pending |
| P0-05 | Data | definir concurrencia de session advance | invariant de turno unico por sesion | pending |
| P0-06 | DevOps | rollback manual verificable | runbook ejecutable y versionado | pending |

### P1 — Estabilizacion necesaria

| ID | Frente | Tarea | Resultado esperado | Estado |
|---|---|---|---|---|
| P1-01 | Backend/API | envelope `ApiSuccess` / `ApiError` | contrato v1 disponible | in-progress |
| P1-02 | Backend/API | catalogo de error codes | errores consistentes | pending |
| P1-03 | Backend/API | estrategia requestId | trazabilidad por request | pending |
| P1-04 | AppSec | proteger content validate | auth, payload limit y rate limit | pending |
| P1-05 | QA | separar smoke vs forensic | CI menos fragil | in-progress |
| P1-06 | DevOps | healthcheck semantico | health no limitado a `/` | pending |
| P1-07 | Data | gobernanza de migraciones | no repetir prefijos ni drift | pending |
| P1-08 | Observability | logging/tracing policy | requestId en logs y respuestas | pending |

## Secuencia recomendada

1. Consolidar gobernanza repo-only.
2. Crear backlog tecnico P0/P1.
3. Inventariar endpoints y contratos actuales.
4. Preparar tipos base API.
5. Preparar catalogo de error codes.
6. Preparar requestId utility.
7. Corregir documentacion QA y selectors.
8. Crear runbooks DevOps y healthcheck.
9. Definir migraciones y concurrencia.
10. Abrir PRs de codigo pequenos con validacion posterior.

## Definition of Done del Sprint 33

Sprint 33 solo puede cerrarse cuando:

- los P0 tengan PR, fix o aceptacion formal;
- backend/API ya no este blocked;
- QA no dependa de assertions fragiles;
- AppSec P0 este mitigado;
- rollback exista como procedimiento versionado;
- status, sprint-log y backlog queden sincronizados;
- runtime sea validado despues del merge.

## Control repo-only

Este tablero pertenece a la fase repo-only del Sprint 33. No declara ejecucion de pruebas, build, deploy ni validacion runtime.

## Proximo sprint pequeno

Sprint 33.02 — crear backlog P0/P1 ejecutable en `docs/01-product/sprint-33-remediation-backlog.md`.
