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
last_reviewed: 2026-08-22
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

Siguiente bloque propuesto:
- **Sprint 48 — V4 Runtime Seguro + Tutor IA en Shadow (en ejecución).**
- P0: retirar lectura anonima/autenticada directa de claves y explicaciones y
  eliminar `rationale` del payload previo a responder.
- P0: aplicar importación y activar de forma controlada el corte definido por el
  manifiesto V4 canónico;
  el repo está listo, Supabase remoto sigue pendiente.
- P0: desplegar y validar el selector exclusivo V4, sin fallback legacy silencioso.
- P1: validar en runtime los campos V4 ya integrados en UI, feedback y Tutor.
- P1: ejecutar OpenRouter shadow real sobre la integración con salida estructurada, ZDR, allowlist y
  fallback deterministico.

Estado beta vigente:
- **Version objetivo:** `0.6.0`.
- **Commit de codigo release verificado:** `9695d40`.
- **Documentación:** commits posteriores al release, sin cambios de código.
- **Runtime publico verificado:** `9695d40` (`2026-08-19T00:00:00-05:00`).
- **Evidencia nueva:** 100 items beta visibles en Supabase y E2E autenticada real de 5 turnos con dashboard verificado.
- **Dictamen:** beta funcional cerrada en `v0.6.0-beta.1`; permanece deuda editorial no bloqueante.

## Implementado y validado recientemente

### Beta Candidate 0.6.0 — Cierre documental y preparacion del release
- Estado: BETA FUNCIONAL CERRADA; `v0.6.0-beta.1` PUBLICADO.
- Resultado: estado ejecutivo, paridad de codigo/deploy/runtime y gates frescos documentados.
- Evidencia: build, typecheck/lint, tests, contenido, smoke runtime y E2E autenticada real de cinco turnos PASS.
- Limite aceptado: metadata editorial rica pendiente como deuda no bloqueante.

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
1. Desplegar el código server-only del Bloque 0, aplicar `0020` y verificar
   negativamente con roles anon/autenticado.
2. Confirmar la huella SSH del VPS por un canal confiable antes de acceso administrativo.
3. Hacer idempotente y auditable la importacion 110/110 V4.
4. Separar contratos pre/post respuesta y cortar seleccion runtime a V4.
5. Mantener Tutor GCM sin autoridad sobre scoring, avance, cierre o fuente normativa.
6. Preparar OpenRouter en shadow; no habilitar canary antes de los gates.
7. Ejecutar y registrar gates minimos de repo, Supabase staging y runtime.

## Next
1. Canary limitado del Tutor LLM, solo tras aprobar shadow y decision humana.
2. Carga de anexos oficiales y catalogo central V4 para reevaluar `source_verified`.
3. Expansion `opec_specific` y cobertura docente basada en reportes, sin duplicar items.
4. Calibracion con datos reales de piloto, incluida dificultad observada.

## Later
1. Admin para editar fuente de verdad normativa y perfiles.
2. Expansion gobernada del banco de preguntas.
3. LLM real bajo contrato y solo despues de fuente normativa verificada suficiente.
4. Dashboard interno de uso del Tutor GCM.
5. Personalizacion pedagogica avanzada por concurso/perfil.
6. Refactor liviano de `PracticeSession` segun `docs/01-product/future-practice-session-light-refactor.md`.
