-- PROPUESTA NO EJECUTABLE AUTOMÁTICAMENTE: requiere un contexto autorizado como
-- supabase_admin (actualmente rol superusuario). No mover a supabase/migrations
-- ni aplicar mediante supabase db push hasta aprobar y validar el mecanismo de ejecución.
--
-- Objetivo:
-- 1) Revocar EXECUTE predeterminado global de PUBLIC para funciones nuevas
--    creadas por supabase_admin.
-- 2) Revocar EXECUTE predeterminado en public para anon y authenticated.
-- 3) Conservar el permiso predeterminado de service_role.
--
-- Alcance: privilegios predeterminados de funciones futuras; no modifica ACL
-- de funciones existentes, tablas, secuencias, RLS ni Edge Functions.
--
-- Requisito: ejecutar bajo un contexto que pueda modificar los privilegios
-- predeterminados de supabase_admin. La conexión de auditoría actual es postgres,
-- no es superusuario y no tiene membresía en supabase_admin. No ejecutar desde ella.

BEGIN;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated;

COMMIT;
