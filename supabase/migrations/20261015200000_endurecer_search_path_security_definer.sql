-- Endurece la resolución de objetos en funciones SECURITY DEFINER.
-- Todas las referencias de negocio dentro de estas funciones están calificadas
-- por esquema; pg_catalog queda primero y pg_temp explícitamente al final.
-- No modifica cuerpos, permisos, lógica de negocio ni triggers.

ALTER FUNCTION public.actualizar_usuario_con_empresas(bigint, text, text, bigint, text, bigint[])
  SET search_path = pg_catalog, public, pg_temp;

ALTER FUNCTION public.get_my_permission()
  SET search_path = pg_catalog, public, pg_temp;

ALTER FUNCTION public.handle_new_user()
  SET search_path = pg_catalog, public, pg_temp;

ALTER FUNCTION public.is_admin()
  SET search_path = pg_catalog, public, pg_temp;

ALTER FUNCTION public.proteger_centro_costo_con_campanas()
  SET search_path = pg_catalog, public, pg_temp;

ALTER FUNCTION public.proteger_permiso_admin_activo()
  SET search_path = pg_catalog, public, pg_temp;

ALTER FUNCTION public.proteger_ultimo_admin()
  SET search_path = pg_catalog, public, pg_temp;

ALTER FUNCTION public.validar_campana()
  SET search_path = pg_catalog, public, pg_temp;
