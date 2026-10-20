-- Complementa la restricción de privilegios predeterminados en public.
-- PostgreSQL concede EXECUTE a PUBLIC por defecto en funciones nuevas.
-- La revocación específica de un esquema no elimina ese permiso global heredado.
-- Este cambio afecta únicamente funciones futuras creadas por postgres:
-- no altera ACL de funciones existentes ni cambia los permisos de objetos actuales.
--
-- Se revoca globalmente el EXECUTE predeterminado para PUBLIC y, en public,
-- también para anon y authenticated. Las RPC necesarias para PostgREST deben
-- conceder EXECUTE explícitamente en su migración correspondiente.
-- No se modifica el esquema graphql ni los privilegios predeterminados de otros
-- propietarios (por ejemplo supabase_admin).

BEGIN;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated;

COMMIT;
