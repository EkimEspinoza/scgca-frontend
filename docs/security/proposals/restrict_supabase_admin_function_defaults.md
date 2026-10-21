# Revisión de privilegios predeterminados de funciones de supabase_admin

**Estado:** investigación y propuesta documental; no aplicada a Supabase.  
**Proyecto:** SCGCA Central.  
**Fecha:** 2026-10-21.

## Hallazgo confirmado

La configuración observada de privilegios predeterminados para funciones creadas por `supabase_admin` en el esquema `public` concede `EXECUTE` a `anon`, `authenticated` y `service_role`. Las restricciones existentes cubren al propietario `postgres`, no a `supabase_admin`.

Esto no demuestra por sí mismo una vulnerabilidad en funciones existentes. La revisión de la lista actual encontró 11 funciones públicas, todas propiedad de `postgres`; no se identificaron funciones públicas actuales propiedad de `supabase_admin`.

## Restricción operativa confirmada

La conexión usada en la revisión reporta `current_user = postgres`, `postgres.rolsuper = false` y `supabase_admin.rolsuper = true`. Además, `postgres` no es miembro de `supabase_admin`. Por tanto, no debe asumirse que una migración normal puede cambiar los privilegios predeterminados de ese propietario.

**No se debe intentar modificar estos privilegios desde la conexión actual ni conceder membresías/atributos elevados para sortear la limitación.** Tampoco se debe mover una instrucción `ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin` a una migración de producción hasta confirmar que Supabase admite y autoriza ese mecanismo en este proyecto.

## Objetivo de seguridad

Para funciones futuras creadas por `supabase_admin` en `public`, evaluar si es posible retirar los privilegios predeterminados de ejecución a `PUBLIC`, `anon` y `authenticated`, conservando los accesos necesarios para `service_role` y los GRANT explícitos requeridos por las funciones legítimas.

No se propone alterar ACL de funciones existentes, tablas, secuencias, RLS ni Edge Functions.

## Próximos pasos seguros

1. Consultar documentación oficial o soporte de Supabase para determinar si el cliente permite administrar default privileges de `supabase_admin` y cuál es el mecanismo autorizado.
2. Confirmar en un entorno de prueba administrado por el mismo proveedor qué rol ejecuta las migraciones y si la operación está soportada.
3. Capturar el estado previo de `pg_default_acl` y el inventario de funciones antes de cualquier cambio.
4. Si existe un mecanismo oficialmente soportado, preparar una migración apropiada para ese mecanismo, con revisión por pares y aprobación explícita.
5. Si no existe un mecanismo admitido, registrar el límite y evaluar alternativas soportadas; no intentar elevar privilegios desde la aplicación.
6. Validar que los permisos predeterminados deseados se aplican solo a funciones nuevas y que las funciones actuales no cambian.

## Pruebas posteriores, solo si el cambio llega a autorizarse

- Verificar el estado de los privilegios predeterminados.
- Confirmar que las ACL de funciones existentes no cambiaron.
- Probar inicio de sesión y los flujos principales del frontend.
- Probar `crear-usuario` y `actualizar-usuario` con ADMIN activo.
- Probar el rechazo de ambas Edge Functions con sesiones ALMACEN y CONSULTA, verificando ausencia de escrituras.
- Confirmar los GRANT explícitos de las RPC necesarias.
- Revisar logs y asesores de Supabase.

## Reversión

Antes de cualquier cambio, guardar el estado exacto de los privilegios predeterminados. La reversión debe restaurar ese estado, no conceder `EXECUTE` a `PUBLIC` de forma genérica.

## Evidencia y decisiones

- Consultas de solo lectura realizadas en producción.
- No se han modificado privilegios ni datos.
- La propuesta SQL que intentaba cambiar directamente los privilegios de `supabase_admin` se retiró del PR porque no se ha confirmado que el mecanismo sea soportado desde el flujo disponible.
- El PR sigue siendo un borrador documental; no hay migración ejecutable ni despliegue.
