
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

-- Enum for contact statuses
create type app.contact_status as enum ('hot', 'cold', 'dnc', 'booked', 'escalated');

-- Main contacts table
create table app.contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references app.tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  phone text not null check (phone ~ '^\+[1-9]\d{1,14}$'), -- E.164 strict
  email text,
  name_hash text, -- Keccak256 from client-side
  email_hash text,
  status app.contact_status default 'cold',
  tags jsonb default '{}'::jsonb, -- e.g., {"industry": "real_estate", "sentiment": 8}
  metadata jsonb, -- e.g., {"source": "twitter", "ip_geo": "NYC"}
  call_logs jsonb[] default '{}', -- [{ts: ISO, duration: 120, outcome: "booked", assistant_id: "gemini-1.5"}]
  transcript text, -- Encrypted via pg_crypto (client key)
  recording_url text, -- GCS signed URL with 7d TTL
  dnc_scrubbed_at timestamp,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Performance indexes
create index concurrently idx_contacts_tenant_status on app.contacts(tenant_id, status);
create index concurrently idx_contacts_phone_hash on app.contacts(phone, name_hash);
create index concurrently idx_contacts_tags_gin on app.contacts using gin(tags);

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

-- Edge Function Trigger: Auto-tag post-insert (triggered by VAPI webhook)
create or replace function app.analyze_transcript()
returns trigger as $$
begin
  -- This is a placeholder for an async call to a Supabase Edge Function
  -- The Edge Function will then call the Gemini API for analysis.
  -- The actual HTTP call should not be in a trigger for performance reasons.
  -- For now, we'll just log that it's been triggered.
  -- Example of what the edge function would do:
  -- PERFORM net.http_post(
  --   url := 'YOUR_EDGE_FUNCTION_URL/analyze-transcript',
  --   body := jsonb_build_object('contact_id', NEW.id, 'transcript', NEW.transcript)
  -- );
  return new;
end;
$$ language plpgsql;

create trigger trig_analyze_after_insert
after insert or update of transcript on app.contacts
for each row execute function app.analyze_transcript();

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
create policy "Users can manage their own contacts within a tenant"
on app.contacts for all
using (public.is_member(tenant_id) and auth.uid() = user_id)
with check (public.is_member(tenant_id) and auth.uid() = user_id);

create policy "Admins and Owners can view all contacts in their tenant"
on app.contacts for select
using (
  public.is_member(tenant_id) and
  (select role from app.tenant_members where user_id = auth.uid() and tenant_id = app.contacts.tenant_id) in ('ADMIN', 'OWNER')
);

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
