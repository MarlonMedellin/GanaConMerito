begin;

-- Rebuild the three V4 read boundaries atomically with the safe runtime contract.
-- Avoid CASCADE so an unknown dependency still fails closed.
drop view if exists public.v_question_bank_v4_practice;
drop view if exists public.v_question_bank_v4_answered;
drop view if exists public.v_question_bank_v4_active;

create view public.v_question_bank_v4_active with (security_invoker = true) as
select ib.id, ib.content_id, ib.slug, ib.title, ib.area, ib.subarea, ib.competency,
  ib.opec_id, ib.editorial_scope, ib.topic_code, ib.question_type, ib.cognitive_level,
  ib.difficulty, ib.stem, ib.status, ib.is_published, ib.is_active, ib.source_type,
  ib.source_path, ib.source_reference, ib.source_locator, ib.source_url, ib.tags,
  ib.thematic_nucleus_id, ib.editorial_metadata, 'active'::text as read_state
from public.item_bank ib
where ib.bank_version = 'v4'
  and ib.status = 'published' and ib.is_published = true and ib.is_active = true
  and ib.approval_status = 'approved'
  and ib.pilot_status in ('pilot_loaded', 'pilot_running', 'pilot_completed')
  and ib.source_path like 'content/question-bank-v4/%';

create view public.v_question_bank_v4_practice with (security_invoker = true) as
select v.*
from public.v_question_bank_v4_active v;

create view public.v_question_bank_v4_answered with (security_invoker = true) as
select
  ib.id, ib.content_id, ib.slug, ib.correct_option, ib.explanation,
  ib.editorial_metadata->'explanations' as option_explanations,
  ib.editorial_metadata->>'learningNote' as learning_note,
  ib.editorial_metadata->>'hint' as hint,
  ib.source_reference, ib.source_locator, ib.source_url,
  ib.version, 'active'::text as read_state
from public.item_bank ib
where ib.bank_version = 'v4'
  and ib.status = 'published' and ib.is_published = true and ib.is_active = true
  and ib.approval_status = 'approved'
  and ib.pilot_status in ('pilot_loaded', 'pilot_running', 'pilot_completed')
  and ib.source_path like 'content/question-bank-v4/%';

revoke all on table public.v_question_bank_v4_active from public, anon, authenticated;
revoke all on table public.v_question_bank_v4_practice from public, anon, authenticated;
revoke all on table public.v_question_bank_v4_answered from public, anon, authenticated;
grant select on table public.v_question_bank_v4_active to service_role;
grant select on table public.v_question_bank_v4_practice to service_role;
grant select on table public.v_question_bank_v4_answered to service_role;
comment on view public.v_question_bank_v4_active is
  'Vista V4 server-only pre-respuesta: excluye clave y explicaciones.';
comment on view public.v_question_bank_v4_practice is
  'Compatibilidad V4 server-only pre-respuesta: excluye clave y explicaciones.';
comment on view public.v_question_bank_v4_answered is
  'Vista V4 server-only post-respuesta: expone verdad y feedback autorizado.';

commit;
