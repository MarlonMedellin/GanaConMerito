-- 0011_question_contract_compatibility.sql
-- Alínea el esquema de item_bank y la vista v_item_bank_active con el contrato de datos requerido por la versión actual.
-- Garantiza que tags exista y que la vista exponga todas las columnas del contrato estable.

begin;

-- 1. Agregar columna tags si no existe
alter table public.item_bank 
add column if not exists tags text[] default '{}';

-- 2. Actualizar restricción de source_type para incluir official_source
-- Se mantienen los valores originales ('manual', 'markdown', 'import', 'seed') y se agrega 'official_source'.
-- Se evita agregar 'imported' o 'ai_generated' ya que no forman parte del contrato vigente.
alter table public.item_bank 
drop constraint if exists item_bank_source_type_check;

alter table public.item_bank 
add constraint item_bank_source_type_check 
check (source_type in ('manual', 'markdown', 'import', 'seed', 'official_source'));

-- 3. Recrear v_item_bank_active con el contrato completo + tags
-- Esta vista es la fuente de verdad operativa para el runtime (selector, API item).
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
  ib.tags, -- Columna agregada
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

comment on view public.v_item_bank_active is
  'Contrato estable de lectura del banco activo. Expone únicamente el estado derivado de activación para consumo runtime.';

comment on column public.v_item_bank_active.tags is
  'Metadatos de segmentación editorial secundaria (opcional).';

grant select on public.v_item_bank_active to authenticated;
grant select on public.v_item_bank_active to service_role;

commit;
