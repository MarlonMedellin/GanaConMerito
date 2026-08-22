---
id: DEL-CHANGE-LOG
name: change-log
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: delivery
modules: [core, platform]
tags: [changelog, cambios, entregas]
related:
  - DEL-SPRINT-LOG
last_reviewed: 2026-08-22
---

## Document control
- Status: operational
- Owner: PM-Governance
- Last reviewed: 2026-08-11
- Related files: docs/project/status.md, docs/02-delivery/sprint-log.md, docs/02-delivery/change-log.md, docs/project/canonical-docs.md
- Update trigger: governance, delivery, documentation, drift

## 2026-08-22 — Dominio canonico de runtime y QA
- tipo: ops+qa+docs
- modulo: runtime/e2e/auth
- resumen: `https://ganaconmerito.com` pasa a ser la URL publica canonica. Se
  actualizan los valores predeterminados de Playwright, scripts de QA, filtros de
  host, callbacks y documentación operativa. Las URLs anteriores se conservan solo
  donde forman parte de evidencia histórica.
- agente: Codex
- via: Codex Desktop / repositorio local
- contributor: Marlon Medellin
- environment: WSL local / master / runtime publico
- validacion: smoke público en el dominio nuevo y suites locales al cierre
- runtime-verified: parcial; `/login` y configuración pública responden, sin deploy nuevo
- relacionados: playwright.config.ts, tests/e2e/, scripts/, .env.example, AGENTS.md,
  docs/05-ops/runtime-and-release.md

## 2026-08-22 — Sprint 48 Bloque 1 en repo
- tipo: database+content+test
- modulo: question-bank-v4/import
- resumen: Se reemplaza el importador narrativo por un plan reproducible que comparte
  dry-run y apply, exige aprobación machine-checkable, calcula hashes y usa una RPC
  idempotente service-only. Toda fila queda `draft`, inactiva y no publicada.
- agente: Codex
- via: Codex Desktop / repositorio local
- contributor: Marlon Medellin
- environment: WSL local / master
- validacion: plan dry-run completo al corte online, contrato SQL, validador V4,
  typecheck y suite local PASS; el conteo/hash se recalculan ante cada lote cerrado
- runtime-verified: no; `0021` y la importación no se aplicaron en Supabase
- relacionados: scripts/lib/v4-import-plan.ts, scripts/import-question-bank-v4.ts,
  scripts/v4-import-plan.test.ts, supabase/migrations/0021_upsert_question_bank_v4.sql
- limitaciones: los lotes editoriales abiertos no se consideran aprobados ni importables;
  Gate 1 remoto sigue abierto hasta aplicar/verificar `0021` en Supabase.

## 2026-08-22 — Sprint 48 Bloque 0 en repo
- tipo: security+database+api+test
- modulo: question-bank/session/tutor/dashboard
- resumen: Se implementa la frontera P0 server-only. El payload pre-respuesta deja
  de consultar o serializar clave/explicación, la opción pasa a ser obligatoria y
  el contrato posterior se entrega después de persistir. La migración `0020` revoca
  tablas, vistas y RPC sensibles a roles cliente y conserva acceso de `service_role`.
- agente: Codex
- via: Codex Desktop / repositorio local
- contributor: Marlon Medellin
- environment: WSL local / master
- validacion: typecheck, `test:security`, Tutor, dashboard y `git diff --check` PASS; suite completa/build pendientes de cierre
- runtime-verified: no; migración y deploy no aplicados
- relacionados: supabase/migrations/0020_secure_question_answer_boundary.sql, src/app/api/session/item/route.ts, src/app/api/session/advance/route.ts, scripts/verify-question-bank-boundary.ts
- limitaciones: la exposición pública actual continúa hasta desplegar código y aplicar la migración en orden controlado.

