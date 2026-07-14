-- Read-only audit after migration 013.
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id in ('store-assets', 'product-images')
order by id;

select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'PediCampos%'
order by policyname;

-- Review this result for any older permissive policy that also references the
-- PediCampos buckets. PostgreSQL combines permissive policies with OR.
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and (
    coalesce(qual, '') like '%store-assets%'
    or coalesce(with_check, '') like '%store-assets%'
    or coalesce(qual, '') like '%product-images%'
    or coalesce(with_check, '') like '%product-images%'
  )
order by policyname;
