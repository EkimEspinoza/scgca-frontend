# Inventario de base de datos — SCGCA Central

**Fuente:** fotografía base de Supabase Central al 2026-10-27, con deltas RBAC y RLS verificados en vivo al 2026-11-02.
**Proyecto:** ajzmheqoanihdujmgbhv, esquema public, PostgreSQL 17.6.
**Cobertura:** fotografía de 12 tablas, más las tablas `modulos` y `usuario_modulo` añadidas el 2026-10-31 y los cambios posteriores de `permiso` y `Dim_Empresa`. El catálogo completo requiere nueva inspección.

Este inventario es una fotografía del catálogo en la fecha indicada. Antes de migrar, cotejar con las migraciones versionadas y verificar índices, grants, ownership, secuencias, funciones, vistas, extensiones y consumidores en frontend/RPC/Edge Functions. Las instrucciones son especificaciones para generar migraciones, no SQL listo para ejecutar.

## Regla de actualización

Cada cambio de tabla o de sus objetos relacionados requiere refrescar su ficha individual: columnas, restricciones, relaciones, índices, RLS y políticas, triggers/funciones, permisos y migración fuente. Una tabla nueva requiere su ficha y su prompt de reconstrucción. Toda ficha debe tener fecha/evidencia de verificación.

## 11. Inventario técnico Supabase

**Corte 2026-10-27.** Proyecto Central (`ajzmheqoanihdujmgbhv`), esquema `public`, PostgreSQL 17.6. Metadatos leídos en modo consulta; no se modificó la base. RLS habilitado en las 12 tablas observadas. El detalle de columnas, claves, relaciones, políticas RLS y triggers sigue. Las expresiones RLS proceden del catálogo y se condensaron para lectura; revalidarlas en Supabase antes de cualquier cambio. Grants, índices y migraciones fuente requieren cotejo complementario.


### Detalle de tablas, políticas y triggers (lectura del catálogo, 2026-10-27)

#### permiso
Columnas: id_permiso bigint NOT NULL IDENTITY; nombre character varying NOT NULL UNIQUE; descripcion character varying NULL; estado boolean NOT NULL DEFAULT true; created_at timestamp with time zone NOT NULL DEFAULT now()
PK: id_permiso. RLS: habilitado.
FK salientes: ninguna.
Políticas RLS: usuarios_autenticados_ver_permisos [SELECT, authenticated] USING=true WITH CHECK=—.
Triggers: trg_proteger_permiso_admin_activo [habilitado]: CREATE TRIGGER trg_proteger_permiso_admin_activo BEFORE UPDATE OF nombre, estado ON public.permiso FOR EACH ROW EXECUTE FUNCTION proteger_permiso_admin_activo().

#### usuarios
Columnas: id_usuario bigint NOT NULL IDENTITY; auth_user_id uuid NOT NULL UNIQUE; nombre character varying NOT NULL; apellido character varying NULL; id_permiso bigint NULL; estado character varying NOT NULL DEFAULT 'PENDIENTE'::character varying CHECK(estado::text = ANY (ARRAY['PENDIENTE'::character varying, 'ACTIVO'::character varying, 'INACTIVO'::character varying]::text[])); created_at timestamp with time zone NOT NULL DEFAULT now(); updated_at timestamp with time zone NOT NULL DEFAULT now()
PK: id_usuario. RLS: habilitado.
FK salientes: usuarios_id_permiso_fkey: id_permiso → public.permiso.id_permiso.
Políticas RLS: admin_modificar_usuarios [UPDATE, authenticated] USING=private.is_admin() WITH CHECK=private.is_admin(); admin_ver_todos_los_usuarios [SELECT, authenticated] USING=(private.get_my_permission() = 'ADMIN'::text) WITH CHECK=—; usuarios_ver_propio_registro [SELECT, authenticated] USING=(auth_user_id = ( SELECT auth.uid() AS uid)) WITH CHECK=—.
Triggers: trg_proteger_ultimo_admin [habilitado]: CREATE TRIGGER trg_proteger_ultimo_admin BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION proteger_ultimo_admin().

#### Dim_Empresa
Columnas: id_empresa bigint NOT NULL IDENTITY; descripcion character varying NOT NULL UNIQUE; nombre_comercial character varying NOT NULL UNIQUE; estado boolean NOT NULL DEFAULT true; created_at timestamp with time zone NOT NULL DEFAULT now(); updated_at timestamp with time zone NOT NULL DEFAULT now()
PK: id_empresa. RLS: habilitado.
FK salientes: ninguna.
Políticas RLS: admin_crear_empresa [INSERT, authenticated] USING=— WITH CHECK=private.is_admin(); admin_eliminar_empresa [DELETE, authenticated] USING=private.is_admin() WITH CHECK=—; admin_modificar_empresa [UPDATE, authenticated] USING=private.is_admin() WITH CHECK=private.is_admin(); admin_ver_todas_las_empresas [SELECT, authenticated] USING=private.is_admin() WITH CHECK=—; usuario_ver_empresas_asignadas [SELECT, authenticated] USING=((private.get_my_permission() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM (usuario_empresa ue
     JOIN usuarios u ON ((u.id_usuario = ue.id_usuario)))
  WHERE ((ue.id_empresa = "Dim_Empresa".id_empresa) AND (ue.estado IS TRUE) AND (u.auth_user_id = ( SELECT auth.uid() AS uid)) AND ((u.estado)::text = 'ACTIVO'::text))))) WITH CHECK=—.
Triggers: ninguno identificado.

#### usuario_empresa
Columnas: id_usuario_empresa bigint NOT NULL IDENTITY; id_usuario bigint NOT NULL; id_empresa bigint NOT NULL; estado boolean NOT NULL DEFAULT true; created_at timestamp with time zone NOT NULL DEFAULT now()
PK: id_usuario_empresa. RLS: habilitado.
FK salientes: fk_usuario_empresa_empresa: id_empresa → public.Dim_Empresa.id_empresa; fk_usuario_empresa_usuario: id_usuario → public.usuarios.id_usuario.
Políticas RLS: admin_crear_asignaciones_empresa [INSERT, authenticated] USING=— WITH CHECK=private.is_admin(); admin_eliminar_asignaciones_empresa [DELETE, authenticated] USING=private.is_admin() WITH CHECK=—; admin_modificar_asignaciones_empresa [UPDATE, authenticated] USING=private.is_admin() WITH CHECK=private.is_admin(); admin_ver_asignaciones_empresa [SELECT, authenticated] USING=private.is_admin() WITH CHECK=—; usuario_ver_sus_asignaciones [SELECT, authenticated] USING=((private.get_my_permission() IS NOT NULL) AND (estado IS TRUE) AND (EXISTS ( SELECT 1
   FROM usuarios u
  WHERE ((u.id_usuario = usuario_empresa.id_usuario) AND (u.auth_user_id = ( SELECT auth.uid() AS uid)) AND ((u.estado)::text = 'ACTIVO'::text))))) WITH CHECK=—.
