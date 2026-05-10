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
last_reviewed: 2026-05-09
---
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

## 2026-05-06
- tipo: docs+governance+compliance
- modulo: tutor/source-truth/architecture/compliance
- resumen: se ejecuta Sprint 22 de verificacion normativa documental del Tutor GCM. Se cruza la fuente normativa v1 con arquitectura y compliance, se confirma que el repo solo acredita contrato, guardrails y propagacion de `sourceTruthStatus`, y se deja decision explicita PASS con WARN porque siguen faltando acuerdo oficial, guia metodologica, estructura de prueba y soporte de convocatoria/manual para promover `source_verified`.
- sprint: Sprint 22 — Tutor GCM Normative Source Verification
- base: `a056da2e69bf302473609e7192e36dc76132383b`
- agente: ChatGPT
- relacionados: docs/02-delivery/tutor-gcm-normative-verification.md, docs/01-product/source-truth/normative-source-truth-v1.md, docs/03-architecture/runtime-flow-map.md, docs/07-compliance/server-side-service-role-policy.md, docs/project/status.md, docs/02-delivery/sprint-log.md, docs/01-product/backlog.md

## 2026-05-07
- tipo: qa+docs+closure
- modulo: tutor/runtime/documentation
- resumen: se ejecuta Sprint 21 de cierre funcional del frente Tutor GCM. Se contrasta observacion publica directa de `https://cnsc.profemarlon.com` contra evidencia QA sanitizada previa; el runtime expone `commit=9cd7ce44ab60ff7f24a996c244244239bb5f3b97` y `buildTime=2026-05-06T23:08:12Z`, `/practice` y `/dashboard` redirigen a `/login` sin sesion, y el frente queda cerrado con PASS con WARN por fuente normativa aun no verificada, bypass de onboarding QA controlado y ausencia de evidencia aislada suficiente para marcar PASS explicito del resumen visual de trazas en dashboard.
- sprint: Sprint 21 — Tutor GCM Final Runtime Closure
- commit/runtime observado: `9cd7ce44ab60ff7f24a996c244244239bb5f3b97`
- agente: ChatGPT
- relacionados: docs/02-delivery/tutor-gcm-final-runtime-closure.md, docs/project/status.md, docs/02-delivery/sprint-log.md, docs/01-product/backlog.md

- tipo: qa+governance+tutor
- modulo: tutor/runtime/compliance
- resumen: se ejecuta auditoría de runtime Sprint 20 sobre el entorno de producción. Se valida integridad de commit (9cd7ce4), persistencia de sesión con bypass de onboarding controlado y cumplimiento estricto de guardrails pedagógicos (no revelación de respuesta antes de contestar). Se detecta fallo 500 menor en endpoint de resumen de trazas que no afecta operación crítica.
- sprint: Sprint 20 — Auditoría Runtime Tutor GCM
- commit validado: `9cd7ce44ab60ff7f24a996c244244239bb5f3b97`
- agente: Antigravity (QA Agent)
- relacionados: docs/02-delivery/tutor-gcm-sprint-20-runtime-audit.md, artifacts/qa/tutor-gcm-latest-sprints-report.json

## 2026-05-06
- tipo: fix+qa+docs
- modulo: tutor/ui/tests/documentation
- resumen: sprint 20 de consolidacion Tutor GCM. Se normaliza copy de acciones guiadas para recuperar compatibilidad con `detectTutorIntent` sin tocar backend; se corrige UX para que una accion guiada no destruya el borrador del textarea; se agregan pruebas locales de mapeo accion->intent y se reconcilia documentacion viva hasta Sprint 20 con notas explicitas de verificabilidad.
- sprint: Sprint 20 — Tutor GCM Consolidation and Closure
- agente: ChatGPT
- relacionados: src/components/tutor/tutor-interface.tsx, src/lib/tutor/tutor.test.ts, docs/project/status.md, docs/02-delivery/sprint-log.md, docs/01-product/backlog.md
