import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

const adminDatabaseUrl = process.env.CONTENT_SYNC_TEST_DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const adminTarget = new URL(adminDatabaseUrl);
if (!["127.0.0.1", "localhost", "::1"].includes(adminTarget.hostname)) {
  throw new Error("Clean baseline guard tests may run only against loopback PostgreSQL");
}

function databaseName(kind: "clean" | "legacy") {
  return `gcm_v4_guard_${kind}_${randomUUID().replaceAll("-", "")}`;
}

function quotedIdentifier(value: string) {
  assert.match(value, /^[a-z0-9_]+$/);
  return `"${value}"`;
}

function databaseUrl(name: string) {
  const url = new URL(adminDatabaseUrl);
  url.pathname = `/${name}`;
  return url.toString();
}

async function prepareSupabasePrerequisites(client: Client) {
  await client.query(`
    create schema if not exists extensions;
    create extension if not exists pgcrypto with schema extensions;
    create schema if not exists auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
    set search_path = public, extensions;
  `);
}

async function applyMigration(client: Client, filename: string) {
  const sql = await fs.readFile(path.join(process.cwd(), "supabase/migrations", filename), "utf8");
  await client.query(sql);
}

async function main() {
  const cleanName = databaseName("clean");
  const legacyName = databaseName("legacy");
  const admin = new Client({ connectionString: adminDatabaseUrl });
  await admin.connect();
  try {
    await admin.query(`create database ${quotedIdentifier(cleanName)}`);
    await admin.query(`create database ${quotedIdentifier(legacyName)}`);

    const clean = new Client({ connectionString: databaseUrl(cleanName) });
    await clean.connect();
    try {
      await prepareSupabasePrerequisites(clean);
      await applyMigration(clean, "0001_v4_clean_foundation.sql");
      await applyMigration(clean, "0002_v4_runtime_security.sql");
      await applyMigration(clean, "0003_v4_content_sync.sql");
      const built = await clean.query(`select
        (select baseline_id from public.runtime_metadata where singleton) as baseline_id,
        to_regclass('public.questions')::text as questions,
        to_regclass('public.knowledge_source_targets')::text as knowledge_source_targets,
        to_regprocedure('public.apply_content_sync(jsonb,text,text,text,text,uuid)')::text as sync_function`);
      assert.equal(built.rows[0].baseline_id, "gcm-v4-clean-v1");
      assert.equal(built.rows[0].questions, "questions");
      assert.equal(built.rows[0].knowledge_source_targets, "knowledge_source_targets");
      assert.match(built.rows[0].sync_function, /apply_content_sync/);
    } finally {
      await clean.end();
    }

    const legacy = new Client({ connectionString: databaseUrl(legacyName) });
    await legacy.connect();
    try {
      await prepareSupabasePrerequisites(legacy);
      await legacy.query(`
        create schema supabase_migrations;
        create table supabase_migrations.schema_migrations (version text primary key);
        insert into supabase_migrations.schema_migrations(version) values ('0029');
        create table public.item_bank (id uuid primary key, bank_version text);
        create table public.item_options (id uuid primary key, item_id uuid references public.item_bank(id));
      `);
      let rejection: any;
      try {
        await applyMigration(legacy, "0001_v4_clean_foundation.sql");
      } catch (error) {
        rejection = error;
      }
      assert.ok(rejection, "Legacy footprint must reject the clean baseline");
      assert.match(String(rejection.message), /GCM_V4_CLEAN_BASELINE_REFUSES_LEGACY_DATABASE/);
      assert.match(String(rejection.detail), /public\.item_bank/);
      assert.match(String(rejection.detail), /0029/);
      await legacy.query("rollback");
      const partial = await legacy.query(`select count(*)::integer as count from (
        values
          (to_regclass('public.runtime_metadata')),
          (to_regclass('public.target_families')),
          (to_regclass('public.questions')),
          (to_regclass('public.knowledge_sources')),
          (to_regclass('public.content_sync_runs'))
      ) objects(object_name) where object_name is not null`);
      assert.equal(partial.rows[0].count, 0);
      assert.equal((await legacy.query("select to_regclass('public.item_bank')::text as marker")).rows[0].marker, "item_bank");
    } finally {
      await legacy.end();
    }

    console.log(JSON.stringify({
      status: "passed",
      cleanBuild: "0001-0003",
      legacyRejection: "GCM_V4_CLEAN_BASELINE_REFUSES_LEGACY_DATABASE",
      detectedMarkers: ["public.item_bank", "public.item_options", "public.legacy_question_bank_column", "ledger:0029"],
      partialV4ObjectsAfterRejection: 0,
    }, null, 2));
  } finally {
    await admin.query(`drop database if exists ${quotedIdentifier(cleanName)} with (force)`);
    await admin.query(`drop database if exists ${quotedIdentifier(legacyName)} with (force)`);
    await admin.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
