---
id: PRD-EXECUTION-QUESTION-BANK-V4-SUPABASE
name: execution-question-bank-v4-supabase
project: ganaconmerito
owner: marlon-arcila
status: proposed
artifact_type: prd
modules: [database, content, practice, tutor, qa, ops]
tags: [v4, question-bank, supabase, migration, staging, rollout]
related:
  - docs/database/prd-question-bank-v4-supabase.md
  - docs/database/question-bank-v4-contract.md
  - docs/01-product/prd-question-bank-v4-default-source.md
  - docs/architecture/question-bank-v4-adoption.md
  - content/question-bank-v4/CONTRATO-EDITORIAL-V4.md
---

# PRD — Ejecución operativa de Question Bank V4 en Supabase

## 1. Resultado esperado

Ejecutar de punta a punta la adopción operativa de Question Bank V4 en Supabase:
migraciones aplicadas en staging, importación V4 inactiva, validación de vistas
seguras, activación de una cohorte piloto, pruebas de runtime y preparación del
corte a V4 como fuente predeterminada.

El resultado final de este PRD no implica borrar, migrar ni reemplazar datos
legacy/V3. El corte de fuente predeterminada solo ocurre cuando los criterios de
piloto y seguridad estén cumplidos.

## 2. Alcance

Incluye:

- revisar y ordenar los cambios locales necesarios;
- aplicar migraciones `0019`, `0020` y `0021` en staging;
- validar contenido V4 localmente;
- ejecutar dry-run de importación;
- importar una cohorte V4 en staging con estado inactivo;
- verificar datos, opciones, constraints, vistas y permisos;
- activar una cohorte piloto aprobada;
- probar flujos `session/start`, `session/item` y `session/advance`;
- documentar evidencia, resultados y decisión de avance;
- preparar, pero no ejecutar automáticamente, M-0022.

No incluye:

- aplicar cambios directamente en producción sin evidencia de staging;
- activar V4 masivamente sin piloto;
- borrar filas legacy, V3, sesiones o historial;
- cambiar la fuente predeterminada antes de cumplir los criterios de corte;
- resolver deuda editorial de ítems no aprobados.

## 3. Precondiciones

Antes de ejecutar actividades sobre Supabase:

1. El repo local debe estar actualizado con `origin/master`.
2. Los cambios locales deben estar revisados con `git status` y `git diff`.
3. Las variables de entorno de staging deben apuntar al proyecto correcto.
4. Debe existir acceso `service_role` solo en entorno seguro.
5. Debe existir backup o snapshot verificable de staging antes de migrar.
6. El contenido en `content/question-bank-v4/items/` debe pasar el validador.

## 4. Plan de ejecución

### Fase 1 — Preparar cambios locales

Ejecutar:

```bash
git status
git diff
npm run typecheck
npm run content:validate:v4
npm run content:import:v4
```

Criterio de salida:

- `typecheck` pasa;
- validación V4 pasa;
- dry-run reporta ítems importables sin `rejected`;
- se identifican claramente cambios propios y cambios previos no relacionados.

### Fase 2 — Aplicar migraciones en staging

Aplicar en orden:

1. `supabase/migrations/0019_question_bank_v4_contract.sql`
2. `supabase/migrations/0020_upsert_content_item_v4.sql`
3. `supabase/migrations/0021_question_bank_v4_read_views.sql`

Comando preferido:

```bash
supabase db push
```

Criterio de salida:

- columnas V4 existen en `public.item_bank`;
- constraints e índices V4 existen;
- función `public.upsert_content_item_v4(...)` existe;
- vistas `v_question_bank_v4_active`, `v_question_bank_v4_practice` y
  `v_question_bank_v4_answered` existen;
- `v_question_bank_v4_answered` no es accesible para roles de navegador.

### Fase 3 — Importar cohorte V4 inactiva

Ejecutar en staging:

```bash
npm run content:import:v4 -- --apply
```

La importación debe crear o actualizar V4 con:

- `bank_version = 'v4'`;
- `status = 'draft'`;
- `is_published = false`;
- `is_active = false`;
- `approval_status = 'pending_approval'`;
- `pilot_status = 'not_in_pilot'`.

Criterio de salida:

