create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('user', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'alert_type') then
    create type public.alert_type as enum ('sos', 'medical', 'accident', 'tow');
  end if;

  if not exists (select 1 from pg_type where typname = 'alert_status') then
    create type public.alert_status as enum ('open', 'resolved');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'user') = 'admin';
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  phone text not null default '',
  role public.app_role not null default 'user',
  password_hash text,
  is_blocked boolean not null default false,
  failed_attempts int not null default 0,
  blocked_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Secure Password Recovery
create table if not exists public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- Fintech-Grade Auth Logging
create table if not exists public.auth_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  event_type text not null, -- 'login_success', 'login_fail', 'otp_request', 'otp_verify'
  ip_address text,
  user_agent text,
  device_info jsonb,
  status text not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- OTP Management
create table if not exists public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  mobile text not null,
  code text not null,
  purpose text not null default 'auth', -- 'auth', 'reset'
  expires_at timestamptz not null,
  verified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_auth_logs_user_id on public.auth_logs(user_id);
create index if not exists idx_otp_codes_mobile on public.otp_codes(mobile);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  vehicle_number text not null,
  vehicle_type text not null default 'Car',
  owner_name text not null,
  owner_phone text not null,
  emergency_contact text not null,
  medical_info text,
  qr_slug text not null unique,
  qr_code_path text,
  qr_code_public_url text,
  is_public boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(user_id, vehicle_number)
);

create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  user_agent text not null default 'Unknown',
  city text,
  region text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  alert_type public.alert_type not null default 'sos',
  message text,
  status public.alert_status not null default 'open',
  city text,
  region text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_vehicles_user_id on public.vehicles(user_id);
create index if not exists idx_vehicles_qr_slug on public.vehicles(qr_slug);
create index if not exists idx_scans_vehicle_id on public.scans(vehicle_id);
create index if not exists idx_scans_created_at on public.scans(created_at desc);
create index if not exists idx_alerts_vehicle_id on public.alerts(vehicle_id);
create index if not exists idx_alerts_created_at on public.alerts(created_at desc);

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row
execute procedure public.set_updated_at();

drop trigger if exists vehicles_set_updated_at on public.vehicles;
create trigger vehicles_set_updated_at
before update on public.vehicles
for each row
execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    case
      when coalesce(new.raw_user_meta_data ->> 'role', 'user') = 'admin' then 'admin'::public.app_role
      else 'user'::public.app_role
    end
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    phone = excluded.phone;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

alter table public.users enable row level security;
alter table public.vehicles enable row level security;
alter table public.scans enable row level security;
alter table public.alerts enable row level security;

drop policy if exists "users_select_self_or_admin" on public.users;
create policy "users_select_self_or_admin"
on public.users
for select
using (auth.uid() = id or public.is_admin());

drop policy if exists "users_update_self_or_admin" on public.users;
create policy "users_update_self_or_admin"
on public.users
for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists "users_insert_self_or_admin" on public.users;
create policy "users_insert_self_or_admin"
on public.users
for insert
with check (auth.uid() = id or public.is_admin());

drop policy if exists "vehicles_select_owner_admin_or_public" on public.vehicles;
create policy "vehicles_select_owner_admin_or_public"
on public.vehicles
for select
using (is_public or user_id = auth.uid() or public.is_admin());

drop policy if exists "vehicles_insert_owner_or_admin" on public.vehicles;
create policy "vehicles_insert_owner_or_admin"
on public.vehicles
for insert
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "vehicles_update_owner_or_admin" on public.vehicles;
create policy "vehicles_update_owner_or_admin"
on public.vehicles
for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "vehicles_delete_owner_or_admin" on public.vehicles;
create policy "vehicles_delete_owner_or_admin"
on public.vehicles
for delete
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "scans_select_owner_or_admin" on public.scans;
create policy "scans_select_owner_or_admin"
on public.scans
for select
using (
  exists (
    select 1
    from public.vehicles v
    where v.id = vehicle_id
      and (v.user_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "scans_insert_public_vehicle" on public.scans;
create policy "scans_insert_public_vehicle"
on public.scans
for insert
with check (
  exists (
    select 1
    from public.vehicles v
    where v.id = vehicle_id
      and v.is_public = true
  )
);

drop policy if exists "alerts_select_owner_or_admin" on public.alerts;
create policy "alerts_select_owner_or_admin"
on public.alerts
for select
using (
  exists (
    select 1
    from public.vehicles v
    where v.id = vehicle_id
      and (v.user_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "alerts_insert_public_vehicle" on public.alerts;
create policy "alerts_insert_public_vehicle"
on public.alerts
for insert
with check (
  exists (
    select 1
    from public.vehicles v
    where v.id = vehicle_id
      and v.is_public = true
  )
);

insert into storage.buckets (id, name, public)
values ('vehicle-qr', 'vehicle-qr', true)
on conflict (id) do nothing;

drop policy if exists "vehicle_qr_public_read" on storage.objects;
create policy "vehicle_qr_public_read"
on storage.objects
for select
using (bucket_id = 'vehicle-qr');
