-- RECONSTRUCCIÓN DOCUMENTAL: proteger_centro_costo_con_campanas()
-- Estado verificado: 2026-10-15.
--
-- Fuente:
--   pg_get_functiondef('public.proteger_centro_costo_con_campanas()'::regprocedure)
--   pg_get_triggerdef() para trg_proteger_centro_costo_con_campanas
-- consultados en el proyecto Supabase de SCGCA el 2026-10-15.
--
-- IMPORTANTE:
-- - Este archivo documenta el objeto observado en Supabase; no es el SQL
--   histórico original que lo creó.
-- - Se almacena fuera de supabase/migrations para evitar ejecución automática.
-- - NO ejecutar este archivo en producción ni usarlo como migración rutinaria.
-- - La migración versionada en GitHub relacionada es:
--   supabase/migrations/20261015013000_sincronizar_proteccion_centro_costo_con_campanas.sql
-- - A la fecha de la revisión, esa migración no figuraba en el historial de
--   migraciones aplicado de Supabase. La función y el trigger sí existen allí.
-- - La migración del repositorio usa IS DISTINCT FROM; la función observada en
--   producción usa <>. No son equivalentes si alguno de los valores comparados
--   puede ser NULL. Esta diferencia debe revisarse antes de aplicar/reconciliar
--   la migración desde la terminal; no ejecutar a ciegas.
--
-- Objeto observado:
--   public.proteger_centro_costo_con_campanas()
--   Trigger trg_proteger_centro_costo_con_campanas
--   BEFORE UPDATE ON public.dim_centro_costo
--
-- Definición observada en Supabase:
CREATE OR REPLACE FUNCTION public.proteger_centro_costo_con_campanas()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    /*
        Solo aplica cuando el Centro de Costo
        ya tiene campañas registradas.
    */
    IF EXISTS (
        SELECT 1
        FROM public."Dim_Campana" c
        WHERE c.cod_cc_pk = OLD.cod_cc_pk
    ) THEN
        IF NEW.id_empresa <> OLD.id_empresa THEN
            RAISE EXCEPTION
                'No se puede cambiar la empresa del Centro de Costo % porque ya tiene campañas registradas.',
                OLD.cod_cc_pk;
        END IF;

        IF NEW.cod_cc <> OLD.cod_cc THEN
            RAISE EXCEPTION
                'No se puede cambiar el código del Centro de Costo % porque ya tiene campañas registradas.',
                OLD.cod_cc_pk;
        END IF;

        IF NEW.id_tip_cc <> OLD.id_tip_cc THEN
            RAISE EXCEPTION
                'No se puede cambiar el tipo del Centro de Costo % porque ya tiene campañas registradas.',
                OLD.cod_cc_pk;
        END IF;

        IF NEW.cod_cc_pk <> OLD.cod_cc_pk THEN
            RAISE EXCEPTION
                'No se puede cambiar el código interno del Centro de Costo % porque ya tiene campañas registradas.',
                OLD.cod_cc_pk;
        END IF;
    END IF;

    RETURN NEW;
END;
$function$;

-- Definición observada del trigger. Bloque informativo: NO ejecutar.
-- El trigger ya existe en Supabase y está habilitado.
-- CREATE TRIGGER trg_proteger_centro_costo_con_campanas
-- BEFORE UPDATE ON public.dim_centro_costo
-- FOR EACH ROW
-- EXECUTE FUNCTION public.proteger_centro_costo_con_campanas();
