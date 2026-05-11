-- 0011_question_contract_compatibility.sql
-- Completa el esquema para soportar el contrato extendido de preguntas (PracticeQuestionViewModel)

begin;

-- 1. Agregar columna tags
alter table public.item_bank
  add column if not exists tags text[] not null default '{}';

-- 2. Actualizar el check constraint de source_type para incluir 'official_source'
-- Primero eliminamos el check viejo si existe
alter table public.item_bank
  drop constraint if exists item_bank_source_type_check;

-- Aplicamos el nuevo check
alter table public.item_bank
  add constraint item_bank_source_type_check
  check (source_type in ('manual', 'markdown', 'import', 'seed', 'official_source'));

-- 3. Recrear la vista v_item_bank_active incluyendo tags
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
  ib.tags,
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

comment on column public.v_item_bank_active.tags is
  'Etiquetas taxonómicas o descriptivas del ítem.';

commit;
