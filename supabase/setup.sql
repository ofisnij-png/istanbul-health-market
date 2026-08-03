create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12,2) not null default 0,
  currency text not null default '₽',
  category text,
  stock integer not null default 0,
  expiry_date date,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Public can view active products"
on public.products for select
to anon, authenticated
using (is_active = true or auth.role() = 'authenticated');

create policy "Authenticated can insert products"
on public.products for insert
to authenticated
with check (true);

create policy "Authenticated can update products"
on public.products for update
to authenticated
using (true)
with check (true);

create policy "Authenticated can delete products"
on public.products for delete
to authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('product-images','product-images',true)
on conflict (id) do nothing;

create policy "Public can view product images"
on storage.objects for select
to public
using (bucket_id = 'product-images');

create policy "Authenticated can upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images');

create policy "Authenticated can delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images');
