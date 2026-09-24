begin;
-- Run after migrations 001 and 002. Only the project owner manages this allowlist.
create table if not exists public.catalog_editors (
  user_id uuid primary key references auth.users(id) on delete cascade,
  label text not null default '',
  created_at timestamptz not null default now()
);
alter table public.catalog_editors enable row level security;
revoke all on public.catalog_editors from public, anon, authenticated;
grant all on public.catalog_editors to service_role;

create or replace function public.is_catalog_editor()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.catalog_editors where user_id = (select auth.uid()));
$$;
revoke all on function public.is_catalog_editor() from public;
grant execute on function public.is_catalog_editor() to anon, authenticated;

grant select on public.products to authenticated;
grant insert (id,title,description,category,tags,poster_url,poster_alt,stores,featured,published,publish_to_pinterest,pinterest_board_id,pin_media_type,pin_image_url,video_path),
      update (title,description,category,tags,poster_url,poster_alt,stores,featured,published,publish_to_pinterest,pinterest_board_id,pin_media_type,pin_image_url,video_path)
on public.products to authenticated;
drop policy if exists editor_read_products on public.products;
drop policy if exists editor_insert_products on public.products;
drop policy if exists editor_update_products on public.products;
create policy editor_read_products on public.products for select to authenticated using ((select public.is_catalog_editor()));
create policy editor_insert_products on public.products for insert to authenticated with check ((select public.is_catalog_editor()));
create policy editor_update_products on public.products for update to authenticated using ((select public.is_catalog_editor())) with check ((select public.is_catalog_editor()));

-- Status is read-only and deliberately excludes Pinterest tokens and publisher secrets.
create or replace function public.get_editor_status()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_catalog_editor() then raise exception 'Editor access required' using errcode='42501'; end if;
  return jsonb_build_object(
    'catalog', (select jsonb_build_object('revision',revision,'deployed_revision',deployed_revision,'requested_at',requested_at,'last_error',last_error) from public.catalog_state where id=1),
    'pinterest_connected', exists(select 1 from public.pinterest_tokens),
    'jobs', coalesce((select jsonb_agg(jsonb_build_object('product_id',product_id,'state',state,'pin_id',pin_id,'api_env',api_env,'last_error',last_error)) from public.pinterest_jobs),'[]'::jsonb)
  );
end;
$$;
revoke all on function public.get_editor_status() from public, anon;
grant execute on function public.get_editor_status() to authenticated;

-- Replace the earlier blanket restriction, then grant only append/read media access.
drop policy if exists curated_media_private_management on storage.objects;
create policy curated_media_private_management on storage.objects as restrictive for all to anon, authenticated
using (bucket_id not in ('product-images','product-videos') or (select public.is_catalog_editor()))
with check (bucket_id not in ('product-images','product-videos') or (select public.is_catalog_editor()));
drop policy if exists editor_upload_media on storage.objects;
drop policy if exists editor_read_media on storage.objects;
create policy editor_upload_media on storage.objects for insert to authenticated
with check (bucket_id in ('product-images','product-videos') and (select public.is_catalog_editor()) and name like (select auth.uid())::text || '/%');
create policy editor_read_media on storage.objects for select to authenticated
using (bucket_id in ('product-images','product-videos') and (select public.is_catalog_editor()));
commit;
