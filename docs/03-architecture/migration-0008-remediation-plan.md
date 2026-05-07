# Migration 0008 Remediation Plan — Sprint 33

## Objetivo
Definir un plan seguro para resolver la ambiguedad documental y operativa causada por la existencia de dos migraciones con prefijo `0008`, sin romper historiales ya aplicados en ambientes Supabase.

## Estado

- Sprint: 33.21
- Rol lider: PM-Data
- Estado: PROPOSED
- Runtime validado: no
- Migraciones ejecutadas: no
- Alcance: diagnostico, decision y plan de remediacion

## Hallazgo

La auditoria de base de datos identifico dos archivos con el mismo prefijo numerico:

```text
supabase/migrations/0008_create_v_item_bank_active.sql
supabase/migrations/0008_tutor_turn_traces.sql
```

Esto puede generar ambiguedad de orden, drift entre ambientes o confusion al auditar el historial de migraciones.

## Riesgo

### Riesgo principal
No todos los runners o procesos humanos interpretan igual el orden cuando dos migraciones comparten prefijo.

### Riesgos derivados
- ambientes con orden de aplicacion distinto;
- una migracion aplicada y otra no aplicada;
- dificultad para reconstruir historial desde cero;
- auditorias confusas;
- remediaciones peligrosas si se renombra un archivo ya aplicado;
- drift entre `master`, copia local, VPS y Supabase.

## Principio de remediacion

No se debe renombrar ni editar una migracion que ya pudo haber sido aplicada en algun ambiente sin verificar primero el historial real de Supabase.

La remediacion debe favorecer:

1. diagnostico;
2. documentacion del estado real;
3. forward-fix si hace falta;
4. no reescritura destructiva de historial.

## Decision recomendada

### Decision Sprint 33
Mantener los archivos existentes sin renombrarlos hasta validar la tabla de migraciones del entorno real.

Crear una migracion futura con numero nuevo solo si se requiere corregir estado, consolidar objetos o registrar una marca de compatibilidad.

## Ambientes a verificar

Antes de tocar migraciones:

| Ambiente | Verificacion requerida |
|---|---|
| Local/dev | listado de migraciones aplicadas |
| Staging/preview si existe | listado de migraciones aplicadas |
| Produccion Supabase | listado de migraciones aplicadas |
| Repo remoto | existencia de ambos archivos `0008` |
| VPS deploy | copia sincronizada de migraciones |

## Comandos/consultas de diagnostico

### Repo

```bash
ls -1 supabase/migrations | sort
```

### Supabase
La tabla exacta depende de la version/herramienta usada. Verificar el mecanismo disponible en el proyecto.

Consultas orientativas:

```sql
select * from supabase_migrations.schema_migrations order by version;
```

Si la tabla anterior no existe, revisar:

```sql
select schemaname, tablename
from pg_tables
where schemaname ilike '%migration%'
   or tablename ilike '%migration%';
```

## Escenarios posibles

### Escenario A — Ambas migraciones aplicadas correctamente

Condicion:
- existen ambos objetos esperados;
- el entorno no presenta drift;
- el historial muestra ambas migraciones o su efecto.

Accion:
- no renombrar archivos aplicados;
- documentar accepted-risk historico;
- crear regla de gobernanza para no repetir prefijos;
- futuras migraciones continuan desde el siguiente numero disponible.

Estado recomendado:
- accepted-risk con guardrail.

### Escenario B — Solo una migracion fue aplicada

Condicion:
- uno de los objetos existe y el otro no;
- el historial de migracion es inconsistente.

Accion:
- crear nueva migracion forward-fix con numero nuevo;
- no intentar reaplicar el archivo duplicado directamente sin control;
- validar dependencias del objeto faltante;
- documentar ambiente afectado.

Estado recomendado:
- needs-fix.

### Escenario C — Orden distinto entre ambientes

Condicion:
- ambos objetos existen, pero se aplicaron en orden distinto;
- no hay fallo funcional observable.

