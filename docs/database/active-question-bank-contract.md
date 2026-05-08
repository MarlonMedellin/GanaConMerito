# Contrato mínimo de lectura — banco activo

## Objetivo
Definir un contrato estable para que la app consuma solo el **banco activo** y deje de leer `item_bank` crudo como fuente funcional por defecto.

Este contrato resuelve tres problemas inmediatos sin rehacer la arquitectura:
- separar lectura operativa de la tabla legado/base
- excluir por defecto contenido legado o bloqueado
- dar un punto único para frontend y backend al seleccionar o renderizar preguntas

---

## Nota de coherencia editorial
El sistema editorial vigente del banco ya distingue:
- eje principal: `area`, `subarea`, `competency`
- eje secundario opcional: `targetRole`, `targetPosition`, `applicantProfile`, `tags`
- carpeta canónica de ítems finales: `content/items/`
- carpeta secundaria de trabajo editorial por perfil: `content/profiles/docente/`

Este documento describe solo el **contrato mínimo de lectura activa en runtime**. La segunda capa por perfiles docentes ya existe en el Markdown editorial, pero no debe asumirse como completamente adoptada aquí hasta que exista migración o contrato explícito de base de datos para ello.

---

## 1. Catálogo activo propuesto

### Identidad mínima
- `id uuid` — identificador técnico interno; mantiene compatibilidad con sesiones actuales
- `content_id text` — identificador editorial estable
- `slug text` — identificador humano/funcional estable

### Clasificación mínima
- `area text`
- `subarea text`
- `competency text`
- `exam_type text`
- `item_type text`
- `difficulty numeric(4,2)`

### Contenido mínimo para consumo de práctica
- `title text`
- `stem text`
- `correct_option text` — solo para backend/evaluación, no para exponer al cliente
- `explanation text` — solo para feedback o revisión
- `version integer`

### Segmentación mínima operativa actual
- `thematic_nucleus_id uuid`
- `thematic_nucleus_code text`
- `thematic_nucleus_name text`
- `thematic_nucleus_is_universal boolean`

### Segmentación editorial secundaria futura
Estos campos aún no forman parte del contrato mínimo activo, pero ya existen en la capa Markdown editorial y podrían adoptarse después:
- `target_role text`
- `target_position text`
- `applicant_profile text`
- `tags text[]` o estructura equivalente

### Trazabilidad mínima
- `status text`
- `is_active boolean`
- `source_type text`
- `source_path text`
- `created_at timestamptz`
- `updated_at timestamptz`

### Flags derivados del contrato de lectura
- `classification_bucket text null` — override transitorio (`legacy` | `blocked`) cuando aplique
- `classification_reason text null` — motivo operativo del override
- `is_legacy boolean`
- `is_blocked boolean`
- `read_state text`

---

## 2. Estados y reglas

### Estados editoriales base
Se respetan los ya existentes en `item_bank.status`:
- `draft`
- `review`
- `published`
- `archived`

### Estado derivado de lectura (`read_state`)
Valores propuestos:
- `active`
- `inactive`
- `legacy`
- `blocked`

### Regla para que un ítem sea `active`
Un ítem entra al banco activo solo si cumple **todo**:
1. `status = 'published'`
2. `is_active = true`
3. `thematic_nucleus_id is not null`
4. el núcleo relacionado está `is_active = true`
5. `is_legacy = false`
6. `is_blocked = false`

### Regla por defecto
- la app **solo** lee `read_state = 'active'`
- `inactive` queda fuera del consumo operativo normal

---

## 3. Contrato estable de lectura propuesto

## Opción recomendada
Crear una vista estable:
- `public.v_item_bank_active`

### Propósito
Ser la única fuente de lectura funcional para:
- selector de siguiente ítem
- detalle de ítem en sesión
- futuros listados operativos del banco activo

### Definición final propuesta para migración
> Artefacto ejecutable: `supabase/migrations/0008_create_v_item_bank_active.sql`

