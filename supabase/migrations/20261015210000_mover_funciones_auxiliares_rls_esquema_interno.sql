-- Reduce la superficie de API de las funciones auxiliares usadas por RLS.
-- Las expresiones de políticas existentes conservan la referencia a las funciones
-- por OID al cambiar de esquema; no es necesario recrear las políticas.
-- La RPC actualizar_usuario_con_empresas permanece en public porque el frontend
-- la invoca mediante PostgREST y valida que el solicitante sea ADMIN activo.
--
-- PRECONDICIÓN DE DESPLIEGUE:
-- Verificar en Supabase Dashboard > API Settings que el esquema "private" NO esté
-- incluido en Exposed schemas. No agregarlo a la lista expuesta.

BEGIN;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;

ALTER FUNCTION public.get_my_permission() SET SCHEMA private;
ALTER FUNCTION public.is_admin() SET SCHEMA private;

-- Las políticas RLS siguen llamando estas funciones para usuarios autenticados.
GRANT EXECUTE ON FUNCTION private.get_my_permission() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

-- Impedir invocación por usuarios anónimos.
REVOKE EXECUTE ON FUNCTION private.get_my_permission() FROM anon;
REVOKE EXECUTE ON FUNCTION private.is_admin() FROM anon;

COMMIT;
