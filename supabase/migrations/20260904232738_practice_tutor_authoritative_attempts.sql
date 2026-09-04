-- Migration: practice_tutor_authoritative_attempts
-- Agent: Google Antigravity | Model: Gemini 3.6 Flash
-- Goal: Persistent server-authoritative attempts for GCM Practice & Tutor vNext

create table if not exists public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  attempt_id text not null unique,
  session_id uuid not null references public.sessions(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  question_id text references public.questions(id) on delete set null,
  practice_mode text not null check (practice_mode in ('guided', 'simulation', 'review')),
  phase text not null default 'evaluating' check (phase in ('evaluating', 'submitted', 'expired')),
  assistance_used boolean not null default false,
  selected_option text check (selected_option in ('A', 'B', 'C', 'D')),
  client_request_id text unique,
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '1 hour')
);

create index if not exists idx_practice_attempts_session_question
  on public.practice_attempts(session_id, question_id, created_at desc);

create index if not exists idx_practice_attempts_profile
  on public.practice_attempts(profile_id);

alter table public.practice_attempts enable row level security;

create policy practice_attempts_own_select on public.practice_attempts
  for select to authenticated
  using (
    exists (
      select 1 from public.sessions s
      join public.profiles p on p.id = s.profile_id
      where s.id = practice_attempts.session_id
        and p.auth_user_id = auth.uid()
    )
  );

grant select on public.practice_attempts to authenticated;
