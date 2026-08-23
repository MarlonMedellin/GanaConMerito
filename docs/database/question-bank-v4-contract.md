# Contrato de persistencia y lectura V4

**Estado:** baseline limpia implementada y validada solo localmente. No desplegada.
**Decisión superseding (2026-08-23):** este contrato reemplaza la adopción
aditiva sobre `item_bank` y la ruta `0029 → 0030` para el futuro cutover V4.

## Fuente de verdad

`content/question-bank-v4/MANIFEST.json` fija el corte editorial; sus JSON y
taxonomía son el canon. Supabase es una proyección operacional reconstruible y no
acepta edición editorial como fuente alternativa.

## Persistencia

- `question_releases`: SHA y hashes del corte; un release activo por banco.
- `questions`: ID editorial V4 estable, taxonomía, contenido y verdad reservada.
- `question_options`: cuatro opciones A–D por reactivo.
- `target_families`, `target_profiles`, `opec_catalog`: targeting normalizado.
- `item_target_families`, `item_target_profiles`, `item_opec_targets`: relaciones
  externas al JSON congelado, sin duplicar reactivos.
- `knowledge_sources`, `knowledge_source_targets`, `item_source_links`: evidencia
  verificada y aplicabilidad aprobada.
- `content_sync_runs`: historia segura de reconciliación.

No existen `item_bank`, UUID de ítem, `bank_version`, fallback Legacy/V3,
`targetKind` ni semántica `primary|compatible` en la baseline nueva.

El modelo completo y la matriz histórica están en
`docs/database/v4-clean-baseline.md`.

## Targeting

```text
familia → perfil reusable → positionName oficial → OPEC concreta
```

`positionName` es atributo oficial de una OPEC; no es un perfil adicional. La
selección de una OPEC une preguntas de familia + perfil + OPEC. Taxonomía y
targeting son dimensiones independientes.

## Lectura segura

- `v_question_bank_v4_active` / `practice`: metadatos pre-respuesta permitidos.
- `question_options`: el backend arma las opciones del DTO de práctica.
- `v_question_bank_v4_answered`: verdad post-respuesta reservada a servidor.
- `V4QuestionRepository`: único repositorio runtime; no tiene fallback legacy.

El cliente nunca consulta las tablas/vistas del banco: `anon` y `authenticated`
tienen cero privilegios sobre preguntas, opciones, releases, mappings y fuentes.
El backend `service_role` evalúa y arma la respuesta autorizada. El LLM recibe
evidencia acotada y nunca decide scoring, selección ni autoridad operacional.

## Sincronización

El único reconciliador está descrito en `docs/05-ops/content-sync.md`. La
aplicación exige identidad exacta de baseline/instancia y que el hash efectivo sea
igual al plan aprobado; aplica el lote de forma atómica, verifica e informa drift.

## Activación

Sincronizar no activa. Un release nace `synced`; la activación requiere un
checkpoint posterior, mappings elegibles, pruebas de runtime y despliegue
autorizado. La presencia de archivos o tests locales no demuestra estado remoto.
