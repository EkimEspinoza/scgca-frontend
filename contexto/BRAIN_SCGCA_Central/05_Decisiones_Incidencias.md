# Decisiones e incidencias — SCGCA Central

**Actualizado:** 2026-11-05

## 09. Decisiones, incidencias e historial del BRAIN

### Decisiones y límites

- Trabajar por incrementos y verificar antes de cambiar código, base o configuración.
- No reportar porcentajes de avance heredados sin criterios y evidencia actuales.
- La revocación de sesiones quedó diferida.
- La cobertura de concurrencia debe confirmarse; migraciones relacionadas no demuestran que las pruebas se hayan ejecutado.
- No guardar secretos, tokens, claves privadas ni valores de .env en este archivo.
- El BRAIN describe estado y continuidad; no sustituye código, migraciones, pruebas ni verificación en vivo.
- El Bloque 03 de auditoría de seguridad no debe confundirse con la Sección 03 documental de módulos y reglas.

### Hitos

- **2026-10-20 a 2026-10-21:** se priorizaron login, roles, menú y administración de módulos. Se anotaron decisiones sobre sesiones, permisos, migraciones, concurrencia y privilegios de supabase_admin. Las cifras de avance de ese periodo son históricas.
- **2026-10-21:** se informó una invitación administrativa con crear-usuario v9 y BCRP v15 desplegada mediante PR #55. La interfaz fue probada manualmente según el usuario; las pruebas HTTP independientes por rol quedaron pendientes.
- **2026-10-23:** auditoría A-04 explicó la migración 20261014100000 aplicada pese al encabezado histórico de propuesta.
- **2026-10-27:** PR #61 integró los cinco cambios locales de tabla/paginación. Local main y origin/main quedaron alineados; 69 pruebas, CI y build pasaron. Se cotejaron 32 migraciones y tres Edge Functions.
- **2026-10-27:** el usuario confirmó que el frontend aún no se publica en hosting. Se consolidó el BRAIN inicial con el Word actualizado de BCRP v15.
- **2026-10-27:** el usuario acordó aplicar a Empresas, Comparativos, Etapas de Costo, Tipos de Centro de Costo, Tipos de Maquinaria y Variedades el mismo patrón responsive: filtros y conteo visibles, lista móvil, tabla de escritorio y switch de estado con confirmación. La desactivación conserva la fila en la base. Se subió en el commit b1f2a5d; no hubo cambios de esquema.
- **2026-10-27:** el usuario acordó que la siguiente jornada de revisión será el 2026-10-28 y cubrirá, en orden, Centro de Costos, Campañas y Tipo de Cambio. Es una agenda de revisión; el alcance de implementación queda pendiente.
- **2026-10-27:** `cambios-locales.patch` quedó fuera del commit: `git apply --check` falló por diferencias con los archivos actuales. Contiene hunks antiguos para componentes de Campañas y Centro de Costos, DataTable y Comparativos. Se conserva localmente para revisarlo con el estado actual; no se aplicó.

