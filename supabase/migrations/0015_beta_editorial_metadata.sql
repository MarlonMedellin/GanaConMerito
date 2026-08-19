-- 0015_beta_editorial_metadata.sql
-- Persists the editorial contract carried by the new beta JSON items.

begin;

alter table public.item_bank
  add column if not exists editorial_metadata jsonb not null default '{}'::jsonb;

create or replace function public.upsert_content_item(
  p_content_id text, p_slug text, p_title text, p_area text, p_subarea text,
  p_exam_type text, p_competency text, p_difficulty numeric, p_target_level text,
  p_item_type text, p_stem text, p_correct_option text, p_explanation text,
  p_normative_refs text[], p_is_published boolean, p_version integer,
  p_options jsonb, p_source_path text default null,
  p_editorial_metadata jsonb default null
)
returns table(item_id uuid, item_version integer)
language plpgsql security definer
as $$
declare
  v_result record;
begin
  select * into v_result from public.upsert_content_item(
    p_content_id, p_slug, p_title, p_area, p_subarea, p_exam_type, p_competency,
    p_difficulty, p_target_level, p_item_type, p_stem, p_correct_option,
    p_explanation, p_normative_refs, p_is_published, p_version, p_options,
    p_source_path
  );

  update public.item_bank
  set editorial_metadata = coalesce(p_editorial_metadata, '{}'::jsonb), updated_at = now()
  where public.item_bank.id = v_result.item_id;

  return query select v_result.item_id, v_result.item_version;
end;
$$;

drop view if exists public.v_item_bank_active cascade;
create view public.v_item_bank_active with (security_invoker = true) as
select ib.id, ib.content_id, ib.slug, ib.title, ib.area, ib.subarea, ib.competency,
  ib.exam_type, ib.item_type, ib.difficulty, ib.stem, ib.correct_option, ib.explanation,
  ib.version, ib.status, ib.is_active, ib.source_type, ib.source_path, ib.tags,
  ib.editorial_metadata, ib.created_at, ib.updated_at, ib.thematic_nucleus_id,
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
