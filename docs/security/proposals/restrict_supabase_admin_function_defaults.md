# Revisión de privilegios predeterminados de funciones de supabase_admin

**Estado:** investigación documental; no aplicada a Supabase.  
**Proyecto:** SCGCA Central.  
**Fecha:** 2026-10-21.

## Hallazgo confirmado en SCGCA

La configuración observada de privilegios predeterminados para funciones creadas por `supabase_admin` en el esquema `public` concede `EXECUTE` a `anon`, `authenticated` y `service_role`. Las restricciones existentes cubren al propietario `postgres`, no a `supabase_admin`.

Esto no demuestra por sí mismo una vulnerabilidad en funciones existentes. La revisión de la lista actual encontró 11 funciones públicas, todas propiedad de `postgres`; no se identificaron funciones públicas actuales propiedad de `supabase_admin`.

## Resultado de la verificación de mecanismo

La documentación oficial de Supabase describe `supabase_admin` como un rol interno que utiliza Supabase para tareas administrativas, actualizaciones y automatizaciones. También explica que en proyectos alojados no se proporciona superusuario al rol `postgres`, y que algunas operaciones que requieren privilegios de superusuario no están disponibles. La guía oficial de migraciones de Supabase documenta la revocación de privilegios predeterminados para el propietario `postgres`, pero no documenta un flujo soportado para cambiar los privilegios predeterminados del rol interno `supabase_admin` desde una migración de aplicación.

Fuentes oficiales consultadas:
- https://supabase.com/docs/guides/database/postgres/roles-superuser
- https://supabase.com/docs/guides/database/postgres/roles
- https://supabase.com/docs/guides/deployment/branching/working-with-branches
- Referencia PostgreSQL sobre alcance de `ALTER DEFAULT PRIVILEGES`: https://www.postgresql.org/docs/17/sql-alterdefaultprivileges.html

La conexión usada en la revisión reporta `current_user = postgres`, `postgres.rolsuper = false` y `supabase_admin.rolsuper = true`. Además, `postgres` no es miembro de `supabase_admin`. La documentación de PostgreSQL establece que los privilegios predeterminados de un rol solo pueden modificarse por ese rol o por un rol miembro autorizado; la conexión actual no satisface esa condición.

**Conclusión:** no se ha encontrado un mecanismo de aplicación soportado y verificable para cambiar los default privileges del rol interno `supabase_admin` desde el flujo normal de migraciones de SCGCA. No debe ejecutarse ese cambio mediante `supabase db push` ni intentarse eludir la restricción con elevación de privilegios. La confirmación definitiva de si Supabase ofrece un procedimiento interno específico requiere respuesta de Supabase Support.

## Objetivo de seguridad

Para funciones futuras creadas por `supabase_admin` en `public`, evaluar si Supabase ofrece un procedimiento soportado para retirar los privilegios predeterminados de ejecución a `PUBLIC`, `anon` y `authenticated`, conservando los accesos necesarios para `service_role` y los GRANT explícitos requeridos por funciones legítimas.

No se propone alterar ACL de funciones existentes, tablas, secuencias, RLS ni Edge Functions.

## Alternativas seguras

Se añadió `docs/security/audits/audit_public_function_privileges.sql`, una consulta de solo lectura para detectar funciones en `public` propiedad de `supabase_admin` y funciones con `EXECUTE` efectivo para `anon` o `authenticated`. La consulta también lista los privilegios predeterminados observados. Es un control de detección, no un bloqueo preventivo.

1. **Recomendada ahora:** conservar el estado actual y solicitar a Supabase Support confirmación escrita del mecanismo soportado, si existe.
2. **Control de prevención en SCGCA:** mantener todas las funciones de aplicación bajo el propietario `postgres`, restringir sus privilegios predeterminados con las migraciones existentes y revisar cambios de ownership en auditorías futuras.
3. **Control de detección:** añadir una consulta de auditoría periódica que detecte funciones nuevas en `public` propiedad de `supabase_admin` o con `EXECUTE` efectivo para `anon`/`authenticated`, y revisar cada resultado antes de actuar. Esto detecta posibles cambios; no modifica privilegios ni bloquea la creación.
4. No cambiar la propiedad de objetos internos de Supabase, no otorgar membresías a roles internos y no crear triggers/event triggers para interceptar objetos del proveedor.

## Pruebas y criterios de cierre si Support ofrece un mecanismo

- Obtener el procedimiento oficial y confirmar que aplica a proyectos alojados.
- Probarlo en un entorno no productivo con la misma modalidad de despliegue.
- Capturar el estado previo de `pg_default_acl` y el inventario de funciones.
- Confirmar que los privilegios predeterminados cambian únicamente en el alcance aprobado.
- Verificar que las ACL de funciones existentes no cambiaron.
- Probar inicio de sesión, los flujos principales, `crear-usuario` y `actualizar-usuario`.
- Probar el rechazo de ambas Edge Functions con sesiones ALMACEN y CONSULTA, verificando ausencia de escrituras.
- Revisar logs y asesores de Supabase.

## Reversión

Si se aprueba un cambio, guardar antes el estado exacto de los privilegios predeterminados. La reversión debe restaurar ese estado; no conceder `EXECUTE` a `PUBLIC` de forma genérica.

## Evidencia y decisiones

- Consultas de solo lectura realizadas en producción.
- No se han modificado privilegios ni datos.
- La propuesta SQL directa se retiró del PR porque no se ha confirmado que ese mecanismo sea soportado desde el flujo disponible.
- El PR sigue siendo un borrador documental; no hay migración ejecutable ni despliegue.
- La siguiente acción es consultar a Supabase Support si se necesita eliminar esa diferencia de privilegios internos. Mientras no exista respuesta, se recomienda el control preventivo y de detección descrito arriba.
