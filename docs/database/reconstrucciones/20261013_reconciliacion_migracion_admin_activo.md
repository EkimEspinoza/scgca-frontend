# Reconciliación de versión de migración: protección del último administrador

**Fecha:** 2026-10-13  
**Proyecto Supabase:** `Central` (`ajzmheqoanihdujmgbhv`)  
**Estado:** nombre de archivo alineado con el historial remoto

## Hechos verificados

- El archivo de migración en GitHub estaba nombrado `20261013200000_alinear_permiso_admin_y_proteger_concurrencia.sql`.
- La migración ya había sido aplicada a Supabase; el historial remoto la registra como `20261013233706_alinear_permiso_admin_y_proteger_concurrencia`.
- El contenido de la migración se conserva; esta reconciliación no vuelve a ejecutar sus sentencias SQL.
- Se cambia el prefijo del archivo a `20261013233706` para que coincida con el historial remoto.
- El archivo con el prefijo anterior se elimina de la rama de reconciliación para evitar que Supabase CLI intente tratarlo como una migración pendiente adicional.

## Procedimiento aplicado al repositorio

1. Crear una rama de reconciliación desde `main`.
2. Copiar el contenido existente sin alterarlo al archivo con el prefijo registrado por Supabase.
3. Eliminar de esa rama el archivo con el prefijo anterior.
4. Actualizar la documentación de reconciliación.
5. Revisar y fusionar el pull request.

## Límites

- No se ejecutó nuevamente la migración SQL contra producción.
- No se reparó, eliminó ni modificó el registro remoto de Supabase en este procedimiento.
- La Edge Function `crear-usuario` es un despliegue separado y no queda reconciliada por el cambio de nombre del archivo.
