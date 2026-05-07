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
last_reviewed: 2026-05-04
---

## 2026-05-07
- tipo: qa+governance+tutor
- modulo: tutor/runtime/compliance
- resumen: se ejecuta auditoría de runtime Sprint 20 sobre el entorno de producción. Se valida integridad de commit (9cd7ce4), persistencia de sesión con bypass de onboarding controlado y cumplimiento estricto de guardrails pedagógicos (no revelación de respuesta antes de contestar). Se detecta fallo 500 menor en endpoint de resumen de trazas que no afecta operación crítica.
- sprint: Sprint 20 — Auditoría Runtime Tutor GCM
- commit validado: `9cd7ce44ab60ff7f24a996c244244239bb5f3b97`
- agente: Antigravity (QA Agent)
- relacionados: docs/02-delivery/tutor-gcm-sprint-20-runtime-audit.md, artifacts/qa/tutor-gcm-latest-sprints-report.json

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
- resumen: se cerro Sprint 12 con contrato de metricas confiables y utiles. El dashboard ya no presenta conclusiones fuertes con poca senal; incorpora niveles `no_signal`, `low_signal`, `emerging_signal` y `usable_signal`, copy prudente, percentil condicionado, tendencia condicionada y recomendaciones accionables sin promesas de resultado.
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
El historial anterior completo se conserva en Git. Este archivo mantiene la vista ejecutiva de cambios recientes y canónicos para operación de agentes.