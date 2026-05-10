Status: legacy-reference
Replaced by: docs/02-delivery/sprint-log.md
Canonical reference: docs/project/status.md; docs/02-delivery/sprint-log.md
Do not use for: definir sprint vigente o estado operativo actual
Last reviewed: 2026-05-10

## Legacy authority context
- Este plan es histórico del ciclo Sprint 33.
- Para estado vigente consultar `status.md` y `sprint-log.md`.
- Se conserva como evidencia de planeación y estabilización histórica.
---

# Sprint 33 — Stabilization, Governance and Runtime Confidence

## Estado
- Estado operativo: ACTIVE
- Fecha de apertura: 2026-05-07
- Tipo: Sprint tecnico de estabilizacion
- Semaforo: amarillo

## Objetivo
Cerrar deuda tecnica critica y elevar la confianza operativa del MVP antes de reabrir expansion funcional.

## Principios del Sprint 33
- No abrir features nuevas.
- No expandir alcance del Tutor GCM.
- Priorizar confiabilidad sobre velocidad.
- Reducir drift entre documentacion, QA y runtime.
- Resolver riesgos P0/P1 antes de roadmap de crecimiento.

## Frentes autorizados

### 1. Backend/API hardening
Objetivo:
- preparar la estandarizacion de contratos API y boundaries.

Tareas:
- definir envelope `ApiSuccess<T>` y `ApiError`
- definir politica de errores consistente
- documentar estrategia de `requestId`
- documentar plan de rate limiting
- definir rutas P0 para hardening

### 2. QA stabilization
Objetivo:
- reducir falsos positivos y flakiness.

Tareas:
- reemplazar assertions basados en `main.innerText`
- definir selectors estables para preguntas
- separar smoke tests vs forensic tests
- formalizar gates A/B/C

### 3. Security remediation
Objetivo:
- cerrar riesgos AppSec documentados.

Tareas:
- enforce callback origin allowlist
- endurecer middleware privado
- definir sanitizacion de logs
- proteger endpoints administrativos

### 4. Data integrity
Objetivo:
- reducir riesgo operacional en persistencia.

Tareas:
- resolver drift de migraciones
- definir ADR de concurrencia para sesiones
- formalizar retencion de trazas
- preparar roadmap de particionamiento

### 5. Release confidence
Objetivo:
- fortalecer deploy y rollback.

Tareas:
- definir rollback operativo minimo
- formalizar health checks semanticos
- consolidar checklist de release
- alinear CI con gates reales

## Entregables esperados
- ADRs de backend/API.
- ADRs de QA y observabilidad.
- backlog priorizado P0/P1.
- actualizacion de status operativo.
- plan de remediacion de seguridad.
- matriz de deuda tecnica ejecutable.

## Criterio de cierre
Sprint 33 solo puede cerrarse si:
- QA deja de depender de assertions fragiles.
- backend/API deja de estar en estado blocked.
- riesgos AppSec criticos quedan mitigados.
- release workflow tiene rollback documentado.
- documentacion viva queda sincronizada.

## Estado final esperado
- MVP estable.
- governance alineada.
- confianza operativa alta.
- expansion funcional habilitable.
