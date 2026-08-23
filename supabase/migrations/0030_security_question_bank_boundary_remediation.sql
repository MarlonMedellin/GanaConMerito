-- 0030_security_question_bank_boundary_remediation.sql
-- Restores the server-only question-bank boundary after effective-schema drift.

begin;

-- Raw question and option storage is answer-bearing. RLS filters rows, not
-- columns, so client roles must not hold any table privilege.
revoke all on table public.item_bank from public, anon, authenticated;
revoke all on table public.item_options from public, anon, authenticated;

-- Legacy/V3 views project answer truth. V4 pre-answer views are safe by
-- projection but remain server-only under the current API contract; the answered
-- view is necessarily server-only.
revoke all on table public.v_item_bank_active from public, anon, authenticated;
revoke all on table public.v_question_bank_v3_pilot from public, anon, authenticated;
revoke all on table public.v_question_bank_v4_active from public, anon, authenticated;
revoke all on table public.v_question_bank_v4_practice from public, anon, authenticated;
revoke all on table public.v_question_bank_v4_answered from public, anon, authenticated;

grant select on table public.item_bank to service_role;
grant select on table public.item_options to service_role;
grant select on table public.v_item_bank_active to service_role;
grant select on table public.v_question_bank_v3_pilot to service_role;
grant select on table public.v_question_bank_v4_active to service_role;
grant select on table public.v_question_bank_v4_practice to service_role;
grant select on table public.v_question_bank_v4_answered to service_role;

-- A server-only table does not need client-facing policies. Drop every policy by
-- catalog identity instead of relying on historical names so remote-only drift is
-- covered as well.
do $policy_cleanup$
declare
  v_policy record;
begin
  for v_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('item_bank', 'item_options')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      v_policy.policyname,
      v_policy.schemaname,
      v_policy.tablename
    );
  end loop;
end;
$policy_cleanup$;

-- Discover every real SECURITY DEFINER overload that reads or mutates the raw
-- question bank. This includes remote-only overloads not represented by the
-- current repository. Revoke client execution and pin a safe search_path.
do $function_hardening$
declare
  v_function record;
begin
  for v_function in
    select p.oid::regprocedure as identity
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and p.prosecdef
      and (
        p.proname in (
          'advance_session_atomic',
          'upsert_content_item',
          'upsert_content_item_v4',
          'import_question_bank_v4_batch',
          'import_question_bank_v4_batch_0028_unbound',
          'question_bank_v4_item_matches'
        )
        or pg_get_functiondef(p.oid) ~* '(item_bank|item_options)'
      )
  loop
    execute format(
      'revoke execute on function %s from public, anon, authenticated',
      v_function.identity
    );
    execute format(
      'alter function %s set search_path = public, pg_temp',
      v_function.identity
    );
  end loop;
end;
$function_hardening$;

-- Preserve server execution for supported RPC names and every real overload of
-- those names. Internal helpers and the renamed unbound batch implementation do
-- not receive a direct grant.
do $service_role_execution$
declare
  v_function record;
begin
  for v_function in
    select p.oid::regprocedure as identity
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and p.prosecdef
      and p.proname in (
        'advance_session_atomic',
        'upsert_content_item',
        'upsert_content_item_v4',
        'import_question_bank_v4_batch'
      )
  loop
    execute format(
      'grant execute on function %s to service_role',
      v_function.identity
    );
  end loop;
end;
$service_role_execution$;

-- Fail the migration atomically if the effective boundary is not closed.
do $boundary_postconditions$
declare
  v_role text;
  v_object regclass;
  v_function record;
begin
  foreach v_role in array array['anon', 'authenticated']
  loop
    foreach v_object in array array[
      'public.item_bank'::regclass,
      'public.item_options'::regclass,
      'public.v_item_bank_active'::regclass,
      'public.v_question_bank_v3_pilot'::regclass,
      'public.v_question_bank_v4_active'::regclass,
      'public.v_question_bank_v4_practice'::regclass,
      'public.v_question_bank_v4_answered'::regclass
    ]
    loop
      if has_table_privilege(v_role, v_object, 'SELECT')
        or has_table_privilege(v_role, v_object, 'INSERT')
        or has_table_privilege(v_role, v_object, 'UPDATE')
        or has_table_privilege(v_role, v_object, 'DELETE')
        or has_table_privilege(v_role, v_object, 'TRUNCATE')
        or has_table_privilege(v_role, v_object, 'REFERENCES')
        or has_table_privilege(v_role, v_object, 'TRIGGER') then
        raise exception 'QUESTION_BANK_CLIENT_TABLE_PRIVILEGE_REMAINS:%:%',
          v_role, v_object::text;
      end if;
    end loop;
  end loop;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename in ('item_bank', 'item_options')
  ) then
    raise exception 'QUESTION_BANK_CLIENT_POLICY_REMAINS';
  end if;

  for v_function in
    select p.oid, p.oid::regprocedure as identity, p.proowner, p.proacl, p.proconfig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and p.prosecdef
      and (
        p.proname in (
          'advance_session_atomic',
          'upsert_content_item',
          'upsert_content_item_v4',
          'import_question_bank_v4_batch',
          'import_question_bank_v4_batch_0028_unbound',
          'question_bank_v4_item_matches'
        )
        or pg_get_functiondef(p.oid) ~* '(item_bank|item_options)'
      )
  loop
    if has_function_privilege('anon', v_function.oid, 'EXECUTE')
      or has_function_privilege('authenticated', v_function.oid, 'EXECUTE')
      or exists (
        select 1
        from aclexplode(coalesce(
          v_function.proacl,
          acldefault('f', v_function.proowner)
        )) acl
        where acl.grantee = 0
          and acl.privilege_type = 'EXECUTE'
      ) then
      raise exception 'QUESTION_BANK_CLIENT_FUNCTION_EXECUTE_REMAINS:%',
        v_function.identity::text;
    end if;

    if not coalesce(
      v_function.proconfig @> array['search_path=public, pg_temp']::text[],
      false
    ) then
      raise exception 'QUESTION_BANK_UNSAFE_FUNCTION_SEARCH_PATH:%',
        v_function.identity::text;
    end if;
  end loop;

  if not has_table_privilege('service_role', 'public.item_bank', 'SELECT')
    or not has_table_privilege('service_role', 'public.item_options', 'SELECT')
    or not has_table_privilege('service_role', 'public.v_question_bank_v4_active', 'SELECT')
    or not has_table_privilege('service_role', 'public.v_question_bank_v4_practice', 'SELECT')
    or not has_table_privilege('service_role', 'public.v_question_bank_v4_answered', 'SELECT') then
    raise exception 'QUESTION_BANK_SERVICE_ROLE_READ_MISSING';
  end if;

  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and p.prosecdef
      and p.proname in (
        'advance_session_atomic',
        'upsert_content_item',
        'upsert_content_item_v4',
        'import_question_bank_v4_batch'
      )
      and not has_function_privilege('service_role', p.oid, 'EXECUTE')
  ) then
    raise exception 'QUESTION_BANK_SERVICE_ROLE_EXECUTE_MISSING';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name in (
        'v_question_bank_v4_active',
        'v_question_bank_v4_practice'
      )
      and column_name in (
        'correct_option',
        'explanation',
        'option_explanations',
        'learning_note'
      )
  ) then
    raise exception 'V4_PREANSWER_RESERVED_COLUMN_EXPOSED';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'v_question_bank_v4_answered'
      and column_name = 'correct_option'
  ) then
    raise exception 'V4_ANSWERED_CONTRACT_MISSING';
  end if;
end;
$boundary_postconditions$;

commit;