Triggers: ninguno identificado.

#### Dim_TipoCC
Columnas: id_tip_cc bigint NOT NULL IDENTITY; des_tip_cc character varying NOT NULL; estado boolean NOT NULL DEFAULT true; created_at timestamp with time zone NOT NULL DEFAULT now(); updated_at timestamp with time zone NOT NULL DEFAULT now()
PK: id_tip_cc. RLS: habilitado.
FK salientes: ninguna.
Políticas RLS: admin_crear_tipo_cc [INSERT, authenticated] USING=— WITH CHECK=private.is_admin(); admin_eliminar_tipo_cc [DELETE, authenticated] USING=private.is_admin() WITH CHECK=—; admin_modificar_tipo_cc [UPDATE, authenticated] USING=private.is_admin() WITH CHECK=private.is_admin(); usuarios_activos_ver_tipo_cc [SELECT, authenticated] USING=(private.get_my_permission() IS NOT NULL) WITH CHECK=—.
Triggers: ninguno identificado.

#### dim_tipo_maq
Columnas: id_tipo_maq bigint NOT NULL IDENTITY; des_tipo_maquinaria character varying NOT NULL UNIQUE; estado boolean NOT NULL DEFAULT true; created_at timestamp with time zone NOT NULL DEFAULT now(); updated_at timestamp with time zone NOT NULL DEFAULT now()
PK: id_tipo_maq. RLS: habilitado.
FK salientes: ninguna.
Políticas RLS: admin_crear_tipo_maquinaria [INSERT, authenticated] USING=— WITH CHECK=private.is_admin(); admin_eliminar_tipo_maquinaria [DELETE, authenticated] USING=private.is_admin() WITH CHECK=—; admin_modificar_tipo_maquinaria [UPDATE, authenticated] USING=private.is_admin() WITH CHECK=private.is_admin(); usuarios_activos_ver_tipo_maquinaria [SELECT, authenticated] USING=(private.get_my_permission() IS NOT NULL) WITH CHECK=—.
Triggers: ninguno identificado.

#### dim_comparativo
Columnas: id_comparativo bigint NOT NULL IDENTITY; descripcion character varying NOT NULL; estado boolean NOT NULL DEFAULT true; created_at timestamp with time zone NOT NULL DEFAULT now(); updated_at timestamp with time zone NOT NULL DEFAULT now()
PK: id_comparativo. RLS: habilitado.
FK salientes: ninguna.
Políticas RLS: admin_crear_comparativo [INSERT, authenticated] USING=— WITH CHECK=private.is_admin(); admin_eliminar_comparativo [DELETE, authenticated] USING=private.is_admin() WITH CHECK=—; admin_modificar_comparativo [UPDATE, authenticated] USING=private.is_admin() WITH CHECK=private.is_admin(); usuarios_activos_ver_comparativo [SELECT, authenticated] USING=(private.get_my_permission() IS NOT NULL) WITH CHECK=—.
Triggers: ninguno identificado.

#### dim_variedad
Columnas: id_variedad bigint NOT NULL IDENTITY; descripcion character varying NOT NULL; estado boolean NOT NULL DEFAULT true; created_at timestamp with time zone NOT NULL DEFAULT now(); updated_at timestamp with time zone NOT NULL DEFAULT now()
PK: id_variedad. RLS: habilitado.
FK salientes: ninguna.
Políticas RLS: admin_crear_variedad [INSERT, authenticated] USING=— WITH CHECK=private.is_admin(); admin_eliminar_variedad [DELETE, authenticated] USING=private.is_admin() WITH CHECK=—; admin_modificar_variedad [UPDATE, authenticated] USING=private.is_admin() WITH CHECK=private.is_admin(); usuarios_activos_ver_variedad [SELECT, authenticated] USING=(private.get_my_permission() IS NOT NULL) WITH CHECK=—.
Triggers: ninguno identificado.

#### dim_centro_costo
Columnas: cod_cc_pk bigint NOT NULL; id_empresa bigint NOT NULL; cod_cc bigint NOT NULL; desc_cc character varying NOT NULL; id_tip_cc bigint NOT NULL; id_tipo_maq bigint NULL; id_comparativo bigint NULL; id_variedad bigint NULL; estado boolean NOT NULL DEFAULT true; created_at timestamp with time zone NOT NULL DEFAULT now(); updated_at timestamp with time zone NOT NULL DEFAULT now()
PK: cod_cc_pk. RLS: habilitado.
FK salientes: fk_centro_costo_variedad: id_variedad → public.dim_variedad.id_variedad; fk_centro_costo_maquinaria: id_tipo_maq → public.dim_tipo_maq.id_tipo_maq; fk_centro_costo_tipo: id_tip_cc → public.Dim_TipoCC.id_tip_cc; fk_centro_costo_empresa: id_empresa → public.Dim_Empresa.id_empresa; fk_centro_costo_comparativo: id_comparativo → public.dim_comparativo.id_comparativo.
Políticas RLS: admin_crear_centro_costo [INSERT, authenticated] USING=— WITH CHECK=private.is_admin(); admin_eliminar_centro_costo [DELETE, authenticated] USING=private.is_admin() WITH CHECK=—; admin_modificar_centro_costo [UPDATE, authenticated] USING=private.is_admin() WITH CHECK=private.is_admin(); admin_ver_todos_los_centros_costo [SELECT, authenticated] USING=private.is_admin() WITH CHECK=—; usuario_ver_centros_costo_empresa [SELECT, authenticated] USING=((private.get_my_permission() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM (usuario_empresa ue
     JOIN usuarios u ON ((u.id_usuario = ue.id_usuario)))
  WHERE ((ue.id_empresa = dim_centro_costo.id_empresa) AND (ue.estado IS TRUE) AND (u.auth_user_id = ( SELECT auth.uid() AS uid)) AND ((u.estado)::text = 'ACTIVO'::text))))) WITH CHECK=—.
Triggers: trg_proteger_centro_costo_con_campanas [habilitado]: CREATE TRIGGER trg_proteger_centro_costo_con_campanas BEFORE UPDATE ON public.dim_centro_costo FOR EACH ROW EXECUTE FUNCTION proteger_centro_costo_con_campanas().

