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
-- - En la verificación de conciliación MIG-05, la migración sí aparece
--   registrada en el historial remoto observado de Supabase.
-- - Los privilegios live observados para authenticated en ambas tablas son
--   SELECT; no se observaron privilegios INSERT, UPDATE ni DELETE.
-- - Por tanto, esta nota histórica queda actualizada con la evidencia actual.
--   No ejecutar repair ni volver a aplicar el SQL como parte de esta revisión.
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
