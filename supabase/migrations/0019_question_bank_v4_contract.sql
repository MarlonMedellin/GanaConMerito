begin;

alter table public.item_bank
  add column if not exists bank_version text not null default 'legacy',
  add column if not exists editorial_scope text,
  add column if not exists topic_code text,
  add column if not exists question_type text,
  add column if not exists cognitive_level text,
  add column if not exists source_reference text,
  add column if not exists source_locator text,
  add column if not exists source_url text;

alter table public.item_bank drop constraint if exists item_bank_bank_version_check;
alter table public.item_bank add constraint item_bank_bank_version_check check (bank_version in ('legacy', 'v3', 'v4'));
alter table public.item_bank drop constraint if exists item_bank_v4_source_check;
alter table public.item_bank add constraint item_bank_v4_source_check check (
  bank_version <> 'v4' or (source_path like 'content/question-bank-v4/%' and source_reference is not null and approval_status = 'approved')
);

create index if not exists idx_item_bank_v4_selection
  on public.item_bank(bank_version, editorial_scope, opec_id, topic_code, competency, question_type, cognitive_level, difficulty);

drop view if exists public.v_question_bank_v4_active cascade;
create view public.v_question_bank_v4_active with (security_invoker = true) as
select ib.id, ib.content_id, ib.slug, ib.title, ib.area, ib.subarea, ib.competency,
  ib.opec_id, ib.editorial_scope, ib.topic_code, ib.question_type, ib.cognitive_level,
  ib.difficulty, ib.stem, ib.status, ib.is_published, ib.is_active, ib.source_type,
  ib.source_path, ib.tags, ib.thematic_nucleus_id, ib.editorial_metadata,
  'active'::text as read_state
from public.item_bank ib
where ib.bank_version = 'v4'
  and ib.status = 'published' and ib.is_published = true and ib.is_active = true
  and ib.approval_status = 'approved'
  and ib.pilot_status in ('pilot_loaded', 'pilot_running', 'pilot_completed')
  and ib.source_path like 'content/question-bank-v4/%';

grant select on public.v_question_bank_v4_active to authenticated, service_role;
comment on view public.v_question_bank_v4_active is 'Vista V4 segura: no expone correct_option ni explicaciones antes de responder.';
commit;