#### Dim_Campana
Columnas: id_campana bigint NOT NULL; id_campana_emp bigint NOT NULL; id_empresa bigint NOT NULL; cod_cc_pk bigint NOT NULL; nombre_campana character varying NOT NULL; fecha_inicio date NOT NULL CHECK(fecha_inicio >= '2015-01-01'::date); fecha_fin date NOT NULL; fecha_inicio_ctb date NOT NULL; fecha_fin_ctb date NOT NULL; hectareas numeric NOT NULL CHECK(hectareas IS NOT NULL AND hectareas > 0::numeric); estado boolean NOT NULL DEFAULT true; cierre_camp boolean NOT NULL DEFAULT false; created_at timestamp with time zone NOT NULL DEFAULT now(); updated_at timestamp with time zone NOT NULL DEFAULT now()
PK: id_campana. RLS: habilitado.
FK salientes: fk_campaña_centro_costo: cod_cc_pk → public.dim_centro_costo.cod_cc_pk; fk_campaña_empresa: id_empresa → public.Dim_Empresa.id_empresa.
Políticas RLS: admin_crear_campanas [INSERT, authenticated] USING=— WITH CHECK=private.is_admin(); admin_eliminar_campanas [DELETE, authenticated] USING=private.is_admin() WITH CHECK=—; admin_modificar_campanas [UPDATE, authenticated] USING=private.is_admin() WITH CHECK=private.is_admin(); usuarios_activos_ver_campanas [SELECT, authenticated] USING=(private.is_admin() OR ((private.get_my_permission() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM (usuarios u
     JOIN usuario_empresa ue ON ((ue.id_usuario = u.id_usuario)))
  WHERE ((u.auth_user_id = ( SELECT auth.uid() AS uid)) AND ((u.estado)::text = 'ACTIVO'::text) AND (ue.id_empresa = "Dim_Campana".id_empresa) AND (ue.estado IS TRUE)))))) WITH CHECK=—.
Triggers: trg_00_campana_inmutable_centro_inactivo [habilitado]: CREATE TRIGGER trg_00_campana_inmutable_centro_inactivo BEFORE DELETE OR UPDATE ON public."Dim_Campana" FOR EACH ROW EXECUTE FUNCTION proteger_campana_centro_inactivo(); trg_validar_campana [habilitado]: CREATE TRIGGER trg_validar_campana BEFORE INSERT OR UPDATE ON public."Dim_Campana" FOR EACH ROW EXECUTE FUNCTION validar_campana().

#### Dim_Etapa_Costo
Columnas: cod_etapa bigint NOT NULL IDENTITY; etapa_costo character varying NOT NULL UNIQUE; estado boolean NOT NULL DEFAULT true; created_at timestamp with time zone NOT NULL DEFAULT now(); updated_at timestamp with time zone NOT NULL DEFAULT now()
PK: cod_etapa. RLS: habilitado.
FK salientes: ninguna.
Políticas RLS: admin_crear_etapas_costo [INSERT, authenticated] USING=— WITH CHECK=private.is_admin(); admin_eliminar_etapas_costo [DELETE, authenticated] USING=private.is_admin() WITH CHECK=—; admin_modificar_etapas_costo [UPDATE, authenticated] USING=private.is_admin() WITH CHECK=private.is_admin(); usuarios_activos_ver_etapas_costo [SELECT, authenticated] USING=(private.get_my_permission() IS NOT NULL) WITH CHECK=—.
Triggers: ninguno identificado.

#### TipoCambio
Columnas: id_tipo_cambio bigint NOT NULL IDENTITY; anho integer NOT NULL CHECK(anho >= 2000 AND anho <= 2100); mes integer NOT NULL CHECK(mes >= 1 AND mes <= 12); tipo_cambio numeric NOT NULL CHECK(tipo_cambio > 0::numeric); created_at timestamp with time zone NOT NULL DEFAULT now(); updated_at timestamp with time zone NOT NULL DEFAULT now()
PK: id_tipo_cambio. RLS: habilitado.
FK salientes: ninguna.
Políticas RLS: admin_actualizar_tipo_cambio [UPDATE, authenticated] USING=private.is_admin() WITH CHECK=private.is_admin(); admin_eliminar_tipo_cambio [DELETE, authenticated] USING=private.is_admin() WITH CHECK=—; admin_insertar_tipo_cambio [INSERT, authenticated] USING=— WITH CHECK=private.is_admin(); usuarios_activos_ver_tipo_cambio [SELECT, authenticated] USING=(private.get_my_permission() IS NOT NULL) WITH CHECK=—.
Triggers: trg_actualizar_fecha_tipo_cambio [habilitado]: CREATE TRIGGER trg_actualizar_fecha_tipo_cambio BEFORE UPDATE ON public."TipoCambio" FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha_tipo_cambio(); trg_impedir_cambio_periodo_tipo_cambio [habilitado]: CREATE TRIGGER trg_impedir_cambio_periodo_tipo_cambio BEFORE UPDATE OF anho, mes ON public."TipoCambio" FOR EACH ROW EXECUTE FUNCTION impedir_cambio_periodo_tipo_cambio(); trg_validar_correlatividad_tipo_cambio [habilitado]: CREATE TRIGGER trg_validar_correlatividad_tipo_cambio BEFORE INSERT ON public."TipoCambio" FOR EACH ROW EXECUTE FUNCTION fn_validar_correlatividad_tipo_cambio().

### Delta verificado 2026-10-31 — RBAC granular y piloto Empresas

Fuente: migraciones aplicadas a Supabase Central `20261031040053_rbac_module_catalog`, `20261031040135_seed_rbac_module_catalog`, `20261031040723_rbac_empresas_pilot` y `20261031050245_rbac_rename_reader_to_writer`. No sustituye la fotografía histórica de las otras tablas.

#### permiso — estado actual

- `public.permiso` conserva columnas, PK y restricción UNIQUE de la ficha histórica. Sus roles activos observados son `ADMIN`, `QUERY` y `WRITER`.
- El registro global `READER` se renombró a `WRITER`; se conservó su `id_permiso` y los usuarios relacionados. El trigger existente de protección del ADMIN permanece.

#### modulos — tabla nueva

- Columnas: `id_modulo bigint GENERATED BY DEFAULT AS IDENTITY` PK; `codigo text NOT NULL UNIQUE`; `nombre text NOT NULL`; `grupo text NOT NULL`; `ruta text NULL`; `orden integer NOT NULL DEFAULT 0`; `estado boolean NOT NULL DEFAULT true`; `created_at` y `updated_at timestamptz NOT NULL DEFAULT now()`.
- CHECK: `codigo` debe cumplir `^[A-Z][A-Z0-9_]*$`.
- RLS habilitado. SELECT permite ver módulos activos a usuarios autenticados con permiso vigente y módulos al ADMIN; INSERT/UPDATE/DELETE solo ADMIN autenticado y activo (`private.is_admin()`).
- Catálogo inicial de 11 códigos: DASHBOARD, USUARIOS, EMPRESAS, VARIEDADES, TIPOS_CENTRO_COSTO, TIPOS_MAQUINARIA, ETAPAS_COSTO, TIPO_CAMBIO, CAMPANAS, COMPARATIVOS y CENTRO_COSTOS.

