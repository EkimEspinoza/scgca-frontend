DROP POLICY IF EXISTS usuario_ver_empresas_asignadas ON public."Dim_Empresa";
CREATE POLICY usuario_ver_empresas_asignadas
ON public."Dim_Empresa"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.usuario_empresa ue
    JOIN public.usuarios u ON u.id_usuario = ue.id_usuario
    WHERE ue.id_empresa = "Dim_Empresa".id_empresa
      AND ue.estado = true
      AND u.auth_user_id = (SELECT auth.uid())
      AND u.estado::text = 'ACTIVO'
  )
);
