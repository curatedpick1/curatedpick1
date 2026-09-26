begin;

create or replace function public.valid_product_blog(value jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
declare item jsonb; kind text; body text;
begin
  if value is null or jsonb_typeof(value) <> 'array' or jsonb_array_length(value) > 40 then return false; end if;
  for item in select jsonb_array_elements(value) loop
    if jsonb_typeof(item) <> 'object' or jsonb_typeof(item->'type') is distinct from 'string' then return false; end if;
    kind := item->>'type';
    if kind in ('heading','paragraph','underline') then
      if jsonb_typeof(item->'text') is distinct from 'string' then return false; end if;
      body := item->>'text';
      if length(trim(body)) = 0 or (kind = 'heading' and length(body) > 160) or (kind <> 'heading' and length(body) > 2400) then return false; end if;
    elsif kind = 'image' then
      if not public.is_https_link(item->>'url')
        or jsonb_typeof(item->'alt') is distinct from 'string'
        or length(item->>'alt') > 500 then return false; end if;
    else return false;
    end if;
  end loop;
  return true;
end;
$$;

alter table public.products add column if not exists blog_title text not null default '' check (length(blog_title) <= 160);
alter table public.products add column if not exists blog_content jsonb not null default '[]'::jsonb;
alter table public.products drop constraint if exists products_blog_content_valid;
alter table public.products add constraint products_blog_content_valid
  check (public.valid_product_blog(blog_content) and (jsonb_array_length(blog_content) = 0 or length(trim(blog_title)) > 0));

grant insert (blog_title, blog_content), update (blog_title, blog_content) on public.products to authenticated;

create or replace function public.get_catalog()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'revision', (select revision from public.catalog_state where id = 1),
    'products', coalesce((select jsonb_agg(jsonb_build_object(
      'id',p.id,'slug',p.slug,'title',p.title,'description',p.description,
      'category',p.category,'tags',p.tags,'poster_url',p.poster_url,
      'poster_alt',p.poster_alt,'images',p.images,'stores',p.stores,'featured',p.featured,
      'blog_title',p.blog_title,'blog_content',p.blog_content,
      'revision',p.revision,'created_at',p.created_at
    ) order by p.created_at desc,p.id) from public.products p where p.published),'[]'::jsonb)
  );
$$;
notify pgrst, 'reload schema';
commit;
