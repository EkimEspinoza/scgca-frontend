-- Los perfiles activos pueden consultar únicamente los permisos activos para
-- resolver su propio nivel de acceso. ADMIN puede consultar también permisos
-- inactivos desde la administración. La tabla permanece de solo lectura por
-- Data API; sus cambios se gestionan mediante migraciones.
DROP POLICY IF EXISTS usuarios_autenticados_ver_permisos
    ON public.permiso;

CREATE POLICY usuarios_activos_ver_permisos
    ON public.permiso
    FOR SELECT
    TO authenticated
    USING (
        (SELECT private.is_admin())
        OR (
            estado IS TRUE
            AND (SELECT private.get_my_permission()) IS NOT NULL
        )
    );
