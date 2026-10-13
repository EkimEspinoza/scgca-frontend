# Reconciliación de la restricción de escrituras de usuarios

**Fecha de registro:** 2026-10-13  
**Proyecto Supabase:** `Central` (`ajzmheqoanihdujmgbhv`)  
**Estado:** pendiente de revisión y reconciliación del historial

## Hechos reportados

- El usuario confirmó que ejecutó manualmente en producción las revocaciones de `INSERT`, `UPDATE` y `DELETE` para `public.usuarios` y `public.usuario_empresa`, con rol `authenticated`.
- El usuario reportó que todas las pruebas posteriores dieron OK.
- La consulta del historial de migraciones devolvió estas migraciones hasta `20261013180000`; no incluyó `20261013195000_restringir_escritura_directa_usuarios`.
- El archivo de migración anterior solo revocaba permisos en `public.usuarios` y decía que no se había aplicado a producción. Se actualiza en esta rama para documentar las dos tablas y la aplicación manual reportada.

## Evidencia y límites

La confirmación de aplicación y pruebas proviene del usuario. No se afirma que el asistente haya ejecutado las pruebas ni verificado de forma independiente los ACL efectivos. No se ha vuelto a ejecutar SQL en producción.

## Plan de reconciliación — no ejecutado

1. Revisar este cambio en el pull request.
2. Mediante una consulta de solo lectura autorizada, verificar los privilegios efectivos de `authenticated` en ambas tablas y que las lecturas autorizadas siguen funcionando.
3. Verificar que el SQL del archivo representa exactamente el estado live.
4. Solo después de esa comprobación, registrar la versión `20261013195000` como aplicada mediante el procedimiento de reparación del historial de migraciones de Supabase CLI (estado `applied`). Esta operación de metadatos no debe ejecutar el SQL.
5. Volver a consultar el historial de migraciones y documentar el resultado.
6. No ejecutar el contenido de este archivo contra producción durante la reconciliación.

## Pruebas reportadas por el usuario

El usuario indicó que todas las pruebas realizadas después de aplicar el SQL dieron OK. Para cerrar la trazabilidad, conviene registrar cuáles se ejecutaron, el entorno y la evidencia disponible:

- Creación de usuario por la Edge Function.
- Edición de usuario mediante `actualizar_usuario_con_empresas`.
- Rechazo de escrituras directas en ambas tablas.
- Lecturas autorizadas bajo RLS.
- Protección del último administrador.
- Manejo de errores y ausencia de cambios parciales.

Estos puntos son una lista de evidencias que conviene conservar, no una afirmación de que cada caso individual haya sido inspeccionado independientemente por el asistente.

## Cambios fuera de alcance

- No se ejecutó SQL ni se modificó la base de datos.
- No se alteró el historial de migraciones en Supabase.
- No se desplegó ninguna función ni se modificó la configuración de producción.