## 2026-08-22
- tipo: audit+prd+delivery+security
- modulo: question-bank-v4/supabase/practice/tutor/openrouter
- resumen: Se sincroniza la base de `master` a `8c4be39`, se audita la estructura completa
  del banco V4 sin revisar reactivos individuales y se define Sprint 48. Se verifica
  que existen 110 V4 locales pero solo 1 V4 activa en Supabase publico, y se identifica
  como P0 la lectura anonima de claves/explicaciones y el `rationale` pre-respuesta.
  OpenRouter queda aprobado solo para shadow gobernado, no para canary productivo.
- agente: Codex
- via: repositorio local sincronizado + lecturas publicas GitHub/runtime/Supabase
- contributor: Marlon Medellin
- environment: WSL local / GitHub / runtime publico
- validacion: `npm run content:validate:v4`, smoke runtime publico y auditoria estructural/contratos; validaciones documentales al cierre
- runtime-verified: parcial; endpoints publicos PASS sobre `e43f612`, sin VPS admin ni E2E autenticada
- relacionados: docs/01-product/prd-v4-tutor-ai-openrouter.md, docs/02-delivery/sprint-48-v4-runtime-secure-tutor-shadow.md, docs/project/status.md
- limitaciones: sin cambios de codigo, migraciones, importacion, deploy o inspeccion individual de reactivos; huella SSH pendiente de confirmacion.

## 2026-08-21
- tipo: feat+content+database
- modulo: question-bank-v4
- resumen: Se ejecuta la base técnica del PRD V4: contrato Zod estricto y validación contra catálogos, importador dry-run con rechazo de ítems sin APPROVED, ejemplo V4 completo y migración reversible con metadatos consultables y vista V4 activa segura. No se activa V4 ni se modifica el banco histórico.
- agente: Codex
- via: repositorio local con push al remoto canónico
- contributor: Marlon Medellín
- environment: WSL local / GitHub
- validacion: `npm run content:validate:v4`, `npm run content:import:v4`, `npm run typecheck`, `git diff --check`
- runtime-verified: no; migración Supabase y corte runtime pendientes
- relacionados: src/domain/content/v4-contract.ts, scripts/validate-question-bank-v4.ts, scripts/import-question-bank-v4.ts, supabase/migrations/0019_question_bank_v4_contract.sql

## 2026-08-21
- tipo: prd+editorial+database
- modulo: question-bank-v4/default-source/supabase
- resumen: Se agregan dos PRD separados para convertir V4 en fuente predeterminada: uno de repositorio, backend y frontend, y otro de Supabase con migraciones, vistas, RLS, importación, piloto y corte controlado.
- agente: Codex
- validacion: `python3 scripts/validate_docs.py`, `git diff --check`
- relacionados: docs/01-product/prd-question-bank-v4-default-source.md, docs/database/prd-question-bank-v4-supabase.md

## 2026-08-21
- tipo: docs+architecture+database
- modulo: question-bank-v4
- resumen: Se formaliza el contrato editorial V4 en `content`, junto con planes canónicos de adopción para backend, frontend y Supabase. V4 queda explícitamente como propuesta no activada: requiere validador, importador dry-run, migración versionada, vista/RLS, DTOs sin fuga de clave y piloto controlado antes de ser fuente de runtime.
- agente: Codex
- validacion: `python3 scripts/validate_docs.py`, `git diff --check` y parseo JSON V4
- relacionados: content/question-bank-v4/CONTRATO-EDITORIAL-V4.md, docs/architecture/question-bank-v4-adoption.md, docs/database/question-bank-v4-contract.md

## 2026-08-21
- tipo: docs+editorial-governance
- modulo: question-bank-v3/question-bank-v4/legacy
- resumen: Se documenta la suite V4 de cuatro skills como protocolo obligatorio para revisar registros legacy de preguntas uno por uno: fabrica desde cero seguida de auditoria adversarial independiente. Solo los reactivos nuevos con `PRODUCE` y `APPROVED` pueden serializarse en `question-bank-v4`; no se migran claves, opciones ni explicaciones legacy.
- agente: Codex
- validacion: `python3 scripts/validate_docs.py`, `git diff --check`
- relacionados: AGENTS.md, content/README.md, content/GUIA-PARA-AGENTES-IA.md, content/question-bank-v3/PROMPTS-PROCESAMIENTO.md, content/question-bank-v4/README.md, docs/ai/skills/

