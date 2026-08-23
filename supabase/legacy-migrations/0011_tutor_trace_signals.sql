begin;

alter table public.tutor_turn_traces
  add column if not exists trace_signals jsonb not null default '{}'::jsonb;

create index if not exists idx_tutor_turn_traces_trace_signals_gin
  on public.tutor_turn_traces using gin (trace_signals);

commit;
