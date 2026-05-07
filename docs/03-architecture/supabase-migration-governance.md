# Supabase Migration Governance — Sprint 33

## Objetivo
Definir reglas de gobernanza para migraciones Supabase que reduzcan drift entre ambientes, eviten prefijos duplicados, protejan integridad de datos y hagan los cambios reversibles o recuperables.

## Estado

- Sprint: 33.19
- Rol lider: PM-Data
- Estado: PROPOSED
- Runtime validado: no
- Implementacion de migraciones: pendiente
- Alcance: `supabase/migrations/**`, auditoria DB y disciplina pre-merge

## Hallazgo base

La auditoria de datos identifico riesgos relevantes:

- dos migraciones comparten prefijo `0008`;
- riesgo de concurrencia en `advance_session_atomic`;
- tablas de trazas/eventos pueden crecer sin politica de retencion;
- rollback granular de funciones `create or replace` es limitado;
- cambios de estado dependen en gran parte de la app.

## Principios

1. Una migracion debe tener secuencia unica y monotona.
2. Una migracion debe ser pequena, revisable y con objetivo unico.
3. Cambios destructivos requieren plan de rollback o backup.
4. Cambios de funciones criticas requieren antes/despues documentado.
5. Migraciones que tocan datos deben ser idempotentes o tener guardrails.
6. No se mezclan schema, backfill y refactor de funcion en el mismo archivo salvo necesidad justificada.
7. Toda migracion critica debe declarar impacto en runtime y QA.

## Convencion de nombres

Formato recomendado:

```text
NNNN_descripcion_corta.sql
```

Ejemplos:

```text
0010_fix_duplicate_0008_sequence.sql
0011_lock_session_advance_turn_number.sql
0012_add_trace_retention_indexes.sql
```

Reglas:

- `NNNN` debe ser unico.
- `NNNN` debe ser mayor al ultimo numero existente.
- usar snake_case.
- evitar nombres genericos como `fix.sql` o `update.sql`.
- no reutilizar un numero ya mergeado.

## Politica sobre prefijos duplicados

### Prohibido
Crear dos archivos con el mismo prefijo numerico:

```text
0008_create_v_item_bank_active.sql
0008_tutor_turn_traces.sql
```

### Remediacion recomendada
No renombrar migraciones ya aplicadas en ambientes sin una decision explicita. En su lugar:

1. documentar la ambiguedad;
2. crear nueva migracion correctiva si hace falta;
3. registrar en `migration-0008-remediation-plan.md` la estrategia escogida;
4. validar estado real de la tabla de migraciones en Supabase antes de tocar historial.

## Tipos de migraciones

### Schema-only
Crea o altera tablas, columnas, indices o constraints.

Requisitos:
- no debe depender de datos no verificados;
- incluir `if not exists` cuando aplique;
- revisar locks.

### Function/procedure
Cambia funciones como `advance_session_atomic` o `upsert_content_item`.

Requisitos:
- documentar contrato anterior y nuevo;
- no cambiar semantica de negocio sin test;
- conservar grants si aplica;
- agregar comentario de version si es util.

### Backfill
Actualiza datos existentes.

Requisitos:
- debe ser idempotente o protegida por condicion;
- para alto volumen, preferir batches;
- incluir verificacion posterior.

### Data seed/reference
Inserta catalogos o datos base.

Requisitos:
- usar upsert con clave natural estable;
- no duplicar registros;
- no depender de orden no deterministico.

## Checklist pre-merge

Antes de mergear una migracion:

- [ ] el prefijo `NNNN` es unico;
- [ ] el nombre describe el objetivo;
- [ ] el cambio tiene un solo proposito principal;
- [ ] se revisaron locks potenciales;
- [ ] se reviso impacto en RLS;
- [ ] se reviso impacto en funciones/RPC;
- [ ] se definio rollback o recovery;
- [ ] se documento validacion requerida;
- [ ] no se exponen secretos ni datos sensibles;
- [ ] se actualizo documentacion relacionada si aplica.

## Checklist post-merge/postdeploy

