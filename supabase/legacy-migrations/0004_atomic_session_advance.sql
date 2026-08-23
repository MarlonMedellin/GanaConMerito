create or replace function public.advance_session_atomic(
  p_profile_id uuid,
  p_session_id uuid,
  p_item_id uuid,
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
returns table(
  session_turn_id uuid,
  turn_number integer,
  persisted_state text
)
language plpgsql
security definer
as $$
declare
  v_turn_id uuid;
  v_turn_number integer;
  v_attempts integer;
  v_correct_count integer;
  v_avg_reasoning_score numeric(5,2);
  v_avg_difficulty numeric(4,2);
  v_estimated_level numeric(6,3);
  v_area text;
  v_competency text;
  v_difficulty numeric(4,2);
begin
  if not exists (
    select 1
    from public.sessions s
    where s.id = p_session_id
      and s.profile_id = p_profile_id
  ) then
    raise exception 'SESSION_NOT_FOUND_OR_FORBIDDEN';
  end if;

  select area, competency, difficulty
    into v_area, v_competency, v_difficulty
  from public.item_bank
  where id = p_item_id;

  if not found then
    raise exception 'ITEM_NOT_FOUND';
  end if;

  select coalesce(max(turn_number), 0) + 1
    into v_turn_number
  from public.session_turns
  where session_id = p_session_id;

  insert into public.session_turns (
    session_id,
    item_id,
    turn_number,
    selected_option,
    user_rationale,
    response_time_ms,
    confidence_self_report,
    model_feedback
  ) values (
    p_session_id,
    p_item_id,
    v_turn_number,
    p_selected_option,
    p_user_rationale,
    p_response_time_ms,
    p_confidence_self_report,
    p_feedback_text
  )
  returning id into v_turn_id;

  insert into public.evaluation_events (
    session_turn_id,
    item_id,
    is_correct,
    reasoning_score,
    normative_consistency_score,
    competency_score,
    estimated_theta_delta,
    remediation_needed,
    evaluation_source,
    evaluation_version
  ) values (
    v_turn_id,
    p_item_id,
    p_is_correct,
    p_reasoning_score,
    p_normative_consistency_score,
    p_competency_score,
    p_estimated_theta_delta,
    p_remediation_needed,
    p_evaluation_source,
    p_evaluation_version
  );

  insert into public.user_topic_stats (
    profile_id,
    area,
    competency,
    attempts,
    correct_count,
    avg_reasoning_score,
    avg_difficulty,
    estimated_level
  ) values (
    p_profile_id,
    v_area,
    v_competency,
    1,
    case when p_is_correct then 1 else 0 end,
    p_reasoning_score,
    v_difficulty,
    p_estimated_theta_delta
  )
  on conflict (profile_id, area, competency)
  do update set
    attempts = public.user_topic_stats.attempts + 1,
    correct_count = public.user_topic_stats.correct_count + case when p_is_correct then 1 else 0 end,
    avg_reasoning_score = round(((public.user_topic_stats.avg_reasoning_score * public.user_topic_stats.attempts) + p_reasoning_score) / (public.user_topic_stats.attempts + 1), 2),
    avg_difficulty = round(((public.user_topic_stats.avg_difficulty * public.user_topic_stats.attempts) + v_difficulty) / (public.user_topic_stats.attempts + 1), 2),
    estimated_level = round(public.user_topic_stats.estimated_level + p_estimated_theta_delta, 3),
    updated_at = now();

  update public.sessions
  set current_state = p_current_state,
      updated_at = now()
  where id = p_session_id
    and profile_id = p_profile_id;

  return query
  select v_turn_id, v_turn_number, p_current_state;
end;
$$;
