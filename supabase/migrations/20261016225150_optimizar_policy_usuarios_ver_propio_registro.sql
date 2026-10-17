DROP POLICY IF EXISTS usuarios_ver_propio_registro ON public.usuarios;
CREATE POLICY usuarios_ver_propio_registro
ON public.usuarios
FOR SELECT
TO authenticated
USING (auth_user_id = (SELECT auth.uid()));
