-- Uses the existing governed source_type catalog; bank_version carries V4 identity.

begin;

do $$
declare
  v_signature regprocedure := 'public.upsert_content_item_v4(jsonb,text,text,text)'::regprocedure;
  v_definition text;
  v_incompatible_value text := '''v4_editorial''';
  v_compatible_value text := '''import''';
begin
  select pg_get_functiondef(v_signature) into v_definition;
  if position(v_incompatible_value in v_definition) = 0 then
    raise exception 'V4_IMPORT_SOURCE_TYPE_EXPRESSION_NOT_FOUND';
  end if;

  execute replace(v_definition, v_incompatible_value, v_compatible_value);
end;
$$;

revoke execute on function public.upsert_content_item_v4(jsonb, text, text, text)
  from public, anon, authenticated;
grant execute on function public.upsert_content_item_v4(jsonb, text, text, text)
  to service_role;

comment on function public.upsert_content_item_v4(jsonb, text, text, text) is
  'Imports approved V4 items with source_type=import, bank_version=v4, full traceability, and inactive Canary state.';

commit;
