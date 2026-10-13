-- RECONSTRUCCIÓN DOCUMENTAL: archivo original no localizado en GitHub.
-- La versión 20261012175958 está registrada en supabase_migrations.schema_migrations.
-- Este contenido se reconstruyó a partir del nombre de la migración y del estado
-- verificado de las funciones actuales. No es una copia confirmada del SQL original.
-- NO volver a ejecutar en producción: el search_path ya está configurado allí.

ALTER FUNCTION public.fn_actualizar_fecha_tipo_cambio()
    SET search_path = pg_catalog, public;

ALTER FUNCTION public.fn_validar_correlatividad_tipo_cambio()
    SET search_path = pg_catalog, public;
