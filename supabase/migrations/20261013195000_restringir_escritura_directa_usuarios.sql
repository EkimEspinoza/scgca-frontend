-- Seguridad: centralizar las modificaciones de usuarios en la función
-- public.actualizar_usuario_con_empresas().
--
-- Hallazgo de auditoría:
-- authenticated tiene privilegios SQL de INSERT/UPDATE/DELETE sobre public.usuarios.
-- Aunque RLS limita algunas operaciones, la política de UPDATE para ADMIN permite
-- modificar columnas sensibles como auth_user_id directamente, evitando las
-- validaciones de la función transaccional.
--
-- Esta migración no se ha aplicado a producción. Revisar en PR y verificar que
-- el frontend use actualizar_usuario_con_empresas() para guardar usuarios.

BEGIN;

REVOKE INSERT, UPDATE, DELETE
ON TABLE public.usuarios
FROM authenticated;

COMMIT;

-- Validación posterior en Supabase:
-- 1. authenticated conserva SELECT sujeto a las políticas RLS existentes.
-- 2. authenticated ya no puede hacer INSERT/UPDATE/DELETE directo en usuarios.
-- 3. Un ADMIN activo puede seguir guardando usuarios mediante
--    actualizar_usuario_con_empresas().
-- 4. La creación de usuarios desde Supabase Auth sigue generando la fila
--    pendiente mediante handle_new_user() (SECURITY DEFINER).
-- 5. Un usuario no ADMIN no puede ejecutar con éxito la función de actualización.
-- 6. La protección del último ADMIN sigue funcionando.
--
-- Nota: service_role conserva sus privilegios actuales. No se modifican las
-- políticas RLS ni se cambia la función de actualización en esta migración.
