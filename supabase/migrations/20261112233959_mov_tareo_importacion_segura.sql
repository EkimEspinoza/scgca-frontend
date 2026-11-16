begin;

-- Las campañas históricas pueden estar inactivas y aun así acreditar actividad
-- cuando su rango de fechas cubre el tareo.
create or replace function private.revalidar_mov_tareo_pendiente(p_id_mov_tareo bigint)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
    v_p public.mov_tareo_pendiente%rowtype;
    v_centro record;
    v_maquinaria record;
    v_errores text[] := array[]::text[];
    v_insertados integer := 0;
begin
    select *
    into v_p
    from public.mov_tareo_pendiente
    where id_mov_tareo = p_id_mov_tareo
    for update;

    if not found then
        return;
    end if;

    if v_p.hora = 0 then
        v_errores := array_append(v_errores, 'HORA_CERO');
    end if;

    select cc.cod_cc_pk, cc.id_empresa, cc.cod_cc, tipo.des_tip_cc
    into v_centro
    from public.dim_centro_costo cc
    left join public."Dim_TipoCC" tipo on tipo.id_tip_cc = cc.id_tip_cc
    where cc.cod_cc_pk = v_p.cod_cc_pk;

    if not found
       or v_centro.id_empresa is distinct from v_p.id_empresa
       or v_centro.cod_cc is distinct from v_p.cod_cc then
        v_errores := array_append(v_errores, 'CENTRO_COSTO_NO_EXISTE');
    elsif v_centro.des_tip_cc ilike '%LEVANTE%'
       and not exists (
           select 1
           from public."Dim_Campana" camp
           where camp.id_empresa = v_p.id_empresa
             and camp.cod_cc_pk = v_p.cod_cc_pk
             and camp.fecha_inicio <= v_p.fecha_tareo
             and camp.fecha_fin >= v_p.fecha_tareo
       ) then
        v_errores := array_append(v_errores, 'CAMPANA_NO_EXISTE');
    end if;

    select cc.cod_cc_pk, cc.id_empresa, cc.cod_cc
    into v_maquinaria
    from public.dim_centro_costo cc
    where cc.cod_cc_pk = v_p.cod_cc_pk_maq;

    if not found
       or v_maquinaria.id_empresa is distinct from v_p.id_empresa
       or v_maquinaria.cod_cc is distinct from v_p.cod_cc_maq then
        v_errores := array_append(v_errores, 'MAQUINARIA_NO_EXISTE');
    end if;

    update public.mov_tareo_pendiente
    set errores_validacion = to_jsonb(v_errores),
        estado_validacion = case when cardinality(v_errores) = 0 then 'VALIDO' else 'OBSERVADO' end,
        updated_at = now()
    where id_mov_tareo = v_p.id_mov_tareo;

    if cardinality(v_errores) = 0 then
        insert into public.mov_tareo (
            nro_parte, cod_cc, cod_cc_maq, hora, fecha_tareo, etapa_tareo,
            id_empresa, cod_cc_pk, cod_cc_pk_maq, observacion, estado
        )
        values (
            v_p.nro_parte, v_p.cod_cc, v_p.cod_cc_maq, v_p.hora, v_p.fecha_tareo, v_p.etapa_tareo,
            v_p.id_empresa, v_p.cod_cc_pk, v_p.cod_cc_pk_maq, v_p.observacion, v_p.estado
        )
        on conflict (nro_parte) do nothing;

        get diagnostics v_insertados = row_count;

        if v_insertados > 0 then
            delete from public.mov_tareo_pendiente
            where id_mov_tareo = v_p.id_mov_tareo;
        else
            update public.mov_tareo_pendiente
            set errores_validacion = '["NRO_PARTE_EXISTE"]'::jsonb,
                estado_validacion = 'OBSERVADO',
                updated_at = now()
            where id_mov_tareo = v_p.id_mov_tareo;
        end if;
    end if;
end;
$function$;

create or replace function private.importar_mov_tareo_seguro(p_registros jsonb)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
    v_recibidos integer;
    v_unicos integer;
    v_existentes integer := 0;
    v_cargados integer := 0;
    v_pendientes integer := 0;
