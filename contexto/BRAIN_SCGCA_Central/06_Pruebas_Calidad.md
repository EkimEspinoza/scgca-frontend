# Pruebas y calidad — SCGCA Central

**Actualizado:** 2026-11-02

## 08. Pruebas y calidad

### Evidencia reciente

- **2026-11-02, RLS de roles/catálogos:** la migración `20261102202432_restrict_permission_catalog_reads_to_active_users` se aplicó a Supabase Central. Consulta posterior de `pg_policies` confirmó que usuarios activos leen permisos activos, ADMIN puede leer todos; `usuarios`, `usuario_empresa`, `usuario_modulo` y `modulos` mantienen acceso propio/activo y administración ADMIN según corresponda. **Verificación SQL de metadatos aprobada; no se simuló sesión real por rol.**
- **2026-11-02, rutas de Maestros:** `npm run build` aprobó con Vite 8.2.2 y 11,773 módulos transformados después de alinear las nueve rutas a ADMIN y módulo activo. `git diff --check` no reportó errores; mostró avisos LF/CRLF en archivos preexistentes. No se ejecutaron pruebas unitarias ni prueba manual de navegación/autorización.
- **2026-11-02, módulos/permisos:** `npm run build` incluyó `/modulos` y `/permisos`; confirma compilación local, no sus flujos funcionales.

- **2026-10-31, piloto de permisos Empresas:** el usuario reportó que las pruebas de QUERY/WRITER/ADMIN funcionaron correctamente en su interfaz local. **APROBADO (reportado por usuario; no reproducido de forma independiente por el asistente).** La distribución de cuentas observada en la base no coincide con la asignación de prueba inicialmente planeada; revisar antes de repetir casos por cuenta.
- **2026-10-31, RBAC:** se consultaron en Supabase las asignaciones y políticas, se confirmó el CHECK `nivel IN ('QUERY','WRITER')` y las políticas `empresas_query_ver_asignadas`, `empresas_writer_crear` y `empresas_writer_actualizar_asignadas`; DELETE sigue bajo política ADMIN. Verificación SQL de estructura/políticas aprobada.
- **2026-10-31, frontend:** `npm run build` aprobado después del cambio READER → WRITER. `git diff --check` sin errores de whitespace; mostró solo avisos de conversión LF/CRLF en archivos previamente modificados.

- **2026-10-28, commit `4db46a2`:** `npm run build` aprobado con Vite 8.2.2; 11,769 módulos transformados. `git diff --check` aprobado. No se ejecutaron `npm test`, lint ni pruebas manuales de UI en esta jornada.

- **2026-10-27, commit b1f2a5d:** `git diff --check` pasó antes del commit. No se ejecutaron npm test, lint ni build; tampoco se hizo una revisión visual de los seis módulos en navegador ni una escritura de prueba en Supabase.
- PR #61: GitHub Actions de calidad en success.
- npm test: 69 pruebas aprobadas.
- npm run lint: terminó sin errores; dejó advertencias de imports y variables sin uso en src/pages/maestros/TipoCambio.jsx.
- npm run build: compilación de producción correcta.
- No se ejecutaron pruebas manuales recientes de login/autorización con cuentas reales de cada rol.
- No se ejecutó una prueba HTTP real por rol para BCRP ni para las funciones administrativas de usuarios.
- La protección de funciones se revisó estáticamente y mediante metadatos; no se probó escritura en producción.

Registrar pruebas con fecha, entorno, caso, evidencia y resultado. Distinguir pruebas ejecutadas de las reportadas por el usuario; no declarar aprobada una prueba no observada.

## Plantilla de evidencia de pruebas

- ID/cambio:
- Fecha:
- Entorno y versión/commit:
- Área o módulo:
- Caso y resultado esperado:
- Resultado observado:
- Evidencia (log, captura o enlace):
- Estado: APROBADO / FALLIDO / BLOQUEADO / NO EJECUTADO:
- Defectos o seguimiento:
