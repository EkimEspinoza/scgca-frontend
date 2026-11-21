create or replace function public.revalidar_pendientes_mov_mo(
  p_id_empresa bigint default null,
  p_fecha_desde date default null,
  p_fecha_hasta date default null
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog
as $function$
declare
  v_ids bigint[];
  v_id bigint;
  v_revisados integer;
  v_procesados integer;
  v_pendientes integer;
begin
  if coalesce(private.is_admin(), false) is not true then
    raise exception 'Solo un usuario ADMIN puede revalidar movimientos de Mano de Obra.'
      using errcode = '42501';
  end if;

  if p_fecha_desde is not null and p_fecha_hasta is not null and p_fecha_desde > p_fecha_hasta then
    raise exception 'La fecha inicial no puede ser posterior a la fecha final.'
      using errcode = '22023';
  end if;

  select coalesce(array_agg(p.id_mov_mo order by p.id_mov_mo), array[]::bigint[])
  into v_ids
  from public.mov_mo_pendiente p
  where (p_id_empresa is null or p.id_empresa = p_id_empresa)
    and (p_fecha_desde is null or p.fec_labor >= p_fecha_desde)
    and (p_fecha_hasta is null or p.fec_labor <= p_fecha_hasta);

  v_revisados := cardinality(v_ids);

  foreach v_id in array v_ids loop
    if exists (select 1 from public.mov_mo_pendiente p where p.id_mov_mo = v_id) then
      perform public.resolver_pendiente_mov_mo(v_id, '{}'::jsonb);
    end if;
  end loop;

  select count(*)::integer into v_pendientes
  from public.mov_mo_pendiente p
  where (p_id_empresa is null or p.id_empresa = p_id_empresa)
    and (p_fecha_desde is null or p.fec_labor >= p_fecha_desde)
    and (p_fecha_hasta is null or p.fec_labor <= p_fecha_hasta);

  v_procesados := greatest(v_revisados - v_pendientes, 0);
  return jsonb_build_object('revisados', v_revisados, 'procesados', v_procesados, 'pendientes', v_pendientes);
end;
$function$;

revoke all on function public.revalidar_pendientes_mov_mo(bigint, date, date) from public, anon;
grant execute on function public.revalidar_pendientes_mov_mo(bigint, date, date) to authenticated;