Accion:
- no reescribir historial;
- documentar diferencia;
- verificar que no hay dependencia entre ambos archivos;
- si no hay dependencia, aceptar riesgo historico;
- si hay dependencia, crear migracion correctiva con numero nuevo.

Estado recomendado:
- accepted-risk o needs-fix segun impacto.

### Escenario D — Ninguna migracion aplicada en ambiente nuevo

Condicion:
- ambiente limpio intenta aplicar migraciones desde cero.

Accion:
- probar orden lexicografico real del runner;
- si el runner aplica ambos sin conflicto, documentar;
- si falla, crear estrategia de bootstrap corregida antes de usar entorno.

Estado recomendado:
- blocked hasta verificar.

## Objetos a verificar

### Para `0008_create_v_item_bank_active.sql`
Verificar existencia de:

```sql
select to_regclass('public.v_item_bank_active');
```

### Para `0008_tutor_turn_traces.sql`
Verificar existencia de la tabla o relacion esperada:

```sql
select to_regclass('public.tutor_turn_traces');
```

### Verificacion adicional

```sql
select count(*) from information_schema.tables
where table_schema = 'public'
  and table_name in ('tutor_turn_traces');
```

```sql
select count(*) from information_schema.views
where table_schema = 'public'
  and table_name in ('v_item_bank_active');
```

## Plan de accion recomendado

### Paso 1 — Inventario repo
Confirmar lista de migraciones y duplicados.

### Paso 2 — Inventario Supabase
Consultar historial real de migraciones aplicadas.

### Paso 3 — Inventario de objetos
Validar existencia de `v_item_bank_active` y `tutor_turn_traces`.

### Paso 4 — Clasificar escenario
Asignar A, B, C o D.

### Paso 5 — Decidir remediacion
- accepted-risk si no hay drift funcional;
- forward-fix si falta un objeto o hay dependencia rota;
- blocked si no hay acceso al historial real.

### Paso 6 — Documentar resultado
Actualizar:
- `docs/project/status.md`;
- `docs/02-delivery/sprint-log.md`;
- `db/audits/2026-05-07-database-architecture-audit.md` si se reabre auditoria;
- este documento con el escenario confirmado.

## Opcion de forward-fix

Si se requiere corregir sin reescribir historial, crear migracion nueva:

```text
0010_reconcile_duplicate_0008_migrations.sql
```

Contenido dependera del escenario confirmado.

Ejemplo conceptual:

```sql
-- No ejecutar sin validar ambiente real.
-- Confirmar existencia de objetos esperados y crear solo si falta alguno.
```

## Que no hacer

- No renombrar `0008_*` ya mergeados sin validar ambientes.
- No editar una migracion historica aplicada.
- No borrar objetos para forzar reaplicacion.
- No asumir que el repo y Supabase tienen el mismo historial.
- No cerrar el riesgo sin consultar el entorno real.

## Criterios de aceptacion

La remediacion del riesgo `0008` se considera cerrada cuando:

- se conoce el historial real de migraciones en Supabase;
- se confirma si ambos objetos existen;
- se clasifica el escenario A/B/C/D;
- se decide accepted-risk o forward-fix;
- la decision queda documentada;
- no hay drift funcional en runtime o queda issue abierto.

## Riesgo residual aceptable

Puede aceptarse el riesgo si:

- ambas migraciones estan aplicadas;
- ambos objetos existen;
- no hay dependencia de orden entre ellas;
- nuevas migraciones usan prefijo unico;
- la ambiguedad queda documentada.

## Definition of Done Sprint 33.21

- plan de remediacion creado;
- escenarios definidos;
- queries de verificacion documentadas;
- politica de no-renombrar sin validar establecida;
- forward-fix propuesto;
- no se ejecutan cambios DB desde esta tarea repo-only.

## Siguiente sprint pequeno

Sprint 33.22 — politica de tracing y logging en `docs/03-architecture/observability-tracing-policy.md`.
