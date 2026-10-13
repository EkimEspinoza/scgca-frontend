# Auditoría de triggers de SCGCA

Fecha de revisión: 2026-10-13.

## Alcance y advertencia

Las definiciones de abajo se observaron consultando Supabase. Las búsquedas de código y commits de GitHub no localizaron el SQL histórico de creación para estas funciones. Eso no prueba que nunca existiera en otra rama o fuera del alcance del índice de búsqueda.

Este archivo es documentación de auditoría, no una migración. No ejecutar sus fragmentos como cambios de producción. No se modificó la base de datos durante esta revisión.

## 1. proteger_centro_costo_con_campanas()

- Trigger: trg_proteger_centro_costo_con_campanas.
- Tabla: public.dim_centro_costo.
- Evento: BEFORE UPDATE, FOR EACH ROW.
- Función: SECURITY DEFINER; search_path=public; ACL observada: {postgres=X/postgres}.

La función busca campañas asociadas al centro de costo. Si ya existen, bloquea cambios en la empresa (id_empresa), código (cod_cc), tipo (id_tip_cc) e identificador interno (cod_cc_pk). Si no hay campañas o no se alteran esos campos, devuelve NEW.

## 2. proteger_ultimo_admin()

- Trigger: trg_proteger_ultimo_admin.
- Tabla: public.usuarios.
- Evento: BEFORE UPDATE, FOR EACH ROW.
- Función: SECURITY DEFINER; search_path=public; ACL observada: {postgres=X/postgres}.

Si el registro anterior es un ADMIN activo y se intenta cambiar su estado o permiso, cuenta los demás administradores activos y rechaza la operación si no quedaría ninguno.

Observación pendiente: la función por sí sola hace un conteo. Debe analizarse junto con actualizar_usuario_con_empresas() y sus bloqueos para verificar qué operaciones concurrentes están protegidas.

## 3. handle_new_user() / on_auth_user_created

- Trigger: on_auth_user_created.
- Tabla: auth.users.
- Evento: AFTER INSERT, FOR EACH ROW.
- Función: public.handle_new_user().
- Función: SECURITY DEFINER; search_path=public; ACL observada: {postgres=X/postgres}.

Al crear un usuario en Supabase Auth, crea una fila en public.usuarios. Copia auth_user_id desde new.id, nombre y apellido desde raw_user_meta_data (cadena vacía si faltan), establece id_permiso en NULL y estado en PENDIENTE.

Revisión pendiente: verificar restricciones de la tabla y el proceso controlado de activación/asignación de permisos.

## Observaciones de seguridad

Las tres funciones usan SECURITY DEFINER y search_path=public. Esto no prueba por sí solo que sean vulnerables, pero sí requiere revisar nombres de objetos calificados por esquema, privilegios del propietario y permisos de ejecución. No cambiar search_path ni ACL sin pruebas.

## Resultado

- Los triggers estaban presentes y habilitados en la consulta realizada.
- No se localizó su SQL histórico original en las búsquedas realizadas de GitHub.
- No se aplicó SQL, no se recrearon triggers y no se alteró el historial de migraciones de Supabase.
- Este documento no afirma ser una copia exacta de los scripts históricos originales.
