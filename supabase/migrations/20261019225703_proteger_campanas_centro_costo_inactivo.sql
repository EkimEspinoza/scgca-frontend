-- SCGCA — BRAIN 03.01
-- Migración independiente.
-- Regla: las campañas asociadas a un Centro de Costo inactivo son inmutables,
-- incluso para ADMIN. Se conserva el historial y se permite desactivar el Centro
-- de Costo aunque tenga campañas.
--
-- Esta migración no reemplaza ni modifica la migración histórica de validar_campana().
-- La validación existente continúa bloqueando INSERT para Centros de Costo inactivos.
-- Esta migración agrega la protección para UPDATE y DELETE.
--
-- Versión alineada con supabase_migrations.schema_migrations en producción.

BEGIN;

CREATE OR REPLACE FUNCTION public.proteger_campana_centro_inactivo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'pg_temp'
AS $function$
DECLARE
    v_estado_cc boolean;
BEGIN
    -- Serializa UPDATE/DELETE de la campaña con un eventual cambio de estado
    -- del Centro de Costo. La regla se aplica igual a usuarios y administradores.
    SELECT cc.estado
      INTO v_estado_cc
      FROM public.dim_centro_costo AS cc
     WHERE cc.cod_cc_pk = OLD.cod_cc_pk
     FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'No se puede modificar ni eliminar la campaña: el Centro de Costo asociado no existe.';
    END IF;

    IF v_estado_cc IS DISTINCT FROM true THEN
        IF TG_OP = 'DELETE' THEN
            RAISE EXCEPTION
                'No se puede eliminar una campaña porque su Centro de Costo está inactivo.';
        ELSE
            RAISE EXCEPTION
                'No se puede modificar una campaña porque su Centro de Costo está inactivo.';
        END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$function$;

-- Los triggers del mismo evento se ejecutan por orden alfabético.
-- El prefijo trg_00 sitúa este control antes de trg_validar_campana en UPDATE.
DROP TRIGGER IF EXISTS trg_00_campana_inmutable_centro_inactivo
    ON public."Dim_Campana";

CREATE TRIGGER trg_00_campana_inmutable_centro_inactivo
BEFORE UPDATE OR DELETE ON public."Dim_Campana"
FOR EACH ROW
EXECUTE FUNCTION public.proteger_campana_centro_inactivo();

REVOKE EXECUTE
ON FUNCTION public.proteger_campana_centro_inactivo()
FROM PUBLIC, anon, authenticated, service_role;

COMMIT;