Despues de aplicar migracion:

- [ ] confirmar que Supabase aplico la migracion esperada;
- [ ] validar rutas API afectadas;
- [ ] validar que no hay errores 5xx nuevos;
- [ ] validar logs sin errores de funcion/RPC;
- [ ] registrar commit/runtime si aplica;
- [ ] actualizar `status.md` o `sprint-log.md` si fue cambio critico.

## Politica de rollback

### Rollback simple
Aplica cuando:
- se agrego una tabla/indice no usado aun;
- no hubo transformacion destructiva;
- el cambio no fue usado por runtime.

Estrategia:
- nueva migracion que revierte el cambio;
- no editar una migracion ya aplicada en `master`.

### Rollback complejo
Aplica cuando:
- se alteraron datos;
- se reemplazo una funcion critica;
- se modificaron constraints;
- se cambiaron permisos/RLS.

Estrategia:
- backup o snapshot previo;
- migracion forward-fix;
- validacion manual;
- no ejecutar rollback ciego.

## Reglas para funciones criticas

Funciones criticas identificadas:

- `advance_session_atomic`;
- `upsert_content_item`;
- futuras RPC de health/metrics si se crean.

Requisitos:

- documentar invariantes;
- validar concurrencia;
- incluir test o checklist manual;
- no cambiar contrato de salida sin migracion coordinada;
- preferir `select ... for update` o counter atomico si hay asignacion de secuencia.

## Reglas para indices

Agregar indice si:

- una ruta critica consulta por columna recurrente;
- hay ordenamiento por timestamp/turn number;
- hay filtros por `status`, `is_active`, `profile_id`, `session_id`.

Revisar antes:

- costo de escritura;
- lock de creacion;
- necesidad de indice parcial;
- impacto de bloat.

## Reglas de RLS y permisos

Toda migracion que cree tabla nueva debe responder:

- ¿RLS esta habilitado?
- ¿quien puede leer?
- ¿quien puede escribir?
- ¿requiere service role?
- ¿hay politicas por ownership?
- ¿la tabla contiene PII?

No cerrar una tabla nueva de dominio sin politica RLS explicita o decision documentada.

## Reglas de datos sensibles

Si la migracion toca:

- email;
- perfil;
- sesiones;
- respuestas;
- trazas de tutor;
- feedback/rationale;

Debe documentar:

- finalidad;
- retencion;
- acceso;
- minimizacion;
- riesgo de exposicion.

## Gobernanza de ambientes

Ambientes esperados:

- local/desarrollo;
- staging o preview si existe;
- produccion Supabase.

Regla:
- no asumir que todos tienen el mismo historial si hubo prefijos duplicados;
- validar tabla de migraciones del entorno antes de cambios correctivos;
- documentar diferencias si aparecen.

## Remediaciones prioritarias Sprint 33

### DB-P0-01 — Prefijo duplicado 0008

Accion:
- crear `docs/03-architecture/migration-0008-remediation-plan.md`.

No hacer todavia:
- renombrar archivos aplicados sin validar ambientes.

### DB-P0-02 — Concurrencia `session advance`

Accion:
- alinear con `docs/03-architecture/session-concurrency-adr-002.md`.
- preparar migracion o funcion atomica posterior.

### DB-P1-01 — Retencion de trazas/eventos

Accion:
- crear `docs/03-architecture/trace-retention-policy.md`.

### DB-P1-02 — Indices para rutas criticas

Accion:
- revisar necesidad de `(session_id, turn_number desc)`.
- evaluar indices parciales sobre banco activo.

## Definition of Done Sprint 33.19

- politica de nombres creada;
- reglas de prefijos duplicados definidas;
- checklist pre-merge/postdeploy creado;
- politica de rollback documentada;
- reglas para funciones criticas, RLS e indices documentadas;
- remediaciones DB Sprint 33 priorizadas;
- no se ejecutan migraciones desde esta tarea repo-only.

## Siguiente sprint pequeno

Sprint 33.20 — estrategia de retencion de trazas en `docs/03-architecture/trace-retention-policy.md`.
