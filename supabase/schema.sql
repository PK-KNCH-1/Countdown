-- Countdown sync storage.
-- Data is reachable only through the two functions below, and only with a private
-- link key. The tables themselves are closed to the public API.

create table if not exists public.cd_vaults (
  id text primary key,                 -- sha256 of the private link key
  created_at timestamptz not null default now(),
  label text
);

create sequence if not exists public.cd_records_seq;

create table if not exists public.cd_records (
  vault text not null references public.cd_vaults(id) on delete cascade,
  k text not null,                     -- record key, e.g. p/phys_p4_2023_ON_2
  v jsonb,                             -- null means deleted
  u bigint not null,                   -- device timestamp (ms); newest wins
  seq bigint not null default nextval('public.cd_records_seq'),
  primary key (vault, k)
);
create index if not exists cd_records_vault_seq on public.cd_records (vault, seq);

alter table public.cd_vaults enable row level security;
alter table public.cd_records enable row level security;
revoke all on public.cd_vaults from anon, authenticated;
revoke all on public.cd_records from anon, authenticated;
revoke all on sequence public.cd_records_seq from anon, authenticated;

create or replace function public.cd_vault_id(p_secret text)
returns text language sql immutable set search_path = public, extensions as $$
  select encode(sha256(convert_to(p_secret, 'UTF8')), 'hex')
$$;

create or replace function public.cd_pull(p_secret text, p_since bigint default 0)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare
  vid text := public.cd_vault_id(coalesce(p_secret, ''));
  res jsonb;
begin
  if length(coalesce(p_secret, '')) < 24 or not exists (select 1 from public.cd_vaults where id = vid) then
    raise exception 'unknown_vault' using errcode = 'P0001';
  end if;
  select jsonb_build_object(
           'rows', coalesce(jsonb_agg(jsonb_build_object('k', r.k, 'v', r.v, 'u', r.u, 's', r.seq) order by r.seq), '[]'::jsonb),
           'max', coalesce(max(r.seq), coalesce(p_since, 0)))
    into res
    from public.cd_records r
   where r.vault = vid and r.seq > coalesce(p_since, 0);
  return res;
end $$;

create or replace function public.cd_push(p_secret text, p_rows jsonb)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare
  vid text := public.cd_vault_id(coalesce(p_secret, ''));
  n int;
begin
  if length(coalesce(p_secret, '')) < 24 or not exists (select 1 from public.cd_vaults where id = vid) then
    raise exception 'unknown_vault' using errcode = 'P0001';
  end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 1000 then
    raise exception 'bad_rows' using errcode = 'P0001';
  end if;
  -- One writer at a time per vault, so pull cursors never skip a row.
  perform pg_advisory_xact_lock(hashtext(vid));
  insert into public.cd_records as t (vault, k, v, u)
  select vid,
         x->>'k',
         case when x->'v' is null or x->'v' = 'null'::jsonb then null else x->'v' end,
         (x->>'u')::bigint
    from jsonb_array_elements(p_rows) x
   where length(x->>'k') between 3 and 120
     and coalesce(pg_column_size(x->'v'), 0) < 16000
  on conflict (vault, k) do update
     set v = excluded.v, u = excluded.u, seq = nextval('public.cd_records_seq')
   where t.u < excluded.u;
  get diagnostics n = row_count;
  return jsonb_build_object('applied', n);
end $$;

-- Lightweight call used by the weekly keep-alive job.
create or replace function public.cd_ping()
returns text language sql stable security definer set search_path = public as $$
  select 'ok'::text where exists (select 1 from public.cd_vaults limit 1)
$$;

revoke all on function public.cd_vault_id(text) from public, anon, authenticated;
revoke all on function public.cd_pull(text, bigint) from public;
revoke all on function public.cd_push(text, jsonb) from public;
revoke all on function public.cd_ping() from public;
grant execute on function public.cd_pull(text, bigint) to anon, authenticated;
grant execute on function public.cd_push(text, jsonb) to anon, authenticated;
grant execute on function public.cd_ping() to anon, authenticated;
