begin;

-- The public website reads one allowlisted snapshot RPC. Everything else is private.
create or replace function public.is_https_link(value text)
returns boolean language sql immutable set search_path = '' as $$
  select coalesce(length(value) <= 2048 and value ~ '^https://[A-Za-z0-9.-]+[.][A-Za-z]{2,}(:443)?([/?#][^[:space:]]*)?$', false);
$$;

create or replace function public.valid_store_links(value jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
declare item jsonb;
begin
  if value is null or jsonb_typeof(value) <> 'array' then return false; end if;
  if jsonb_array_length(value) > 8 then return false; end if;
  for item in select jsonb_array_elements(value) loop
    if jsonb_typeof(item) <> 'object'
      or jsonb_typeof(item->'name') is distinct from 'string'
      or length(trim(item->>'name')) not between 1 and 40
      or jsonb_typeof(item->'url') is distinct from 'string'
      or not public.is_https_link(item->>'url')
      or (item ? 'note' and (jsonb_typeof(item->'note') is distinct from 'string' or length(item->>'note') > 120))
    then return false; end if;
  end loop;
  return true;
end;
$$;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null default '' check (length(title) <= 100),
  slug text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 90),
  description text not null default '' check (length(description) <= 440),
  category text not null default 'Home & living' check (length(trim(category)) between 1 and 40),
  tags text[] not null default '{}' check (cardinality(tags) <= 12 and array_position(tags, null) is null),
  poster_url text not null default '',
  poster_alt text not null default '',
  stores jsonb not null default '[]'::jsonb check (public.valid_store_links(stores)),
  featured boolean not null default false,
  published boolean not null default false,
  publish_to_pinterest boolean not null default false,
  pinterest_board_id text,
  pin_media_type text not null default 'image' check (pin_media_type in ('image', 'video')),
  pin_image_url text,
  video_path text,
  revision integer not null default 1 check (revision > 0),
  ever_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not published or (length(trim(title)) > 0 and length(trim(description)) > 0 and length(trim(poster_alt)) > 0 and public.is_https_link(poster_url) and jsonb_array_length(stores) > 0)),
  check (not publish_to_pinterest or (pinterest_board_id is not null and pinterest_board_id ~ '^[0-9]+$')),
  check (pin_image_url is null or public.is_https_link(pin_image_url)),
  check (not (published and publish_to_pinterest and pin_media_type = 'video') or (video_path is not null and video_path ~ '^[A-Za-z0-9_/-]+[.](mp4|mov|m4v)$' and video_path not like '%..%'))
);
comment on column public.products.stores is 'Array of {"name":"Amazon","url":"YOUR_FULL_AFFILIATE_URL","note":"Optional short note"}. Enter only matching listings, not unrelated alternatives.';
comment on column public.products.slug is 'Generated automatically if blank. Permanent after first publication.';
comment on column public.products.pin_image_url is 'Optional Pinterest image or video cover. Defaults to poster_url. Existing Pins are never overwritten when you change the website poster.';
comment on column public.products.video_path is 'Path inside PRIVATE product-videos storage, e.g. desk-lamp.mp4. Not a public URL. Max 20 MB for this publisher.';
comment on column public.products.publish_to_pinterest is 'Enable only when you want one automatically generated Pin for this product. Changing an existing product does not generate another Pin.';

create table public.catalog_state (
  id integer primary key default 1 check (id = 1),
  revision bigint not null default 0,
  requested_revision bigint not null default -1,
  requested_at timestamptz,
  deployed_revision bigint not null default -1,
  build_day date,
  builds_today integer not null default 0,
  last_error text,
  lease_token uuid,
  lease_until timestamptz
);
insert into public.catalog_state(id) values(1);

create table public.pinterest_jobs (
  product_id uuid primary key references public.products(id) on delete cascade,
  state text not null default 'pending' check (state in ('pending', 'media_processing', 'creating', 'published', 'failed', 'needs_review', 'cancelled')),
  pin_id text,
  api_env text check (api_env in ('sandbox', 'production')),
  media_id text,
  media_path text,
  media_started_at timestamptz,
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_error text,
  updated_at timestamptz not null default now(),
  check (state <> 'published' or pin_id is not null)
);

