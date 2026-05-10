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
## 2026-05-10
- tipo: feat+taxonomy+qa
- modulo: tutor/taxonomy/scripts
- resumen: Sprint 42 queda cerrado en repo tras auditoría y ajuste. Se conecta la validación editorial al banco activo, se preserva `sourceTaxonomy`, se normalizan tags planos del corpus actual, se separan warnings legacy de errores estructurales reales, se realinea el contrato `recent-sprints` y se deja Sprint 43 preparado.
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
- resumen: Sprint 37 prepara estabilizacion de arrastre Sprint 35-36: se corrige `scripts/recent-sprints-contract.test.ts` para eliminar rigidez obsoleta Sprint 33/34 y exigir coherencia con Sprint 37 activo; se agrega enforcement minimo de no revelacion en tutor y señales minimas de trazabilidad (`dossierAvailable`, `responseModeUsed`, `hintLevelUsed`, `misconceptionDetected`, `guardrailTriggered`, `fallbackReason`) sin migraciones ni analytics pesadas; `npm run test:tutor` y `npm run test:unit` quedan en verde en repo local.
- sprint: Sprint 37 — Tutor Trace Signals and Governance Stabilization Prep
- agente: PM-Dev
- relacionados: scripts/recent-sprints-contract.test.ts, src/lib/tutor/tutor-response-policy.ts, src/lib/tutor/tutor-orchestrator.ts, src/types/tutor-turn.ts, src/lib/tutor/tutor.test.ts, docs/project/status.md, docs/02-delivery/sprint-log.md, docs/01-product/backlog.md

- 2026-05-10: Tutor agrega señales `learningSignals` (misconception, weakSubarea, repeatedErrorPattern, recommendedNextPractice, difficultyMismatch) derivadas de evidencia reciente y metadata gobernada.
