begin;

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

comment on view public.v_item_bank_active is
  'Contrato estable de lectura del banco activo. Expone únicamente el estado derivado de activación para consumo runtime.';

comment on column public.v_item_bank_active.classification_bucket is
  'Reservado para futuras clasificaciones editoriales; hoy se expone null en el banco curado vigente.';

comment on column public.v_item_bank_active.classification_reason is
  'Reservado para futuras clasificaciones editoriales; hoy se expone null en el banco curado vigente.';

comment on column public.v_item_bank_active.read_state is
  'Estado derivado de lectura: active o inactive.';

grant select on public.v_item_bank_active to authenticated;
grant select on public.v_item_bank_active to service_role;

commit;
