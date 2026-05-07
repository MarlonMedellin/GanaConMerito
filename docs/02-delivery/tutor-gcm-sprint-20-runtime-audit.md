---
id: DEL-TUTOR-GCM-SPRINT-20-RUNTIME-AUDIT
name: tutor-gcm-sprint-20-runtime-audit
project: ganaconmerito
owner: marlon-arcila
status: active
artifact_type: delivery
modules: [tutor, qa, runtime]
tags: [tutor-gcm, sprint-20, runtime, audit]
last_reviewed: 2026-05-06
---

# Tutor GCM Sprint 20 Runtime Audit

## Objetivo

Consolidar una auditoria runtime reciente y segura del frente Tutor GCM para cierre de Sprint 20 / 20.2, dejando explicito que se valido, que no se valido y que riesgos quedan abiertos sin mezclar este registro con operaciones de deploy.

## Referencia auditada

- URL validada: `https://cnsc.profemarlon.com/login`
- Fecha de observacion: `2026-05-06`
- Commit visible en runtime: `9cd7ce44ab60ff7f24a996c244244239bb5f3b97`
- Build time visible en runtime: `2026-05-06T23:08:12Z`
- Base de repo usada para el hardening documental/local de Sprint 20.2: `1b331d1b08ff86aed83b4b79aa77ced48753eeed`

## Criterios PASS / WARN / FAIL

- **PASS**: la URL publica responde, la pagina `/login` renderiza y expone metadata visible de commit/build time; la documentacion no incluye secretos ni logs crudos.
- **WARN**: la observacion runtime reciente no puede vincularse desde esta rama a una reconstruccion/deploy ejecutado en el sprint, o queda una deuda tecnica conocida fuera de alcance.
- **FAIL**: la URL no responde, la metadata visible desaparece, o la auditoria obliga a exponer secretos/logs inseguros para sostener sus afirmaciones.

## Resultado

- Estado: **PASS/WARN CONTROLADO**
- PASS por disponibilidad observable de `https://cnsc.profemarlon.com/login` con `HTTP 200` y metadata visible de commit/build time.
- WARN porque esta auditoria no incluye reconstruccion local del runtime publico, acceso a VPS ni confirmacion de triple coincidencia `product = deploy = runtime visible` dentro de este sprint.

## Que si se verifico

- La URL publica del login respondio `200 OK`.
- El runtime visible conserva metadata de trazabilidad operativa.
- La superficie observada no requirio exponer secretos ni copiar logs crudos.
- El frente Tutor GCM puede cerrarse documentalmente en Sprint 20.2 sin reabrir backend critico, scoring, avance o cierre de sesion.

## Que no se verifico

- No se verifico el flujo autenticado completo del Tutor GCM contra produccion en este sprint.
- No se verifico E2E pesada end-to-end sobre la URL publica.
- No se verifico acceso a VPS, Docker, `/opt/gcm/app` ni `~/.openclaw/product`.
- No se verifico que el commit visible en runtime corresponda exactamente a la base `1b331d1` usada para este hardening local/documental.

## Riesgos abiertos

1. Sigue pendiente reconciliar el runtime publico reciente con la linea documental de `master` para cierre operativo total del frente Tutor GCM.
2. El bypass de onboarding usado en QA sigue existiendo como workaround controlado; acelera preparacion de usuarios de prueba, pero no representa el flujo estandar deseado.
3. La fuente normativa del Tutor GCM permanece en estado `synthesized_governed_unverified`.

## Nota sobre el bypass de onboarding QA

El bypass de onboarding usado en QA debe tratarse como workaround controlado para preparar usuarios de prueba y validar superficies concretas del tutor. No es el flujo estandar deseado para usuarios reales y debe reemplazarse por un mecanismo oficial, repetible y auditable de preparacion QA.
