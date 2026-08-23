import assert from "node:assert/strict";
import { Client, type QueryResult } from "pg";

const databaseUrl = process.env.TARGETING_KNOWLEDGE_TEST_DATABASE_URL
  ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const parsedUrl = new URL(databaseUrl);

if (!["127.0.0.1", "localhost", "::1"].includes(parsedUrl.hostname)) {
  throw new Error("PRD 3 integration tests may run only against a loopback PostgreSQL database.");
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

const expectedProfiles = [
  "coordinador",
  "docente_aula_basica_primaria",
  "docente_aula_preescolar",
  "docente_aula_secundaria_media",
  "docente_orientador",
  "rector_director_rural",
] as const;

let savepointNumber = 0;

async function expectDatabaseError(
  client: Client,
  query: string,
  values: unknown[],
  expectedCode: string,
  expectedMessage?: RegExp,
) {
  const savepoint = `prd3_expected_error_${savepointNumber += 1}`;
  await client.query(`savepoint ${savepoint}`);
  try {
    await client.query(query, values);
  } catch (error) {
    await client.query(`rollback to savepoint ${savepoint}`);
    await client.query(`release savepoint ${savepoint}`);
    const databaseError = error as { code?: string; message?: string };
    assert.equal(databaseError.code, expectedCode, databaseError.message);
    if (expectedMessage) {
      assert.match(databaseError.message ?? "", expectedMessage);
    }
    return;
  }

  await client.query(`rollback to savepoint ${savepoint}`);
  await client.query(`release savepoint ${savepoint}`);
  assert.fail(`Expected PostgreSQL error ${expectedCode}`);
}

async function expectRoleReadDenied(client: Client, role: "anon" | "authenticated", table: string) {
  const savepoint = `prd3_role_denial_${savepointNumber += 1}`;
  await client.query(`savepoint ${savepoint}`);
  try {
    await client.query(`set local role ${role}`);
    await client.query(`select * from public.${table} limit 1`);
  } catch (error) {
    await client.query(`rollback to savepoint ${savepoint}`);
    await client.query("reset role");
    await client.query(`release savepoint ${savepoint}`);
    const databaseError = error as { code?: string; message?: string };
    assert.equal(databaseError.code, "42501", databaseError.message);
    return;
  }

  await client.query("reset role");
  await client.query(`rollback to savepoint ${savepoint}`);
  await client.query(`release savepoint ${savepoint}`);
  assert.fail(`${role} unexpectedly read public.${table}`);
}

function scalar<T>(result: QueryResult): T {
  assert.equal(result.rows.length, 1);
  return Object.values(result.rows[0])[0] as T;
}

async function waitForRowLock(observer: Client, backendPid: number) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const activity = await observer.query(`
      select wait_event_type
      from pg_stat_activity
      where pid = $1
    `, [backendPid]);
    if (activity.rows[0]?.wait_event_type === "Lock") {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  assert.fail("Concurrent downgrade did not wait on the verified source row lock");
}

async function assertConcurrentSourceInvariant(observer: Client) {
  const sourceId = `integration:concurrency:${process.pid}:${Date.now()}`;
  const targetClient = new Client({ connectionString: databaseUrl });
  const downgradeClient = new Client({ connectionString: databaseUrl });
  const cleanupClient = new Client({ connectionString: databaseUrl });
  let targetTransactionOpen = false;
  let downgradeTransactionOpen = false;

  await Promise.all([
    targetClient.connect(),
    downgradeClient.connect(),
    cleanupClient.connect(),
  ]);

  try {
    await cleanupClient.query(`
      insert into public.knowledge_sources
        (source_id, source_type, title, reference, verification_status, verified_at, verified_by)
      values ($1, 'technical', 'Concurrency source', 'Integration concurrency test',
        'verified', now(), null)
    `, [sourceId]);

    await targetClient.query("begin");
    targetTransactionOpen = true;
    await downgradeClient.query("begin");
    downgradeTransactionOpen = true;
    const downgradePid = scalar<number>(await downgradeClient.query("select pg_backend_pid()"));

    await targetClient.query(`
      insert into public.knowledge_source_targets
        (source_id, target_type, relevance, reason, status, verified_at, verified_by)
      values ($1, 'common', 'core', 'Concurrent invariant test',
        'active', now(), 'integration-test')
    `, [sourceId]);

    const downgradeOutcome = downgradeClient.query(`
      update public.knowledge_sources
      set verification_status = 'needs_review'
      where source_id = $1
    `, [sourceId]).then(
      () => ({ status: "updated" as const }),
      (error: unknown) => ({ status: "rejected" as const, error }),
    );

    await waitForRowLock(observer, downgradePid);
    await targetClient.query("commit");
    targetTransactionOpen = false;

    const downgrade = await downgradeOutcome;
    assert.equal(downgrade.status, "rejected");
    if (downgrade.status === "rejected") {
      const databaseError = downgrade.error as { code?: string; message?: string };
      assert.equal(databaseError.code, "P0001", databaseError.message);
      assert.match(databaseError.message ?? "", /VERIFIED_SOURCE_HAS_ACTIVE_TARGETS/);
    }
    await downgradeClient.query("rollback");
    downgradeTransactionOpen = false;

    const invariant = await observer.query(`
      select source.verification_status,
        count(target.id) filter (where target.status = 'active')::integer as active_targets
      from public.knowledge_sources source
      left join public.knowledge_source_targets target on target.source_id = source.source_id
      where source.source_id = $1
      group by source.source_id
    `, [sourceId]);
    assert.deepEqual(invariant.rows[0], {
      verification_status: "verified",
      active_targets: 1,
    });
  } finally {
    if (targetTransactionOpen) {
      await targetClient.query("rollback").catch(() => undefined);
    }
    if (downgradeTransactionOpen) {
      await downgradeClient.query("rollback").catch(() => undefined);
    }
    await cleanupClient.query(
      "delete from public.knowledge_source_targets where source_id = $1",
      [sourceId],
    ).catch(() => undefined);
    await cleanupClient.query(
      "delete from public.knowledge_sources where source_id = $1",
      [sourceId],
    ).catch(() => undefined);
    await Promise.all([
      targetClient.end(),
      downgradeClient.end(),
      cleanupClient.end(),
    ]);
  }
}

async function main() {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  const startedAt = Date.now();
  let transactionOpen = false;

  try {
    await client.query("begin");
    transactionOpen = true;

    const schema = await client.query(`
      select c.relname as table_name, c.relrowsecurity as rls_enabled
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relkind = 'r'
        and c.relname = any($1::text[])
      order by c.relname
    `, [privateTables]);
    assert.deepEqual(
      schema.rows.map((row) => row.table_name),
      [...privateTables].sort(),
    );
    assert.equal(schema.rows.every((row) => row.rls_enabled === true), true);

    const profileTargetColumns = await client.query(`
      select column_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'item_target_profiles'
      order by ordinal_position
    `);
    assert.deepEqual(
      profileTargetColumns.rows.map((row) => row.column_name),
      [
        "item_id",
        "profile_id",
        "review_status",
        "evidence",
        "reviewed_by",
        "reviewed_at",
        "notes",
        "created_at",
        "updated_at",
      ],
    );

    const family = await client.query(`
      select id, code, name, is_active
      from public.target_families
      order by code
    `);
    assert.equal(family.rows.length, 1);
    assert.equal(family.rows[0].code, "docentes");
    assert.equal(family.rows[0].is_active, true);
    const docentesFamilyId = family.rows[0].id as string;

    const profiles = await client.query(`
      select id, code, legacy_applicant_profile, is_active
      from public.target_profiles
      where family_id = $1
      order by code
    `, [docentesFamilyId]);
    assert.deepEqual(profiles.rows.map((row) => row.code), expectedProfiles);
    assert.equal(profiles.rows.every((row) => row.is_active === true), true);
    assert.deepEqual(
      profiles.rows.map((row) => row.legacy_applicant_profile).sort(),
      [
        "directivo_docente",
        "directivo_docente",
        "docente_de_aula",
        "docente_de_aula",
        "docente_de_aula",
        "docente_orientador",
      ].sort(),
    );

    const emptyFoundation = await client.query(`
      select
        (select count(*)::integer from public.opec_catalog) as opecs,
        (select count(*)::integer from public.item_target_families) as item_families,
        (select count(*)::integer from public.item_target_profiles) as item_profiles,
        (select count(*)::integer from public.item_opec_targets) as item_opecs,
        (select count(*)::integer from public.knowledge_sources) as sources,
        (select count(*)::integer from public.knowledge_source_targets) as source_targets,
        (select count(*)::integer from public.item_source_links) as item_sources
    `);
    assert.deepEqual(emptyFoundation.rows[0], {
      opecs: 0,
      item_families: 0,
      item_profiles: 0,
      item_opecs: 0,
      sources: 0,
      source_targets: 0,
      item_sources: 0,
    });

    const permissions = await client.query(`
      select role_name, table_name,
        has_table_privilege(role_name, format('public.%I', table_name), 'SELECT') as can_select,
        has_table_privilege(role_name, format('public.%I', table_name), 'INSERT') as can_insert,
        has_table_privilege(role_name, format('public.%I', table_name), 'UPDATE') as can_update,
        has_table_privilege(role_name, format('public.%I', table_name), 'DELETE') as can_delete
      from unnest($1::text[]) role_name
      cross join unnest($2::text[]) table_name
      order by role_name, table_name
    `, [["anon", "authenticated", "service_role"], privateTables]);
    for (const row of permissions.rows) {
      const expected = row.role_name === "service_role";
      assert.equal(row.can_select, expected, `${row.role_name} SELECT public.${row.table_name}`);
      assert.equal(row.can_insert, expected, `${row.role_name} INSERT public.${row.table_name}`);
      assert.equal(row.can_update, expected, `${row.role_name} UPDATE public.${row.table_name}`);
      assert.equal(row.can_delete, expected, `${row.role_name} DELETE public.${row.table_name}`);
    }

    const functionPermissions = await client.query(`
      select role_name,
        has_function_privilege(role_name, 'public.enforce_verified_knowledge_source_target()', 'EXECUTE') as can_enforce,
        has_function_privilege(role_name, 'public.prevent_active_knowledge_source_downgrade()', 'EXECUTE') as can_downgrade,
        has_function_privilege(role_name, 'public.text_array_has_only_nonblank_values(text[])', 'EXECUTE') as can_validate_evidence
      from unnest($1::text[]) role_name
      order by role_name
    `, [["anon", "authenticated", "service_role"]]);
    for (const row of functionPermissions.rows) {
      assert.equal(row.can_enforce, false);
      assert.equal(row.can_downgrade, false);
      assert.equal(row.can_validate_evidence, row.role_name === "service_role");
    }

    for (const role of ["anon", "authenticated"] as const) {
      for (const table of privateTables) {
        await expectRoleReadDenied(client, role, table);
      }
    }

    const extraFamilyId = scalar<string>(await client.query(`
      insert into public.target_families (code, name)
      values ('integration_family', 'Integration family')
      returning id
    `));
    const extraProfileId = scalar<string>(await client.query(`
      insert into public.target_profiles (family_id, code, name)
      values ($1, 'integration_profile', 'Integration profile')
      returning id
    `, [extraFamilyId]));
    const canonicalProfileId = profiles.rows.find(
      (row) => row.code === "docente_aula_basica_primaria",
    )?.id as string;

    await expectDatabaseError(
      client,
      `insert into public.opec_catalog
        (source_system, external_opec_id, family_id, profile_id, position_name, source_reference)
       values ('integration', 'wrong-family', $1, $2, 'Wrong family', 'integration:test')`,
      [docentesFamilyId, extraProfileId],
      "23503",
    );
    await expectDatabaseError(
      client,
      `insert into public.opec_catalog
        (source_system, external_opec_id, family_id, profile_id, position_name,
         status, verification_status, source_reference)
       values ('integration', 'unverified-active', $1, $2, 'Unverified active',
         'active', 'needs_review', 'integration:test')`,
      [docentesFamilyId, canonicalProfileId],
      "23514",
    );
    const opecId = scalar<string>(await client.query(`
      insert into public.opec_catalog
        (source_system, external_opec_id, family_id, profile_id, position_name,
         status, verification_status, source_reference)
      values ('integration', 'verified-opec', $1, $2, 'Official integration position',
        'active', 'verified', 'integration:test')
      returning id
    `, [docentesFamilyId, canonicalProfileId]));

    await expectDatabaseError(
      client,
      `insert into public.knowledge_sources
        (source_id, source_type, title, reference, verification_status)
       values ('integration:invalid-verified', 'normative', 'Invalid', 'Integration', 'verified')`,
      [],
      "23514",
    );
    await expectDatabaseError(
      client,
      `insert into public.knowledge_sources
        (source_id, source_type, title, reference, effective_from, effective_to)
       values ('integration:invalid-dates', 'guide', 'Invalid dates', 'Integration', '2026-08-22', '2026-08-21')`,
      [],
      "23514",
    );
    await client.query(`
      insert into public.knowledge_sources
        (source_id, source_type, title, reference)
      values ('integration:source', 'technical', 'Integration source', 'Integration reference')
    `);
    await expectDatabaseError(
      client,
      `insert into public.knowledge_source_targets
        (source_id, target_type, relevance, reason, status, verified_at, verified_by)
       values ('integration:source', 'common', 'core', 'Integration evidence',
         'active', now(), 'integration-test')`,
      [],
      "P0001",
      /ACTIVE_KNOWLEDGE_TARGET_REQUIRES_VERIFIED_SOURCE/,
    );
    await expectDatabaseError(
      client,
      `insert into public.knowledge_source_targets
        (source_id, target_type, family_id, relevance, reason)
       values ('integration:source', 'common', $1, 'supporting', 'Invalid target shape')`,
      [docentesFamilyId],
      "23514",
    );

    await client.query(`
      update public.knowledge_sources
      set verification_status = 'verified', verified_at = now(), verified_by = null
      where source_id = 'integration:source'
    `);
    await client.query(`
      insert into public.knowledge_source_targets
        (source_id, target_type, relevance, reason, status, verified_at, verified_by)
      values ('integration:source', 'common', 'core', 'Integration evidence',
        'active', now(), 'integration-test')
    `);
    await expectDatabaseError(
      client,
      `insert into public.knowledge_source_targets
        (source_id, target_type, relevance, reason)
       values ('integration:source', 'common', 'optional', 'Duplicate applicability')`,
      [],
      "23505",
    );
    await expectDatabaseError(
      client,
      `update public.knowledge_sources
       set verification_status = 'needs_review'
       where source_id = 'integration:source'`,
      [],
      "P0001",
      /VERIFIED_SOURCE_HAS_ACTIVE_TARGETS/,
    );

    const item = await client.query(`
      select id
      from public.item_bank
      order by created_at, id
      limit 1
    `);
    assert.equal(item.rows.length, 1, "Local Supabase must include at least one seeded item_bank row");
    const itemId = item.rows[0].id as string;

    const invalidEvidenceArrays = [
      "array['']::text[]",
      "array['   ']::text[]",
      "array[null]::text[]",
    ];
    for (const evidence of invalidEvidenceArrays) {
      await expectDatabaseError(
        client,
        `insert into public.item_target_families
          (item_id, family_id, review_status, evidence)
         values ($1, $2, 'approved', ${evidence})`,
        [itemId, docentesFamilyId],
        "23514",
      );
      await expectDatabaseError(
        client,
        `insert into public.item_target_profiles
          (item_id, profile_id, review_status, evidence)
         values ($1, $2, 'approved', ${evidence})`,
        [itemId, canonicalProfileId],
        "23514",
      );
      await expectDatabaseError(
        client,
        `insert into public.item_opec_targets
          (item_id, opec_id, review_status, evidence)
         values ($1, $2, 'approved', ${evidence})`,
        [itemId, opecId],
        "23514",
      );
    }
    await expectDatabaseError(
      client,
      `insert into public.item_target_profiles
        (item_id, profile_id, review_status)
       values ($1, $2, 'approved')`,
      [itemId, canonicalProfileId],
      "23514",
    );
    await client.query(`
      insert into public.item_target_families
        (item_id, family_id, review_status, evidence, reviewed_by, reviewed_at)
      values ($1, $2, 'approved', array['integration:test'], 'integration-test', now())
    `, [itemId, docentesFamilyId]);
    await client.query(`
      insert into public.item_target_profiles
        (item_id, profile_id, review_status, evidence, reviewed_by, reviewed_at)
      values ($1, $2, 'approved', array['integration:test'], 'integration-test', now())
    `, [itemId, canonicalProfileId]);
    await client.query(`
      insert into public.item_opec_targets
        (item_id, opec_id, review_status, evidence, reviewed_by, reviewed_at)
      values ($1, $2, 'approved', array['integration:test'], 'integration-test', now())
    `, [itemId, opecId]);
    await client.query(`
      insert into public.item_source_links (item_id, source_id, relation_type, locator)
      values ($1, 'integration:source', 'decisive', 'integration locator')
    `, [itemId]);

    const compatibility = await client.query(`
      select
        (select data_type from information_schema.columns
          where table_schema = 'public' and table_name = 'item_bank' and column_name = 'opec_id') as legacy_opec_type,
        (select count(*)::integer from information_schema.views
          where table_schema = 'public' and table_name in (
            'v_item_bank_active', 'v_question_bank_v3_pilot',
            'v_question_bank_v4_active', 'v_question_bank_v4_practice',
            'v_question_bank_v4_answered'
          )) as preserved_views
    `);
    assert.deepEqual(compatibility.rows[0], {
      legacy_opec_type: "text",
      preserved_views: 5,
    });

    await assertConcurrentSourceInvariant(client);

    await client.query("delete from public.item_bank where id = $1", [itemId]);
    const cascadedLinks = await client.query(`
      select
        (select count(*)::integer from public.item_target_families where item_id = $1) as families,
        (select count(*)::integer from public.item_target_profiles where item_id = $1) as profiles,
        (select count(*)::integer from public.item_opec_targets where item_id = $1) as opecs,
        (select count(*)::integer from public.item_source_links where item_id = $1) as sources
    `, [itemId]);
    assert.deepEqual(cascadedLinks.rows[0], {
      families: 0,
      profiles: 0,
      opecs: 0,
      sources: 0,
    });

    console.log(JSON.stringify({
      status: "passed",
      transaction: "rolled_back",
      migration: "0030_targeting_knowledge_foundation.sql",
      tablesChecked: privateTables.length,
      seededProfiles: profiles.rows.length,
      clientRolesDenied: ["anon", "authenticated"],
      serviceRoleCrudVerified: true,
      constraintsChecked: [
        "profile-family",
        "verified-active-opec",
        "verified-source-audit",
        "verified-source-optional-verifier",
        "source-effective-dates",
        "target-shape",
        "active-target-verified-source",
        "active-source-downgrade",
        "unique-applicability",
        "approved-item-evidence",
        "exact-profile-target-columns",
        "item-link-cascade",
        "concurrent-source-target-invariant",
      ],
      compatibility: ["item_bank.opec_id", "existing-runtime-views"],
      durationMs: Date.now() - startedAt,
    }, null, 2));
  } finally {
    if (transactionOpen) {
      await client.query("rollback").catch(() => undefined);
    }
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
});
