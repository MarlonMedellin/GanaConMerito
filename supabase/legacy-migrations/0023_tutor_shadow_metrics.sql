begin;

create table if not exists public.tutor_shadow_metrics (
  id uuid primary key default gen_random_uuid(),
  trace_id uuid not null,
  provider text not null,
  model text not null,
  schema_version text not null,
  intent text not null,
  response_mode text not null,
  status text not null check (status in ('accepted', 'rejected', 'failed', 'disabled')),
  latency_ms integer not null check (latency_ms >= 0),
  input_tokens integer,
  output_tokens integer,
  cost_usd numeric(12, 8),
  deterministic_fallback_required boolean not null default true,
  error_code text,
  created_at timestamptz not null default now()
);

create index if not exists idx_tutor_shadow_metrics_created_at
  on public.tutor_shadow_metrics(created_at desc);

alter table public.tutor_shadow_metrics enable row level security;
revoke all on table public.tutor_shadow_metrics from public, anon, authenticated;
grant select, insert on table public.tutor_shadow_metrics to service_role;

comment on table public.tutor_shadow_metrics is
  'Métricas minimizadas del Tutor LLM shadow; no almacena prompts, respuestas ni identificadores de usuario/sesión.';

commit;
