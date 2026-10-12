-- Actualización atómica del perfil y las empresas asignadas a un usuario.
-- Esta migración se versiona en Git; no se aplica automáticamente a Supabase.

CREATE OR REPLACE FUNCTION public.actualizar_usuario_con_empresas(
  p_id_usuario bigint,
  p_nombre text,
  p_apellido text,
  p_id_permiso bigint,
  p_estado text,
  p_empresas bigint[] DEFAULT ARRAY[]::bigint[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_solicitante bigint;
  v_permiso_nombre text;
  v_permiso_activo boolean;
  v_cantidad_empresas integer;
  v_cantidad_empresas_validas integer;
  v_empresa bigint;
BEGIN
  -- SECURITY DEFINER omite las políticas RLS dentro de la función:
  -- se verifica explícitamente que quien llama sea ADMIN.
  SELECT u.id_usuario
    INTO v_solicitante
  FROM public.usuarios u
  JOIN public.permiso p ON p.id_permiso = u.id_permiso
  WHERE u.auth_user_id = auth.uid()
    AND u.estado = 'ACTIVO'
    AND p.nombre = 'ADMIN'
    AND p.estado = true
  FOR UPDATE OF u;

  IF v_solicitante IS NULL THEN
    RAISE EXCEPTION 'Solo un administrador activo puede actualizar usuarios.'
      USING ERRCODE = '42501';
  END IF;

  IF p_id_usuario IS NULL OR p_id_permiso IS NULL THEN
    RAISE EXCEPTION 'El usuario y el permiso son obligatorios.';
  END IF;

  IF NULLIF(btrim(p_nombre), '') IS NULL THEN
    RAISE EXCEPTION 'El nombre es obligatorio.';
  END IF;

  IF p_estado IS NULL OR p_estado NOT IN ('PENDIENTE', 'ACTIVO', 'INACTIVO') THEN
    RAISE EXCEPTION 'El estado del usuario no es válido.';
  END IF;

  SELECT p.nombre, p.estado
    INTO v_permiso_nombre, v_permiso_activo
  FROM public.permiso p
  WHERE p.id_permiso = p_id_permiso;

  IF NOT FOUND OR v_permiso_activo IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'El permiso seleccionado no existe o está inactivo.';
  END IF;

  -- Bloquear el usuario objetivo y detectar IDs inexistentes.
  PERFORM 1
  FROM public.usuarios u
  WHERE u.id_usuario = p_id_usuario
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El usuario que intenta actualizar no existe.';
  END IF;

  IF p_empresas IS NULL THEN
    RAISE EXCEPTION 'La lista de empresas no puede ser nula.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM unnest(p_empresas) AS e(id_empresa)
    WHERE e.id_empresa IS NULL
  ) THEN
    RAISE EXCEPTION 'La lista contiene un identificador de empresa inválido.';
  END IF;

  SELECT count(*), count(DISTINCT e.id_empresa)
    INTO v_cantidad_empresas, v_cantidad_empresas_validas
  FROM unnest(p_empresas) AS e(id_empresa);

  IF v_cantidad_empresas <> v_cantidad_empresas_validas THEN
    RAISE EXCEPTION 'La lista contiene empresas duplicadas.';
  END IF;

  SELECT count(*)
    INTO v_cantidad_empresas_validas
  FROM public."Dim_Empresa" de
  WHERE de.id_empresa = ANY(p_empresas)
    AND de.estado = true;

  IF v_cantidad_empresas_validas <> v_cantidad_empresas THEN
    RAISE EXCEPTION 'Una o más empresas seleccionadas no existen o están inactivas.';
  END IF;

  -- Los administradores no necesitan asignaciones individuales.
  IF v_permiso_nombre <> 'ADMIN' AND cardinality(p_empresas) = 0 THEN
    RAISE EXCEPTION 'Los usuarios que no son ADMIN deben tener al menos una empresa activa.';
  END IF;

  UPDATE public.usuarios
  SET nombre = btrim(p_nombre),
      apellido = COALESCE(btrim(p_apellido), ''),
      id_permiso = p_id_permiso,
      estado = p_estado,
      updated_at = now()
  WHERE id_usuario = p_id_usuario;

  -- Desactivar asignaciones previas y restaurar/insertar la selección.
  UPDATE public.usuario_empresa
  SET estado = false
  WHERE id_usuario = p_id_usuario
    AND estado = true;

  FOREACH v_empresa IN ARRAY p_empresas LOOP
    UPDATE public.usuario_empresa
    SET estado = true
    WHERE id_usuario = p_id_usuario
      AND id_empresa = v_empresa;

    IF NOT FOUND THEN
      INSERT INTO public.usuario_empresa (id_usuario, id_empresa, estado)
      VALUES (p_id_usuario, v_empresa, true);
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'id_usuario', p_id_usuario,
    'empresas_activas', cardinality(p_empresas)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.actualizar_usuario_con_empresas(bigint, text, text, bigint, text, bigint[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.actualizar_usuario_con_empresas(bigint, text, text, bigint, text, bigint[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.actualizar_usuario_con_empresas(bigint, text, text, bigint, text, bigint[]) TO authenticated;
