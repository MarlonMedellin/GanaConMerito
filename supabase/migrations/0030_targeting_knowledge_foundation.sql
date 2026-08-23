-- 0030_targeting_knowledge_foundation.sql
-- PRD 3: additive persistence for targeting and knowledge provenance.
-- This migration creates no OPEC, item mapping, knowledge source, or backfill.

begin;

-- -----------------------------------------------------------------------------
-- 1. Canonical targeting catalogs
-- -----------------------------------------------------------------------------

create table public.target_families (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (btrim(code) <> ''),
  name text not null check (btrim(name) <> ''),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.target_profiles (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.target_families(id),
  code text not null unique check (btrim(code) <> ''),
  name text not null check (btrim(name) <> ''),
  legacy_applicant_profile text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, family_id),
  unique (family_id, code)
);

create table public.opec_catalog (
  id uuid primary key default gen_random_uuid(),
  source_system text not null check (btrim(source_system) <> ''),
  external_opec_id text not null check (btrim(external_opec_id) <> ''),
  family_id uuid not null references public.target_families(id),
  profile_id uuid not null,
  convocation_code text,
  entity_name text,
  position_name text not null check (btrim(position_name) <> ''),
  status text not null default 'draft' check (
    status in ('draft', 'active', 'inactive')
  ),
  verification_status text not null default 'needs_review' check (
    verification_status in ('needs_review', 'verified', 'rejected')
  ),
  source_reference text not null check (btrim(source_reference) <> ''),
  source_url text,
  source_retrieved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb check (
    jsonb_typeof(metadata) = 'object'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_system, external_opec_id),
  foreign key (profile_id, family_id)
    references public.target_profiles(id, family_id),
  check (status <> 'active' or verification_status = 'verified')
);

-- -----------------------------------------------------------------------------
-- 2. Item targeting relations
-- -----------------------------------------------------------------------------

create function public.text_array_has_only_nonblank_values(p_values text[])
returns boolean
language sql
immutable
strict
set search_path = public, pg_temp
as $$
  select cardinality(p_values) > 0
    and coalesce(bool_and(nullif(btrim(value), '') is not null), false)
  from unnest(p_values) as value;
$$;

create table public.item_target_families (
  item_id uuid not null references public.item_bank(id) on delete cascade,
  family_id uuid not null references public.target_families(id),
  review_status text not null default 'candidate' check (
    review_status in ('candidate', 'reviewed', 'approved', 'rejected')
  ),
  evidence text[] not null default '{}',
  reviewed_by text,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (item_id, family_id),
  check (
    review_status <> 'approved'
    or public.text_array_has_only_nonblank_values(evidence)
  )
);

create table public.item_target_profiles (
  item_id uuid not null references public.item_bank(id) on delete cascade,
  profile_id uuid not null references public.target_profiles(id),
  target_kind text check (
    target_kind is null or target_kind in ('primary', 'compatible')
  ),
  review_status text not null default 'candidate' check (
    review_status in ('candidate', 'reviewed', 'approved', 'rejected')
  ),
  evidence text[] not null default '{}',
  reviewed_by text,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (item_id, profile_id),
  check (
    review_status <> 'approved'
    or public.text_array_has_only_nonblank_values(evidence)
  )
);

create table public.item_opec_targets (
  item_id uuid not null references public.item_bank(id) on delete cascade,
  opec_id uuid not null references public.opec_catalog(id),
  review_status text not null default 'candidate' check (
    review_status in ('candidate', 'reviewed', 'approved', 'rejected')
  ),
  evidence text[] not null default '{}',
  reviewed_by text,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (item_id, opec_id),
  check (
    review_status <> 'approved'
    or public.text_array_has_only_nonblank_values(evidence)
  )
);

-- -----------------------------------------------------------------------------
-- 3. Knowledge source catalog and provenance relations
-- -----------------------------------------------------------------------------

create table public.knowledge_sources (
  source_id text primary key check (btrim(source_id) <> ''),
  source_type text not null check (
    source_type in ('normative', 'academic', 'technical', 'guide', 'theme_map')
  ),
  title text not null check (btrim(title) <> ''),
  reference text not null check (btrim(reference) <> ''),
  issuer_or_author text,
  jurisdiction text,
  publication_date date,
  effective_from date,
  effective_to date,
  verification_status text not null default 'needs_review' check (
    verification_status in ('needs_review', 'verified', 'rejected')
  ),
  verified_at timestamptz,
  verified_by text,
  last_checked_at date,
  verification_scope text,
  source_system text,
  source_url text,
  repo_path text,
  repo_path_legacy text,
  locator text,
  rights_note text,
  notes text,
  metadata jsonb not null default '{}'::jsonb check (
    jsonb_typeof(metadata) = 'object'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_to is null or effective_from is null or effective_to >= effective_from),
  check (
    verification_status <> 'verified'
    or verified_at is not null
  )
);

