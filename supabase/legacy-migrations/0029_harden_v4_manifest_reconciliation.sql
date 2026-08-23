-- 0029_harden_v4_manifest_reconciliation.sql
-- Binds the batch RPC to the canonical plan and reconciles real row/option drift.

begin;

alter table public.question_bank_v4_manifests
  add column expected_plan_hash text;

do $$
declare
  v_updated integer;
begin
  update public.question_bank_v4_manifests
  set expected_plan_hash = '6f09c0fc60c9b7cb47ba4e9d076589207c051cf8b63fe0468f87c9bd42f2f418'
  where source_sha = '68dfae07baaafa59e00fa7a085ac4b903b62aa07'
    and corpus_sha256 = '3845d22280819f3d17cb946936f9c41720801d026124b5d726042ec28bbc7533'
    and ids_sha256 = '3e1a4ca114ad6393fa48f9e293fc3136e17570f3b09d67953731f6c3a79f2b23'
    and expected_count = 248
    and editorial_status = 'FROZEN'
    and editorial_approval = 'APPROVED';
  get diagnostics v_updated = row_count;
  if v_updated <> 1 then
    raise exception 'V4_CANONICAL_MANIFEST_DRIFT';
  end if;
end;
$$;

alter table public.question_bank_v4_manifests
  alter column expected_plan_hash set not null,
  add constraint question_bank_v4_manifests_plan_hash_format
    check (expected_plan_hash ~ '^[a-f0-9]{64}$');

create or replace function public.question_bank_v4_item_matches(
  p_item jsonb,
  p_source_path text,
  p_content_hash text,
  p_approval_evidence text
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.item_bank item
    where item.content_id = p_item->>'id'
      and item.slug is not distinct from lower(p_item->>'id')
      and item.title is not distinct from initcap(replace(p_item->>'topic', '_', ' '))
      and item.area is not distinct from p_item->>'domain'
      and item.subarea is not distinct from p_item->>'topic'
      and item.exam_type is not distinct from 'cnsc_docente_v4'
      and item.competency is not distinct from p_item->>'competency'
      and item.difficulty is not distinct from case p_item->>'estimatedDifficulty'
        when 'low' then 0.25 when 'high' then 0.75 else 0.50 end
      and item.target_level is null
      and item.item_type is not distinct from 'multiple_choice'
      and item.stem is not distinct from p_item->>'stem'
      and item.correct_option is not distinct from p_item->>'correctAnswer'
      and item.explanation is not distinct from p_item->'explanations'->>(p_item->>'correctAnswer')
      and item.normative_refs is not distinct from array[p_item->'source'->>'reference']
      and item.is_published = false
      and item.version = 4
      and item.thematic_nucleus_id is null
      and item.status is not distinct from 'draft'
      and item.is_active = false
      and item.source_type is not distinct from 'import'
      and item.source_path is not distinct from p_source_path
      and item.tags is not distinct from array[p_item->>'questionType', p_item->>'cognitiveLevel']
      and item.editorial_metadata - 'import' is not distinct from jsonb_build_object(
        'context', p_item->'context',
        'explanations', p_item->'explanations',
        'hint', p_item->'hint',
        'learningNote', p_item->'learningNote',
        'source', p_item->'source'
      )
      and (item.editorial_metadata->'import') - 'importedAt' is not distinct from jsonb_build_object(
        'contentHash', p_content_hash,
        'sourcePath', p_source_path,
        'approvalEvidence', p_approval_evidence
      )
      and item.editorial_metadata->'import' ? 'importedAt'
      and item.opec_id is not distinct from nullif(p_item->>'opecId', '')
      and item.approval_status is not distinct from 'approved'
      and item.pilot_status is not distinct from 'not_in_pilot'
      and item.bank_version is not distinct from 'v4'
      and item.editorial_scope is not distinct from p_item->>'scope'
      and item.topic_code is not distinct from p_item->>'topic'
      and item.question_type is not distinct from p_item->>'questionType'
      and item.cognitive_level is not distinct from p_item->>'cognitiveLevel'
      and item.source_reference is not distinct from p_item->'source'->>'reference'
      and item.source_locator is null
      and item.source_url is null
      and coalesce((
        select jsonb_object_agg(option.option_key, option.option_text order by option.option_key)
        from public.item_options option
        where option.item_id = item.id
      ), '{}'::jsonb) = p_item->'options'
  );
$$;

revoke execute on function public.question_bank_v4_item_matches(jsonb, text, text, text)
  from public, anon, authenticated, service_role;

