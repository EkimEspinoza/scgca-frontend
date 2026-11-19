begin;

create or replace function private.validar_no_solapamiento_dim_jornal()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  perform pg_advisory_xact_lock(762395012, 1);

  if exists (
    select 1
    from public."Dim_Jornal" existente
    where existente."Id_Jornal" is distinct from new."Id_Jornal"
      and daterange(existente."Inicio", existente."Fin", '[]')
          && daterange(new."Inicio", new."Fin", '[]')
      and (existente."Inicio", existente."Fin")
          is distinct from (new."Inicio", new."Fin")
  ) then
    raise exception 'No se permiten periodos de jornal con fechas solapadas.'
      using errcode = '23P01';
  end if;

  return new;
end;
$$;
revoke all on function private.validar_no_solapamiento_dim_jornal()
  from public, anon, authenticated, service_role;

drop trigger if exists trg_dim_jornal_no_overlap on public."Dim_Jornal";
create trigger trg_dim_jornal_no_overlap
before insert or update of "Inicio", "Fin" on public."Dim_Jornal"
for each row execute function private.validar_no_solapamiento_dim_jornal();

commit;
