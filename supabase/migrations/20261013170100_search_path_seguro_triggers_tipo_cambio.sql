-- Reconstrucción correctiva basada en la definición verificada en producción.
-- No es el archivo histórico original de la migración 20261012175958.
-- Se fija explícitamente un search_path seguro para ambas funciones trigger.

ALTER FUNCTION public.fn_actualizar_fecha_tipo_cambio()
  SET search_path = pg_catalog, public;

ALTER FUNCTION public.fn_validar_correlatividad_tipo_cambio()
  SET search_path = pg_catalog, public;
