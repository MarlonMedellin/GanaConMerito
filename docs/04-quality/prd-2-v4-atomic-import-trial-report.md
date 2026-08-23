# Reporte de ensayo aislado — PRD 2 Importador V4 atómico

**Fecha:** 2026-08-22

**Entorno:** WSL local, Docker Desktop, Supabase CLI local aislado

**Rama:** `master`

**Producción:** no consultada con credenciales administrativas, no mutada

**Resultado:** PASS local; publicación y CI se registran al cierre del commit

## Corte ensayado

| Evidencia | Valor |
|---|---|
| SHA fuente | `68dfae07baaafa59e00fa7a085ac4b903b62aa07` |
| Cantidad esperada/importada | `248` |
| SHA-256 corpus | `3845d22280819f3d17cb946936f9c41720801d026124b5d726042ec28bbc7533` |
| SHA-256 IDs | `3e1a4ca114ad6393fa48f9e293fc3136e17570f3b09d67953731f6c3a79f2b23` |
| Hash del plan | `6f09c0fc60c9b7cb47ba4e9d076589207c051cf8b63fe0468f87c9bd42f2f418` |
| Manifiesto | `FROZEN` / `APPROVED` |

El generador del plan volvió a calcular inventario y hashes desde los JSON físicos
y los comparó con `content/question-bank-v4/MANIFEST.json` antes de construir el
lote. La evidencia editorial de los 248 IDs se deriva del manifiesto canónico.

## Procedimiento reproducible

1. Auditar en lectura que el historial remoto y el repositorio coinciden hasta
   `0027`.
2. Reconstruir Supabase local desde cero con todas las migraciones `0001–0028` y
   `supabase/seed.sql`.
3. Ejecutar el dry-run determinista del corpus completo.
4. Ejecutar la suite PostgreSQL de integración sobre loopback.
5. Ejecutar el importador real por HTTP contra el RPC local.
6. Ejecutar typecheck, pruebas, build, validaciones de contenido/documentos y
   comprobaciones de diff.

La suite de integración se niega a conectarse a hosts que no sean loopback.
El modo `--apply` exige variables separadas `V4_IMPORT_*`, un ambiente
`local|test|preview|staging` y rechaza la URL configurada para la aplicación.

## Casos obligatorios

| Caso | Evidencia esperada | Resultado |
|---|---|---|
| Importación limpia del corpus | 248 inserts reconciliados | PASS |
| Segunda ejecución | 0 duplicados; 248 sin cambios | PASS |
| JSON de lote inválido | ejecución fallida; 0 escritura parcial | PASS |
| Contrato de ítem inválido | ejecución fallida; 0 escritura parcial | PASS |
| ID duplicado | ejecución fallida; 0 escritura parcial | PASS |
| Hash incorrecto | ejecución fallida; 0 escritura parcial | PASS |
| Cantidad incorrecta | ejecución fallida; 0 escritura parcial | PASS |
| Fallo intermedio provocado | subtransacción revertida completamente | PASS |
| Cuatro opciones por pregunta | 248 con A–D exactas | PASS |
| Preguntas inactivas | draft, no publicadas, no piloto | PASS |
| Vista pre-respuesta | sin clave, explicaciones ni metadata protegida | PASS |
| Vista post-respuesta | solo `service_role` | PASS |
| Filas históricas | preservadas, inactivas y no eliminadas | PASS |
| Seguridad administrativa | `anon` y `authenticated` sin tabla/RPC | PASS |

La traza final de la suite contiene tres ejecuciones exitosas y seis fallidas
esperadas. Cada fallo conserva solo un código seguro y una reconciliación con
`rolledBack=true` y `partialQuestionWrites=0`.

## Tiempos observados

- Reconstrucción completa `0001–0028`, seed y reinicio: aproximadamente `43 s`.
- Suite DB completa final: `1.84 s` después de tener Supabase local listo.
- RPC real por HTTP después del ensayo: `361 ms`, 248/248 sin cambios e inactivas.
- Suite unitaria completa: aproximadamente `22 s`.
- Build de producción: aproximadamente `31 s`, PASS.
- El tiempo y resultado de CI se registran después de publicar el commit.

## Seguridad y límites

- `search_path` fijado a `public, pg_temp` en las funciones administrativas.
- Digest referido como `extensions.digest` dentro de la frontera fija.
- Función y tablas administrativas restringidas a `service_role`.
- No se tocó frontend, targeting, knowledge graph ni contenido individual.
- No se activaron preguntas ni cohortes.
- No se aplicó ninguna migración ni importación en Supabase de producción.
- La prueba local no equivale a runtime público ni autoriza el PRD 3 por sí sola;
  aún se requiere CI verde y revisión/publicación del commit.

## Observación de CI

La primera corrida publicada reveló que una prueba histórica de metadata no aislaba
`NEXT_PUBLIC_APP_BUILD_TIME` definido por el workflow. El test se corrigió para
eliminar explícitamente esa variable en el caso «no proporcionada»; no cambia el
runtime ni el importador y permite que CI evalúe el comportamiento que la prueba
declara.