## 2026-08-19
- tipo: feat+qa+fallback
- modulo: tutor/practice/prd
- resumen: Se conecta el feedback editorial de la respuesta como fallback visible cuando falla el endpoint del Tutor. La sesión conserva el resultado y permite continuar; la prueba pública con fallo inyectado pasa. Se agrega matriz de cumplimiento del PRD, distinguiendo Beta técnica PASS de validación humana pendiente.
- agente: Codex
- commit: `6926ca9`
- validacion: `npm run typecheck`, `npm run test:unit`, build Docker y Playwright público con caída simulada de `/api/tutor/turn`
- relacionados: src/components/tutor/tutor-interface.tsx, src/components/practice/practice-session.tsx, docs/02-delivery/prd-beta-compliance.md

## 2026-08-19
- tipo: qa+tutor+fallback
- modulo: tutor/api/runtime
- resumen: Se valida el Tutor autenticado en runtime publico: pista guiada funcional, bloqueo de revelacion antes de responder y contrato 400 ante payload incompleto. El fallback por evidencia insuficiente pasa el test contractual con degradacion segura; no se simulo una caida de proveedor externo porque el flujo actual no depende de uno.
- sprint: Tutor and Fallback Validation
- agente: Codex
- validacion: `npm run test:tutor`, `npm run test:recent-sprints`, Playwright publico y `POST /api/tutor/turn` sin payload obligatorio
- relacionados: src/components/tutor/tutor-interface.tsx, src/app/api/tutor/turn/route.ts, src/lib/tutor/tutor-orchestrator.ts, src/lib/tutor/tutor-guardrails.ts

## 2026-08-19
- tipo: fix+qa+runtime
- modulo: ux-movil/css/deploy
- resumen: Se valida UX movil autenticada en `/home`, `/practice` y `/dashboard` a 390x844. Se corrigen restricciones de ancho minimo en grids y etiquetas de competencia sin espacios; el runtime publico queda sin overflow horizontal y con navegacion inferior dentro del viewport.
- sprint: Mobile UX Validation
- agente: Codex
- commit: `9695d40`
- validacion: `npm run typecheck`, `npm run test:unit`, `git diff --check`, Playwright publico y artefactos `/opt/gcm/app/artifacts/mobile-audit-fixes`
- relacionados: src/app/globals.css, docs/project/status.md, docs/05-ops/runtime-and-release.md

## 2026-08-19
- tipo: docs+beta-readiness+runtime-evidence
- modulo: docs/status/release/supabase/runtime
- resumen: Actualizacion del cierre documental de Beta Candidate 0.6.0. Se registra `b0207e9` como HEAD del repositorio principal, `ad6ad35` como runtime publico verificado, la aplicacion de migraciones Supabase `0013`-`0017`, el banco beta de 100 items y la E2E autenticada real de cinco turnos. Se conserva el release como pendiente porque source, deploy tree y runtime aun no comparten commit.
- sprint: Beta Candidate 0.6.0 — Cierre documental y preparacion del release
- agente: Codex
- relacionados: docs/project/status.md, docs/02-delivery/release-checklist.md, docs/02-delivery/sprint-log.md, docs/05-ops/runtime-and-release.md, supabase/migrations/0013_beta_source_boundary.sql, supabase/migrations/0017_backfill_beta_thematic_nuclei.sql
- limitaciones: gates automatizados postdeploy/API/UI y tag `v0.6.0-beta.1` aun pendientes.

