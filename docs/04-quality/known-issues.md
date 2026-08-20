---
id: QUAL-KNOWN-ISSUES
name: known-issues
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: quality
modules: [platform, editorial, auth, data]
tags: [issues, calidad, riesgos]
related:
  - QUAL-DEBT-REGISTER
  - QUAL-QB-LOAD-AUDIT-2026-04-26
  - DEL-QB-LOAD-CLOSE-2026-04-26
last_reviewed: 2026-08-19
---

# Known issues

## Activos
| issue | severidad | owner sugerido | estado | resumen |
|---|---|---|---|---|
| BETA-ISSUE-001 | alta | ops + qa | resuelto | release de codigo `9695d40`, deploy tree y runtime publico verificados y alineados |
| BETA-ISSUE-002 | media | docs + qa | resuelto | gates automatizados postdeploy/API/UI frescos registrados con sus artifacts |
| BETA-ISSUE-003 | media | producto + tutor | aceptado | frente normativo del Tutor sigue en `synthesized_governed_unverified`; aceptable para beta con disclaimers y guardrails |
| QB-ISSUE-004 | media | delivery | resuelto | drift documental entre índice operativo y cierre real de fase ya reconciliado en el snapshot operativo final |
| APP-ISSUE-001 | alta | producto + auth | resuelto | onboarding exige al menos un `Área activa` y quedó validado funcionalmente en runtime desplegado |
| APP-ISSUE-002 | media | platform | resuelto | trazabilidad visible con `commit` + `buildTime` confirmada en `/login` del runtime objetivo |
| APP-ISSUE-003 | media | producto + qa | resuelto | smoke postdeploy + E2E autenticada quedaron confirmadas sobre runtime desplegado |
| APP-ISSUE-004 | alta | backend + producto | resuelto | persistencia terminal (`status`, `ended_at`) quedó validada funcionalmente con sesión cerrada correctamente |
| APP-ISSUE-005 | media | backend + frontend | resuelto | contrato del dashboard validado en runtime desplegado |
| APP-ISSUE-006 | media | frontend + producto | resuelto | clasificación `Fuertes` / `Por reforzar` validada con pruebas y QA funcional |

## Detalle priorizado
- Para Beta Candidate 0.6.0, el release de codigo `9695d40` tiene repo de codigo, deploy y runtime publico verificados y los gates minimos pasan en el entorno real.
- Runtime publico verificado: `9695d40` (`2026-08-19T00:00:00-05:00`).
- HEAD documental actual: `271712f`.
- Ver auditoría específica: `docs/04-quality/question-bank-load-phase-audit-2026-04-26.md`
- Ver corrida base: `docs/04-quality/chromium-qa-run-2026-04-27.md`
- Prioridad inmediata:
  1. preparar la siguiente iteración editorial sobre el release ya etiquetado `v0.6.0-beta.1`
  2. mantener smoke postdeploy y E2E autenticada de `5` turnos como gate obligatorio de futuros deploys
  3. evitar nueva desalineación entre `~/.openclaw/product` y `/opt/gcm/app`
  4. conservar sincronizado el índice operativo del banco al cerrar futuras fases de carga

## Nota de alcance
Estos issues están consolidados con evidencia local de repo, Supabase y runtime. El checklist Beta y los gates de release están cerrados; los riesgos aceptados permanecen explícitos.

## Evidencia local revisada el 2026-04-29
- `package.json` expone runners versionados `qa:smoke:postdeploy`, `qa:e2e:api` y `qa:e2e:ui`.
- smoke local en verde sobre build `9ed03c0`: `artifacts/qa-smoke-postdeploy-smoke-mojhvmwm-qnypgn`.
- corrida API local en verde sobre build `9ed03c0`: `artifacts/qa-e2e-api-mojhwbjw-qoudrd`.
- corrida Chromium local en verde sobre build `9ed03c0`: `artifacts/qa-ui-e2e-ui-mojhxn51-sueeeh`.
- los runners QA ahora generan identidad única por corrida, purga básica de usuarios QA envejecidos y tolerancia a identidades stale ya borradas (`User not found`).
- el dashboard ya entrega bloques separados `currentSession` e `historical` cuando recibe `sessionId`.
- la clasificación `Fuertes` / `Por reforzar` queda validada por QA semántica y por `npm run test:dashboard`.

## Evidencia adicional sobre runtime desplegado

## Evidencia fresca de cierre Beta — 2026-08-20
- Smoke publico: `/opt/gcm/app/artifacts/qa-smoke-postdeploy-smoke-mt0xrhmp-mzt8se`.
- API E2E 5 turnos: `/opt/gcm/app/artifacts/qa-e2e-api-mt0xs2k0-m767ff`.
- UI Chromium 5 turnos: `/opt/gcm/app/artifacts/qa-ui-e2e-ui-mt0xtcsa-u279gx`.
- último cierre triple-verificado de runtime: `/opt/gcm/app` y `/login` quedaron alineados en `701ebcf`.
- `/login` en `http://127.0.0.1:3000/login` mostró `commit=701ebcf` y `buildTime=2026-05-01T18:25:50Z` en el cierre operativo más reciente.
- smoke postdeploy en verde sobre runtime objetivo `:3000`: `artifacts/qa-smoke-postdeploy-smoke-mojxgij3-5h863c`.
- E2E API autenticada de `5` turnos en verde sobre runtime objetivo `:3000`: `artifacts/qa-e2e-api-mojxh6aw-ujwp8m`.
- antes del redeploy final también quedó una E2E UI Chromium verde sobre `:3000`: `artifacts/qa-ui-e2e-ui-mojx7bcg-3fm9rv`.
- revalidación adicional post-hardening QA sobre `:3000`: smoke `artifacts/qa-smoke-postdeploy-smoke-momyxk5z-v4bm9k` y UI Chromium `artifacts/qa-ui-e2e-ui-momyyjmk-niwgkj`.
- validación directa del onboarding server-side: el endpoint rechaza `activeAreas=[]` con `400` y mensaje `Debes indicar al menos un área activa.` en runtime objetivo.
