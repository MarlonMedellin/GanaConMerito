---
id: PRD-CONSOLE-AUTOMATION-RUNNERS
name: console-automation-runners
status: validated-v1
artifact_type: prd
modules: [quality, delivery, operations, tutor, content]
owner: GanaConMerito
created: 2026-09-01
---

# PRD — Automatización de pruebas y operaciones de consola

## Problema

GanaConMerito dispone de pruebas unitarias, contratos, validaciones de contenido, E2E, smoke tests, canary, Supabase local y CI, pero su ejecución local y sus handoffs siguen requiriendo combinar manualmente múltiples comandos. Esto aumenta repetición, riesgo de omitir gates y volumen de logs transferidos entre agentes.

## Objetivo

Crear una capa Bash versionada que orqueste capacidades existentes sin duplicar su lógica y produzca checkpoints compactos, reproducibles y aptos para agentes locales y humanos.

## Principios

1. Los runners orquestan; los tests siguen viviendo en TypeScript/JavaScript/npm.
2. Ningún runner modifica producción o Supabase remoto por defecto.
3. Las operaciones contra runtime requieren URL/variables explícitas.
4. Un fallo devuelve código distinto de cero y un checkpoint legible.
5. Se reutilizan pruebas por impacto antes de ejecutar suites completas.
6. No se imprimen valores de secretos.
7. Los scripts deben funcionar en Bash sobre Linux/WSL y CI Ubuntu.

## Alcance V1

### R1 — Preflight
`runner/gcm-preflight.sh`

Verifica repositorio Git, worktree, Node, npm, SHA/rama y disponibilidad opcional de Docker/Supabase. No modifica el repositorio.

### R2 — Selección de pruebas por impacto
`runner/gcm-check-changes.sh [base-ref]`

Clasifica archivos modificados y ejecuta la evidencia mínima suficiente:

- documentación: `check:doc-triggers`;
- Tutor/AI: `test:tutor` + typecheck;
- contenido/V4: validadores de contenido + pruebas V4;
- API/seguridad/Supabase: seguridad + typecheck;
- UI/app general: vertical contract + typecheck;
- cambios transversales/configuración: unit + typecheck + build.

El runner acepta `GCM_DRY_RUN=1` para mostrar el plan sin ejecutar tests.

### R3 — Gate local de PR
`runner/gcm-pr-gate.sh [base-ref]`

Compone preflight, selección por impacto y `git diff --check`. Produce un checkpoint final `STATUS`, `HEAD_SHA`, `BASE_REF`, `WORKTREE`, `TARGETED_TESTS`, `INVARIANTS` y `PR_READY`.

### R4 — Gate canary
`runner/gcm-canary-gate.sh`

Requiere `QA_BASE_URL` explícita. Ejecuta contratos canary y, cuando `GCM_CANARY_LIVE=1`, las pruebas live existentes `qa:canary:resume` y `qa:canary:vertical`. No despliega ni altera configuración del servidor.

### R5 — Gate postdeploy
`runner/gcm-postdeploy-gate.sh`

Requiere `QA_BASE_URL` explícita y ejecuta `qa:smoke:postdeploy`. No despliega.

### R6 — Validación de runners
`runner/gcm-runner-selftest.sh`

Ejecuta `bash -n` sobre todos los runners para impedir scripts sintácticamente inválidos.

## Fuera de alcance V1

- merge automático;
- deploy automático;
- escritura en Supabase remoto;
- rotación o lectura de secretos;
- rollback automático;
- modificación de DNS/TLS;
- reemplazo de GitHub Actions;
- comparación visual pixel-perfect.

## Contrato de salida

Los gates deben terminar con líneas `KEY=value` y código `0` para PASS o distinto de cero para FAIL/BLOCKED. Los logs detallados pertenecen al comando subyacente; el resumen debe poder copiarse directamente a un handoff.

## Integración CI

`pr-checks.yml` ejecuta `runner/gcm-runner-selftest.sh`. El workflow existente continúa siendo la autoridad para Supabase aislado, contenido, lint, unit tests, build, runtime smoke y Docker build.

## Criterios de aceptación V1

- Todos los runners pasan `bash -n`.
- `gcm-check-changes.sh` soporta dry-run sin servicios externos.
- `gcm-pr-gate.sh` no escribe en Git ni en servicios externos.
- canary/postdeploy se bloquean si falta `QA_BASE_URL`.
- ninguna clave o secreto se imprime.
- CI conserva sus gates actuales y añade self-test de runners.

## Evidencia de validación

GitHub Actions `PR Checks` run `33532685380` finalizó en `success` para el HEAD `1c37aac34bddce915e564ee3f6ebec10e81eb13a` del PR #130. Pasaron el self-test de runners, Supabase aislado y reset de migraciones, validaciones de contenido, lint, unit tests, build, production runtime smoke y build reproducible de Docker.

Los cambios documentales posteriores deben volver a pasar CI en el nuevo HEAD antes del merge.

## Operación

La política de uso diario, orden por fase, variables opt-in y reglas de seguridad está en `docs/05-ops/console-automation-runners.md`.

## Evolución posterior

V2 podrá incorporar servidor local administrado por PID, auth-state Playwright, regresión visual, RLS multiusuario, secret scanning, release evidence pack, inspección de rollback y selección de pruebas basada en un manifiesto declarativo.

Agent: ChatGPT Web
Model: GPT-5.6 Sol
