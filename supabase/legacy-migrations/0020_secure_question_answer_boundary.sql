-- 0020_secure_question_answer_boundary.sql
-- Closes direct client access to answer-bearing question-bank contracts.

begin;

-- RLS filters rows; it does not hide answer-bearing columns. Question-bank reads
-- are server-only from this migration onward.
revoke all on table public.item_bank from public, anon, authenticated;
revoke all on table public.item_options from public, anon, authenticated;

drop policy if exists item_bank_select_published on public.item_bank;
drop policy if exists item_options_select_for_published_items on public.item_options;

-- Existing views contain answer-bearing or rich editorial fields. They remain
-- available to the server role while a later V4-only read contract is adopted.
revoke all on table public.v_item_bank_active from public, anon, authenticated;
revoke all on table public.v_question_bank_v4_active from public, anon, authenticated;
grant select on table public.v_item_bank_active to service_role;
grant select on table public.v_question_bank_v4_active to service_role;
grant select on table public.item_bank to service_role;
grant select on table public.item_options to service_role;

-- Security-definer functions are executable by PUBLIC unless explicitly
-- restricted. Only server-side service-role code may score or import content.
revoke execute on function public.advance_session_atomic(
  uuid, uuid, uuid, text, text, integer, integer, text, boolean, numeric,
  numeric, numeric, numeric, boolean, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.advance_session_atomic(
  uuid, uuid, uuid, text, text, integer, integer, text, boolean, numeric,
  numeric, numeric, numeric, boolean, text, text, text, text
) to service_role;
alter function public.advance_session_atomic(
  uuid, uuid, uuid, text, text, integer, integer, text, boolean, numeric,
  numeric, numeric, numeric, boolean, text, text, text, text
) set search_path = public, pg_temp;

revoke execute on function public.upsert_content_item(
  text, text, text, text, text, text, text, numeric, text, text, text, text,
  text, text[], boolean, integer, jsonb, text, jsonb
) from public, anon, authenticated;
grant execute on function public.upsert_content_item(
  text, text, text, text, text, text, text, numeric, text, text, text, text,
  text, text[], boolean, integer, jsonb, text, jsonb
) to service_role;
alter function public.upsert_content_item(
  text, text, text, text, text, text, text, numeric, text, text, text, text,
  text, text[], boolean, integer, jsonb, text, jsonb
) set search_path = public, pg_temp;

commit;
