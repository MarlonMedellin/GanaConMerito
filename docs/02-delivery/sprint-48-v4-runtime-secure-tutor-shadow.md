---
id: DEL-SPRINT-48-V4-RUNTIME-SECURE-TUTOR-SHADOW
name: sprint-48-v4-runtime-secure-tutor-shadow
project: ganaconmerito
owner: marlon-arcila
status: in-progress
artifact_type: delivery
modules: [question-bank-v4, database, practice, tutor, security, qa]
tags: [sprint-48, v4-cutover, openrouter, shadow-mode]
last_reviewed: 2026-08-22
related:
  - docs/01-product/prd-v4-tutor-ai-openrouter.md
  - docs/04-quality/quality-gates.md
  - docs/05-ops/documentation-trigger-map.md
---

# Sprint 48 — V4 Runtime Seguro + Tutor IA en Shadow

## Estado

**EN EJECUCIÓN — BLOQUES 0–1 VALIDADOS EN REPO; APLICACIÓN REMOTA PENDIENTE; BLOQUE 2 EN CURSO.**

## Objetivo

Cerrar el corte técnico a V4 y dejar OpenRouter funcionando en shadow mode sin
exponer respuestas, datos personales ni autoridad operativa al LLM.

## Alcance real

Este sprint termina con:

- V4 como única fuente de selección runtime;
- corpus V4 aprobado al corte importado e inicialmente inactivo;
- contratos pre/post respuesta seguros;
- exposición directa de `item_bank` corregida;
- Tutor adaptado a campos V4;
- `TutorProvider` y `OpenRouterProvider` en shadow;
- fallback determinístico preservado;
- evaluación automatizada y documentación alineada.

No termina con canary público, web/RAG, OPEC específica ni deploy productivo del
LLM.

## Orden de ejecución

### Bloque 0 — Seguridad inmediata (P0)

Estado 2026-08-22: implementación de repo completada. Incluye migración `0020`,
lecturas server-only, contrato pre-respuesta sin explicación, respuesta obligatoria
antes del contrato posterior y pruebas automatizadas. Falta aplicar la migración,
desplegar y ejecutar pruebas negativas anon/autenticada en el ambiente remoto.

1. Crear una migración nueva que retire acceso directo `anon`/`authenticated` a
   `item_bank`, `item_options` y vistas que exponen `correct_option`.
2. Conservar escritura/importación sólo para `service_role`/admin.
3. Añadir pruebas REST negativas con la clave anónima.
4. Eliminar `correct_option`, `explanation` y `rationale` del contrato previo a
   respuesta de `/api/session/item`.
5. Confirmar que la evaluación se ejecuta únicamente server-side después de
   validar ownership de sesión.

Gate 0:

- `anon` y un usuario autenticado no pueden leer clave, explicación ni metadata
  privada directamente;
- el payload pre-respuesta no contiene esos campos;
- las sesiones existentes continúan funcionando por las APIs server-side.

Orden operacional obligatorio: desplegar primero el código que usa `service_role`,
validar rutas autenticadas y aplicar después `0020` en la misma ventana. No aplicar
la migración sobre el runtime anterior porque sus rutas todavía dependen de permisos
de usuario autenticado para leer el banco.

### Bloque 1 — Importación V4 operativa (P0)

Estado 2026-08-22: implementación y validación de repo completadas; Gate 1 remoto
todavía abierto. El plan único valida el
contrato y los catálogos, exige evidencia machine-checkable en el registro legacy
o en un lote `APPROVED / CERRADO`, calcula hash reproducible y usa la RPC `0021`
service-only. El lote editorial 07 ya cerró; la aplicación Supabase sigue pendiente.
El dry-run se recalcula contra cada corte online; no fija un total estático en el
contrato. El corte congelado del Sprint 48 contiene 224/224 candidatos y plan hash
`af6f87601015cdf05e47575cbe05896a21860741c30e05ef87d907f4cd148195`.

1. Unificar las validaciones de `content:validate:v4`, `--dry-run` y `--apply`.
2. Parsear y validar `legacy-processing-register.csv`.
3. Implementar la función SQL V4 idempotente y versionada.
4. Importar el 100 % del corpus aprobado al corte, inicialmente inactivo.
5. Verificar A–D, metadatos V4, source path y aprobación.
6. Crear reporte agregado de cobertura por taxonomía y perfil.

