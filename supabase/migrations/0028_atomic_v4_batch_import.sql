-- 0028_atomic_v4_batch_import.sql
-- Atomic, idempotent, service-only import of one frozen V4 manifest.

begin;

create table public.question_bank_v4_manifests (
  source_sha text primary key check (source_sha ~ '^[a-f0-9]{40}$'),
  corpus_sha256 text not null check (corpus_sha256 ~ '^[a-f0-9]{64}$'),
  ids_sha256 text not null check (ids_sha256 ~ '^[a-f0-9]{64}$'),
  expected_count integer not null check (expected_count > 0),
  editorial_status text not null check (editorial_status = 'FROZEN'),
  editorial_approval text not null check (editorial_approval = 'APPROVED'),
  created_at timestamptz not null default now()
);

insert into public.question_bank_v4_manifests (
  source_sha, corpus_sha256, ids_sha256, expected_count,
  editorial_status, editorial_approval
) values (
  '68dfae07baaafa59e00fa7a085ac4b903b62aa07',
  '3845d22280819f3d17cb946936f9c41720801d026124b5d726042ec28bbc7533',
  '3e1a4ca114ad6393fa48f9e293fc3136e17570f3b09d67953731f6c3a79f2b23',
  248,
  'FROZEN',
  'APPROVED'
);

create table public.question_bank_v4_taxonomy_snapshot (
  source_sha text not null default '68dfae07baaafa59e00fa7a085ac4b903b62aa07'
    references public.question_bank_v4_manifests(source_sha),
  dimension text not null check (dimension in (
    'domain', 'topic', 'competency', 'questionType',
    'cognitiveLevel', 'estimatedDifficulty'
  )),
  value text not null check (btrim(value) <> ''),
  primary key (source_sha, dimension, value)
);

insert into public.question_bank_v4_taxonomy_snapshot (dimension, value) values
  ('domain', 'pedagogia'),
  ('domain', 'evaluacion'),
  ('domain', 'convivencia'),
  ('domain', 'inclusion'),
  ('domain', 'curriculo'),
  ('domain', 'didactica'),
  ('domain', 'gestion_educativa'),
  ('domain', 'normativa_educativa'),
  ('domain', 'desarrollo_aprendizaje'),
  ('domain', 'practica_docente'),
  ('topic', 'evaluacion_formativa'),
  ('topic', 'evaluacion_diagnostica'),
  ('topic', 'retroalimentacion'),
  ('topic', 'evaluacion_desempeno_docente'),
  ('topic', 'carrera_docente'),
  ('topic', 'ajustes_razonables'),
  ('topic', 'dua'),
  ('topic', 'piar'),
  ('topic', 'inclusion_educativa'),
  ('topic', 'convivencia_escolar'),
  ('topic', 'debido_proceso'),
  ('topic', 'rutas_de_atencion'),
  ('topic', 'proteccion_integral'),
  ('topic', 'competencias_ciudadanas'),
  ('topic', 'competencias_comportamentales'),
  ('topic', 'gobierno_escolar_participacion'),
  ('topic', 'planeacion_curricular'),
  ('topic', 'prae_proyectos_transversales'),
  ('topic', 'funciones_y_jornada_docente'),
  ('topic', 'educacion_inicial_transicion'),
  ('topic', 'aprendizaje_y_desarrollo_cognitivo'),
  ('topic', 'razonamiento_cuantitativo'),
  ('topic', 'indagacion'),
  ('topic', 'modelizacion'),
  ('topic', 'argumentacion'),
  ('topic', 'comprension_lectora'),
  ('competency', 'decision_pedagogica'),
  ('competency', 'interpretacion_normativa'),
  ('competency', 'analisis_de_evidencia'),
  ('competency', 'planeacion_pedagogica'),
  ('competency', 'resolucion_de_problemas'),
  ('competency', 'comprension_conceptual'),
  ('competency', 'juicio_profesional'),
  ('competency', 'gestion_de_aula'),
  ('questionType', 'situational'),
  ('questionType', 'conceptual'),
  ('questionType', 'normative_applied'),
  ('questionType', 'reasoning'),
  ('questionType', 'reading_analysis'),
  ('questionType', 'case_analysis'),
  ('questionType', 'technical_applied'),
  ('cognitiveLevel', 'understand'),
  ('cognitiveLevel', 'apply'),
  ('cognitiveLevel', 'analyze'),
  ('cognitiveLevel', 'judge'),
  ('estimatedDifficulty', 'low'),
  ('estimatedDifficulty', 'medium'),
  ('estimatedDifficulty', 'high');

