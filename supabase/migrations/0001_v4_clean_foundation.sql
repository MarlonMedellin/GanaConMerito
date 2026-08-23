-- Clean V4 baseline. This version intentionally reuses migration number 0001.
-- A legacy database that already recorded 0001-0030 must never execute this file.

begin;

create extension if not exists pgcrypto;

create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.runtime_metadata (
  singleton boolean primary key default true check (singleton),
  baseline_id text not null check (baseline_id = 'gcm-v4-clean-v1'),
  environment_kind text not null default 'local' check (environment_kind in ('local', 'test', 'preview', 'staging', 'production')),
  instance_id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

insert into public.runtime_metadata (baseline_id) values ('gcm-v4-clean-v1');

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

create table public.target_families (
  code text primary key,
  name text not null,
  description text,
  is_active boolean not null,
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  synced_at timestamptz not null default now()
);

create table public.target_profiles (
  code text primary key,
  family_code text not null references public.target_families(code),
  name text not null,
  is_active boolean not null,
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  synced_at timestamptz not null default now(),
  unique (family_code, code)
);

create table public.opec_catalog (
  id uuid primary key default gen_random_uuid(),
  source_system text not null,
  external_opec_id text not null,
  family_code text not null references public.target_families(code),
  profile_code text not null references public.target_profiles(code),
  convocation_code text,
  entity_name text,
  position_name text not null,
  source_reference text not null,
  source_url text,
  verification_status text not null check (verification_status in ('verified')),
  is_active boolean not null,
  metadata jsonb not null default '{}'::jsonb,
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  synced_at timestamptz not null default now(),
  unique (source_system, external_opec_id),
  foreign key (family_code, profile_code) references public.target_profiles(family_code, code)
);

create table public.learning_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  target_profile_code text references public.target_profiles(code),
  target_opec_id uuid references public.opec_catalog(id),
  country_context text not null default 'colombia',
  preferred_feedback_style text not null default 'socratic',
  active_goal text,
  active_areas text[] not null default '{}',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.question_releases (
  id uuid primary key default gen_random_uuid(),
  bank text not null,
  git_sha text not null check (git_sha ~ '^[a-f0-9]{40}$'),
  manifest_source_sha text not null check (manifest_source_sha ~ '^[a-f0-9]{40}$'),
  manifest_hash text not null check (manifest_hash ~ '^[a-f0-9]{64}$'),
  corpus_hash text not null check (corpus_hash ~ '^[a-f0-9]{64}$'),
  ids_hash text not null check (ids_hash ~ '^[a-f0-9]{64}$'),
  expected_item_count integer not null check (expected_item_count >= 0),
  status text not null default 'synced' check (status in ('synced', 'active', 'retired')),
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  unique (bank, manifest_hash)
);

create unique index question_releases_one_active_per_bank
  on public.question_releases(bank) where status = 'active';

create table public.questions (
  id text primary key,
  release_id uuid not null references public.question_releases(id),
  domain text not null,
  topic text not null,
  competency text not null,
  question_type text not null,
  cognitive_level text not null,
  estimated_difficulty numeric(4,3) not null check (estimated_difficulty between 0 and 1),
  editorial_scope text not null check (editorial_scope in ('general', 'opec_specific')),
  editorial_opec_id text,
  context text,
  stem text not null,
  correct_option text not null check (correct_option in ('A', 'B', 'C', 'D')),
  explanations jsonb not null,
  hint text not null,
  learning_note text not null,
  source_reference text not null,
  source_locator text,
  source_url text,
  source_type text,
  source_path text not null,
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  sync_state text not null default 'current' check (sync_state in ('current', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((editorial_scope = 'opec_specific') = (editorial_opec_id is not null)),
  check (jsonb_typeof(explanations) = 'object')
);

create table public.question_options (
  question_id text not null references public.questions(id) on delete cascade,
  option_key text not null check (option_key in ('A', 'B', 'C', 'D')),
  option_text text not null,
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  primary key (question_id, option_key)
);

create table public.item_target_families (
  question_id text not null references public.questions(id) on delete cascade,
  family_code text not null references public.target_families(code),
  evidence jsonb not null,
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  primary key (question_id, family_code)
);

create table public.item_target_profiles (
  question_id text not null references public.questions(id) on delete cascade,
  profile_code text not null references public.target_profiles(code),
  evidence jsonb not null,
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  primary key (question_id, profile_code)
);

create table public.item_opec_targets (
  question_id text not null references public.questions(id) on delete cascade,
  opec_id uuid not null references public.opec_catalog(id),
  evidence jsonb not null,
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  primary key (question_id, opec_id)
);

create table public.knowledge_sources (
  source_id text primary key,
  source_type text not null,
  title text not null,
  reference text not null,
  issuer_or_author text,
  jurisdiction text,
  verification_status text not null check (verification_status = 'verified'),
  verified_at timestamptz not null,
  last_checked_at date,
  source_system text,
  source_url text,
  repo_path text,
  locator text,
  metadata jsonb not null default '{}'::jsonb,
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  synced_at timestamptz not null default now()
);

create table public.knowledge_source_targets (
  source_id text not null references public.knowledge_sources(source_id) on delete cascade,
  target_type text not null check (target_type in ('common', 'family', 'profile', 'opec')),
  family_code text references public.target_families(code),
  profile_code text references public.target_profiles(code),
  opec_id uuid references public.opec_catalog(id),
  relevance text not null check (relevance in ('core', 'supporting', 'optional')),
  locator text,
  reason text not null,
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  primary key (source_id, target_type, content_hash),
  check (num_nonnulls(family_code, profile_code, opec_id) = case when target_type = 'common' then 0 else 1 end)
);

create table public.item_source_links (
  question_id text not null references public.questions(id) on delete cascade,
  source_id text not null references public.knowledge_sources(source_id),
  relation_type text not null check (relation_type in ('decisive', 'supporting')),
  locator text,
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  primary key (question_id, source_id, relation_type)
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  target_profile_code text references public.target_profiles(code),
  target_opec_id uuid references public.opec_catalog(id),
  mode text not null check (mode in ('practice', 'exam', 'review')),
  current_state text not null check (current_state in ('onboarding', 'diagnostic', 'practice', 'remediation', 'review', 'session_close', 'expired', 'error')),
  status text not null default 'active' check (status in ('active', 'completed', 'expired', 'error')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.session_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  question_id text references public.questions(id) on delete set null,
  turn_number integer not null check (turn_number >= 1),
  selected_option text check (selected_option in ('A', 'B', 'C', 'D')),
  user_rationale text,
  model_feedback text,
  response_time_ms integer check (response_time_ms is null or response_time_ms >= 0),
  confidence_self_report integer check (confidence_self_report is null or confidence_self_report between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, turn_number)
);

create table public.evaluation_events (
  id uuid primary key default gen_random_uuid(),
  session_turn_id uuid not null unique references public.session_turns(id) on delete cascade,
  question_id text references public.questions(id) on delete set null,
  is_correct boolean not null,
  reasoning_score numeric(5,2) not null check (reasoning_score between 0 and 100),
  normative_consistency_score numeric(5,2) not null check (normative_consistency_score between 0 and 100),
  competency_score numeric(5,2) not null check (competency_score between 0 and 100),
  estimated_theta_delta numeric(6,3) not null,
  remediation_needed boolean not null,
  evaluation_source text not null check (evaluation_source in ('deterministic', 'llm', 'hybrid')),
  evaluation_version text not null,
  created_at timestamptz not null default now()
);

create table public.user_topic_stats (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  domain text not null,
  competency text not null,
  attempts integer not null default 0 check (attempts >= 0),
  correct_count integer not null default 0 check (correct_count between 0 and attempts),
  avg_reasoning_score numeric(5,2) not null default 0 check (avg_reasoning_score between 0 and 100),
  avg_difficulty numeric(4,3) not null default 0 check (avg_difficulty between 0 and 1),
  estimated_level numeric(6,3) not null default 0,
  updated_at timestamptz not null default now(),
  primary key (profile_id, domain, competency)
);

create table public.tutor_turn_traces (
  id uuid primary key default gen_random_uuid(),
  trace_id uuid not null unique,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete cascade,
  question_id text references public.questions(id) on delete set null,
  contest_id text,
  profile_source_id text,
  mode text not null,
  intent text not null,
  evidence_used text[] not null default '{}',
  source_truth_refs text[] not null default '{}',
  guardrails_applied text[] not null default '{}',
  can_reveal_correct_answer boolean not null default false,
  degraded boolean not null default false,
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  rationale_quality text,
  trace_signals jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.tutor_shadow_metrics (
  id uuid primary key default gen_random_uuid(),
  trace_id uuid not null,
  provider text not null,
  model text not null,
  status text not null,
  latency_ms integer,
  schema_valid boolean not null default false,
  guardrail_triggered boolean not null default false,
  fallback_used boolean not null default false,
  error_code text,
  created_at timestamptz not null default now()
);

create table public.content_sync_runs (
  id uuid primary key default gen_random_uuid(),
  git_sha text not null check (git_sha ~ '^[a-f0-9]{40}$'),
  manifest_hash text not null check (manifest_hash ~ '^[a-f0-9]{64}$'),
  corpus_hash text not null check (corpus_hash ~ '^[a-f0-9]{64}$'),
  ids_hash text not null check (ids_hash ~ '^[a-f0-9]{64}$'),
  targeting_catalog_hash text not null check (targeting_catalog_hash ~ '^[a-f0-9]{64}$'),
  opec_catalog_hash text not null check (opec_catalog_hash ~ '^[a-f0-9]{64}$'),
  knowledge_catalog_hash text not null check (knowledge_catalog_hash ~ '^[a-f0-9]{64}$'),
  plan_hash text not null check (plan_hash ~ '^[a-f0-9]{64}$'),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null check (status in ('running', 'succeeded', 'failed', 'verified')),
  counts jsonb not null default '{}'::jsonb,
  actor text not null,
  mechanism text not null,
  safe_error text,
  verification_result jsonb,
  target_instance_id uuid not null
);

create index questions_selection_idx on public.questions(release_id, sync_state, domain, competency);
create index sessions_profile_idx on public.sessions(profile_id, created_at desc);
create index session_turns_session_idx on public.session_turns(session_id, turn_number);
create index evaluation_events_question_idx on public.evaluation_events(question_id);
create index content_sync_runs_started_idx on public.content_sync_runs(started_at desc);

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger learning_profiles_updated_at before update on public.learning_profiles for each row execute function public.set_updated_at();
create trigger questions_updated_at before update on public.questions for each row execute function public.set_updated_at();
create trigger sessions_updated_at before update on public.sessions for each row execute function public.set_updated_at();
create trigger session_turns_updated_at before update on public.session_turns for each row execute function public.set_updated_at();

commit;
