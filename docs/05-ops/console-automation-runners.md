# Runners de automatización de consola — GanaConMerito

## Propósito

Los runners en `runner/` son la capa de orquestación determinista para desarrollo, QA y runtime. No reemplazan los tests existentes en npm/TypeScript/JavaScript; los seleccionan, ejecutan y resumen con checkpoints compactos.

## Regla de uso

Antes de ejecutar manualmente una combinación de comandos que ya tenga runner equivalente, usar el runner versionado. Ejecutar comandos individuales solo para diagnóstico, reparación dirigida o cuando el runner no cubra todavía el caso.

## Runners disponibles

### `runner/gcm-preflight.sh`
Usar al iniciar una tarea local relevante o antes de un gate. Verifica Git, rama/SHA, worktree, Node/npm y disponibilidad opcional de Docker/Supabase sin modificar estado.

### `runner/gcm-check-changes.sh [base-ref]`
Usar para seleccionar pruebas por impacto. Clasifica el diff y ejecuta la evidencia mínima suficiente. Para inspeccionar el plan sin ejecutar pruebas usar `GCM_DRY_RUN=1`.

### `runner/gcm-pr-gate.sh [base-ref]`
Usar antes de declarar una rama lista para PR o antes de actualizar un PR después de cambios locales. Compone preflight, selección de pruebas y `git diff --check`.

### `runner/gcm-canary-gate.sh`
Usar cuando exista un canary ya desplegado y se requiera validar contratos/runtime. Exige `QA_BASE_URL`. Las pruebas live solo se habilitan con `GCM_CANARY_LIVE=1`. Este runner no despliega.

### `runner/gcm-postdeploy-gate.sh`
Usar después de un deploy autorizado. Exige `QA_BASE_URL` y ejecuta el smoke postdeploy existente. Este runner no despliega ni modifica configuración.

### `runner/gcm-runner-selftest.sh`
Usar al cambiar cualquier archivo `runner/*.sh`. Valida sintaxis Bash. GitHub Actions lo ejecuta automáticamente en PRs y pushes a `master`.

## Selección por fase

- Desarrollo local: `gcm-preflight.sh` -> implementación -> `gcm-check-changes.sh`.
- Rama lista para PR: `gcm-pr-gate.sh`.
- PR remoto: GitHub Actions sigue siendo la autoridad final del gate CI.
- Canary ya desplegado: `gcm-canary-gate.sh` con URL explícita.
- Postdeploy: `gcm-postdeploy-gate.sh` con URL explícita.

## Contrato de seguridad

Los runners no deben:

- escribir en Supabase remoto por defecto;
- desplegar, fusionar PRs o modificar DNS/TLS;
- imprimir valores de secretos;
- borrar cambios locales para obtener PASS;
- debilitar tests o guardrails.

Las operaciones remotas o privilegiadas requieren su gate y autorización correspondientes.

## Checkpoint esperado

La salida final de un gate debe poder copiarse a ChatGPT Web o a otro agente usando pares `KEY=value`, por ejemplo:

```text
STATUS=PASS
HEAD_SHA=<sha>
TARGETED_TESTS=PASS
INVARIANTS=PASS
PR_READY=true
```

Los logs completos se conservan para diagnóstico; el handoff usa el checkpoint compacto.

## Reutilización de evidencia

Un PASS obtenido sobre el mismo SHA puede reutilizarse mientras no cambie el entorno o dependencia que ese test valida. No repetir suites completas solo porque cambió el chat o el agente.

## Integración con agentes y skills

El gobernador de desarrollo debe preferir estos runners cuando la tarea corresponda a preflight, selección de pruebas o PR readiness. El gobernador de release debe preferir los runners de canary/postdeploy cuando el runtime objetivo ya exista y el gate sea aplicable.

Si un runner falla, diagnosticar el primer error útil, reparar dentro del alcance autorizado y repetir únicamente el runner o prueba afectada. No sustituir el runner por una secuencia manual equivalente salvo que el fallo esté en el propio runner.

## Evidencia de aceptación V1

La implementación V1 fue validada por GitHub Actions `PR Checks` en el PR #130: self-test de runners, Supabase aislado, reconstrucción de migraciones, validaciones de contenido, lint, unit tests, build, runtime smoke y build reproducible del contenedor finalizaron en `success` sobre el HEAD validado de ese PR.

Agent: ChatGPT Web
Model: GPT-5.6 Sol
