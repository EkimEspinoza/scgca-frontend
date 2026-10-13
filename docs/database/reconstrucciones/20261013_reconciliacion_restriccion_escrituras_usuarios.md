# Reconciliación de la restricción de escrituras de usuarios

**Fecha de registro:** 2026-10-13  
**Proyecto Supabase:** `Central` (`ajzmheqoanihdujmgbhv`)  
**Estado:** reconciliación registrada

## Hechos y resultado

- El usuario confirmó que aplicó manualmente en producción las revocaciones de `INSERT`, `UPDATE` y `DELETE` para `public.usuarios` y `public.usuario_empresa`, con rol `authenticated`.
- El usuario reportó que las pruebas posteriores dieron OK.
- La migración `20261013195000_restringir_escritura_directa_usuarios` se registró posteriormente en el historial remoto mediante el procedimiento de reparación de migraciones, sin volver a ejecutar el SQL.
- La consulta del historial remoto confirmó que `20261013195000` figura registrada.

## Evidencia y límites

La confirmación de aplicación y pruebas proviene del usuario. El historial remoto fue consultado mediante la herramienta de Supabase. No se afirma que el asistente haya ejecutado las pruebas funcionales ni verificado de forma independiente cada ACL efectivo.

## Cierre

- El archivo de migración versionado incluye las revocaciones para ambas tablas.
- El historial remoto contiene la versión `20261013195000`.
- No se volvió a ejecutar el SQL durante la reconciliación.
- No se modificó la configuración de producción como parte de este registro documental.

## Pruebas reportadas por el usuario

El usuario informó que las pruebas posteriores fueron satisfactorias. La evidencia que conviene conservar para auditoría incluye creación de usuarios, edición mediante `actualizar_usuario_con_empresas`, rechazo de escrituras directas, lecturas RLS autorizadas, protección del último administrador y manejo de errores sin cambios parciales.
