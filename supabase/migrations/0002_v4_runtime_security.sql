-- Runtime contract and deny-by-default question-bank boundary.

begin;

create view public.v_question_bank_v4_active
with (security_invoker = true)
as
select
  q.id,
  q.domain as area,
  q.topic,
  q.competency,
  q.estimated_difficulty as difficulty,
  q.context,
  q.stem,
  q.question_type,
  q.cognitive_level,
  q.editorial_scope,
  q.hint,
  q.source_type,
  q.source_path
from public.questions q
join public.question_releases r on r.id = q.release_id
where r.bank = 'question-bank-v4'
  and r.status = 'active'
  and q.sync_state = 'current';

create view public.v_question_bank_v4_practice
with (security_invoker = true)
as select * from public.v_question_bank_v4_active;

create view public.v_question_bank_v4_answered
with (security_invoker = true)
as
select
  q.id,
  q.domain as area,
  q.competency,
  q.estimated_difficulty as difficulty,
  q.correct_option,
  q.explanations,
  q.learning_note,
  q.source_reference,
  q.source_locator,
  q.source_url
from public.questions q
join public.question_releases r on r.id = q.release_id
where r.bank = 'question-bank-v4'
  and r.status = 'active'
  and q.sync_state = 'current';

create function public.advance_session_atomic(
  p_profile_id uuid,
  p_session_id uuid,
  p_item_id text,
  p_selected_option text,
  p_user_rationale text,
  p_response_time_ms integer,
  p_confidence_self_report integer,
  p_feedback_text text,
  p_is_correct boolean,
  p_reasoning_score numeric,
  p_normative_consistency_score numeric,
  p_competency_score numeric,
  p_estimated_theta_delta numeric,
  p_remediation_needed boolean,
  p_evaluation_source text,
  p_evaluation_version text,
  p_previous_state text,
  p_current_state text
)
returns table(session_turn_id uuid, turn_number integer, persisted_state text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_turn_id uuid;
  v_turn_number integer;
  v_domain text;
  v_competency text;
  v_difficulty numeric(4,3);
  v_session_status text;
begin
  if p_selected_option not in ('A', 'B', 'C', 'D') then
    raise exception 'INVALID_SELECTED_OPTION';
  end if;

  if not exists (
    select 1 from public.sessions s
    where s.id = p_session_id and s.profile_id = p_profile_id
      and s.status = 'active' and s.current_state = p_previous_state
  ) then
    raise exception 'SESSION_NOT_FOUND_OR_STATE_CHANGED';
  end if;

  select q.domain, q.competency, q.estimated_difficulty
    into v_domain, v_competency, v_difficulty
  from public.questions q
  join public.question_releases r on r.id = q.release_id
  where q.id = p_item_id and q.sync_state = 'current' and r.status = 'active';

  if not found then raise exception 'ACTIVE_V4_QUESTION_NOT_FOUND'; end if;

  select coalesce(max(st.turn_number), 0) + 1
    into v_turn_number
  from public.session_turns st where st.session_id = p_session_id;

  insert into public.session_turns (
    session_id, question_id, turn_number, selected_option, user_rationale,
    response_time_ms, confidence_self_report, model_feedback
  ) values (
    p_session_id, p_item_id, v_turn_number, p_selected_option, p_user_rationale,
    p_response_time_ms, p_confidence_self_report, p_feedback_text
  ) returning id into v_turn_id;

  insert into public.evaluation_events (
    session_turn_id, question_id, is_correct, reasoning_score,
    normative_consistency_score, competency_score, estimated_theta_delta,
    remediation_needed, evaluation_source, evaluation_version
  ) values (
    v_turn_id, p_item_id, p_is_correct, p_reasoning_score,
    p_normative_consistency_score, p_competency_score, p_estimated_theta_delta,
    p_remediation_needed, p_evaluation_source, p_evaluation_version
  );

  insert into public.user_topic_stats (
    profile_id, domain, competency, attempts, correct_count,
    avg_reasoning_score, avg_difficulty, estimated_level
  ) values (
    p_profile_id, v_domain, v_competency, 1, case when p_is_correct then 1 else 0 end,
    p_reasoning_score, v_difficulty, p_estimated_theta_delta
  )
  on conflict (profile_id, domain, competency) do update set
    attempts = public.user_topic_stats.attempts + 1,
    correct_count = public.user_topic_stats.correct_count + case when p_is_correct then 1 else 0 end,
    avg_reasoning_score = round(((public.user_topic_stats.avg_reasoning_score * public.user_topic_stats.attempts) + p_reasoning_score) / (public.user_topic_stats.attempts + 1), 2),
    avg_difficulty = round(((public.user_topic_stats.avg_difficulty * public.user_topic_stats.attempts) + v_difficulty) / (public.user_topic_stats.attempts + 1), 3),
    estimated_level = round(public.user_topic_stats.estimated_level + p_estimated_theta_delta, 3),
    updated_at = now();

  v_session_status := case
    when p_current_state = 'session_close' then 'completed'
    when p_current_state = 'expired' then 'expired'
    when p_current_state = 'error' then 'error'
    else 'active'
  end;

  update public.sessions set
    current_state = p_current_state,
    status = v_session_status,
    ended_at = case when v_session_status = 'active' then ended_at else coalesce(ended_at, now()) end,
    updated_at = now()
  where id = p_session_id and profile_id = p_profile_id;

  return query select v_turn_id, v_turn_number, p_current_state;
end;
$$;

alter table public.runtime_metadata enable row level security;
alter table public.profiles enable row level security;
alter table public.target_families enable row level security;
alter table public.target_profiles enable row level security;
alter table public.opec_catalog enable row level security;
alter table public.learning_profiles enable row level security;
alter table public.question_releases enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.item_target_families enable row level security;
alter table public.item_target_profiles enable row level security;
alter table public.item_opec_targets enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.knowledge_source_targets enable row level security;
alter table public.item_source_links enable row level security;
alter table public.sessions enable row level security;
alter table public.session_turns enable row level security;
alter table public.evaluation_events enable row level security;
alter table public.user_topic_stats enable row level security;
alter table public.tutor_turn_traces enable row level security;
alter table public.tutor_shadow_metrics enable row level security;
alter table public.content_sync_runs enable row level security;

create policy profiles_own_select on public.profiles for select to authenticated using (auth.uid() = auth_user_id);
create policy profiles_own_insert on public.profiles for insert to authenticated with check (auth.uid() = auth_user_id);
create policy profiles_own_update on public.profiles for update to authenticated using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id);

