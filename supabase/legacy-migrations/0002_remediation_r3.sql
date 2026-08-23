begin;

alter table public.sessions
  add column if not exists updated_at timestamptz not null default now();

alter table public.session_turns
  add column if not exists updated_at timestamptz not null default now();

alter table public.user_skill_snapshots
  add column if not exists updated_at timestamptz not null default now();

alter table public.evaluation_events
  add column if not exists updated_at timestamptz not null default now();

alter table public.item_bank
  add column if not exists content_id text;

update public.item_bank
set content_id = coalesce(content_id, slug)
where content_id is null;

alter table public.item_bank
  alter column content_id set not null;

alter table public.item_bank
  add constraint item_bank_content_id_unique unique (content_id);

alter table public.learning_profiles
  add constraint learning_profiles_target_role_check
  check (target_role in ('docente'));

alter table public.learning_profiles
  add constraint learning_profiles_exam_type_check
  check (exam_type in ('docente'));

create trigger trg_sessions_updated_at
before update on public.sessions
for each row
execute function public.set_updated_at();

create trigger trg_session_turns_updated_at
before update on public.session_turns
for each row
execute function public.set_updated_at();

create trigger trg_user_skill_snapshots_updated_at
before update on public.user_skill_snapshots
for each row
execute function public.set_updated_at();

create trigger trg_evaluation_events_updated_at
before update on public.evaluation_events
for each row
execute function public.set_updated_at();

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
  returning id, version into v_item_id, item_version;

  delete from public.item_options where item_id = v_item_id;

  for v_option in select * from jsonb_array_elements(p_options)
  loop
    insert into public.item_options (item_id, option_key, option_text)
    values (
      v_item_id,
      v_option->>'key',
      v_option->>'text'
    );
  end loop;

  item_id := v_item_id;
  return next;
end;
$$;

commit;
