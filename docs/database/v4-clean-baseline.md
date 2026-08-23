# Baseline limpia de persistencia V4

**Estado:** implementada y validada únicamente en Supabase local en la rama de
rebaseline. No está aplicada en ningún proyecto remoto ni activa en producción.

## Decisión canónica

V4 es la única arquitectura operacional futura. GitHub conserva el canon
editorial y Supabase es una proyección reconstruible:

```text
GitHub → contenido canónico → plan determinista → Supabase → runtime
```

Legacy y V3 quedan como historia de producto. No se preservan filas, UUID,
sesiones ni estadísticas antiguas durante el futuro cutover. La ruta productiva
histórica `0029 → 0030` queda **superseded** para esta base limpia, aunque PR #102
continúa siendo evidencia útil del contrato de seguridad.

La cadena ejecutable nueva vive en `supabase/migrations/` y puede crear una base
vacía sin ejecutar la historia. Las migraciones `0001–0030` anteriores se
conservan sin reescritura en `supabase/legacy-migrations/`. Antes del primer DDL,
`0001_v4_clean_foundation.sql` ejecuta dentro de la misma transacción un guard que
aborta con `GCM_V4_CLEAN_BASELINE_REFUSES_LEGACY_DATABASE` si encuentra marcadores
Legacy (`item_bank`, `item_options`, perfiles/núcleos/vistas/importadores
históricos, columnas representativas) o versiones `0001–0030` en el ledger de
Supabase. Al estar al inicio de la transacción, el rechazo deja cero objetos V4
parciales. El motor exige además `baseline_id = gcm-v4-clean-v1` e identidad
exacta de instancia.

`npm run test:v4-baseline-guard` crea dos bases PostgreSQL locales desechables:
una limpia debe construir `0001–0003`; otra con `item_bank`, `item_options` y
ledger `0029` debe ser rechazada por el guard y conservar cero objetos V4.

## Modelo y relaciones

```text
target_families ──< target_profiles ──< opec_catalog
       │                  │                    │
       └── item_target_families               │
questions ──< question_options                │
    ├──< item_target_profiles                 │
    ├──< item_opec_targets >──────────────────┘
    ├──< item_source_links >── knowledge_sources
    ├──< session_turns ── evaluation_events
    └──< tutor_turn_traces

profiles ── learning_profiles
    ├──< sessions ──< session_turns
    ├──< user_topic_stats
    └──< tutor_turn_traces ──< tutor_shadow_metrics

question_releases ──< questions
content_sync_runs  (historial seguro del reconciliador)
```

La jerarquía de targeting es exactamente `perfil reusable → positionName
oficial → OPEC concreta`. `positionName` pertenece a `opec_catalog`; no existen
perfiles por disciplina, `targetKind` ni semántica `primary|compatible`.

La selección para una OPEC combina relaciones de familia, perfil y OPEC sin
duplicar reactivos. Taxonomía, targeting y conocimiento permanecen separados.

## Justificación de tablas actuales

| Tabla | Necesidad actual | Consumidor |
|---|---|---|
| `runtime_metadata` | Identificar baseline/instancia y bloquear un target equivocado | sync/operación |
| `profiles` | Vincular usuario autenticado y autorización admin | APIs, RLS |
| `learning_profiles` | Meta vigente por perfil u OPEC y preferencias Tutor | onboarding, sesiones, Tutor |
| `target_families` | Base común reusable | onboarding, selector |
| `target_profiles` | Seis perfiles docentes reusables | onboarding, selector, Tutor |
| `opec_catalog` | OPEC verificadas con `positionName` oficial | onboarding, selector |
| `question_releases` | Identidad y activación explícita de un corte sincronizado | repositorio V4 |
| `questions` | Reactivo V4 y verdad editorial server-only | selección, evaluación, Tutor servidor |
| `question_options` | Opciones A–D normalizadas | DTO de práctica servidor |
| relaciones `item_target_*` | Aplicabilidad externa sin tocar los 248 JSON | selector |
| `knowledge_sources` | Fuentes verificadas reutilizables | Tutor/evidencia |
| `knowledge_source_targets` | Aplicabilidad aprobada de fuentes | targeting/evidencia |
| `item_source_links` | Evidencia fuente-reactivo | Tutor servidor |
| `sessions`, `session_turns` | Flujo de práctica vigente | endpoints de sesión |
| `evaluation_events` | Resultado por turno | evaluación/dashboard |
| `user_topic_stats` | Agregado que consume producto | dashboard/selector |
| `tutor_turn_traces`, `tutor_shadow_metrics` | Trazas y medición Tutor realmente usadas | Tutor/observabilidad |
| `content_sync_runs` | SHA, hashes, conteos, estado, actor y verificación | CLI/API admin |

