-- Operaciones transaccionales y cierres para public."Dim_PorcentajeDist".
-- Aplicar solo después de revisar el alcance de cierre por empresa.

begin;

insert into public.modulos (codigo, nombre, grupo, ruta, orden, estado)
values ('DISTRIBUCION', 'Distribución', 'Procesos', '/distribucion', 10, true)
on conflict (codigo) do update
set nombre = excluded.nombre,
    grupo = excluded.grupo,
    ruta = excluded.ruta,
    estado = true,
    updated_at = now();

create table public.distribucion_mes (
    id_empresa bigint not null references public."Dim_Empresa"(id_empresa) on delete restrict,
    fecha date not null,
    estado text not null default 'ABIERTO'
        check (estado in ('ABIERTO', 'CERRADO')),
    cerrado_at timestamptz,
    cerrado_por uuid references auth.users(id),
    reabierto_at timestamptz,
    reabierto_por uuid references auth.users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (id_empresa, fecha),
    check (fecha = (date_trunc('month', fecha)::date + interval '1 month' - interval '1 day')::date),
    check (
        (estado = 'ABIERTO' and cerrado_at is null and cerrado_por is null)
        or (estado = 'CERRADO' and cerrado_at is not null and cerrado_por is not null)
    )
);

create table public.distribucion_evento (
    id_evento bigint generated always as identity primary key,
    id_empresa bigint not null,
    fecha date not null,
    accion text not null check (accion in ('GUARDAR', 'CERRAR', 'REABRIR')),
    realizado_por uuid not null references auth.users(id),
    realizado_at timestamptz not null default now(),
    detalle jsonb not null default '{}'::jsonb,
    foreign key (id_empresa, fecha)
        references public.distribucion_mes(id_empresa, fecha)
        on delete restrict
);

create index distribucion_evento_empresa_fecha_idx
    on public.distribucion_evento (id_empresa, fecha, realizado_at desc);

alter table public.distribucion_mes enable row level security;
alter table public.distribucion_evento enable row level security;

grant select on public.distribucion_mes, public.distribucion_evento to authenticated;
revoke all on public.distribucion_mes, public.distribucion_evento from anon, public;
revoke insert, update, delete, truncate, references, trigger
    on public.distribucion_mes, public.distribucion_evento
    from anon, authenticated;

create policy distribucion_mes_consulta
    on public.distribucion_mes for select to authenticated
    using (
        (select private.can_access_module('DISTRIBUCION', 'QUERY'))
        and (select private.has_company_access(id_empresa))
    );

create policy distribucion_evento_admin_consulta
    on public.distribucion_evento for select to authenticated
    using ((select private.is_admin()));

create or replace function public.obtener_empresas_distribucion()
returns table (
    id_empresa bigint,
    descripcion text,
    nombre_comercial text
)
language plpgsql
stable
security definer
set search_path to 'pg_catalog', 'public', 'private', 'pg_temp'
as $function$
begin
    if auth.uid() is null or not private.can_access_module('DISTRIBUCION', 'QUERY') then
        raise exception 'No tienes permiso para consultar empresas del módulo Distribución.'
            using errcode = '42501';
    end if;

    return query
    select e.id_empresa, e.descripcion::text, e.nombre_comercial::text
    from public."Dim_Empresa" e
    where private.has_company_access(e.id_empresa)
    order by e.nombre_comercial, e.descripcion;