## 2026-08-19 — QA postdeploy
- tipo: qa+runtime+beta-readiness
- modulo: postdeploy/api/ui/runtime
- resumen: Smoke local y publico, API E2E de cinco turnos y UI E2E Chromium completaron PASS sobre el runtime `ad6ad35`. Los artifacts quedaron registrados en el checklist de release; no se crea tag beta porque source/deploy/runtime siguen fuera de paridad con `b0207e9`.
- agente: Codex
- relacionados: docs/project/status.md, docs/02-delivery/release-checklist.md, docs/05-ops/runtime-and-release.md
- evidencia: `qa-smoke-postdeploy-smoke-mt0wd760-p8yke7`, `qa-smoke-postdeploy-smoke-mt0wkf4t-vycjn4`, `qa-e2e-api-mt0wdtcq-1anjty`, `qa-ui-e2e-ui-mt0wfn7a-mh3n8i`

## Governance Hardening (executive block)
- tipo: governance
- modulo: docs/ops/delivery
- resumen: Fase 3 activada para reduccion documental, clasificacion canonica y alineacion minima entre `status.md`, `sprint-log.md` y `change-log.md` sin borrar historial.
- agente: PM-Governance/codex
- relacionados: docs/project/status.md, docs/project/canonical-docs.md, docs/archive/legacy-candidates.md, docs/02-delivery/sprint-log.md, docs/02-delivery/change-log.md, docs/02-delivery/governance-hardening-roadmap.md
- estado: in-progress (fase 3 documental en ejecucion; sin cierre de roadmap)
- limitaciones: inventario inicial; no se archivaron ni removieron documentos legacy en esta entrega.

## 2026-08-11
- tipo: docs+governance+beta-readiness
- modulo: docs/status/delivery/quality/ops
- resumen: Homologacion documental para Beta Candidate 0.6.0. Se separa explicitamente HEAD actual de repo (`ca59cec`) del ultimo runtime publico verificado documentalmente (`716ec62`), se evita declarar beta funcional sin corrida fresca y se concentra el siguiente gate en triple verificacion source/deploy/runtime mas QA postdeploy/E2E.
- sprint: Beta Candidate 0.6.0 — Alineacion documental y preparacion de runtime
- agente: Codex
- relacionados: docs/project/status.md, docs/02-delivery/sprint-log.md, docs/02-delivery/release-checklist.md, docs/05-ops/runtime-and-release.md, docs/01-product/backlog.md, docs/04-quality/known-issues.md, docs/04-quality/technical-debt-register.md
- limitaciones: sin deploy, sin runtime fresco, sin tag beta creado.

## 2026-05-24
- tipo: content-audit+refactor
- modulo: content/items/stand-by, docs/project
- resumen: Auditoría y depuración masiva de 416 ítems en `content/items/stand-by` con 10 subagentes paralelos bajo estrictas pautas psicométricas (Ley 115, Ley 1098, Decreto 815 de 2018, Decreto 1421). Se aprueban y corrigen in-place 341 ítems (329 LISTO_PARA_BANCO, 12 LISTO_PARA_PILOTAJE) y se descartan/eliminan físicamente 75 ítems (como escala Likert y abstractos/memorísticos débiles). Se resuelven colisiones de ID renombrando DIL_B05_I01 a CEOL_B02_I07 y EIP_B06_I01..I05 a EFCC_B06_I01..I05. Se consolida el reporte de decisiones en `Downloads/report_consolidado.json`.
- sprint: Auditoría Psicométrica y Editorial - stand-by
- agente: Antigravity
- relacionados: content/items/stand-by/, docs/project/status.md, docs/02-delivery/change-log.md

## 2026-05-23
- tipo: governance+ops+content-pipeline
- modulo: content/items, scripts, docs/database, docs/05-ops, docs/project, root
- resumen: Cierre de gobernanza Claim 6 — dualidad de esquemas. Se implementa política canónica explícita (Markdown = canon; JSON = derivado), conversor `scripts/export-items-to-json.ts` (MD→JSON con trazabilidad SHA-256), schema contrato `docs/database/derived-json-schema-v1.md`, tres comandos npm (`content:export:json`, `content:export:json:all`, `content:export:json:check`) y actualización de `docs/database/content-model.md` y `docs/05-ops/question-bank-load-runbook.md`. Se configura `.gitignore` para excluir `content/exports/json/` y se actualiza `docs/project/status.md` con el estado de cierre y políticas correspondientes. Pipeline existente sin cambios. Validaciones: `content:validate` 0 errores, `content:validate:all` 0 errores, `lint` PASS, `content:export:json` 27 ítems exportados sin errores.
- sprint: Gobernanza banco — cierre Claim 6
- agente: Antigravity
- relacionados: scripts/export-items-to-json.ts, docs/database/derived-json-schema-v1.md, docs/database/content-model.md, docs/05-ops/question-bank-load-runbook.md, docs/project/status.md, .gitignore, package.json