- cada ítem V4 tiene cuatro opciones A-D;
- `source_path` queda bajo `content/question-bank-v4/`;
- `source_reference` no es nulo;
- no hay cambios sobre filas legacy/V3 no relacionadas.

### Fase 4 — Verificación SQL de datos y vistas

Ejecutar consultas de control:

```sql
select slug, bank_version, status, is_published, is_active,
       approval_status, pilot_status, source_reference
from public.item_bank
where bank_version = 'v4';
```

```sql
select ib.slug, count(io.id) as options_count
from public.item_bank ib
join public.item_options io on io.item_id = ib.id
where ib.bank_version = 'v4'
group by ib.slug;
```

```sql
select *
from public.v_question_bank_v4_practice;
```

```sql
select *
from public.v_question_bank_v4_answered;
```

Criterio de salida:

- antes de activar, la vista de práctica no debe devolver la cohorte inactiva;
- después de activar, `practice` no expone `correct_option`, `explanation`,
  `hint`, `learning_note` ni explicaciones por opción;
- `answered` expone clave y feedback solo para `service_role`.

### Fase 5 — Activación piloto

Después de revisión editorial/técnica, activar solo los slugs aprobados:

```sql
update public.item_bank
set
  status = 'published',
  is_published = true,
  is_active = true,
  approval_status = 'approved',
  pilot_status = 'pilot_loaded'
where bank_version = 'v4'
  and slug in ('doc-000001');
```

Criterio de salida:

- `v_question_bank_v4_practice` devuelve la cohorte activada;
- `v_question_bank_v4_active` contiene solo V4 autorizado;
- `v_question_bank_v4_answered` devuelve feedback correcto para el servidor.

### Fase 6 — Pruebas de runtime

Ejecutar:

```bash
npm run typecheck
npm run test
npm run content:validate:v4
npm run content:import:v4
```

Probar flujos autenticados:

- `session/start`;
- `session/item`;
- `session/advance`;
- feedback posterior a respuesta;
- estado de banco vacío/no disponible.

Criterio de salida:

- la pregunta entregada antes de responder no contiene clave ni explicación;
- la evaluación usa la clave en servidor;
- el feedback posterior corresponde al ítem contestado;
- no hay fallback silencioso a legacy/V3 cuando se esté probando modo V4.

### Fase 7 — Evidencia y decisión de corte

Registrar:

- commit o hash de migraciones aplicadas;
- fecha, ambiente y responsable;
- conteos antes/después de `item_bank` e `item_options`;
- salida de validadores y tests;
- slugs importados, aprobados y activados;
- resultado de pruebas manuales/API/E2E;
- riesgos abiertos y decisión de avanzar o pausar.

Criterio de salida:

- existe evidencia suficiente para decidir si se prepara M-0022;
- rollback fue probado por desactivación de la cohorte;
- el piloto no reporta fuga de clave ni ruptura de sesión.

## 5. Criterios para M-0022

M-0022 solo puede ejecutarse cuando:

1. existe cohorte V4 suficiente para los filtros habilitados;
2. `v_question_bank_v4_practice` entrega exclusivamente V4 autorizado;
3. no existe fuga de clave antes de responder;
4. `session/start`, `session/item` y `session/advance` pasan en staging;
5. UI, API, RLS, importación y E2E están verificados;
6. existe rollback probado por `is_active = false`;
7. la decisión de corte está documentada.

## 6. Rollback

Rollback operativo:

```sql
update public.item_bank
set
  is_active = false,
  pilot_status = 'not_in_pilot'
where bank_version = 'v4'
  and slug in ('doc-000001');
```

Rollback de fuente predeterminada, si M-0022 ya fue aplicado, debe restaurar la
política o vista anterior sin borrar filas V4 ni historial de sesiones.

## 7. Entregables

- migraciones V4 aplicadas y verificadas en staging;
- importación V4 inactiva validada;
- cohorte piloto activada explícitamente;
- reporte de vistas y seguridad;
- evidencia de pruebas runtime;
- decisión documentada sobre M-0022;
- lista de riesgos o pendientes antes de producción.

## 8. Definición de terminado

Este PRD se considera terminado cuando staging demuestra que V4 puede importarse,
activarse, leerse antes de responder sin fugas y responderse con feedback
autorizado, manteniendo intactos Beta/V3/legacy y con rollback probado.
