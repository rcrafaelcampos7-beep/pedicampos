-- PediCampos - public image delivery with tenant-isolated authenticated writes.
-- This migration does not create any anonymous write policy.

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('store-assets', 'store-assets', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Only policies owned by this migration are replaced. Buckets and policies
-- belonging to other applications remain untouched.
drop policy if exists "PediCampos public reads store assets" on storage.objects;
create policy "PediCampos public reads store assets"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'store-assets');

drop policy if exists "PediCampos public reads product images" on storage.objects;
create policy "PediCampos public reads product images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "PediCampos store users insert store assets" on storage.objects;
create policy "PediCampos store users insert store assets"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'store-assets'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and (storage.foldername(name))[2] in ('logo', 'banner')
  and array_length(storage.foldername(name), 1) = 2
  and public.can_access_store(case
    when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    then ((storage.foldername(name))[1])::uuid
    else null
  end)
);

drop policy if exists "PediCampos store users update store assets" on storage.objects;
create policy "PediCampos store users update store assets"
on storage.objects for update
to authenticated
using (
  bucket_id = 'store-assets'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and (storage.foldername(name))[2] in ('logo', 'banner')
  and array_length(storage.foldername(name), 1) = 2
  and public.can_access_store(case
    when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    then ((storage.foldername(name))[1])::uuid
    else null
  end)
)
with check (
  bucket_id = 'store-assets'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and (storage.foldername(name))[2] in ('logo', 'banner')
  and array_length(storage.foldername(name), 1) = 2
  and public.can_access_store(case
    when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    then ((storage.foldername(name))[1])::uuid
    else null
  end)
);

drop policy if exists "PediCampos store users delete store assets" on storage.objects;
create policy "PediCampos store users delete store assets"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'store-assets'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and (storage.foldername(name))[2] in ('logo', 'banner')
  and array_length(storage.foldername(name), 1) = 2
  and public.can_access_store(case
    when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    then ((storage.foldername(name))[1])::uuid
    else null
  end)
);

drop policy if exists "PediCampos store users insert product images" on storage.objects;
create policy "PediCampos store users insert product images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and array_length(storage.foldername(name), 1) = 2
  and public.can_access_store(case
    when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    then ((storage.foldername(name))[1])::uuid
    else null
  end)
);

drop policy if exists "PediCampos store users update product images" on storage.objects;
create policy "PediCampos store users update product images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and array_length(storage.foldername(name), 1) = 2
  and public.can_access_store(case
    when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    then ((storage.foldername(name))[1])::uuid
    else null
  end)
)
with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and array_length(storage.foldername(name), 1) = 2
  and public.can_access_store(case
    when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    then ((storage.foldername(name))[1])::uuid
    else null
  end)
);

drop policy if exists "PediCampos store users delete product images" on storage.objects;
create policy "PediCampos store users delete product images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and array_length(storage.foldername(name), 1) = 2
  and public.can_access_store(case
    when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    then ((storage.foldername(name))[1])::uuid
    else null
  end)
);

commit;
