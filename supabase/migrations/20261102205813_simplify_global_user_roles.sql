-- Reduce los permisos globales a ADMIN y USUARIO.
-- QUERY/WRITER se mantienen exclusivamente en usuario_modulo.nivel.

INSERT INTO public.permiso (nombre, descripcion, estado)
VALUES (
    'USUARIO',
    'Usuario normal. Su acceso depende de los módulos y niveles asignados.',
    true
)
ON CONFLICT (nombre) DO UPDATE
SET descripcion = EXCLUDED.descripcion,
    estado = true;

DO $migration$
DECLARE
    v_permiso_usuario bigint;
BEGIN
    SELECT id_permiso
    INTO v_permiso_usuario
    FROM public.permiso
    WHERE nombre = 'USUARIO'
      AND estado IS TRUE;

    IF v_permiso_usuario IS NULL THEN
        RAISE EXCEPTION 'No se pudo resolver el permiso global USUARIO.';
    END IF;

    -- Conserva intactas las asignaciones QUERY/WRITER de usuario_modulo.
    UPDATE public.usuarios
    SET id_permiso = v_permiso_usuario,
        updated_at = now()
    WHERE id_permiso IN (
        SELECT id_permiso
        FROM public.permiso
        WHERE nombre IN ('QUERY', 'WRITER')
    );

    -- Se conservan los registros históricos, pero ya no aparecen como roles
    -- globales disponibles para asignar.
    UPDATE public.permiso
    SET estado = false
    WHERE nombre IN ('QUERY', 'WRITER')
      AND estado IS TRUE;
END;
$migration$;

CREATE OR REPLACE FUNCTION private.can_access_module(
    p_codigo text,
    p_min_level text DEFAULT 'QUERY'
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'private', 'pg_temp'
AS $function$
    SELECT CASE
        WHEN (SELECT auth.uid()) IS NULL THEN false
        WHEN (SELECT private.is_admin()) THEN true
        WHEN p_min_level NOT IN ('QUERY', 'WRITER') THEN false
        ELSE EXISTS (
            SELECT 1
            FROM public.usuarios u
            JOIN public.permiso p ON p.id_permiso = u.id_permiso
            JOIN public.usuario_modulo um ON um.id_usuario = u.id_usuario
            JOIN public.modulos m ON m.id_modulo = um.id_modulo
            WHERE u.auth_user_id = (SELECT auth.uid())
              AND u.estado = 'ACTIVO'
              AND p.estado IS TRUE
              AND p.nombre = 'USUARIO'
              AND um.estado IS TRUE
              AND m.estado IS TRUE
              AND m.codigo = p_codigo
              AND (um.nivel = 'WRITER' OR p_min_level = 'QUERY')
        )
    END;
$function$;

REVOKE ALL ON FUNCTION private.can_access_module(text, text)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.can_access_module(text, text)
TO authenticated;
