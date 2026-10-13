-- FIX: serializar cambios del Centro de Costo con el registro de campañas.
-- Ambas funciones deben bloquear el mismo identificador (cod_cc_pk).
-- No aplicar en producción hasta revisar el PR y probar la concurrencia en una
-- base de desarrollo. La función conserva las validaciones existentes.

BEGIN;

CREATE OR REPLACE FUNCTION public.proteger_centro_costo_con_campanas()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    /*
      Usa la misma clave de bloqueo que validar_campana().
      Así, el cambio de datos maestros y el registro de una campaña para
      el mismo Centro de Costo no pueden ejecutar simultáneamente la
      validación de existencia de campañas.
    */
    PERFORM pg_advisory_xact_lock(OLD.cod_cc_pk);

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

COMMIT;

-- Validación posterior obligatoria en una base de desarrollo:
-- 1. Sin campañas: los cambios permitidos de datos maestros siguen funcionando.
-- 2. Con campaña existente: cambiar id_empresa, cod_cc, id_tip_cc o cod_cc_pk
--    debe fallar; actualizar otros campos permitidos debe seguir funcionando.
-- 3. Dos sesiones concurrentes para el mismo cod_cc_pk:
--    a) mantener abierta una transacción que registra una campaña;
--    b) intentar cambiar datos protegidos del centro en otra sesión;
--    c) confirmar que la segunda operación espera y después falla si la campaña
--       se confirma.
-- 4. Invertir el orden: mantener abierto el cambio del centro y luego insertar
--    una campaña en otra sesión; comprobar que no se valida contra datos
--    maestros desactualizados.
-- 5. Verificar que campañas de otros centros no se bloqueen entre sí.
-- No ejecutar esta migración en producción hasta superar las pruebas anteriores.
