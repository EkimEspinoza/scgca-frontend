-- RECONSTRUCCIÓN DOCUMENTAL: archivo original no localizado en GitHub.
-- La versión 20261012175618 está registrada en supabase_migrations.schema_migrations.
-- Este contenido se reconstruyó a partir del nombre de la migración y del estado
-- verificado de los permisos actuales. No es una copia confirmada del SQL original.
-- NO volver a ejecutar en producción: el cambio ya está aplicado allí.

REVOKE EXECUTE
ON FUNCTION public.fn_actualizar_fecha_tipo_cambio()
FROM PUBLIC, anon, authenticated, service_role;

REVOKE EXECUTE
ON FUNCTION public.fn_validar_correlatividad_tipo_cambio()
FROM PUBLIC, anon, authenticated, service_role;