No se persiste un snapshot pedagógico adicional ni payload editorial completo en
logs. El historial del reconciliador contiene metadatos y errores saneados.

## Matriz de reemplazo histórico

| Campo/tabla histórica | Decisión | Razón | Consumidor nuevo |
|---|---|---|---|
| `item_bank` | Reemplazar por `questions` | V4 usa ID editorial estable y contrato propio | repositorio V4 |
| `item_options` | Reemplazar por `question_options` | FK textual V4 y reconciliación determinista | práctica |
| UUID de ítem | Eliminar | No hay historial productivo que preservar | ninguno |
| `bank_version`/fallback | Eliminar | V4 es exclusiva | selector |
| `professional_profiles` | Reemplazar por `target_profiles` | Perfil reusable canónico | onboarding/Tutor |
| `target_role`, `exam_type` | Eliminar | Dimensiones legacy redundantes | ninguno |
| `thematic_nuclei` y relaciones | Eliminar | Taxonomía V4 ya cubre el consumo vigente | ninguno |
| `opec_id` embebido como selector | Reemplazar por catálogo y relaciones | OPEC es entidad verificable, no taxonomía | selector |
| `targetKind`, `primary|compatible` | Eliminar | Semántica prohibida/no necesaria | ninguno |
| `user_skill_snapshots` | Eliminar | No tiene consumidor runtime vigente | ninguno |
| sesiones/turnos/evaluaciones legacy | Recrear limpias | Se conserva el flujo, no sus filas/UUID | sesión/dashboard |
| estadísticas legacy | Recrear como `user_topic_stats` | Solo el agregado consumido | dashboard |
| trazas/métricas Tutor | Recrear con `question_id` V4 | Tutor actual sí las consume | Tutor |
| manifests/import runs legacy | Reemplazar por releases/sync runs | Un único reconciliador GitHub → Supabase | operación |
| `content/normative` | Histórico; no se copia | Knowledge base evita duplicación | ninguno directo |

## Frontera pre/post respuesta

La vista pre-respuesta expone contexto, stem, taxonomía permitida, hint y opciones
obtenidas por backend. Nunca contiene clave, explicaciones, nota de aprendizaje ni
referencia editorial reservada. `questions`, `question_options`, releases,
mappings, fuentes y las tres vistas V4 tienen cero acceso para `anon` y
`authenticated`.

El backend con `service_role` consulta la vista post-respuesta para evaluar y
construir evidencia Tutor. Scoring, selección y autoridad operacional siguen fuera
del LLM. Las funciones `SECURITY DEFINER` fijan `search_path = public, pg_temp`.

## Activación y cutover futuro

1. Crear un proyecto Supabase nuevo, vacío y aprobado.
2. Aplicar solo `0001–0003` y registrar el `instance_id` esperado.
3. Ejecutar validate/plan/diff con el SHA Git exacto y árbol limpio.
4. Aprobar el `plan_hash`; aplicar y verificar `248` preguntas y `992` opciones.
5. Poblar/validar mappings y catálogos reales que aún estén vacíos.
6. Activar explícitamente el release, desplegar la aplicación y ejecutar E2E.
7. Retirar la instancia legacy solo mediante un checkpoint posterior.

Nada de lo anterior autoriza acciones remotas desde esta rama.
