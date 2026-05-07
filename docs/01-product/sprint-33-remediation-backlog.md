# Sprint 33 Remediation Backlog

## Objetivo
Convertir los hallazgos del control MVP en backlog tecnico ejecutable para Sprint 33, separando bloqueantes P0, estabilizacion P1 y mejoras diferibles P2.

## Estado del backlog

- Sprint: 33
- Estado: ACTIVE
- Semaforo: amarillo
- Alcance: estabilizacion tecnica y gobernanza
- Expansion funcional: congelada
- Runtime validado en este bloque: no

## Reglas de priorizacion

### P0
Bloquea confianza de release, seguridad, datos o QA critica. Debe cerrarse antes de reabrir features.

### P1
No bloquea todo el avance, pero debe quedar resuelto o programado dentro de estabilizacion.

### P2
Mejora importante, pero puede esperar si P0/P1 siguen abiertos.

## Backlog P0

### P0-01 — Desbloquear backend/API en `src/app/api/**`

**Rol sugerido:** PM-Backend / Senior Backend Engineer  
**Problema:** Sprint 04 quedo blocked porque las rutas reales estan en `src/app/api/**` y el prompt anterior prohibia `app/**`.  
**Objetivo:** permitir trabajo controlado sobre handlers API reales.  
**Archivos esperados:**
- `src/app/api/**`
- `src/lib/api/**`
- `docs/03-architecture/api-contract-migration-plan.md`

**Criterios de aceptacion:**
- alcance de backend desbloqueado formalmente;
- endpoints P0 inventariados;
- cambios pequenos por PR;
- no romper frontend ni contratos existentes sin migracion gradual.

### P0-02 — Callback origin allowlist

**Rol sugerido:** PM-AppSec / Application Security Engineer  
**Problema:** riesgo de confianza excesiva en headers forwarded para construir origen de callback.  
**Objetivo:** aceptar solo origenes autorizados por configuracion.  
**Archivos esperados:**
- `src/app/api/auth/callback/route.ts`
- `.env.example`
- `docs/07-compliance/auth-callback-hardening-plan.md`

**Criterios de aceptacion:**
- `AUTH_CALLBACK_ALLOWED_ORIGINS` aplicado;
- origen canonico validado;
- origen desconocido rechazado o normalizado;
- logs sin datos sensibles.

### P0-03 — Middleware privado con enforcement real

**Rol sugerido:** PM-AppSec / Backend Security Engineer  
**Problema:** matcher de rutas privadas sin enforcement suficiente aumenta dependencia de validaciones downstream.  
**Objetivo:** garantizar redirect/login o bloqueo cuando no hay sesion valida.  
**Archivos esperados:**
- `src/middleware.ts`
- `docs/07-compliance/private-route-middleware-policy.md`

**Criterios de aceptacion:**
- rutas privadas no pasan sin sesion;
- comportamiento documentado;
- no se rompe auth legitima;
- pruebas o checklist de validacion definidos.

### P0-04 — Corregir idempotency gate fragil

**Rol sugerido:** PM-QA / Test Automation Engineer  
**Problema:** el gate compara `main.innerText`, susceptible a falsos positivos.  
**Objetivo:** comparar senal estable de pregunta activa.  
**Archivos esperados:**
- `tests/e2e/idempotency-practice-test.spec.ts`
- `docs/04-quality/idempotency-gate-remediation-plan.md`
- `docs/04-quality/playwright-selector-standard.md`

**Criterios de aceptacion:**
- no se usa texto completo de pagina como contrato;
- se usa `questionId`, `data-testid` estable o payload API;
- test mantiene diagnostico util;
- se documenta si requiere Playwright instalado para validar.

### P0-05 — Concurrencia en session advance

**Rol sugerido:** PM-Data / Database Architect  
**Problema:** riesgo de turnos duplicados o saltos ante doble click, retries o tabs multiples.  
**Objetivo:** definir e implementar estrategia atomica/idempotente.  
**Archivos esperados:**
- `supabase/migrations/**`
- `src/app/api/session/advance/route.ts`
- `docs/03-architecture/session-concurrency-adr-002.md`

**Criterios de aceptacion:**
- invariant `(session_id, turn_number)` protegido;
- servidor decide avance;
- cliente no decide `turn_number`;
- retry no duplica estado.

### P0-06 — Rollback manual verificable

**Rol sugerido:** PM-DevOps / Release Manager  
**Problema:** existe politica de rollback, pero falta runbook paso a paso validable.  
**Objetivo:** documentar procedimiento manual minimo y criterios de activacion.  
**Archivos esperados:**
- `docs/05-ops/manual-rollback-runbook.md`
- `docs/06-governance/runtime-release-rollback-policy.md`

**Criterios de aceptacion:**
- pasos concretos para volver a SHA estable;
- incluye validacion posterior;
- incluye condiciones de rollback;
- indica que requiere entorno VPS para ejecutarse.

## Backlog P1

### P1-01 — Tipos base de contrato API

