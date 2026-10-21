-- Exige una asignación de empresa activa para leer campañas.
-- Mantiene el acceso global de administradores activos y limita al resto
-- de usuarios a campañas de empresas asignadas de forma activa.
-- La política se alinea con las reglas de lectura de Dim_Empresa,
-- dim_centro_costo y usuario_empresa.

BEGIN;

DROP POLICY IF EXISTS usuarios_activos_ver_campanas
ON public."Dim_Campana";

CREATE POLICY usuarios_activos_ver_campanas
ON public."Dim_Campana"
FOR SELECT
TO authenticated
USING (
    private.is_admin()
    OR (
        private.get_my_permission() IS NOT NULL
        AND EXISTS (
            SELECT 1
            FROM public.usuarios AS u
            JOIN public.usuario_empresa AS ue
              ON ue.id_usuario = u.id_usuario
            WHERE u.auth_user_id = (SELECT auth.uid())
              AND u.estado::text = 'ACTIVO'
              AND ue.id_empresa = "Dim_Campana".id_empresa
              AND ue.estado IS TRUE
        )
    )
);

COMMIT;
