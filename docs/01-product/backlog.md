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
last_reviewed: 2026-05-08
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
- **Cierre funcional Tutor GCM (Sprint 21):** PASS con WARN explícito.
- **Frente normativo Tutor GCM (Sprint 22):** PASS con WARN explícito; contrato y guardrails verificados, fuente oficial suficiente pendiente.

## Implementado y validado recientemente

### Sprint 22 — Tutor GCM Normative Source Verification
- Estado: CERRADO CON PASS CON WARN.
- Resultado: se clasifica con precision lo verificado en repo, lo sintetizado pero no verificado y lo faltante para `source_verified`.
- WARN vigente: faltan acuerdo oficial, guia metodologica, estructura de prueba y soporte de convocatoria/manual trazables en repo.

### Sprint 21 — Tutor GCM Final Runtime Closure
- Estado: CERRADO CON PASS CON WARN.
- Resultado: cierre funcional del frente Tutor GCM con metadata publica vigente y evidencia QA sanitizada suficiente para visibilidad del tutor, acciones guiadas, guardrail pre-respuesta y explicacion post-respuesta.
- WARN vigente: fuente normativa no verificada, bypass de onboarding QA como workaround controlado y ausencia de evidencia aislada suficiente para marcar PASS explicito del resumen visual de trazas en dashboard.

### Sprint 13 — Fuente de verdad normativa sintetizada v1
- Estado: CERRADO CON WARN EXPLICITO.
- Resultado: fuente normativa sintetizada gobernada integrada al Tutor GCM.
- Advertencia: no equivale a fuente oficial verificada porque los adjuntos normativos previos expiraron y no fueron recargados.

### Sprint 12.1 — Reconciliacion documental y mapa real del producto
- Estado: CERRADO.
- Resultado: documentacion canonica alineada con Sprints 10, 11 y 12.

### Sprint 12 / PR #6 — Metricas confiables y utiles v1
- Estado: CERRADO CON PASS/WARN MENOR.
- Resultado: dashboard con contrato de senal, copy prudente, percentil condicionado y recomendaciones accionables.

### Sprint 11 / PR #5 — Tutor GCM sincronizacion post-respuesta
- Estado: CERRADO.
- Resultado: Tutor reconoce estado post-respuesta y puede explicar clave/feedback/distractores solo cuando corresponde.

### Sprint 10 / PR #4 — Tutor GCM fuente de verdad y contrato pedagogico v1
- Estado: CERRADO.
- Resultado: contratos, evidence builder, modos, intenciones, guardrails y degradacion honesta implementados.

### PR #1 a #3
- Login/Supabase runtime public config corregido.
- Etiquetas tecnicas humanizadas.
- Rotacion controlada de seleccion de items implementada.

## Now
1. Prioridad normativa alta: cargar acuerdo oficial, guia metodologica, estructura de prueba y soporte de convocatoria/manual antes de volver a evaluar `source_verified`.
2. Mantener Sprint 22 como clasificacion vigente del frente normativo hasta que exista nueva evidencia documental real.
3. Mantener disciplina de promocion: PR al repo principal -> `master` -> `~/.openclaw/product` -> `/opt/gcm/app` -> Docker OCI -> validacion en `https://cnsc.profemarlon.com`.
4. Ejecutar rotación de `SUPABASE_SERVICE_ROLE_KEY` (Riesgo identificado en Sprint 20).
5. Agregar script general `npm test` y baseline local de QA.
6. Preparar persistencia de `TutorTurnTrace` para metricas pedagogicas.
7. Mantener Tutor GCM bajo contrato: sin scoring, sin avance, sin cierre, sin fuente normativa inventada.
8. Mantener el bypass de onboarding QA explicitamente como workaround controlado hasta reemplazarlo por un mecanismo oficial y auditable.
9. Mantener la expansion del banco bajo la regla editorial: taxonomia primero, perfiles como segunda capa opcional.

## Next
1. **Cierre normativo real del tutor**: cargar anexos oficiales, reemplazar placeholders y rehacer revision documental cruzada.
2. **Persistencia y metricas del Tutor GCM**: guardar `TutorTurnTrace` para metricas pedagogicas y auditoria operativa.
3. **Release y runtime confiables**: CI minima en GitHub Actions, build, tests unitarios, validacion documental y disciplina publica de runtime.
4. **Validacion visual aislada del resumen de trazas**: obtener evidencia publica nueva del bloque de resumen del tutor en dashboard si sigue siendo artefacto de cierre requerido.
5. **Runtime topology doc**: documentar `docker-compose.yml`, env file, dominio, proxy y politica de secretos.
6. **Adopcion progresiva de metadatos de perfil en runtime**: decidir si `targetRole`, `targetPosition` y `applicantProfile` deben pasar del Markdown editorial a los contratos activos de lectura.

## Later
1. Admin para editar fuente de verdad normativa y perfiles.
2. Expansion gobernada del banco de preguntas.
3. LLM real bajo contrato y solo despues de fuente normativa verificada suficiente.
4. Dashboard interno de uso del Tutor GCM.
5. Personalizacion pedagogica avanzada por concurso/perfil.
6. Refactor liviano de `PracticeSession` segun `docs/01-product/future-practice-session-light-refactor.md`.

## Deuda tecnica viva

### Alta prioridad
- No existe `npm test` como contrato general.
- Fuente normativa del Tutor GCM aun no esta verificada con documentos oficiales completos.
- El frente normativo del tutor no debe declararse cerrado mientras el repo no tenga anexos oficiales trazables.
- `TutorTurnTrace` no se persiste aun en base de datos.

### Media prioridad
- `PracticeSession` crece como componente grande; refactor futuro, no inmediato.
- Falta documento formal de topologia runtime.
- Falta CI minimo.
- La parte normativa del tutor sigue abierta aunque el frente funcional ya cierre con PASS con WARN.
- La segunda capa por perfiles docentes aun no se refleja de punta a punta en todos los contratos de runtime.

## Relacion con modulos
- `auth`: activo y prioritario; mantener estable.
- `onboarding`: activo y endurecido.
- `practice`: nucleo principal del producto; debe seguir siendo practice-first.
- `dashboard`: activo; debe reflejar progreso real sin inflar capacidades analiticas.
- `editorial`: biblioteca documental de solo lectura y sistema de gobierno del banco; no tratar como CMS activo.
- `ai`: Tutor GCM activo con guardrails y fuente normativa sintetizada v1 no verificada.
- `question-bank`: activo y gobernado; base taxonomica en `content/items/` y segmentacion secundaria opcional por perfil.

## Criterios de priorizacion
1. Seguridad/auth/datos antes que UX cosmetica.
2. Fuente de verdad verificada antes que LLM real.
3. Trazabilidad antes que personalizacion avanzada.
4. Metricas honestas antes que claims de progreso.
5. Documentacion canonica actualizada antes de abrir nuevos frentes grandes.
6. No fragmentar el banco por cargo cuando basta con taxonomia base mas metadatos secundarios.

## Deuda Sprint 35-36 formalizada en Sprint 37
- Admin futuro de Tutor Dossier: edicion editorial por item, validacion de hint ladder, validacion de misconceptions y previsualizacion de no revelacion.
- Gobernanza del dossier: versionado propio, auditoria editorial y relacion explicita con item version.
- Guardrails: Sprint 37 centraliza enforcement minimo; si el tutor crece, se requiere capa formal dedicada.
- Coherencia normativa: mantener `normative-source-truth-v1` como base sintetizada; el dossier tutorial no reemplaza fuente normativa primaria.