#### usuario_modulo — tabla nueva

- Columnas: `id_usuario_modulo bigint GENERATED BY DEFAULT AS IDENTITY` PK; `id_usuario bigint NOT NULL` FK a `usuarios`; `id_modulo bigint NOT NULL` FK a `modulos`; `nivel text NOT NULL`; `estado boolean NOT NULL DEFAULT true`; `created_at` y `updated_at timestamptz NOT NULL DEFAULT now()`.
- UNIQUE (`id_usuario`, `id_modulo`); CHECK `nivel IN ('QUERY','WRITER')`.
- Índice parcial en (`id_usuario`, `id_modulo`) cuando `estado IS TRUE`.
- RLS habilitado. SELECT permite al usuario activo consultar su asignación propia y a ADMIN consultar todas. INSERT/UPDATE/DELETE solo ADMIN autenticado y activo.
- Niveles: QUERY consulta/exporta; WRITER incluye consulta/exportación, creación, actualización y activar/desactivar; no puede eliminar. La eliminación se reserva a ADMIN.
- La asignación inicial de migración se especificó para prueba 2 QUERY y prueba 3 WRITER en EMPRESAS, pero el estado consultado después del piloto (2026-10-31) muestra prueba 1 WRITER y prueba 3 WRITER, mientras prueba 2 no tiene asignación al módulo. Confirmar/alinear antes de reutilizar la prueba 2.

#### Dim_Empresa — delta RLS de Empresas

- Se quitó `usuario_ver_empresas_asignadas`, que concedía SELECT sin asignación explícita al módulo.
- Políticas vigentes añadidas: `empresas_query_ver_asignadas` (SELECT requiere QUERY o WRITER asignado a EMPRESAS y empresa vinculada); `empresas_writer_crear` (INSERT para WRITER); `empresas_writer_actualizar_asignadas` (UPDATE para WRITER sobre empresas vinculadas).
- Se conservan `admin_ver_todas_las_empresas`, `admin_crear_empresa`, `admin_modificar_empresa` y `admin_eliminar_empresa`; DELETE continúa solo para ADMIN.
- Empresa es raíz del ámbito de empresas: para crear una empresa nueva no existe aún una fila de `usuario_empresa` vinculable; la política de WRITER permite INSERT y su alcance de vínculo se verifica al consultar/actualizar empresas existentes.

#### Funciones de autorización agregadas/actualizadas

- `private.can_access_module(text,text)`: SECURITY DEFINER, `search_path` fijado; requiere sesión autenticada, o ADMIN activo; para otros exige usuario/permiso activos, módulo activo y asignación activa QUERY/WRITER. WRITER satisface el umbral QUERY y WRITER.
- `private.has_company_access(bigint)`: SECURITY DEFINER, `search_path` fijado; requiere usuario activo con vínculo `usuario_empresa` activo, o ADMIN activo.
- Ejecución concedida a authenticated; revocada a PUBLIC y anon. Estas funciones se usan en las políticas del piloto de Empresas.

#### Estado de actualización

Supabase Central recibió las cuatro migraciones señaladas. El frontend local reconoce `WRITER`; el build aprobó el 2026-10-31. No se ha publicado el frontend ni se extendió el RLS granular por asignación a otros módulos. Las interfaces ADMIN de catálogo y asignaciones existen en local; ver el delta del 2026-11-02.

### Delta RLS verificado en Supabase Central — 2026-11-02

Consulta de solo lectura a `pg_policies`, funciones auxiliares y grants. Se confirma RLS habilitado en las nueve tablas de Maestros y en `usuarios`, `usuario_empresa`, `usuario_modulo`, `permiso` y `modulos`.

- **Maestros:** `dim_variedad`, `Dim_Empresa`, `Dim_TipoCC`, `dim_tipo_maq`, `Dim_Etapa_Costo`, `TipoCambio`, `dim_comparativo`, `Dim_Campana` y `dim_centro_costo` permiten lectura a usuarios con permiso activo. Para Empresas, Campañas y Centro de Costos, la lectura no ADMIN requiere además empresa asignada activa; ADMIN lee todas. Las políticas INSERT, UPDATE y DELETE de estas tablas verificadas requieren `private.is_admin()`.
- **usuarios:** SELECT del perfil propio mediante `auth_user_id = auth.uid()`; ADMIN puede ver todos los perfiles. UPDATE requiere `private.is_admin()`. La gestión de usuario se completa mediante Edge Function con validación explícita de ADMIN y service_role; no hay escritura directa para `authenticated`.
- **usuario_empresa:** el usuario activo puede leer sus propias asignaciones activas; ADMIN puede leer todas. INSERT/UPDATE/DELETE requieren ADMIN.
- **usuario_modulo:** el usuario activo puede leer sus propias asignaciones; ADMIN puede leer todas. INSERT/UPDATE/DELETE requieren ADMIN.
- **modulos:** los usuarios activos pueden leer únicamente módulos activos; ADMIN puede consultar activos e inactivos y tiene INSERT/UPDATE/DELETE.
- **permiso:** la política anterior `usuarios_autenticados_ver_permisos` (`USING true`) fue reemplazada por `usuarios_activos_ver_permisos`: usuarios activos leen solo permisos activos; ADMIN puede leer también permisos inactivos. `authenticated` mantiene solo SELECT por grants; la escritura directa sigue revocada y el catálogo se modifica mediante migraciones.
- Migración aplicada: `20261102202432_restrict_permission_catalog_reads_to_active_users`. La inspección confirmó la política registrada en Supabase. No se simuló una sesión real de cada rol.
- **Frontend (capa distinta de RLS):** las nueve rutas de Maestros requieren rol ADMIN y validan que el código de módulo esté activo en el catálogo. Las pantallas `/modulos` y `/permisos` están integradas en GitHub `main` mediante PR #63; build aprobado el 2026-11-02, pendiente prueba manual y despliegue. Esta validación de ruta no agrega restricción por módulo a las políticas de lectura de las tablas.

Este delta describe las políticas observadas el 2026-11-02; la ficha histórica de cada tabla se conserva como fotografía previa. Consultar de nuevo el catálogo antes de reconstruir o alterar estas políticas.

## 12. Prompt reutilizable para proponer una tabla y seguridad