## 2026-05-13
- tipo: visual+qa+ops+closure
- modulo: core/ui/authenticated/layout
- resumen: Despliegue de Hardening Visual Fase 5 (Layout autenticado, sidebar persistente, topbar móvil, hero premium y workspace cognitivo). Sincronización total de VPS sobre `716ec62`, reconstrucción Docker sin caché y validación runtime completa (smoke, api, ui). Evidencia visual capturada y verificada.
- sprint: Visual Hardening Phase 5
- agente: PM-Dev/Antigravity
- relacionados: src/app/globals.css, src/app/(authenticated)/layout.tsx, 716ec62, https://cnsc.profemarlon.com

## 2026-05-10
- tipo: docs+governance+sprint47-final-sanitation
- modulo: docs/status/sprint-log/backlog/traceability
- resumen: Sprint 47 cierra el bloque corto de mantenimiento menor y saneamiento final. Se alinean `status.md`, `sprint-log.md`, `change-log.md` y `backlog.md` con el estado posterior a Sprint 46, se corrigen referencias residuales del sprint anterior y se deja explicitamente que no hubo nueva revalidacion de runtime en esta entrega.
- sprint: Sprint 47 — Mantenimiento menor y saneamiento final
- agente: PM-Gauss
- relacionados: docs/project/status.md, docs/02-delivery/sprint-log.md, docs/02-delivery/change-log.md, docs/01-product/backlog.md

## 2026-05-10
- tipo: docs+governance+sprint46-post-review-remediation
- modulo: tutor/normativa/docs/status-backlog
- resumen: Remediacion post-review de consistencia documental para Sprint 46. Se alinea `status.md` con Sprint 46 como cierre vigente en repo, se preserva la frase contractual requerida por `recent-sprints-contract` y se corrige en `backlog.md` la referencia de evidencia para no mencionar documentos no tocados en la entrega. La validacion documental y de tests queda cerrada con `npm run check:doc-triggers`, `npm run lint` y `npm test` en PASS.
- sprint: Sprint 46 — Cierre normativo del Tutor GCM
- agente: PM-Gauss
- relacionados: docs/project/status.md, docs/01-product/backlog.md, docs/02-delivery/change-log.md, PR #79

## 2026-05-10
- tipo: governance+docs+tutor-normative-closure
- modulo: tutor/normativa/source-truth/docs
- resumen: Sprint 46 cierra el frente normativo documental del Tutor GCM con taxonomia explicita de evidencia (`source_verified`, `synthesized_governed_unverified`, `placeholder`, `advisory_only`), refuerzo de limites de autoridad y registro de drift/placeholders sin promocionar claims de `source_verified`.
- sprint: Sprint 46 — Cierre normativo del Tutor GCM
- agente: PM-Gauss
- relacionados: docs/project/status.md, docs/project/canonical-docs.md, docs/02-delivery/sprint-log.md, docs/02-delivery/change-log.md, docs/01-product/backlog.md, docs/02-delivery/tutor-gcm-normative-verification.md, docs/01-product/source-truth/normative-source-truth-v1.md

## 2026-05-10
- tipo: qa+ops+runtime+closure
- modulo: tutor/runtime/docker/vps
- resumen: Sprint 45 queda cerrado total tras sincronizacion de fuente `~/.openclaw/product`, arbol de deploy `/opt/gcm/app`, reconstruccion Docker y validacion runtime completa en VPS y URL publica sobre `fcc40cb`. Smoke, postdeploy, API E2E y UI Playwright reportan PASS.
- sprint: Sprint 45 — Calibracion y metricas/analytics internos del Tutor
- agente: PM-Dev/AntiGravity
- relacionados: docs/project/status.md, docs/02-delivery/sprint-log.md, docs/01-product/backlog.md, fcc40cb, /opt/gcm/env/gcm-app.env, https://cnsc.profemarlon.com

