-- Agent: Google Antigravity | Model: Gemini 3.6 Flash
begin;

alter table public.sessions add constraint sessions_id_profile_unique unique(id, profile_id);
revoke update on public.sessions from authenticated;

create table public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  profile_id uuid not null references public.profiles(id),
  question_id text not null references public.questions(id),
  practice_mode text not null check (practice_mode in ('guided','simulation','review')),
  phase text not null default 'evaluating' check (phase in ('evaluating','submitted','expired')),
  assistance_used boolean not null default false,
  tutor_profile text not null default 'socratic' check (tutor_profile in ('socratic','direct','brief')),
  selected_option text check (selected_option in ('A','B','C','D')),
  client_request_id uuid,
  request_payload jsonb,
  result jsonb,
  session_turn_id uuid unique references public.session_turns(id),
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  expires_at timestamptz not null default now() + interval '1 hour',
  foreign key(session_id, profile_id) references public.sessions(id, profile_id),
  unique(profile_id, client_request_id),
  check(expires_at > created_at),
  check((phase = 'submitted' and selected_option is not null and submitted_at is not null and client_request_id is not null and result is not null and request_payload is not null)
    or (phase <> 'submitted' and selected_option is null and submitted_at is null and client_request_id is null and result is null and request_payload is null))
);
create unique index practice_attempts_one_active on public.practice_attempts(session_id) where phase = 'evaluating';
create index practice_attempts_session on public.practice_attempts(session_id, created_at desc);
create index practice_attempts_question on public.practice_attempts(question_id);
create index practice_attempts_owner on public.practice_attempts(profile_id, id);

create table public.practice_tutor_requests (
  attempt_id uuid not null references public.practice_attempts(id),
  client_turn_id uuid not null,
  payload jsonb not null,
  result jsonb,
  created_at timestamptz not null default now(),
  primary key(attempt_id, client_turn_id)
);
alter table public.practice_attempts enable row level security;
alter table public.practice_tutor_requests enable row level security;
revoke all on public.practice_attempts, public.practice_tutor_requests from public, anon, authenticated;
grant select on public.practice_attempts to authenticated;
grant select, insert, update on public.practice_attempts, public.practice_tutor_requests to service_role;
create policy practice_attempts_owner_read on public.practice_attempts for select to authenticated
using (profile_id in (select p.id from public.profiles p where p.auth_user_id = (select auth.uid())));

