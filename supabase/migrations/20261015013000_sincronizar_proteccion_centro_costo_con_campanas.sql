-- Sincroniza en el repositorio la protección existente en Supabase para
-- Centros de Costo que ya tienen campañas registradas.
-- No modifica datos de negocio. La función impide cambiar empresa, código,
-- tipo o clave interna cuando existen campañas vinculadas.
-- Se conserva el comportamiento validado en producción.

BEGIN;

CREATE OR REPLACE FUNCTION public.proteger_centro_costo_con_campanas()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    /*
        Solo aplica cuando el Centro de Costo ya tiene campañas registradas.
    */
    IF EXISTS (
        SELECT 1
        FROM public."Dim_Campana" c
        WHERE c.cod_cc_pk = OLD.cod_cc_pk
    ) THEN
        IF NEW.id_empresa IS DISTINCT FROM OLD.id_empresa THEN
            RAISE EXCEPTION
                'No se puede cambiar la empresa del Centro de Costo % porque ya tiene campañas registradas.',
                OLD.cod_cc_pk;
        END IF;

        IF NEW.cod_cc IS DISTINCT FROM OLD.cod_cc THEN
            RAISE EXCEPTION
                'No se puede cambiar el código del Centro de Costo % porque ya tiene campañas registradas.',
                OLD.cod_cc_pk;
        END IF;

        IF NEW.id_tip_cc IS DISTINCT FROM OLD.id_tip_cc THEN
            RAISE EXCEPTION
                'No se puede cambiar el tipo del Centro de Costo % porque ya tiene campañas registradas.',
                OLD.cod_cc_pk;
        END IF;

        IF NEW.cod_cc_pk IS DISTINCT FROM OLD.cod_cc_pk THEN
            RAISE EXCEPTION
                'No se puede cambiar el código interno del Centro de Costo % porque ya tiene campañas registradas.',
                OLD.cod_cc_pk;
        END IF;
    END IF;

    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_proteger_centro_costo_con_campanas
    ON public.dim_centro_costo;

CREATE TRIGGER trg_proteger_centro_costo_con_campanas
BEFORE UPDATE ON public.dim_centro_costo
FOR EACH ROW
EXECUTE FUNCTION public.proteger_centro_costo_con_campanas();

REVOKE EXECUTE
ON FUNCTION public.proteger_centro_costo_con_campanas()
FROM PUBLIC, anon, authenticated, service_role;

COMMIT;
