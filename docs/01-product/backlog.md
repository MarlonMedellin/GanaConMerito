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
last_reviewed: 2026-05-10
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
- capa base de `learningSignals` para misconception detection y siguiente mejor práctica ya integrada en repo
- **Cierre funcional Tutor GCM (Sprint 21):** PASS con WARN explícito.
- **Frente normativo Tutor GCM (Sprint 22):** PASS con WARN explícito; contrato y guardrails verificados, fuente oficial suficiente pendiente.

## Implementado y validado recientemente

### Sprint 43 — Learning Paths + Misconception Signals - Base Implementation
- Estado: IMPLEMENTACION BASE LISTA PARA PROMOCION.
- Resultado: `learningSignals` trazables para misconception, subárea débil, patrón repetido, mismatch cognitivo y siguiente mejor práctica; recomendación pedagógica enriquecida sin mutar scoring ni sesión.
- Límite aceptado: runtime público no verificado en esta corrida y calibración heurística pendiente con uso real.

### Sprint 42 — Rich Ingestion Normalization
- Estado: CERRADO EN REPO.
- Resultado: validación editorial, cobertura por taxonomía/tags/targetPosition, `sourceTaxonomy` preservada y tags planos legacy normalizados sin romper fallback.
- Limite aceptado: runtime público no verificado en esta corrida y adopción completa de columnas ricas depende de la fuente operativa real.

### Sprint 41 — Semantic Governance Foundation v1
- Estado: IMPLEMENTACION AJUSTADA EN REPO.
- Resultado: catalogos, validadores, normalizador legacy gobernado y adaptadores del Tutor ya no inventan metadata ausente y preservan `responsePolicy` del contrato seguro.

### Sprint 22 — Tutor GCM Normative Source Verification
- Estado: CERRADO CON PASS CON WARN.
- Resultado: se clasifica con precision lo verificado en repo, lo sintetizado pero no verificado y lo faltante para `source_verified`.
- WARN vigente: faltan acuerdo oficial, guia metodologica, estructura de prueba y soporte de convocatoria/manual trazables en repo.

## Now
1. Prioridad normativa alta: cargar acuerdo oficial, guia metodologica, estructura de prueba y soporte de convocatoria/manual antes de volver a evaluar `source_verified`.
2. Mantener Sprint 22 como clasificacion vigente del frente normativo hasta que exista nueva evidencia documental real.
3. Mantener disciplina de promocion: PR al repo principal -> `master` -> `~/.openclaw/product` -> `/opt/gcm/app` -> Docker OCI -> validacion en `https://cnsc.profemarlon.com`.
4. Ejecutar rotación de `SUPABASE_SERVICE_ROLE_KEY` (Riesgo identificado en Sprint 20).
5. Mantener `npm test`, `npm run lint` y `npm run build` como bundle mínimo de cierre para sprints de contrato/taxonomía.
6. Preparar persistencia de `TutorTurnTrace` para metricas pedagogicas.
7. Mantener Tutor GCM bajo contrato: sin scoring, sin avance, sin cierre, sin fuente normativa inventada.
8. Mantener el bypass de onboarding QA explicitamente como workaround controlado hasta reemplazarlo por un mecanismo oficial y auditable.
9. Mantener la expansion del banco bajo la regla editorial: taxonomia primero, perfiles como segunda capa opcional.

## Next
1. Persistencia y calibración de `learningSignals` y `TutorTurnTrace` con evidencia real de uso.
2. Cierre normativo real del tutor: cargar anexos oficiales, reemplazar placeholders y rehacer revision documental cruzada.
3. Release y runtime confiables: CI minima en GitHub Actions, build, tests unitarios, validacion documental y disciplina publica de runtime.
4. Validacion visual aislada del resumen de trazas: obtener evidencia publica nueva del bloque de resumen del tutor en dashboard si sigue siendo artefacto de cierre requerido.
5. Runtime topology doc: documentar `docker-compose.yml`, env file, dominio, proxy y politica de secretos.

## Later
1. Admin para editar fuente de verdad normativa y perfiles.
2. Expansion gobernada del banco de preguntas.
3. LLM real bajo contrato y solo despues de fuente normativa verificada suficiente.
4. Dashboard interno de uso del Tutor GCM.
5. Personalizacion pedagogica avanzada por concurso/perfil.
6. Refactor liviano de `PracticeSession` segun `docs/01-product/future-practice-session-light-refactor.md`.
