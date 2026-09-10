-- 0020_upsert_content_item_v4.sql
-- Adds the V4-only writer without changing the legacy/beta upsert signature.

begin;

create or replace function public.upsert_content_item_v4(
  p_content_id text,
  p_slug text,
  p_title text,
  p_area text,
  p_subarea text,
  p_exam_type text,
  p_competency text,
  p_difficulty numeric,
  p_target_level text,
  p_stem text,
  p_correct_option text,
  p_explanation text,
  p_normative_refs text[],
  p_options jsonb,
  p_source_path text,
  p_editorial_scope text,
  p_topic_code text,
  p_question_type text,
  p_cognitive_level text,
  p_source_reference text,
  p_source_locator text default null,
  p_source_url text default null,
  p_opec_id text default null,
  p_editorial_metadata jsonb default '{}'::jsonb
)
returns table(item_id uuid, item_version integer, bank_version text, approval_status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item_id uuid;
  v_item_version integer;
  v_option_count integer;
  v_option jsonb;
begin
  if p_source_path is null or p_source_path not like 'content/question-bank-v4/%' then
    raise exception 'source_path V4 invalido: %', p_source_path using errcode = '22023';
  end if;

  if p_editorial_scope not in ('general', 'opec_specific') then
    raise exception 'editorial_scope V4 invalido: %', p_editorial_scope using errcode = '22023';
  end if;

  if p_editorial_scope = 'opec_specific' and nullif(p_opec_id, '') is null then
    raise exception 'opec_id es obligatorio para editorial_scope=opec_specific' using errcode = '23514';
  end if;

  if nullif(p_source_reference, '') is null then
    raise exception 'source_reference es obligatorio para V4' using errcode = '23514';
  end if;

  select count(distinct option_row->>'key') into v_option_count
  from jsonb_array_elements(p_options) option_row
  where option_row ? 'key'
    and option_row ? 'text'
    and option_row->>'key' in ('A', 'B', 'C', 'D')
    and nullif(option_row->>'text', '') is not null;

  if v_option_count <> 4 or jsonb_array_length(p_options) <> 4 then
    raise exception 'V4 requiere exactamente cuatro opciones distintas A-D' using errcode = '23514';
  end if;

  insert into public.item_bank (
    content_id, slug, title, area, subarea, exam_type, competency, difficulty,
    target_level, item_type, stem, correct_option, explanation, normative_refs,
    is_published, version, source_type, source_path, status, is_active,
    editorial_metadata, bank_version, editorial_scope, topic_code, question_type,
    cognitive_level, source_reference, source_locator, source_url, opec_id,
    approval_status, pilot_status
  ) values (
    p_content_id, p_slug, p_title, p_area, p_subarea, p_exam_type, p_competency,
    p_difficulty, p_target_level, 'multiple_choice', p_stem, p_correct_option,
    p_explanation, coalesce(p_normative_refs, '{}'::text[]),
    false, 1, 'import', p_source_path, 'draft', false,
    coalesce(p_editorial_metadata, '{}'::jsonb), 'v4', p_editorial_scope,
    p_topic_code, p_question_type, p_cognitive_level, p_source_reference,
    p_source_locator, p_source_url, p_opec_id, 'pending_approval', 'not_in_pilot'
  )
  on conflict (slug) do update set
    content_id = excluded.content_id,
    title = excluded.title,
    area = excluded.area,
    subarea = excluded.subarea,
    exam_type = excluded.exam_type,
    competency = excluded.competency,
    difficulty = excluded.difficulty,
    target_level = excluded.target_level,
    item_type = excluded.item_type,
    stem = excluded.stem,
    correct_option = excluded.correct_option,
    explanation = excluded.explanation,
    normative_refs = excluded.normative_refs,
    is_published = false,
    version = public.item_bank.version + 1,
    source_type = excluded.source_type,
    source_path = excluded.source_path,
    status = 'draft',
    is_active = false,
    editorial_metadata = excluded.editorial_metadata,
    bank_version = 'v4',
    editorial_scope = excluded.editorial_scope,
    topic_code = excluded.topic_code,
    question_type = excluded.question_type,
    cognitive_level = excluded.cognitive_level,
    source_reference = excluded.source_reference,
    source_locator = excluded.source_locator,
    source_url = excluded.source_url,
    opec_id = excluded.opec_id,
    approval_status = 'pending_approval',
    pilot_status = 'not_in_pilot',
    updated_at = now()
  returning id, version into v_item_id, v_item_version;

  delete from public.item_options where public.item_options.item_id = v_item_id;
  for v_option in select * from jsonb_array_elements(p_options)
  loop
    insert into public.item_options (item_id, option_key, option_text)
    values (v_item_id, v_option->>'key', v_option->>'text');
  end loop;

  return query select v_item_id, v_item_version, 'v4'::text, 'pending_approval'::text;
end;
$$;

revoke all on function public.upsert_content_item_v4(
  text, text, text, text, text, text, text, numeric, text, text, text, text,
  text[], jsonb, text, text, text, text, text, text, text, text, text, jsonb
) from public;
grant execute on function public.upsert_content_item_v4(
  text, text, text, text, text, text, text, numeric, text, text, text, text,
  text[], jsonb, text, text, text, text, text, text, text, text, text, jsonb
) to service_role;

commit;
