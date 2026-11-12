begin;

alter table public.mov_tareo_pendiente
    drop constraint if exists mov_tareo_hora_check;
alter table public.mov_tareo_pendiente
    drop constraint if exists mov_tareo_pendiente_hora_no_negativa;
alter table public.mov_tareo_pendiente
    add constraint mov_tareo_pendiente_hora_no_negativa check (hora >= 0);

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
             and camp.estado is true
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
        on conflict (nro_parte) do update
        set cod_cc = excluded.cod_cc,
            cod_cc_maq = excluded.cod_cc_maq,
            hora = excluded.hora,
            fecha_tareo = excluded.fecha_tareo,
            etapa_tareo = excluded.etapa_tareo,
            id_empresa = excluded.id_empresa,
            cod_cc_pk = excluded.cod_cc_pk,
            cod_cc_pk_maq = excluded.cod_cc_pk_maq,
            observacion = excluded.observacion,
            estado = excluded.estado,
            updated_at = now();

        delete from public.mov_tareo_pendiente
        where id_mov_tareo = v_p.id_mov_tareo;
    end if;
end;
$function$;

create or replace function private.revalidar_pendientes_por_centro_tareo()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
    v_id bigint;
begin
    for v_id in
        select p.id_mov_tareo
        from public.mov_tareo_pendiente p
        where p.id_empresa = new.id_empresa
          and (p.cod_cc_pk = new.cod_cc_pk or p.cod_cc_pk_maq = new.cod_cc_pk)
    loop
        perform private.revalidar_mov_tareo_pendiente(v_id);
    end loop;
    return new;
end;
$function$;

create or replace function private.revalidar_pendientes_por_campana_tareo()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
    v_id bigint;
begin
    for v_id in
        select p.id_mov_tareo
        from public.mov_tareo_pendiente p
        where p.id_empresa = new.id_empresa
          and p.cod_cc_pk = new.cod_cc_pk
          and p.fecha_tareo between new.fecha_inicio and new.fecha_fin
    loop
        perform private.revalidar_mov_tareo_pendiente(v_id);
    end loop;
    return new;
end;
$function$;

create or replace function private.revalidar_pendiente_tareo_despues_de_edicion()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
    perform private.revalidar_mov_tareo_pendiente(new.id_mov_tareo);
    return new;
end;
$function$;

drop trigger if exists trg_revalidar_pendientes_mov_tareo_por_centro on public.dim_centro_costo;
create trigger trg_revalidar_pendientes_mov_tareo_por_centro
after insert or update on public.dim_centro_costo
for each row execute function private.revalidar_pendientes_por_centro_tareo();

drop trigger if exists trg_revalidar_pendientes_mov_tareo_por_campana on public."Dim_Campana";
create trigger trg_revalidar_pendientes_mov_tareo_por_campana
after insert or update on public."Dim_Campana"
for each row execute function private.revalidar_pendientes_por_campana_tareo();

drop trigger if exists trg_revalidar_pendiente_mov_tareo on public.mov_tareo_pendiente;
create trigger trg_revalidar_pendiente_mov_tareo
after insert or update of cod_cc, cod_cc_maq, hora, fecha_tareo, id_empresa, cod_cc_pk, cod_cc_pk_maq
on public.mov_tareo_pendiente
for each row execute function private.revalidar_pendiente_tareo_despues_de_edicion();

revoke all on function private.revalidar_mov_tareo_pendiente(bigint) from public, anon, authenticated;
revoke all on function private.revalidar_pendientes_por_centro_tareo() from public, anon, authenticated;
revoke all on function private.revalidar_pendientes_por_campana_tareo() from public, anon, authenticated;
revoke all on function private.revalidar_pendiente_tareo_despues_de_edicion() from public, anon, authenticated;

commit;
