import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const migrationPath = "supabase/migrations/0030_targeting_knowledge_foundation.sql";

async function readMigration() {
  return readFile(resolve(process.cwd(), migrationPath), "utf8");
}

const privateTables = [
  "target_families",
  "target_profiles",
  "opec_catalog",
  "item_target_families",
  "item_target_profiles",
  "item_opec_targets",
  "knowledge_sources",
  "knowledge_source_targets",
  "item_source_links",
] as const;

test("PRD 3 migration is additive, transactional, and preserves the legacy OPEC bridge", async () => {
  const migration = await readMigration();

  assert.match(migration, /^begin;/im);
  assert.match(migration, /commit;\s*$/i);
  assert.doesNotMatch(migration, /\b(?:drop|truncate)\s+(?:table\s+)?public\./i);
  assert.doesNotMatch(migration, /alter\s+table\s+public\.item_bank/i);
  assert.doesNotMatch(migration, /update\s+public\.item_bank/i);
  assert.doesNotMatch(migration, /create\s+(?:or\s+replace\s+)?view\s+public\./i);

  for (const table of privateTables) {
    assert.match(migration, new RegExp(`create table public\\.${table}\\b`, "i"));
  }
});

test("PRD 3 keeps taxonomy, reusable profiles, and concrete OPEC identities separate", async () => {
  const migration = await readMigration();

  assert.match(migration, /create table public\.target_profiles[\s\S]+family_id uuid not null references public\.target_families\(id\)/i);
  assert.match(migration, /unique \(id, family_id\)/i);
  assert.match(migration, /create table public\.opec_catalog[\s\S]+foreign key \(profile_id, family_id\)[\s\S]+references public\.target_profiles\(id, family_id\)/i);
  assert.match(migration, /create table public\.item_target_families[\s\S]+item_id uuid not null references public\.item_bank\(id\) on delete cascade[\s\S]+family_id uuid not null references public\.target_families\(id\)/i);
  assert.match(migration, /create table public\.item_target_profiles[\s\S]+item_id uuid not null references public\.item_bank\(id\) on delete cascade[\s\S]+profile_id uuid not null references public\.target_profiles\(id\)/i);
  assert.match(migration, /create table public\.item_opec_targets[\s\S]+item_id uuid not null references public\.item_bank\(id\) on delete cascade[\s\S]+opec_id uuid not null references public\.opec_catalog\(id\)/i);
  assert.doesNotMatch(migration, /target_kind/i);
  assert.match(migration, /create function public\.text_array_has_only_nonblank_values\(p_values text\[\]\)[\s\S]+strict[\s\S]+bool_and\(nullif\(btrim\(value\), ''\) is not null\)/i);
  assert.equal(
    migration.match(/review_status <> 'approved'[\s\S]{0,100}text_array_has_only_nonblank_values\(evidence\)/gi)?.length,
    3,
  );
  assert.doesNotMatch(migration, /\b(?:area|specialty|employment_identity)_id\b/i);
});

test("PRD 3 models verified source provenance without promoting unreviewed applicability", async () => {
  const migration = await readMigration();

  assert.match(migration, /source_type in \('normative', 'academic', 'technical', 'guide', 'theme_map'\)/i);
  const sourceTable = migration.match(
    /create table public\.knowledge_sources[\s\S]+?(?=create table public\.knowledge_source_targets)/i,
  )?.[0];
  assert.ok(sourceTable);
  assert.match(sourceTable, /verification_status <> 'verified'[\s\S]+verified_at is not null/i);
  assert.doesNotMatch(sourceTable, /verification_status <> 'verified'[\s\S]+btrim\(verified_by\)/i);
  assert.match(migration, /target_type in \('common', 'family', 'profile', 'opec'\)/i);
  assert.match(migration, /target_type = 'common'[\s\S]+target_type = 'family'[\s\S]+target_type = 'profile'[\s\S]+target_type = 'opec'/i);
  assert.match(migration, /ACTIVE_KNOWLEDGE_TARGET_REQUIRES_VERIFIED_SOURCE/i);
  assert.match(migration, /source\.verification_status = 'verified'[\s\S]+for share/i);
  assert.match(migration, /VERIFIED_SOURCE_HAS_ACTIVE_TARGETS/i);
  assert.match(migration, /create table public\.item_source_links[\s\S]+relation_type text not null check \(relation_type in \('decisive', 'supporting'\)\)/i);
  assert.match(migration, /create unique index uq_knowledge_source_targets_common/i);
  assert.match(migration, /create unique index uq_knowledge_source_targets_family/i);
  assert.match(migration, /create unique index uq_knowledge_source_targets_profile/i);
  assert.match(migration, /create unique index uq_knowledge_source_targets_opec/i);
});

test("PRD 3 seeds only the frozen Docentes family and six reusable profiles", async () => {
  const migration = await readMigration();
  const expectedProfiles = [
    "rector_director_rural",
    "coordinador",
    "docente_aula_preescolar",
    "docente_aula_basica_primaria",
    "docente_aula_secundaria_media",
    "docente_orientador",
  ];

  assert.match(migration, /insert into public\.target_families[\s\S]+values \([\s\S]*'docentes'/i);
  assert.match(migration, /insert into public\.target_profiles/i);
  for (const profile of expectedProfiles) {
    assert.match(migration, new RegExp(`'${profile}'`));
  }
  assert.doesNotMatch(migration, /insert into public\.(?:opec_catalog|item_target_families|item_target_profiles|item_opec_targets|knowledge_sources|knowledge_source_targets|item_source_links)/i);
  assert.doesNotMatch(migration, /docente_(?:matematicas|filosofia)/i);
  assert.doesNotMatch(migration, /temario-base\.md/i);
});

test("PRD 3 keeps all new persistence server-only until a reviewed selector exists", async () => {
  const migration = await readMigration();

  for (const table of privateTables) {
    assert.match(
      migration,
      new RegExp(`alter table public\\.${table} enable row level security`, "i"),
    );
    assert.match(
      migration,
      new RegExp(`revoke all on table public\\.${table} from public, anon, authenticated`, "i"),
    );
    assert.match(
      migration,
      new RegExp(`grant select, insert, update, delete on table public\\.${table} to service_role`, "i"),
    );
  }

  assert.match(migration, /revoke all on function public\.enforce_verified_knowledge_source_target\(\)[\s\S]+from public, anon, authenticated/i);
  assert.match(migration, /revoke all on function public\.prevent_active_knowledge_source_downgrade\(\)[\s\S]+from public, anon, authenticated/i);
  assert.match(migration, /revoke all on function public\.text_array_has_only_nonblank_values\(text\[\]\)[\s\S]+from public, anon, authenticated/i);
  assert.match(migration, /grant execute on function public\.text_array_has_only_nonblank_values\(text\[\]\)[\s\S]+to service_role/i);
  assert.doesNotMatch(migration, /grant\s+(?:select|insert|update|delete|execute)[^;]+\b(?:anon|authenticated)\b/i);
});
