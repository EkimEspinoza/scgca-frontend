-- Restringe la lectura propia a asignaciones de empresa activas.
-- Conserva las asignaciones inactivas para historial y administración.
-- No modifica datos ni privilegios de escritura.

BEGIN;

DROP POLICY IF EXISTS usuario_ver_sus_asignaciones
ON public.usuario_empresa;

CREATE POLICY usuario_ver_sus_asignaciones
ON public.usuario_empresa
FOR SELECT
TO authenticated
USING (
    estado IS TRUE
    AND EXISTS (
        SELECT 1
        FROM public.usuarios AS u
        WHERE u.id_usuario = usuario_empresa.id_usuario
          AND u.auth_user_id = (SELECT auth.uid())
          AND u.estado = 'ACTIVO'
    )
);

COMMIT;
