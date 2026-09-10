-- 0021_question_bank_v4_read_views.sql
-- Separates V4 runtime reads into safe practice and server-side answered views.

begin;

drop view if exists public.v_question_bank_v4_answered cascade;
drop view if exists public.v_question_bank_v4_practice cascade;
drop view if exists public.v_question_bank_v4_active cascade;

create view public.v_question_bank_v4_active with (security_invoker = true) as
select
  ib.id, ib.content_id, ib.slug, ib.title, ib.area, ib.subarea, ib.competency,
  ib.exam_type, ib.item_type, ib.opec_id, ib.editorial_scope, ib.topic_code,
  ib.question_type, ib.cognitive_level, ib.difficulty, ib.stem, ib.correct_option,
  ib.explanation, ib.normative_refs, ib.version, ib.status, ib.is_published,
  ib.is_active, ib.approval_status, ib.pilot_status, ib.source_type,
  ib.source_path, ib.source_reference, ib.source_locator, ib.source_url,
  ib.tags, ib.thematic_nucleus_id, ib.editorial_metadata, ib.created_at,
  ib.updated_at, 'active'::text as read_state
from public.item_bank ib
where ib.bank_version = 'v4'
  and ib.status = 'published'
  and ib.is_published = true
  and ib.is_active = true
  and ib.approval_status = 'approved'
  and ib.pilot_status in ('pilot_loaded', 'pilot_running', 'pilot_completed')
  and ib.source_path like 'content/question-bank-v4/%'
  and ib.source_reference is not null;

create view public.v_question_bank_v4_practice with (security_invoker = true) as
select
  v.id, v.content_id, v.slug, v.title, v.area, v.subarea, v.competency,
  v.exam_type, v.item_type, v.opec_id, v.editorial_scope, v.topic_code,
  v.question_type, v.cognitive_level, v.difficulty, v.stem, v.normative_refs,
  v.version, v.status, v.is_published, v.is_active, v.approval_status,
  v.pilot_status, v.source_type, v.source_path, v.source_reference,
  v.source_locator, v.source_url, v.tags, v.thematic_nucleus_id,
  v.created_at, v.updated_at, v.read_state
from public.v_question_bank_v4_active v;

create view public.v_question_bank_v4_answered with (security_invoker = true) as
select
  v.id, v.content_id, v.slug, v.correct_option, v.explanation,
  v.editorial_metadata->'explanations' as option_explanations,
  v.editorial_metadata->>'learningNote' as learning_note,
  v.editorial_metadata->>'hint' as hint,
  v.source_reference, v.source_locator, v.source_url,
  v.version, v.read_state
from public.v_question_bank_v4_active v;

revoke all on table public.v_question_bank_v4_active from public;
revoke all on table public.v_question_bank_v4_practice from public;
revoke all on table public.v_question_bank_v4_answered from public;

grant select on table public.v_question_bank_v4_active to authenticated, service_role;
grant select on table public.v_question_bank_v4_practice to authenticated, service_role;
grant select on table public.v_question_bank_v4_answered to service_role;

comment on view public.v_question_bank_v4_practice is
  'Lectura V4 para practica antes de responder. No expone correct_option, explanation ni learningNote.';
comment on view public.v_question_bank_v4_answered is
  'Lectura V4 posterior a respuesta para servidor. Expone clave y feedback solo a service_role.';

commit;
