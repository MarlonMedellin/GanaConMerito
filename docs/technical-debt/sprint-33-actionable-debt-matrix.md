# Sprint 33 Actionable Technical Debt Matrix

## Objetivo
Convertir la deuda tecnica detectada en el control MVP en acciones pequenas, priorizadas y ejecutables durante Sprint 33, separando bloqueantes P0, estabilizacion P1 y mejoras P2.

## Estado

- Sprint: 33.24
- Rol lider: PM-TechnicalDebt
- Estado: ACTIVE
- Runtime validado: no
- Tipo: matriz accionable repo-only
- Expansion funcional: congelada

## Criterios de clasificacion

| Prioridad | Significado | Regla de accion |
|---|---|---|
| P0 | bloquea confianza de release, seguridad, datos o QA critica | debe tener fix, PR o accepted-risk formal antes de cerrar Sprint 33 |
| P1 | afecta mantenibilidad, observabilidad o estabilidad | resolver dentro de estabilizacion o dejar programado con owner |
| P2 | mejora deseable, no bloqueante | diferir hasta cerrar P0/P1 |

## Matriz P0

| ID | Area | Deuda | Riesgo | Accion Sprint 33 | Archivos objetivo | Estado |
|---|---|---|---|---|---|---|
| TD-P0-01 | Backend/API | Sprint 04 quedo blocked por no poder tocar `src/app/api/**` | no se corrigen contratos ni errores reales | desbloquear alcance y migrar boundaries P0 | `src/app/api/**`, `src/lib/api/**` | pending |
| TD-P0-02 | AppSec | callback auth confia en origen derivado de headers forwarded | redirect/origin poisoning | implementar allowlist y origen canonico | `src/app/api/auth/callback/route.ts`, `.env.example` | pending |
| TD-P0-03 | AppSec | middleware privado con enforcement insuficiente | acceso anonimo accidental | aplicar control real de rutas privadas | `src/middleware.ts` | pending |
| TD-P0-04 | QA | idempotency gate usa `main.innerText` | falsos positivos/negativos | usar `data-question-id` o payload API | `tests/e2e/idempotency-practice-test.spec.ts`, componentes practice | pending |
| TD-P0-05 | Data | riesgo de concurrencia en `session advance` | turnos duplicados o estado inconsistente | aplicar estrategia atomica/idempotente | `supabase/migrations/**`, `src/app/api/session/advance/route.ts` | pending |
| TD-P0-06 | DevOps | rollback solo documental/manual | recuperacion lenta ante incidente | validar runbook y preparar automatizacion posterior | `docs/05-ops/manual-rollback-runbook.md` | in-progress |

## Matriz P1

| ID | Area | Deuda | Riesgo | Accion Sprint 33 | Archivos objetivo | Estado |
|---|---|---|---|---|---|---|
| TD-P1-01 | Backend/API | formatos de respuesta fragmentados | clientes y tests fragiles | usar `ApiSuccess`, `ApiError`, `ApiMeta` | `src/lib/api/contracts.ts` | in-progress |
| TD-P1-02 | Backend/API | strings de error no canonicos | analitica y UX inconsistentes | usar catalogo de error codes | `src/lib/api/error-codes.ts` | in-progress |
| TD-P1-03 | Observability | falta requestId consistente | debugging dificil | adoptar utility de requestId | `src/lib/api/request-id.ts` | in-progress |
| TD-P1-04 | AppSec | `content/validate` expuesto a abuso de parsing | fuzzing/costo | auth, payload limit y rate limit | `src/app/api/content/validate/route.ts` | pending |
| TD-P1-05 | QA | Playwright sin browsers en CI | gate no ejecutable | agregar readiness y job futuro | `.github/workflows/pr-checks.yml`, `docs/05-ops/playwright-ci-readiness.md` | planned |
| TD-P1-06 | DevOps | healthcheck superficial | falso PASS de release | crear `/api/health` semantico | `src/app/api/health/route.ts`, `docs/05-ops/semantic-healthcheck-policy.md` | planned |
| TD-P1-07 | Data | migraciones sin gobernanza estricta | drift entre ambientes | aplicar reglas y checklist | `supabase/migrations/**`, `docs/03-architecture/supabase-migration-governance.md` | in-progress |
| TD-P1-08 | Observability | eventos de producto no consolidados | decisiones sin datos confiables | instrumentar taxonomia MVP | `docs/03-architecture/mvp-event-taxonomy.md`, `src/lib/analytics/**` | planned |
| TD-P1-09 | Data | retencion de trazas no definida en DB | bloat/costo/exposicion | aplicar politica de retencion | `docs/03-architecture/trace-retention-policy.md`, futuras migraciones | planned |
| TD-P1-10 | UX | fricciones P0/P1 no implementadas | baja activacion | cerrar plan UX antes de features | `docs/ux/sprint-33-ux-remediation-plan.md`, componentes UI | planned |

