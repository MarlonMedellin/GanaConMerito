---
id: PROJ-STATUS
name: status
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: project
last_reviewed: 2026-05-07
---

# Project Status — GanaConMerito

Ultima actualizacion: 2026-05-07 — Cierre Sprint 20.

## Estado general

**Estado:** Sprint 13 cerrado como fuente normativa sintetizada v1 gobernada, no verificada.  
**Producto:** MVP avanzado con core operativo, Tutor GCM gobernado, dashboard con metricas prudentes y contrato de fuente normativa minima.  
**Rama canonica:** `master`.  
**Version declarada en `package.json`:** `0.6.0`.

## Verdad operativa actual

- **HEAD base de Sprint 20:** `9cd7ce44ab60ff7f24a996c244244239bb5f3b97`.
- **Ultimo runtime productivo validado:** `9cd7ce4`.
- **Build time productivo validado:** `2026-05-06T23:08:12Z`.
- **Entorno publico validado:** `https://cnsc.profemarlon.com`.
- **Nota:** Auditoría de Sprint 20 centrada en Tutor GCM y guardrails pedagógicos.

## Modulos activos

### Auth y acceso
- Login con Google activo.
- Runtime metadata visible en `/login`.
- Rutas privadas protegidas.
- Logout validado con proteccion post-logout.
- Fix de configuracion publica Supabase aplicado en PR #1.

### Practica
- Inicio de sesion real desde backend.
- Carga de item por sesion.
- Respuesta con opcion y justificacion opcional.
- Persistencia de turnos y eventos de evaluacion.
- Avance con `advance_session_atomic`.
- Rotacion controlada de item inicial y siguientes items aplicada en PR #3.
- Refactor liviano de `PracticeSession` queda planificado como sprint futuro, no ejecutado en Sprint 13.

### Dashboard / metricas
- Dashboard historico y por sesion activos.
- Contrato de senal de metricas aplicado en PR #6.
- Estados de senal: `no_signal`, `low_signal`, `emerging_signal`, `usable_signal`.
- Copy prudente para evitar promesas exageradas.
- Percentil condicionado por evidencia suficiente.
- Fortalezas/refuerzos condicionados por umbrales minimos.

### Tutor GCM
- Integrado en pantalla de practica.
- Ruta `/api/tutor/turn` autenticada.
- Contexto critico derivado server-side.
- Contrato de fuente de verdad v1 implementado en PR #4.
- Sincronizacion post-respuesta corregida en PR #5.
- Fuente normativa sintetizada v1 integrada al evidence builder en Sprint 13.
- Estado de fuente normativa actual: `synthesized_governed_unverified`.
- Antes de responder no revela clave.
- Despues de responder puede explicar clave, feedback, distractores y justificacion.
- No tiene autoridad sobre scoring, avance, cierre de sesion ni seleccion de items.

### Banco de preguntas
- Corpus activo gobernado de 27 items segun documentacion vigente.
- Validadores de contenido disponibles en scripts npm.
- Expansion editorial del banco sigue fuera de alcance inmediato salvo decision explicita.

## Historial reciente reconciliado

### Sprint 13 — Fuente de verdad normativa sintetizada v1
- **Foco:** cerrar estructura minima de fuente normativa para Tutor GCM sin crear un sistema gigante ni inventar acuerdos/guias oficiales.
- **Resultado:** contrato extendido, modulo `normative-source-truth.ts`, integracion al evidence builder y documentos de arquitectura/compliance.
- **Advertencia:** los adjuntos normativos previos expiraron; la fuente queda como sintetizada gobernada no verificada hasta cargar documentos oficiales.

### PR #6 — Sprint 12: Metricas confiables y utiles v1
- **Merge en master:** `64d78def1d8dd4f98ec9ae5ba55a3fed97e4e4ba`.
- **Foco:** evitar que el dashboard venda conclusiones fuertes con poca senal.
- **Validacion:** deploy y E2E online PASS/WARN menor sobre `64d78de`.
- **Resultado:** dashboard con contrato de senal, copy prudente y restricciones para percentil, fortalezas y refuerzos.

### PR #5 — Sprint 11: Tutor GCM sincronizacion post-respuesta
- **Merge en master:** `1dc454291b22bff41b95125fcbd68e373d8f578a`.
- **Foco:** permitir explicacion post-respuesta sin romper guardrails pre-respuesta.
- **Validacion:** E2E online PASS.
- **Resultado:** `canRevealCorrectAnswer` pasa de `false` a `true` solo despues de respuesta confirmada server-side.

### PR #4 — Sprint 10: Tutor GCM fuente de verdad y contrato pedagogico v1
- **Merge en master:** `7a380328af9fcb974c9ab6497b35380ce9bd06ed`.
- **Foco:** contratos, evidence builder, modos, intenciones, degradacion y trazabilidad preparada.
- **Resultado:** Tutor GCM deja de ser chat libre y opera con fuente de verdad gobernada v1.

### PR #3 — Rotacion controlada de seleccion de items
- **Foco:** evitar que nuevas sesiones inicien siempre con la misma pregunta.
- **Resultado:** seleccion con pool de candidatos, exclusion de recientes y rotacion deterministica.

### PR #2 — Humanizacion UX de etiquetas tecnicas
- **Foco:** evitar slugs crudos como `gestion · lectura_de_indicadores`.
- **Resultado:** etiquetas humanizadas en practica y dashboard.

### PR #1 — Fix de login/Supabase runtime config
- **Foco:** corregir ausencia de variables publicas Supabase en browser bundle.
- **Resultado:** fallback runtime para configuracion publica y login operativo.

## Deuda tecnica viva

1. **Verificacion normativa real:** cargar acuerdo, guia metodologica, estructura de prueba y perfiles/empleos oficiales para pasar de `synthesized_governed_unverified` a `source_verified`.
2. **Persistencia de `TutorTurnTrace`:** el contrato existe, pero falta tabla/escritura para metricas del tutor.
3. **Admin de fuente de verdad:** aun no existe superficie administrativa para editar concursos, guias, perfiles y sintesis normativas.
4. **CI y test script general:** falta script `npm test` agregado como contrato general de QA local.
5. **Runtime topology:** falta documento especifico sobre ubicacion de `docker-compose.yml`, env file, proxy/dominio y politica de secretos.
6. **Refactor liviano de `PracticeSession`:** planificado, no ejecutado.

## Proximos pasos recomendados

1. Sprint 14 recomendado: Persistencia y metricas del Tutor GCM.
2. Sprint futuro: Refactor liviano de `PracticeSession` con E2E online.
3. Sprint futuro: Carga verificada de fuentes normativas oficiales.
4. Sprint futuro: UX guiada del Tutor GCM con intenciones pedagogicas.

## Criterio de cierre del estado actual

El estado actual se considera cerrado si:

- la fuente normativa sintetizada v1 queda integrada al evidence builder;
- la fuente queda marcada como no verificada cuando corresponde;
- el Tutor GCM sigue degradando cuando falta evidencia;
- no se toca scoring, avance, cierre de sesion, Docker, VPS ni Supabase Dashboard;
- los documentos `runtime-flow-map.md` y `server-side-service-role-policy.md` quedan creados.