create table public.knowledge_source_targets (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references public.knowledge_sources(source_id),
  target_type text not null check (
    target_type in ('common', 'family', 'profile', 'opec')
  ),
  family_id uuid references public.target_families(id),
  profile_id uuid,
  opec_id uuid references public.opec_catalog(id),
  relevance text not null check (relevance in ('core', 'supporting', 'optional')),
  locator text,
  reason text not null check (btrim(reason) <> ''),
  status text not null default 'needs_review' check (
    status in ('needs_review', 'active', 'superseded')
  ),
  verified_at timestamptz,
  verified_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (profile_id, family_id)
    references public.target_profiles(id, family_id),
  check (
    (target_type = 'common' and family_id is null and profile_id is null and opec_id is null)
    or (target_type = 'family' and family_id is not null and profile_id is null and opec_id is null)
    or (target_type = 'profile' and family_id is not null and profile_id is not null and opec_id is null)
    or (target_type = 'opec' and family_id is null and profile_id is null and opec_id is not null)
  ),
  check (
    status <> 'active'
    or (verified_at is not null and nullif(btrim(verified_by), '') is not null)
  )
);

create table public.item_source_links (
  item_id uuid not null references public.item_bank(id) on delete cascade,
  source_id text not null references public.knowledge_sources(source_id),
  relation_type text not null check (relation_type in ('decisive', 'supporting')),
  locator text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (item_id, source_id, relation_type)
);

-- -----------------------------------------------------------------------------
-- 4. Cross-row integrity for active knowledge applicability
-- -----------------------------------------------------------------------------

create function public.enforce_verified_knowledge_source_target()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.status = 'active' then
    perform 1
    from public.knowledge_sources source
    where source.source_id = new.source_id
      and source.verification_status = 'verified'
    for share;

    if not found then
      raise exception 'ACTIVE_KNOWLEDGE_TARGET_REQUIRES_VERIFIED_SOURCE';
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_knowledge_source_targets_verified_source
before insert or update on public.knowledge_source_targets
for each row
execute function public.enforce_verified_knowledge_source_target();

create function public.prevent_active_knowledge_source_downgrade()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.verification_status <> 'verified'
    and exists (
      select 1
      from public.knowledge_source_targets target
      where target.source_id = old.source_id
        and target.status = 'active'
    ) then
    raise exception 'VERIFIED_SOURCE_HAS_ACTIVE_TARGETS';
  end if;

  return new;
end;
$$;

create trigger trg_knowledge_sources_prevent_active_downgrade
before update of verification_status on public.knowledge_sources
for each row
execute function public.prevent_active_knowledge_source_downgrade();

-- -----------------------------------------------------------------------------
-- 5. Canonical seed: one real family and the six frozen reusable profiles
-- -----------------------------------------------------------------------------

insert into public.target_families (code, name, description, is_active)
values (
  'docentes',
  'Docentes y directivos docentes',
  'Familia de preparación para empleos docentes y directivos docentes.',
  true
);

insert into public.target_profiles (
  family_id,
  code,
  name,
  legacy_applicant_profile,
  is_active
)
select
  family.id,
  profile.code,
  profile.name,
  profile.legacy_applicant_profile,
  true
from public.target_families family
cross join (values
  ('rector_director_rural', 'Rector / director rural', 'directivo_docente'),
  ('coordinador', 'Coordinador', 'directivo_docente'),
  ('docente_aula_preescolar', 'Docente de aula preescolar', 'docente_de_aula'),
  ('docente_aula_basica_primaria', 'Docente de aula básica primaria', 'docente_de_aula'),
  ('docente_aula_secundaria_media', 'Docente de aula secundaria y media / bachillerato', 'docente_de_aula'),
  ('docente_orientador', 'Docente orientador', 'docente_orientador')
) as profile(code, name, legacy_applicant_profile)
where family.code = 'docentes';

-- -----------------------------------------------------------------------------
-- 6. Indexes and timestamps
-- -----------------------------------------------------------------------------

create index idx_target_profiles_family_active
  on public.target_profiles(family_id, is_active);
create index idx_opec_catalog_profile_status
  on public.opec_catalog(profile_id, status, verification_status);
create index idx_opec_catalog_family_status
  on public.opec_catalog(family_id, status, verification_status);
create index idx_item_target_families_family_review
  on public.item_target_families(family_id, review_status);
create index idx_item_target_profiles_profile_review
  on public.item_target_profiles(profile_id, review_status);
create index idx_item_opec_targets_opec_review
  on public.item_opec_targets(opec_id, review_status);
create index idx_knowledge_sources_type_verification
  on public.knowledge_sources(source_type, verification_status);
create index idx_knowledge_source_targets_source_status
  on public.knowledge_source_targets(source_id, status);
create index idx_knowledge_source_targets_family
  on public.knowledge_source_targets(family_id)
  where target_type = 'family';