**Rol sugerido:** PM-Architecture / Backend Architect  
**Objetivo:** crear tipos `ApiSuccess`, `ApiError`, `ApiMeta` reutilizables.  
**Archivos esperados:**
- `src/lib/api/contracts.ts`

**Criterios de aceptacion:**
- tipos exportados;
- sin migrar endpoints todavia;
- compatible con migracion gradual.

### P1-02 — Catalogo de error codes

**Rol sugerido:** PM-Backend / API Architect  
**Objetivo:** estandarizar errores por dominio.  
**Archivos esperados:**
- `src/lib/api/error-codes.ts`

**Criterios de aceptacion:**
- codigos por AUTH, SESSION, TUTOR, CONTENT, INTERNAL;
- naming estable;
- sin strings magicos nuevos.

### P1-03 — RequestId utility

**Rol sugerido:** PM-Observability / Backend Engineer  
**Objetivo:** preparar trazabilidad por request.  
**Archivos esperados:**
- `src/lib/api/request-id.ts`
- `docs/03-architecture/observability-tracing-policy.md`

**Criterios de aceptacion:**
- utilidad minima;
- compatible con headers;
- no expone secretos;
- uso futuro documentado.

### P1-04 — Proteger content validate

**Rol sugerido:** PM-AppSec / Backend Security Engineer  
**Objetivo:** limitar superficie de parsing/fuzzing.  
**Archivos esperados:**
- `src/app/api/content/validate/route.ts`
- `docs/07-compliance/security-acceptance-criteria-sprint-33.md`

**Criterios de aceptacion:**
- auth/rol definido;
- payload limit definido;
- rate limit definido;
- errores normalizados.

### P1-05 — Separar smoke vs forensic

**Rol sugerido:** PM-QA / QA Lead  
**Objetivo:** separar pruebas bloqueantes de diagnosticas.  
**Archivos esperados:**
- `docs/06-governance/qa-smoke-vs-forensic-policy.md`
- `docs/04-quality/e2e-contract-map.md`

**Criterios de aceptacion:**
- Gate A/B/C claros;
- forensic no bloquea PR por defecto;
- smoke mantiene senales deterministicas.

### P1-06 — Healthcheck semantico

**Rol sugerido:** PM-DevOps / Reliability Engineer  
**Objetivo:** definir health checks mas utiles que responder `/`.  
**Archivos esperados:**
- `docs/05-ops/semantic-healthcheck-policy.md`

**Criterios de aceptacion:**
- login, auth config, DB reachability y app metadata definidos;
- no exponer secretos;
- apto para postdeploy.

### P1-07 — Gobernanza de migraciones Supabase

**Rol sugerido:** PM-Data / Database Reviewer  
**Objetivo:** prevenir drift, prefijos duplicados y rollback improvisado.  
**Archivos esperados:**
- `docs/03-architecture/supabase-migration-governance.md`

**Criterios de aceptacion:**
- naming rules;
- revision pre-merge;
- rollback strategy;
- manejo de prefijos duplicados.

### P1-08 — Logging y tracing policy

**Rol sugerido:** PM-Observability / Observability Engineer  
**Objetivo:** alinear requestId, logs sanitizados y eventos.  
**Archivos esperados:**
- `docs/03-architecture/observability-tracing-policy.md`

**Criterios de aceptacion:**
- que loggear;
- que no loggear;
- metadata minima;
- relacion con eventos MVP.

## Backlog P2

### P2-01 — Taxonomia de eventos MVP
**Archivos esperados:** `docs/03-architecture/mvp-event-taxonomy.md`

### P2-02 — Fixtures gobernados para QA
**Archivos esperados:** `docs/04-quality/test-fixtures-policy.md`

### P2-03 — UX P0/P1 remediation plan
**Archivos esperados:** `docs/ux/sprint-33-ux-remediation-plan.md`

### P2-04 — Freeze de expansion funcional
**Archivos esperados:** `docs/01-product/feature-freeze-sprint-33.md`

### P2-05 — Matriz de deuda accionable
**Archivos esperados:** `docs/technical-debt/sprint-33-actionable-debt-matrix.md`

## Orden recomendado de ejecucion

1. P0-01 Backend/API scope unlock.
2. P0-04 QA idempotency gate estable.
3. P0-02 Callback origin allowlist.
4. P0-03 Middleware enforcement.
5. P0-05 Session concurrency.
6. P0-06 Rollback manual verificable.
7. P1-01 API base types.
8. P1-02 Error codes.
9. P1-03 RequestId utility.
10. P1-05 Smoke vs forensic.

## Definition of Done del backlog

El backlog se considera listo cuando:
- cada P0 tiene issue o PR asignable;
- cada P1 tiene archivo objetivo y criterio de aceptacion;
- P2 queda explicitamente diferido;
- no hay features nuevas en cola antes de cerrar P0/P1.

## Siguiente sprint pequeno

Sprint 33.03 — mapa de endpoints API en `docs/03-architecture/api-endpoint-contract-map.md`.