Gate 1:

- dry-run y apply producen el mismo plan validado;
- segunda importación no duplica filas;
- Supabase contiene exactamente las V4 aprobadas incluidas en el plan;
- ninguna fila legacy fue borrada.

### Bloque 2 — Repositorio, DTO y selector V4 (P0)

Estado 2026-08-22: implementación de repo completada y validada. El repositorio
server-only lee la vista segura V4 para selección/pre-respuesta y la tabla base
solo para evaluación post-respuesta; no existe fallback legacy. La activación,
prueba E2E y evidencia Supabase permanecen abiertas, por lo que Gate 2 remoto no
se declara aprobado.

1. Crear `V4QuestionRepository` server-only.
2. Crear `PracticeQuestion` y `AnsweredQuestion`.
3. Separar `context` y `stem` en API y UI.
4. Adaptar `session/start`, `session/item`, `session/advance` y selección.
5. Eliminar fallback runtime a legacy.
6. Añadir estado sin inventario con alternativas pertinentes.
7. Activar la cohorte V4 sólo después de pasar Gate 2.

Gate 2:

- práctica usa exclusivamente `bank_version=v4`;
- no hay clave/explicación antes de responder;
- después de responder aparecen explicación elegida, explicación correcta,
  `learningNote` y fuente;
- filtros vacíos generan reporte y alternativas, no fallback legacy.

### Bloque 3 — Refactor mínimo Tutor V4 (P1)

Estado 2026-08-22: implementación de repo completada. `QuestionTruth` y el
constructor de evidencia consumen V4 nativo, el expediente pre-respuesta no carga
la verdad de respuesta y el post-respuesta la obtiene solo tras hallar un turno
contestado. Guardrails, fallback determinístico, trazas y autoridad permanecen.
Gate 3 local queda sujeto a la suite completa de cierre; validación runtime sigue
pendiente.

1. Ampliar `QuestionTruth` con `context`, taxonomía V4, explicaciones, `hint`,
   `learningNote`, `scope` y fuente.
2. Crear expedientes distintos para pre y post respuesta.
3. Mantener intent detection, guardrails, fallback, trazas y autoridad actuales.
4. Eliminar dependencia del normalizador legacy en el flujo V4.
5. Corregir comentarios y documentación que afirman que las trazas no persisten.

Gate 3:

- tests existentes del Tutor permanecen verdes;
- nuevos tests prueban todos los campos V4 y la frontera pre/post;
- scoring, avance y selección no dependen del Tutor.

### Bloque 4 — OpenRouter shadow (P1)

Estado 2026-08-22: implementación de repo completada con configuración opt-in.
El proveedor usa esquema estricto, allowlist de un solo proveedor, ZDR, denegación
de recolección, timeout, reintento transitorio y circuit breaker. Su ejecución se
programa después de responder con el Tutor determinístico y solo persiste métricas
minimizadas. Sin `OPENROUTER_API_KEY`, modelo, proveedor y flag explícitos queda
desactivado. Gate 4 real permanece abierto hasta seleccionar endpoint, configurar
un ambiente y ejecutar shadow contra OpenRouter. La selección inicial quedó fijada
en `openai/gpt-4o-2024-08-06` sobre `azure`; la clave segura y la prueba real siguen
pendientes.

1. Crear interfaz `TutorProvider`.
2. Implementar `DeterministicTutorProvider` y `OpenRouterProvider`.
3. Configurar un único modelo/proveedor aprobado por ambiente.
4. Implementar JSON Schema estricto y validación Zod.
5. Fijar `require_parameters`, `data_collection=deny`, `zdr=true`,
   `allow_fallbacks=false` y provider allowlist.
6. Implementar timeout, un reintento transitorio y circuit breaker simple.
7. Ejecutar OpenRouter en shadow; no mostrar su salida.
8. Registrar sólo métricas minimizadas.

Gate 4:

- proveedor puede sustituirse con mock;
- sin clave o con proveedor caído, la sesión usa fallback;
- salida inválida o peligrosa nunca llega al usuario;
- no se envían datos personales, secretos, rutas ni instrucciones internas.

### Bloque 5 — Evaluación y cierre de repo (P1)

