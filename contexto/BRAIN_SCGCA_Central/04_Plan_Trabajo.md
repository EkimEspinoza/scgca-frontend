# Plan de trabajo y seguimiento — SCGCA Central

**Actualizado:** 2026-11-02
La lista registra pendientes y seguimiento. La actualización visual de Centro de Costos y Campañas quedó publicada; Tipo de Cambio recibió la escala compacta, pero su revisión funcional queda pendiente.

## 07. Prioridades y plan de trabajo

El usuario decidió primero ordenar el contexto. Para la siguiente jornada, el 2026-10-28, acordó revisar estos módulos en este orden: Centro de Costos, Campañas y Tipo de Cambio. El alcance de implementación se definirá después de revisar cada módulo. Otros temas para planificar:

1. Elegir y configurar hosting para el frontend.
2. Alinear las cuentas de prueba del piloto Empresas y validar manualmente las pantallas ADMIN de permisos por módulo (PF-010).
3. Resolver la ausencia de ruta Almacén y las rutas del menú sin pantalla.
4. El usuario validó manualmente el piloto QUERY/WRITER/ADMIN en Empresas; todavía falta validar otros módulos cuando reciban RLS granular.
5. Confirmar si existe un proyecto Supabase separado para pruebas; en la cuenta consultada solo apareció Central y no se listaron ramas de desarrollo.
6. Decidir si se mantiene desactivada la protección de contraseñas filtradas y cómo atender alertas de rendimiento.
7. Cerrar documentalmente A-04 y revisar reglas pendientes de campañas, distribución, cierres y reportes.
8. Confirmar la regla BCRP del penúltimo día hábil antes de cambiar esa lógica.

Estos temas no constituyen autorización para modificar producción.

## Registro de trabajo aprobado

| ID | Resultado acordado | Prioridad | Estimación | Estado | Dependencias / bloqueo | Evidencia de cierre |
|---|---|---|---|---|---|---|
| R-01 | Revisar Centro de Costos, luego Campañas y luego Tipo de Cambio | 2026-10-28 | Hecho en parte | En curso | Centro de Costos y Campañas ajustados; escala visual aplicada a Tipo de Cambio. Falta registrar revisión funcional de Tipo de Cambio. | Commit `4db46a2` en GitHub; BRAIN actualizado |
| R-02 | Implementar catálogo de módulos, asignaciones QUERY/WRITER y piloto RLS para Empresas; renombrar READER a WRITER | 2026-10-31 | Incremental | Completado (piloto) | Usuario informó que las pruebas manuales salieron OK. La base muestra prueba 1 y prueba 3 como WRITER en EMPRESAS; prueba 2 está como rol QUERY, pero no tiene asignación al módulo. No extender hasta alinear esa matriz. | Migraciones Supabase `20261031040053`, `20261031040135`, `20261031040723`, `20261031050245`; build local aprobado 2026-10-31 |
| R-03 | Alinear las rutas de los nueve Maestros a ADMIN y al estado activo del módulo en catálogo | 2026-11-02 | Incremental | Integrado en GitHub main | Las rutas siguen siendo ADMIN-only. Build aprobado; prueba manual y publicación en hosting pendientes. | `src/App.jsx`; build Vite 11,773 módulos aprobado 2026-11-02; PR #63 |
| R-04 | Restringir lectura del catálogo de permisos a roles activos y validar RLS de perfiles/asignaciones/catálogos | 2026-11-02 | Puntual | Completado en Supabase | `usuarios`, `usuario_empresa`, `usuario_modulo` y `modulos` ya cumplían el alcance elegido. No se simuló sesión por rol. | Migración `20261102202432_restrict_permission_catalog_reads_to_active_users`; verificación `pg_policies` |

PF-010 está implementada e integrada en GitHub `main`; pendiente validar manualmente los flujos de catálogo y asignación, y publicar el frontend en hosting. La matriz de cuentas de prueba EMPRESAS sigue pendiente de alinear.

Mover al plan solo propuestas acordadas. Mantener su historial y estado en el archivo de propuestas.
