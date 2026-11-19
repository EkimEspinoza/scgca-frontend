create or replace function public.resumen_mensual_mov_mo(
  p_id_empresa bigint,
  p_fecha_desde date,
  p_fecha_hasta date,
  p_estado smallint
)
returns table (
  id_empresa bigint,
  periodo date,
  importe_labor numeric,
  ess_labor numeric,
  importe_total numeric
)
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select
    movimiento.id_empresa,
    date_trunc('month', movimiento.fec_labor)::date as periodo,
    coalesce(sum(movimiento.imp_labor_sol), 0)::numeric as importe_labor,
    coalesce(sum(movimiento.ess_labor_sol), 0)::numeric as ess_labor,
    coalesce(sum(movimiento.imp_labor_sol + coalesce(movimiento.ess_labor_sol, 0)), 0)::numeric as importe_total
  from public.mov_mo as movimiento
  where (p_id_empresa is null or movimiento.id_empresa = p_id_empresa)
    and (p_fecha_desde is null or movimiento.fec_labor >= p_fecha_desde)
    and (p_fecha_hasta is null or movimiento.fec_labor <= p_fecha_hasta)
    and (p_estado is null or movimiento.estado = p_estado)
  group by movimiento.id_empresa, date_trunc('month', movimiento.fec_labor)
  order by movimiento.id_empresa, date_trunc('month', movimiento.fec_labor)
$$;

comment on function public.resumen_mensual_mov_mo(bigint, date, date, smallint)
  is 'Resume importes de mano de obra y EsSalud por empresa y mes; respeta RLS del usuario invocador.';

revoke all on function public.resumen_mensual_mov_mo(bigint, date, date, smallint) from public, anon;
grant execute on function public.resumen_mensual_mov_mo(bigint, date, date, smallint) to authenticated;