## 2026-05-10
- tipo: docs+governance+sprint45-final-alignment
- modulo: docs/status/sprint-log/backlog/pr-traceability
- resumen: se alinea la documentacion canonica y la trazabilidad final de Sprint 45 con el cierre operativo real, reemplazando referencias de cierre parcial por cierre total verificado en runtime y dejando Sprint 46 como siguiente frente habilitado.
- sprint: Sprint 45 — Calibracion y metricas/analytics internos del Tutor
- agente: PM-Gauss
- relacionados: docs/project/status.md, docs/02-delivery/sprint-log.md, docs/02-delivery/change-log.md, docs/01-product/backlog.md, PR #78

## 2026-05-10
- tipo: docs+governance+sprint45-closure-sanitization
- modulo: docs/status/sprint-log/backlog
- resumen: saneamiento de cierre Sprint 45 para eliminar inconsistencia documental con contratos de sprint (`recent-sprints-contract`) y declarar estado real como cierre parcial controlado cuando aplique.
- sprint: Sprint 45 — Calibracion y metricas/analytics internos del Tutor
- agente: GPT-5.3-Codex
- relacionados: docs/project/status.md, docs/02-delivery/sprint-log.md, docs/02-delivery/change-log.md, docs/01-product/backlog.md

## 2026-05-10
- tipo: feat+tutor+analytics+calibration
- modulo: tutor/traces/learning-signals
- resumen: Sprint 45 agrega calibracion interna inicial sobre senales pedagogicas del Tutor: intensidad (`strong|weak|insufficient`), suficiencia de evidencia para `recommendedNextPractice`, conteo de falsos positivos probables y frecuencia agregada de senales sin alterar scoring, avance ni autoridad operativa.
- sprint: Sprint 45 — Calibracion y metricas/analytics internos del Tutor
- agente: GPT-5.3-Codex
- relacionados: src/lib/tutor/tutor-evidence-builder.ts, src/lib/tutor/tutor-orchestrator.ts, src/lib/tutor/tutor-trace-summary.ts, src/lib/tutor/tutor-trace-summary.test.ts, src/types/tutor-turn.ts

## 2026-05-10
- tipo: qa+ops+runtime+closure
- modulo: tutor/runtime/docker/vps
- resumen: Sprint 44 queda ampliamente completado tras validacion runtime integral en VPS y URL publica sobre `54efd43`. Runtime smoke, postdeploy, API E2E y UI Playwright reportan PASS. Se mantiene pendiente unicamente revision humana final como aceptacion operativa. La integracion futura del Tutor con LLM real queda registrada como deuda tecnica posterior.
- sprint: Sprint 44 — Persistencia, calibracion y analytics del Tutor
- agente: GPT-5.5-Thinking
- relacionados: docs/project/status.md, docs/02-delivery/sprint-log.md, 54efd43, /opt/gcm/env/gcm-app.env, https://cnsc.profemarlon.com

## 2026-05-10
- tipo: feat+tutor+calibration-lite
- modulo: tutor/analytics/dashboard
- resumen: Sprint 44 agrega calibracion descriptiva simple sobre trazas del Tutor con `misconceptionRate` y `signalLevel` (`low_signal|emerging_signal|usable_signal`) derivado solo del numero de turnos y senales observadas. Sin scoring nuevo, sin ponderaciones complejas y sin psicometria adicional.
- sprint: Sprint 44 — Persistencia, calibracion y analytics
- agente: GPT-5.3-Codex
- relacionados: src/lib/tutor/tutor-trace-summary.ts, src/lib/tutor/tutor-trace-summary.test.ts, src/components/tutor/tutor-trace-summary-card.tsx
## 2026-05-10
- tipo: governance+docs+traceability-remediation
- modulo: tutor/traces/dashboard/docs
- resumen: Remediacion de trazabilidad: la ejecucion inicialmente registrada por error como Sprint 9 se corrige a Sprint 44. Se mantiene evidencia funcional del commit `216d96e`, estado parcial y runtime no verificado.
- sprint: Sprint 44 — Persistencia, calibracion y analytics
- agente: GPT-5.3-Codex
- relacionados: docs/02-delivery/change-log.md, docs/02-delivery/sprint-log.md, docs/01-product/backlog.md, docs/project/status.md