Estado 2026-08-22: cierre de repo completado. La suite ejecuta 120 escenarios
pre/post y adversariales, más fallos OpenRouter mock (timeout, 429, 5xx, JSON
inválido y salida insegura). Typecheck, suite completa, build y validaciones V4 y
documental pasan. Gate 5 real sigue abierto: no hay métricas de proveedor real,
Supabase aplicado, cohorte activa, E2E autenticada ni despliegue.

1. Construir 100–200 escenarios de turno sobre contratos V4.
2. Incluir pre/post respuesta, prompt injection, extracción de secretos,
   normativa ausente, timeout, 429, 5xx y JSON inválido.
3. Medir esquema, seguridad, contradicción, latencia, tokens y costo.
4. Ejecutar typecheck, tests, build, validación V4, validación documental y diff.
5. Actualizar estado, backlog, sprint log, change-log, QA y runtime docs.

Gate 5:

- 0 revelaciones indebidas;
- 0 contradicciones críticas;
- 100 % de respuestas aceptadas válidas;
- p95 <= 8 s y timeout <= 10 s;
- costo p95 objetivo <= USD 0.01/turno;
- fallback seguro para todo fallo rechazado.

## Archivos o áreas previstos

### Nuevos

- migraciones posteriores a `0019` para seguridad e importación V4;
- repositorio y DTO V4;
- proveedor OpenRouter y contrato de salida;
- tests de seguridad, importación, Tutor shadow y cobertura;
- catálogo central de fuentes/perfiles V4 en su fase estructural.

### Modificados

- `scripts/import-question-bank-v4.ts`;
- rutas `session/start`, `session/item`, `session/advance`;
- selector de ítems;
- tipos de sesión y Tutor;
- evidence builder/orchestrator;
- UI de práctica y feedback;
- configuración de entorno documentada;
- documentación canónica relacionada.

### Deliberadamente no tocados

- contenido individual de reactivos V4;
- scoring baseline salvo adaptación de lectura;
- historiales de sesiones;
- bancos Beta/V3/legacy, excepto para desactivarlos de la política por defecto;
- VPS/deploy hasta que el repo y Supabase staging pasen todos los gates.

## Pruebas mínimas

```text
npm run typecheck
npm run test:unit
npm run build
npm run content:validate:v4
npm run content:import:v4 -- --dry-run
npm run test:security
npm run qa:security:question-bank -- --require-authenticated
python3 scripts/validate_docs.py
git diff --check
```

Se deben agregar además:

- prueba REST con anon que niegue columnas sensibles;
- prueba de payload pre-respuesta;
- prueba post-respuesta completa;
- prueba de importación idempotente;
- prueba selector V4 exclusivo;
- prueba de inventario vacío y alternativas;
- prueba OpenRouter mock: éxito, timeout, 429, 5xx, JSON inválido y guardrail;
- E2E autenticada de al menos cinco turnos V4.

## Precondiciones operativas

1. Confirmar con el propietario la nueva huella SSH del VPS antes de acceder.
2. Definir `OPENROUTER_API_KEY` por ambiente sin guardarla en Git.
3. Seleccionar un modelo y endpoint exactos que soporten structured outputs y ZDR.
4. Definir límite de gasto de la clave.
5. Tener entorno de prueba Supabase o ventana controlada para aplicar migraciones.

## Rollback

- desactivar feature flag V4/LLM;
- volver al `DeterministicTutorProvider`;
- marcar cohorte V4 `is_active=false` sin borrar filas;
- conservar bancos e historiales anteriores inactivos;
- revertir grants/policies mediante migración explícita, nunca con cambios manuales
  no versionados.

El rollback técnico no autoriza fallback silencioso al usuario.

## Pregunta humana del piloto posterior

> ¿La ayuda del Tutor te permitió entender mejor cómo analizar la pregunta sin
> darte directamente la respuesta?

Escala 1–5 y comentario opcional.

## Definition of Done

- Bloques 0–5 y sus gates aprobados en repo/staging.
- Evidencia de Supabase sin exposición de secretos.
- OpenRouter ejecutado únicamente en shadow.
- Ningún claim de runtime/deploy productivo sin triple verificación.
- Documentación alineada y deuda posterior explícita.
