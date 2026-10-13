-- Reconstrucción correctiva basada en el estado verificado de producción.
-- No es el archivo histórico original de la migración 20261012175618.
-- Las funciones RETURNS trigger deben ejecutarse mediante sus triggers,
-- no invocarse directamente desde los roles de aplicación.

REVOKE EXECUTE ON FUNCTION public.fn_actualizar_fecha_tipo_cambio()
  FROM PUBLIC, anon, authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.fn_validar_correlatividad_tipo_cambio()
  FROM PUBLIC, anon, authenticated, service_role;