## 2026-05-10
- tipo: feat+tutor+analytics+persistence
- modulo: tutor/traces/dashboard
- resumen: Sprint 44 (linea persistencia-calibracion-analytics) agrega persistencia estructurada de `trace_signals` en `tutor_turn_traces`, indice GIN para consulta analitica y expansion del resumen del dashboard con senales de misconception y distribucion de niveles de pista. Se mantiene alcance descriptivo sin mutar scoring ni progreso.
- sprint: Sprint 44 — Persistencia, calibracion y analytics (subfrente tutor)
- agente: GPT-5.3-Codex
- relacionados: supabase/migrations/0010_tutor_trace_signals.sql, src/lib/tutor/tutor-trace-repository.ts, src/lib/tutor/tutor-trace-summary.ts, src/app/api/tutor/traces/summary/route.ts, src/components/tutor/tutor-trace-summary-card.tsx
## 2026-05-10
- tipo: governance+docs+ci
- modulo: governance/ops/qa/delivery
- resumen: Inicio formal del hardening incremental de gobernanza documental y operacional. Se agregan trigger maps advisory, trazabilidad multiagente base, quality gates ejecutivos, baseline runtime/release, snapshot ejecutivo de estado, PR governance template, politica de archive, session reporting y advisory CI para sincronizacion documental. El objetivo explicito es reducir drift silencioso sin introducir enforcement bloqueante prematuro.
- sprint: Governance Hardening Roadmap — Fases 1 y 2 iniciadas
- agente: PM-Governance/chatgpt
- relacionados: docs/02-delivery/governance-hardening-roadmap.md, docs/05-ops/documentation-trigger-map.md, docs/05-ops/agent-traceability.md, docs/04-quality/quality-gates.md, docs/05-ops/runtime-and-release.md, docs/archive/README.md, .github/pull_request_template.md, scripts/check-doc-triggers.ts, .github/workflows/pr-checks.yml

## 2026-05-10
- tipo: governance+ops
- modulo: docs/qa/ops
- resumen: Cierre operacional y probatorio de Sprints 31-43. Se sincroniza el VPS al commit `fee91a4`, se reconstruye el entorno Docker con metadatos reales y se valida el runtime publico mediante suite de regresion integral (PASS). Se incluye fix de contrato en `scripts/ops-update-contract.test.ts` para robustez de validacion.
- sprint: Sprint 43 — Learning Paths + Misconception Signals - Base Implementation
- agente: PM-Dev/Antigravity
- relacionados: docs/04-quality/sprint-31-43-runtime-regression-report.md, fee91a4

## 2026-05-10
- tipo: feat+tutor+learning-signals
- modulo: tutor/evidence/orchestrator/docs
- resumen: Sprint 43 activa la capa base de `learningSignals` para detectar misconceptions, subareas debiles, patrones repetidos y siguiente mejor practica a partir de historial reciente y metadata gobernada, manteniendo guardrails de no revelacion, no scoring y no autoridad operativa.
- sprint: Sprint 43 — Learning Paths + Misconception Signals - Base Implementation
- agente: PM-Dev
- relacionados: src/types/tutor-turn.ts, src/lib/tutor/tutor-evidence-builder.ts, src/lib/tutor/tutor-orchestrator.ts, src/lib/tutor/tutor.test.ts, docs/project/status.md, docs/02-delivery/sprint-log.md, docs/01-product/backlog.md