create table public.pinterest_tokens (
  id integer primary key default 1 check (id = 1),
  api_env text not null check (api_env in ('sandbox', 'production')),
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  refreshed_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.catalog_state enable row level security;
alter table public.pinterest_jobs enable row level security;
alter table public.pinterest_tokens enable row level security;
revoke all on public.products, public.catalog_state, public.pinterest_jobs, public.pinterest_tokens from anon, authenticated;
grant all on public.products, public.catalog_state, public.pinterest_jobs, public.pinterest_tokens to service_role;
-- No browser write policies, even for a self-created authenticated account.

create or replace function public.prepare_product()
returns trigger language plpgsql set search_path = '' as $$
declare label text;
begin
  if tg_op = 'INSERT' then
    if new.slug is null or trim(new.slug) = '' then
      label := trim(both '-' from regexp_replace(lower(new.title), '[^a-z0-9]+', '-', 'g'));
      new.slug := coalesce(nullif(left(label, 60), ''), 'find') || '-' || left(new.id::text, 8);
    end if;
    new.revision := 1;
    new.ever_published := new.published;
  else
    if old.ever_published and new.slug <> old.slug then raise exception 'Published product URLs are permanent. Keep the existing slug.'; end if;
    new.revision := old.revision + 1;
    new.ever_published := old.ever_published or new.published;
    new.created_at := old.created_at;
  end if;
  if exists(select 1 from unnest(new.tags) tag where length(tag) > 40) then raise exception 'Tags must be at most 40 characters each'; end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger prepare_product before insert or update on public.products for each row execute function public.prepare_product();

create or replace function public.product_changed()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    if old.published then update public.catalog_state set revision = revision + 1 where id = 1; end if;
    return old;
  end if;
  if new.published or (tg_op = 'UPDATE' and old.published) then
    update public.catalog_state set revision = revision + 1 where id = 1;
  end if;
  if new.published and new.publish_to_pinterest then
    insert into public.pinterest_jobs(product_id) values(new.id)
      on conflict(product_id) do update set state = 'pending', next_attempt_at = now(), updated_at = now()
      where pinterest_jobs.state = 'cancelled' and pinterest_jobs.pin_id is null;
  else
    update public.pinterest_jobs set state = 'cancelled', updated_at = now()
      where product_id = new.id and state in ('pending', 'media_processing', 'failed');
  end if;
  return new;
end;
$$;
create trigger product_changed after insert or update or delete on public.products for each row execute function public.product_changed();

-- One MVCC-consistent snapshot: version and products always come from the same query.
create or replace function public.get_catalog()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'revision', (select revision from public.catalog_state where id = 1),
    'products', coalesce((select jsonb_agg(jsonb_build_object(
      'id', p.id, 'slug', p.slug, 'title', p.title, 'description', p.description,
      'category', p.category, 'tags', p.tags, 'poster_url', p.poster_url,
      'poster_alt', p.poster_alt, 'stores', p.stores, 'featured', p.featured,
      'revision', p.revision, 'created_at', p.created_at
    ) order by p.created_at desc, p.id) from public.products p where p.published), '[]'::jsonb)
  );
$$;
revoke all on function public.get_catalog() from public;
grant execute on function public.get_catalog() to anon, authenticated, service_role;

create or replace function public.acquire_publisher_lock()
returns uuid language plpgsql security definer set search_path = '' as $$
declare token uuid := gen_random_uuid(); acquired uuid;
begin
  update public.catalog_state set lease_token = token, lease_until = now() + interval '180 seconds'
    where id = 1 and (lease_until is null or lease_until < now()) returning lease_token into acquired;
  return acquired;
end;
$$;
create or replace function public.release_publisher_lock(token uuid)
returns void language sql security definer set search_path = '' as $$
  update public.catalog_state set lease_token = null, lease_until = null where id = 1 and lease_token = token;
$$;
revoke all on function public.acquire_publisher_lock(), public.release_publisher_lock(uuid), public.prepare_product(), public.product_changed() from public, anon, authenticated;
grant execute on function public.acquire_publisher_lock(), public.release_publisher_lock(uuid) to service_role;

commit;
