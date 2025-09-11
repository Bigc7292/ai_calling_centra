
-- Create a schema for your application
create schema app;

-- Create tables
create table app.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default now()
);

create table public.users (
  id uuid primary key references auth.users(id),
  email text unique not null,
  created_at timestamp with time zone default now()
);

create table app.tenant_members (
  tenant_id uuid references app.tenants(id),
  user_id uuid references public.users(id),
  role text not null default 'MEMBER', -- OWNER, ADMIN, MEMBER
  primary key (tenant_id, user_id)
);

create table public.profiles (
  user_id uuid primary key references public.users(id),
  default_tenant_id uuid references app.tenants(id),
  created_at timestamp with time zone default now()
);

create table app.contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references app.tenants(id),
  name text not null,
  phone text not null,
  email text,
  created_at timestamp with time zone default now()
);

create table app.subscriptions (
  id text primary key, -- Stripe Subscription ID
  tenant_id uuid references app.tenants(id),
  stripe_customer_id text not null,
  status text not null,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  price_id text,
  created_at timestamp with time zone default now()
);

create type app.entitlement_type as enum ('platform_plan', 'minutes_bundle', 'overage', 'free_trial');

create table app.entitlements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references app.tenants(id),
  type app.entitlement_type not null,
  value text not null, -- e.g., '200_monthly', '1000_weekly', '500'
  expires_at timestamp with time zone,
  granted_at timestamp with time zone default now()
);

-- RLS helpers
create function public.is_member(tenant_id uuid)
returns boolean
language plpgsql
security definer set search_path = public
as $$
begin
  return exists(select 1 from app.tenant_members where tenant_id = is_member.tenant_id and user_id = auth.uid());
end;
$$;

-- Enable RLS on tables
alter table app.tenants enable row level security;
alter table public.users enable row level security;
alter table app.tenant_members enable row level security;
alter table public.profiles enable row level security;
alter table app.contacts enable row level security;
alter table app.subscriptions enable row level security;
alter table app.entitlements enable row level security;

-- Policies for app.tenants
create policy "Tenants can be viewed by members"
on app.tenants for select
using (public.is_member(id));

create policy "Tenants can be inserted by authenticated users"
on app.tenants for insert
with check (auth.role() = 'authenticated');

-- Policies for public.users
create policy "Users can view their own data"
on public.users for select
using (id = auth.uid());

-- Policies for app.tenant_members
create policy "Tenant members can be viewed by members of the tenant"
on app.tenant_members for select
using (public.is_member(tenant_id));

create policy "Tenant members can be inserted by owners"
on app.tenant_members for insert
with check (public.is_member(tenant_id) and auth.role() = 'authenticated'); -- Simplified for now

-- Policies for public.profiles
create policy "Profiles can be viewed by their owner"
on public.profiles for select
using (user_id = auth.uid());

create policy "Profiles can be updated by their owner"
on public.profiles for update
using (user_id = auth.uid());

create policy "Profiles can be inserted by authenticated users"
on public.profiles for insert
with check (auth.uid() = user_id);

-- Policies for app.contacts
create policy "Contacts can be viewed by tenant members"
on app.contacts for select
using (public.is_member(tenant_id));

create policy "Contacts can be inserted by tenant members"
on app.contacts for insert
with check (public.is_member(tenant_id));

create policy "Contacts can be updated by tenant members"
on app.contacts for update
using (public.is_member(tenant_id));

create policy "Contacts can be deleted by tenant members"
on app.contacts for delete
using (public.is_member(tenant_id));

-- Policies for app.subscriptions
create policy "Subscriptions can be viewed by tenant members"
on app.subscriptions for select
using (public.is_member(tenant_id));

-- Policies for app.entitlements
create policy "Entitlements can be viewed by tenant members"
on app.entitlements for select
using (public.is_member(tenant_id));
