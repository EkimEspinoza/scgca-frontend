-- Alinear la definición de administrador y proteger al último ADMIN efectivo.
-- El trigger toma el bloqueo global al validar el cambio, cubriendo también
-- escrituras privilegiadas que no pasan por actualizar_usuario_con_empresas().
-- La RPC no debe tomar ese bloqueo antes de bloquear filas: eso invertiría
-- el orden de bloqueos respecto del trigger y podría provocar deadlocks.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios u
    JOIN public.permiso p ON p.id_permiso = u.id_permiso
    WHERE u.auth_user_id = auth.uid()
      AND u.estado = 'ACTIVO'
      AND p.nombre = 'ADMIN'
      AND p.estado = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_my_permission()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT p.nombre
  FROM public.usuarios u
  JOIN public.permiso p ON p.id_permiso = u.id_permiso
  WHERE u.auth_user_id = auth.uid()
    AND u.estado = 'ACTIVO'
    AND p.estado = true
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.proteger_ultimo_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cantidad_admin_activos integer;
  nuevo_es_admin_activo boolean;
BEGIN
  IF TG_OP <> 'UPDATE' THEN
    RETURN NEW;
  END IF;

  -- Serializa cambios al estado/rol de administradores, incluso si proceden
  -- de rutas privilegiadas distintas de la RPC administrativa.
  PERFORM pg_advisory_xact_lock(7412026, 4);

  IF OLD.estado = 'ACTIVO'
     AND EXISTS (
       SELECT 1
       FROM public.permiso p
       WHERE p.id_permiso = OLD.id_permiso
         AND p.nombre = 'ADMIN'
         AND p.estado = true
     )
     AND (
       NEW.estado IS DISTINCT FROM 'ACTIVO'
       OR NEW.id_permiso IS DISTINCT FROM OLD.id_permiso
     )
  THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.permiso p
      WHERE p.id_permiso = NEW.id_permiso
        AND p.nombre = 'ADMIN'
        AND p.estado = true
    ) AND NEW.estado = 'ACTIVO'
    INTO nuevo_es_admin_activo;

    SELECT count(*)::integer
      INTO cantidad_admin_activos
    FROM public.usuarios u
    JOIN public.permiso p ON p.id_permiso = u.id_permiso
    WHERE u.estado = 'ACTIVO'
      AND p.nombre = 'ADMIN'
      AND p.estado = true
      AND u.id_usuario <> OLD.id_usuario;

    IF cantidad_admin_activos = 0 AND NOT COALESCE(nuevo_es_admin_activo, false) THEN
      RAISE EXCEPTION
        'No se puede realizar esta operación porque debe existir al menos un ADMIN activo.'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE ALL ON FUNCTION public.get_my_permission() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_permission() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_permission() TO authenticated;

REVOKE ALL ON FUNCTION public.proteger_ultimo_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.proteger_ultimo_admin() FROM anon;
REVOKE ALL ON FUNCTION public.proteger_ultimo_admin() FROM authenticated;
