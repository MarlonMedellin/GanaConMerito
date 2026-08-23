-- Removes PL/pgSQL ambiguity between the content_id output parameter and column.

begin;

do $$
declare
  v_signature regprocedure := 'public.upsert_content_item_v4(jsonb,text,text,text)'::regprocedure;
  v_definition text;
  v_ambiguous_clause text := 'on conflict (content_id) do update set';
  v_constraint_clause text := 'on conflict on constraint item_bank_content_id_unique do update set';
begin
  select pg_get_functiondef(v_signature) into v_definition;
  if position(v_ambiguous_clause in lower(v_definition)) = 0 then
    raise exception 'V4_IMPORT_CONTENT_ID_CONFLICT_CLAUSE_NOT_FOUND';
  end if;

  execute replace(v_definition, v_ambiguous_clause, v_constraint_clause);
end;
$$;

revoke execute on function public.upsert_content_item_v4(jsonb, text, text, text)
  from public, anon, authenticated;
grant execute on function public.upsert_content_item_v4(jsonb, text, text, text)
  to service_role;

comment on function public.upsert_content_item_v4(jsonb, text, text, text) is
  'Imports approved V4 items idempotently through item_bank_content_id_unique and leaves them inactive before Canary.';

commit;