## Matriz P2

| ID | Area | Deuda | Riesgo | Accion recomendada | Estado |
|---|---|---|---|---|---|
| TD-P2-01 | Product | freeze funcional no formalizado en backlog vivo | feature creep | crear documento de freeze | pending |
| TD-P2-02 | QA | fixtures no gobernados | tests inestables | definir politica de fixtures | pending |
| TD-P2-03 | Observability | dashboards no versionados | monitoreo disperso | crear dashboard spec | pending |
| TD-P2-04 | Data | particionamiento aun no evaluado | degradacion futura | evaluar cuando haya volumen | deferred |
| TD-P2-05 | DevOps | rollback no blue/green/canary | recuperacion manual | plan posterior de automatizacion | deferred |
| TD-P2-06 | Docs | site-docs puede quedar desalineado | drift documental | definir generacion o exclusion | pending |

## Secuencia de pago de deuda

### Bloque A — Contratos base ya iniciados
1. `src/lib/api/contracts.ts`.
2. `src/lib/api/error-codes.ts`.
3. `src/lib/api/request-id.ts`.

### Bloque B — QA estable
1. Agregar selectors P0 en practice.
2. Refactor idempotency gate.
3. Preparar Playwright CI.

### Bloque C — AppSec P0
1. Callback origin allowlist.
2. Middleware privado.
3. Content validate protection.

### Bloque D — Data integrity
1. Confirmar escenario migracion `0008`.
2. Definir estrategia `session advance`.
3. Evaluar indices y retencion.

### Bloque E — Release confidence
1. Healthcheck semantico.
2. SLO/SLI minimo.
3. Rollback validado postmerge.

## Criterios de cierre por deuda

Una deuda se considera cerrada si cumple uno de estos estados:

- `fixed`: cambio aplicado y validado;
- `accepted-risk`: riesgo aceptado formalmente con razon y plazo;
- `deferred`: diferido por prioridad con owner y condicion de reentrada;
- `blocked`: no se puede avanzar sin entorno, permisos o decision humana.

No usar `done` para tareas que solo esten documentadas si requieren implementacion de codigo.

## Riesgos abiertos

- Sin entorno de ejecucion no se puede validar build, tests ni runtime.
- Algunos fixes reales requieren tocar `src/app/api/**`.
- Cambios DB requieren acceso Supabase y estrategia de backup.
- AppSec no debe declararse cerrado sin pruebas funcionales de auth.

## Definition of Done Sprint 33.24

- matriz accionable creada;
- P0/P1/P2 clasificados;
- acciones y archivos objetivo definidos;
- secuencia de pago de deuda documentada;
- estados permitidos definidos;
- no se declara deuda cerrada sin implementacion/validacion real.

## Siguiente sprint pequeno

Sprint 33.25 — checklist pre-merge Sprint 33 en `docs/02-delivery/sprint-33-pre-merge-checklist.md`.
