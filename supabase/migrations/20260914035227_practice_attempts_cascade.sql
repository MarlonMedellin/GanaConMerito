begin;

alter table public.practice_attempts
  drop constraint if exists practice_attempts_profile_id_fkey,
  add constraint practice_attempts_profile_id_fkey
    foreign key (profile_id) references public.profiles(id) on delete cascade;

alter table public.practice_attempts
  drop constraint if exists practice_attempts_session_id_profile_id_fkey,
  add constraint practice_attempts_session_id_profile_id_fkey
    foreign key (session_id, profile_id) references public.sessions(id, profile_id) on delete cascade;

commit;
