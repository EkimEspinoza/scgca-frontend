-- Impide modificar el año o mes de un tipo de cambio ya registrado.
-- La corrección del valor tipo_cambio sigue permitida.
-- Esta protección complementa las validaciones de correlatividad al INSERT.

CREATE OR REPLACE FUNCTION public.impedir_cambio_periodo_tipo_cambio()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $function$
BEGIN
    IF NEW.anho IS DISTINCT FROM OLD.anho
       OR NEW.mes IS DISTINCT FROM OLD.mes THEN
        RAISE EXCEPTION
            'No se puede modificar el año o mes de un tipo de cambio ya registrado.'
            USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_impedir_cambio_periodo_tipo_cambio
    ON public."TipoCambio";

CREATE TRIGGER trg_impedir_cambio_periodo_tipo_cambio
BEFORE UPDATE OF anho, mes
ON public."TipoCambio"
FOR EACH ROW
EXECUTE FUNCTION public.impedir_cambio_periodo_tipo_cambio();