create index idx_knowledge_source_targets_profile
  on public.knowledge_source_targets(profile_id)
  where target_type = 'profile';
create index idx_knowledge_source_targets_opec
  on public.knowledge_source_targets(opec_id)
  where target_type = 'opec';
create index idx_item_source_links_source
  on public.item_source_links(source_id);

create unique index uq_knowledge_source_targets_common
  on public.knowledge_source_targets(source_id)
  where target_type = 'common';
create unique index uq_knowledge_source_targets_family
  on public.knowledge_source_targets(source_id, family_id)
  where target_type = 'family';
create unique index uq_knowledge_source_targets_profile
  on public.knowledge_source_targets(source_id, family_id, profile_id)
  where target_type = 'profile';
create unique index uq_knowledge_source_targets_opec
  on public.knowledge_source_targets(source_id, opec_id)
  where target_type = 'opec';

create trigger trg_target_families_updated_at
before update on public.target_families
for each row execute function public.set_updated_at();

create trigger trg_target_profiles_updated_at
before update on public.target_profiles
for each row execute function public.set_updated_at();

create trigger trg_opec_catalog_updated_at
before update on public.opec_catalog
for each row execute function public.set_updated_at();

create trigger trg_item_target_families_updated_at
before update on public.item_target_families
for each row execute function public.set_updated_at();

create trigger trg_item_target_profiles_updated_at
before update on public.item_target_profiles
for each row execute function public.set_updated_at();

create trigger trg_item_opec_targets_updated_at
before update on public.item_opec_targets
for each row execute function public.set_updated_at();

create trigger trg_knowledge_sources_updated_at
before update on public.knowledge_sources
for each row execute function public.set_updated_at();

create trigger trg_knowledge_source_targets_updated_at
before update on public.knowledge_source_targets
for each row execute function public.set_updated_at();

create trigger trg_item_source_links_updated_at
before update on public.item_source_links
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 7. Server-only boundary until a reviewed runtime selector is introduced
-- -----------------------------------------------------------------------------

alter table public.target_families enable row level security;
alter table public.target_profiles enable row level security;
alter table public.opec_catalog enable row level security;
alter table public.item_target_families enable row level security;
alter table public.item_target_profiles enable row level security;
alter table public.item_opec_targets enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.knowledge_source_targets enable row level security;
alter table public.item_source_links enable row level security;

revoke all on table public.target_families from public, anon, authenticated;
revoke all on table public.target_profiles from public, anon, authenticated;
revoke all on table public.opec_catalog from public, anon, authenticated;
revoke all on table public.item_target_families from public, anon, authenticated;
revoke all on table public.item_target_profiles from public, anon, authenticated;
revoke all on table public.item_opec_targets from public, anon, authenticated;
revoke all on table public.knowledge_sources from public, anon, authenticated;
revoke all on table public.knowledge_source_targets from public, anon, authenticated;
revoke all on table public.item_source_links from public, anon, authenticated;

grant select, insert, update, delete on table public.target_families to service_role;
grant select, insert, update, delete on table public.target_profiles to service_role;
grant select, insert, update, delete on table public.opec_catalog to service_role;
grant select, insert, update, delete on table public.item_target_families to service_role;
grant select, insert, update, delete on table public.item_target_profiles to service_role;
grant select, insert, update, delete on table public.item_opec_targets to service_role;
grant select, insert, update, delete on table public.knowledge_sources to service_role;
grant select, insert, update, delete on table public.knowledge_source_targets to service_role;
grant select, insert, update, delete on table public.item_source_links to service_role;

revoke all on function public.enforce_verified_knowledge_source_target()
  from public, anon, authenticated;
revoke all on function public.prevent_active_knowledge_source_downgrade()
  from public, anon, authenticated;
revoke all on function public.text_array_has_only_nonblank_values(text[])
  from public, anon, authenticated;
grant execute on function public.text_array_has_only_nonblank_values(text[])
  to service_role;

comment on table public.target_families is
  'Canonical preparation families. Separate from question taxonomy.';
comment on table public.target_profiles is
  'Reusable canonical profiles. position_name specificity belongs to opec_catalog.';
comment on table public.opec_catalog is
  'Concrete, externally traceable OPEC records; intentionally empty after migration 0030.';
comment on table public.item_target_families is
  'Reviewed item applicability to an existing canonical family target.';
comment on table public.item_target_profiles is
  'Reviewed many-to-many item to reusable profile applicability.';
comment on table public.item_opec_targets is
  'Reviewed item applicability for truly OPEC-specific questions.';
comment on table public.knowledge_sources is
  'Single canonical identity for normative, academic, technical, guide, or theme sources.';
comment on table public.knowledge_source_targets is
  'Reviewed source applicability to common, family, profile, or OPEC targets.';
comment on table public.item_source_links is
  'Auditable item-to-source provenance without replacing V4 denormalized source fields.';

commit;
