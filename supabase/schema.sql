-- Minimal subset so local app can run. You can expand later.
create extension if not exists pgcrypto;

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  settings jsonb not null default '{}',
  created_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key, -- equals auth.users.id
  email text not null unique,
  created_at timestamptz default now()
);

create table if not exists tenant_members (
  tenant_id uuid references tenants(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text check (role in ('OWNER','ADMIN','AGENT')) not null,
  primary key (tenant_id, user_id)
);

create table if not exists profiles (
  user_id uuid primary key references users(id) on delete cascade,
  default_tenant_id uuid references tenants(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Optional contacts to unblock UI later
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  phone_e164 text not null,
  full_name text,
  email text,
  created_at timestamptz default now()
);

-- RLS ON + helper
alter table tenants enable row level security;
alter table users enable row level security;
alter table tenant_members enable row level security;
alter table profiles enable row level security;
alter table contacts enable row level security;

create or replace function is_member(tenant uuid)
returns boolean language sql stable as $$
  select exists (select 1 from tenant_members tm where tm.tenant_id = tenant and tm.user_id = auth.uid());
$$;

create policy tenants_sel on tenants for select using (is_member(id));
create policy tenant_members_sel on tenant_members for select using (is_member(tenant_id));
create policy profiles_sel on profiles for select using (auth.uid() = user_id);
create policy contacts_rw on contacts for all using (is_member(tenant_id)) with check (is_member(tenant_id));