create table public.question_bank_v4_import_runs (
  execution_id uuid primary key,
  source_sha text not null references public.question_bank_v4_manifests(source_sha),
  plan_hash text not null check (plan_hash ~ '^[a-f0-9]{64}$'),
  expected_count integer not null check (expected_count > 0),
  status text not null check (status in ('running', 'succeeded', 'failed')),
  started_at timestamptz not null,
  finished_at timestamptz,
  error_code text,
  reconciliation_result jsonb,
  check ((status = 'running') = (finished_at is null)),
  check ((status = 'failed') = (error_code is not null))
);

create index idx_question_bank_v4_import_runs_started_at
  on public.question_bank_v4_import_runs(started_at desc);

alter table public.question_bank_v4_manifests enable row level security;
alter table public.question_bank_v4_taxonomy_snapshot enable row level security;
alter table public.question_bank_v4_import_runs enable row level security;

revoke all on table public.question_bank_v4_manifests from public, anon, authenticated;
revoke all on table public.question_bank_v4_taxonomy_snapshot from public, anon, authenticated;
revoke all on table public.question_bank_v4_import_runs from public, anon, authenticated;
grant select on table public.question_bank_v4_manifests to service_role;
grant select on table public.question_bank_v4_taxonomy_snapshot to service_role;
grant select on table public.question_bank_v4_import_runs to service_role;

create or replace function public.question_bank_v4_canonical_json(p_value jsonb)
returns text
language plpgsql
immutable
strict
security definer
set search_path = public, pg_temp
as $$
declare
  v_result text;
begin
  case jsonb_typeof(p_value)
    when 'object' then
      select '{' || coalesce(string_agg(
        to_jsonb(entry.key)::text || ':' || public.question_bank_v4_canonical_json(entry.value),
        ',' order by entry.key
      ), '') || '}'
      into v_result
      from jsonb_each(p_value) as entry;
    when 'array' then
      select '[' || coalesce(string_agg(
        public.question_bank_v4_canonical_json(entry.value),
        ',' order by entry.ordinality
      ), '') || ']'
      into v_result
      from jsonb_array_elements(p_value) with ordinality as entry(value, ordinality);
    else
      v_result := p_value::text;
  end case;
  return v_result;
end;
$$;

revoke execute on function public.question_bank_v4_canonical_json(jsonb)
  from public, anon, authenticated;
grant execute on function public.question_bank_v4_canonical_json(jsonb)
  to service_role;