begin
    if p_registros is null or jsonb_typeof(p_registros) <> 'array' then
        raise exception 'Los registros deben enviarse como un arreglo JSON.';
    end if;

    v_recibidos := jsonb_array_length(p_registros);
    if v_recibidos = 0 then
        return jsonb_build_object(
            'recibidos', 0, 'partes_unicas', 0, 'duplicados_consolidados', 0,
            'ya_existentes', 0, 'cargados', 0, 'pendientes', 0
        );
    end if;
    if v_recibidos > 2000 then
        raise exception 'El lote no puede superar 2000 filas.';
    end if;

    lock table public.mov_tareo, public.mov_tareo_pendiente in share row exclusive mode;

    create temporary table tareo_import_fuente (
        nro_parte text not null,
        cod_cc bigint not null,
        cod_cc_maq bigint not null,
        hora numeric not null,
        fecha_tareo date not null,
        etapa_tareo text,
        id_empresa bigint not null,
        cod_cc_pk bigint not null,
        cod_cc_pk_maq bigint not null,
        observacion text,
        estado smallint not null
    ) on commit drop;

    insert into pg_temp.tareo_import_fuente
    select
        nullif(btrim(r.nro_parte), ''),
        r.cod_cc,
        r.cod_cc_maq,
        r.hora,
        r.fecha_tareo,
        nullif(btrim(r.etapa_tareo), ''),
        r.id_empresa,
        r.cod_cc_pk,
        r.cod_cc_pk_maq,
        nullif(btrim(r.observacion), ''),
        r.estado
    from jsonb_to_recordset(p_registros) as r(
        nro_parte text,
        cod_cc bigint,
        cod_cc_maq bigint,
        hora numeric,
        fecha_tareo date,
        etapa_tareo text,
        id_empresa bigint,
        cod_cc_pk bigint,
        cod_cc_pk_maq bigint,
        observacion text,
        estado smallint
    );

    if (select count(*) from pg_temp.tareo_import_fuente) <> v_recibidos then
        raise exception 'Hay filas sin número de parte o con datos obligatorios inválidos.';
    end if;
    if exists (select 1 from pg_temp.tareo_import_fuente where nro_parte is null) then
        raise exception 'Todos los registros deben tener número de parte.';
    end if;
    if exists (select 1 from pg_temp.tareo_import_fuente where hora < 0) then
        raise exception 'Las horas no pueden ser negativas.';
    end if;

    if exists (
        select 1
        from pg_temp.tareo_import_fuente
        group by nro_parte
        having count(distinct jsonb_build_array(
            cod_cc, cod_cc_maq, fecha_tareo, etapa_tareo, id_empresa,
            cod_cc_pk, cod_cc_pk_maq, observacion, estado
        )) > 1
    ) then
        raise exception 'Un número de parte duplicado tiene datos distintos además de las horas.';
    end if;

    create temporary table tareo_import_unico on commit drop as
    select
        nro_parte,
        min(cod_cc) as cod_cc,
        min(cod_cc_maq) as cod_cc_maq,
        sum(hora) as hora,
        min(fecha_tareo) as fecha_tareo,
        min(etapa_tareo) as etapa_tareo,
        min(id_empresa) as id_empresa,
        min(cod_cc_pk) as cod_cc_pk,
        min(cod_cc_pk_maq) as cod_cc_pk_maq,
        min(observacion) as observacion,
        min(estado) as estado
    from pg_temp.tareo_import_fuente
    group by nro_parte;

    select count(*) into v_unicos from pg_temp.tareo_import_unico;

    create temporary table tareo_import_clasificado on commit drop as
    select
        u.*,
        array_remove(array[
            case when not exists (
                select 1 from public.dim_centro_costo cc
                where cc.cod_cc_pk = u.cod_cc_pk
                  and cc.id_empresa = u.id_empresa
                  and cc.cod_cc = u.cod_cc
            ) then 'CENTRO_COSTO_NO_EXISTE' end,
            case when not exists (
                select 1 from public.dim_centro_costo maq
                where maq.cod_cc_pk = u.cod_cc_pk_maq
                  and maq.id_empresa = u.id_empresa
                  and maq.cod_cc = u.cod_cc_maq
            ) then 'MAQUINARIA_NO_EXISTE' end,
            case when u.hora = 0 then 'HORA_CERO' end,
            case when exists (
                select 1
                from public.dim_centro_costo cc
                join public."Dim_TipoCC" tipo on tipo.id_tip_cc = cc.id_tip_cc
                where cc.cod_cc_pk = u.cod_cc_pk
                  and cc.id_empresa = u.id_empresa
                  and cc.cod_cc = u.cod_cc
                  and tipo.des_tip_cc ilike '%LEVANTE%'
            ) and not exists (
                select 1
                from public."Dim_Campana" camp
                where camp.id_empresa = u.id_empresa
                  and camp.cod_cc_pk = u.cod_cc_pk
                  and camp.fecha_inicio <= u.fecha_tareo
                  and camp.fecha_fin >= u.fecha_tareo
            ) then 'CAMPANA_NO_EXISTE' end
        ]::text[], null) as errores
    from pg_temp.tareo_import_unico u;

    select count(*) into v_existentes
    from pg_temp.tareo_import_clasificado c
    where exists (
        select 1 from public.mov_tareo m where m.nro_parte = c.nro_parte
    ) or exists (
        select 1 from public.mov_tareo_pendiente p where p.nro_parte = c.nro_parte
    );

    insert into public.mov_tareo (
        nro_parte, cod_cc, cod_cc_maq, hora, fecha_tareo, etapa_tareo,
        id_empresa, cod_cc_pk, cod_cc_pk_maq, observacion, estado
    )
    select
        c.nro_parte, c.cod_cc, c.cod_cc_maq, c.hora, c.fecha_tareo, c.etapa_tareo,
        c.id_empresa, c.cod_cc_pk, c.cod_cc_pk_maq, c.observacion, c.estado
    from pg_temp.tareo_import_clasificado c
    where cardinality(c.errores) = 0
      and not exists (select 1 from public.mov_tareo m where m.nro_parte = c.nro_parte)
      and not exists (select 1 from public.mov_tareo_pendiente p where p.nro_parte = c.nro_parte)
    on conflict (nro_parte) do nothing;
    get diagnostics v_cargados = row_count;

    insert into public.mov_tareo_pendiente (
        nro_parte, cod_cc, cod_cc_maq, hora, fecha_tareo, etapa_tareo,
        id_empresa, cod_cc_pk, cod_cc_pk_maq, observacion, estado,
        estado_validacion, errores_validacion
    )
    select
        c.nro_parte, c.cod_cc, c.cod_cc_maq, c.hora, c.fecha_tareo, c.etapa_tareo,
        c.id_empresa, c.cod_cc_pk, c.cod_cc_pk_maq, c.observacion, c.estado,
        'OBSERVADO', to_jsonb(c.errores)
    from pg_temp.tareo_import_clasificado c
    where cardinality(c.errores) > 0
      and not exists (select 1 from public.mov_tareo m where m.nro_parte = c.nro_parte)
      and not exists (select 1 from public.mov_tareo_pendiente p where p.nro_parte = c.nro_parte)
    on conflict (nro_parte) do nothing;
    get diagnostics v_pendientes = row_count;

    return jsonb_build_object(
        'recibidos', v_recibidos,
        'partes_unicas', v_unicos,
        'duplicados_consolidados', v_recibidos - v_unicos,
        'ya_existentes', v_existentes,
        'cargados', v_cargados,
        'pendientes', v_pendientes
    );
end;
$function$;

revoke all on function private.importar_mov_tareo_seguro(jsonb) from public, anon, authenticated;
grant execute on function private.importar_mov_tareo_seguro(jsonb) to service_role;
revoke all on function private.revalidar_mov_tareo_pendiente(bigint) from public, anon, authenticated;
grant execute on function private.revalidar_mov_tareo_pendiente(bigint) to service_role;

comment on function private.importar_mov_tareo_seguro(jsonb) is
    'Carga tareos de forma transaccional, consolida horas por numero de parte, no sobrescribe existentes y clasifica observaciones. Las campañas se validan por fechas aunque esten inactivas.';

commit;