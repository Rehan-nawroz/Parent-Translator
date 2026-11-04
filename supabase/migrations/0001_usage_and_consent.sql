-- Parent Translator - minimal usage and consent metadata.
-- This database must never contain uploads, filenames, extracted text, prompts, model output,
-- analysis results, or any child/student information.

create table if not exists public.analysis_usage (
  user_id uuid primary key references auth.users (id) on delete cascade,
  used_count integer not null default 0 check (used_count >= 0),
  reserved_count integer not null default 0 check (reserved_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.analysis_usage enable row level security;

-- Quota rows are reachable only through the functions below, which are granted to service_role.
revoke all on table public.analysis_usage from anon, authenticated;

create table if not exists public.user_consents (
  user_id uuid primary key references auth.users (id) on delete cascade,
  terms_version text not null,
  privacy_version text not null,
  accepted_at timestamptz not null default now()
);

alter table public.user_consents enable row level security;
revoke all on table public.user_consents from anon;
grant select, insert on table public.user_consents to authenticated;

drop policy if exists "Users can read their own consent" on public.user_consents;
create policy "Users can read their own consent"
  on public.user_consents
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can record their own consent" on public.user_consents;
create policy "Users can record their own consent"
  on public.user_consents
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create or replace function public.reserve_analysis(p_user_id uuid, p_limit integer)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_used integer;
  v_reserved integer;
  v_remaining integer;
begin
  if p_user_id is null then
    raise exception 'user id is required';
  end if;
  if p_limit is null or p_limit < 1 then
    raise exception 'limit must be a positive integer';
  end if;

  insert into public.analysis_usage (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select used_count, reserved_count
    into v_used, v_reserved
  from public.analysis_usage
  where user_id = p_user_id
  for update;

  v_remaining := greatest(p_limit - v_used - v_reserved, 0);

  if v_remaining = 0 then
    return jsonb_build_object(
      'allowed', false,
      'used', v_used,
      'reserved', v_reserved,
      'remaining', 0
    );
  end if;

  update public.analysis_usage
  set reserved_count = reserved_count + 1,
      updated_at = now()
  where user_id = p_user_id;

  return jsonb_build_object(
    'allowed', true,
    'used', v_used,
    'reserved', v_reserved + 1,
    'remaining', v_remaining - 1
  );
end;
$$;

create or replace function public.finalize_analysis(p_user_id uuid, p_limit integer)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_used integer;
  v_reserved integer;
begin
  if p_user_id is null then
    raise exception 'user id is required';
  end if;
  if p_limit is null or p_limit < 1 then
    raise exception 'limit must be a positive integer';
  end if;

  select used_count, reserved_count
    into v_used, v_reserved
  from public.analysis_usage
  where user_id = p_user_id
  for update;

  if v_used is null then
    raise exception 'usage row is missing';
  end if;

  update public.analysis_usage
  set used_count = used_count + 1,
      reserved_count = greatest(reserved_count - 1, 0),
      updated_at = now()
  where user_id = p_user_id;

  return jsonb_build_object(
    'used', v_used + 1,
    'remaining', greatest(p_limit - (v_used + 1) - greatest(v_reserved - 1, 0), 0)
  );
end;
$$;

create or replace function public.release_analysis(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_user_id is null then
    raise exception 'user id is required';
  end if;

  update public.analysis_usage
  set reserved_count = greatest(reserved_count - 1, 0),
      updated_at = now()
  where user_id = p_user_id;

  return jsonb_build_object('released', true);
end;
$$;

create or replace function public.read_analysis_usage(p_user_id uuid, p_limit integer)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_used integer;
  v_reserved integer;
begin
  if p_user_id is null then
    raise exception 'user id is required';
  end if;
  if p_limit is null or p_limit < 1 then
    raise exception 'limit must be a positive integer';
  end if;

  insert into public.analysis_usage (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select used_count, reserved_count
    into v_used, v_reserved
  from public.analysis_usage
  where user_id = p_user_id;

  return jsonb_build_object(
    'used', v_used,
    'reserved', v_reserved,
    'remaining', greatest(p_limit - v_used - v_reserved, 0)
  );
end;
$$;

revoke all on function public.reserve_analysis(uuid, integer) from public, anon, authenticated;
revoke all on function public.finalize_analysis(uuid, integer) from public, anon, authenticated;
revoke all on function public.release_analysis(uuid) from public, anon, authenticated;
revoke all on function public.read_analysis_usage(uuid, integer) from public, anon, authenticated;

grant execute on function public.reserve_analysis(uuid, integer) to service_role;
grant execute on function public.finalize_analysis(uuid, integer) to service_role;
grant execute on function public.release_analysis(uuid) to service_role;
grant execute on function public.read_analysis_usage(uuid, integer) to service_role;