> Actúa como responsable técnico de SCGCA Central. Lee este BRAIN, vuelve a consultar el esquema actual y revisa las migraciones locales: el inventario tiene fecha y puede haber cambiado. Verifica columnas, constraints, índices, grants, RLS, triggers, funciones y consumidores en frontend/RPC/Edge Functions. Necesidad: [describir]. Tabla candidata: [nombre]. Entorno: [local/desarrollo/producción].
>
> Antes de editar, presenta el diseño: reglas y actores; columnas, tipos, nullabilidad, defaults, PK, UNIQUE, CHECK y FK; índices justificados; grants mínimos; políticas SELECT/INSERT/UPDATE/DELETE con roles y USING/WITH CHECK; triggers y funciones necesarios o motivo para no usarlos; riesgos de acceso entre empresas y usuarios inactivos; migración, consumidores y pruebas. Separa hechos verificados, decisiones pendientes y recomendaciones. No inventes reglas.
>
> Aplica RLS a tablas expuestas y mínimo privilegio. Usa roles explícitos; UPDATE requiere USING y WITH CHECK. No bases autorización en user_metadata. Inspecciona helpers existentes; evita SECURITY DEFINER salvo justificación, search_path controlado y EXECUTE restringido. Evalúa grants junto con RLS. No incluyas secretos ni datos reales. Presenta primero el diseño y espera aprobación antes de editar o desplegar. Tras autorización, crea migración versionada según el flujo del proyecto, revisa SQL, prueba de forma segura y documenta resultado. Producción requiere autorización específica.

## 13. Plantilla de ficha de objeto de base

Objeto/esquema | fecha de verificación | propósito | columnas/firmas | PK/UNIQUE/CHECK | FK | índices | RLS | políticas | grants | triggers/funciones | migración fuente | consumidores | pruebas | pendientes.
+

### 11.1 Instrucción de reconstrucción por tabla (portabilidad)

Cada bloque es una instrucción independiente para generar una migración en otra base/proyecto. Copiar el bloque de la tabla objetivo junto con los bloques de sus dependencias. Son especificaciones derivadas del corte indicado, no SQL ejecutable: antes de aplicar, recuperar y verificar el SQL fuente de migraciones, funciones/RPC, índices, grants, secuencias, ownership y dependencias de cada trigger. Respetar orden de dependencias y validar en una base vacía de prueba.

#### Reconstruir tabla permiso

> En el proyecto/base de datos destino, reconstruye la tabla `public.permiso` según esta especificación: columnas [id_permiso bigint NOT NULL IDENTITY; nombre character varying NOT NULL UNIQUE; descripcion character varying NULL; estado boolean NOT NULL DEFAULT true; created_at timestamp with time zone NOT NULL DEFAULT now()], clave primaria [id_permiso], relaciones salientes [ninguna]. Habilita RLS. Define estas políticas en modo y alcance equivalentes: [usuarios_autenticados_ver_permisos; SELECT; roles authenticated; USING true; WITH CHECK —]. Triggers requeridos [trg_proteger_permiso_admin_activo: CREATE TRIGGER trg_proteger_permiso_admin_activo BEFORE UPDATE OF nombre, estado ON public.permiso FOR EACH ROW EXECUTE FUNCTION proteger_permiso_admin_activo()]. Antes de generar SQL, resuelve dependencias de funciones y tablas referenciadas, verifica que helpers como private.is_admin() y private.get_my_permission() existan y tengan implementación equivalente, identifica índices/grants/privilegios de secuencias y localiza migraciones fuente. No inventes comportamiento que no esté definido. Entrega una migración idempotente o repetible según convención del proyecto destino, explica diferencias de motor/versión/case-sensitivity y lista pruebas de estructura y autorización. No la apliques ni despliegues sin aprobación explícita.>

#### Reconstruir tabla usuarios

> En el proyecto/base de datos destino, reconstruye la tabla `public.usuarios` según esta especificación: columnas [id_usuario bigint NOT NULL IDENTITY; auth_user_id uuid NOT NULL UNIQUE; nombre character varying NOT NULL; apellido character varying NULL; id_permiso bigint NULL; estado character varying NOT NULL DEFAULT 'PENDIENTE'::character varying CHECK(estado::text = ANY (ARRAY['PENDIENTE'::character varying, 'ACTIVO'::character varying, 'INACTIVO'::character varying]::text[])); created_at timestamp with time zone NOT NULL DEFAULT now(); updated_at timestamp with time zone NOT NULL DEFAULT now()], clave primaria [id_usuario], relaciones salientes [usuarios_id_permiso_fkey: (id_permiso) REFERENCES public.permiso(id_permiso)]. Habilita RLS. Define estas políticas en modo y alcance equivalentes: [admin_modificar_usuarios; UPDATE; roles authenticated; USING private.is_admin(); WITH CHECK private.is_admin() || admin_ver_todos_los_usuarios; SELECT; roles authenticated; USING (private.get_my_permission() = 'ADMIN'::text); WITH CHECK — || usuarios_ver_propio_registro; SELECT; roles authenticated; USING (auth_user_id = ( SELECT auth.uid() AS uid)); WITH CHECK —]. Triggers requeridos [trg_proteger_ultimo_admin: CREATE TRIGGER trg_proteger_ultimo_admin BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION proteger_ultimo_admin()]. Antes de generar SQL, resuelve dependencias de funciones y tablas referenciadas, verifica que helpers como private.is_admin() y private.get_my_permission() existan y tengan implementación equivalente, identifica índices/grants/privilegios de secuencias y localiza migraciones fuente. No inventes comportamiento que no esté definido. Entrega una migración idempotente o repetible según convención del proyecto destino, explica diferencias de motor/versión/case-sensitivity y lista pruebas de estructura y autorización. No la apliques ni despliegues sin aprobación explícita.>

#### Reconstruir tabla Dim_Empresa

> En el proyecto/base de datos destino, reconstruye la tabla `public.Dim_Empresa` según esta especificación: columnas [id_empresa bigint NOT NULL IDENTITY; descripcion character varying NOT NULL UNIQUE; nombre_comercial character varying NOT NULL UNIQUE; estado boolean NOT NULL DEFAULT true; created_at timestamp with time zone NOT NULL DEFAULT now(); updated_at timestamp with time zone NOT NULL DEFAULT now()], clave primaria [id_empresa], relaciones salientes [ninguna]. Habilita RLS. Define estas políticas en modo y alcance equivalentes: [admin_crear_empresa; INSERT; roles authenticated; USING —; WITH CHECK private.is_admin() || admin_eliminar_empresa; DELETE; roles authenticated; USING private.is_admin(); WITH CHECK — || admin_modificar_empresa; UPDATE; roles authenticated; USING private.is_admin(); WITH CHECK private.is_admin() || admin_ver_todas_las_empresas; SELECT; roles authenticated; USING private.is_admin(); WITH CHECK — || usuario_ver_empresas_asignadas; SELECT; roles authenticated; USING ((private.get_my_permission() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM (usuario_empresa ue
     JOIN usuarios u ON ((u.id_usuario = ue.id_usuario)))
  WHERE ((ue.id_empresa = "Dim_Empresa".id_empresa) AND (ue.estado IS TRUE) AND (u.auth_user_id = ( SELECT auth.uid() AS uid)) AND ((u.estado)::text = 'ACTIVO'::text))))); WITH CHECK —]. Triggers requeridos [ninguno identificado]. Antes de generar SQL, resuelve dependencias de funciones y tablas referenciadas, verifica que helpers como private.is_admin() y private.get_my_permission() existan y tengan implementación equivalente, identifica índices/grants/privilegios de secuencias y localiza migraciones fuente. No inventes comportamiento que no esté definido. Entrega una migración idempotente o repetible según convención del proyecto destino, explica diferencias de motor/versión/case-sensitivity y lista pruebas de estructura y autorización. No la apliques ni despliegues sin aprobación explícita.>

