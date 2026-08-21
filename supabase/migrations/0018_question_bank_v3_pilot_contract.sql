-- 0018_question_bank_v3_pilot_contract.sql
-- Extiende el contrato runtime/editorial para cargar bancos v3 en prueba
-- usando catalogos existentes y sin crear categorias nuevas.

begin;

alter table public.item_bank
  add column if not exists opec_id text,
  add column if not exists approval_status text not null default 'approved' check (
    approval_status in ('pending_approval', 'approved', 'rejected', 'needs_revision')
  ),
  add column if not exists pilot_status text not null default 'not_in_pilot' check (
    pilot_status in ('not_in_pilot', 'pilot_loaded', 'pilot_running', 'pilot_completed')
  );

create index if not exists idx_item_bank_opec_id
  on public.item_bank(opec_id);

create index if not exists idx_item_bank_approval_status
  on public.item_bank(approval_status);

create index if not exists idx_item_bank_pilot_status
  on public.item_bank(pilot_status);

comment on column public.item_bank.opec_id is
  'Identificador editorial/runtime de OPEC o perfil OPEC usado para aislar bancos v2+.';

comment on column public.item_bank.approval_status is
  'Estado de aprobacion editorial independiente de status runtime. approved permite pruebas controladas; la deuda de validacion queda en editorial_metadata.';

comment on column public.item_bank.pilot_status is
  'Estado operativo de pilotaje. pilot_loaded indica carga disponible para pruebas controladas.';

drop view if exists public.v_question_bank_v3_pilot cascade;
create view public.v_question_bank_v3_pilot
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
  ib.normative_refs,
  ib.version,
  ib.status,
  ib.is_published,
  ib.is_active,
  ib.opec_id,
  ib.approval_status,
  ib.pilot_status,
  ib.source_type,
  ib.source_path,
  ib.tags,
  ib.editorial_metadata,
  ib.created_at,
  ib.updated_at,
  ib.thematic_nucleus_id,
  tn.code as thematic_nucleus_code,
  tn.name as thematic_nucleus_name,
  tn.is_universal as thematic_nucleus_is_universal,
  coalesce(tn.is_active, false) as thematic_nucleus_is_active,
  case
    when ib.status = 'published'
      and ib.approval_status = 'approved'
      and ib.pilot_status in ('pilot_loaded', 'pilot_running')
      and ib.is_active = true
      and ib.opec_id is not null
      and ib.source_path like 'content/question-bank-v3/%'
      and ib.thematic_nucleus_id is not null
      and coalesce(tn.is_active, false) = true
      then 'pilot'
    else 'inactive'
  end::text as read_state
from public.item_bank ib
left join public.thematic_nuclei tn
  on tn.id = ib.thematic_nucleus_id
where ib.source_path like 'content/question-bank-v3/%';

comment on view public.v_question_bank_v3_pilot is
  'Lectura controlada de bancos v3 cargados para pruebas. No crea categorias nuevas; depende de los nucleos existentes asignados durante la importacion.';

grant select on public.v_question_bank_v3_pilot to authenticated, service_role;

drop view if exists public.v_item_bank_active cascade;
create view public.v_item_bank_active with (security_invoker = true) as
select ib.id, ib.content_id, ib.slug, ib.title, ib.area, ib.subarea, ib.competency,
  ib.exam_type, ib.item_type, ib.difficulty, ib.stem, ib.correct_option, ib.explanation,
  ib.version, ib.status, ib.is_active, ib.source_type, ib.source_path, ib.tags,
  ib.editorial_metadata, ib.created_at, ib.updated_at, ib.thematic_nucleus_id,
  tn.code as thematic_nucleus_code, tn.name as thematic_nucleus_name,
  tn.is_universal as thematic_nucleus_is_universal,
  coalesce(tn.is_active, false) as thematic_nucleus_is_active,
  null::text as classification_bucket, null::text as classification_reason,
  false as is_legacy, false as is_blocked, 'active'::text as read_state
from public.item_bank ib
left join public.thematic_nuclei tn on tn.id = ib.thematic_nucleus_id
where (
    ib.source_path like 'content/items/beta-v1/%'
    or (
      ib.source_path like 'content/question-bank-v3/%'
      and ib.approval_status = 'approved'
      and ib.pilot_status in ('pilot_loaded', 'pilot_running')
    )
  )
  and ib.status = 'published'
  and ib.is_active = true
  and ib.thematic_nucleus_id is not null
  and coalesce(tn.is_active, false) = true;

grant select on public.v_item_bank_active to authenticated, service_role;

commit;
