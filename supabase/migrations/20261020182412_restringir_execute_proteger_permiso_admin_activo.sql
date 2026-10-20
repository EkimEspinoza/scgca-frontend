-- MIG-04: restringir la ejecución directa de la función trigger
-- de protección del permiso ADMIN.
--
-- Conciliación de un cambio ya aplicado y verificado en Supabase.
-- No elimina ni deshabilita el trigger ni modifica la lógica de la función.
-- Este archivo se versiona para recuperar trazabilidad; no volver a ejecutar
-- contra producción sin revisar primero el historial de migraciones.

REVOKE EXECUTE
ON FUNCTION public.proteger_permiso_admin_activo()
FROM service_role;
