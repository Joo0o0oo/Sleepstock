
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text,
  avatar_url text,
  bio text check (char_length(bio) <= 280),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- Visibility enum
create type public.post_visibility as enum ('public', 'tagged_only');

-- Dream posts
create table public.dream_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 600),
  visibility public.post_visibility not null default 'public',
  created_at timestamptz not null default now()
);
create index dream_posts_created_at_idx on public.dream_posts (created_at desc);
create index dream_posts_author_idx on public.dream_posts (author_id, created_at desc);
grant select, insert, delete on public.dream_posts to authenticated;
grant all on public.dream_posts to service_role;

-- Mentions
create table public.dream_post_mentions (
  post_id uuid not null references public.dream_posts(id) on delete cascade,
  mentioned_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, mentioned_user_id)
);
create index dream_post_mentions_user_idx on public.dream_post_mentions (mentioned_user_id, created_at desc);
grant select, insert on public.dream_post_mentions to authenticated;
grant all on public.dream_post_mentions to service_role;

-- Likes
create table public.dream_post_likes (
  post_id uuid not null references public.dream_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create index dream_post_likes_post_idx on public.dream_post_likes (post_id);
grant select, insert, delete on public.dream_post_likes to authenticated;
grant all on public.dream_post_likes to service_role;

-- Security definer: is user mentioned in post?
create or replace function public.is_mentioned_in(_post_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.dream_post_mentions
    where post_id = _post_id and mentioned_user_id = _user_id
  );
$$;

-- Security definer: can current user see this post?
create or replace function public.can_view_post(_post_id uuid, _author_id uuid, _visibility public.post_visibility)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    _visibility = 'public'
    or _author_id = auth.uid()
    or public.is_mentioned_in(_post_id, auth.uid());
$$;

alter table public.dream_posts enable row level security;
alter table public.dream_post_mentions enable row level security;
alter table public.dream_post_likes enable row level security;

create policy "posts_select_visible" on public.dream_posts for select using (
  visibility = 'public'
  or author_id = auth.uid()
  or public.is_mentioned_in(id, auth.uid())
);
create policy "posts_insert_own" on public.dream_posts for insert with check (auth.uid() = author_id);
create policy "posts_delete_own" on public.dream_posts for delete using (auth.uid() = author_id);

create policy "mentions_select_visible" on public.dream_post_mentions for select using (
  exists (
    select 1 from public.dream_posts p
    where p.id = post_id
      and (p.visibility = 'public' or p.author_id = auth.uid() or mentioned_user_id = auth.uid())
  )
);
create policy "mentions_insert_own_post" on public.dream_post_mentions for insert with check (
  exists (select 1 from public.dream_posts p where p.id = post_id and p.author_id = auth.uid())
);

create policy "likes_select_all" on public.dream_post_likes for select using (true);
create policy "likes_insert_own" on public.dream_post_likes for insert with check (auth.uid() = user_id);
create policy "likes_delete_own" on public.dream_post_likes for delete using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base text;
  candidate text;
  i int := 0;
begin
  base := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    '[^a-z0-9_]', '', 'g'
  ));
  if base is null or length(base) < 3 then
    base := 'sonador';
  end if;
  candidate := substr(base, 1, 20);
  while exists (select 1 from public.profiles where username = candidate) loop
    i := i + 1;
    candidate := substr(base, 1, 17) || i::text;
  end loop;
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    candidate,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', candidate),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();