end;
$function$;

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
               cc.desc_cc,
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
               cc.desc_cc as descripcion_cc,
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
        group by cc.id_empresa, cc.cod_cc, cc.cod_cc_pk, cc.desc_cc, d."PORCENTAJE"
    ),
    porcentajes_base as (
        select b.*,
               floor((b.num_hec * 10000) / nullif(sum(b.num_hec) over (), 0))::bigint as unidades_base,
               mod((b.num_hec * 10000), nullif(sum(b.num_hec) over (), 0)) as residuo
        from base b
    ),
    porcentajes_ordenados as (
        select pb.*,
               row_number() over (order by pb.residuo desc, pb.cod_cc_pk_dist asc) as orden_residuo,
               10000 - sum(pb.unidades_base) over () as unidades_pendientes
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

create or replace function public.guardar_distribucion_mes(
    p_id_empresa bigint,
    p_fecha date,
    p_filas jsonb,
    p_cerrar boolean default false
)
returns void
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'private', 'pg_temp'
as $function$
declare
    v_usuario uuid := auth.uid();
    v_estado text;
    v_cantidad_esperada integer;
    v_cantidad_recibida integer;
    v_cantidad_distinta integer;
    v_total_porcentaje numeric;
    v_total_porcentaje_hec numeric;
    v_fecha_anterior date;
    v_estado_anterior text;
begin
    if v_usuario is null
       or not private.can_access_module('DISTRIBUCION', 'WRITER')
       or not private.has_company_access(p_id_empresa) then
        raise exception 'No tienes permiso para editar la distribución de esta empresa.'
            using errcode = '42501';
    end if;

    if p_fecha is null
       or p_fecha <> (date_trunc('month', p_fecha)::date + interval '1 month' - interval '1 day')::date then
        raise exception 'La fecha debe ser el último día de un mes.'
            using errcode = '22023';
    end if;

    perform pg_advisory_xact_lock(p_id_empresa);

    if coalesce(jsonb_typeof(p_filas), '') <> 'array' then
        raise exception 'Las filas de distribución no tienen un formato válido.'
            using errcode = '22023';
    end if;

    insert into public.distribucion_mes (id_empresa, fecha)
    values (p_id_empresa, p_fecha)
    on conflict (id_empresa, fecha) do nothing;

    select dm.estado
      into v_estado
    from public.distribucion_mes dm
    where dm.id_empresa = p_id_empresa
      and dm.fecha = p_fecha
    for update;

    if v_estado = 'CERRADO' then
        raise exception 'El mes está cerrado. ADMIN debe reabrirlo para editar.'
            using errcode = '55000';
    end if;

    select count(*) into v_cantidad_esperada
    from public.previsualizar_distribucion_mes(p_id_empresa, p_fecha);

    if v_cantidad_esperada = 0 then
        raise exception 'La empresa no tiene centros LEVANTE en campaña para esta fecha.'
            using errcode = '22023';
    end if;

    select count(*), count(distinct x.cod_cc_pk), coalesce(sum(x.porcentaje), 0)
      into v_cantidad_recibida, v_cantidad_distinta, v_total_porcentaje
    from jsonb_to_recordset(p_filas) as x(cod_cc_pk bigint, porcentaje numeric);

    if v_cantidad_recibida <> v_cantidad_distinta then
        raise exception 'Hay centros de costo duplicados en la distribución.'
            using errcode = '22023';
    end if;

    if v_cantidad_recibida <> v_cantidad_esperada
       or exists (
            select 1
            from jsonb_to_recordset(p_filas) as x(cod_cc_pk bigint, porcentaje numeric)
            full join public.previsualizar_distribucion_mes(p_id_empresa, p_fecha) p
              on p.cod_cc_pk_dist = x.cod_cc_pk
            where x.cod_cc_pk is null or p.cod_cc_pk_dist is null
       ) then
        raise exception 'La lista de centros de costo cambió; vuelve a cargar la distribución.'
            using errcode = '40001';
    end if;

    if exists (
        select 1
        from jsonb_to_recordset(p_filas) as x(cod_cc_pk bigint, porcentaje numeric)
        where x.porcentaje is null
           or x.porcentaje < 0
           or x.porcentaje > 1
           or x.porcentaje <> round(x.porcentaje, 4)
    ) then
        raise exception 'Los porcentajes deben estar completos, sumar 100 %% y usar hasta cuatro decimales.'
            using errcode = '22023';
    end if;

    if v_total_porcentaje <> 1.0000 then
        raise exception 'Los porcentajes contables deben sumar exactamente 100.0000 %% por empresa y fecha.'
            using errcode = '22023';
    end if;

    select coalesce(sum(p.porcentaje_hec), 0)
      into v_total_porcentaje_hec
    from public.previsualizar_distribucion_mes(p_id_empresa, p_fecha) p;

    if v_total_porcentaje_hec <> 1.0000 then
        raise exception 'La participación de hectáreas debe sumar exactamente 100.0000 %% por empresa y fecha.'
            using errcode = '22023';
    end if;

    if p_cerrar then
        select dm.fecha, dm.estado
          into v_fecha_anterior, v_estado_anterior
        from public.distribucion_mes dm
        where dm.id_empresa = p_id_empresa
          and dm.fecha < p_fecha
        order by dm.fecha desc
        limit 1;

        if v_fecha_anterior is not null then
            if v_fecha_anterior <> (p_fecha - interval '1 month')::date then
                raise exception 'El cierre debe ser correlativo; completa el mes anterior de esta empresa.'
                    using errcode = '55000';
            end if;
            if v_estado_anterior <> 'CERRADO' then
                raise exception 'Cierra el mes anterior de esta empresa antes de continuar.'
                    using errcode = '55000';
            end if;
        elsif exists (
            select 1
            from public.distribucion_mes dm
            where dm.id_empresa = p_id_empresa
              and dm.fecha > p_fecha
              and dm.estado = 'CERRADO'
        ) then
            raise exception 'No se puede cerrar un mes anterior a cierres existentes; ADMIN debe reabrirlos primero.'
                using errcode = '55000';
        end if;
    end if;

    delete from public."Dim_PorcentajeDist"
    where "id_Empresa_Dist" = p_id_empresa
      and "FECHA" = p_fecha;

    insert into public."Dim_PorcentajeDist" (
        "id_Empresa_Dist", "COD_CC_Dist", "Cod_CC_PK_Dist", "PORCENTAJE",
        "FECHA", "Num_Hec", "Porcentaje_Hec"
    )
    select p.id_empresa,
           p.cod_cc_dist,
           p.cod_cc_pk_dist,
           x.porcentaje,
           p_fecha,
           p.num_hec,
           p.porcentaje_hec
    from public.previsualizar_distribucion_mes(p_id_empresa, p_fecha) p
    join jsonb_to_recordset(p_filas) as x(cod_cc_pk bigint, porcentaje numeric)
      on x.cod_cc_pk = p.cod_cc_pk_dist;

    update public.distribucion_mes
       set estado = case when p_cerrar then 'CERRADO' else 'ABIERTO' end,
           cerrado_at = case when p_cerrar then now() else null end,
           cerrado_por = case when p_cerrar then v_usuario else null end,
           updated_at = now()
     where id_empresa = p_id_empresa
       and fecha = p_fecha;

    insert into public.distribucion_evento (id_empresa, fecha, accion, realizado_por, detalle)
    values (
        p_id_empresa,
        p_fecha,
        case when p_cerrar then 'CERRAR' else 'GUARDAR' end,
        v_usuario,
        jsonb_build_object(
            'filas', v_cantidad_recibida,
            'total_porcentaje', v_total_porcentaje,
            'snapshot', (
                select jsonb_agg(
                    jsonb_build_object(
                        'COD_CC_Dist', d."COD_CC_Dist",
                        'Cod_CC_PK_Dist', d."Cod_CC_PK_Dist",
                        'PORCENTAJE', d."PORCENTAJE",
                        'Num_Hec', d."Num_Hec",
                        'Porcentaje_Hec', d."Porcentaje_Hec"
                    )
                    order by d."Cod_CC_PK_Dist"
                )
                from public."Dim_PorcentajeDist" d
                where d."id_Empresa_Dist" = p_id_empresa
                  and d."FECHA" = p_fecha
            )
        )
    );
end;
$function$;

create or replace function public.reabrir_distribucion_mes(
    p_id_empresa bigint,
    p_fecha date
)
returns integer
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'private', 'pg_temp'
as $function$
declare
    v_usuario uuid := auth.uid();
    v_actualizadas integer;
begin
    if v_usuario is null or not private.is_admin() then
        raise exception 'Solo ADMIN puede reabrir cierres de distribución.'
            using errcode = '42501';
    end if;

    perform pg_advisory_xact_lock(p_id_empresa);

    if p_fecha is null
       or p_fecha <> (date_trunc('month', p_fecha)::date + interval '1 month' - interval '1 day')::date then
        raise exception 'La fecha debe ser el último día de un mes.'
            using errcode = '22023';
    end if;

    insert into public.distribucion_evento (id_empresa, fecha, accion, realizado_por, detalle)
    select dm.id_empresa, dm.fecha, 'REABRIR', v_usuario,
           jsonb_build_object('fecha_solicitada', p_fecha)
    from public.distribucion_mes dm
    where dm.id_empresa = p_id_empresa
      and dm.fecha >= p_fecha
      and dm.estado = 'CERRADO';

    update public.distribucion_mes dm
       set estado = 'ABIERTO',
           cerrado_at = null,
           cerrado_por = null,
           reabierto_at = now(),
           reabierto_por = v_usuario,
           updated_at = now()
     where dm.id_empresa = p_id_empresa
       and dm.fecha >= p_fecha
       and dm.estado = 'CERRADO';

    get diagnostics v_actualizadas = row_count;
    return v_actualizadas;
end;
$function$;

revoke all on function public.obtener_empresas_distribucion() from public, anon;
revoke all on function public.previsualizar_distribucion_mes(bigint, date) from public, anon;
revoke all on function public.guardar_distribucion_mes(bigint, date, jsonb, boolean) from public, anon;
revoke all on function public.reabrir_distribucion_mes(bigint, date) from public, anon;
grant execute on function public.obtener_empresas_distribucion() to authenticated;
grant execute on function public.previsualizar_distribucion_mes(bigint, date) to authenticated;
grant execute on function public.guardar_distribucion_mes(bigint, date, jsonb, boolean) to authenticated;
grant execute on function public.reabrir_distribucion_mes(bigint, date) to authenticated;

commit;
