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
last_reviewed: 2026-05-10
---

## Document control
- Status: operational
- Owner: PM-Governance
- Last reviewed: 2026-05-10
- Related files: docs/project/status.md, docs/02-delivery/sprint-log.md, docs/02-delivery/change-log.md, docs/project/canonical-docs.md
- Update trigger: governance, delivery, documentation, drift

## Governance Hardening (executive block)
- tipo: governance
- modulo: docs/ops/delivery
- resumen: Fase 3 activada para reduccion documental, clasificacion canonica y alineacion minima entre `status.md`, `sprint-log.md` y `change-log.md` sin borrar historial.
- agente: PM-Governance/codex
- relacionados: docs/project/status.md, docs/project/canonical-docs.md, docs/archive/legacy-candidates.md, docs/02-delivery/sprint-log.md, docs/02-delivery/change-log.md, docs/02-delivery/governance-hardening-roadmap.md
- estado: in-progress (fase 3 documental en ejecucion; sin cierre de roadmap)
- limitaciones: inventario inicial; no se archivaron ni removieron documentos legacy en esta entrega.

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