```sql
create or replace view public.v_item_bank_active
with (security_invoker = true) as
select
  ib.id,
  ib.content_id,
  ib.slug,
  ib.title,
  ib.area,
  ib.subarea,
  ib.competency,
  ib.exam_type,
  ib.item_type,
  ib.difficulty,
  ib.stem,
  ib.correct_option,
  ib.explanation,
  ib.version,
  ib.status,
  ib.is_active,
  ib.source_type,
  ib.source_path,
  ib.created_at,
  ib.updated_at,
  ib.thematic_nucleus_id,
  tn.code as thematic_nucleus_code,
  tn.name as thematic_nucleus_name,
  tn.is_universal as thematic_nucleus_is_universal,
  coalesce(tn.is_active, false) as thematic_nucleus_is_active,
  null::text as classification_bucket,
  null::text as classification_reason,
  false as is_legacy,
  false as is_blocked,
  case
    when ib.status = 'published'
      and ib.is_active = true
      and ib.thematic_nucleus_id is not null
      and coalesce(tn.is_active, false) = true
      then 'active'
    else 'inactive'
  end::text as read_state
from public.item_bank ib
left join public.thematic_nuclei tn
  on tn.id = ib.thematic_nucleus_id;
```

Notas de implementación:
- `security_invoker = true` evita que la vista amplíe acceso por encima de la RLS vigente.
- `classification_bucket` y `classification_reason` quedan reservadas para clasificaciones editoriales futuras.
- `thematic_nucleus_is_active` deja visible el último gate antes de `read_state = 'active'`.
- La ausencia de `target_role`, `target_position` y `applicant_profile` en esta vista no significa que la capa editorial no exista; solo significa que aún no es parte del contrato mínimo de runtime.

### Regla operativa de uso
Toda lectura de producto debe agregar:
```sql
where read_state = 'active'
```

---

## 4. Contrato mínimo de adopción en código

### Backend
Cambios mínimos recomendados:
1. `src/domain/item-selection/select-next-item.ts`
   - leer desde `v_item_bank_active`
   - filtrar `read_state = 'active'`
   - mantener filtros actuales de `area`, `competency` y `thematic_nucleus_id`
2. `src/app/api/session/item/route.ts`
   - leer metadatos del ítem desde `v_item_bank_active`
   - seguir leyendo `item_options` aparte por ahora
3. `src/app/api/session/advance/route.ts`
   - leer `correct_option`, `difficulty`, `area`, `competency` desde `v_item_bank_active`

### Frontend
Sin cambio arquitectónico mayor:
- sigue consumiendo `/api/session/start`, `/api/session/item`, `/api/session/advance`
- deja de depender indirectamente de `item_bank` crudo porque el backend ya lee la vista estable

### Escritura
No cambiar todavía:
- `upsert_content_item(...)` sigue escribiendo a `item_bank`
- la vista es solo capa de lectura

---

## 5. Dónde debe vivir esta definición

### Canonical
- `docs/database/active-question-bank-contract.md`

### Referencias puente
- `docs/database/schema.md` — resumen del modelo y referencia al contrato activo
- `docs/api/contracts.md` — declarar que los endpoints de sesión leen del contrato activo, no de `item_bank` directo
- `docs/database/content-model.md` — declarar que la capa editorial Markdown incluye metadatos secundarios por perfil aunque el contrato mínimo activo aún no los use

### Razón
Este diseño es principalmente un **contrato de lectura de datos**, no una feature de UI ni una migración editorial completa.

---

## 6. Adopción sin romper el producto actual

### Paso 1
Documentar y aprobar este contrato.

### Paso 2
Aplicar la migración pequeña `supabase/migrations/0008_create_v_item_bank_active.sql` para crear la vista `public.v_item_bank_active`.

### Paso 3
Cambiar solo las lecturas críticas actuales:
- selector
- `session/item`
- `session/advance`

### Paso 4
Mantener `item_bank` como tabla base de escritura durante la transición.

### Paso 5
Más adelante reemplazar el CTE `classified_content` por una tabla editorial explícita, por ejemplo:
- `public.item_bank_read_overrides`

### Paso 6
Si la segunda capa por perfiles demuestra valor estable en producto, definir una adopción explícita y gobernada para esos metadatos en la capa de lectura activa.

---

## 7. Recomendación final

La solución mínima y segura es:
- **no tocar la arquitectura masiva**
- **no migrar todavía el modelo editorial completo**
- **sí introducir una vista de lectura estable del banco activo**
- **sí centralizar ahí la exclusión de legado y bloqueados**
- **sí documentar por separado que la capa editorial del banco ya soporta segmentación secundaria por perfil**

Con eso, la app deja de depender del estado accidental de `item_bank` y gana un puente claro entre banco cargado y consumo seguro.