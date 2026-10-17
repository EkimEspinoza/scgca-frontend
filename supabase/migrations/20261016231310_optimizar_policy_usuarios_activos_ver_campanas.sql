DROP POLICY IF EXISTS usuarios_activos_ver_campanas ON public."Dim_Campana";
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
      FROM public.usuarios u
      JOIN public.usuario_empresa ue ON ue.id_usuario = u.id_usuario
      WHERE u.auth_user_id = (SELECT auth.uid())
        AND u.estado::text = 'ACTIVO'
        AND ue.id_empresa = "Dim_Campana".id_empresa
        AND ue.estado IS TRUE
    )
  )
);
