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

Ultima actualizacion: 2026-05-07 — Sprint 33 (Stabilization, Governance and Runtime Confidence).

## Estado general

**Estado:** MVP en fase activa de estabilizacion tecnica. El core sigue operativo, pero la expansion funcional permanece congelada hasta cerrar hallazgos P0/P1 del control MVP.  
**Producto:** producto activo con core operativo, Tutor GCM gobernado, dashboard con metricas prudentes y contrato de fuente normativa minima explicitamente clasificado como no oficial/verificado.  
**Sprint actual:** Sprint 33 — Stabilization, Governance and Runtime Confidence.  
**Rama de trabajo Sprint 33:** `sprint-33-stabilization-governance`.  
**Rama canonica:** `master`.  
**Version declarada en `package.json`:** `0.6.0`.

## Verdad operativa actual

- **Fuente de verdad del producto:** `https://github.com/ProfeMarlonMDE/GanaConMerito`.
- **Copia sincronizada operativa en VPS:** `~/.openclaw/product`.
- **Arbol de deploy:** `/opt/gcm/app`.
- **HEAD base de cierre Sprint 21:** `400c7e33e2467e1cadb110b09b2ff7f70ee99a95`.
- **Ultimo runtime publico observado directamente:** `9cd7ce4`.
- **Build time publico observado directamente:** `2026-05-06T23:08:12Z`.
- **Entorno publico validado:** `https://cnsc.profemarlon.com`.
- **Nota:** Sprint 33 se ejecuta inicialmente solo con acceso al repo; no declara validacion runtime nueva.
- **Nota normativa Sprint 22:** la revision documental cruzada confirma alineacion entre producto, arquitectura y compliance, pero no encuentra anexos oficiales suficientes para promover `source_verified`.

## Sprint 33 — foco activo

### Objetivo
Cerrar deuda tecnica critica y elevar la confianza operativa del MVP antes de reabrir expansion funcional.

### Frentes activos
- Backend/API hardening.
- QA stabilization.
- Security remediation.
- Data integrity.
- Release confidence.
- Gobernanza documental.

### Entregables iniciales del Sprint 33
- `docs/02-delivery/sprint-33-stabilization-plan.md`.
- `docs/03-architecture/api-contract-standard-v1.md`.
- `docs/06-governance/runtime-release-rollback-policy.md`.
- `docs/06-governance/qa-smoke-vs-forensic-policy.md`.
- `docs/03-architecture/rate-limiting-adr-001.md`.
- `docs/03-architecture/session-concurrency-adr-002.md`.
- `docs/07-compliance/appsec-remediation-matrix-sprint-33.md`.

### Guardrails Sprint 33
- No abrir nuevas funcionalidades.
- No expandir Tutor GCM.
- No tocar runtime/VPS desde esta rama documental.
- No declarar cierre productivo sin validacion runtime posterior.
- No promover `source_verified` sin anexos oficiales.

## Modulos activos

### Auth y acceso
- Login con Google activo.
- Runtime metadata visible en `/login`.
- Rutas privadas protegidas.
- Logout validado con proteccion post-logout.
- Fix de configuracion publica Supabase aplicado en PR #1.
- Sprint 33 prioriza hardening de callback origin allowlist y middleware privado.

### Practica
- Inicio de sesion real desde backend.
- Carga de item por sesion.
- Respuesta con opcion y justificacion opcional.
- Persistencia de turnos y eventos de evaluacion.
- Avance con `advance_session_atomic`.
- Rotacion controlada de item inicial y siguientes items aplicada en PR #3.
- Sprint 33 prioriza revisar concurrencia e idempotencia de avance.

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
- Estado normativo Sprint 22: **PASS con WARN**.
- Lo verificado en repo es el contrato, el guardrail de degradacion y la propagacion de `sourceTruthStatus`; no la carga oficial completa.
- Antes de responder no revela clave.
- Despues de responder puede explicar clave, feedback, distractores y justificacion.
- No tiene autoridad sobre scoring, avance, cierre de sesion ni seleccion de items.
- Sprint 33 no expande Tutor GCM; solo permite hardening de seguridad, rate limiting y observabilidad.

### Banco de preguntas
- Corpus activo gobernado de 27 items segun documentacion vigente.
- Validadores de contenido disponibles en scripts npm.
- Expansion editorial del banco sigue fuera de alcance inmediato salvo decision explicita.

## Historial reciente reconciliado

