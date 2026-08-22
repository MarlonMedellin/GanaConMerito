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

Estado operativo al 2026-08-22: implementado y probado en repo; no aplicado aún
en Supabase ni verificado en runtime. La secuencia segura es desplegar primero el
código server-only, validar las APIs y aplicar después la migración dentro de la
misma ventana controlada. Ante falla posterior, se corrige el servidor hacia
adelante; no se reabren permisos públicos como rollback ordinario.

## Riesgos todavía abiertos

- aún no existe flujo completo de bootstrap automático de `profiles`
- aún no hay auditoría administrativa
- aún no se diferenciaron roles más finos que `is_admin`
- falta aplicar y verificar `0020` con pruebas negativas anon/autenticada;
- el runtime anterior a `0020` continúa expuesto hasta completar deploy y migración.
