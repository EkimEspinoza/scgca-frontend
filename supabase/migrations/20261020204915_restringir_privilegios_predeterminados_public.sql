-- Restringe los privilegios predeterminados para objetos nuevos creados por postgres
-- en public. Esto no modifica ACL/RLS de objetos existentes.
--
-- Las nuevas tablas deberán declarar explícitamente GRANT y RLS en su migración.
-- Las nuevas funciones/RPC deberán conceder EXECUTE únicamente a los roles previstos.
-- Se conserva el acceso predeterminado de service_role, usado por tareas privilegiadas.
--
-- Alcance deliberado: rol propietario postgres y esquema public, que es el contexto
-- habitual de las migraciones de la aplicación. No modifica esquemas internos de Supabase.

BEGIN;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;

COMMIT;
