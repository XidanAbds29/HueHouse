-- Add user_id to orders (linked to auth.users)
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'user_id') then
    alter table orders add column user_id uuid references auth.users(id);
  end if; 
end $$;

-- Customers Table (Profile)
create table if not exists customers (
  id uuid references auth.users(id) primary key,
  name text,
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table customers enable row level security;

-- Orders Policies (Update existing if needed, or add new)
-- Allow users to view their own orders
create policy "Users can view own orders" on orders for select using (auth.uid() = user_id);

-- Customers Policies
create policy "Users can view own profile" on customers for select using (auth.uid() = id);
create policy "Users can update own profile" on customers for update using (auth.uid() = id);
create policy "Users can insert own profile" on customers for insert with check (auth.uid() = id);
