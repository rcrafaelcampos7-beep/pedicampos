-- Safe checklist for migration 013. No objects are inserted by this script.
-- Run the queries, then perform G/H with two real authenticated browser sessions.

select
  count(*) filter (where id = 'store-assets') = 1 as store_assets_exists,
  count(*) filter (where id = 'product-images') = 1 as product_images_exists,
  bool_and(public) as buckets_are_public,
  bool_and(file_size_limit = 5242880) as limit_is_5mb,
  bool_and(allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']) as mime_types_match
from storage.buckets
where id in ('store-assets', 'product-images');

select
  count(*) filter (where cmd = 'SELECT') = 2 as two_public_read_policies,
  count(*) filter (where cmd = 'INSERT' and roles = array['authenticated'::name]) = 2 as two_authenticated_insert_policies,
  count(*) filter (where cmd = 'UPDATE' and roles = array['authenticated'::name]) = 2 as two_authenticated_update_policies,
  count(*) filter (where cmd = 'DELETE' and roles = array['authenticated'::name]) = 2 as two_authenticated_delete_policies
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'PediCampos%';

-- Manual G: logged in as Loja A, try upload to {storeIdB}/logo/file.png;
-- expected: new row violates row-level security policy.
-- Manual H: logged in as Loja A, try remove a known Loja B object;
-- expected: no object is removed.
-- Manual I: open a generated public URL in an anonymous/private browser window;
-- expected: HTTP 200 and the image is rendered.