create or replace function public.import_question_bank_v4_batch(
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
  v_execution_id uuid := gen_random_uuid();
  v_started_at timestamptz := clock_timestamp();
  v_manifest public.question_bank_v4_manifests%rowtype;
  v_candidate jsonb;
  v_item jsonb;
  v_field text;
  v_option text;
  v_calculated_hash text;
  v_calculated_ids_hash text;
  v_calculated_plan_hash text;
  v_candidate_count integer := 0;
  v_distinct_count integer := 0;
  v_changed integer := 0;
  v_unchanged integer := 0;
  v_forced_inactive integer := 0;
  v_historical_deactivated integer := 0;
  v_invalid_option_rows integer := 0;
  v_unit_changed boolean;
  v_error_message text;
  v_safe_error text;
  v_reconciliation jsonb;
begin
  select * into v_manifest
  from public.question_bank_v4_manifests manifest
  where manifest.source_sha = p_source_sha;

  if not found then
    raise exception 'UNKNOWN_V4_MANIFEST';
  end if;

  insert into public.question_bank_v4_import_runs (
    execution_id, source_sha, plan_hash, expected_count, status, started_at
  ) values (
    v_execution_id, p_source_sha,
    case when p_plan_hash ~ '^[a-f0-9]{64}$' then p_plan_hash else repeat('0', 64) end,
    greatest(coalesce(p_expected_count, 1), 1), 'running', v_started_at
  );

  begin
    perform pg_advisory_xact_lock(hashtextextended('question-bank-v4-batch-import', 0));

    if p_candidates is null or jsonb_typeof(p_candidates) <> 'array' then
      raise exception 'INVALID_V4_BATCH_JSON';
    end if;
    if p_expected_count is null or p_expected_count <> v_manifest.expected_count then
      raise exception 'INVALID_V4_EXPECTED_COUNT';
    end if;
    if p_plan_hash is null or p_plan_hash !~ '^[a-f0-9]{64}$' then
      raise exception 'INVALID_V4_PLAN_HASH';
    end if;

    v_candidate_count := jsonb_array_length(p_candidates);
    if v_candidate_count <> p_expected_count then
      raise exception 'INVALID_V4_CANDIDATE_COUNT';
    end if;

    select count(distinct candidate->>'itemId')
    into v_distinct_count
    from jsonb_array_elements(p_candidates) as candidates(candidate);
    if v_distinct_count <> v_candidate_count then
      raise exception 'DUPLICATE_V4_ID';
    end if;

    select encode(extensions.digest(coalesce(string_agg(
      candidate->>'itemId' || E'\n', '' order by candidate->>'itemId'
    ), ''), 'sha256'), 'hex')
    into v_calculated_ids_hash
    from jsonb_array_elements(p_candidates) as candidates(candidate);
    if v_calculated_ids_hash <> v_manifest.ids_sha256 then
      raise exception 'V4_MANIFEST_IDS_MISMATCH';
    end if;

    for v_candidate in select value from jsonb_array_elements(p_candidates)
    loop
      if jsonb_typeof(v_candidate) <> 'object'
        or not (v_candidate ?& array['item', 'itemId', 'sourcePath', 'contentHash', 'approvalEvidence']) then
        raise exception 'INVALID_V4_CANDIDATE';
      end if;
      v_item := v_candidate->'item';
      if jsonb_typeof(v_item) <> 'object' then
        raise exception 'INVALID_V4_ITEM_CONTRACT';
      end if;
      if not (v_item ?& array[
        'id', 'scope', 'domain', 'topic', 'competency', 'questionType',
        'cognitiveLevel', 'context', 'stem', 'options', 'correctAnswer',
        'explanations', 'hint', 'learningNote', 'source', 'estimatedDifficulty'
      ]) or (v_item - array[
        'id', 'scope', 'domain', 'topic', 'competency', 'questionType',
        'cognitiveLevel', 'context', 'stem', 'options', 'correctAnswer',
        'explanations', 'hint', 'learningNote', 'source', 'estimatedDifficulty', 'opecId'
      ]) <> '{}'::jsonb then
        raise exception 'INVALID_V4_ITEM_CONTRACT';
      end if;
      if v_candidate->>'itemId' <> v_item->>'id'
        or (v_item->>'id') !~ '^(DOC|GEN)-[0-9]{6}$' then
        raise exception 'INVALID_V4_ITEM_ID';
      end if;
      if v_candidate->>'sourcePath' !~ '^content/question-bank-v4/items/(docentes|general)/(DOC|GEN)-[0-9]{6}\.json$'
        or split_part(v_candidate->>'sourcePath', '/', 5) <> (v_item->>'id') || '.json'
        or (split_part(v_candidate->>'sourcePath', '/', 4) = 'docentes' and (v_item->>'id') not like 'DOC-%')
        or (split_part(v_candidate->>'sourcePath', '/', 4) = 'general' and (v_item->>'id') not like 'GEN-%') then
        raise exception 'INVALID_V4_SOURCE_PATH';
      end if;
      if v_candidate->'approvalEvidence'->>'kind' <> 'canonical-manifest'
        or v_candidate->'approvalEvidence'->>'reference'
          <> 'manifest:' || p_source_sha || ':' || (v_item->>'id') then
        raise exception 'MISSING_V4_APPROVAL_EVIDENCE';
      end if;
      if (v_candidate->>'sourcePath') ~ E'[\n\r:]'
        or (v_candidate->'approvalEvidence'->>'reference') ~ E'[\n\r]' then
        raise exception 'INVALID_V4_PLAN_COMPONENT';
      end if;

      foreach v_field in array array[
        'id', 'scope', 'domain', 'topic', 'competency', 'questionType',
        'cognitiveLevel', 'context', 'stem', 'correctAnswer', 'hint',
        'learningNote', 'estimatedDifficulty'
      ]
      loop
        if jsonb_typeof(v_item->v_field) <> 'string' or btrim(v_item->>v_field) = '' then
          raise exception 'INVALID_V4_ITEM_CONTRACT';
        end if;
      end loop;

      if v_item->>'scope' not in ('general', 'opec_specific')
        or (v_item->>'scope' = 'general' and v_item ? 'opecId')
        or (v_item->>'scope' = 'opec_specific' and coalesce(btrim(v_item->>'opecId'), '') = '') then
        raise exception 'INVALID_V4_SCOPE';
      end if;

      foreach v_field in array array['domain', 'topic', 'competency', 'questionType', 'cognitiveLevel', 'estimatedDifficulty']
      loop
        if not exists (
          select 1 from public.question_bank_v4_taxonomy_snapshot taxonomy
          where taxonomy.source_sha = p_source_sha
            and taxonomy.dimension = v_field and taxonomy.value = v_item->>v_field
        ) then
          raise exception 'INVALID_V4_TAXONOMY';
        end if;
      end loop;

      if jsonb_typeof(v_item->'options') <> 'object'
        or jsonb_typeof(v_item->'explanations') <> 'object'
        or not (v_item->'options' ?& array['A', 'B', 'C', 'D'])
        or not (v_item->'explanations' ?& array['A', 'B', 'C', 'D'])
        or (select count(*) from jsonb_object_keys(v_item->'options')) <> 4
        or (select count(*) from jsonb_object_keys(v_item->'explanations')) <> 4 then
        raise exception 'INVALID_V4_OPTIONS';
      end if;
      foreach v_option in array array['A', 'B', 'C', 'D']
      loop
        if jsonb_typeof(v_item->'options'->v_option) <> 'string'
          or btrim(v_item->'options'->>v_option) = ''
          or jsonb_typeof(v_item->'explanations'->v_option) <> 'string'
          or btrim(v_item->'explanations'->>v_option) = '' then
          raise exception 'INVALID_V4_OPTIONS';
        end if;
      end loop;
      if (
        select count(distinct lower(btrim(value)))
        from jsonb_each_text(v_item->'options')
      ) <> 4 then
        raise exception 'INVALID_V4_OPTIONS';
      end if;
      if v_item->>'correctAnswer' not in ('A', 'B', 'C', 'D') then
        raise exception 'INVALID_V4_CORRECT_OPTION';
      end if;
      if jsonb_typeof(v_item->'source') <> 'object'
        or not (v_item->'source' ? 'reference')
        or (select count(*) from jsonb_object_keys(v_item->'source')) <> 1
        or jsonb_typeof(v_item->'source'->'reference') <> 'string'
        or btrim(v_item->'source'->>'reference') = '' then
        raise exception 'INVALID_V4_SOURCE';
      end if;

      v_calculated_hash := encode(extensions.digest(
        public.question_bank_v4_canonical_json(v_item), 'sha256'
      ), 'hex');
      if v_candidate->>'contentHash' <> v_calculated_hash then
        raise exception 'INVALID_V4_CONTENT_HASH';
      end if;
    end loop;

    select encode(extensions.digest(coalesce(string_agg(
      (candidate->>'itemId') || ':' || (candidate->>'contentHash') || ':' ||
      (candidate->>'sourcePath') || ':' || ((candidate->'approvalEvidence')->>'reference') || E'\n',
      '' order by (candidate->>'itemId')
    ), ''), 'sha256'), 'hex')
    into v_calculated_plan_hash
    from jsonb_array_elements(p_candidates) as candidates(candidate);
    if v_calculated_plan_hash <> p_plan_hash then
      raise exception 'INVALID_V4_PLAN_HASH';
    end if;

    for v_candidate in select value from jsonb_array_elements(p_candidates)
    loop
      v_item := v_candidate->'item';
      select result.changed into v_unit_changed
      from public.upsert_content_item_v4(
        v_item,
        v_candidate->>'sourcePath',
        v_candidate->>'contentHash',
        v_candidate->'approvalEvidence'->>'reference'
      ) as result;
      if v_unit_changed then
        v_changed := v_changed + 1;
      else
        v_unchanged := v_unchanged + 1;
      end if;
    end loop;

    update public.item_bank item
    set status = 'draft', is_published = false, is_active = false,
      pilot_status = 'not_in_pilot', updated_at = now()
    where item.content_id in (
      select candidate->>'itemId'
      from jsonb_array_elements(p_candidates) as candidates(candidate)
    ) and (
      item.status <> 'draft' or item.is_published or item.is_active
      or item.pilot_status <> 'not_in_pilot'
    );
    get diagnostics v_forced_inactive = row_count;

    update public.item_bank item
    set status = 'draft', is_published = false, is_active = false,
      pilot_status = 'not_in_pilot',
      editorial_metadata = coalesce(item.editorial_metadata, '{}'::jsonb) ||
        jsonb_build_object('manifestReconciliation', jsonb_build_object(
          'absentFromSourceSha', p_source_sha,
          'deactivatedAt', now(),
          'deleted', false
        )),
      updated_at = now()
    where item.bank_version = 'v4'
      and not exists (
        select 1 from jsonb_array_elements(p_candidates) as candidates(candidate)
        where candidate->>'itemId' = item.content_id
      )
      and (item.status <> 'draft' or item.is_published or item.is_active
        or item.pilot_status <> 'not_in_pilot');
    get diagnostics v_historical_deactivated = row_count;

    select count(*) into v_invalid_option_rows
    from (
      select item.id
      from public.item_bank item
      join public.item_options option on option.item_id = item.id
      where item.content_id in (
        select candidate->>'itemId'
        from jsonb_array_elements(p_candidates) as candidates(candidate)
      )
      group by item.id
      having count(*) <> 4
        or count(distinct option.option_key) <> 4
        or count(*) filter (where option.option_key in ('A', 'B', 'C', 'D')) <> 4
    ) invalid_options;
    if v_invalid_option_rows <> 0 then
      raise exception 'V4_RECONCILIATION_FAILED';
    end if;

    v_reconciliation := jsonb_build_object(
      'manifestCount', p_expected_count,
      'databaseCount', (
        select count(*) from public.item_bank item
        where item.content_id in (
          select candidate->>'itemId'
          from jsonb_array_elements(p_candidates) as candidates(candidate)
        )
      ),
      'changed', v_changed,
      'unchanged', v_unchanged,
      'forcedInactive', v_forced_inactive,
      'historicalDeactivated', v_historical_deactivated,
      'invalidOptionRows', v_invalid_option_rows,
      'idsSha256', v_calculated_ids_hash,
      'planHash', v_calculated_plan_hash
    );

    update public.question_bank_v4_import_runs run
    set status = 'succeeded', finished_at = clock_timestamp(),
      reconciliation_result = v_reconciliation
    where run.execution_id = v_execution_id;
  exception when others then
    get stacked diagnostics v_error_message = message_text;
    v_safe_error := case
      when v_error_message = any(array[
        'INVALID_V4_BATCH_JSON', 'INVALID_V4_EXPECTED_COUNT',
        'INVALID_V4_PLAN_HASH', 'INVALID_V4_CANDIDATE_COUNT',
        'DUPLICATE_V4_ID', 'V4_MANIFEST_IDS_MISMATCH',
        'INVALID_V4_CANDIDATE', 'INVALID_V4_ITEM_CONTRACT',
        'INVALID_V4_ITEM_ID', 'INVALID_V4_SOURCE_PATH',
        'MISSING_V4_APPROVAL_EVIDENCE', 'INVALID_V4_PLAN_COMPONENT',
        'INVALID_V4_SCOPE', 'INVALID_V4_TAXONOMY',
        'INVALID_V4_OPTIONS', 'INVALID_V4_CORRECT_OPTION',
        'INVALID_V4_SOURCE', 'INVALID_V4_CONTENT_HASH',
        'V4_RECONCILIATION_FAILED'
      ]) then v_error_message
      else 'V4_BATCH_IMPORT_FAILED'
    end;
    v_reconciliation := jsonb_build_object(
      'rolledBack', true,
      'candidateCount', v_candidate_count,
      'partialQuestionWrites', 0
    );
    update public.question_bank_v4_import_runs run
    set status = 'failed', finished_at = clock_timestamp(),
      error_code = v_safe_error, reconciliation_result = v_reconciliation
    where run.execution_id = v_execution_id;
  end;

  return query
  select run.execution_id, run.status, run.error_code,
    coalesce((run.reconciliation_result->>'changed')::integer, 0),
    coalesce((run.reconciliation_result->>'unchanged')::integer, 0),
    coalesce((run.reconciliation_result->>'historicalDeactivated')::integer, 0),
    run.reconciliation_result
  from public.question_bank_v4_import_runs run
  where run.execution_id = v_execution_id;
end;
$$;

revoke execute on function public.import_question_bank_v4_batch(jsonb, text, integer, text)
  from public, anon, authenticated;
grant execute on function public.import_question_bank_v4_batch(jsonb, text, integer, text)
  to service_role;

drop view if exists public.v_question_bank_v4_practice;
drop view if exists public.v_question_bank_v4_answered;
drop view if exists public.v_question_bank_v4_active;

create view public.v_question_bank_v4_active with (security_invoker = true) as
select ib.id, ib.content_id, ib.slug, ib.title, ib.area, ib.subarea, ib.competency,
  ib.opec_id, ib.editorial_scope, ib.topic_code, ib.question_type, ib.cognitive_level,
  ib.difficulty, ib.stem, ib.status, ib.is_published, ib.is_active, ib.source_type,
  ib.source_path, ib.source_reference, ib.source_locator, ib.source_url, ib.tags,
  ib.thematic_nucleus_id,
  ib.editorial_metadata->>'context' as context,
  ib.editorial_metadata->>'hint' as hint,
  'active'::text as read_state
from public.item_bank ib
where ib.bank_version = 'v4'
  and ib.status = 'published' and ib.is_published = true and ib.is_active = true
  and ib.approval_status = 'approved'
  and ib.pilot_status in ('pilot_loaded', 'pilot_running', 'pilot_completed')
  and ib.source_path like 'content/question-bank-v4/%';

create view public.v_question_bank_v4_practice with (security_invoker = true) as
select v.* from public.v_question_bank_v4_active v;

create view public.v_question_bank_v4_answered with (security_invoker = true) as
select ib.id, ib.content_id, ib.slug, ib.correct_option, ib.explanation,
  ib.editorial_metadata->'explanations' as option_explanations,
  ib.editorial_metadata->>'learningNote' as learning_note,
  ib.editorial_metadata->>'hint' as hint,
  ib.source_reference, ib.source_locator, ib.source_url,
  ib.version, 'active'::text as read_state
from public.item_bank ib
where ib.bank_version = 'v4'
  and ib.status = 'published' and ib.is_published = true and ib.is_active = true
  and ib.approval_status = 'approved'
  and ib.pilot_status in ('pilot_loaded', 'pilot_running', 'pilot_completed')
  and ib.source_path like 'content/question-bank-v4/%';

revoke all on table public.v_question_bank_v4_active from public, anon, authenticated;
revoke all on table public.v_question_bank_v4_practice from public, anon, authenticated;
revoke all on table public.v_question_bank_v4_answered from public, anon, authenticated;
grant select on table public.v_question_bank_v4_active to service_role;
grant select on table public.v_question_bank_v4_practice to service_role;
grant select on table public.v_question_bank_v4_answered to service_role;

comment on function public.import_question_bank_v4_batch(jsonb, text, integer, text) is
  'Imports one frozen V4 manifest atomically, records safe audit evidence, preserves historical rows, and leaves every imported item inactive.';
comment on table public.question_bank_v4_import_runs is
  'Service-only audit trail for atomic V4 import attempts and reconciliation results.';
comment on view public.v_question_bank_v4_active is
  'Server-only pre-answer V4 projection without answer keys or protected editorial metadata.';
comment on view public.v_question_bank_v4_practice is
  'Server-only pre-answer compatibility projection without answer keys or explanations.';
comment on view public.v_question_bank_v4_answered is
  'Service-only post-answer projection with authorized scoring truth and feedback.';

commit;
