begin;

create or replace function public.upsert_content_item(
  p_content_id text,
  p_slug text,
  p_title text,
  p_area text,
  p_subarea text,
  p_exam_type text,
  p_competency text,
  p_difficulty numeric,
  p_target_level text,
  p_item_type text,
  p_stem text,
  p_correct_option text,
  p_explanation text,
  p_normative_refs text[],
  p_is_published boolean,
  p_version integer,
  p_options jsonb
)
returns table(item_id uuid, item_version integer)
language plpgsql
security definer
as $$
declare
  v_item_id uuid;
  v_item_version integer;
  v_option jsonb;
begin
  insert into public.item_bank (
    content_id,
    slug,
    title,
    area,
    subarea,
    exam_type,
    competency,
    difficulty,
    target_level,
    item_type,
    stem,
    correct_option,
    explanation,
    normative_refs,
    is_published,
    version
  ) values (
    p_content_id,
    p_slug,
    p_title,
    p_area,
    p_subarea,
    p_exam_type,
    p_competency,
    p_difficulty,
    p_target_level,
    p_item_type,
    p_stem,
    p_correct_option,
    p_explanation,
    p_normative_refs,
    p_is_published,
    p_version
  )
  on conflict (slug)
  do update set
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
    is_published = excluded.is_published,
    version = excluded.version,
    updated_at = now()
  returning id, version into v_item_id, v_item_version;

  delete from public.item_options where public.item_options.item_id = v_item_id;

  for v_option in select * from jsonb_array_elements(p_options)
  loop
    insert into public.item_options (item_id, option_key, option_text)
    values (
      v_item_id,
      v_option->>'key',
      v_option->>'text'
    );
  end loop;

  return query
  select v_item_id, v_item_version;
end;
$$;

commit;
