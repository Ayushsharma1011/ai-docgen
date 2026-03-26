-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS (extended profiles)
-- ============================================
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'premium')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- ============================================
-- TOKENS
-- ============================================
create table if not exists public.tokens (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  balance integer not null default 10,
  total_used integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.tokens enable row level security;

drop policy if exists "Users can view own tokens" on public.tokens;
create policy "Users can view own tokens" on public.tokens
  for select using (auth.uid() = user_id);

drop policy if exists "Users can update own tokens" on public.tokens;
create policy "Users can update own tokens" on public.tokens
  for update using (auth.uid() = user_id);

drop policy if exists "Users can insert own tokens" on public.tokens;
create policy "Users can insert own tokens" on public.tokens
  for insert with check (auth.uid() = user_id);

-- ============================================
-- DOCUMENTS
-- ============================================
create table if not exists public.documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null default 'Untitled Document',
  content text not null default '',
  doc_type text not null check (doc_type in ('pdf', 'docx', 'pptx', 'xlsx')),
  tone text not null default 'professional',
  topic text not null default '',
  instructions text not null default '',
  file_url text,
  share_token text unique,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.documents enable row level security;

drop policy if exists "Users can CRUD own documents" on public.documents;
create policy "Users can CRUD own documents" on public.documents
  for all using (auth.uid() = user_id);

drop policy if exists "Public documents are readable by all" on public.documents;
create policy "Public documents are readable by all" on public.documents
  for select using (is_public = true);

-- ============================================
-- DOCUMENT VERSIONS
-- ============================================
create table if not exists public.document_versions (
  id uuid default uuid_generate_v4() primary key,
  document_id uuid references public.documents(id) on delete cascade not null,
  content text not null,
  version_number integer not null default 1,
  created_at timestamptz not null default now()
);

alter table public.document_versions enable row level security;

drop policy if exists "Users can view own document versions" on public.document_versions;
create policy "Users can view own document versions" on public.document_versions
  for select using (
    exists (
      select 1 from public.documents
      where id = document_id and user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own document versions" on public.document_versions;
create policy "Users can insert own document versions" on public.document_versions
  for insert with check (
    exists (
      select 1 from public.documents
      where id = document_id and user_id = auth.uid()
    )
  );

-- ============================================
-- TEMPLATES
-- ============================================
create table if not exists public.templates (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null default '',
  category text not null,
  doc_type text not null check (doc_type in ('pdf', 'docx', 'pptx', 'xlsx')),
  preview_image text,
  prompt_template text not null default '',
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.templates enable row level security;

drop policy if exists "Templates are readable by all authenticated users" on public.templates;
create policy "Templates are readable by all authenticated users" on public.templates
  for select using (auth.uid() is not null);

-- ============================================
-- PAYMENT SUBMISSIONS
-- ============================================
create table if not exists public.payment_submissions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  payment_type text not null check (payment_type in ('plan', 'tokens')),
  plan text check (plan in ('free', 'pro', 'premium')),
  token_amount integer,
  rupee_amount integer not null check (rupee_amount > 0),
  upi_id text not null,
  upi_name text,
  reference_note text,
  admin_note text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payment_submissions
  add column if not exists payment_type text,
  add column if not exists plan text,
  add column if not exists token_amount integer,
  add column if not exists rupee_amount integer,
  add column if not exists upi_id text,
  add column if not exists upi_name text,
  add column if not exists reference_note text,
  add column if not exists admin_note text,
  add column if not exists status text default 'pending',
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.users(id) on delete set null,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.payment_submissions
set status = 'pending'
where status is null;

alter table public.payment_submissions enable row level security;

drop policy if exists "Users can create own payment submissions" on public.payment_submissions;
create policy "Users can create own payment submissions" on public.payment_submissions
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can view own payment submissions" on public.payment_submissions;
create policy "Users can view own payment submissions" on public.payment_submissions
  for select using (auth.uid() = user_id);

-- ============================================
-- AUTO-UPDATE UPDATED_AT TRIGGER
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at before update on public.users
  for each row execute procedure public.handle_updated_at();

drop trigger if exists documents_updated_at on public.documents;
create trigger documents_updated_at before update on public.documents
  for each row execute procedure public.handle_updated_at();

drop trigger if exists tokens_updated_at on public.tokens;
create trigger tokens_updated_at before update on public.tokens
  for each row execute procedure public.handle_updated_at();

drop trigger if exists payment_submissions_updated_at on public.payment_submissions;
create trigger payment_submissions_updated_at before update on public.payment_submissions
  for each row execute procedure public.handle_updated_at();

-- ============================================
-- NEW USER HANDLER
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into public.tokens (user_id, balance) values (new.id, 10);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
