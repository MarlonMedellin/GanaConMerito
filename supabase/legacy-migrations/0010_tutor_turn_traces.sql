begin;

create table if not exists public.tutor_turn_traces (
  id uuid primary key default gen_random_uuid(),
  trace_id uuid not null unique,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete cascade,
  item_id uuid references public.item_bank(id) on delete set null,
  contest_id text,
  profile_source_id text,
  mode text not null,
  intent text not null,
  evidence_used text[] not null default '{}',
  source_truth_refs text[] not null default '{}',
  guardrails_applied text[] not null default '{}',
  can_reveal_correct_answer boolean not null default false,
  degraded boolean not null default false,
  confidence numeric(4,3) not null default 0,
  rationale_quality text,
  created_at timestamptz not null default now()
);

create index if not exists idx_tutor_turn_traces_profile_id on public.tutor_turn_traces(profile_id);
create index if not exists idx_tutor_turn_traces_session_id on public.tutor_turn_traces(session_id);
create index if not exists idx_tutor_turn_traces_item_id on public.tutor_turn_traces(item_id);
create index if not exists idx_tutor_turn_traces_intent on public.tutor_turn_traces(intent);
create index if not exists idx_tutor_turn_traces_created_at on public.tutor_turn_traces(created_at desc);

alter table public.tutor_turn_traces enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'tutor_turn_traces'
      and policyname = 'tutor_turn_traces_select_own'
  ) then
    create policy tutor_turn_traces_select_own
    on public.tutor_turn_traces
    for select
    using (
      exists (
        select 1
        from public.profiles p
        where p.id = tutor_turn_traces.profile_id
          and p.auth_user_id = auth.uid()
      )
    );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'tutor_turn_traces'
      and policyname = 'tutor_turn_traces_insert_own'
  ) then
    create policy tutor_turn_traces_insert_own
    on public.tutor_turn_traces
    for insert
    with check (
      exists (
        select 1
        from public.profiles p
        where p.id = tutor_turn_traces.profile_id
          and p.auth_user_id = auth.uid()
      )
    );
  end if;
end
$$;

commit;
