-- Restringe la ejecución directa de las funciones internas de los triggers
-- de TipoCambio. Los triggers permanecen habilitados y ejecutan sus funciones
-- al operar sobre la tabla; las pruebas funcionales se realizaron en producción
-- después de aplicar este cambio manualmente el 2026-10-13.
--
-- Esta migración usa una versión nueva: no reutilizar las versiones históricas
-- 20261012175618 ni 20261012175958, cuyos archivos originales no se encontraron.

REVOKE EXECUTE
ON FUNCTION public.fn_actualizar_fecha_tipo_cambio()
FROM PUBLIC, anon, authenticated, service_role;

REVOKE EXECUTE
ON FUNCTION public.fn_validar_correlatividad_tipo_cambio()
FROM PUBLIC, anon, authenticated, service_role;