create policy learning_profiles_own_all on public.learning_profiles for all to authenticated
using (exists (select 1 from public.profiles p where p.id = learning_profiles.profile_id and p.auth_user_id = auth.uid()))
with check (exists (select 1 from public.profiles p where p.id = learning_profiles.profile_id and p.auth_user_id = auth.uid()));

create policy target_families_authenticated_read on public.target_families for select to authenticated using (is_active);
create policy target_profiles_authenticated_read on public.target_profiles for select to authenticated using (is_active);
create policy opec_catalog_authenticated_read on public.opec_catalog for select to authenticated using (is_active and verification_status = 'verified');

create policy sessions_own_all on public.sessions for all to authenticated
using (exists (select 1 from public.profiles p where p.id = sessions.profile_id and p.auth_user_id = auth.uid()))
with check (exists (select 1 from public.profiles p where p.id = sessions.profile_id and p.auth_user_id = auth.uid()));

create policy session_turns_own_read on public.session_turns for select to authenticated
using (exists (select 1 from public.sessions s join public.profiles p on p.id = s.profile_id where s.id = session_turns.session_id and p.auth_user_id = auth.uid()));

create policy evaluation_events_own_read on public.evaluation_events for select to authenticated
using (exists (select 1 from public.session_turns st join public.sessions s on s.id = st.session_id join public.profiles p on p.id = s.profile_id where st.id = evaluation_events.session_turn_id and p.auth_user_id = auth.uid()));

create policy user_topic_stats_own_read on public.user_topic_stats for select to authenticated
using (exists (select 1 from public.profiles p where p.id = user_topic_stats.profile_id and p.auth_user_id = auth.uid()));

create policy tutor_turn_traces_own_read on public.tutor_turn_traces for select to authenticated
using (exists (select 1 from public.profiles p where p.id = tutor_turn_traces.profile_id and p.auth_user_id = auth.uid()));

revoke all on all tables in schema public from public, anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.learning_profiles to authenticated;
grant select on public.target_families, public.target_profiles, public.opec_catalog to authenticated;
grant select, insert, update on public.sessions to authenticated;
grant select on public.session_turns, public.evaluation_events, public.user_topic_stats, public.tutor_turn_traces to authenticated;

grant all on all tables in schema public to service_role;
grant execute on function public.advance_session_atomic(uuid, uuid, text, text, text, integer, integer, text, boolean, numeric, numeric, numeric, numeric, boolean, text, text, text, text) to service_role;

commit;
