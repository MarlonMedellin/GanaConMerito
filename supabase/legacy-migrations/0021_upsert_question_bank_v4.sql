-- 0021_upsert_question_bank_v4.sql
-- Idempotent, inactive-by-default import boundary for approved V4 items.

begin;

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
  v_existing_hash text;
  v_existing_approval text;
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
  if jsonb_object_length(p_item->'options') <> 4
    or not (p_item->'options' ?& array['A', 'B', 'C', 'D']) then
    raise exception 'INVALID_V4_OPTIONS';
  end if;
  if v_correct_option not in ('A', 'B', 'C', 'D') then
    raise exception 'INVALID_V4_CORRECT_OPTION';
  end if;

  select ib.id, ib.editorial_metadata#>>'{import,contentHash}',
    ib.editorial_metadata#>>'{import,approvalEvidence}'
    into v_item_id, v_existing_hash, v_existing_approval
  from public.item_bank ib
  where ib.content_id = v_content_id;

  if found and v_existing_hash = p_content_hash and v_existing_approval = p_approval_evidence then
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
    is_published, version, status, is_active, source_type, source_path, tags,
    editorial_metadata, opec_id, approval_status, pilot_status, bank_version,
    editorial_scope, topic_code, question_type, cognitive_level, source_reference,
    source_locator, source_url
  ) values (
    v_content_id, lower(v_content_id), initcap(replace(p_item->>'topic', '_', ' ')),
    p_item->>'domain', p_item->>'topic', 'cnsc_docente_v4', p_item->>'competency',
    case p_item->>'estimatedDifficulty' when 'low' then 0.25 when 'high' then 0.75 else 0.50 end,
    null, 'multiple_choice', p_item->>'stem', v_correct_option,
    p_item->'explanations'->>v_correct_option, array[p_item->'source'->>'reference'],
    false, 4, 'draft', false, 'v4_editorial', p_source_path,
    array[p_item->>'questionType', p_item->>'cognitiveLevel'], v_metadata,
    nullif(p_item->>'opecId', ''), 'approved', 'not_in_pilot', 'v4',
    p_item->>'scope', p_item->>'topic', p_item->>'questionType',
    p_item->>'cognitiveLevel', p_item->'source'->>'reference', null, null
  )
  on conflict (content_id) do update set
    slug = excluded.slug, title = excluded.title, area = excluded.area,
    subarea = excluded.subarea, exam_type = excluded.exam_type,
    competency = excluded.competency, difficulty = excluded.difficulty,
    target_level = excluded.target_level, item_type = excluded.item_type,
    stem = excluded.stem, correct_option = excluded.correct_option,
    explanation = excluded.explanation, normative_refs = excluded.normative_refs,
    is_published = false, version = excluded.version, status = 'draft',
    is_active = false, source_type = excluded.source_type,
    source_path = excluded.source_path, tags = excluded.tags,
    editorial_metadata = excluded.editorial_metadata, opec_id = excluded.opec_id,
    approval_status = excluded.approval_status, pilot_status = 'not_in_pilot',
    bank_version = excluded.bank_version, editorial_scope = excluded.editorial_scope,
    topic_code = excluded.topic_code, question_type = excluded.question_type,
    cognitive_level = excluded.cognitive_level,
    source_reference = excluded.source_reference, source_locator = excluded.source_locator,
    source_url = excluded.source_url, updated_at = now()
  returning public.item_bank.id into v_item_id;

  delete from public.item_options io where io.item_id = v_item_id;
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

comment on function public.upsert_content_item_v4(jsonb, text, text, text) is
  'Imports an editorially approved V4 item idempotently and leaves it draft/inactive until a separate activation gate.';

commit;
