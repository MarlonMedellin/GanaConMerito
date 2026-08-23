-- 0001_init_mvp.sql
-- MVP inicial para app de práctica y evaluación adaptativa
-- Supabase / PostgreSQL

begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.learning_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  target_role text not null,
  exam_type text not null,
  country_context text not null default 'colombia',
  preferred_feedback_style text not null default 'socratic',
  active_goal text,
  active_areas text[] not null default '{}',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  mode text not null check (mode in ('practice', 'exam', 'review')),
  current_state text not null check (
    current_state in (
      'onboarding',
      'diagnostic',
      'practice',
      'remediation',
      'review',
      'session_close',
      'expired',
      'error'
    )
  ),
  status text not null default 'active' check (
    status in ('active', 'completed', 'expired', 'error')
  ),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.item_bank (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  area text not null,
  subarea text,
  exam_type text not null,
  competency text not null,
  difficulty numeric(4,2) not null check (difficulty >= 0 and difficulty <= 1),
  target_level text,
  item_type text not null default 'multiple_choice' check (
    item_type in ('multiple_choice')
  ),
  stem text not null,
  correct_option text not null check (correct_option in ('A', 'B', 'C', 'D')),
  explanation text not null,
  normative_refs text[] not null default '{}',
  is_published boolean not null default false,
  version integer not null default 1 check (version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.item_options (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.item_bank(id) on delete cascade,
  option_key text not null check (option_key in ('A', 'B', 'C', 'D')),
  option_text text not null,
  unique (item_id, option_key)
);

create table public.session_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  item_id uuid references public.item_bank(id) on delete set null,
  turn_number integer not null check (turn_number >= 1),
  prompt_text text,
  selected_option text check (selected_option in ('A', 'B', 'C', 'D')),
  user_rationale text,
  model_feedback text,
  response_time_ms integer check (
    response_time_ms is null or response_time_ms >= 0
  ),
  confidence_self_report integer check (
    confidence_self_report is null or
    (confidence_self_report >= 1 and confidence_self_report <= 5)
  ),
  created_at timestamptz not null default now(),
  unique (session_id, turn_number)
);

create table public.evaluation_events (
  id uuid primary key default gen_random_uuid(),
  session_turn_id uuid not null references public.session_turns(id) on delete cascade,
  item_id uuid references public.item_bank(id) on delete set null,
  is_correct boolean not null,
  reasoning_score numeric(5,2) not null default 0 check (
    reasoning_score >= 0 and reasoning_score <= 100
  ),
  normative_consistency_score numeric(5,2) not null default 0 check (
    normative_consistency_score >= 0 and normative_consistency_score <= 100
  ),
  competency_score numeric(5,2) not null default 0 check (
    competency_score >= 0 and competency_score <= 100
  ),
  estimated_theta_delta numeric(6,3) not null default 0,
  remediation_needed boolean not null default false,
  evaluation_source text not null default 'hybrid' check (
    evaluation_source in ('deterministic', 'llm', 'hybrid')
  ),
  evaluation_version text not null default 'baseline-heuristic-v1',
  created_at timestamptz not null default now()
);

create table public.user_topic_stats (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  area text not null,
  competency text not null,
  attempts integer not null default 0 check (attempts >= 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  avg_reasoning_score numeric(5,2) not null default 0 check (
    avg_reasoning_score >= 0 and avg_reasoning_score <= 100
  ),
  avg_difficulty numeric(4,2) not null default 0 check (
    avg_difficulty >= 0 and avg_difficulty <= 1
  ),
  estimated_level numeric(6,3) not null default 0,
  percentile_segment numeric(5,2) check (
    percentile_segment is null or
    (percentile_segment >= 0 and percentile_segment <= 100)
  ),
  updated_at timestamptz not null default now(),
  unique (profile_id, area, competency)
);

create table public.user_skill_snapshots (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  snapshot_type text not null check (
    snapshot_type in ('session', 'weekly', 'topic')
  ),
  summary_text text not null,
  strengths_json jsonb not null default '{}'::jsonb,
  weaknesses_json jsonb not null default '{}'::jsonb,
  recurrent_errors_json jsonb not null default '{}'::jsonb,
  recommended_focus_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_profiles_auth_user_id on public.profiles(auth_user_id);
create index idx_learning_profiles_profile_id on public.learning_profiles(profile_id);
create index idx_sessions_profile_id on public.sessions(profile_id);
create index idx_sessions_profile_state on public.sessions(profile_id, current_state);
create index idx_sessions_profile_mode on public.sessions(profile_id, mode);
create index idx_item_bank_area on public.item_bank(area);
create index idx_item_bank_exam_type on public.item_bank(exam_type);
create index idx_item_bank_competency on public.item_bank(competency);
create index idx_item_bank_published on public.item_bank(is_published);
create index idx_item_bank_area_competency on public.item_bank(area, competency);
create index idx_item_bank_exam_area_competency on public.item_bank(exam_type, area, competency);
create index idx_item_options_item_id on public.item_options(item_id);
create index idx_session_turns_session_id on public.session_turns(session_id);
create index idx_session_turns_item_id on public.session_turns(item_id);
create index idx_evaluation_events_session_turn_id on public.evaluation_events(session_turn_id);
create index idx_evaluation_events_item_id on public.evaluation_events(item_id);
create index idx_user_topic_stats_profile_id on public.user_topic_stats(profile_id);
create index idx_user_topic_stats_profile_area on public.user_topic_stats(profile_id, area);
create index idx_user_topic_stats_profile_competency on public.user_topic_stats(profile_id, competency);
create index idx_user_skill_snapshots_profile_id on public.user_skill_snapshots(profile_id);
create index idx_user_skill_snapshots_profile_type on public.user_skill_snapshots(profile_id, snapshot_type);

create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger trg_learning_profiles_updated_at
before update on public.learning_profiles
for each row
execute function public.set_updated_at();

create trigger trg_item_bank_updated_at
before update on public.item_bank
for each row
execute function public.set_updated_at();

create trigger trg_user_topic_stats_updated_at
before update on public.user_topic_stats
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.learning_profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.item_bank enable row level security;
alter table public.item_options enable row level security;
alter table public.session_turns enable row level security;
alter table public.evaluation_events enable row level security;
alter table public.user_topic_stats enable row level security;
alter table public.user_skill_snapshots enable row level security;

create policy profiles_select_own
on public.profiles
for select
using (auth.uid() = auth_user_id);

create policy profiles_insert_own
on public.profiles
for insert
with check (auth.uid() = auth_user_id);

create policy profiles_update_own
on public.profiles
for update
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

create policy learning_profiles_select_own
on public.learning_profiles
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = learning_profiles.profile_id
      and p.auth_user_id = auth.uid()
  )
);

create policy learning_profiles_insert_own
on public.learning_profiles
for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = learning_profiles.profile_id
      and p.auth_user_id = auth.uid()
  )
);

