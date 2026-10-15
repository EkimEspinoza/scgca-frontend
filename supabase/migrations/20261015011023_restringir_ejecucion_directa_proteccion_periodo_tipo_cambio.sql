-- La función solo debe ejecutarse mediante su trigger, no invocarse directamente por clientes.
REVOKE EXECUTE
ON FUNCTION public.impedir_cambio_periodo_tipo_cambio()
FROM PUBLIC, anon, authenticated, service_role;