#### Reconstruir tabla usuario_empresa

> En el proyecto/base de datos destino, reconstruye la tabla `public.usuario_empresa` según esta especificación: columnas [id_usuario_empresa bigint NOT NULL IDENTITY; id_usuario bigint NOT NULL; id_empresa bigint NOT NULL; estado boolean NOT NULL DEFAULT true; created_at timestamp with time zone NOT NULL DEFAULT now()], clave primaria [id_usuario_empresa], relaciones salientes [fk_usuario_empresa_empresa: (id_empresa) REFERENCES public.Dim_Empresa(id_empresa); fk_usuario_empresa_usuario: (id_usuario) REFERENCES public.usuarios(id_usuario)]. Habilita RLS. Define estas políticas en modo y alcance equivalentes: [admin_crear_asignaciones_empresa; INSERT; roles authenticated; USING —; WITH CHECK private.is_admin() || admin_eliminar_asignaciones_empresa; DELETE; roles authenticated; USING private.is_admin(); WITH CHECK — || admin_modificar_asignaciones_empresa; UPDATE; roles authenticated; USING private.is_admin(); WITH CHECK private.is_admin() || admin_ver_asignaciones_empresa; SELECT; roles authenticated; USING private.is_admin(); WITH CHECK — || usuario_ver_sus_asignaciones; SELECT; roles authenticated; USING ((private.get_my_permission() IS NOT NULL) AND (estado IS TRUE) AND (EXISTS ( SELECT 1
   FROM usuarios u
  WHERE ((u.id_usuario = usuario_empresa.id_usuario) AND (u.auth_user_id = ( SELECT auth.uid() AS uid)) AND ((u.estado)::text = 'ACTIVO'::text))))); WITH CHECK —]. Triggers requeridos [ninguno identificado]. Antes de generar SQL, resuelve dependencias de funciones y tablas referenciadas, verifica que helpers como private.is_admin() y private.get_my_permission() existan y tengan implementación equivalente, identifica índices/grants/privilegios de secuencias y localiza migraciones fuente. No inventes comportamiento que no esté definido. Entrega una migración idempotente o repetible según convención del proyecto destino, explica diferencias de motor/versión/case-sensitivity y lista pruebas de estructura y autorización. No la apliques ni despliegues sin aprobación explícita.>

#### Reconstruir tabla Dim_TipoCC

> En el proyecto/base de datos destino, reconstruye la tabla `public.Dim_TipoCC` según esta especificación: columnas [id_tip_cc bigint NOT NULL IDENTITY; des_tip_cc character varying NOT NULL; estado boolean NOT NULL DEFAULT true; created_at timestamp with time zone NOT NULL DEFAULT now(); updated_at timestamp with time zone NOT NULL DEFAULT now()], clave primaria [id_tip_cc], relaciones salientes [ninguna]. Habilita RLS. Define estas políticas en modo y alcance equivalentes: [admin_crear_tipo_cc; INSERT; roles authenticated; USING —; WITH CHECK private.is_admin() || admin_eliminar_tipo_cc; DELETE; roles authenticated; USING private.is_admin(); WITH CHECK — || admin_modificar_tipo_cc; UPDATE; roles authenticated; USING private.is_admin(); WITH CHECK private.is_admin() || usuarios_activos_ver_tipo_cc; SELECT; roles authenticated; USING (private.get_my_permission() IS NOT NULL); WITH CHECK —]. Triggers requeridos [ninguno identificado]. Antes de generar SQL, resuelve dependencias de funciones y tablas referenciadas, verifica que helpers como private.is_admin() y private.get_my_permission() existan y tengan implementación equivalente, identifica índices/grants/privilegios de secuencias y localiza migraciones fuente. No inventes comportamiento que no esté definido. Entrega una migración idempotente o repetible según convención del proyecto destino, explica diferencias de motor/versión/case-sensitivity y lista pruebas de estructura y autorización. No la apliques ni despliegues sin aprobación explícita.>

#### Reconstruir tabla dim_tipo_maq

> En el proyecto/base de datos destino, reconstruye la tabla `public.dim_tipo_maq` según esta especificación: columnas [id_tipo_maq bigint NOT NULL IDENTITY; des_tipo_maquinaria character varying NOT NULL UNIQUE; estado boolean NOT NULL DEFAULT true; created_at timestamp with time zone NOT NULL DEFAULT now(); updated_at timestamp with time zone NOT NULL DEFAULT now()], clave primaria [id_tipo_maq], relaciones salientes [ninguna]. Habilita RLS. Define estas políticas en modo y alcance equivalentes: [admin_crear_tipo_maquinaria; INSERT; roles authenticated; USING —; WITH CHECK private.is_admin() || admin_eliminar_tipo_maquinaria; DELETE; roles authenticated; USING private.is_admin(); WITH CHECK — || admin_modificar_tipo_maquinaria; UPDATE; roles authenticated; USING private.is_admin(); WITH CHECK private.is_admin() || usuarios_activos_ver_tipo_maquinaria; SELECT; roles authenticated; USING (private.get_my_permission() IS NOT NULL); WITH CHECK —]. Triggers requeridos [ninguno identificado]. Antes de generar SQL, resuelve dependencias de funciones y tablas referenciadas, verifica que helpers como private.is_admin() y private.get_my_permission() existan y tengan implementación equivalente, identifica índices/grants/privilegios de secuencias y localiza migraciones fuente. No inventes comportamiento que no esté definido. Entrega una migración idempotente o repetible según convención del proyecto destino, explica diferencias de motor/versión/case-sensitivity y lista pruebas de estructura y autorización. No la apliques ni despliegues sin aprobación explícita.>

#### Reconstruir tabla dim_comparativo

