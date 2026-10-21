# Propuesta de seguridad: privilegios predeterminados de funciones de supabase_admin

**Estado:** propuesta en revisión; no aplicada a Supabase.  
**Proyecto:** SCGCA Central.  
**Fecha:** 2026-10-21.

## Hallazgo

La configuración observada de privilegios predeterminados para funciones creadas por `supabase_admin` en el esquema `public` concede `EXECUTE` a `anon`, `authenticated` y `service_role`. En cambio, las restricciones existentes cubren al propietario `postgres`, no a `supabase_admin`.

Esto no demuestra por sí mismo una vulnerabilidad en funciones existentes. La revisión de la lista actual de funciones públicas encontró 11 funciones propiedad de `postgres`; no se identificaron funciones públicas actuales propiedad de `supabase_admin`.

## Propuesta

Ver `restrict_supabase_admin_function_defaults.sql`. La propuesta:

1. Revoca el permiso predeterminado `EXECUTE` de `PUBLIC` para funciones nuevas creadas por `supabase_admin`.
2. Revoca el permiso predeterminado `EXECUTE` de `anon` y `authenticated` para funciones nuevas en `public`.
3. Conserva el permiso predeterminado de `service_role`.
4. No cambia las ACL de funciones existentes ni modifica tablas, RLS, secuencias o Edge Functions.

## Bloqueo operativo que debe resolverse antes de aplicar

La conexión usada en la revisión reporta `current_user = postgres`, `postgres.rolsuper = false` y `supabase_admin.rolsuper = true`. Además, `postgres` no es miembro de `supabase_admin`. Por tanto, no debe asumirse que una migración ejecutada por el flujo habitual `supabase db push` puede alterar los privilegios predeterminados de ese propietario.

**No ejecutar esta propuesta mediante el flujo normal de migraciones hasta validar un mecanismo autorizado de ejecución como propietario o por un administrador con capacidad suficiente.** No ampliar privilegios a `postgres` ni otorgar membresías para sortear el bloqueo.

## Plan de implementación y validación

### Antes del cambio
- [ ] Confirmar con documentación/soporte de Supabase cuál es el mecanismo admitido para alterar los default privileges de `supabase_admin`.
- [ ] Confirmar el contexto efectivo de ejecución de migraciones en un entorno de prueba autorizado.
- [ ] Guardar el estado previo de `pg_default_acl` para `supabase_admin`, tanto global como en `public`.
- [ ] Revisar dependencias de funciones creadas por el proveedor y distinguirlas de funciones propias.

### Después de la aplicación autorizada
- [ ] Consultar `pg_default_acl` y comprobar que `PUBLIC`, `anon` y `authenticated` no reciben `EXECUTE` predeterminado según el alcance acordado.
- [ ] Confirmar que `service_role` conserva el permiso predeterminado acordado.
- [ ] Verificar que las ACL de funciones existentes no cambiaron.
- [ ] Probar login y flujos principales del frontend.
- [ ] Probar `crear-usuario` y `actualizar-usuario` con ADMIN activo.
- [ ] Probar el rechazo de ambas Edge Functions con sesiones ALMACEN y CONSULTA, confirmando 403 y ausencia de escrituras.
- [ ] Probar que las RPC necesarias conservan los GRANT explícitos esperados.
- [ ] Revisar logs y asesores de seguridad después del cambio.

## Reversión

La reversión debe restaurar exactamente los privilegios predeterminados previos documentados antes del cambio. No aplicar un `GRANT EXECUTE TO PUBLIC` genérico sin revisar el estado previo, ya que podría ampliar privilegios globalmente más allá de `public`.

## Evidencia y decisiones
- Consultas de solo lectura realizadas en producción; no se han modificado privilegios ni datos.
- No se ha ejecutado la propuesta ni se ha desplegado código.
- La decisión de aplicar el cambio requiere aprobación posterior y confirmación del mecanismo autorizado.
