# Auditoría: protección de centros de costo con campañas

**Fecha:** 2026-10-13  
**Ámbito:** inspección de solo lectura de producción y revisión de lógica  
**Estado:** hallazgo identificado; concurrencia pendiente de reproducción  
**Producción:** sin cambios como parte de esta revisión

## 1. Evidencia observada

En la base de datos de Supabase se consultó la definición de `public.proteger_centro_costo_con_campanas()`. Es un trigger `BEFORE UPDATE` sobre `public.dim_centro_costo`, con `SECURITY DEFINER` y `search_path = public`.

La función busca campañas existentes por `cod_cc_pk`. Si encuentra alguna, bloquea cambios a:

- `id_empresa`
- `cod_cc`
- `id_tip_cc`
- `cod_cc_pk`

No contiene validaciones para `id_variedad`, `id_comparativo`, `id_tipo_maq`, `desc_cc` ni `estado`. Esto no implica que todos deban ser inmutables; la decisión debe seguir las reglas funcionales. En particular, el requisito funcional conocido del SCGCA dice que un centro de costo pertenece permanentemente a una variedad. **Decisión funcional confirmada por el usuario (opción B):** cuando el centro ya tenga campañas registradas, `id_variedad` será inmutable; `id_comparativo` e `id_tipo_maq` podrán modificarse. La comparación debe tratar `NULL` como un valor real de la regla: cambiar de `NULL` a un ID, de un ID a `NULL` o de un ID a otro ID también constituye cambio de variedad.

La función `public.validar_campana()` es también `SECURITY DEFINER`, con `search_path = public`. Ejecuta `pg_advisory_xact_lock(NEW.cod_cc_pk)` y valida pertenencia del centro a la empresa, tipo permitido, estado en inserción, solapamiento de fechas y continuidad de campañas.

Los triggers encontrados son:

- `Dim_Campana.trg_validar_campana`: `BEFORE INSERT OR UPDATE`.
- `dim_centro_costo.trg_proteger_centro_costo_con_campanas`: `BEFORE UPDATE`.

Ambas tablas tienen RLS habilitado. Las políticas consultadas restringen escrituras a administradores. El permiso directo `EXECUTE` sobre `proteger_centro_costo_con_campanas()` está denegado a `anon`, `authenticated` y `service_role`; eso no impide que PostgreSQL invoque la función como trigger.

## 2. Riesgo de concurrencia: hipótesis por confirmar

La validación de campaña adquiere un advisory lock por `cod_cc_pk`; la función de actualización del centro no participa explícitamente en ese mismo mecanismo. Una actualización del centro y una inserción de campaña simultáneas podrían observar estados distintos según el orden de bloqueo y visibilidad de las transacciones.

Esto es un **riesgo plausible, no una vulnerabilidad reproducida**. No se ejecutó una prueba concurrente en esta revisión.

No se debe agregar mecánicamente el mismo advisory lock al trigger de centro de costo: los triggers de fila de UPDATE se ejecutan después de que la sentencia obtiene el bloqueo de la fila, mientras que el trigger de campaña actualmente adquiere el advisory lock antes de consultar el centro. Esa inversión potencial del orden de bloqueo puede crear un deadlock.

## 3. Diseño de corrección pendiente

Antes de escribir una migración, resolver en un entorno desechable/de desarrollo:

1. Elegir un orden único de bloqueos entre centro de costo y campañas.
2. Asegurar que una inserción o actualización de campaña y una modificación de atributos protegidos del centro se serialicen sin inversión de bloqueos.
3. Aplicar la decisión funcional confirmada: `id_variedad` es inmutable cuando ya existen campañas; `id_comparativo` e `id_tipo_maq` siguen siendo modificables. La semántica de `desc_cc` y `estado` sigue pendiente y no debe alterarse incidentalmente.
4. Revisar cómo se comprueba la pertenencia de `Dim_Campana.id_empresa` al centro al insertar/actualizar, teniendo en cuenta la FK actual a `cod_cc_pk` y la FK separada a `Dim_Empresa`.

No aplicar una migración a producción hasta que la estrategia de bloqueo esté reproducida y probada.

## 4. Matriz mínima de pruebas

### Integridad funcional
- Con campañas existentes, intentar cambiar `id_variedad` de ID a otro ID, de ID a `NULL` y de `NULL` a ID: debe fallar.
- Con campañas existentes, cambiar `id_comparativo` e `id_tipo_maq`: debe seguir funcionando.
- Sin campañas existentes, verificar el comportamiento permitido para cambiar `id_variedad` conforme a la regla aprobada.
- Con campañas existentes, intentar cambiar cada atributo definido como inmutable: debe fallar.
- Insertar una campaña para un centro inactivo: debe fallar.
- Insertar una campaña cuyo `id_empresa` no corresponde al centro: debe fallar.
- Confirmar que las reglas de continuidad y no solapamiento siguen funcionando.

### Concurrencia (dos sesiones separadas en un entorno de prueba)
- Sesión A inicia una inserción de campaña y mantiene la transacción abierta; sesión B intenta cambiar `id_empresa`, `id_tip_cc` o `id_variedad` del centro.
- Sesión A inicia una actualización de atributos protegidos del centro y mantiene la transacción abierta; sesión B intenta insertar una campaña.
- Repetir ambos órdenes y comprobar que el resultado es serializable a nivel funcional: o la modificación protegida se rechaza al existir campaña, o la campaña se valida contra el estado actualizado; nunca debe quedar una campaña inconsistente.
- Verificar ausencia de deadlocks y que las transacciones terminan correctamente.

Las pruebas deben usar registros desechables, transacciones controladas y rollback; no ejecutarlas con cambios destructivos en producción.

## 5. Criterio de aceptación

El hallazgo se cierra únicamente cuando la regla de inmutabilidad aprobada esté implementada, las pruebas funcionales y concurrentes pasen en un entorno no productivo, la migración revisada esté en un PR y su despliegue posterior tenga autorización explícita.

## 6. Acciones realizadas

- Lectura de definiciones de funciones, triggers, políticas RLS, permisos directos y restricciones/FK en Supabase.
- Se registró la decisión funcional del usuario: proteger `id_variedad`; permitir cambios de `id_comparativo` e `id_tipo_maq`.
- No se ejecutaron escrituras SQL ni cambios de esquema en producción.
