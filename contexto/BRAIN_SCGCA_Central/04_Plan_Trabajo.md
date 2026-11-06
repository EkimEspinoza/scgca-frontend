# Plan de trabajo y seguimiento — SCGCA Central

**Actualizado:** 2026-11-05
La lista registra pendientes y seguimiento. La actualización visual de Centro de Costos y Campañas quedó publicada. Tipo de Cambio usa tres decimales y quedó preparado para ingreso manual mientras se identifica una API de SUNAT estable.

## 07. Prioridades y plan de trabajo

El usuario decidió primero ordenar el contexto. Para la siguiente jornada, el 2026-10-28, acordó revisar estos módulos en este orden: Centro de Costos, Campañas y Tipo de Cambio. El alcance de implementación se definirá después de revisar cada módulo. Otros temas para planificar:

1. Elegir y configurar hosting para el frontend.
2. Alinear las cuentas de prueba del piloto Empresas y validar manualmente las pantallas ADMIN de permisos por módulo (PF-010).
3. Resolver la ausencia de ruta Almacén y las rutas del menú sin pantalla.
4. El usuario validó manualmente el piloto QUERY/WRITER/ADMIN en Empresas; todavía falta validar otros módulos cuando reciban RLS granular.
5. Confirmar si existe un proyecto Supabase separado para pruebas; en la cuenta consultada solo apareció Central y no se listaron ramas de desarrollo.
6. Decidir si se mantiene desactivada la protección de contraseñas filtradas y cómo atender alertas de rendimiento.
7. Cerrar documentalmente A-04 y revisar reglas pendientes de campañas, distribución, cierres y reportes.
8. Encontrar y validar una API estable para obtener la venta SUNAT del último día de cada mes.

Estos temas no constituyen autorización para modificar producción.

## Registro de trabajo aprobado

| ID | Resultado acordado | Prioridad | Estimación | Estado | Dependencias / bloqueo | Evidencia de cierre |
|---|---|---|---|---|---|---|
| R-01 | Revisar Centro de Costos, luego Campañas y luego Tipo de Cambio | 2026-10-28 | Hecho en parte | En curso | Centro de Costos y Campañas ajustados; escala visual aplicada a Tipo de Cambio. Falta registrar revisión funcional de Tipo de Cambio. | Commit `4db46a2` en GitHub; BRAIN actualizado |
| R-02 | Implementar catálogo de módulos, asignaciones QUERY/WRITER y piloto RLS para Empresas; renombrar READER a WRITER | 2026-10-31 | Incremental | Completado (piloto) | Usuario informó que las pruebas manuales salieron OK. La base muestra prueba 1 y prueba 3 como WRITER en EMPRESAS; prueba 2 está como rol QUERY, pero no tiene asignación al módulo. No extender hasta alinear esa matriz. | Migraciones Supabase `20261031040053`, `20261031040135`, `20261031040723`, `20261031050245`; build local aprobado 2026-10-31 |
| R-03 | Alinear las rutas de los nueve Maestros a ADMIN y al estado activo del módulo en catálogo | 2026-11-02 | Incremental | Integrado en GitHub main | Las rutas siguen siendo ADMIN-only. Build aprobado; prueba manual y publicación en hosting pendientes. | `src/App.jsx`; build Vite 11,773 módulos aprobado 2026-11-02; PR #63 |
| R-04 | Restringir lectura del catálogo de permisos a roles activos y validar RLS de perfiles/asignaciones/catálogos | 2026-11-02 | Puntual | Completado en Supabase | `usuarios`, `usuario_empresa`, `usuario_modulo` y `modulos` ya cumplían el alcance elegido. No se simuló sesión por rol. | Migración `20261102202432_restrict_permission_catalog_reads_to_active_users`; verificación `pg_policies` |
| R-05 | Simplificar roles globales y dejar Tipo de Cambio con valor inicial 1.000 editable manualmente | 2026-11-02 | Puntual | Completado en Supabase y local | API directa de SUNAT aún no identificada. Cambios frontend pendientes de integrar a GitHub `main`. | Migraciones `20261102205813` y `20261102213154`; Edge Function BCRP eliminada de Supabase; build local aprobado antes de los últimos cambios visuales |
| R-06 | Modularizar seis pantallas de maestros y reducir la carga inicial con `import()` dinámico para Excel y páginas diferidas | 2026-11-04 | Incremental | Build local aprobado; pendiente publicar en GitHub | No se ejecutaron pruebas unitarias, lint ni medición de red en navegador. El chunk de Supabase continúa en 332.09 KB y requiere medición de carga real si se desea optimizarlo después. | Build Vite 8.2.2: entrada 353.86 KB; `excelService` 331.07 KB diferido; sin advertencia >500 KB. `git diff --check` sin errores |
| R-07 | Completar y rediseñar Distribución mensual desde referencia visual multimes | 2026-11-05 | Incremental | Código local integrado en `main`; esquema/migraciones aplicados en Supabase; validación manual pendiente | Validar selector mínimo 2017, matriz mensual, edición, borrador, cierres independientes y reapertura ADMIN. Máximo 3 meses por rango. Importación/exportación Excel quedan como implementaciones futuras; no se muestra variedad ni se filtra por campaña. | Build local aprobado; consulta SQL confirmó 0.0000 % al centro excluido y 25.0000 % a los otros cuatro. Las 49 migraciones locales coinciden por versión con Supabase. |
| R-08 | Diseñar e implementar Mov_Tareo para registrar horas trabajadas de maquinaria por centro de costo de inversión Campo, Vivero y LEVANTE | 2026-11-05 | Incremental | Siguiente módulo acordado; alcance funcional por detallar | Al iniciar, definir campos, período de registro, cómo se identifica maquinaria y centro de costo, reglas de validación, edición, cierre y permisos. No asumir estos detalles antes de revisarlos. | Requisito de alto nivel acordado por el usuario; implementación aún no iniciada. |
PF-010 está implementada e integrada en GitHub `main`; pendiente validar manualmente los flujos de catálogo y asignación, y publicar el frontend en hosting. La matriz de cuentas de prueba EMPRESAS sigue pendiente de alinear.

Mover al plan solo propuestas acordadas. Mantener su historial y estado en el archivo de propuestas.

## Siguiente módulo

Después de alinear local, GitHub y Supabase, el siguiente módulo de trabajo será **Mov_Tareo**. Su objetivo acordado es registrar las horas trabajadas por maquinaria para centros de costo de inversión de **Campo, Vivero y LEVANTE**. El modelo de datos y el flujo de captura se definirán antes de implementar.
