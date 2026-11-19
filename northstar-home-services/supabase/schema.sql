create extension if not exists pgcrypto;
create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text, role text not null default 'customer' check (role in ('admin','staff','customer')), created_at timestamptz not null default now());
create table if not exists public.services (id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, description text, active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.leads (id uuid primary key default gen_random_uuid(), full_name text not null, email text not null, phone text, service text not null, project_type text, project_size text, zip_code text, details text, status text not null default 'new' check (status in ('new','contacted','quoted','won','closed')), created_at timestamptz not null default now());
create table if not exists public.estimates (id uuid primary key default gen_random_uuid(), lead_id uuid references public.leads(id) on delete set null, estimate_min numeric, estimate_max numeric, currency text not null default 'USD', notes text, status text not null default 'draft', created_at timestamptz not null default now());
create table if not exists public.customers (id uuid primary key default gen_random_uuid(), full_name text not null, email text, phone text, address text, zip_code text, created_at timestamptz not null default now());
create table if not exists public.appointments (id uuid primary key default gen_random_uuid(), customer_id uuid references public.customers(id) on delete set null, lead_id uuid references public.leads(id) on delete set null, service text not null, scheduled_at timestamptz not null, duration_minutes int not null default 60, status text not null default 'requested' check(status in ('requested','confirmed','rescheduled','completed','cancelled')), notes text, created_at timestamptz not null default now());
create table if not exists public.projects (id uuid primary key default gen_random_uuid(), title text not null, slug text unique, category text, location text, summary text, featured boolean not null default false, published boolean not null default false, created_at timestamptz not null default now());
create table if not exists public.project_images (id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade, image_url text not null, image_type text not null check(image_type in ('before','after','gallery')), alt_text text, sort_order int not null default 0);
create table if not exists public.reviews (id uuid primary key default gen_random_uuid(), customer_name text not null, service text, rating int not null check(rating between 1 and 5), review_text text not null, verified boolean not null default false, published boolean not null default false, created_at timestamptz not null default now());
create table if not exists public.service_areas (id uuid primary key default gen_random_uuid(), city text not null, state text not null default 'TX', zip_codes text[] not null default '{}', active boolean not null default true);
create table if not exists public.pricing_rules (id uuid primary key default gen_random_uuid(), service_slug text not null, project_type text, size_label text, min_price numeric, max_price numeric, currency text not null default 'USD', active boolean not null default true, updated_at timestamptz not null default now());
create table if not exists public.messages (id uuid primary key default gen_random_uuid(), lead_id uuid references public.leads(id) on delete set null, sender_name text, sender_email text, message text not null, read_at timestamptz, created_at timestamptz not null default now());
create table if not exists public.site_settings (key text primary key, value jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table if not exists public.notifications (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade, title text not null, body text, read_at timestamptz, created_at timestamptz not null default now());

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.leads enable row level security;
alter table public.estimates enable row level security;
alter table public.customers enable row level security;
alter table public.appointments enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.reviews enable row level security;
alter table public.service_areas enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.messages enable row level security;
alter table public.site_settings enable row level security;
alter table public.notifications enable row level security;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role in ('admin','staff')); $$;
-- Public reads only published marketing content.
create policy "Public can read active services" on public.services for select using(active);
create policy "Public can read published projects" on public.projects for select using(published);
create policy "Public can read images for published projects" on public.project_images for select using(exists(select 1 from public.projects p where p.id=project_id and p.published));
create policy "Public can read published reviews" on public.reviews for select using(published);
create policy "Public can read active service areas" on public.service_areas for select using(active);
create policy "Public can read active pricing rules" on public.pricing_rules for select using(active);
-- Visitors can submit a lead but cannot read, update or delete leads.
create policy "Anyone can submit a lead" on public.leads for insert with check(length(trim(full_name))>1 and length(trim(email))>4);
-- Staff/admin policies for operational data.
create policy "Admins manage profiles" on public.profiles for all using(id=auth.uid() or public.is_admin()) with check(id=auth.uid() or public.is_admin());
create policy "Admins manage services" on public.services for all using(public.is_admin()) with check(public.is_admin());
create policy "Admins manage leads" on public.leads for select using(public.is_admin());
create policy "Admins update leads" on public.leads for update using(public.is_admin()) with check(public.is_admin());
create policy "Admins delete leads" on public.leads for delete using(public.is_admin());
create policy "Admins manage estimates" on public.estimates for all using(public.is_admin()) with check(public.is_admin());
create policy "Admins manage customers" on public.customers for all using(public.is_admin()) with check(public.is_admin());
create policy "Admins manage appointments" on public.appointments for all using(public.is_admin()) with check(public.is_admin());
create policy "Admins manage projects" on public.projects for all using(public.is_admin()) with check(public.is_admin());
create policy "Admins manage project images" on public.project_images for all using(public.is_admin()) with check(public.is_admin());
create policy "Admins manage reviews" on public.reviews for all using(public.is_admin()) with check(public.is_admin());
create policy "Admins manage service areas" on public.service_areas for all using(public.is_admin()) with check(public.is_admin());
create policy "Admins manage pricing" on public.pricing_rules for all using(public.is_admin()) with check(public.is_admin());
create policy "Admins manage messages" on public.messages for all using(public.is_admin()) with check(public.is_admin());
create policy "Admins manage settings" on public.site_settings for all using(public.is_admin()) with check(public.is_admin());
create policy "Users read own notifications" on public.notifications for select using(user_id=auth.uid() or public.is_admin());
create policy "Admins manage notifications" on public.notifications for all using(public.is_admin()) with check(public.is_admin());

insert into public.services(slug,name,description) values
('remodeling','Home Remodeling','Kitchen, bathroom and whole-home improvements'),('plumbing','Plumbing','Repairs, fixtures and plumbing service'),('electrical','Electrical','Home electrical repairs and upgrades'),('roofing','Roofing','Inspections, repairs and replacement estimates'),('hvac','Heating & Cooling','HVAC diagnostics and maintenance'),('cleaning','Home Cleaning','Recurring, deep and move-in/move-out cleaning') on conflict(slug) do nothing;
