# BRAIN maestro de SCGCA Central

**Actualizado:** 2026-11-03
**Estado:** documento formal e índice del conocimiento consolidado del proyecto.
**Regla de actualización:** cuando el usuario diga **BRAIN OK**, incorporar los acuerdos y avances recientes en los archivos pertinentes. Actualizar todos los archivos afectados por un cambio, sin duplicar información innecesariamente.

## Navegación del BRAIN

- [Inventario de base de datos, políticas y guías de reconstrucción](BRAIN_SCGCA_Central/02_Inventario_Base_Datos.md)
- [Propuestas funcionales futuras](BRAIN_SCGCA_Central/03_Propuestas_Funcionales.md)
- [Plan de trabajo y seguimiento](BRAIN_SCGCA_Central/04_Plan_Trabajo.md)
- [Decisiones e incidencias](BRAIN_SCGCA_Central/05_Decisiones_Incidencias.md)
- [Pruebas y calidad](BRAIN_SCGCA_Central/06_Pruebas_Calidad.md)

## Acuerdos operativos del BRAIN

- Mantener separados hechos confirmados, propuestas, decisiones pendientes e historial.
- El inventario de cada tabla debe actualizarse al cambiar columnas, relaciones, políticas RLS, triggers u otros objetos asociados. Una tabla nueva recibe su ficha y su instrucción de reconstrucción.
- Una propuesta pasa al plan de trabajo cuando se acuerda realizarla; el estado, estimación y criterios se registran en los archivos correspondientes.
- No guardar secretos, tokens, claves privadas ni valores de .env.
- No considerar un cambio aprobado solo por estar documentado. Las acciones sobre producción requieren autorización específica.
- El documento principal resume visión, estado, arquitectura y acuerdos; el detalle vive en los archivos vinculados.

## 01. Identidad, visión y objetivos

SCGCA significa **Sistema Corporativo de Gestión de Costos Agrícolas**. Busca centralizar la administración, validación, procesamiento y análisis de costos de cuatro empresas agrícolas del Grupo Rotondo, reduciendo la dependencia de Excel y Power BI como puntos de procesamiento. Power BI seguirá siendo útil para análisis. Se contemplan importaciones desde Excel y futuras integraciones con SCIRE y XRAY.

Empresas comprendidas en el contexto del proyecto:

- Agrícola El Rancho SAC (RANCHO)
- Sociedad Agrícola Moche Norte SA (MOCHE NORTE)
- Maria Cecilia Rotondo Correa (MCR)
- Fundo Cantera SAC (CANTERA)

Indicadores previstos: costos acumulados, flujo mensual, costos por campaña y comparativos entre campañas y empresas, en soles, dólares y dólares por hectárea.

La dirección visual documentada favorece tarjetas, apariencia suave, filtros claros, estados visibles y mensajes que ayuden a corregir errores. Es una guía de diseño, no una evaluación completa de la interfaz.

## 02. Estado general

### Verificado al 27 de octubre de 2026

