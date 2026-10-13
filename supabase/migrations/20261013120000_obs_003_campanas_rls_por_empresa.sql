-- OBS-003: limitar la lectura de campañas a las empresas autorizadas.
-- ADMIN puede consultar todas las empresas. Los demás usuarios activos
-- solo pueden consultar campañas de empresas con asignación activa.
-- Esta migración no modifica datos de negocio.

BEGIN;

DROP POLICY IF EXISTS usuarios_activos_ver_campanas
    ON public."Dim_Campana";

CREATE POLICY usuarios_activos_ver_campanas
    ON public."Dim_Campana"
    FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR (
            public.get_my_permission() IS NOT NULL
            AND EXISTS (
                SELECT 1
                FROM public.usuarios AS u
                JOIN public.usuario_empresa AS ue
                  ON ue.id_usuario = u.id_usuario
                WHERE u.auth_user_id = auth.uid()
                  AND u.estado = 'ACTIVO'
                  AND ue.id_empresa = "Dim_Campana".id_empresa
                  AND ue.estado IS TRUE
            )
        )
    );

COMMIT;

-- Validación posterior (ejecutar con sesiones/usuarios de prueba, no como postgres):
-- 1. ADMIN activo: ve campañas de las cuatro empresas.
-- 2. ALMACEN activo con asignación activa a una empresa: solo ve campañas de esa empresa.
-- 3. Usuario activo sin asignaciones activas: no ve campañas.
-- 4. Usuario INACTIVO: no ve campañas.
-- 5. Asignación inactiva: no concede acceso a esa empresa.
-- 6. INSERT/UPDATE/DELETE siguen restringidos por las políticas admin existentes.
