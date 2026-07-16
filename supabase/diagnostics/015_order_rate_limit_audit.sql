select table_name, privilege_type, grantee
from information_schema.role_table_grants
where table_schema='public' and table_name='order_rate_limit_attempts'
order by grantee, privilege_type;

select routine_name, grantee, privilege_type
from information_schema.role_routine_grants
where specific_schema='public'
  and routine_name in ('consume_order_rate_limit','complete_order_rate_limit','create_public_order')
order by routine_name, grantee;

select policyname, roles, cmd from pg_policies
where schemaname='public' and tablename='order_rate_limit_attempts';

select indexname, indexdef from pg_indexes
where schemaname='public' and tablename='order_rate_limit_attempts'
order by indexname;
