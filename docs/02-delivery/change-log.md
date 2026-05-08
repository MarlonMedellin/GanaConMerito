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
last_reviewed: 2026-05-08
---

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

## 2026-05-06
- tipo: docs+governance+ops
- modulo: governance/release/runtime
- resumen: se actualiza la gobernanza operativa para dejar explicito que la fuente de verdad del producto es el repo principal `https://github.com/ProfeMarlonMDE/GanaConMerito`; que existen multiples origenes de edicion concurrentes; que toda promocion estable debe pasar por Pull Request a `master`; que luego debe sincronizarse `~/.openclaw/product`, despues `/opt/gcm/app` y finalmente Docker en el VPS OCI; y que la validacion relevante debe correrse contra `https://cnsc.profemarlon.com`. Tambien se fija la continuidad del roadmap desde Sprint 14 porque la fuente ya tiene evidencia hasta Sprint 13.
- sprint: Gobernanza operativa posterior a Sprint 13
- agente: ChatGPT
- relacionados: AGENTS.md, docs/06-governance/gcm-operating-context.md, docs/project/status.md, docs/02-delivery/sprint-log.md, docs/01-product/backlog.md

## 2026-05-04
- tipo: feat+docs+governance
- modulo: tutor/source-truth/architecture/compliance
- resumen: se cierra Sprint 13 con fuente de verdad normativa sintetizada v1 para Tutor GCM. Se crea el mapa de flujos runtime, la politica de service role server-side, el documento canonico de fuente normativa sintetizada y el modulo `normative-source-truth.ts`; se integra la fuente al evidence builder del Tutor GCM y se marca su estado como `synthesized_governed_unverified` para evitar afirmar verificacion normativa sin documentos oficiales cargados.
- sprint: Sprint 13 — Fuente de verdad normativa sintetizada v1
- base: `88f997c232dcf2cb1958642e9055e26f0805778d`
- agente: ChatGPT
- relacionados: docs/03-architecture/runtime-flow-map.md, docs/07-compliance/server-side-service-role-policy.md, docs/01-product/source-truth/normative-source-truth-v1.md, src/lib/tutor/normative-source-truth.ts, src/lib/tutor/tutor-evidence-builder.ts, src/types/tutor-turn.ts

## 2026-05-04
- tipo: docs+governance
- modulo: delivery/product-map/status
- resumen: se ejecuta Sprint 12.1 para reconciliar la documentacion canonica con el estado real posterior a PR #1-#6. Se actualizan `status.md`, `sprint-log.md`, `change-log.md`, `backlog.md` y `active-feature-map.md` para reflejar login corregido, humanizacion UX, rotacion de items, Tutor GCM fuente de verdad v1, sincronizacion post-respuesta y metricas confiables.
- sprint: Sprint 12.1 — Reconciliacion documental y mapa real del producto
- commit base reconciliado: `64d78def1d8dd4f98ec9ae5ba55a3fed97e4e4ba`
- agente: ChatGPT
- relacionados: docs/project/status.md, docs/02-delivery/sprint-log.md, docs/01-product/backlog.md, docs/01-product/active-feature-map.md

## 2026-05-04
- tipo: feat+dashboard+metrics+qa
- modulo: dashboard/metrics
- resumen: se cerro Sprint 12 con contrato de metricas confiables y utiles. El dashboard ya no presenta conclusiones fuertes con poca senal; incorpora niveles `no_signal`, `low_signal`, `emerging_signal`, `usable_signal`, copy prudente, percentil condicionado, tendencia condicionada y recomendaciones accionables sin promesas de resultado.
- sprint: Sprint 12 — Metricas confiables y utiles v1
- pr: #6
- commit master/runtime: `64d78def1d8dd4f98ec9ae5ba55a3fed97e4e4ba`
- validacion: E2E online PASS/WARN menor en `https://cnsc.profemarlon.com`, runtime visible `64d78de`, buildTime `2026-05-04T03:24:21Z`
- relacionados: src/lib/dashboard/summary-metrics.ts, src/app/(authenticated)/dashboard/page.tsx, src/types/evaluation.ts

## 2026-05-03
- tipo: fix+tutor+qa
- modulo: tutor/evidence
- resumen: se cerro Sprint 11 corrigiendo la sincronizacion post-respuesta del Tutor GCM. El tutor mantiene `canRevealCorrectAnswer=false` antes de responder y pasa a `true` despues de respuesta confirmada server-side, permitiendo explicar clave, feedback, distractores y justificacion sin tocar scoring ni avance.
- sprint: Sprint 11 — Tutor GCM sincronizacion post-respuesta
- pr: #5
- commit master/runtime: `1dc454291b22bff41b95125fcbd68e373d8f578a`
- validacion: E2E online PASS en produccion
- relacionados: src/lib/tutor/tutor-evidence-builder.ts, src/lib/tutor/tutor-response-policy.ts, src/types/tutor-turn.ts

## 2026-05-03
- tipo: feat+tutor+contract
- modulo: tutor/source-of-truth
- resumen: se cerro Sprint 10 implementando la fuente de verdad y contrato pedagogico v1 de Tutor GCM. Se incorporan modos, intenciones, evidence builder server-side, guardrails de autoridad, degradacion por fuente insuficiente y trazabilidad preparada, sin conectar LLM real.
- sprint: Sprint 10 — Tutor GCM fuente de verdad y contrato pedagogico v1
- pr: #4
- commit master/runtime: `7a380328af9fcb974c9ab6497b35380ce9bd06ed`
- relacionados: src/types/tutor-turn.ts, src/domain/tutor/contract.ts, src/lib/tutor/tutor-evidence-builder.ts, src/app/api/tutor/turn/route.ts

## 2026-05-03
- tipo: feat+item-selection
- modulo: practice/item-selection
- resumen: se implemento rotacion controlada de seleccion de items para evitar que nuevas sesiones inicien siempre con la misma pregunta. La seleccion usa pool de candidatos, exclusion de items recientes, semilla deterministica y fallback seguro.
- pr: #3
- relacionados: src/domain/item-selection/select-next-item.ts, src/app/api/session/start/route.ts, src/app/api/session/advance/route.ts

## 2026-05-03
- tipo: fix+ux
- modulo: practice/dashboard
- resumen: se humanizaron etiquetas tecnicas visibles en practica y dashboard, reemplazando slugs como `gestion · lectura_de_indicadores` por etiquetas legibles como `Gestion · Lectura de indicadores` y ajustando copy tecnico de feedback.
- pr: #2
- relacionados: src/lib/ui/format-label.ts, src/components/practice/practice-session.tsx, src/app/(authenticated)/dashboard/page.tsx

## 2026-05-03
- tipo: fix+auth
- modulo: auth/supabase
- resumen: se corrigio el fallo de login causado por ausencia de variables publicas Supabase en el bundle del navegador. Se agrego fallback runtime de configuracion publica y se estabilizo el flujo Google/Supabase.
- pr: #1
- relacionados: src/app/api/auth/public-config/route.ts, src/lib/supabase/client.ts, src/lib/supabase/auth.ts

## Historial previo
El historial anterior completo se conserva en Git. Este archivo mantiene la vista ejecutiva de cambios recientes y canonicos para operacion de agentes.
