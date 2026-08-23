-- 0006_profiles_nuclei_editorial_base.sql
-- Base de segmentación por perfil profesional + núcleos temáticos + capa editorial extendida
-- Diseñada para preparar la Fase 1 (segmentación invisible) sin romper el flujo actual.

begin;

-- -----------------------------------------------------------------------------
-- 1. Catálogos base
-- -----------------------------------------------------------------------------

create table if not exists public.professional_profiles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  area text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.thematic_nuclei (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  -- Metadata organizativa/editorial; no reemplaza area/competency de item_bank.
  area text,
  subarea text,
  is_universal boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 2. Matriz perfil profesional ↔ núcleo temático
-- -----------------------------------------------------------------------------

create table if not exists public.profile_thematic_nuclei (
  id uuid primary key default gen_random_uuid(),
  professional_profile_id uuid not null references public.professional_profiles(id) on delete cascade,
  thematic_nucleus_id uuid not null references public.thematic_nuclei(id) on delete cascade,
  is_enabled boolean not null default true,
  priority_weight integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (professional_profile_id, thematic_nucleus_id)
);

-- -----------------------------------------------------------------------------
-- 3. Extensión del perfil pedagógico del usuario
-- -----------------------------------------------------------------------------
-- El perfil profesional usado para segmentación pertenece a learning_profiles,
-- no a profiles (identidad base).

alter table public.learning_profiles
  add column if not exists professional_profile_id uuid
  references public.professional_profiles(id);

create index if not exists idx_learning_profiles_professional_profile_id
  on public.learning_profiles(professional_profile_id);

-- -----------------------------------------------------------------------------
-- 4. Extensión del banco de ítems
-- -----------------------------------------------------------------------------

alter table public.item_bank
  add column if not exists thematic_nucleus_id uuid references public.thematic_nuclei(id),
  add column if not exists status text not null default 'draft' check (
    status in ('draft', 'review', 'published', 'archived')
  ),
  add column if not exists is_active boolean not null default true,
  add column if not exists source_type text not null default 'manual' check (
    source_type in ('manual', 'markdown', 'import', 'seed')
  ),
  add column if not exists source_path text;

comment on column public.item_bank.thematic_nucleus_id is
  'Nullable durante transición. Debe pasar a NOT NULL después del backfill completo de segmentación.';

comment on column public.item_bank.status is
  'Nueva verdad editorial efectiva. Usar junto con is_active para elegibilidad. is_published queda en transición por compatibilidad.';

-- -----------------------------------------------------------------------------
-- 5. Sincronización editorial transitoria
-- -----------------------------------------------------------------------------
-- Backfill mínimo para no dejar contradicción inmediata entre is_published y status.
-- La migración posterior deberá deprecar is_published una vez todas las queries críticas
-- usen status + is_active.

update public.item_bank
set status = 'published'
where is_published = true
  and status = 'draft';

update public.item_bank
set status = 'draft'
where is_published = false
  and status = 'draft';

-- -----------------------------------------------------------------------------
-- 6. Índices operativos
-- -----------------------------------------------------------------------------

create index if not exists idx_professional_profiles_code
  on public.professional_profiles(code);
create index if not exists idx_professional_profiles_active
  on public.professional_profiles(is_active);

create index if not exists idx_thematic_nuclei_code
  on public.thematic_nuclei(code);
create index if not exists idx_thematic_nuclei_active
  on public.thematic_nuclei(is_active);
create index if not exists idx_thematic_nuclei_universal
  on public.thematic_nuclei(is_universal);

create index if not exists idx_profile_thematic_nuclei_professional_profile_id
  on public.profile_thematic_nuclei(professional_profile_id);
create index if not exists idx_profile_thematic_nuclei_thematic_nucleus_id
  on public.profile_thematic_nuclei(thematic_nucleus_id);
create index if not exists idx_profile_thematic_nuclei_enabled
  on public.profile_thematic_nuclei(is_enabled);
create index if not exists idx_profile_thematic_nuclei_profile_nucleus
  on public.profile_thematic_nuclei(professional_profile_id, thematic_nucleus_id);

create index if not exists idx_item_bank_thematic_nucleus_id
  on public.item_bank(thematic_nucleus_id);
create index if not exists idx_item_bank_status
  on public.item_bank(status);
create index if not exists idx_item_bank_is_active
  on public.item_bank(is_active);
create index if not exists idx_item_bank_selection
  on public.item_bank(thematic_nucleus_id, status, is_active);

-- -----------------------------------------------------------------------------
-- 7. Triggers updated_at
-- -----------------------------------------------------------------------------

create trigger trg_professional_profiles_updated_at
before update on public.professional_profiles
for each row
execute function public.set_updated_at();

create trigger trg_thematic_nuclei_updated_at
before update on public.thematic_nuclei
for each row
execute function public.set_updated_at();

create trigger trg_profile_thematic_nuclei_updated_at
before update on public.profile_thematic_nuclei
for each row
execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 8. RLS de nuevas tablas
-- -----------------------------------------------------------------------------

alter table public.professional_profiles enable row level security;
alter table public.thematic_nuclei enable row level security;
alter table public.profile_thematic_nuclei enable row level security;

-- Catálogos legibles por usuarios autenticados para selectores de UI/onboarding.
create policy professional_profiles_select_authenticated
on public.professional_profiles
for select
using (auth.uid() is not null);

create policy thematic_nuclei_select_authenticated
on public.thematic_nuclei
for select
using (auth.uid() is not null);

-- La matriz perfil ↔ núcleo contiene estrategia de distribución; restringirla a admin.
create policy profile_thematic_nuclei_select_admin
on public.profile_thematic_nuclei
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.is_admin = true
  )
);

-- -----------------------------------------------------------------------------
-- 9. Ajuste transitorio de política de lectura de item_bank
-- -----------------------------------------------------------------------------
-- Primera corrección: dejar de depender solo de is_published.
-- La elegibilidad completa por perfil/núcleo se aplicará en la lógica de selección
-- y podrá endurecerse después en RLS si resulta conveniente.

drop policy if exists item_bank_select_published on public.item_bank;

create policy item_bank_select_published
on public.item_bank
for select
using (status = 'published' and is_active = true);

commit;
