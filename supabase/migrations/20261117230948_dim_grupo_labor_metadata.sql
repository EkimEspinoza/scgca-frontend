begin;

alter table public."Dim_GrupoLabor"
  add column estado boolean not null default true,
  add column created_at timestamptz not null default now(),
  add column updated_at timestamptz not null default now();

create or replace function private.set_dim_grupo_labor_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.set_dim_grupo_labor_updated_at()
from public, anon, authenticated, service_role;

create trigger trg_dim_grupo_labor_updated_at
before update on public."Dim_GrupoLabor"
for each row execute function private.set_dim_grupo_labor_updated_at();

commit;
