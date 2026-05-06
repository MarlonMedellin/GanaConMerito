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
last_reviewed: 2026-05-06
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

## Implementado y validado recientemente

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
1. Mantener Sprint 13 como fuente normativa sintetizada no verificada hasta cargar documentos oficiales.
2. Consolidacion Sprint 20 aplicada: copy guiado del tutor compatible con intents actuales y preservacion de borrador en textarea (localmente validado).
3. Mantener disciplina de promocion: PR al repo principal -> `master` -> `~/.openclaw/product` -> `/opt/gcm/app` -> Docker OCI -> validacion en `https://cnsc.profemarlon.com`.
4. Agregar script general `npm test` y baseline local de QA.
5. Preparar persistencia de `TutorTurnTrace` para metricas pedagogicas.
6. Mantener Tutor GCM bajo contrato: sin scoring, sin avance, sin cierre, sin fuente normativa inventada.

## Next
1. **Cierre final Tutor GCM (post Sprint 20)**: validacion publica final del frente con evidencia runtime y PR de cierre.
2. **Sprint 14 — Persistencia y metricas del Tutor GCM**: guardar `TutorTurnTrace` para metricas pedagogicas y auditoria operativa.
3. **Sprint 15 — Fuente normativa oficial verificada**: cargar acuerdo, guia metodologica, estructura de prueba, perfiles/empleos y versionado de fuente.
3. **Sprint 16 — Release y runtime confiables**: CI minima en GitHub Actions, build, tests unitarios, validacion documental y disciplina publica de runtime.
4. **UX guiada del Tutor GCM**: reemplazar caja libre dominante por acciones pedagogicas guiadas.
5. **Runtime topology doc**: documentar `docker-compose.yml`, env file, dominio, proxy y politica de secretos.

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
- `TutorTurnTrace` no se persiste aun en base de datos.

### Media prioridad
- `PracticeSession` crece como componente grande; refactor futuro, no inmediato.
- `TutorInterface` sigue siendo UI basica de pregunta abierta; evolucionar a acciones guiadas.
- Falta documento formal de topologia runtime.
- Falta CI minimo.

## Relacion con modulos
- `auth`: activo y prioritario; mantener estable.
- `onboarding`: activo y endurecido.
- `practice`: nucleo principal del producto; debe seguir siendo practice-first.
- `dashboard`: activo; debe reflejar progreso real sin inflar capacidades analiticas.
- `editorial`: biblioteca documental de solo lectura; no tratar como CMS activo.
- `ai`: Tutor GCM activo con guardrails y fuente normativa sintetizada v1 no verificada.
- `question-bank`: activo y gobernado; expansion solo con decision ejecutiva.

## Criterios de priorizacion
1. Seguridad/auth/datos antes que UX cosmetica.
2. Fuente de verdad verificada antes que LLM real.
3. Trazabilidad antes que personalizacion avanzada.
4. Metricas honestas antes que claims de progreso.
5. Documentacion canonica actualizada antes de abrir nuevos frentes grandes.
