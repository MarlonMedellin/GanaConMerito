begin;

-- Preserve dependent practice/answered views while tightening the active view.
create or replace view public.v_question_bank_v4_active with (security_invoker = true) as
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

revoke all on table public.v_question_bank_v4_active from public, anon, authenticated;
grant select on table public.v_question_bank_v4_active to service_role;
comment on view public.v_question_bank_v4_active is
  'Vista V4 server-only pre-respuesta: excluye clave y explicaciones.';

commit;