> En el proyecto/base de datos destino, reconstruye la tabla `public.dim_comparativo` según esta especificación: columnas [id_comparativo bigint NOT NULL IDENTITY; descripcion character varying NOT NULL; estado boolean NOT NULL DEFAULT true; created_at timestamp with time zone NOT NULL DEFAULT now(); updated_at timestamp with time zone NOT NULL DEFAULT now()], clave primaria [id_comparativo], relaciones salientes [ninguna]. Habilita RLS. Define estas políticas en modo y alcance equivalentes: [admin_crear_comparativo; INSERT; roles authenticated; USING —; WITH CHECK private.is_admin() || admin_eliminar_comparativo; DELETE; roles authenticated; USING private.is_admin(); WITH CHECK — || admin_modificar_comparativo; UPDATE; roles authenticated; USING private.is_admin(); WITH CHECK private.is_admin() || usuarios_activos_ver_comparativo; SELECT; roles authenticated; USING (private.get_my_permission() IS NOT NULL); WITH CHECK —]. Triggers requeridos [ninguno identificado]. Antes de generar SQL, resuelve dependencias de funciones y tablas referenciadas, verifica que helpers como private.is_admin() y private.get_my_permission() existan y tengan implementación equivalente, identifica índices/grants/privilegios de secuencias y localiza migraciones fuente. No inventes comportamiento que no esté definido. Entrega una migración idempotente o repetible según convención del proyecto destino, explica diferencias de motor/versión/case-sensitivity y lista pruebas de estructura y autorización. No la apliques ni despliegues sin aprobación explícita.>

#### Reconstruir tabla dim_variedad

> En el proyecto/base de datos destino, reconstruye la tabla `public.dim_variedad` según esta especificación: columnas [id_variedad bigint NOT NULL IDENTITY; descripcion character varying NOT NULL; estado boolean NOT NULL DEFAULT true; created_at timestamp with time zone NOT NULL DEFAULT now(); updated_at timestamp with time zone NOT NULL DEFAULT now()], clave primaria [id_variedad], relaciones salientes [ninguna]. Habilita RLS. Define estas políticas en modo y alcance equivalentes: [admin_crear_variedad; INSERT; roles authenticated; USING —; WITH CHECK private.is_admin() || admin_eliminar_variedad; DELETE; roles authenticated; USING private.is_admin(); WITH CHECK — || admin_modificar_variedad; UPDATE; roles authenticated; USING private.is_admin(); WITH CHECK private.is_admin() || usuarios_activos_ver_variedad; SELECT; roles authenticated; USING (private.get_my_permission() IS NOT NULL); WITH CHECK —]. Triggers requeridos [ninguno identificado]. Antes de generar SQL, resuelve dependencias de funciones y tablas referenciadas, verifica que helpers como private.is_admin() y private.get_my_permission() existan y tengan implementación equivalente, identifica índices/grants/privilegios de secuencias y localiza migraciones fuente. No inventes comportamiento que no esté definido. Entrega una migración idempotente o repetible según convención del proyecto destino, explica diferencias de motor/versión/case-sensitivity y lista pruebas de estructura y autorización. No la apliques ni despliegues sin aprobación explícita.>

#### Reconstruir tabla dim_centro_costo

> En el proyecto/base de datos destino, reconstruye la tabla `public.dim_centro_costo` según esta especificación: columnas [cod_cc_pk bigint NOT NULL; id_empresa bigint NOT NULL; cod_cc bigint NOT NULL; desc_cc character varying NOT NULL; id_tip_cc bigint NOT NULL; id_tipo_maq bigint NULL; id_comparativo bigint NULL; id_variedad bigint NULL; estado boolean NOT NULL DEFAULT true; created_at timestamp with time zone NOT NULL DEFAULT now(); updated_at timestamp with time zone NOT NULL DEFAULT now()], clave primaria [cod_cc_pk], relaciones salientes [fk_centro_costo_variedad: (id_variedad) REFERENCES public.dim_variedad(id_variedad); fk_centro_costo_maquinaria: (id_tipo_maq) REFERENCES public.dim_tipo_maq(id_tipo_maq); fk_centro_costo_tipo: (id_tip_cc) REFERENCES public.Dim_TipoCC(id_tip_cc); fk_centro_costo_empresa: (id_empresa) REFERENCES public.Dim_Empresa(id_empresa); fk_centro_costo_comparativo: (id_comparativo) REFERENCES public.dim_comparativo(id_comparativo)]. Habilita RLS. Define estas políticas en modo y alcance equivalentes: [admin_crear_centro_costo; INSERT; roles authenticated; USING —; WITH CHECK private.is_admin() || admin_eliminar_centro_costo; DELETE; roles authenticated; USING private.is_admin(); WITH CHECK — || admin_modificar_centro_costo; UPDATE; roles authenticated; USING private.is_admin(); WITH CHECK private.is_admin() || admin_ver_todos_los_centros_costo; SELECT; roles authenticated; USING private.is_admin(); WITH CHECK — || usuario_ver_centros_costo_empresa; SELECT; roles authenticated; USING ((private.get_my_permission() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM (usuario_empresa ue
     JOIN usuarios u ON ((u.id_usuario = ue.id_usuario)))
  WHERE ((ue.id_empresa = dim_centro_costo.id_empresa) AND (ue.estado IS TRUE) AND (u.auth_user_id = ( SELECT auth.uid() AS uid)) AND ((u.estado)::text = 'ACTIVO'::text))))); WITH CHECK —]. Triggers requeridos [trg_proteger_centro_costo_con_campanas: CREATE TRIGGER trg_proteger_centro_costo_con_campanas BEFORE UPDATE ON public.dim_centro_costo FOR EACH ROW EXECUTE FUNCTION proteger_centro_costo_con_campanas()]. Antes de generar SQL, resuelve dependencias de funciones y tablas referenciadas, verifica que helpers como private.is_admin() y private.get_my_permission() existan y tengan implementación equivalente, identifica índices/grants/privilegios de secuencias y localiza migraciones fuente. No inventes comportamiento que no esté definido. Entrega una migración idempotente o repetible según convención del proyecto destino, explica diferencias de motor/versión/case-sensitivity y lista pruebas de estructura y autorización. No la apliques ni despliegues sin aprobación explícita.>

#### Reconstruir tabla Dim_Campana