create policy learning_profiles_update_own
on public.learning_profiles
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = learning_profiles.profile_id
      and p.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = learning_profiles.profile_id
      and p.auth_user_id = auth.uid()
  )
);

create policy sessions_select_own
on public.sessions
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = sessions.profile_id
      and p.auth_user_id = auth.uid()
  )
);

create policy sessions_insert_own
on public.sessions
for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = sessions.profile_id
      and p.auth_user_id = auth.uid()
  )
);

create policy sessions_update_own
on public.sessions
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = sessions.profile_id
      and p.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = sessions.profile_id
      and p.auth_user_id = auth.uid()
  )
);

create policy item_bank_select_published
on public.item_bank
for select
using (is_published = true);

create policy item_bank_insert_admin
on public.item_bank
for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.is_admin = true
  )
);

create policy item_bank_update_admin
on public.item_bank
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.is_admin = true
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.is_admin = true
  )
);

create policy item_options_select_for_published_items
on public.item_options
for select
using (
  exists (
    select 1
    from public.item_bank ib
    where ib.id = item_options.item_id
      and ib.is_published = true
  )
);

create policy item_options_insert_admin
on public.item_options
for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.is_admin = true
  )
);

create policy item_options_update_admin
on public.item_options
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.is_admin = true
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.is_admin = true
  )
);

create policy session_turns_select_own
on public.session_turns
for select
using (
  exists (
    select 1
    from public.sessions s
    join public.profiles p on p.id = s.profile_id
    where s.id = session_turns.session_id
      and p.auth_user_id = auth.uid()
  )
);

create policy session_turns_insert_own
on public.session_turns
for insert
with check (
  exists (
    select 1
    from public.sessions s
    join public.profiles p on p.id = s.profile_id
    where s.id = session_turns.session_id
      and p.auth_user_id = auth.uid()
  )
);

create policy session_turns_update_own
on public.session_turns
for update
using (
  exists (
    select 1
    from public.sessions s
    join public.profiles p on p.id = s.profile_id
    where s.id = session_turns.session_id
      and p.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.sessions s
    join public.profiles p on p.id = s.profile_id
    where s.id = session_turns.session_id
      and p.auth_user_id = auth.uid()
  )
);

create policy evaluation_events_select_own
on public.evaluation_events
for select
using (
  exists (
    select 1
    from public.session_turns st
    join public.sessions s on s.id = st.session_id
    join public.profiles p on p.id = s.profile_id
    where st.id = evaluation_events.session_turn_id
      and p.auth_user_id = auth.uid()
  )
);

create policy evaluation_events_insert_own
on public.evaluation_events
for insert
with check (
  exists (
    select 1
    from public.session_turns st
    join public.sessions s on s.id = st.session_id
    join public.profiles p on p.id = s.profile_id
    where st.id = evaluation_events.session_turn_id
      and p.auth_user_id = auth.uid()
  )
);

create policy evaluation_events_update_own
on public.evaluation_events
for update
using (
  exists (
    select 1
    from public.session_turns st
    join public.sessions s on s.id = st.session_id
    join public.profiles p on p.id = s.profile_id
    where st.id = evaluation_events.session_turn_id
      and p.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.session_turns st
    join public.sessions s on s.id = st.session_id
    join public.profiles p on p.id = s.profile_id
    where st.id = evaluation_events.session_turn_id
      and p.auth_user_id = auth.uid()
  )
);

create policy user_topic_stats_select_own
on public.user_topic_stats
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = user_topic_stats.profile_id
      and p.auth_user_id = auth.uid()
  )
);

create policy user_topic_stats_insert_own
on public.user_topic_stats
for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = user_topic_stats.profile_id
      and p.auth_user_id = auth.uid()
  )
);

create policy user_topic_stats_update_own
on public.user_topic_stats
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = user_topic_stats.profile_id
      and p.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = user_topic_stats.profile_id
      and p.auth_user_id = auth.uid()
  )
);

create policy user_skill_snapshots_select_own
on public.user_skill_snapshots
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = user_skill_snapshots.profile_id
      and p.auth_user_id = auth.uid()
  )
);

create policy user_skill_snapshots_insert_own
on public.user_skill_snapshots
for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = user_skill_snapshots.profile_id
      and p.auth_user_id = auth.uid()
  )
);

create policy user_skill_snapshots_update_own
on public.user_skill_snapshots
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = user_skill_snapshots.profile_id
      and p.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = user_skill_snapshots.profile_id
      and p.auth_user_id = auth.uid()
  )
);

commit;
