# SCGCA Central — A-04 Reconciliación de migraciones

**Fecha de revisión:** 2026-10-23  
**Alcance:** revisión de solo lectura de Supabase y GitHub.  
**Cambios en producción:** ninguno. No se ejecutaron migraciones ni despliegues.

## Hallazgo

La migración `20261014100000_serializar_validacion_campanas_centros_costo.sql` aparece en el historial remoto `supabase_migrations.schema_migrations` con el nombre `serializar_validacion_campanas_centros_costo`. También figura en la lista de migraciones aplicadas por Supabase.

Sin embargo, el encabezado del archivo histórico en GitHub aún indica:

> Propuesta de migración ... Esta migración está en revisión; NO aplicar en producción hasta revisar y autorizar el PR.

Ese comentario ya no describe el estado operativo confirmado y puede inducir a error durante futuras auditorías.

## Evidencia de la función instalada

La función `public.validar_campana()` existe en producción como `SECURITY DEFINER` y su `search_path` actual es `pg_catalog, public, pg_temp`.

La definición histórica de la migración `20261014100000` establece `search_path = public`. La diferencia está explicada por la migración posterior `20261015200000_endurecer_search_path_security_definer.sql`, que cambia el `search_path` de `validar_campana()` a `pg_catalog, public, pg_temp`.

La función instalada conserva la lógica revisada de serialización mediante bloqueo de filas de Centro de Costo, validación de empresa y tipo, rechazo de solapamientos operativos/contables y continuidad temporal de campañas. Esta constatación se basa en la definición consultada en producción; no sustituye pruebas funcionales de concurrencia.

## Tratamiento recomendado

1. **No volver a ejecutar** la migración `20261014100000`: ya consta como aplicada.
2. **No reescribir su SQL histórico** para que coincida con la función actual. El archivo debe conservar la definición correspondiente a aquella versión.
3. Registrar el estado actual mediante documentación de auditoría, explicando que el encabezado es histórico y que la migración posterior `20261015200000` endureció el `search_path`.
4. Si se decide corregir el encabezado del archivo histórico, hacerlo solo como cambio de comentario, revisado y versionado, sin alterar el SQL ejecutable. La opción más conservadora es mantener el archivo intacto y usar esta nota como aclaración.
5. Para cerrar A-04, conservar evidencia del historial remoto y confirmar que no existan otras migraciones aplicadas con advertencias históricas similares.

## Estado A-04

**Reconciliación técnica: hallazgo identificado y explicado.**  
**Cierre documental integral: pendiente** de revisar otras discrepancias históricas y registrar el resultado final en el BRAIN consolidado.

No se hicieron cambios en la base de datos ni se desplegó código.
