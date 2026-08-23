# Seguridad de la baseline V4

**Estado:** contrato aplicado y probado en Supabase local; no verificado remoto.

## Frontera del banco

- `anon`: cero acceso a banco crudo, opciones, releases, mappings, knowledge,
  vistas V4 y sync runs.
- `authenticated`: el mismo cero acceso al banco; solo identidad propia,
  learning profile, sesiones propias, estadísticas propias y catálogos públicos
  activos/verificados de targeting.
- `service_role`: acceso backend para selección, evaluación, Tutor y sync.
- toda mutación editorial/sync es backend autorizado.

El DTO pre-respuesta nunca contiene clave, explicaciones, learning note o fuente
editorial reservada. La verdad post-respuesta se consulta solo en servidor.

## Controles SQL

- RLS habilitada en todas las tablas públicas;
- privilegios revocados primero y grants mínimos explícitos;
- funciones `SECURITY DEFINER` con `search_path = public, pg_temp`;
- RPC de sesión y sync ejecutables solo por `service_role`;
- `baseline_id` e `instance_id` evitan operar sobre la base equivocada;
- errores de sync saneados, sin payload editorial ni secretos.

## Evidencia obligatoria

Los gates locales prueban ACL/RLS como anon, authenticated y service role; probes
REST; frontera pre/post; función atómica de sesión; atomicidad e idempotencia del
sync. Un estado local verde no demuestra que producción comparta este esquema.

PR #102 y la migración legacy `0030` siguen siendo evidencia histórica útil, pero
la seguridad de la base nueva nace de `supabase/migrations/0001–0003`.