create function public.open_practice_attempt(p_profile_id uuid, p_session_id uuid, p_question_id text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare s public.sessions; a public.practice_attempts;
begin
  if current_user not in ('service_role','postgres') then raise exception 'UNAUTHORIZED'; end if;
  select * into s from public.sessions where id = p_session_id and profile_id = p_profile_id for update;
  if not found or s.status <> 'active' or s.current_state in ('session_close','expired','error') then raise exception 'SESSION_INACTIVE'; end if;
  select * into a from public.practice_attempts where session_id = s.id and phase = 'evaluating';
  if found then return to_jsonb(a); end if;
  if not exists(select 1 from public.questions q join public.question_releases r on r.id=q.release_id where q.id=p_question_id and q.sync_state='current' and r.status='active') then raise exception 'QUESTION_INACTIVE'; end if;
  insert into public.practice_attempts(session_id,profile_id,question_id,practice_mode)
  values(s.id,p_profile_id,p_question_id,case s.mode when 'exam' then 'simulation' when 'review' then 'review' else 'guided' end) returning * into a;
  return to_jsonb(a);
end;
$$;

create function public.submit_practice_attempt(p_profile_id uuid, p_attempt_id uuid, p_request_id uuid, p_payload jsonb, p_result jsonb, p_next_question_id text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare a public.practice_attempts; s public.sessions; e jsonb; t uuid; r jsonb;
begin
  if current_user not in ('service_role','postgres') then raise exception 'UNAUTHORIZED'; end if;
  select * into a from public.practice_attempts where id=p_attempt_id for update;
  if not found or a.profile_id <> p_profile_id then raise exception 'ATTEMPT_NOT_FOUND'; end if;
  if p_request_id is null or p_payload is null or p_payload->>'selectedOption' is null then raise exception 'INVALID_REQUEST'; end if;
  if a.session_id::text is distinct from p_payload->>'sessionId' or a.question_id is distinct from p_payload->>'itemId' then raise exception 'ATTEMPT_MISMATCH'; end if;
  if a.phase='submitted' then
    if a.client_request_id=p_request_id and a.request_payload=p_payload then return a.result; end if;
    raise exception 'IDEMPOTENCY_CONFLICT';
  end if;
  select * into s from public.sessions where id=a.session_id and profile_id=p_profile_id for update;
  if not found or s.status <> 'active' or s.current_state in ('session_close','expired','error') then raise exception 'SESSION_INACTIVE'; end if;
  if a.phase <> 'evaluating' or a.expires_at <= clock_timestamp() then raise exception 'ATTEMPT_EXPIRED'; end if;
  if a.practice_mode is distinct from (case when s.mode = 'exam' then 'simulation' when s.mode = 'review' then 'review' else 'guided' end) then raise exception 'MODE_MISMATCH'; end if;
  if a.practice_mode='review' then raise exception 'REVIEW_NO_RESCORING'; end if;
  if p_payload ? 'mode' or p_payload ? 'assistanceUsed' then raise exception 'CLIENT_AUTHORITY_FORBIDDEN'; end if;
  e := p_result->'evaluation';
  select session_turn_id into t from public.advance_session_atomic(
    p_profile_id,a.session_id,a.question_id,p_payload->>'selectedOption',p_payload->>'userRationale',
    (p_payload->>'responseTimeMs')::integer,(p_payload->>'confidenceSelfReport')::integer,
    p_result->>'feedbackText',(e->>'isCorrect')::boolean,(e->>'reasoningScore')::numeric,
    (e->>'normativeConsistencyScore')::numeric,(e->>'competencyScore')::numeric,(e->>'estimatedThetaDelta')::numeric,
    (e->>'remediationNeeded')::boolean,e->>'evaluationSource',e->>'evaluationVersion',s.current_state,p_result->>'currentState');
  r := jsonb_set(p_result,'{attemptResult,assistanceUsed}',to_jsonb(a.assistance_used));
  update public.practice_attempts set phase='submitted', selected_option=p_payload->>'selectedOption',client_request_id=p_request_id,
    request_payload=p_payload,result=r,submitted_at=now(),session_turn_id=t where id=a.id;
  if p_next_question_id is not null and p_result->>'currentState' <> 'session_close' then
    perform public.open_practice_attempt(p_profile_id,a.session_id,p_next_question_id);
  end if;
  return r;
end;
$$;

create function public.claim_practice_tutor_turn(p_profile_id uuid, p_attempt_id uuid, p_client_turn_id uuid, p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare a public.practice_attempts; t public.practice_tutor_requests;
begin
  if current_user not in ('service_role','postgres') then raise exception 'UNAUTHORIZED'; end if;
  select * into a from public.practice_attempts where id=p_attempt_id for update;
  if not found or a.profile_id<>p_profile_id then raise exception 'ATTEMPT_NOT_FOUND'; end if;
  if a.session_id::text is distinct from p_payload->>'sessionId' or a.question_id is distinct from p_payload->>'itemId' then raise exception 'ATTEMPT_MISMATCH'; end if;
  select * into t from public.practice_tutor_requests where attempt_id=a.id and client_turn_id=p_client_turn_id;
  if found then
    if t.payload is distinct from p_payload then raise exception 'TURN_CONFLICT'; end if;
    return jsonb_build_object('claimed',false,'result',t.result,'attempt',to_jsonb(a));
  end if;
  if a.phase='expired' or a.expires_at<=clock_timestamp() then raise exception 'ATTEMPT_EXPIRED'; end if;
  if a.phase='evaluating' and (a.practice_mode<>'guided' or not exists(select 1 from public.sessions where id=a.session_id and status='active')) then raise exception 'TUTOR_PREANSWER_FORBIDDEN'; end if;
  if p_payload->>'profile' not in ('socratic','direct','brief') then raise exception 'INVALID_TUTOR_PROFILE'; end if;
  insert into public.practice_tutor_requests(attempt_id,client_turn_id,payload) values(a.id,p_client_turn_id,p_payload);
  update public.practice_attempts set assistance_used=assistance_used or phase='evaluating',tutor_profile=p_payload->>'profile' where id=a.id returning * into a;
  return jsonb_build_object('claimed',true,'attempt',to_jsonb(a));
end;
$$;

revoke all on function public.open_practice_attempt(uuid,uuid,text) from public,anon,authenticated;
revoke all on function public.submit_practice_attempt(uuid,uuid,uuid,jsonb,jsonb,text) from public,anon,authenticated;
revoke all on function public.claim_practice_tutor_turn(uuid,uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.open_practice_attempt(uuid,uuid,text) to service_role;
grant execute on function public.submit_practice_attempt(uuid,uuid,uuid,jsonb,jsonb,text) to service_role;
grant execute on function public.claim_practice_tutor_turn(uuid,uuid,uuid,jsonb) to service_role;
create view public.practice_metric_summary with (security_invoker=true) as
select profile_id, assistance_used,
  count(*) as attempts,
  count(*) filter(where (result->'evaluation'->>'isCorrect')::boolean) as correct_count,
  sum((result->'evaluation'->>'estimatedThetaDelta')::numeric) as theta_delta
from public.practice_attempts where phase='submitted' and practice_mode<>'review'
group by profile_id,assistance_used;
revoke all on public.practice_metric_summary from public,anon,authenticated;
grant select on public.practice_metric_summary to authenticated,service_role;
commit;
