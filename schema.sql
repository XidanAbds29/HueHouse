-- Existing Tables (Idempotent)
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price numeric not null,
  description text,
  image_url text,
  stock_status text default 'in_stock',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  phone text not null,
  address text not null,
  total_amount numeric not null,
  status text default 'pending',
  items_json jsonb not null,
  courier_status text default 'pending',
  tracking_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists admins (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  password text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- NEW: Add user_id to orders (linked to auth.users)
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'user_id') then
    alter table orders add column user_id uuid references auth.users(id);
  end if; 
end $$;

-- NEW: Customers Table (Profile)
create table if not exists customers (
  id uuid references auth.users(id) primary key,
  name text,
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table products enable row level security;
alter table orders enable row level security;
alter table customers enable row level security;

-- Public Access for Products (View)
create policy "Public products view" on products for select using (true);

-- Admin Access (Simulated for now, usually you'd use auth.uid())
-- For this template, we are using a simple 'admins' table for the dashboard login,
-- but Supabase Auth for customers.
-- We will allow public insert for orders (guest checkout) and authenticated select for own orders.

-- Orders Policies
create policy "Public insert orders" on orders for insert with check (true);
create policy "Users can view own orders" on orders for select using (auth.uid() = user_id);

-- Customers Policies
create policy "Users can view own profile" on customers for select using (auth.uid() = id);
create policy "Users can update own profile" on customers for update using (auth.uid() = id);
create policy "Users can insert own profile" on customers for insert with check (auth.uid() = id);

-- Storage (Existing)
insert into storage.buckets (id, name, public) 
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public Access" on storage.objects for select using ( bucket_id = 'product-images' );
create policy "Public Insert" on storage.objects for insert with check ( bucket_id = 'product-images' );
