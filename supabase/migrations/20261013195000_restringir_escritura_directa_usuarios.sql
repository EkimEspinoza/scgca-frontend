-- Seguridad: centralizar las modificaciones de usuarios y sus asignaciones
-- de empresas en flujos autorizados.
--
-- Trazabilidad:
-- - El usuario confirmó que ejecutó manualmente estas dos revocaciones en
--   el proyecto Supabase de producción "Central" el 2026-10-13.
-- - El usuario reportó que las pruebas posteriores fueron satisfactorias.
-- - Este archivo se actualiza para reflejar el SQL aplicado manualmente.
-- - NO volver a ejecutar este SQL en producción como parte de esta
--   reconciliación documental.
-- - La migración no aparece en el historial de migraciones aplicado observado.
--   Después de revisar este PR y verificar que el estado live coincide, la
--   reconciliación del historial debe hacerse por separado con el mecanismo
--   de repair de Supabase CLI en modo "applied"; esa operación no debe ejecutar
--   el contenido SQL. No se ha realizado aquí.
--
-- Alcance:
-- authenticated conserva SELECT sujeto a las políticas RLS existentes.
-- Los flujos autorizados siguen siendo la Edge Function crear-usuario
-- (cliente administrativo) y la RPC actualizar_usuario_con_empresas
-- (SECURITY DEFINER con validación explícita).
-- service_role conserva sus privilegios actuales. No se modifican políticas
-- RLS ni se cambian funciones o triggers.

BEGIN;

REVOKE INSERT, UPDATE, DELETE
ON TABLE public.usuarios
FROM authenticated;

REVOKE INSERT, UPDATE, DELETE
ON TABLE public.usuario_empresa
FROM authenticated;

COMMIT;