- **2026-10-28:** se aplicó a Centro de Costos la presentación compacta de Campañas, con controles responsive y confirmación para cambiar estado. En Campañas se implementó la referencia a cierres previos operativo/CTB al proponer las fechas iniciales de la campaña siguiente. Se replicó la escala de Campañas en los siete módulos de Maestros y se compactó el sidebar.
- **2026-10-28:** el usuario definió un criterio de colaboración: cuando una indicación tenga un riesgo o choque con patrones de UI, diseño, desarrollo, seguridad o rendimiento, señalarlo y explicar el impacto, pero continuar con la orden cuando sea seguro, sin bloquearla con una pregunta.
- **2026-10-28:** commit `4db46a2` publicado en `main` de GitHub. Build de producción aprobado. No hubo cambios de base de datos ni despliegue de frontend a hosting.
- **2026-10-31 — Modelo de permisos:** se acuerda conservar ADMIN y niveles por módulo QUERY/WRITER. QUERY consulta y exporta; WRITER también crea, actualiza y activa/desactiva; solo ADMIN elimina. El nivel antes llamado READER se renombró a WRITER.
- **2026-10-31 — RBAC Empresas:** se crearon `modulos` y `usuario_modulo` con políticas de administración solo para ADMIN autenticado/activo. Se implementó el piloto granular en `Dim_Empresa`; al usuario le corresponde revisar el acceso por cuenta/empresa. El usuario informó pruebas satisfactorias.
- **2026-10-31 — Estado de prueba y discrepancia:** la consulta actual de Supabase muestra prueba 1 WRITER en Empresas, prueba 3 WRITER en Empresas y prueba 2 con rol global QUERY sin asignación al módulo. Esto difiere de la carga semilla inicial documentada como prueba 2 QUERY/prueba 3 READER. No se modificó esa distribución durante el renombrado; debe aclararse antes de la siguiente ronda.
- **2026-10-31 — Gestión de asignaciones:** no existe interfaz para asignar módulos/niveles; temporalmente se realiza desde Supabase. Una pantalla ADMIN quedó como propuesta PF-010, no como trabajo aprobado.
- **2026-10-31 — Estado técnico:** Supabase Central recibió las cuatro migraciones RBAC. El frontend reconoce WRITER y `npm run build` pasó localmente. No hubo commit/push ni despliegue del frontend. `BRAIN OK` significa consolidar avances y acuerdos recientes en los archivos BRAIN pertinentes.
- **2026-11-02 — Maestros, acceso de pantalla:** se decidió/alineó que las nueve pantallas de Maestros requieren ADMIN y que el módulo correspondiente esté activo en `modulos`. QUERY en el requisito del módulo es solo nivel mínimo técnico; el rol global ADMIN sigue siendo obligatorio. Esto es un control de interfaz.
- **2026-11-02 — Maestros, lectura RLS:** se conserva lectura para usuarios con perfil y permiso activos, para que otros módulos consulten los datos maestros. Empresas, Campañas y Centro de Costos mantienen alcance por empresas asignadas para usuarios no ADMIN. En todas las tablas de Maestros consultadas, INSERT/UPDATE/DELETE requieren ADMIN.
- **2026-11-02 — Datos de acceso personal:** se confirmó el criterio de mínimo alcance: ADMIN administra; cada persona lee solo su perfil y asignaciones propias. `modulos` deja leer módulos activos a usuarios activos; `permiso` deja leer permisos activos a usuarios activos y todos los registros a ADMIN. La lectura de catálogos es necesaria para resolver el rol y módulos en AuthContext; no se debe bloquear completamente a usuarios activos.
- **2026-11-02 — RLS permiso:** se aplicó `20261102202432_restrict_permission_catalog_reads_to_active_users` y se verificó la política mediante `pg_policies`. Las políticas de usuarios y asignaciones ya correspondían al criterio elegido. No se ejecutaron pruebas de autorización con sesiones reales.
- **2026-11-02 — Interfaz de permisos:** las pantallas/rutas ADMIN `/modulos` y `/permisos` quedaron integradas en GitHub `main` mediante PR #63. `npm run build` aprobó; el BRAIN anterior las marcaba erróneamente como propuesta no iniciada. Continúa pendiente la prueba manual y el despliegue del frontend a hosting.
- **2026-11-02 — Alineación local/Supabase/GitHub:** se cotejaron 40 migraciones locales y remotas; se renombraron cuatro archivos locales para igualar las versiones del historial de Supabase. Los cambios pendientes de frontend y las ocho migraciones RBAC quedaron integrados en `main` mediante PR #63. El commit local antiguo `e14e0ac` con `cambios-locales.patch` se mantuvo separado para no publicarlo.
- **2026-11-02 — Roles globales:** se conservaron solo `ADMIN` y `USUARIO` como roles globales. QUERY/WRITER quedan solo en asignaciones por módulo. La migración `20261102205813_simplify_global_user_roles` está registrada en Supabase.
- **2026-11-02 — Tipo de Cambio:** la columna se fijó en `numeric(10,3)` mediante `20261102213154_tipo_cambio_tres_decimales`, ya aplicada. Por falta de una API SUNAT estable comprobada, se retiró `consultar-tipo-cambio-bcrp`; el formulario propone 1.000 editable para que ADMIN ingrese la venta SUNAT del último día calendario del mes. Confirmar el valor antes de guardar.
- **2026-11-04 — Mantenimiento y code splitting:** se aceptó mantener las páginas de negocio ligeras y separadas de la lógica de datos/formularios. Se extrajeron hooks y componentes para seis maestros. La optimización acordada difiere Excel hasta la exportación y las páginas Etapas de Costo/Tipo de Cambio hasta su navegación. El umbral 500 KB se trata como advertencia de tamaño por chunk, no como meta rígida de transferencia total. Build local bajó el chunk de entrada de 738.90 KB a 353.86 KB; sin cambios de base de datos. Cambios no publicados en GitHub.
- **2026-11-04 — Distribución, reglas y datos:** registro por empresa/centro de costo; PORCENTAJE contable suma 1.0000 por empresa/mes; fecha fin de mes; Num_Hec usa campañas operativas LEVANTE; Porcentaje_Hec es la participación de hectáreas y se redondea determinísticamente a cuatro decimales. Se cargaron 1,923 filas de 2017-01 a 2026-09; ambos porcentajes suman 1.0000 en 468 grupos.
- **2026-11-04 — Distribución, backend:** aplicadas Dim_PorcentajeDist, distribucion_mes, distribucion_evento, sus RLS y cuatro RPC. ADMIN ve todas las empresas; otros usuarios consultan empresas asignadas. La interfaz actual es mensual; mañana se rediseña desde la referencia multimes.
- **2026-11-04 — Incidencia de vista previa:** corregido retorno varchar(200) frente a text en ramas abierta y cerrada de previsualizar_distribucion_mes. Una invocación SQL con contexto ADMIN devolvió filas. Falta validar en navegador.
- **2026-11-04 — Historial de migraciones:** Supabase registra 48 versiones y local 47 archivos. Falta local 20261104220325_alinear_rls_porcentaje_dist_centro_costo; cuatro prefijos locales no coinciden con las versiones remotas. GitHub no se verificó; reconciliar antes de publicar.
- **2026-11-05 — Distribución, regla de cero:** se acordó que un centro cuyo `PORCENTAJE` contable sea exactamente 0 queda fuera del cálculo de `Porcentaje_Hec` y recibe 0.0000 %. La proporción por hectáreas se reparte entre los demás centros y totaliza 100.0000 % con cuatro decimales. Cambió la RPC `previsualizar_distribucion_mes` en la migración `20261105205941_porcentaje_hec_excluye_porcentaje_cero`; el cálculo también se refleja inmediatamente en la interfaz. Los meses cerrados conservan su snapshot hasta reabrir.
- **2026-11-05 — Distribución, diseño multimes:** se acordó un máximo de tres meses consecutivos por rango y fechas desde enero de 2017. Cada mes muestra sus propias hectáreas y porcentajes. La tabla no muestra `COD_CC_Dist` ni Nº; `COD_CC_PK_Dist` y la descripción quedan fijos al desplazarse. Los grupos mensuales se separan visualmente. Los borradores pueden guardarse en lote; el cierre sigue siendo individual por empresa/mes y ADMIN puede reabrir un mes junto con los posteriores.
- **2026-11-05 — BRAIN/diagrama Supabase:** el diagrama visual de Distribución aún no se reorganizó: las herramientas de base permiten consultar estructura y relaciones, pero no mover tarjetas; la herramienta de control del navegador no inició. Se propusieron grupos por datos maestros, operación, accesos y otros catálogos.
- **2026-11-05 — Alineación de Distribución:** se reconstruyó el archivo histórico `20261104220325` desde el SQL registrado en Supabase y se alinearon los nombres/versiones de las migraciones locales. No se reaplicó ninguna migración de producción.
- **2026-11-05 — Distribución, alcance acordado:** no se requiere mostrar Variedad ni filtrar por campaña. Num_Hec seguirá considerando todas las campañas operativas en la fecha de cada mes. La importación del PORCENTAJE contable y la exportación del rango completo a Excel son implementaciones futuras.
- **2026-11-05 — Siguiente módulo:** después de alinear local, GitHub y Supabase, el siguiente módulo será Mov_Tareo para registrar horas trabajadas de maquinaria por centro de costo de inversión de Campo, Vivero y LEVANTE. El modelo y las reglas se definirán al iniciar el trabajo.

### Regla BRAIN OK

Cuando el usuario diga **“BRAIN OK”**, actualizar este archivo con los acuerdos y avances acumulados hasta ese momento. Registrar fecha, evidencia, cambios y pendientes. Usar etiquetas claras: CONFIRMADO, EN DESARROLLO, PENDIENTE o NO VERIFICADO.

Mantener este archivo como memoria consolidada. Distinguir hechos actuales de propuestas e historial, conservando decisiones importantes sin presentar el historial como estado vigente.

## Plantilla para registrar decisión o incidencia

- ID:
- Fecha:
- Tipo: decisión / incidencia / cambio de criterio.
- Contexto y necesidad:
- Decisión o descripción del incidente:
- Alternativas consideradas:
- Impacto en código, base, seguridad y operación:
- Evidencia y archivos afectados:
- Estado / resolución:
- Pendientes y seguimiento:
