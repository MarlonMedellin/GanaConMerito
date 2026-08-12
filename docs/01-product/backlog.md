---
id: PROD-BACKLOG
name: product-backlog
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: product
modules: [core, editorial, auth, evaluacion]
tags: [backlog, prioridades, trazabilidad]
related:
  - PROD-VISION
  - DEL-SPRINT-LOG
  - QUAL-DEBT-REGISTER
last_reviewed: 2026-08-11
---

# Backlog de producto

## Criterio de uso
Este backlog distingue entre trabajo confirmado, trabajo propuesto y vacios de contexto. No se debe marcar como hecho nada que no tenga evidencia en repo, sprint log, PR cerrado, runtime validado o validacion humana.

## Estado ejecutivo actual
GanaConMerito tiene activo el core real de producto:

- auth/login/logout
- onboarding
- practica
- dashboard historico y por sesion
- banco de preguntas activo gobernado
- Tutor GCM integrado en practica con guardrails
- fuente normativa sintetizada v1 en estado `synthesized_governed_unverified`
- metricas prudentes para no vender conclusiones fuertes con poca senal
- runtime con metadata visible y disciplina de triple verificacion
- sistema editorial del banco definido por taxonomia primaria (`area`, `subarea`, `competency`) y segmentacion secundaria opcional por perfil docente
- fundacion de gobernanza semantica v1 ajustada en repo para evitar drift taxonomico y tags libres
- normalizacion editorial rica conectada al corpus activo con warnings legacy y rechazo estructural real
- capa base de `learningSignals` para misconception detection y siguiente mejor practica ya integrada en repo
- calibracion interna inicial y metricas/analytics internos del Tutor verificados en runtime sobre `fcc40cb`
- **Cierre funcional Tutor GCM (Sprint 21):** PASS con WARN explicito.
- **Frente normativo Tutor GCM (Sprint 22):** PASS con WARN explicito; contrato y guardrails verificados, fuente oficial suficiente pendiente.

Estado beta vigente:
- **Version objetivo:** `0.6.0`.
- **HEAD actual de repo revisado:** `ca59cec`.
- **Ultimo runtime publico verificado documentalmente:** `716ec62`.
- **Dictamen:** candidata a beta; falta corrida fresca de runtime/release para declararla beta funcional.

## Implementado y validado recientemente

### Beta Candidate 0.6.0 — Alineacion documental y preparacion de runtime
- Estado: CANDIDATA DOCUMENTAL; NO RELEASE BETA CERRADO.
- Resultado: se homologa el estado ejecutivo entre `status`, `sprint-log`, `change-log`, `runtime-and-release`, backlog y registros de calidad.
- Evidencia: auditoria previa de repo/PRs y validacion local parcial reporto build y typecheck/lint PASS; runtime fresco pendiente.
- Limite aceptado: se dejan deudas menores visibles y se concentra el bloqueo beta en una corrida operacional completa.

### Sprint 47 — Mantenimiento menor y saneamiento final
- Estado: CERRADO EN REPO (CIERRE DOCUMENTAL Y DE TRAZABILIDAD).
- Resultado: alineacion final de `status`, `sprint-log`, `change-log` y `backlog` con el estado posterior a Sprint 46, correccion de referencias residuales y cierre del bloque corto de saneamiento sin abrir cambios funcionales ni claims de runtime nuevos.
- Evidencia: actualizaciones cruzadas en documentacion canonica del repo.
- Limite aceptado: sin revalidacion runtime nueva y sin cierre normativo sustantivo adicional.

### Sprint 46 — Cierre normativo del Tutor GCM
- Estado: CERRADO EN REPO (DOCUMENTAL, advisory-heavy).
- Resultado: clasificacion explicita por evidencia (`source_verified`, `synthesized_governed_unverified`, `placeholder`, `advisory_only`), limites del Tutor/Tutor Truth reforzados y jerarquia documental aclarada.
- Evidencia: actualizaciones cruzadas en `status`, `sprint-log`, `change-log`, `backlog` y `tutor-gcm-normative-verification`.
- Limite aceptado: sin anexos oficiales nuevos, el frente normativo sigue en `synthesized_governed_unverified`.

### Sprint 45 — Calibracion y metricas/analytics internos del Tutor
- Estado: CERRADO TOTAL Y VERIFICADO EN RUNTIME (PASS).
- Resultado: intensidad de senales (`strong|weak|insufficient`), `recommendationEvidenceCount`, separacion `evidenceVsInference`, `likelyFalsePositive` y metricas internas agregadas para cobertura, suficiencia y frecuencia de senales del Tutor.
- Evidencia: Commit `fcc40cb`, VPS y runtime publico validados, smoke/postdeploy/API/UI PASS.
- Limite aceptado: calibracion aun heuristica y dependiente de calidad del historial y de `trace_signals` persistidos.

