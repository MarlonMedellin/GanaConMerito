# Esquema de datos resumido

**Estado:** baseline V4 limpia en repositorio y Supabase local; no desplegada.

## Grupos de tablas

| Grupo | Tablas |
|---|---|
| Identidad | `profiles`, `learning_profiles` |
| Targeting | `target_families`, `target_profiles`, `opec_catalog` |
| Banco | `question_releases`, `questions`, `question_options` |
| Relaciones de targeting | `item_target_families`, `item_target_profiles`, `item_opec_targets` |
| Knowledge | `knowledge_sources`, `knowledge_source_targets`, `item_source_links` |
| Práctica/evaluación | `sessions`, `session_turns`, `evaluation_events`, `user_topic_stats` |
| Tutor | `tutor_turn_traces`, `tutor_shadow_metrics` |
| Operación | `runtime_metadata`, `content_sync_runs` |

## Invariantes

- ID de pregunta textual y estable; opción `A|B|C|D` única por pregunta.
- Un release activo por banco; sincronización no equivale a activación.
- `correct_option`, explicaciones, learning note y fuente reservada viven en
  `questions` y son server-only.
- Cada OPEC verificada pertenece a una familia/perfil existente y conserva
  `position_name` oficial.
- Los targets de reactivo y las fuentes no alteran el JSON V4.
- Sesión y evaluación referencian `question_id`, nunca `item_bank`/UUID legacy.
- El runtime no contiene fallback Legacy/V3.
- `runtime_metadata.baseline_id = gcm-v4-clean-v1` identifica la base compatible.

Las definiciones ejecutables están en `supabase/migrations/0001–0003`. El ER,
justificación por tabla y matriz histórica están en
`docs/database/v4-clean-baseline.md`.