- Los archivos versionados locales y GitHub están alineados en main, commit b1f2a5d10777f1be95739ee52fb23e508e77ea01 (2026-10-27).
- Los cinco cambios locales de tablas y paginación se publicaron en el commit 5bb8e29 y se integraron en el [PR #61](https://github.com/EkimEspinoza/scgca-frontend/pull/61).
- El 2026-10-27 se subió el commit b1f2a5d con cambios de revalidación de AuthContext y patrón responsive para Empresas, Comparativos, Etapas de Costo, Tipos de Centro de Costo, Tipos de Maquinaria y Variedades. Incluye filtro por estado, conteo de resultados y switch con confirmación; desactivar conserva el registro.
- El cambio anterior es de frontend y servicios sobre el campo `estado` ya existente; no modificó el esquema de Supabase.
- Repositorio local: C:\Users\cespinoza\scgca-frontend.
- Supabase Central está activo en us-east-1, PostgreSQL 17.6.
- Las 32 migraciones locales coinciden por versión con las 32 registradas en Supabase.
- Las Edge Functions desplegadas verificadas son crear-usuario v9 y actualizar-usuario v3. consultar-tipo-cambio-bcrp fue retirada de Supabase y del repositorio.
- El frontend aún no está publicado en ningún hosting. GitHub contiene el código; Supabase provee la base de datos y la autenticación. Falta elegir y configurar el servicio que publicará la interfaz.
- El usuario quiere primero ordenar el contexto. Todavía no se ha acordado un plan de trabajo nuevo.

### Avances verificados al 28 de octubre de 2026

- Los cambios de esta jornada se publicaron en GitHub en `main`, commit `4db46a2` (`Compacta campañas, centros de costo y maestros`). El código quedó alineado con `origin/main` al terminar el envío.
- Campañas y Centro de Costos recibieron ajustes de escala y presentación responsive. Campañas incorpora búsqueda por campaña/empresa/centro de costo y confirmación al cambiar estado. Centro de Costos replica la escala visual de Campañas e incluye confirmación al cambiar estado. Desactivar conserva los registros.
- Al crear una campaña se muestra la última campaña del Centro de Costo con sus cierres operativo y CTB; los inicios sugeridos son el día siguiente a cada cierre. Si no hay campaña previa, el formulario conserva el flujo de nueva campaña. Cambio de frontend; no modificó el esquema de Supabase.
- Se reutilizó la escala compacta de Campañas en los siete módulos de Maestros: Empresa, Comparativos, Etapas de Costo, Tipos de Centro de Costo, Tipos de Maquinaria, Variedades y Tipo de Cambio. También se compactó la navegación lateral.
- `npm run build` pasó el 2026-10-28 (Vite transformó 11,769 módulos). `git diff --check` pasó. No se ejecutaron pruebas unitarias ni revisión visual completa en navegador.
- El envío a GitHub no publica la aplicación en un hosting ni desplegó cambios en Supabase.

### Avances verificados al 31 de octubre de 2026

- Se acordó el modelo granular por módulo: `QUERY` puede consultar y exportar; `WRITER` puede consultar, exportar, crear, actualizar y activar/desactivar; `ADMIN` conserva control total y es el único nivel que puede eliminar.
- En Supabase Central se crearon `public.modulos` y `public.usuario_modulo`, con RLS; solo ADMIN autenticado y activo administra el catálogo y las asignaciones. Se cargó un catálogo inicial de 11 módulos.
- Se implementó el piloto RLS para Empresas. Lectura requiere asignación al módulo y vínculo con la empresa; WRITER puede crear y actualizar; eliminar queda reservado a ADMIN.
- `READER` fue renombrado a `WRITER` en el rol global y en el nivel de módulo, manteniendo las asignaciones existentes. Cambios de esquema aplicados a Supabase Central.
- El usuario informó que probó el piloto en la interfaz y que todo quedó OK. La prueba manual se registra como reportada por el usuario; el asistente verificó las políticas/estructura SQL y que el build local compilara.
- Asignaciones observadas después del cambio: prueba 1 y prueba 3 tienen WRITER en Empresas; prueba 2 conserva rol global QUERY, pero no tiene asignación a Empresas. Este estado difiere del escenario que se esperaba y requiere decisión antes de seguir probando con prueba 2.
- Aún no hay interfaz para asignar módulos y niveles; por ahora se administran directamente en Supabase. Crear esa pantalla ADMIN es una propuesta de siguiente paso, todavía no aprobada ni iniciada.
- `npm run build` aprobó el 2026-10-31. Los cambios de frontend y migraciones RBAC están locales, sin commit/push ni publicación de frontend.

### Avances verificados al 2 de noviembre de 2026

- Las nueve rutas del grupo Maestros (Campañas, Centro de Costos, Comparativos, Empresas, Etapa de Costo Inversión, Tipos de Centro de Costo, Tipos de Maquinaria, Variedades y Tipo Cambio) requieren ADMIN y comprueban que su código de módulo esté activo en `public.modulos`. El nivel QUERY usado como mínimo de módulo no habilita la ruta a usuarios QUERY: el requisito ADMIN sigue siendo obligatorio.
- En las nueve tablas de Maestros, Supabase mantiene lectura para usuarios con perfil y permiso activos; Empresas, Campañas y Centro de Costos además limitan la lectura no ADMIN a empresas asignadas activamente. INSERT/UPDATE/DELETE están bajo ADMIN.
- Se confirmó que `usuarios` permite leer el perfil propio y ADMIN puede leer todos; `usuario_empresa` limita la lectura del usuario a sus asignaciones activas; `usuario_modulo` permite leer las asignaciones propias y ADMIN ve todas. Las escrituras están restringidas a ADMIN o a la Edge Function de usuarios con validación de ADMIN.
- En `public.modulos`, usuarios activos pueden leer solo módulos activos y ADMIN puede leer y administrar todo. En `public.permiso`, se restringió SELECT: usuarios activos ven permisos activos y ADMIN ve también los inactivos. El catálogo de permisos sigue sin escritura directa por Data API; sus cambios se controlan con migraciones.
- La migración `20261102202432_restrict_permission_catalog_reads_to_active_users` se aplicó a Supabase Central. Se verificó el resultado consultando `pg_policies`; no se hizo una prueba de sesión real con cada rol.
- Las rutas y pantallas de ADMIN para **Módulos** y **Permisos** están integradas en GitHub `main` mediante PR #63 (`/modulos`, `/permisos`). `npm run build` aprobó el 2026-11-02 (Vite transformó 11,773 módulos). No se hizo prueba manual de esas pantallas ni despliegue del frontend a hosting.
- Se simplificó el rol global a `ADMIN` y `USUARIO`; `QUERY` y `WRITER` quedan exclusivamente como niveles de `usuario_modulo`. La migración `20261102205813_simplify_global_user_roles` aparece aplicada en Supabase.
- Tipo de Cambio usa ahora precisión de tres decimales (`numeric(10,3)`), aplicada con `20261102213154_tipo_cambio_tres_decimales`. La Edge Function `consultar-tipo-cambio-bcrp` fue retirada de Supabase y del repositorio. El formulario propone `1.000` y el ADMIN debe reemplazarlo manualmente por la venta oficial SUNAT del último día del mes; encontrar una API estable de SUNAT sigue pendiente.
- A la fecha, las 42 migraciones locales coinciden con las 42 registradas en Supabase. Las funciones desplegadas verificadas son `crear-usuario` v9 y `actualizar-usuario` v3.
- Se añadieron exportaciones a Excel para Variedades, Tipos de Maquinaria, Tipos de Centro de Costo, Etapas de Costo, Empresas y Comparativos. Exportan los resultados de los filtros activos; el botón queda junto a la acción de creación cuando aplica.
- Los cambios de exportación se publicaron en GitHub `main` en el commit `0cfa0c0` (`feat: add Excel exports to master data`). La primera ejecución de CI encontró una prueba huérfana de la función ya retirada, que aún importaba `authorization.js`.
- Se eliminó `supabase/functions/consultar-tipo-cambio-bcrp/authorization.test.js`, la última referencia ejecutable a esa función, y se publicó en `main` el commit `c03dd32` (`chore: remove test for retired exchange function`). El CI de ese commit terminó en éxito: pruebas, lint y build aprobados. Ejecución: [GitHub Actions](https://github.com/EkimEspinoza/scgca-frontend/actions/runs/41539595160).
- `npm run build` local también aprobó. Vite informó que el bundle principal supera 500 KB minificado; es una advertencia de tamaño, no un fallo. No se encontró workflow de despliegue frontend en el repositorio; el push a `main` no confirma publicación en hosting.

### Avances verificados al 3 de noviembre de 2026

- Se consolidó la personalización visual en dos temas completos: claro y oscuro. El tema del usuario se guarda en `user_metadata.app_theme` de Supabase Auth; la selección se controla desde el switch inferior del sidebar. La transición circular empieza en el clic y calcula el radio para cubrir la ventana.
- Los temas claro y oscuro usan superficies con efecto glass; el tema de alto contraste y el catálogo de colores independientes se retiraron. No se requirieron cambios de esquema, migraciones ni Edge Functions para esta preferencia de Auth.
- Se corrigió la prioridad de estilos de las barras de color por empresa en las tablas de Centro de Costos y Campañas.
- Los cambios se integraron en GitHub `main` el 2026-11-03 en `09de31a` (`feat: permitir temas claro y oscuro personalizables`). `npm test` aprobó 65/65 pruebas; `npm run lint` terminó con código 0 y advertencias no bloqueantes; `npm run build` aprobó con 11,774 módulos transformados y la advertencia no bloqueante de bundle principal superior a 500 KB minificado.
- La verificación de Supabase Central confirmó 42 migraciones locales y 42 remotas con las mismas versiones. Las Edge Functions siguen alineadas: `crear-usuario` v9 y `actualizar-usuario` v3. El repositorio no tiene despliegue automático del frontend; publicar el código en GitHub no publica la interfaz.

### Pendientes vigentes al 2 de noviembre

- Alinear, según instrucción del usuario, las asignaciones de prueba: la base muestra prueba 1 WRITER, prueba 3 WRITER y prueba 2 sin asignación a Empresas.
- Probar manualmente las pantallas ADMIN de Módulos y Permisos y sus flujos de asignación; el build solo verifica compilación.
- Decidir el siguiente módulo de negocio para extender autorización granular por módulo en RLS; los nueve maestros siguen con administración ADMIN y lectura para perfiles activos.
- Revisar si QUERY/WRITER globales seguirán siendo necesarios cuando las asignaciones por módulo estén completas.
- Distribución mensual tiene decisiones de negocio y diseño abiertas.
- Encontrar una API estable para obtener directamente de SUNAT la venta del último día de cada mes; hasta entonces el Tipo de Cambio se ingresa manualmente.
- Siguen abiertas alertas de Advisors y preguntas de auditoría.
- No se toma como vigente ningún porcentaje histórico de avance (30%, 55% o 58%).

## 03. Módulos y reglas del negocio

### Módulos identificados

En el código: login, cambio de contraseña, Dashboard, Usuarios, Empresas, Variedades, Tipos de Centro de Costo, Tipos de Maquinaria, Etapas de Costo, Tipo de Cambio, Campañas, Comparativos y Centro de Costos.

En los requisitos también aparecen Almacén, importación de Excel, Distribución mensual, reportes y Power BI. SCIRE y XRAY son integraciones futuras.

### Centros de costo

- Cada Centro de Costo pertenece permanentemente a una variedad.
- No cambiar la regla histórica de cod_cc_pk sin un caso comprobado.
- Los filtros dependen de empresa, estado y tipo; mostrar maquinaria, comparativo o variedad según corresponda.
- La importación debe advertir sobre Centros de Costo, Campañas o Variedades inexistentes o inactivos.

### Campañas y hectáreas

- La documentación establece fechas inclusivas y prohíbe solapamientos para un mismo Centro de Costo. La base contiene validaciones relacionadas; su cobertura funcional completa requiere confirmación.
- La base tiene una restricción de hectáreas positivas para campañas. El documento histórico enfoca la regla en LEVANTE; confirmar el alcance funcional exacto.
- Se pidió mostrar la fecha de cierre de la campaña anterior al crear una campaña nueva.
- La bitácora indica que se eliminó manualmente una campaña duplicada el 2026-10-20. No asumir duplicados actuales sin consultar la base.

### Distribución mensual

Es un área crítica pendiente. No diseñar tablas ni SQL hasta resolver:

- Qué representa COD_CC_Dist: origen, agrupación u otra entidad. Cod_CC_PK_Dist está descrito como destino.
- Qué valor de Dim_TipoCC identifica LEVANTE.
- Cómo guardar cierres y rangos reabiertos o modificados si no se crea tabla de historial.
- Qué regla de redondeo garantiza que Porcentaje_Hec sume 100% de forma determinista.
- Qué tablas de costos deben recalcularse y cómo hacerlo dentro de una transacción.

Reglas propuestas: PORCENTAJE es el dato contable y debe sumar 100% por empresa y mes; cero puede ser válido y NULL no equivale a cero. PORCENTAJE_HEC se calcula desde hectáreas vigentes. El cierre corresponde al último día del mes y debe ser correlativo. Debe haber vista previa; si falla un mes de un rango, toda la operación debe revertirse. ADMIN podría reabrir y editar PORCENTAJE. Estas reglas requieren confirmación funcional y técnica antes de implementarse.

### Tipo de cambio

- El valor requerido es la **venta SUNAT del último día calendario del mes**. El usuario confirmó como referencias julio de 2026: 3.399; agosto: 3.356; septiembre: 3.450.
- No hay una API pública de SUNAT documentada y comprobada como estable para la integración. La automatización queda pendiente; no usar otra fuente como sustituto silencioso.
- Hasta resolverlo, el formulario del siguiente período inicia en 1.000 y permite ingresar manualmente el valor oficial antes de confirmar y guardar.
- La Edge Function `consultar-tipo-cambio-bcrp` fue eliminada de Supabase y su código local se retiró. Funciones desplegadas verificadas: `crear-usuario` v9 y `actualizar-usuario` v3.

## 04. Arquitectura y estado técnico

### Stack

- Frontend: React, Vite y JavaScript; interfaz con Material UI.
- Datos y acceso: Supabase Database, Auth, PostgreSQL, RLS, RPC y Edge Functions.
- Análisis: Power BI. Integraciones futuras: SCIRE y XRAY.

### Tablas vistas en public

Inventario base de 12 tablas: permiso, usuarios, Dim_Empresa, usuario_empresa, Dim_TipoCC, dim_tipo_maq, dim_comparativo, dim_variedad, dim_centro_costo, Dim_Campana, Dim_Etapa_Costo y TipoCambio. Al 2026-10-31 se añadieron `modulos` y `usuario_modulo` (14 tablas conocidas en public; falta una inspección integral nueva del catálogo).

RLS está habilitado en las 12 tablas observadas. PostgreSQL reporta versión 17.6. No se ejecutaron migraciones ni consultas de escritura durante las revisiones de contexto.

### Migraciones y funciones

- Al 2026-11-02 hay 42 archivos de migración locales y 42 versiones registradas en Supabase; las versiones coinciden. Las más recientes son `20261102205813_simplify_global_user_roles` y `20261102213154_tipo_cambio_tres_decimales`.
- Edge Functions desplegadas y contrastadas: `crear-usuario` v9 y `actualizar-usuario` v3. `consultar-tipo-cambio-bcrp` fue eliminada.
- Las funciones de usuarios tienen verify_jwt=false, pero usan middleware withSupabase({ auth: "user" }) y comprueban identidad y ADMIN activo antes de usar privilegios administrativos.
- La migración 20261021222143_a03_restringir_privilegios_secuencias_public.sql está en local y en el historial remoto.
- La migración 20261014100000_serializar_validacion_campanas_centros_costo consta como aplicada. Su encabezado histórico decía que era una propuesta. La auditoría A-04 explica que una migración posterior endureció el search_path de validar_campana(); falta cierre documental integral.

## 05. Seguridad, permisos y auditoría

### Roles y controles

- **Modelo actualizado al 2026-11-02:** roles globales `ADMIN` y `USUARIO`. ADMIN tiene control total y es el único que puede eliminar. `QUERY` y `WRITER` son niveles independientes por módulo: QUERY consulta y exporta; WRITER puede además crear, actualizar y activar/desactivar, sin eliminar.
- Se implementaron `modulos` y `usuario_modulo`, con niveles por módulo QUERY/WRITER. El piloto de control RLS granular por asignación está implementado para Empresas; los demás maestros conservan lectura para perfiles activos y escritura ADMIN-only, sin exigir asignación granular para consultar sus datos.
- ALMACEN y CONSULTA corresponden a una propuesta anterior, no a los nombres vigentes del modelo acordado.
- Las interfaces ADMIN para catálogo de módulos y permisos por usuario existen en el código local (`/modulos`, `/permisos`); build aprobado, prueba manual y despliegue pendientes.
- La documentación decía que usuarios básicos estaban limitados a una empresa; la base actual soporta relaciones mediante usuario_empresa. Confirmar la regla vigente.
- AuthContext inicia y cierra sesión con Supabase Auth, carga el perfil desde public.usuarios y comprueba que usuario, perfil y permiso estén activos.
- Dashboard requiere usuario activo; las rutas de administración observadas están restringidas a ADMIN.
- El menú muestra Reportes sin permiso específico pero no se encontró /reportes; Configuración aparece para ADMIN pero no se encontró /configuracion. No existe ruta /almacen aunque está prevista para ALMACEN.
- Los hallazgos de rutas son de revisión estática; no se probaron con sesiones reales por rol.

### Acceso a datos y alertas actuales

- No se encontraron permisos directos de tabla para anon en el resumen consultado.
- La fotografía anterior cubría 12 tablas; se añadieron dos tablas públicas con RLS y grants a authenticated, limitadas por políticas a usuarios activos y administración ADMIN.
- En `Dim_Empresa`, la lectura granular requiere módulo EMPRESAS y empresa asignada; WRITER inserta y actualiza; DELETE solo ADMIN. Ver delta en el inventario DB.
- Security Advisor informa que la protección de contraseñas filtradas está desactivada; las notas la registran como decisión/riesgo aceptado.
- Performance Advisor informa dos claves foráneas sin índice de cobertura: Dim_Campana hacia Centro de Costo y usuarios hacia permiso.
- También informa SELECT permisivos superpuestos en Dim_Empresa, dim_centro_costo, usuario_empresa y usuarios.
- No cambiar los privilegios predeterminados de supabase_admin. No quitar políticas ni crear índices automáticamente.
- No crear usuarios/invitaciones reales de prueba en producción sin una estrategia segura.
- No crear ramas Supabase con coste adicional ni recursos de pago sin aprobación.

### Hallazgos A-01 a A-07

Los datos de producción citados abajo tienen cortes históricos; no todas las pruebas se repitieron el 27 de octubre.

| ID | Estado conocido | Nota |
|---|---|---|
| A-01 Registro/Auth | Validado históricamente el 21 de octubre | Se registró el registro público desactivado y una invitación administrativa exitosa con crear-usuario v9. No hubo prueba negativa independiente de registro público. |
| A-02 Campaña duplicada | Historial; estado actual no verificado | El Word anotó filas similares 3166 y 31661. Otra nota registra que el usuario eliminó manualmente un duplicado el 20 de octubre. No asumir duplicados actuales ni borrar datos sin revisar referencias. |
| A-03 Privilegios de secuencias | Migración presente y aplicada | La migración está en local y en el historial remoto. No se reconsultó cada ACL de secuencia en la revisión más reciente. |
| A-04 Encabezado de migración | Reconciliación técnica explicada | La migración 20261014100000 está aplicada; su encabezado quedó obsoleto. Falta cierre documental integral. |
| A-05 Edge Functions | Fuentes alineadas | Versiones desplegadas coinciden con local: v9, v3 y v15. Faltan pruebas HTTP independientes por rol para las funciones de usuarios. |
| A-06 SELECT propio | Decisión pendiente | Se señaló históricamente que la política del propio usuario no exigía estado activo. No cambiar sin confirmar el requisito y evaluar impacto. |
| A-07 Rendimiento y políticas | Alertas vigentes | Dos avisos de claves foráneas sin índice y SELECT superpuestos en cuatro tablas. No cambiar automáticamente. |

La auditoría histórica reportó RLS habilitado en las 12 tablas examinadas, ocho triggers habilitados y ausencia de ciertas clases de registros huérfanos en el alcance consultado. No constituye una auditoría integral actual.

## 06. GitHub, código y despliegues

- Repositorio: [EkimEspinoza/scgca-frontend](https://github.com/EkimEspinoza/scgca-frontend).
- Repositorio local: C:\Users\cespinoza\scgca-frontend.
- La rama local main quedó igual a origin/main en debd997388d1a00aeba636aa0e2a39b4245b4cbd.
- PR #61 integró cinco cambios de tablas/paginación mediante commit 5bb8e29.
- `cambios-locales.patch` sigue como archivo local sin seguimiento. Se comprobó que el patch no aplica al estado actual del código; se dejó fuera del commit b1f2a5d.
- El repositorio tiene flujo de calidad para pruebas, lint y build; no se encontró flujo de despliegue frontend.
- La web no está publicada en ningún hosting. Para desplegarla hay que elegir servicio, conectar main, configurar variables de Supabase y definir URLs de Auth.
- Integrar código en GitHub no equivale a desplegarlo en Supabase ni a publicar la web.
- PR #55 integró la corrección de autorización BCRP y v15 está desplegada. Referencias viejas a PR #1–#4, #52 y Edge Functions v8/v2 pertenecen a cortes anteriores.
- Al 2026-10-31 hay cambios locales de frontend RBAC y migraciones `20261031004412`, `20261031040115`, `20261031040644` y `20261031050154`; no se reportó commit/push ni publicación de frontend.
- Para el commit b1f2a5d se comprobó `git diff --check`; no se ejecutaron npm test, lint ni build ni una revisión visual en navegador.

## Convención BRAIN OK

BRAIN OK significa consolidar los acuerdos y avances acumulados hasta ese momento. Revisar qué archivos resultan afectados: por ejemplo, cambios de esquema actualizan inventario y posiblemente decisiones, plan y pruebas; una nueva propuesta actualiza su registro; pruebas ejecutadas actualizan calidad y el estado principal si cambia. Anotar fecha, evidencia y pendientes. No declarar como realizado lo que solo está propuesto o no verificado.
