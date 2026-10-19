-- Restringe la escritura directa del rol authenticated sobre el catálogo de permisos.
-- El mantenimiento de public.permiso se realiza mediante cambios técnicos controlados.
REVOKE INSERT, UPDATE, DELETE
ON TABLE public.permiso
FROM authenticated;
