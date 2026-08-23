-- One-way Git repository -> Supabase synchronization transaction.

begin;

create function public.canonical_json(p_value jsonb)
returns text
language sql
immutable
strict
security invoker
set search_path = public, pg_temp
as $$
  select case jsonb_typeof(p_value)
    when 'object' then (
      select '{' || coalesce(string_agg(to_jsonb(key)::text || ':' || public.canonical_json(value), ',' order by key), '') || '}'
      from jsonb_each(p_value)
    )
    when 'array' then (
      select '[' || coalesce(string_agg(public.canonical_json(value), ',' order by ordinality), '') || ']'
      from jsonb_array_elements(p_value) with ordinality
    )
    else p_value::text
  end;
$$;

create function public.apply_content_sync(
  p_plan jsonb,
  p_plan_hash text,
  p_approved_plan_hash text,
  p_actor text,
  p_mechanism text,
  p_target_instance_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_run_id uuid;
  v_release_id uuid;
  v_row jsonb;
  v_target jsonb;
  v_effective_hash text;
  v_unchanged integer := 0;
  v_archived integer := 0;
  v_removed integer := 0;
  v_count integer := 0;
  v_opec_id uuid;
  v_safe_error text;
  v_prior_success boolean := false;
  v_writes integer := 0;
  v_repaired integer := 0;
  v_release_writes integer := 0;
  v_family_writes integer := 0;
  v_profile_writes integer := 0;
  v_opec_writes integer := 0;
  v_question_writes integer := 0;
  v_option_writes integer := 0;
  v_family_target_writes integer := 0;
  v_profile_target_writes integer := 0;
  v_opec_target_writes integer := 0;
  v_knowledge_source_writes integer := 0;
  v_knowledge_target_writes integer := 0;
  v_item_source_writes integer := 0;
begin
  select instance_id into v_opec_id
  from public.runtime_metadata
  where singleton and baseline_id = 'gcm-v4-clean-v1';

  if v_opec_id is null or v_opec_id <> p_target_instance_id then
    raise exception 'TARGET_BASELINE_OR_INSTANCE_MISMATCH';
  end if;
  if p_plan_hash is null or p_plan_hash <> p_approved_plan_hash then
    raise exception 'APPROVED_PLAN_HASH_MISMATCH';
  end if;
  v_effective_hash := encode(extensions.digest(convert_to(public.canonical_json(p_plan), 'UTF8'), 'sha256'), 'hex');
  if v_effective_hash <> p_plan_hash then
    raise exception 'EFFECTIVE_PLAN_HASH_MISMATCH';
  end if;
  if p_plan #>> '{baselineId}' <> 'gcm-v4-clean-v1' then
    raise exception 'PLAN_BASELINE_MISMATCH';
  end if;
  if jsonb_array_length(p_plan #> '{entities,questions}') <> (p_plan #>> '{release,expectedItemCount}')::integer then
    raise exception 'QUESTION_COUNT_MISMATCH';
  end if;
  for v_row in select value from jsonb_array_elements(p_plan #> '{entities,questions}') loop
    if jsonb_array_length(v_row->'options') <> 4
      or (select string_agg(value->>'key', ',' order by value->>'key') from jsonb_array_elements(v_row->'options')) <> 'A,B,C,D'
    then
      raise exception 'QUESTION_OPTION_SET_MISMATCH:%', v_row->>'id';
    end if;
  end loop;

  select exists (
    select 1 from public.content_sync_runs
    where plan_hash = p_plan_hash and status in ('succeeded', 'verified')
  ) into v_prior_success;

  insert into public.content_sync_runs (
    git_sha, manifest_hash, corpus_hash, ids_hash, targeting_catalog_hash,
    opec_catalog_hash, knowledge_catalog_hash, plan_hash, status, actor,
    mechanism, target_instance_id
  ) values (
    p_plan #>> '{gitSha}', p_plan #>> '{hashes,manifest}', p_plan #>> '{hashes,corpus}',
    p_plan #>> '{hashes,ids}', p_plan #>> '{hashes,targeting}', p_plan #>> '{hashes,opec}',
    p_plan #>> '{hashes,knowledge}', p_plan_hash, 'running', p_actor, p_mechanism,
    p_target_instance_id
  ) returning id into v_run_id;

  begin
    for v_row in select value from jsonb_array_elements(p_plan #> '{entities,families}') loop
      insert into public.target_families (code, name, description, is_active, content_hash, synced_at)
      values (v_row->>'code', v_row->>'name', v_row->>'description', (v_row->>'isActive')::boolean, v_row->>'contentHash', now())
      on conflict (code) do update set name = excluded.name, description = excluded.description,
        is_active = excluded.is_active, content_hash = excluded.content_hash, synced_at = now()
      where public.target_families.name is distinct from excluded.name
         or public.target_families.description is distinct from excluded.description
         or public.target_families.is_active is distinct from excluded.is_active
         or public.target_families.content_hash is distinct from excluded.content_hash;
      get diagnostics v_count = row_count;
      v_family_writes := v_family_writes + v_count;
      if v_count = 0 then v_unchanged := v_unchanged + 1; end if;
    end loop;

    update public.target_families set is_active = false
    where code not in (select value from jsonb_array_elements_text(p_plan #> '{entityIds,families}')) and is_active;
    get diagnostics v_count = row_count;
    v_family_writes := v_family_writes + v_count;
    v_archived := v_archived + v_count;

    for v_row in select value from jsonb_array_elements(p_plan #> '{entities,profiles}') loop
      insert into public.target_profiles (code, family_code, name, is_active, content_hash, synced_at)
      values (v_row->>'code', v_row->>'familyCode', v_row->>'name', (v_row->>'isActive')::boolean, v_row->>'contentHash', now())
      on conflict (code) do update set family_code = excluded.family_code, name = excluded.name,
        is_active = excluded.is_active, content_hash = excluded.content_hash, synced_at = now()
      where public.target_profiles.family_code is distinct from excluded.family_code
         or public.target_profiles.name is distinct from excluded.name
         or public.target_profiles.is_active is distinct from excluded.is_active
         or public.target_profiles.content_hash is distinct from excluded.content_hash;
      get diagnostics v_count = row_count;
      v_profile_writes := v_profile_writes + v_count;
      if v_count = 0 then v_unchanged := v_unchanged + 1; end if;
    end loop;

    update public.target_profiles set is_active = false
    where code not in (select value from jsonb_array_elements_text(p_plan #> '{entityIds,profiles}')) and is_active;
    get diagnostics v_count = row_count;
    v_profile_writes := v_profile_writes + v_count;
    v_archived := v_archived + v_count;

    for v_row in select value from jsonb_array_elements(p_plan #> '{entities,opecs}') loop
      insert into public.opec_catalog (
        source_system, external_opec_id, family_code, profile_code, convocation_code,
        entity_name, position_name, source_reference, source_url,
        verification_status, is_active, metadata, content_hash, synced_at
      ) values (
        v_row->>'sourceSystem', v_row->>'externalOpecId', v_row->>'familyCode', v_row->>'profileCode',
        v_row->>'convocationCode', v_row->>'entityName', v_row->>'positionName',
        v_row->>'sourceReference', v_row->>'sourceUrl', 'verified', (v_row->>'isActive')::boolean,
        coalesce(v_row->'metadata', '{}'::jsonb), v_row->>'contentHash', now()
      ) on conflict (source_system, external_opec_id) do update set
        family_code = excluded.family_code, profile_code = excluded.profile_code,
        convocation_code = excluded.convocation_code, entity_name = excluded.entity_name,
        position_name = excluded.position_name, source_reference = excluded.source_reference,
        source_url = excluded.source_url, verification_status = 'verified', is_active = excluded.is_active,
        metadata = excluded.metadata, content_hash = excluded.content_hash, synced_at = now()
      where public.opec_catalog.family_code is distinct from excluded.family_code
         or public.opec_catalog.profile_code is distinct from excluded.profile_code
         or public.opec_catalog.convocation_code is distinct from excluded.convocation_code
         or public.opec_catalog.entity_name is distinct from excluded.entity_name
         or public.opec_catalog.position_name is distinct from excluded.position_name
         or public.opec_catalog.source_reference is distinct from excluded.source_reference
         or public.opec_catalog.source_url is distinct from excluded.source_url
         or public.opec_catalog.verification_status is distinct from 'verified'
         or public.opec_catalog.is_active is distinct from excluded.is_active
         or public.opec_catalog.metadata is distinct from excluded.metadata
         or public.opec_catalog.content_hash is distinct from excluded.content_hash;
      get diagnostics v_count = row_count;
      v_opec_writes := v_opec_writes + v_count;
      if v_count = 0 then v_unchanged := v_unchanged + 1; end if;
    end loop;

    update public.opec_catalog set is_active = false
    where (source_system || ':' || external_opec_id) not in (select value from jsonb_array_elements_text(p_plan #> '{entityIds,opecs}')) and is_active;
    get diagnostics v_count = row_count;
    v_opec_writes := v_opec_writes + v_count;
    v_archived := v_archived + v_count;

    insert into public.question_releases (
      bank, git_sha, manifest_source_sha, manifest_hash, corpus_hash, ids_hash, expected_item_count
    ) values (
      p_plan #>> '{release,bank}', p_plan #>> '{gitSha}', p_plan #>> '{release,manifestSourceSha}',
      p_plan #>> '{hashes,manifest}', p_plan #>> '{hashes,corpus}', p_plan #>> '{hashes,ids}',
      (p_plan #>> '{release,expectedItemCount}')::integer
    ) on conflict (bank, manifest_hash) do update set
      git_sha = excluded.git_sha, manifest_source_sha = excluded.manifest_source_sha,
      corpus_hash = excluded.corpus_hash, ids_hash = excluded.ids_hash,
      expected_item_count = excluded.expected_item_count
    where public.question_releases.git_sha is distinct from excluded.git_sha
       or public.question_releases.manifest_source_sha is distinct from excluded.manifest_source_sha
       or public.question_releases.corpus_hash is distinct from excluded.corpus_hash
       or public.question_releases.ids_hash is distinct from excluded.ids_hash
       or public.question_releases.expected_item_count is distinct from excluded.expected_item_count;
    get diagnostics v_count = row_count;
    v_release_writes := v_release_writes + v_count;
    if v_count = 0 then v_unchanged := v_unchanged + 1; end if;

    select id into strict v_release_id from public.question_releases
    where bank = p_plan #>> '{release,bank}'
      and manifest_hash = p_plan #>> '{hashes,manifest}';

    for v_row in select value from jsonb_array_elements(p_plan #> '{entities,questions}') loop
      insert into public.questions (
        id, release_id, domain, topic, competency, question_type, cognitive_level,
        estimated_difficulty, editorial_scope, editorial_opec_id, context, stem,
        correct_option, explanations, hint, learning_note, source_reference,
        source_locator, source_url, source_type, source_path, content_hash, sync_state
      ) values (
        v_row->>'id', v_release_id, v_row->>'domain', v_row->>'topic', v_row->>'competency',
        v_row->>'questionType', v_row->>'cognitiveLevel', (v_row->>'estimatedDifficulty')::numeric,
        v_row->>'scope', v_row->>'opecId', v_row->>'context', v_row->>'stem',
        v_row->>'correctOption', v_row->'explanations', v_row->>'hint', v_row->>'learningNote',
        v_row #>> '{source,reference}', v_row #>> '{source,locator}', v_row #>> '{source,url}',
        v_row #>> '{source,type}', v_row->>'sourcePath', v_row->>'contentHash', 'current'
      ) on conflict (id) do update set
        release_id = excluded.release_id, domain = excluded.domain, topic = excluded.topic,
        competency = excluded.competency, question_type = excluded.question_type,
        cognitive_level = excluded.cognitive_level, estimated_difficulty = excluded.estimated_difficulty,
        editorial_scope = excluded.editorial_scope, editorial_opec_id = excluded.editorial_opec_id,
        context = excluded.context, stem = excluded.stem, correct_option = excluded.correct_option,
        explanations = excluded.explanations, hint = excluded.hint, learning_note = excluded.learning_note,
        source_reference = excluded.source_reference, source_locator = excluded.source_locator,
        source_url = excluded.source_url, source_type = excluded.source_type,
        source_path = excluded.source_path, content_hash = excluded.content_hash,
        sync_state = 'current', updated_at = now()
      where public.questions.content_hash is distinct from excluded.content_hash
         or public.questions.release_id is distinct from excluded.release_id
         or public.questions.sync_state <> 'current'
         or public.questions.domain is distinct from excluded.domain
         or public.questions.topic is distinct from excluded.topic
         or public.questions.competency is distinct from excluded.competency
         or public.questions.question_type is distinct from excluded.question_type
         or public.questions.cognitive_level is distinct from excluded.cognitive_level
         or public.questions.estimated_difficulty is distinct from excluded.estimated_difficulty
         or public.questions.editorial_scope is distinct from excluded.editorial_scope
         or public.questions.editorial_opec_id is distinct from excluded.editorial_opec_id
         or public.questions.context is distinct from excluded.context
         or public.questions.stem is distinct from excluded.stem
         or public.questions.correct_option is distinct from excluded.correct_option
         or public.questions.explanations is distinct from excluded.explanations
         or public.questions.hint is distinct from excluded.hint
         or public.questions.learning_note is distinct from excluded.learning_note
         or public.questions.source_reference is distinct from excluded.source_reference
         or public.questions.source_locator is distinct from excluded.source_locator
         or public.questions.source_url is distinct from excluded.source_url
         or public.questions.source_type is distinct from excluded.source_type
         or public.questions.source_path is distinct from excluded.source_path;
      get diagnostics v_count = row_count;
      v_question_writes := v_question_writes + v_count;
      if v_count = 0 then v_unchanged := v_unchanged + 1; end if;

      for v_target in select value from jsonb_array_elements(v_row->'options') loop
        insert into public.question_options (question_id, option_key, option_text, content_hash)
        values (v_row->>'id', v_target->>'key', v_target->>'text', v_target->>'contentHash')
        on conflict (question_id, option_key) do update set option_text = excluded.option_text, content_hash = excluded.content_hash
        where public.question_options.content_hash is distinct from excluded.content_hash
           or public.question_options.option_text is distinct from excluded.option_text;
        get diagnostics v_count = row_count;
        v_option_writes := v_option_writes + v_count;
        if v_count = 0 then v_unchanged := v_unchanged + 1; end if;
      end loop;
      delete from public.question_options
      where question_id = v_row->>'id'
        and option_key not in (select value->>'key' from jsonb_array_elements(v_row->'options'));
      get diagnostics v_count = row_count;
      v_option_writes := v_option_writes + v_count;
      v_removed := v_removed + v_count;
    end loop;

    update public.questions set sync_state = 'archived', updated_at = now()
    where id not in (select value from jsonb_array_elements_text(p_plan #> '{entityIds,questions}')) and sync_state = 'current';
    get diagnostics v_count = row_count;
    v_question_writes := v_question_writes + v_count;
    v_archived := v_archived + v_count;

    for v_row in select value from jsonb_array_elements(p_plan #> '{entities,itemTargets}') loop
      if v_row->>'targetType' = 'family' then
        insert into public.item_target_families (question_id, family_code, evidence, content_hash)
        values (v_row->>'questionId', v_row->>'familyCode', v_row->'evidence', v_row->>'contentHash')
        on conflict (question_id, family_code) do update set
          evidence = excluded.evidence, content_hash = excluded.content_hash
        where public.item_target_families.evidence is distinct from excluded.evidence
           or public.item_target_families.content_hash is distinct from excluded.content_hash;
        get diagnostics v_count = row_count;
        v_family_target_writes := v_family_target_writes + v_count;
        if v_count = 0 then v_unchanged := v_unchanged + 1; end if;
      elsif v_row->>'targetType' = 'profile' then
        insert into public.item_target_profiles (question_id, profile_code, evidence, content_hash)
        values (v_row->>'questionId', v_row->>'profileCode', v_row->'evidence', v_row->>'contentHash')
        on conflict (question_id, profile_code) do update set
          evidence = excluded.evidence, content_hash = excluded.content_hash
        where public.item_target_profiles.evidence is distinct from excluded.evidence
           or public.item_target_profiles.content_hash is distinct from excluded.content_hash;
        get diagnostics v_count = row_count;
        v_profile_target_writes := v_profile_target_writes + v_count;
        if v_count = 0 then v_unchanged := v_unchanged + 1; end if;
      elsif v_row->>'targetType' = 'opec' then
        select id into v_opec_id from public.opec_catalog where source_system = v_row->>'sourceSystem' and external_opec_id = v_row->>'externalOpecId';
        insert into public.item_opec_targets (question_id, opec_id, evidence, content_hash)
        values (v_row->>'questionId', v_opec_id, v_row->'evidence', v_row->>'contentHash')
        on conflict (question_id, opec_id) do update set
          evidence = excluded.evidence, content_hash = excluded.content_hash
        where public.item_opec_targets.evidence is distinct from excluded.evidence
           or public.item_opec_targets.content_hash is distinct from excluded.content_hash;
        get diagnostics v_count = row_count;
        v_opec_target_writes := v_opec_target_writes + v_count;
        if v_count = 0 then v_unchanged := v_unchanged + 1; end if;
      else raise exception 'INVALID_ITEM_TARGET_TYPE';
      end if;
    end loop;

    delete from public.item_target_families persisted
    where not exists (
      select 1 from jsonb_array_elements(p_plan #> '{entities,itemTargets}') planned
      where planned->>'targetType' = 'family'
        and planned->>'questionId' = persisted.question_id
        and planned->>'familyCode' = persisted.family_code
    );
    get diagnostics v_count = row_count;
    v_family_target_writes := v_family_target_writes + v_count;
    v_removed := v_removed + v_count;

    delete from public.item_target_profiles persisted
    where not exists (
      select 1 from jsonb_array_elements(p_plan #> '{entities,itemTargets}') planned
      where planned->>'targetType' = 'profile'
        and planned->>'questionId' = persisted.question_id
        and planned->>'profileCode' = persisted.profile_code
    );
    get diagnostics v_count = row_count;
    v_profile_target_writes := v_profile_target_writes + v_count;
    v_removed := v_removed + v_count;

    delete from public.item_opec_targets persisted
    where not exists (
      select 1
      from jsonb_array_elements(p_plan #> '{entities,itemTargets}') planned
      join public.opec_catalog planned_opec
        on planned_opec.source_system = planned->>'sourceSystem'
       and planned_opec.external_opec_id = planned->>'externalOpecId'
      where planned->>'targetType' = 'opec'
        and planned->>'questionId' = persisted.question_id
        and planned_opec.id = persisted.opec_id
    );
    get diagnostics v_count = row_count;
    v_opec_target_writes := v_opec_target_writes + v_count;
    v_removed := v_removed + v_count;

    for v_row in select value from jsonb_array_elements(p_plan #> '{entities,knowledgeSources}') loop
      insert into public.knowledge_sources (
        source_id, source_type, title, reference, issuer_or_author, jurisdiction,
        verification_status, verified_at, last_checked_at, source_system, source_url,
        repo_path, locator, metadata, content_hash, synced_at
      ) values (
        v_row->>'sourceId', v_row->>'sourceType', v_row->>'title', v_row->>'reference',
        v_row->>'issuerOrAuthor', v_row->>'jurisdiction', 'verified', (v_row->>'verifiedAt')::timestamptz,
        (v_row->>'lastCheckedAt')::date, v_row->>'sourceSystem', v_row->>'url', v_row->>'repoPath',
        v_row->>'locator', coalesce(v_row->'metadata', '{}'::jsonb), v_row->>'contentHash', now()
      ) on conflict (source_id) do update set
        source_type = excluded.source_type, title = excluded.title, reference = excluded.reference,
        issuer_or_author = excluded.issuer_or_author, jurisdiction = excluded.jurisdiction,
        verification_status = 'verified', verified_at = excluded.verified_at,
        last_checked_at = excluded.last_checked_at, source_system = excluded.source_system,
        source_url = excluded.source_url, repo_path = excluded.repo_path, locator = excluded.locator,
        metadata = excluded.metadata, content_hash = excluded.content_hash, synced_at = now()
      where public.knowledge_sources.source_type is distinct from excluded.source_type
         or public.knowledge_sources.title is distinct from excluded.title
         or public.knowledge_sources.reference is distinct from excluded.reference
         or public.knowledge_sources.issuer_or_author is distinct from excluded.issuer_or_author
         or public.knowledge_sources.jurisdiction is distinct from excluded.jurisdiction
         or public.knowledge_sources.verification_status is distinct from 'verified'
         or public.knowledge_sources.verified_at is distinct from excluded.verified_at
         or public.knowledge_sources.last_checked_at is distinct from excluded.last_checked_at
         or public.knowledge_sources.source_system is distinct from excluded.source_system
         or public.knowledge_sources.source_url is distinct from excluded.source_url
         or public.knowledge_sources.repo_path is distinct from excluded.repo_path
         or public.knowledge_sources.locator is distinct from excluded.locator
         or public.knowledge_sources.metadata is distinct from excluded.metadata
         or public.knowledge_sources.content_hash is distinct from excluded.content_hash;
      get diagnostics v_count = row_count;
      v_knowledge_source_writes := v_knowledge_source_writes + v_count;
      if v_count = 0 then v_unchanged := v_unchanged + 1; end if;
    end loop;
    for v_row in select value from jsonb_array_elements(p_plan #> '{entities,knowledgeTargets}') loop
      v_opec_id := null;
      if v_row->>'targetType' = 'opec' then
        select id into v_opec_id from public.opec_catalog where source_system = v_row->>'sourceSystem' and external_opec_id = v_row->>'externalOpecId';
      end if;
      insert into public.knowledge_source_targets (
        source_id, target_type, family_code, profile_code, opec_id, relevance, locator, reason, content_hash
      ) values (
        v_row->>'sourceId', v_row->>'targetType', v_row->>'familyCode', v_row->>'profileCode', v_opec_id,
        v_row->>'relevance', v_row->>'locator', v_row->>'reason', v_row->>'contentHash'
      ) on conflict (source_id, target_type, content_hash) do update set
        family_code = excluded.family_code, profile_code = excluded.profile_code,
        opec_id = excluded.opec_id, relevance = excluded.relevance,
        locator = excluded.locator, reason = excluded.reason
      where public.knowledge_source_targets.family_code is distinct from excluded.family_code
         or public.knowledge_source_targets.profile_code is distinct from excluded.profile_code
         or public.knowledge_source_targets.opec_id is distinct from excluded.opec_id
         or public.knowledge_source_targets.relevance is distinct from excluded.relevance
         or public.knowledge_source_targets.locator is distinct from excluded.locator
         or public.knowledge_source_targets.reason is distinct from excluded.reason;
      get diagnostics v_count = row_count;
      v_knowledge_target_writes := v_knowledge_target_writes + v_count;
      if v_count = 0 then v_unchanged := v_unchanged + 1; end if;
    end loop;

    delete from public.knowledge_source_targets persisted
    where not exists (
      select 1 from jsonb_array_elements(p_plan #> '{entities,knowledgeTargets}') planned
      where planned->>'sourceId' = persisted.source_id
        and planned->>'targetType' = persisted.target_type
        and planned->>'contentHash' = persisted.content_hash
    );
    get diagnostics v_count = row_count;
    v_knowledge_target_writes := v_knowledge_target_writes + v_count;
    v_removed := v_removed + v_count;

    for v_row in select value from jsonb_array_elements(p_plan #> '{entities,itemSources}') loop
      insert into public.item_source_links (question_id, source_id, relation_type, locator, content_hash)
      values (v_row->>'questionId', v_row->>'sourceId', v_row->>'relationType', v_row->>'locator', v_row->>'contentHash')
      on conflict (question_id, source_id, relation_type) do update set
        locator = excluded.locator, content_hash = excluded.content_hash
      where public.item_source_links.locator is distinct from excluded.locator
         or public.item_source_links.content_hash is distinct from excluded.content_hash;
      get diagnostics v_count = row_count;
      v_item_source_writes := v_item_source_writes + v_count;
      if v_count = 0 then v_unchanged := v_unchanged + 1; end if;
    end loop;

    delete from public.item_source_links persisted
    where not exists (
      select 1 from jsonb_array_elements(p_plan #> '{entities,itemSources}') planned
      where planned->>'questionId' = persisted.question_id
        and planned->>'sourceId' = persisted.source_id
        and planned->>'relationType' = persisted.relation_type
    );
    get diagnostics v_count = row_count;
    v_item_source_writes := v_item_source_writes + v_count;
    v_removed := v_removed + v_count;

    delete from public.knowledge_sources
    where source_id not in (select value from jsonb_array_elements_text(p_plan #> '{entityIds,knowledgeSources}'));
    get diagnostics v_count = row_count;
    v_knowledge_source_writes := v_knowledge_source_writes + v_count;
    v_removed := v_removed + v_count;

    v_writes := v_release_writes + v_family_writes + v_profile_writes + v_opec_writes
      + v_question_writes + v_option_writes + v_family_target_writes
      + v_profile_target_writes + v_opec_target_writes + v_knowledge_source_writes
      + v_knowledge_target_writes + v_item_source_writes;
    v_repaired := case when v_prior_success then v_writes else 0 end;

    update public.content_sync_runs set
      status = 'succeeded', finished_at = now(),
      counts = jsonb_build_object(
        'changed', v_writes, 'writes', v_writes, 'repaired', v_repaired,
        'unchanged', v_unchanged, 'archived', v_archived, 'removed', v_removed,
        'writeCounts', jsonb_build_object(
          'question_releases', v_release_writes,
          'target_families', v_family_writes,
          'target_profiles', v_profile_writes,
          'opec_catalog', v_opec_writes,
          'questions', v_question_writes,
          'question_options', v_option_writes,
          'item_target_families', v_family_target_writes,
          'item_target_profiles', v_profile_target_writes,
          'item_opec_targets', v_opec_target_writes,
          'knowledge_sources', v_knowledge_source_writes,
          'knowledge_source_targets', v_knowledge_target_writes,
          'item_source_links', v_item_source_writes
        )
      )
    where id = v_run_id;

    return jsonb_build_object(
      'executionId', v_run_id, 'status', 'succeeded',
      'changed', v_writes, 'writes', v_writes, 'repaired', v_repaired,
      'unchanged', v_unchanged, 'archived', v_archived, 'removed', v_removed,
      'writeCounts', jsonb_build_object(
        'question_releases', v_release_writes,
        'target_families', v_family_writes,
        'target_profiles', v_profile_writes,
        'opec_catalog', v_opec_writes,
        'questions', v_question_writes,
        'question_options', v_option_writes,
        'item_target_families', v_family_target_writes,
        'item_target_profiles', v_profile_target_writes,
        'item_opec_targets', v_opec_target_writes,
        'knowledge_sources', v_knowledge_source_writes,
        'knowledge_source_targets', v_knowledge_target_writes,
        'item_source_links', v_item_source_writes
      )
    );
  exception when others then
    v_safe_error := left(sqlstate || ':' || regexp_replace(sqlerrm, '[\r\n]+', ' ', 'g'), 500);
    update public.content_sync_runs set status = 'failed', finished_at = now(), safe_error = v_safe_error where id = v_run_id;
    return jsonb_build_object('executionId', v_run_id, 'status', 'failed', 'error', v_safe_error);
  end;
end;
$$;

create function public.verify_content_sync(p_plan_hash text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_run public.content_sync_runs%rowtype;
  v_expected integer;
  v_actual integer;
  v_result jsonb;
begin
  select * into v_run from public.content_sync_runs where plan_hash = p_plan_hash and status = 'succeeded' order by started_at desc limit 1;
  if not found then return jsonb_build_object('ok', false, 'reason', 'NO_SUCCEEDED_RUN'); end if;
  select expected_item_count into v_expected from public.question_releases where manifest_hash = v_run.manifest_hash;
  select count(*) into v_actual from public.questions q join public.question_releases r on r.id = q.release_id
  where r.manifest_hash = v_run.manifest_hash and q.sync_state = 'current'
    and (select count(*) from public.question_options o where o.question_id = q.id) = 4;
  v_result := jsonb_build_object('ok', v_actual = v_expected, 'expectedQuestions', v_expected, 'verifiedQuestions', v_actual);
  update public.content_sync_runs set status = case when v_actual = v_expected then 'verified' else 'failed' end,
    verification_result = v_result, finished_at = now() where id = v_run.id;
  return v_result;
end;
$$;

revoke all on function public.canonical_json(jsonb) from public, anon, authenticated;
revoke all on function public.apply_content_sync(jsonb, text, text, text, text, uuid) from public, anon, authenticated;
revoke all on function public.verify_content_sync(text) from public, anon, authenticated;
grant execute on function public.canonical_json(jsonb) to service_role;
grant execute on function public.apply_content_sync(jsonb, text, text, text, text, uuid) to service_role;
grant execute on function public.verify_content_sync(text) to service_role;

commit;
