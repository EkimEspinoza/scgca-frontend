-- RECONSTRUCCIÓN DOCUMENTAL: validar_campana()
-- Estado verificado: 2026-10-15.
--
-- Fuente de esta definición:
--   pg_get_functiondef('public.validar_campana()'::regprocedure)
-- consultado en el proyecto Supabase de SCGCA el 2026-10-15.
--
-- IMPORTANTE:
-- - Este archivo documenta la función observada en Supabase en la fecha indicada.
-- - No es el SQL histórico original que creó la función.
-- - Se mantiene fuera de supabase/migrations para evitar su ejecución automática
--   por Supabase CLI.
-- - NO ejecutar este archivo en producción ni usarlo como migración rutinaria.
-- - La migración versionada relacionada es:
--   supabase/migrations/20261014100000_serializar_validacion_campanas_centros_costo.sql
-- - La función activa fue comparada con esa migración y coincide en sus reglas
--   principales de validación y bloqueo por filas.
--
-- Objeto observado:
--   public.validar_campana()
--   Trigger trg_validar_campana en public."Dim_Campana"
--   BEFORE INSERT OR UPDATE
--
-- Definición observada en Supabase:
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
    /*
      Regla de negocio: una campaña creada no puede cambiar de Centro de Costo.
      El modal de actualización del Centro de Costo no cambia esta regla.
    */
    IF TG_OP = 'UPDATE'
       AND NEW.cod_cc_pk IS DISTINCT FROM OLD.cod_cc_pk THEN
        RAISE EXCEPTION
            'No se puede cambiar el Centro de Costo de una campaña ya creada.';
    END IF;

    /*
      Serializa la validación de la campaña con los cambios del Centro de Costo.
      El bloqueo se solicita antes de leer y validar el Centro de Costo.
    */
    IF TG_OP = 'UPDATE' THEN
        PERFORM cc.cod_cc_pk
        FROM public.dim_centro_costo cc
        WHERE cc.cod_cc_pk IN (OLD.cod_cc_pk, NEW.cod_cc_pk)
        ORDER BY cc.cod_cc_pk
        FOR UPDATE;
    ELSE
        PERFORM cc.cod_cc_pk
        FROM public.dim_centro_costo cc
        WHERE cc.cod_cc_pk = NEW.cod_cc_pk
        FOR UPDATE;
    END IF;

    SELECT
        cc.id_empresa,
        cc.estado,
        upper(trim(t.des_tip_cc))
    INTO
        v_id_empresa_cc,
        v_estado_cc,
        v_tipo_cc
    FROM public.dim_centro_costo cc
    INNER JOIN public."Dim_TipoCC" t
        ON t.id_tip_cc = cc.id_tip_cc
    WHERE cc.cod_cc_pk = NEW.cod_cc_pk;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El Centro de Costo indicado no existe.';
    END IF;

    IF v_id_empresa_cc <> NEW.id_empresa THEN
        RAISE EXCEPTION
            'El Centro de Costo % no pertenece a la empresa seleccionada.',
            NEW.cod_cc_pk;
    END IF;

    IF v_tipo_cc NOT IN (
        'LEVANTE Y MANTENIMIENTO',
        'INVERSIÓN E INSTALACIÓN CAMPO',
        'INVERSIÓN E INSTALACIÓN INFRAESTRUCTURA',
        'OTROS COSTOS',
        'VIVEROS'
    ) THEN
        RAISE EXCEPTION
            'El Centro de Costo % no permite registrar campañas. Tipo de Centro de Costo: %.',
            NEW.cod_cc_pk,
            v_tipo_cc;
    END IF;

    IF TG_OP = 'INSERT' AND v_estado_cc IS DISTINCT FROM true THEN
        RAISE EXCEPTION
            'No se puede crear una campaña para un Centro de Costo inactivo.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public."Dim_Campana" c
        WHERE c.cod_cc_pk = NEW.cod_cc_pk
          AND NOT (
              c.id_empresa = NEW.id_empresa
              AND c.id_campana_emp = NEW.id_campana_emp
          )
          AND NEW.fecha_inicio <= c.fecha_fin
          AND NEW.fecha_fin >= c.fecha_inicio
    ) THEN
        RAISE EXCEPTION
            'El periodo de la campaña se superpone con otra campaña existente para el Centro de Costo %.',
            NEW.cod_cc_pk;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public."Dim_Campana" c
        WHERE c.cod_cc_pk = NEW.cod_cc_pk
          AND NOT (
              c.id_empresa = NEW.id_empresa
              AND c.id_campana_emp = NEW.id_campana_emp
          )
          AND NEW.fecha_inicio_ctb <= c.fecha_fin_ctb
          AND NEW.fecha_fin_ctb >= c.fecha_inicio_ctb
    ) THEN
        RAISE EXCEPTION
            'El periodo CTB se superpone con otro periodo CTB existente para el Centro de Costo %.',
            NEW.cod_cc_pk;
    END IF;

    SELECT c.fecha_fin
    INTO v_fecha_fin_anterior
    FROM public."Dim_Campana" c
    WHERE c.cod_cc_pk = NEW.cod_cc_pk
      AND NOT (
          c.id_empresa = NEW.id_empresa
          AND c.id_campana_emp = NEW.id_campana_emp
      )
      AND c.fecha_fin < NEW.fecha_inicio
    ORDER BY c.fecha_fin DESC
    LIMIT 1;

    IF v_fecha_fin_anterior IS NOT NULL
       AND NEW.fecha_inicio <> v_fecha_fin_anterior + 1 THEN
        RAISE EXCEPTION
            'La campaña debe iniciar el día siguiente al término de la campaña anterior. Fecha esperada: %.',
            v_fecha_fin_anterior + 1;
    END IF;

    SELECT c.fecha_inicio
    INTO v_fecha_inicio_siguiente
    FROM public."Dim_Campana" c
    WHERE c.cod_cc_pk = NEW.cod_cc_pk
      AND NOT (
          c.id_empresa = NEW.id_empresa
          AND c.id_campana_emp = NEW.id_campana_emp
      )
      AND c.fecha_inicio > NEW.fecha_fin
    ORDER BY c.fecha_inicio ASC
    LIMIT 1;

    IF v_fecha_inicio_siguiente IS NOT NULL
       AND v_fecha_inicio_siguiente <> NEW.fecha_fin + 1 THEN
        RAISE EXCEPTION
            'La campaña debe terminar el día anterior al inicio de la siguiente campaña. Fecha esperada de término: %.',
            v_fecha_inicio_siguiente - 1;
    END IF;

    NEW.nombre_campana :=
        'Camp ' ||
        CASE
            WHEN extract(year FROM NEW.fecha_inicio) = extract(year FROM NEW.fecha_fin)
            THEN extract(year FROM NEW.fecha_inicio)::text
            ELSE extract(year FROM NEW.fecha_inicio)::text
                 || '-' || extract(year FROM NEW.fecha_fin)::text
        END ||
        ' -- Inicio ' || to_char(NEW.fecha_inicio, 'DD/MM/YYYY') ||
        ' - Final ' || to_char(NEW.fecha_fin, 'DD/MM/YYYY') ||
        CASE
            WHEN NEW.hectareas >= 1 THEN
                ' - (' ||
                trim(to_char(NEW.hectareas, 'FM999999990.####')) ||
                ' ha)'
            ELSE ''
        END;

    NEW.updated_at := now();
    RETURN NEW;
END;
$function$;

-- Definición observada del trigger asociado en Supabase.
-- El trigger ya existía en producción; este bloque es solo documental.
-- NO ejecutar este archivo para recrear o modificar el trigger.
CREATE TRIGGER trg_validar_campana
BEFORE INSERT OR UPDATE ON public."Dim_Campana"
FOR EACH ROW
EXECUTE FUNCTION public.validar_campana();
