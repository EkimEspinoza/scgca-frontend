create or replace function public.resolver_pendiente_mov_mo(
  p_id_mov_mo bigint,
  p_datos jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog
as $function$
declare
  v public.mov_mo_pendiente%rowtype;
  v_errores text[] := array[]::text[];
  v_id_tip_cc bigint;
  v_tipo_cc text;
  v_centro_activo boolean;
  v_requiere_campana boolean;
  v_campana_valida boolean;
  v_duplicado_id bigint;
  v_mov_procesado_id bigint;
begin
  if coalesce(private.is_admin(), false) is not true then
    raise exception 'Solo un usuario ADMIN puede resolver movimientos de Mano de Obra.'
      using errcode = '42501';
  end if;

  if jsonb_typeof(p_datos) is distinct from 'object' then
    raise exception 'Los datos de actualización deben ser un objeto JSON.'
      using errcode = '22023';
  end if;

  update public.mov_mo_pendiente as p
  set cod_cc_pk = case when p_datos ? 'cod_cc_pk' then nullif(p_datos->>'cod_cc_pk', '')::bigint else p.cod_cc_pk end,
      cod_cc = case when p_datos ? 'cod_cc' then nullif(p_datos->>'cod_cc', '')::bigint else p.cod_cc end,
      cod_labor = case when p_datos ? 'cod_labor' then nullif(p_datos->>'cod_labor', '')::bigint else p.cod_labor end,
      fec_labor = case when p_datos ? 'fec_labor' then nullif(p_datos->>'fec_labor', '')::date else p.fec_labor end,
      etapa_costo = case when p_datos ? 'etapa_costo' then nullif(p_datos->>'etapa_costo', '')::bigint else p.etapa_costo end,
      obs = case when p_datos ? 'obs' then nullif(p_datos->>'obs', '') else p.obs end,
      updated_at = now()
  where p.id_mov_mo = p_id_mov_mo
  returning p.* into v;

  if not found then
    raise exception 'No se encontró el movimiento pendiente o no tienes permiso para editarlo.'
      using errcode = 'P0002';
  end if;

  if not exists (
    select 1 from public."Dim_Empresa" e where e.id_empresa = v.id_empresa
  ) then
    v_errores := array_append(v_errores, 'EMPRESA_NO_REGISTRADA');
  end if;

  select cc.id_tip_cc, t.des_tip_cc, cc.estado
  into v_id_tip_cc, v_tipo_cc, v_centro_activo
  from public.dim_centro_costo cc
  left join public."Dim_TipoCC" t on t.id_tip_cc = cc.id_tip_cc
  where cc.cod_cc_pk = v.cod_cc_pk
    and cc.id_empresa = v.id_empresa
    and cc.cod_cc = v.cod_cc;

  if not found then
    v_errores := array_append(v_errores, 'CENTRO_COSTO_NO_EXISTE');
  else
    v_requiere_campana := upper(coalesce(v_tipo_cc, '')) not in (
      'ADMINISTRATIVO PROVINCIA', 'ADMINISTRATIVO LIMA', 'GENÉRICO', 'GENERICO'
    );

    if v_requiere_campana then
      select exists (
        select 1
        from public."Dim_Campana" c
        where c.cod_cc_pk = v.cod_cc_pk
          and c.fecha_inicio <= v.fec_labor
          and c.fecha_fin >= v.fec_labor
      ) into v_campana_valida;

      if not v_campana_valida then
        v_errores := array_append(v_errores, 'CAMPAÑA_NO_REGISTRADA_PARA_LA_FECHA');
      end if;
    elsif not coalesce(v_centro_activo, false) then
      v_errores := array_append(v_errores, 'CENTRO_COSTO_INACTIVO');
    end if;

    if upper(coalesce(v_tipo_cc, '')) like '%INVERSIÓN%CAMPO%'
       and (v.etapa_costo is null or not exists (
         select 1 from public."Dim_Etapa_Costo" e
         where e.cod_etapa = v.etapa_costo and e.estado is true
       )) then
      v_errores := array_append(v_errores, 'ETAPA_COSTO_REQUERIDA');
    end if;
  end if;

  if not exists (
    select 1 from public."Dim_Labor_Final" l where l."Id_Lab_Fin" = v.cod_labor
  ) then
    v_errores := array_append(v_errores, 'LABOR_NO_REGISTRADA');
  end if;

  select m.id_mov_mo into v_duplicado_id
  from public.mov_mo m
  where row(m.id_empresa, m.cod_cc_pk, m.cod_cc, m.cod_labor, m.labor_scire,
            m.imp_labor_sol, m.ess_labor_sol, m.fec_labor, m.etapa_costo, m.obs, m.estado)
    is not distinct from
        row(v.id_empresa, v.cod_cc_pk, v.cod_cc, v.cod_labor, v.labor_scire,
            v.imp_labor_sol, v.ess_labor_sol, v.fec_labor, v.etapa_costo, v.obs, v.estado)
  order by m.id_mov_mo
  limit 1;

  if v_duplicado_id is null then
    select p.id_mov_mo into v_duplicado_id
    from public.mov_mo_pendiente p
    where p.id_mov_mo <> v.id_mov_mo
      and row(p.id_empresa, p.cod_cc_pk, p.cod_cc, p.cod_labor, p.labor_scire,
              p.imp_labor_sol, p.ess_labor_sol, p.fec_labor, p.etapa_costo, p.obs, p.estado)
        is not distinct from
            row(v.id_empresa, v.cod_cc_pk, v.cod_cc, v.cod_labor, v.labor_scire,
                v.imp_labor_sol, v.ess_labor_sol, v.fec_labor, v.etapa_costo, v.obs, v.estado)
    order by p.id_mov_mo
    limit 1;
  end if;

  if v_duplicado_id is not null then
    v_errores := array_append(v_errores, format('DUPLICADO_EXACTO: MOV %s', v_duplicado_id));
  end if;

  if cardinality(v_errores) = 0 then
    insert into public.mov_mo (
      id_empresa, cod_cc_pk, cod_cc, cod_labor, labor_scire, imp_labor_sol,
      ess_labor_sol, fec_labor, etapa_costo, obs, estado, created_at, updated_at
    ) values (
      v.id_empresa, v.cod_cc_pk, v.cod_cc, v.cod_labor, v.labor_scire, v.imp_labor_sol,
      v.ess_labor_sol, v.fec_labor, v.etapa_costo, v.obs, v.estado, v.created_at, now()
    ) returning id_mov_mo into v_mov_procesado_id;

    delete from public.mov_mo_pendiente where id_mov_mo = v.id_mov_mo;
    return jsonb_build_object('resultado', 'PROCESADO', 'id_mov_mo', v_mov_procesado_id, 'errores', '[]'::jsonb);
  end if;

  update public.mov_mo_pendiente
  set estado_validacion = 'OBSERVADO',
      errores_validacion = to_jsonb(v_errores),
      updated_at = now()
  where id_mov_mo = v.id_mov_mo;

  return jsonb_build_object('resultado', 'PENDIENTE', 'id_mov_mo', v.id_mov_mo, 'errores', to_jsonb(v_errores));
end;
$function$;

revoke all on function public.resolver_pendiente_mov_mo(bigint, jsonb) from public, anon;
grant execute on function public.resolver_pendiente_mov_mo(bigint, jsonb) to authenticated;
