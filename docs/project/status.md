---
id: PROJ-STATUS
name: status
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: project
last_reviewed: 2026-05-08
---

# Project Status — GanaConMerito

Ultima actualizacion: 2026-05-08 — Sprint 37 (Tutor Trace Signals and Governance Stabilization Prep).

## Estado general

**Estado:** MVP estabilizado operativamente despues del cierre de Sprint 33. El core esta desplegado, Docker construye correctamente, smoke local/publico fue reportado como PASS y la suite UI E2E fue reportada como PASS.  
**Producto:** producto activo con core operativo, Tutor GCM gobernado, dashboard con metricas prudentes y contrato de fuente normativa minima explicitamente clasificado como no oficial/verificado.  
**Sprint actual:** Sprint 37 — Tutor Trace Signals and Governance Stabilization Prep.  
**Sprint anterior cerrado:** Sprint 36 — Tutor Hint Ladder, Misconception Feedback and Safe Modes.  
**Rama canonica:** `master`.  
**Version declarada en `package.json`:** `0.6.0`.

## Verdad operativa actual

- **Fuente de verdad del producto:** `https://github.com/ProfeMarlonMDE/GanaConMerito`.
- **Copia sincronizada operativa en VPS:** `~/.openclaw/product`.
- **Arbol de deploy:** `/opt/gcm/app`.
- **Commit Sprint 33 desplegado y verificado:** `ecf541688275fc53d48c811ed5ffa80a44a8bdb9`.
- **Short hash Sprint 33 verificado:** `ecf5416`.
- **Build time Sprint 33 reportado:** `2026-05-08T01:12:19Z`.
- **Entorno publico validado:** `https://cnsc.profemarlon.com`.
- **Deployment Status:** SUCCESS.
- **Operational Status:** STABLE.
- **Nota normativa Sprint 22:** la revision documental cruzada confirma alineacion entre producto, arquitectura y compliance, pero no encuentra anexos oficiales suficientes para promover `source_verified`.

## Sprint 37 — foco activo

- Sprint 35 y Sprint 36 se registran como ejecutados con `npm run test:tutor` en verde.
- Runtime publico/VPS de Sprint 35-37: NO VALIDADO EN ESTA CORRIDA (solo repo).
- `npm run test:unit` corre en verde en repo local despues del ajuste de coherencia documental de Sprint 37.

## Sprint 33 — cierre operacional

### Resultado
Sprint 33 queda cerrado operacionalmente como estabilizacion de gobernanza, runtime confidence y suite de validacion reciente.

### Evidencia reportada
- Source Sync `~/.openclaw/product`: `ecf5416` OK.
- Deploy Alignment `/opt/gcm/app`: `ecf5416` OK.
- Docker Build & Restart: `gcm-app` reconstruido y running.
- Build/Lint: PASS.
- Unit Tests: PASS.
- Smoke Tests Local: PASS en puerto 3000.
- Smoke Tests Public: PASS en `cnsc.profemarlon.com`.
- UI E2E Playwright: PASS.
- API E2E Playwright: drift decimal reportado y corregido mediante tolerancia controlada para `avg_difficulty`.
- Sprint Contract Test: drift documental reportado y corregido declarando Sprint 33 cerrado y Sprint 34 vigente.

### Estado final Sprint 33
- **Deployment Status:** SUCCESS.
- **Operational Status:** STABLE.
- **QA Status:** PASS esperado tras correccion de tolerancia y contrato documental.
- **Cierre:** CERRADO OPERACIONALMENTE.

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

### Banco de preguntas
- Corpus activo gobernado de 27 items segun documentacion vigente.
- Validadores de contenido disponibles en scripts npm.
- Expansion editorial del banco sigue fuera de alcance inmediato salvo decision explicita.

## Deuda tecnica viva

1. **CI vs VPS:** confirmar que GitHub Actions quede verde despues de la correccion documental y de tolerancia semantica.
2. **Seguridad AppSec P0/P1:** callback origin allowlist, middleware privado, endpoints de validacion y logs sanitizados.
3. **Verificacion normativa real:** cargar acuerdo, guia metodologica, estructura de prueba y perfiles/empleos oficiales para pasar de `synthesized_governed_unverified` a `source_verified`.
4. **Admin de fuente de verdad:** aun no existe superficie administrativa para editar concursos, guias, perfiles y sintesis normativas.
5. **Runtime rollback:** falta automatizacion real aunque existe politica documental inicial.

## Criterio de cierre del estado actual

El estado Sprint 37 se considerara listo para cierre de repo cuando:

- GitHub Actions y VPS reporten PASS en la misma version de `master`.
- `test:recent-sprints` valide Sprint 33 cerrado y Sprint 37 activo.
- `qa:e2e:api` deje de fallar por drift decimal controlado.
- `qa:e2e:ui` siga pasando en modo live Playwright Chromium.
- La metadata publica de `/login` coincida con el HEAD desplegado.

## Riesgos abiertos

- La fuente normativa sigue en `synthesized_governed_unverified`.
- El frente normativo del tutor no puede declararse cerrado mientras no existan anexos oficiales trazables en repo.
- El bypass de onboarding QA sigue siendo workaround controlado, no flujo estandar.
