-- Auditoría de solo lectura para detectar funciones expuestas en public.
-- No modifica ACL, privilegios predeterminados ni objetos.
-- Ejecutar desde un rol con permiso de lectura de catálogos.

-- 1) Funciones públicas con propietario supabase_admin o EXECUTE efectivo
--    para anon/authenticated.
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS identity_arguments,
  pg_get_userbyid(p.proowner) AS owner,
  has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_can_execute,
  has_function_privilege('service_role', p.oid, 'EXECUTE') AS service_role_can_execute,
  p.prosecdef AS security_definer,
  p.proconfig AS function_settings
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND (
    pg_get_userbyid(p.proowner) = 'supabase_admin'
    OR has_function_privilege('anon', p.oid, 'EXECUTE')
    OR has_function_privilege('authenticated', p.oid, 'EXECUTE')
  )
ORDER BY owner, function_name, identity_arguments;

-- 2) Privilegios predeterminados de funciones configurados por propietario.
SELECT
  pg_get_userbyid(d.defaclrole) AS owner,
  n.nspname AS schema_name,
  d.defaclobjtype AS object_type,
  d.defaclacl AS default_acl
FROM pg_default_acl d
LEFT JOIN pg_namespace n ON n.oid = d.defaclnamespace
WHERE d.defaclobjtype = 'f'
  AND (n.nspname = 'public' OR d.defaclnamespace = 0)
ORDER BY owner, schema_name;