### Sprint 44 — Persistencia, calibracion y analytics del Tutor
- Estado: CERRADO Y VERIFICADO EN RUNTIME (PASS).
- Resultado: `trace_signals` trazables persistidas, analytics descriptivos simples y dashboard con visibilidad operativa basica.
- Evidencia: Commit `54efd43`, QA integral y validacion publica en runtime.
- Limite aceptado: la integracion del Tutor con LLM real sigue fuera de alcance.

### Sprint 43 — Learning Paths + Misconception Signals - Base Implementation
- Estado: CERRADO Y VERIFICADO EN RUNTIME (PASS).
- Resultado: `learningSignals` trazables para misconception, subarea debil, patron repetido, mismatch cognitivo y siguiente mejor practica; recomendacion pedagogica enriquecida sin mutar scoring ni sesion.
- Evidencia: Commit `fee91a4`, suite de regresion integral aprobada y validacion publica en runtime.
- Limite aceptado: calibracion heuristica pendiente con uso real.

### Sprint 42 — Rich Ingestion Normalization
- Estado: CERRADO EN REPO.
- Resultado: validacion editorial, cobertura por taxonomia/tags/targetPosition, `sourceTaxonomy` preservada y tags planos legacy normalizados sin romper fallback.
- Limite aceptado: runtime publico no verificado en esta corrida y adopcion completa de columnas ricas depende de la fuente operativa real.

### Sprint 41 — Semantic Governance Foundation v1
- Estado: IMPLEMENTACION AJUSTADA EN REPO.
- Resultado: catalogos, validadores, normalizador legacy gobernado y adaptadores del Tutor ya no inventan metadata ausente y preservan `responsePolicy` del contrato seguro.

### Sprint 22 — Tutor GCM Normative Source Verification
- Estado: CERRADO CON PASS CON WARN.
- Resultado: se clasifica con precision lo verificado en repo, lo sintetizado pero no verificado y lo faltante para `source_verified`.
- WARN vigente: faltan acuerdo oficial, guia metodologica, estructura de prueba y soporte de convocatoria/manual trazables en repo.

## Now
1. Cerrar corrida beta `v0.6.0-beta.1`: alinear `master`/`~/.openclaw/product`/`/opt/gcm/app`/Docker/runtime sobre un unico commit objetivo.
2. Ejecutar y registrar gates minimos: `content:validate`, tests relevantes, build, `qa:runtime:smoke`, `qa:smoke:postdeploy`, `qa:e2e:api` y `qa:e2e:ui`.
3. Crear tag/release beta solo despues de evidencia PASS fresca.
4. Mantener Tutor GCM bajo contrato: sin scoring, sin avance, sin cierre, sin fuente normativa inventada.
5. Mantener Sprint 22 como clasificacion vigente del frente normativo hasta que exista nueva evidencia documental real.
6. Ejecutar rotacion de `SUPABASE_SERVICE_ROLE_KEY` (Riesgo identificado en Sprint 20).
7. Consolidar la calidad de `trace_signals` persistidos para que la calibracion posterior no dependa de ruido operacional.
8. Mantener el bypass de onboarding QA explicitamente como workaround controlado hasta reemplazarlo por un mecanismo oficial y auditable.
9. Mantener la expansion del banco bajo la regla editorial: taxonomia primero, perfiles como segunda capa opcional.

## Next
1. Carga de anexos oficiales y eventual reevaluacion de `source_verified` para el frente normativo del Tutor.
2. Validacion visual aislada del resumen de trazas: obtener evidencia publica nueva del bloque de resumen del Tutor en dashboard si sigue siendo artefacto de cierre requerido.
3. Runtime topology doc: documentar `docker-compose.yml`, env file, dominio, proxy y politica de secretos.
4. Refinamiento posterior de calidad de evidencia y ruido/falso positivo en `trace_signals`, sin abrir scoring ni psicometria fuerte.

## Later
1. Admin para editar fuente de verdad normativa y perfiles.
2. Expansion gobernada del banco de preguntas.
3. LLM real bajo contrato y solo despues de fuente normativa verificada suficiente.
4. Dashboard interno de uso del Tutor GCM.
5. Personalizacion pedagogica avanzada por concurso/perfil.
6. Refactor liviano de `PracticeSession` segun `docs/01-product/future-practice-session-light-refactor.md`.
