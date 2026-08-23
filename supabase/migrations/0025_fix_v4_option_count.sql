-- Fixes the V4 option-count guard without changing the importer contract.

begin;

do $$
declare
  v_signature regprocedure := 'public.upsert_content_item_v4(jsonb,text,text,text)'::regprocedure;
  v_definition text;
  v_invalid_expression text := 'jsonb_object_length(p_item->''options'')';
  v_valid_expression text := '(select count(*) from jsonb_object_keys(p_item->''options''))';
begin
  select pg_get_functiondef(v_signature) into v_definition;
  if position(v_invalid_expression in v_definition) = 0 then
    raise exception 'V4_IMPORT_OPTION_COUNT_EXPRESSION_NOT_FOUND';
  end if;

  execute replace(v_definition, v_invalid_expression, v_valid_expression);
end;
$$;

revoke execute on function public.upsert_content_item_v4(jsonb, text, text, text)
  from public, anon, authenticated;
grant execute on function public.upsert_content_item_v4(jsonb, text, text, text)
  to service_role;

comment on function public.upsert_content_item_v4(jsonb, text, text, text) is
  'Imports an approved V4 item idempotently, validates four A-D keys, and keeps it inactive until Canary activation.';

commit;