> En el proyecto/base de datos destino, reconstruye la tabla `public.Dim_Campana` según esta especificación: columnas [id_campana bigint NOT NULL; id_campana_emp bigint NOT NULL; id_empresa bigint NOT NULL; cod_cc_pk bigint NOT NULL; nombre_campana character varying NOT NULL; fecha_inicio date NOT NULL CHECK(fecha_inicio >= '2015-01-01'::date); fecha_fin date NOT NULL; fecha_inicio_ctb date NOT NULL; fecha_fin_ctb date NOT NULL; hectareas numeric NOT NULL CHECK(hectareas IS NOT NULL AND hectareas > 0::numeric); estado boolean NOT NULL DEFAULT true; cierre_camp boolean NOT NULL DEFAULT false; created_at timestamp with time zone NOT NULL DEFAULT now(); updated_at timestamp with time zone NOT NULL DEFAULT now()], clave primaria [id_campana], relaciones salientes [fk_campaña_centro_costo: (cod_cc_pk) REFERENCES public.dim_centro_costo(cod_cc_pk); fk_campaña_empresa: (id_empresa) REFERENCES public.Dim_Empresa(id_empresa)]. Habilita RLS. Define estas políticas en modo y alcance equivalentes: [admin_crear_campanas; INSERT; roles authenticated; USING —; WITH CHECK private.is_admin() || admin_eliminar_campanas; DELETE; roles authenticated; USING private.is_admin(); WITH CHECK — || admin_modificar_campanas; UPDATE; roles authenticated; USING private.is_admin(); WITH CHECK private.is_admin() || usuarios_activos_ver_campanas; SELECT; roles authenticated; USING (private.is_admin() OR ((private.get_my_permission() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM (usuarios u
     JOIN usuario_empresa ue ON ((ue.id_usuario = u.id_usuario)))
  WHERE ((u.auth_user_id = ( SELECT auth.uid() AS uid)) AND ((u.estado)::text = 'ACTIVO'::text) AND (ue.id_empresa = "Dim_Campana".id_empresa) AND (ue.estado IS TRUE)))))); WITH CHECK —]. Triggers requeridos [trg_00_campana_inmutable_centro_inactivo: CREATE TRIGGER trg_00_campana_inmutable_centro_inactivo BEFORE DELETE OR UPDATE ON public."Dim_Campana" FOR EACH ROW EXECUTE FUNCTION proteger_campana_centro_inactivo() || trg_validar_campana: CREATE TRIGGER trg_validar_campana BEFORE INSERT OR UPDATE ON public."Dim_Campana" FOR EACH ROW EXECUTE FUNCTION validar_campana()]. Antes de generar SQL, resuelve dependencias de funciones y tablas referenciadas, verifica que helpers como private.is_admin() y private.get_my_permission() existan y tengan implementación equivalente, identifica índices/grants/privilegios de secuencias y localiza migraciones fuente. No inventes comportamiento que no esté definido. Entrega una migración idempotente o repetible según convención del proyecto destino, explica diferencias de motor/versión/case-sensitivity y lista pruebas de estructura y autorización. No la apliques ni despliegues sin aprobación explícita.>

#### Reconstruir tabla Dim_Etapa_Costo

> En el proyecto/base de datos destino, reconstruye la tabla `public.Dim_Etapa_Costo` según esta especificación: columnas [cod_etapa bigint NOT NULL IDENTITY; etapa_costo character varying NOT NULL UNIQUE; estado boolean NOT NULL DEFAULT true; created_at timestamp with time zone NOT NULL DEFAULT now(); updated_at timestamp with time zone NOT NULL DEFAULT now()], clave primaria [cod_etapa], relaciones salientes [ninguna]. Habilita RLS. Define estas políticas en modo y alcance equivalentes: [admin_crear_etapas_costo; INSERT; roles authenticated; USING —; WITH CHECK private.is_admin() || admin_eliminar_etapas_costo; DELETE; roles authenticated; USING private.is_admin(); WITH CHECK — || admin_modificar_etapas_costo; UPDATE; roles authenticated; USING private.is_admin(); WITH CHECK private.is_admin() || usuarios_activos_ver_etapas_costo; SELECT; roles authenticated; USING (private.get_my_permission() IS NOT NULL); WITH CHECK —]. Triggers requeridos [ninguno identificado]. Antes de generar SQL, resuelve dependencias de funciones y tablas referenciadas, verifica que helpers como private.is_admin() y private.get_my_permission() existan y tengan implementación equivalente, identifica índices/grants/privilegios de secuencias y localiza migraciones fuente. No inventes comportamiento que no esté definido. Entrega una migración idempotente o repetible según convención del proyecto destino, explica diferencias de motor/versión/case-sensitivity y lista pruebas de estructura y autorización. No la apliques ni despliegues sin aprobación explícita.>

#### Reconstruir tabla TipoCambio

> En el proyecto/base de datos destino, reconstruye la tabla `public.TipoCambio` según esta especificación: columnas [id_tipo_cambio bigint NOT NULL IDENTITY; anho integer NOT NULL CHECK(anho >= 2000 AND anho <= 2100); mes integer NOT NULL CHECK(mes >= 1 AND mes <= 12); tipo_cambio numeric NOT NULL CHECK(tipo_cambio > 0::numeric); created_at timestamp with time zone NOT NULL DEFAULT now(); updated_at timestamp with time zone NOT NULL DEFAULT now()], clave primaria [id_tipo_cambio], relaciones salientes [ninguna]. Habilita RLS. Define estas políticas en modo y alcance equivalentes: [admin_actualizar_tipo_cambio; UPDATE; roles authenticated; USING private.is_admin(); WITH CHECK private.is_admin() || admin_eliminar_tipo_cambio; DELETE; roles authenticated; USING private.is_admin(); WITH CHECK — || admin_insertar_tipo_cambio; INSERT; roles authenticated; USING —; WITH CHECK private.is_admin() || usuarios_activos_ver_tipo_cambio; SELECT; roles authenticated; USING (private.get_my_permission() IS NOT NULL); WITH CHECK —]. Triggers requeridos [trg_actualizar_fecha_tipo_cambio: CREATE TRIGGER trg_actualizar_fecha_tipo_cambio BEFORE UPDATE ON public."TipoCambio" FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha_tipo_cambio() || trg_impedir_cambio_periodo_tipo_cambio: CREATE TRIGGER trg_impedir_cambio_periodo_tipo_cambio BEFORE UPDATE OF anho, mes ON public."TipoCambio" FOR EACH ROW EXECUTE FUNCTION impedir_cambio_periodo_tipo_cambio() || trg_validar_correlatividad_tipo_cambio: CREATE TRIGGER trg_validar_correlatividad_tipo_cambio BEFORE INSERT ON public."TipoCambio" FOR EACH ROW EXECUTE FUNCTION fn_validar_correlatividad_tipo_cambio()]. Antes de generar SQL, resuelve dependencias de funciones y tablas referenciadas, verifica que helpers como private.is_admin() y private.get_my_permission() existan y tengan implementación equivalente, identifica índices/grants/privilegios de secuencias y localiza migraciones fuente. No inventes comportamiento que no esté definido. Entrega una migración idempotente o repetible según convención del proyecto destino, explica diferencias de motor/versión/case-sensitivity y lista pruebas de estructura y autorización. No la apliques ni despliegues sin aprobación explícita.>
