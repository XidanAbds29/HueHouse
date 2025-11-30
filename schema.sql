-- Create Products Table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  price numeric not null,
  category text,
  image_url text,
  images text[], -- New: Multiple images
  description text,
  stock_status text default 'in_stock' check (stock_status in ('in_stock', 'out_of_stock'))
);

-- Migration to add images column if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'images') then
    alter table products add column images text[];
  end if;
end $$;

-- Create Orders Table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_name text not null,
  phone text not null,
  address text not null,
  total_amount numeric not null,
  status text default 'pending' check (status in ('pending', 'processed', 'deleted')),
  items_json jsonb,
  courier_status text default 'pending' check (courier_status in ('pending', 'booked', 'failed')),
  tracking_id text
);

-- Enable Row Level Security (RLS)
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Create Policies
-- Allow public read access to products
create policy "Enable read access for all users" on public.products for select using (true);

-- Allow authenticated users (admin) to insert/update/delete products
-- For this template, we'll allow public insert for demo purposes if you want to test without auth, 
-- BUT for production, you should restrict this. 
-- For now, let's allow public insert to make the Admin Dashboard work without complex auth setup for the demo.
create policy "Enable insert for all users" on public.products for insert with check (true);
create policy "Enable update for all users" on public.products for update using (true);
create policy "Enable delete for all users" on public.products for delete using (true);

-- Allow public insert for orders (Checkout)
create policy "Enable insert for all users" on public.orders for insert with check (true);

-- Allow public read/update for orders (Admin Dashboard)
create policy "Enable read access for all users" on public.orders for select using (true);
create policy "Enable update for all users" on public.orders for update using (true);

-- Create Admins Table
create table public.admins (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text not null unique,
  password text not null
);

-- Enable RLS for Admins
alter table public.admins enable row level security;

-- Allow public read access to admins (for login check)
-- In a real app, you'd use a secure function, but for this template:
create policy "Enable read access for all users" on public.admins for select using (true);
create policy "Enable insert for all users" on public.admins for insert with check (true);

-- STORAGE SETUP
-- 1. Create the bucket if it doesn't exist, ensure it's public
insert into storage.buckets (id, name, public) 
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- 2. Drop ALL existing policies for this bucket to avoid conflicts/leftovers
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Public Insert" on storage.objects;
drop policy if exists "Public Update" on storage.objects;
drop policy if exists "Public Delete" on storage.objects;

-- 3. Create permissive policies for ALL operations (Select, Insert, Update, Delete)
-- Targeted specifically at the 'product-images' bucket
create policy "Public Access" 
on storage.objects for select 
to public 
using ( bucket_id = 'product-images' );

create policy "Public Insert" 
on storage.objects for insert 
to public 
with check ( bucket_id = 'product-images' );

create policy "Public Update" 
on storage.objects for update 
to public 
using ( bucket_id = 'product-images' );

create policy "Public Delete" 
on storage.objects for delete 
to public 
using ( bucket_id = 'product-images' );
