-- Bloquea la lectura de empresas, centros de costo y asignaciones propias
-- cuando el usuario no tiene un permiso activo.
-- Dim_Campana ya exige private.get_my_permission() y no se modifica.
-- Conserva las políticas administrativas y los privilegios de escritura.

BEGIN;

DROP POLICY IF EXISTS usuario_ver_empresas_asignadas
ON public."Dim_Empresa";

CREATE POLICY usuario_ver_empresas_asignadas
ON public."Dim_Empresa"
FOR SELECT
TO authenticated
USING (
    private.get_my_permission() IS NOT NULL
    AND EXISTS (
        SELECT 1
        FROM public.usuario_empresa AS ue
        JOIN public.usuarios AS u
          ON u.id_usuario = ue.id_usuario
        WHERE ue.id_empresa = "Dim_Empresa".id_empresa
          AND ue.estado IS TRUE
          AND u.auth_user_id = (SELECT auth.uid())
          AND u.estado::text = 'ACTIVO'
    )
);

DROP POLICY IF EXISTS usuario_ver_centros_costo_empresa
ON public.dim_centro_costo;

CREATE POLICY usuario_ver_centros_costo_empresa
ON public.dim_centro_costo
FOR SELECT
TO authenticated
USING (
    private.get_my_permission() IS NOT NULL
    AND EXISTS (
        SELECT 1
        FROM public.usuario_empresa AS ue
        JOIN public.usuarios AS u
          ON u.id_usuario = ue.id_usuario
        WHERE ue.id_empresa = dim_centro_costo.id_empresa
          AND ue.estado IS TRUE
          AND u.auth_user_id = (SELECT auth.uid())
          AND u.estado::text = 'ACTIVO'
    )
);

DROP POLICY IF EXISTS usuario_ver_sus_asignaciones
ON public.usuario_empresa;

CREATE POLICY usuario_ver_sus_asignaciones
ON public.usuario_empresa
FOR SELECT
TO authenticated
USING (
    private.get_my_permission() IS NOT NULL
    AND estado IS TRUE
    AND EXISTS (
        SELECT 1
        FROM public.usuarios AS u
        WHERE u.id_usuario = usuario_empresa.id_usuario
          AND u.auth_user_id = (SELECT auth.uid())
          AND u.estado::text = 'ACTIVO'
    )
);

COMMIT;