### Sprint 33 — Stabilization, Governance and Runtime Confidence
- **Foco:** remediar hallazgos del control MVP sin abrir features nuevas.
- **Resultado parcial:** se crean documentos de plan de estabilizacion, contrato API, rollback, QA smoke/forensic, ADR de rate limiting, ADR de concurrencia y matriz AppSec.
- **Advertencia:** aun falta implementacion de codigo y validacion runtime; no declarar cierre operativo todavia.

### Sprint 22 — Verificacion normativa documental del Tutor GCM
- **Foco:** separar con precision lo verificado en repo, lo sintetizado no verificado y lo faltante para cierre normativo real.
- **Resultado:** `docs/02-delivery/tutor-gcm-normative-verification.md` deja veredicto explicito PASS con WARN, inventario de evidencia y ruta de promocion sin inventar fuentes oficiales.
- **Advertencia:** el cierre funcional previo no equivale a `source_verified`; siguen faltando acuerdo, guia metodologica, estructura de prueba y soporte de convocatoria/manual.

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
- **Resultado:** fallback runtime para configuracion publica Supabase y login operativo.

## Deuda tecnica viva

1. **Backend/API contract drift:** estandarizar envelopes, errores, requestId, validacion y rate limiting.
2. **Seguridad AppSec P0/P1:** callback origin allowlist, middleware privado, endpoints de validacion y logs sanitizados.
3. **QA frágil:** idempotencia debe usar senal estable, no `main.innerText`; separar smoke vs forensic.
4. **Concurrencia de avance de sesion:** cerrar estrategia atomica/idempotente para turnos y session advance.
5. **Verificacion normativa real:** cargar acuerdo, guia metodologica, estructura de prueba y perfiles/empleos oficiales para pasar de `synthesized_governed_unverified` a `source_verified`.
6. **Admin de fuente de verdad:** aun no existe superficie administrativa para editar concursos, guias, perfiles y sintesis normativas.
7. **Runtime rollback:** falta automatizacion real; Sprint 33 deja politica documental inicial.

## Proximos pasos recomendados

1. **Implementacion backend/API:** aplicar contrato API v1 en rutas P0.
2. **Hardening AppSec:** cerrar P0 de callback origin y middleware.
3. **QA estable:** corregir idempotency gate con senal estable y ejecutar Playwright en entorno con browsers.
4. **Datos:** decidir e implementar estrategia de concurrencia para avance de sesion.
5. **Release:** validar politica de rollback contra runtime luego del merge.

## Criterio de cierre del estado actual

El estado Sprint 33 se considera cerrado si:

- Backend/API deja de estar bloqueado por alcance.
- QA critica deja de depender de assertions fragiles.
- Riesgos AppSec P0 quedan corregidos o aceptados formalmente.
- Concurrencia de sesion queda definida e implementable.
- Release/rollback queda documentado y validado al menos manualmente.
- No se agregan features nuevas antes de estabilizar.

## Consolidacion Tutor GCM (Sprint 15 -> Sprint 21)

- Sprint 15: trazas/metricas del tutor reportadas en el roadmap, pero sin verificacion publica nueva en este checkout.
- Sprint 15.1: hardening de agregados y filtrado de guardrails reportado como continuidad; mantener nota de verificacion pendiente contra runtime publico.
- Sprint 16: UX guiada del tutor introducida con acciones sugeridas y textarea libre coexistiendo.
- Sprint 17: consumidor visual del resumen de trazas disponible en dashboard/practica (sin cambios de contrato en este sprint).
- Sprint 18: normalizacion de copy de acciones guiadas y mensajes de apoyo.
- Sprint 19: hardening QA local del tutor solo parcialmente verificable en este checkout; no se declara cierre publico desde aqui.
- Sprint 20: se corrige compatibilidad de copy guiado con intents actuales, se evita perdida permanente del borrador en textarea y se actualiza documentacion viva.
- Sprint 21: cierre funcional del frente con metadata publica vigente, rutas privadas protegidas sin sesion y evidencia QA sanitizada suficiente para declarar PASS con WARN.

**Riesgos abiertos:**
- La fuente normativa sigue en `synthesized_governed_unverified`.
- El frente normativo del tutor no puede declararse cerrado mientras no existan anexos oficiales trazables en repo.
- El bypass de onboarding QA sigue siendo workaround controlado, no flujo estandar.
- El resumen visual de trazas en dashboard no queda en PASS explicito desde esta revision por falta de evidencia aislada suficiente.
