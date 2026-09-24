-- Images are intentionally public. Videos are private upload staging.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('product-videos', 'product-videos', false, 20971520, array['video/mp4','video/quicktime','video/x-m4v'])
on conflict(id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
-- Intentionally no INSERT/UPDATE/DELETE policies on storage.objects for website users.
-- The owner uses Supabase Studio; the private service-role publisher reads staged videos.
-- A restrictive policy also blocks generic permissive policies from an older project.
create policy "curated_media_private_management" on storage.objects
as restrictive for all to anon, authenticated
using (bucket_id not in ('product-images', 'product-videos'))
with check (bucket_id not in ('product-images', 'product-videos'));
