create or replace function public.resumen_mensual_mov_tareo(
  p_id_empresa bigint,
  p_fecha_desde date,
  p_fecha_hasta date
)
returns table (
  id_empresa bigint,
  periodo date,
  cantidad_registros bigint
)
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  with registros as (
    select movimiento.id_empresa, movimiento.fecha_tareo
    from public.mov_tareo as movimiento
    union all
    select movimiento.id_empresa, movimiento.fecha_tareo
    from public.mov_tareo_proceso as movimiento
    union all
    select movimiento.id_empresa, movimiento.fecha_tareo
    from public.mov_tareo_pendiente as movimiento
  )
  select
    registro.id_empresa,
    date_trunc('month', registro.fecha_tareo)::date as periodo,
    count(*)::bigint as cantidad_registros
  from registros as registro
  where (p_id_empresa is null or registro.id_empresa = p_id_empresa)
    and (p_fecha_desde is null or registro.fecha_tareo >= p_fecha_desde)
    and (p_fecha_hasta is null or registro.fecha_tareo <= p_fecha_hasta)
  group by registro.id_empresa, date_trunc('month', registro.fecha_tareo)
  order by registro.id_empresa, date_trunc('month', registro.fecha_tareo)
$$;

comment on function public.resumen_mensual_mov_tareo(bigint, date, date)
  is 'Cuenta los registros mensuales de Tareo en procesados, en proceso y pendientes; respeta RLS del usuario invocador.';

revoke all on function public.resumen_mensual_mov_tareo(bigint, date, date) from public, anon;
grant execute on function public.resumen_mensual_mov_tareo(bigint, date, date) to authenticated;
