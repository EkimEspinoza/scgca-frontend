begin;

create or replace function public.previsualizar_distribucion_mes(
    p_id_empresa bigint,
    p_fecha date
)
returns table (
    id_empresa bigint,
    cod_cc_dist bigint,
    cod_cc_pk_dist bigint,
    descripcion_cc text,
    porcentaje numeric,
    fecha date,
    num_hec numeric,
    porcentaje_hec numeric
)
language plpgsql
stable
security definer
set search_path to 'pg_catalog', 'public', 'private', 'pg_temp'
as $function$
begin
    if auth.uid() is null
       or not private.can_access_module('DISTRIBUCION', 'QUERY')
       or not private.has_company_access(p_id_empresa) then
        raise exception 'No tienes permiso para consultar la distribución de esta empresa.'
            using errcode = '42501';
    end if;

    if p_fecha is null
       or p_fecha <> (date_trunc('month', p_fecha)::date + interval '1 month' - interval '1 day')::date then
        raise exception 'La fecha debe ser el último día de un mes.'
            using errcode = '22023';
    end if;

    -- Los meses cerrados son snapshots históricos; solo se recalculan al reabrirlos.
    if exists (
        select 1
        from public.distribucion_mes dm
        where dm.id_empresa = p_id_empresa
          and dm.fecha = p_fecha
          and dm.estado = 'CERRADO'
    ) then
        return query
        select d."id_Empresa_Dist",
               d."COD_CC_Dist",
               d."Cod_CC_PK_Dist",
               cc.desc_cc::text,
               d."PORCENTAJE",
               d."FECHA",
               d."Num_Hec",
               d."Porcentaje_Hec"
        from public."Dim_PorcentajeDist" d
        join public.dim_centro_costo cc
          on cc.cod_cc_pk = d."Cod_CC_PK_Dist"
        where d."id_Empresa_Dist" = p_id_empresa
          and d."FECHA" = p_fecha
        order by d."Cod_CC_PK_Dist";
        return;
    end if;

    return query
    with base as (
        select cc.id_empresa,
               cc.cod_cc as cod_cc_dist,
               cc.cod_cc_pk as cod_cc_pk_dist,
               cc.desc_cc::text as descripcion_cc,
               sum(c.hectareas)::numeric as num_hec,
               d."PORCENTAJE" as porcentaje
        from public.dim_centro_costo cc
        join public."Dim_TipoCC" tc
          on tc.id_tip_cc = cc.id_tip_cc
         and tc.id_tip_cc = 4
        join public."Dim_Campana" c
          on c.id_empresa = cc.id_empresa
         and c.cod_cc_pk = cc.cod_cc_pk
         and c.fecha_inicio <= p_fecha
         and c.fecha_fin >= p_fecha
        left join public."Dim_PorcentajeDist" d
          on d."id_Empresa_Dist" = cc.id_empresa
         and d."Cod_CC_PK_Dist" = cc.cod_cc_pk
         and d."FECHA" = p_fecha
        where cc.id_empresa = p_id_empresa
        group by cc.id_empresa, cc.cod_cc, cc.cod_cc_pk, cc.desc_cc::text, d."PORCENTAJE"
    ),
    porcentajes_base as (
        select b.*,
               coalesce(
                   floor(
                       (case when b.porcentaje is distinct from 0 then b.num_hec else 0 end * 10000)
                       / nullif(sum(case when b.porcentaje is distinct from 0 then b.num_hec else 0 end) over (), 0)
                   ),
                   0
               )::bigint as unidades_base,
               coalesce(
                   mod(
                       case when b.porcentaje is distinct from 0 then b.num_hec * 10000 else 0 end,
                       nullif(sum(case when b.porcentaje is distinct from 0 then b.num_hec else 0 end) over (), 0)
                   ),
                   0
               ) as residuo
        from base b
    ),
    porcentajes_ordenados as (
        select pb.*,
               row_number() over (order by pb.residuo desc, pb.cod_cc_pk_dist asc) as orden_residuo,
               case
                   when sum(pb.unidades_base) over () = 0 then 0
                   else 10000 - sum(pb.unidades_base) over ()
               end as unidades_pendientes
        from porcentajes_base pb
    )
    select po.id_empresa,
           po.cod_cc_dist,
           po.cod_cc_pk_dist,
           po.descripcion_cc,
           po.porcentaje,
           p_fecha,
           po.num_hec,
           (
             po.unidades_base
             + case when po.orden_residuo <= po.unidades_pendientes then 1 else 0 end
           )::numeric / 10000 as porcentaje_hec
    from porcentajes_ordenados po
    order by po.cod_cc_pk_dist;
end;
$function$;

commit;