## 2026-05-10
- tipo: feat+taxonomy+qa
- modulo: tutor/taxonomy/scripts
- resumen: Sprint 42 queda cerrado en repo tras auditoria y ajuste. Se conecta la validacion editorial al banco activo, se preserva `sourceTaxonomy`, se normalizan tags planos del corpus actual, se separan warnings legacy de errores estructurales reales, se realinea el contrato `recent-sprints` y se deja Sprint 43 preparado.
- sprint: Sprint 42 — Rich Ingestion Normalization
- agente: PM-Gauss
- relacionados: src/domain/taxonomy/catalogs.ts, src/domain/taxonomy/normalize-item.ts, src/domain/taxonomy/validators.ts, scripts/validate-question-bank.ts, scripts/recent-sprints-contract.test.ts, src/lib/tutor/tutor.test.ts, docs/project/status.md, docs/02-delivery/sprint-log.md, docs/01-product/backlog.md

## 2026-05-09
- tipo: feat+governance+tutor
- modulo: taxonomy/tutor/docs
- resumen: Sprint 41 ajusta la fundacion de gobernanza semantica del Tutor GCM. Se endurecen catalogos y validadores, se corrige el normalizador legacy para no inventar metadata faltante, se preserva `responsePolicy` dentro de `TutorSupportContract`, se agregan pruebas de ausencia explicita y warnings controlados, y se deja documentado que la adopcion runtime completa de metadata rica pasa al Sprint 42.
- sprint: Sprint 41 — Semantic Governance Foundation v1
- agente: PM-Gauss
- relacionados: src/domain/taxonomy/catalogs.ts, src/domain/taxonomy/validators.ts, src/domain/taxonomy/normalize-item.ts, src/domain/tutor/question-truth-adapter.ts, src/lib/tutor/tutor.test.ts, docs/03-architecture/semantic-governance-foundation-v1.md, docs/project/status.md, docs/02-delivery/sprint-log.md, docs/01-product/backlog.md

## 2026-05-08
- tipo: qa+ops+closure
- modulo: ops/deploy/qa
- resumen: Sprint 37.1 cierra la deuda operacional de Sprint 37. Se logra paridad total entre repositorio, deploy tree `/opt/gcm/app` y entorno Docker runtime publico en `https://cnsc.profemarlon.com`. Se resolvieron errores de TypeScript en tests E2E, se alineo la firma de `runWebUpdate` y todas las pipelines de QA (smoke, postdeploy, api, ui) y test suites (`npm run test:tutor`, `npm run test:unit`) pasaron exitosamente.
- sprint: Sprint 37.1 — Runtime Parity & Operational Verification
- agente: PM-Gauss (via antigravity)
- relacionados: docs/project/status.md, docs/02-delivery/sprint-log.md, tests/e2e/*.spec.ts, src/app/api/ops/update/route.ts

## 2026-05-08
- tipo: governance+test+tutor
- modulo: delivery/tutor
- resumen: Sprint 37 prepara estabilizacion de arrastre Sprint 35-36: se corrige `scripts/recent-sprints-contract.test.ts` para eliminar rigidez obsoleta Sprint 33/34 y exigir coherencia con Sprint 37 activo; se agrega enforcement minimo de no revelacion en tutor y senales minimas de trazabilidad (`dossierAvailable`, `responseModeUsed`, `hintLevelUsed`, `misconceptionDetected`, `guardrailTriggered`, `fallbackReason`) sin migraciones ni analytics pesadas; `npm run test:tutor` y `npm run test:unit` quedan en verde en repo local.
- sprint: Sprint 37 — Tutor Trace Signals and Governance Stabilization Prep
- agente: PM-Dev
- relacionados: scripts/recent-sprints-contract.test.ts, src/lib/tutor/tutor-response-policy.ts, src/lib/tutor/tutor-orchestrator.ts, src/types/tutor-turn.ts, src/lib/tutor/tutor.test.ts, docs/project/status.md, docs/02-delivery/sprint-log.md, docs/01-product/backlog.md