create or replace function public.upsert_content_item_v4(
  p_item jsonb,
  p_source_path text,
  p_content_hash text,
  p_approval_evidence text
)
returns table(item_id uuid, content_id text, changed boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_item_id uuid;
  v_option record;
  v_content_id text := p_item->>'id';
  v_correct_option text := p_item->>'correctAnswer';
  v_metadata jsonb;
begin
  if p_source_path not like 'content/question-bank-v4/items/%.json' then
    raise exception 'INVALID_V4_SOURCE_PATH';
  end if;
  if coalesce(p_approval_evidence, '') = '' then
    raise exception 'MISSING_V4_APPROVAL_EVIDENCE';
  end if;
  if (select count(*) from jsonb_object_keys(p_item->'options')) <> 4
    or not (p_item->'options' ?& array['A', 'B', 'C', 'D']) then
    raise exception 'INVALID_V4_OPTIONS';
  end if;
  if v_correct_option not in ('A', 'B', 'C', 'D') then
    raise exception 'INVALID_V4_CORRECT_OPTION';
  end if;

  select item.id into v_item_id
  from public.item_bank item
  where item.content_id = v_content_id;

  if found and public.question_bank_v4_item_matches(
    p_item, p_source_path, p_content_hash, p_approval_evidence
  ) then
    return query select v_item_id, v_content_id, false;
    return;
  end if;

  v_metadata := jsonb_build_object(
    'context', p_item->'context',
    'explanations', p_item->'explanations',
    'hint', p_item->'hint',
    'learningNote', p_item->'learningNote',
    'source', p_item->'source',
    'import', jsonb_build_object(
      'contentHash', p_content_hash,
      'sourcePath', p_source_path,
      'approvalEvidence', p_approval_evidence,
      'importedAt', now()
    )
  );

  insert into public.item_bank (
    content_id, slug, title, area, subarea, exam_type, competency, difficulty,
    target_level, item_type, stem, correct_option, explanation, normative_refs,
    is_published, version, thematic_nucleus_id, status, is_active, source_type,
    source_path, tags, editorial_metadata, opec_id, approval_status, pilot_status,
    bank_version, editorial_scope, topic_code, question_type, cognitive_level,
    source_reference, source_locator, source_url
  ) values (
    v_content_id, lower(v_content_id), initcap(replace(p_item->>'topic', '_', ' ')),
    p_item->>'domain', p_item->>'topic', 'cnsc_docente_v4', p_item->>'competency',
    case p_item->>'estimatedDifficulty' when 'low' then 0.25 when 'high' then 0.75 else 0.50 end,
    null, 'multiple_choice', p_item->>'stem', v_correct_option,
    p_item->'explanations'->>v_correct_option, array[p_item->'source'->>'reference'],
    false, 4, null, 'draft', false, 'import', p_source_path,
    array[p_item->>'questionType', p_item->>'cognitiveLevel'], v_metadata,
    nullif(p_item->>'opecId', ''), 'approved', 'not_in_pilot', 'v4',
    p_item->>'scope', p_item->>'topic', p_item->>'questionType',
    p_item->>'cognitiveLevel', p_item->'source'->>'reference', null, null
  )
  on conflict on constraint item_bank_content_id_unique do update set
    slug = excluded.slug, title = excluded.title, area = excluded.area,
    subarea = excluded.subarea, exam_type = excluded.exam_type,
    competency = excluded.competency, difficulty = excluded.difficulty,
    target_level = excluded.target_level, item_type = excluded.item_type,
    stem = excluded.stem, correct_option = excluded.correct_option,
    explanation = excluded.explanation, normative_refs = excluded.normative_refs,
    is_published = false, version = excluded.version, thematic_nucleus_id = null,
    status = 'draft', is_active = false, source_type = excluded.source_type,
    source_path = excluded.source_path, tags = excluded.tags,
    editorial_metadata = excluded.editorial_metadata, opec_id = excluded.opec_id,
    approval_status = excluded.approval_status, pilot_status = 'not_in_pilot',
    bank_version = excluded.bank_version, editorial_scope = excluded.editorial_scope,
    topic_code = excluded.topic_code, question_type = excluded.question_type,
    cognitive_level = excluded.cognitive_level,
    source_reference = excluded.source_reference, source_locator = null,
    source_url = null, updated_at = now()
  returning public.item_bank.id into v_item_id;

  delete from public.item_options option where option.item_id = v_item_id;
  for v_option in select key, value from jsonb_each_text(p_item->'options')
  loop
    insert into public.item_options (item_id, option_key, option_text)
    values (v_item_id, v_option.key, v_option.value);
  end loop;

  return query select v_item_id, v_content_id, true;
end;
$$;

revoke execute on function public.upsert_content_item_v4(jsonb, text, text, text)
  from public, anon, authenticated;
grant execute on function public.upsert_content_item_v4(jsonb, text, text, text)
  to service_role;

alter function public.import_question_bank_v4_batch(jsonb, text, integer, text)
  rename to import_question_bank_v4_batch_0028_unbound;

revoke execute on function public.import_question_bank_v4_batch_0028_unbound(jsonb, text, integer, text)
  from public, anon, authenticated, service_role;

create function public.import_question_bank_v4_batch(
  p_candidates jsonb,
  p_plan_hash text,
  p_expected_count integer,
  p_source_sha text
)
returns table(
  execution_id uuid,
  status text,
  error_code text,
  changed_count integer,
  unchanged_count integer,
  historical_deactivated_count integer,
  reconciliation_result jsonb
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_manifest public.question_bank_v4_manifests%rowtype;
  v_execution_id uuid;
  v_result record;
  v_candidate jsonb;
  v_database_count integer;
  v_data_mismatch integer := 0;
  v_unsafe_state integer;
  v_orphan_options integer;
  v_active_view_rows integer;
  v_reconciliation jsonb;
begin
  select * into v_manifest
  from public.question_bank_v4_manifests manifest
  where manifest.source_sha = p_source_sha;

  if not found then
    raise exception 'UNKNOWN_V4_MANIFEST';
  end if;

  if p_plan_hash is distinct from v_manifest.expected_plan_hash then
    v_execution_id := gen_random_uuid();
    v_reconciliation := jsonb_build_object(
      'rolledBack', true,
      'candidateCount', case when jsonb_typeof(p_candidates) = 'array'
        then jsonb_array_length(p_candidates) else 0 end,
      'partialQuestionWrites', 0,
      'canonicalPlanMatched', false
    );
    insert into public.question_bank_v4_import_runs (
      execution_id, source_sha, plan_hash, expected_count, status,
      started_at, finished_at, error_code, reconciliation_result
    ) values (
      v_execution_id, p_source_sha,
      case when p_plan_hash ~ '^[a-f0-9]{64}$' then p_plan_hash else repeat('0', 64) end,
      greatest(coalesce(p_expected_count, 1), 1), 'failed',
      clock_timestamp(), clock_timestamp(), 'V4_MANIFEST_PLAN_MISMATCH', v_reconciliation
    );
    return query select v_execution_id, 'failed'::text,
      'V4_MANIFEST_PLAN_MISMATCH'::text, 0, 0, 0, v_reconciliation;
    return;
  end if;

  select * into v_result
  from public.import_question_bank_v4_batch_0028_unbound(
    p_candidates, p_plan_hash, p_expected_count, p_source_sha
  );

  if v_result.status <> 'succeeded' then
    return query select v_result.execution_id, v_result.status, v_result.error_code,
      v_result.changed_count, v_result.unchanged_count,
      v_result.historical_deactivated_count, v_result.reconciliation_result;
    return;
  end if;

  for v_candidate in select value from jsonb_array_elements(p_candidates)
  loop
    if not public.question_bank_v4_item_matches(
      v_candidate->'item',
      v_candidate->>'sourcePath',
      v_candidate->>'contentHash',
      v_candidate->'approvalEvidence'->>'reference'
    ) then
      v_data_mismatch := v_data_mismatch + 1;
    end if;
  end loop;

  select count(*) into v_database_count
  from public.item_bank item
  where item.content_id in (
    select candidate->>'itemId'
    from jsonb_array_elements(p_candidates) as candidates(candidate)
  );

  select count(*) into v_unsafe_state
  from public.item_bank item
  where item.bank_version = 'v4'
    and (item.status <> 'draft' or item.is_active or item.is_published
      or item.pilot_status <> 'not_in_pilot');

  select count(*) into v_orphan_options
  from public.item_options option
  left join public.item_bank item on item.id = option.item_id
  where item.id is null;

  select
    (select count(*) from public.v_question_bank_v4_active)
    + (select count(*) from public.v_question_bank_v4_practice)
    + (select count(*) from public.v_question_bank_v4_answered)
  into v_active_view_rows;

  if v_database_count <> v_manifest.expected_count
    or v_data_mismatch <> 0
    or v_unsafe_state <> 0
    or v_orphan_options <> 0
    or v_active_view_rows <> 0 then
    raise exception 'V4_POST_RECONCILIATION_FAILED';
  end if;

  v_reconciliation := coalesce(v_result.reconciliation_result, '{}'::jsonb)
    || jsonb_build_object(
      'canonicalPlanMatched', true,
      'canonicalDataMismatches', v_data_mismatch,
      'unsafeV4Rows', v_unsafe_state,
      'orphanOptions', v_orphan_options,
      'activeViewRows', v_active_view_rows
    );

  update public.question_bank_v4_import_runs run
  set reconciliation_result = v_reconciliation
  where run.execution_id = v_result.execution_id;

  return query select v_result.execution_id, v_result.status, v_result.error_code,
    v_result.changed_count, v_result.unchanged_count,
    v_result.historical_deactivated_count, v_reconciliation;
end;
$$;

revoke execute on function public.import_question_bank_v4_batch(jsonb, text, integer, text)
  from public, anon, authenticated;
grant execute on function public.import_question_bank_v4_batch(jsonb, text, integer, text)
  to service_role;

comment on function public.question_bank_v4_item_matches(jsonb, text, text, text) is
  'Internal exact matcher for canonical V4 columns, metadata, and A-D option texts.';
comment on function public.import_question_bank_v4_batch(jsonb, text, integer, text) is
  'Imports only the plan hash frozen in the V4 manifest, repairs real drift atomically, and verifies inactive canonical state.';
comment on function public.import_question_bank_v4_batch_0028_unbound(jsonb, text, integer, text) is
  'Internal 0028 implementation. Direct execution is revoked; use import_question_bank_v4_batch.';

commit;
