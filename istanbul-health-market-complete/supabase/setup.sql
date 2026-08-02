-- Запустите этот файл в Supabase SQL Editor ОДИН РАЗ.
create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  category text,
  description text,
  image_url text,
  sale_price numeric(12,2) not null default 0,
  stock integer not null default 0,
  expiry_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.admins enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products" on public.products for select using (is_active = true or exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products" on public.products for insert with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products" on public.products for update using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products" on public.products for delete using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- bucket для фотографий
insert into storage.buckets (id, name, public) values ('product-images','product-images',true) on conflict (id) do update set public = true;

drop policy if exists "Public image read" on storage.objects;
create policy "Public image read" on storage.objects for select using (bucket_id = 'product-images');

drop policy if exists "Admin image upload" on storage.objects;
create policy "Admin image upload" on storage.objects for insert with check (bucket_id = 'product-images' and exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "Admin image update" on storage.objects;
create policy "Admin image update" on storage.objects for update using (bucket_id = 'product-images' and exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "Admin image delete" on storage.objects;
create policy "Admin image delete" on storage.objects for delete using (bucket_id = 'product-images' and exists (select 1 from public.admins a where a.user_id = auth.uid()));
