-- RECONSTRUCCIÓN DOCUMENTAL: validar_campana()
-- Fecha de documentación: 2026-10-13.
--
-- El archivo original que creó esta función no fue localizado en el historial
-- de GitHub. Esta definición se reconstruyó a partir de pg_get_functiondef()
-- y de la definición del trigger consultadas en Supabase.
--
-- IMPORTANTE:
-- - Este archivo es una evidencia documental del estado observado en Supabase.
-- - No es una copia confirmada del SQL histórico original.
-- - Se almacena fuera de supabase/migrations para evitar que Supabase CLI lo
--   ejecute automáticamente como una migración pendiente.
-- - No ejecutar en producción como parte de una sincronización rutinaria.
--
-- Objeto observado:
--   public.validar_campana()
--   Trigger trg_validar_campana en public."Dim_Campana"
--   BEFORE INSERT OR UPDATE
--
-- La función observada en producción:
CREATE OR REPLACE FUNCTION public.validar_campana()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_id_empresa_cc bigint;
    v_estado_cc boolean;
    v_tipo_cc text;

    v_fecha_fin_anterior date;
    v_fecha_inicio_siguiente date;

BEGIN

    perform pg_advisory_xact_lock(NEW.cod_cc_pk);

    select
        cc.id_empresa,
        cc.estado,
        upper(trim(t.des_tip_cc))
    into
        v_id_empresa_cc,
        v_estado_cc,
        v_tipo_cc
    from public.dim_centro_costo cc
    inner join public."Dim_TipoCC" t
        on t.id_tip_cc = cc.id_tip_cc
    where cc.cod_cc_pk = NEW.cod_cc_pk;

    if not found then
        raise exception
            'El Centro de Costo indicado no existe.';
    end if;

    if v_id_empresa_cc <> NEW.id_empresa then
        raise exception
            'El Centro de Costo % no pertenece a la empresa seleccionada.',
            NEW.cod_cc_pk;
    end if;

    /*
        TIPOS DE CENTRO DE COSTO PERMITIDOS
    */
    if v_tipo_cc not in (
        'LEVANTE Y MANTENIMIENTO',
        'INVERSIÓN E INSTALACIÓN CAMPO',
        'INVERSIÓN E INSTALACIÓN INFRAESTRUCTURA',
        'OTROS COSTOS',
        'VIVEROS'
    ) then

        raise exception
            'El Centro de Costo % no permite registrar campañas. Tipo de Centro de Costo: %.',
            NEW.cod_cc_pk,
            v_tipo_cc;

    end if;

    if TG_OP = 'INSERT' and v_estado_cc <> true then
        raise exception
            'No se puede crear una campaña para un Centro de Costo inactivo.';
    end if;

    if exists (
        select 1
        from public."Dim_Campana" c
        where c.cod_cc_pk = NEW.cod_cc_pk
          and not (
              c.id_empresa = NEW.id_empresa
              and c.id_campana_emp = NEW.id_campana_emp
          )
          and NEW.fecha_inicio <= c.fecha_fin
          and NEW.fecha_fin >= c.fecha_inicio
    ) then

        raise exception
            'El periodo de la campaña se superpone con otra campaña existente para el Centro de Costo %.',
            NEW.cod_cc_pk;

    end if;

    if exists (
        select 1
        from public."Dim_Campana" c
        where c.cod_cc_pk = NEW.cod_cc_pk
          and not (
              c.id_empresa = NEW.id_empresa
              and c.id_campana_emp = NEW.id_campana_emp
          )
          and NEW.fecha_inicio_ctb <= c.fecha_fin_ctb
          and NEW.fecha_fin_ctb >= c.fecha_inicio_ctb
    ) then

        raise exception
            'El periodo CTB se superpone con otro periodo CTB existente para el Centro de Costo %.',
            NEW.cod_cc_pk;

    end if;

    select c.fecha_fin
    into v_fecha_fin_anterior
    from public."Dim_Campana" c
    where c.cod_cc_pk = NEW.cod_cc_pk
      and not (
          c.id_empresa = NEW.id_empresa
          and c.id_campana_emp = NEW.id_campana_emp
      )
      and c.fecha_fin < NEW.fecha_inicio
    order by c.fecha_fin desc
    limit 1;

    if v_fecha_fin_anterior is not null then

        if NEW.fecha_inicio <> v_fecha_fin_anterior + 1 then
            raise exception
                'La campaña debe iniciar el día siguiente al término de la campaña anterior. Fecha esperada: %.',
                v_fecha_fin_anterior + 1;
        end if;

    end if;

    select c.fecha_inicio
    into v_fecha_inicio_siguiente
    from public."Dim_Campana" c
    where c.cod_cc_pk = NEW.cod_cc_pk
      and not (
          c.id_empresa = NEW.id_empresa
          and c.id_campana_emp = NEW.id_campana_emp
      )
      and c.fecha_inicio > NEW.fecha_fin
    order by c.fecha_inicio asc
    limit 1;

    if v_fecha_inicio_siguiente is not null then

        if v_fecha_inicio_siguiente <> NEW.fecha_fin + 1 then
            raise exception
                'La campaña debe terminar el día anterior al inicio de la siguiente campaña. Fecha esperada de término: %.',
                v_fecha_inicio_siguiente - 1;
        end if;

    end if;

    NEW.nombre_campana :=
        'Camp ' ||
        case
            when extract(year from NEW.fecha_inicio)
               = extract(year from NEW.fecha_fin)
            then
                extract(year from NEW.fecha_inicio)::text
            else
                extract(year from NEW.fecha_inicio)::text
                || '-'
                || extract(year from NEW.fecha_fin)::text
        end
        ||
        ' -- Inicio '
        || to_char(NEW.fecha_inicio, 'DD/MM/YYYY')
        ||
        ' - Final '
        || to_char(NEW.fecha_fin, 'DD/MM/YYYY')
        ||
        case
            when NEW.hectareas >= 1 then
                ' - ('
                ||
                trim(
                    to_char(
                        NEW.hectareas,
                        'FM999999990.####'
                    )
                )
                || ' ha)'
            else
                ''
        end;

    NEW.updated_at := now();

    return NEW;

END;
$function$;

-- Definición observada del trigger asociado en Supabase.
-- No se ha vuelto a crear ni modificar el trigger en producción.
CREATE TRIGGER trg_validar_campana
BEFORE INSERT OR UPDATE ON public."Dim_Campana"
FOR EACH ROW
EXECUTE FUNCTION public.validar_campana();
