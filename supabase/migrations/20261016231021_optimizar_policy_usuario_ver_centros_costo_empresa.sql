DROP POLICY IF EXISTS usuario_ver_centros_costo_empresa ON public.dim_centro_costo;
CREATE POLICY usuario_ver_centros_costo_empresa
ON public.dim_centro_costo
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.usuario_empresa ue
    JOIN public.usuarios u ON u.id_usuario = ue.id_usuario
    WHERE ue.id_empresa = dim_centro_costo.id_empresa
      AND ue.estado = true
      AND u.auth_user_id = (SELECT auth.uid())
      AND u.estado::text = 'ACTIVO'
  )
);
