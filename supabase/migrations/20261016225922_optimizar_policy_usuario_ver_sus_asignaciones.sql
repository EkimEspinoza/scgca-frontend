DROP POLICY IF EXISTS usuario_ver_sus_asignaciones ON public.usuario_empresa;
CREATE POLICY usuario_ver_sus_asignaciones
ON public.usuario_empresa
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.usuarios u
    WHERE u.id_usuario = usuario_empresa.id_usuario
      AND u.auth_user_id = (SELECT auth.uid())
      AND u.estado::text = 'ACTIVO'
  )
);
