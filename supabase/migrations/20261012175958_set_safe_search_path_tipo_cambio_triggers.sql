-- Reconstrucción documental de la migración registrada en Supabase como
-- 20261012175958 / set_safe_search_path_tipo_cambio_triggers.
-- El archivo histórico original no fue encontrado en las ramas consultadas.
-- La definición verificada en producción ya usa este search_path.

ALTER FUNCTION public.fn_actualizar_fecha_tipo_cambio()
  SET search_path = pg_catalog, public;

ALTER FUNCTION public.fn_validar_correlatividad_tipo_cambio()
  SET search_path = pg_catalog, public;
