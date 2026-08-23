# Seguridad y autorización

## Base de autenticación

Se asume:
- `profiles.auth_user_id = auth.users.id`

## Modelo actual

### Usuario normal
Puede acceder solo a:
- su perfil
- su learning profile
- sus sesiones
- sus turnos
- sus eventos de evaluación
- sus estadísticas
- sus snapshots

### Admin
Puede además:
- insertar y actualizar `item_bank`
- insertar y actualizar `item_options`

## RLS

La RLS está definida en la migración inicial para:
- `profiles`
- `learning_profiles`
- `sessions`
- `item_bank`
- `item_options`
- `session_turns`
- `evaluation_events`
- `user_topic_stats`
- `user_skill_snapshots`

## Criterios prácticos

- cliente: usar `anon key` + sesión autenticada
- backend: usar `service role` solo cuando sea realmente necesario
- el MVP asume un único admin inicial

## Frontera de respuestas — Sprint 48

La migración `0020_secure_question_answer_boundary.sql` implementa en repositorio
una frontera server-only para el banco de preguntas:

- `anon` y `authenticated` pierden acceso directo a `item_bank`, `item_options`,
  `v_item_bank_active` y `v_question_bank_v4_active`;
- `advance_session_atomic` y `upsert_content_item` dejan de ser ejecutables por
  roles cliente;
- sólo `service_role`, usado después de validar autenticación y ownership en la
  API, lee claves, explicaciones y metadatos editoriales;
- el payload previo a responder no contiene clave, explicación ni `rationale`;
- el contrato posterior se genera únicamente tras persistir una opción válida.

La auditoría efectiva del 2026-08-23 confirmó que producción no respeta esa
frontera pese a registrar `0020`: tablas, vistas legacy y RPC mutantes son
ejecutables por clientes. La remediación monotónica reservada es
`0030_security_question_bank_boundary_remediation.sql`, posterior a `0029`.

`0030` elimina todas las policies de las tablas answer-bearing, revoca ACL cliente
en tablas y vistas, descubre todos los overloads `SECURITY DEFINER` pertinentes,
revoca su ejecución cliente y fija `search_path=public, pg_temp`. Conserva la
superficie server-side de `service_role` y falla atómicamente si la frontera no
queda cerrada. Está validada solo en Supabase local; producción sigue sin cambio.

## Riesgos todavía abiertos

- aún no existe flujo completo de bootstrap automático de `profiles`
- aún no hay auditoría administrativa
- aún no se diferenciaron roles más finos que `is_admin`
- falta autorizar y aplicar la secuencia remota `0029 → 0030`, seguida por pruebas
  negativas `anon`/`authenticated` y positivas `service_role`;
- producción continúa expuesta hasta que `0030` quede aplicada y verificada.
