begin;
-- Safe to rerun. Keep existing posters, video staging and editor permissions.
create or replace function public.valid_product_images(value jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
declare item jsonb;
begin
  if value is null or jsonb_typeof(value) <> 'array' then return false; end if;
  if jsonb_array_length(value)>10 then return false; end if;
  for item in select jsonb_array_elements(value) loop
    if jsonb_typeof(item)<>'object' or not public.is_https_link(item->>'url')
      or (item ? 'pin_url' and not public.is_https_link(item->>'pin_url'))
      or (item ? 'alt' and (jsonb_typeof(item->'alt') is distinct from 'string' or length(item->>'alt')>500))
    then return false; end if;
  end loop;
  return true;
end;
$$;
alter table public.products add column if not exists images jsonb not null default '[]'::jsonb;
alter table public.products drop constraint if exists products_images_valid;
alter table public.products add constraint products_images_valid check (public.valid_product_images(images));
-- The original auto-named constraint required a board on every product.
do $$ declare constraint_name text;
begin
  for constraint_name in select conname from pg_constraint
    where conrelid='public.products'::regclass and contype='c'
      and pg_get_constraintdef(oid) like '%pinterest_board_id%'
  loop execute format('alter table public.products drop constraint %I',constraint_name); end loop;
end $$;
alter table public.products add constraint products_optional_board check (pinterest_board_id is null or pinterest_board_id ~ '^[0-9]+$');
grant insert(images), update(images) on public.products to authenticated;

create or replace function public.get_catalog()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'revision', (select revision from public.catalog_state where id = 1),
    'products', coalesce((select jsonb_agg(jsonb_build_object(
      'id',p.id,'slug',p.slug,'title',p.title,'description',p.description,
      'category',p.category,'tags',p.tags,'poster_url',p.poster_url,
      'poster_alt',p.poster_alt,'images',p.images,'stores',p.stores,'featured',p.featured,
      'revision',p.revision,'created_at',p.created_at
    ) order by p.created_at desc,p.id) from public.products p where p.published),'[]'::jsonb)
  );
$$;
notify pgrst, 'reload schema';
commit;
