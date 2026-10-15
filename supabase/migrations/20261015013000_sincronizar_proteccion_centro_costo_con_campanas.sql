-- Sincroniza en el repositorio la protección existente en Supabase para
-- Centros de Costo que ya tienen campañas registradas.
-- Esta definición refleja la función actualmente instalada en producción.
-- No modifica datos de negocio.

BEGIN;

CREATE OR REPLACE FUNCTION public.proteger_centro_costo_con_campanas()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin

    /*
        Solo aplica cuando el Centro de Costo
        ya tiene campañas registradas.
    */
    if exists (
        select 1
        from public."Dim_Campana" c
        where c.cod_cc_pk = OLD.cod_cc_pk
    ) then

        /*
            No permitir cambiar empresa
        */
        if NEW.id_empresa <> OLD.id_empresa then
            raise exception
                'No se puede cambiar la empresa del Centro de Costo % porque ya tiene campañas registradas.',
                OLD.cod_cc_pk;
        end if;


        /*
            No permitir cambiar código
        */
        if NEW.cod_cc <> OLD.cod_cc then
            raise exception
                'No se puede cambiar el código del Centro de Costo % porque ya tiene campañas registradas.',
                OLD.cod_cc_pk;
        end if;


        /*
            No permitir cambiar tipo de Centro de Costo
        */
        if NEW.id_tip_cc <> OLD.id_tip_cc then
            raise exception
                'No se puede cambiar el tipo del Centro de Costo % porque ya tiene campañas registradas.',
                OLD.cod_cc_pk;
        end if;


        /*
            No permitir cambiar directamente el cod_cc_pk
        */
        if NEW.cod_cc_pk <> OLD.cod_cc_pk then
            raise exception
                'No se puede cambiar el código interno del Centro de Costo % porque ya tiene campañas registradas.',
                OLD.cod_cc_pk;
        end if;

    end if;


    return NEW;

end;
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
