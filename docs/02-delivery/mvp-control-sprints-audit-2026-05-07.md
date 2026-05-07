---
id: DEL-MVP-CONTROL-SPRINTS-AUDIT-2026-05-07
name: mvp-control-sprints-audit
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: delivery-audit
last_reviewed: 2026-05-07
---

# Auditoria de las 11 tareas de control MVP — 2026-05-07

## 1. Resumen ejecutivo

Se revisaron las 11 tareas/sprints ejecutadas para el punto de control del MVP. Todas las tareas quedaron incorporadas al repositorio por Pull Request hacia `master`, pero no todas cerraron con estado limpio.

**Estado global del control MVP:** `needs-fix`.

El repositorio queda en una fase de estabilizacion: el core MVP puede seguir fortaleciendose, pero no se recomienda abrir expansion funcional nueva hasta cerrar los bloqueos de backend/API, seguridad, QA, datos, UX y release readiness.

## 2. Sprint actual declarado

**Sprint actual:** Sprint 23 — MVP Control Remediation & Stabilization.

**Objetivo del Sprint 23:** convertir los hallazgos `needs-fix` y `blocked` del control MVP en correcciones ejecutables, sin expandir alcance de producto.

**No alcance del Sprint 23:**
- No abrir nuevas capacidades del Tutor GCM.
- No expandir analitica avanzada.
- No crear funcionalidades editoriales nuevas.
- No avanzar en personalizacion profunda ni LLM real.

## 3. Resultado por tarea/sprint auditado

| Control | PR revisado | Area | Resultado de repo | Estado operativo |
|---|---:|---|---|---|
| Sprint 01 | #51 / #39 | Producto y alcance MVP | Auditoria de direccion MVP y reduccion de alcance integrada. | needs-fix |
| Sprint 02 | #44 / #38 | UX flow audit | Auditoria UX integrada; requiere cerrar fricciones P0/P1. | needs-fix |
| Sprint 03 | #43 / #37 | Frontend architecture | Refactor de `PracticeSession` integrado; mejora mantenibilidad sin cambio de negocio. | approved |
| Sprint 04 | #42 / #41 | Backend/API contracts | Auditoria integrada, pero los cambios de codigo quedaron bloqueados por restriccion de alcance sobre `src/app/api/**`. | blocked |
| Sprint 05 | #45 / #36 | Data model integrity | Auditoria DB integrada; quedan riesgos de migracion duplicada, concurrencia y retencion. | needs-fix |
| Sprint 06 | #50 / #40 | QA/testing gates | Gate QA integrado, pero requiere ajuste por riesgo de falso positivo en idempotencia y entorno Playwright. | needs-fix |
| Sprint 07 | #46 / #35 | Security risk scan | Hardening de `.env.example` integrado; quedan riesgos AppSec sin resolver en codigo. | needs-fix |
| Sprint 08 | #49 / #34 | Observability/analytics | Baseline de observabilidad, logger estructurado e inventario de eventos integrados. | approved |
| Sprint 09 | #48 / #33 | DevOps/release readiness | CI/release checks fortalecidos; falta rollback automatizado y monitoreo postdeploy. | needs-fix |
| Sprint 10 | #47 / #32 | Technical debt register | Registro estrategico de deuda tecnica integrado. | approved |
| Sprint 11 | #52 / #31 | MVP launch governance | Revision final go/no-go integrada; recomienda avance condicionado. | approved |

## 4. Hallazgos criticos de la auditoria

### 4.1 Backend/API sigue siendo el principal bloqueo

La tarea de backend encontro los handlers reales en `src/app/api/**`, pero ese path estaba prohibido por el prompt operativo. Por tanto, el sprint pudo documentar hallazgos, pero no corregir contratos, errores, rate limiting ni boundaries.

**Implicacion:** Sprint 23 debe reabrir backend/API con permiso explicito sobre `src/app/api/**`.

### 4.2 QA quedo integrado pero no suficientemente estable

El control QA convirtio la idempotencia en assertion dura, pero la revision automatica senalo que el assert se basa en texto completo de `main`, no en una senal estable de pregunta. Esto puede generar falsos negativos en CI.

**Implicacion:** el siguiente cambio QA debe comparar `questionId`, data-testid estable o payload API, no texto completo de pagina.

### 4.3 Seguridad requiere codigo, no solo configuracion

El sprint AppSec mejoro `.env.example`, pero los riesgos principales siguen vivos: callback origin allowlist, middleware que permite pass-through, endpoint de validacion sin auth/rate limit y sanitizacion de logs.

**Implicacion:** Sprint 23 debe priorizar correcciones AppSec antes de expansion.

### 4.4 Datos requiere remediacion real

La auditoria DB dejo riesgos concretos: duplicidad de prefijo `0008`, riesgo de concurrencia en `turn_number`, patron delete+insert en opciones y necesidad de retencion/particion para tablas de alto crecimiento.

**Implicacion:** no basta con documentar; se requiere sprint tecnico de migraciones seguras.

### 4.5 Producto queda en GO condicionado

Producto, UX y launch governance coinciden en que el MVP existe, pero debe enfocarse en activacion, completion y retorno. La expansion de features debe congelarse temporalmente.

## 5. Backlog inmediato recomendado para Sprint 23

1. **Backend/API scope unlock**
   - Permitir modificar `src/app/api/**`.
   - Crear envelope comun `ApiSuccess<T>` / `ApiError`.
   - Agregar helper de parseo/validacion y boundary de errores.
   - Rate limit para `tutor/turn`, `session/advance`, `content/upload` y `content/validate`.

2. **Security hardening**
   - Enforce `AUTH_CALLBACK_ALLOWED_ORIGINS`.
   - Middleware con proteccion real de rutas privadas.
   - Auth/rate limit para endpoint de validacion de contenido.
   - Logs sanitizados.

3. **QA stabilization**
   - Instalar browsers Playwright en CI/entorno de ejecucion.
   - Corregir idempotency assertion para usar identificador estable de pregunta.
   - Agregar terminal session test.

4. **Data remediation**
   - Resolver ambiguedad de migracion `0008`.
   - Revisar `advance_session_atomic` para concurrencia.
   - Definir retencion de trazas/eventos.

5. **UX P0/P1**
   - Reducir friccion de onboarding y primer valor.
   - Asegurar estados vacios/loading/error.
   - Mejorar accesibilidad minima.

6. **Release/ops**
   - Definir rollback automatizado o runbook operativo versionado.
   - Agregar health endpoint semantico y monitoreo postdeploy.

## 6. Criterio de cierre para Sprint 23

Sprint 23 puede cerrarse solo si:

- Backend/API deja de estar `blocked` y pasa a `needs-fix` menor o `approved`.
- QA idempotency gate usa senal estable y corre en ambiente con Playwright instalado.
- Riesgos AppSec P0/P1 quedan corregidos o explicitamente aceptados.
- Riesgos DB criticos tienen plan ejecutado o ADR/migracion segura aprobada.
- `docs/project/status.md`, `docs/02-delivery/sprint-log.md` y `docs/01-product/backlog.md` quedan alineados con Sprint 23.

## 7. Decision operativa

**Decision:** avanzar a Sprint 23 de remediacion y estabilizacion.

**Semaforo:** amarillo.

**Lectura PM:** se puede seguir trabajando en el MVP, pero no en expansion. La prioridad es cerrar deuda critica que impide confianza de release y medicion.

## 8. Estado final

**Final Status:** `needs-fix`.
