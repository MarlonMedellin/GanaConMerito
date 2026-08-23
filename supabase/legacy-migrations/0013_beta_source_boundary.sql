-- 0013_beta_source_boundary.sql
-- Makes beta eligibility depend on a traceable source path.

begin;

drop function if exists public.upsert_content_item(
  text, text, text, text, text, text, text, numeric, text, text,
  text, text, text, text[], boolean, integer, jsonb
);

create or replace function public.upsert_content_item(
  p_content_id text, p_slug text, p_title text, p_area text, p_subarea text,
  p_exam_type text, p_competency text, p_difficulty numeric, p_target_level text,
  p_item_type text, p_stem text, p_correct_option text, p_explanation text,
  p_normative_refs text[], p_is_published boolean, p_version integer,
  p_options jsonb, p_source_path text default null
)
returns table(item_id uuid, item_version integer)
language plpgsql security definer
as $$
declare
  v_item_id uuid;
  v_item_version integer;
  v_option jsonb;
begin
  insert into public.item_bank (
    content_id, slug, title, area, subarea, exam_type, competency, difficulty,
    target_level, item_type, stem, correct_option, explanation, normative_refs,
    is_published, version, source_path, status, is_active
  ) values (
    p_content_id, p_slug, p_title, p_area, p_subarea, p_exam_type, p_competency,
    p_difficulty, p_target_level, p_item_type, p_stem, p_correct_option, p_explanation,
    p_normative_refs, p_is_published, p_version, p_source_path,
    case when p_is_published then 'published' else 'draft' end, true
  )
  on conflict (slug) do update set
    content_id = excluded.content_id, title = excluded.title, area = excluded.area,
    subarea = excluded.subarea, exam_type = excluded.exam_type,
    competency = excluded.competency, difficulty = excluded.difficulty,
    target_level = excluded.target_level, item_type = excluded.item_type,
    stem = excluded.stem, correct_option = excluded.correct_option,
    explanation = excluded.explanation, normative_refs = excluded.normative_refs,
    is_published = excluded.is_published, version = excluded.version,
    source_path = excluded.source_path, status = excluded.status,
    is_active = excluded.is_active, updated_at = now()
  returning id, version into v_item_id, v_item_version;

  delete from public.item_options where item_id = v_item_id;
  for v_option in select * from jsonb_array_elements(p_options)
  loop
    insert into public.item_options (item_id, option_key, option_text)
    values (v_item_id, v_option->>'key', v_option->>'text');
  end loop;

  return query select v_item_id, v_item_version;
end;
$$;

update public.item_bank
set is_active = false
where source_path is null
   or source_path not like 'content/items/beta-v1/%';

drop view if exists public.v_item_bank_active cascade;
create view public.v_item_bank_active with (security_invoker = true) as
select ib.id, ib.content_id, ib.slug, ib.title, ib.area, ib.subarea, ib.competency,
  ib.exam_type, ib.item_type, ib.difficulty, ib.stem, ib.correct_option, ib.explanation,
  ib.version, ib.status, ib.is_active, ib.source_type, ib.source_path, ib.tags,
  ib.created_at, ib.updated_at, ib.thematic_nucleus_id,
  tn.code as thematic_nucleus_code, tn.name as thematic_nucleus_name,
  tn.is_universal as thematic_nucleus_is_universal,
  coalesce(tn.is_active, false) as thematic_nucleus_is_active,
  null::text as classification_bucket, null::text as classification_reason,
  false as is_legacy, false as is_blocked, 'active'::text as read_state
from public.item_bank ib
left join public.thematic_nuclei tn on tn.id = ib.thematic_nucleus_id
where ib.source_path like 'content/items/beta-v1/%'
  and ib.status = 'published' and ib.is_active = true
  and ib.thematic_nucleus_id is not null and coalesce(tn.is_active, false) = true;

grant select on public.v_item_bank_active to authenticated, service_role;
commit;
