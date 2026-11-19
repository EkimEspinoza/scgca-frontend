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
      and not (
        tg_op = 'UPDATE'
        and existente."Inicio" = old."Inicio"
        and existente."Fin" = old."Fin"
      )
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

create or replace function public.actualizar_periodo_jornal(
  p_inicio_actual date,
  p_fin_actual date,
  p_inicio_nuevo date,
  p_fin_nuevo date,
  p_importes jsonb
)
returns integer
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_total integer;
  v_actualizados integer;
begin
  if p_inicio_nuevo is null or p_fin_nuevo is null or p_fin_nuevo < p_inicio_nuevo then
    raise exception 'El rango de fechas no es válido.';
  end if;

  if jsonb_typeof(p_importes) is distinct from 'object' then
    raise exception 'Los importes del periodo no tienen un formato válido.';
  end if;

  perform pg_advisory_xact_lock(762395012, 1);

  select count(*) into v_total
  from public."Dim_Jornal"
  where "Inicio" = p_inicio_actual and "Fin" = p_fin_actual;

  if v_total = 0 then
    raise exception 'No se encontró el periodo que deseas editar.';
  end if;

  if exists (
    select 1
    from public."Dim_Jornal" otro
    where (otro."Inicio", otro."Fin") is distinct from (p_inicio_actual, p_fin_actual)
      and daterange(otro."Inicio", otro."Fin", '[]')
          && daterange(p_inicio_nuevo, p_fin_nuevo, '[]')
  ) then
    raise exception 'Las fechas se solapan con otro periodo registrado.';
  end if;

  if exists (
    select 1
    from public."Dim_Jornal" periodo
    where periodo."Inicio" = p_inicio_actual
      and periodo."Fin" = p_fin_actual
      and not (p_importes ? periodo."id_Tipo_Jornal"::text)
  ) then
    raise exception 'Falta el importe de uno o más tipos de jornal.';
  end if;

  update public."Dim_Jornal" periodo
  set "Inicio" = p_inicio_nuevo,
      "Fin" = p_fin_nuevo,
      "Importe_Soles" = (p_importes ->> periodo."id_Tipo_Jornal"::text)::numeric,
      "updated_at" = now()
  where periodo."Inicio" = p_inicio_actual and periodo."Fin" = p_fin_actual;

  get diagnostics v_actualizados = row_count;
  if v_actualizados <> v_total then
    raise exception 'No se actualizaron todos los tipos de jornal del periodo.';
  end if;

  return v_actualizados;
end;
$$;

revoke all on function public.actualizar_periodo_jornal(date, date, date, date, jsonb) from public, anon;
grant execute on function public.actualizar_periodo_jornal(date, date, date, date, jsonb) to authenticated;
