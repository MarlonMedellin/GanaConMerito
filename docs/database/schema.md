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

## Practice vNext: reparación local pendiente de gate

Agent: CODEX_LOCAL | Model: GPT-6 | Via: Codex desktop | Environment: local worktree.

La migración `20260904232738_practice_tutor_authoritative_attempts.sql` define
`practice_attempts` con UUID único, ownership compuesto sesión/perfil, un intento
activo por sesión, expiración y resultado JSON persistido. `practice_tutor_requests`
reserva cada UUID de turno antes del proveedor; una reserva sin resultado devuelve
conflicto y no vuelve a consumir proveedor. Las funciones invoker están limitadas
a service_role y validan ownership internamente. Los roles públicos no escriben
intentos ni cambian sesiones existentes. La vista `practice_metric_summary` separa
métricas por asistencia durable, vinculada al intento enviado.

`submit_practice_attempt` bloquea el intento y la sesión, valida y ejecuta
`advance_session_atomic` dentro de la misma transacción; persiste el resultado y
el siguiente intento. Review consulta el resultado ya guardado sin recalificar.
No existe aplicación remota ni validación final implícita en esta descripción.

El usuario informa que el ciclo anterior utilizó amend. Esta reparación conserva
ese historial y utiliza únicamente commits nuevos. Drift documental pendiente:
`docs/project/status.md`, documentos generales de runtime y cierre de QA deben
alinearse después del gate sobre SHA exacto; no se declara preparación de release.
