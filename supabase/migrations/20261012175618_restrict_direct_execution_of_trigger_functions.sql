-- Reconstrucción documental de la migración registrada en Supabase como
-- 20261012175618 / restrict_direct_execution_of_trigger_functions.
-- El archivo histórico original no fue encontrado en las ramas consultadas.
-- Basado en la definición y ACL verificadas en producción el 2026-10-13.
--
-- Las funciones RETURNS trigger se invocan mediante sus triggers asociados;
-- los roles de aplicación no necesitan ejecutarlas directamente.

REVOKE EXECUTE ON FUNCTION public.fn_actualizar_fecha_tipo_cambio()
  FROM PUBLIC, anon, authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.fn_validar_correlatividad_tipo_cambio()
  FROM PUBLIC, anon, authenticated, service_role;
