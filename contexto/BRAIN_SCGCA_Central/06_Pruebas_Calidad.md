# Pruebas y calidad — SCGCA Central

**Actualizado:** 2026-11-05

## 08. Pruebas y calidad

### Evidencia reciente

- **2026-11-05, Distribución:** `npm run build` aprobó con Vite 8.2.2 y 11,802 módulos transformados después de los ajustes de matriz mensual, columnas fijas, compactación, rango máximo de 3 meses y mínimo `2017-01`. No se ejecutaron pruebas unitarias ni lint. El navegador no se verificó manualmente; la herramienta CUA no inició.
- **2026-11-05, Centro de Costos y alineación:** `npm run build` aprobó con Vite 8.2.2 (11,802 módulos) después de precisar el embed de empresa con `fk_centro_costo_empresa`. `git diff --check` y la comparación de las 49 versiones locales/remotas pasaron; los siete SQL de Distribución coinciden con el historial de Supabase. Sin prueba manual de navegador ni despliegue a hosting.
- **2026-11-05, Supabase/Distribución:** migración `20261105205941_porcentaje_hec_excluye_porcentaje_cero` aplicada y registrada en Supabase. `pg_get_functiondef` confirmó la condición de exclusión de PORCENTAJE 0. Consulta SQL de ejemplo produjo 0.0000 para la fila excluida y 25.0000 % para cuatro centros elegibles. No se ejecutó el flujo RPC con sesión de usuario real ni se probaron borradores, cierres o reaperturas.
- **2026-11-05, Advisor de seguridad:** se observaron avisos para cuatro RPC `SECURITY DEFINER` ejecutables por `authenticated` y para protección de contraseñas filtradas desactivada. Los RPC de Distribución revisados validan `auth.uid()`, acceso al módulo y acceso a empresa; el advisory no se modificó en este cambio. Revisar con el registro A-07 y la decisión de protección de contraseñas.
- **2026-11-05, historial de migraciones:** Supabase lista 49 migraciones; local hay 48 archivos. La nueva versión `20261105205941` sí coincide en local/remoto. Persiste el archivo local faltante `20261104220325` y cuatro discrepancias de prefijo; GitHub no se cotejó.

- **2026-11-04, Distribución/Supabase:** verificados metadatos y políticas RLS en las tres tablas. 1,923 filas / 468 grupos; cero grupos con sumas distintas de 1.0000 para PORCENTAJE y Porcentaje_Hec. previsualizar_distribucion_mes probada por SQL con contexto ADMIN para empresa 1, 2026-01-31; devolvió filas tras corregir varchar/text. **No ejecutado:** interfaz en navegador, guardado, cierre, reapertura, sesión real por rol ni build/pruebas frontend posteriores. Supabase tiene 48 migraciones, local 47; GitHub no verificado.

- **2026-11-04, modularización y code splitting local:** `npm run build` aprobó con Vite 8.2.2 y 11,798 módulos transformados. Chunk de entrada: 353.86 KB minificado (108.65 KB gzip); `excelService`: 331.07 KB (107.71 KB gzip), diferido; Supabase: 332.09 KB (90.88 KB gzip), separado. No se emitió aviso por chunks superiores a 500 KB. `git diff --check` no reportó errores, solo advertencias LF/CRLF. No se ejecutaron pruebas unitarias, lint ni medición de carga desde navegador. Cambios locales sin commit.
- **2026-11-03, temas y sincronización (`09de31a`):** `npm test` aprobó 65/65; `npm run lint` terminó con código 0 y advertencias no bloqueantes (incluidos `no-unused-vars`, `no-extra-boolean-cast` y `set-state-in-effect`); `npm run build` aprobó con Vite 8.2.2 y 11,774 módulos transformados. El bundle principal midió 736.44 KB minificado y 230.36 KB con gzip; Vite emite una advertencia por superar 500 KB, umbral informativo que no es un límite obligatorio. Supabase Central confirmó 42/42 migraciones locales/remotas idénticas y Edge Functions `crear-usuario` v9 / `actualizar-usuario` v3. No hubo cambios de esquema o funciones para la preferencia de tema.
- **2026-11-02, exportaciones Excel y corrección CI (`c03dd32`):** se añadieron exports para maestros en `main`. La primera ejecución (`0cfa0c0`) falló en pruebas porque `supabase/functions/consultar-tipo-cambio-bcrp/authorization.test.js` importaba `authorization.js`, módulo de una Edge Function retirada intencionalmente. Se eliminó la prueba huérfana en `c03dd32`; GitHub Actions terminó en **success**: pruebas unitarias, lint y compilación aprobados ([ejecución 41539595160](https://github.com/EkimEspinoza/scgca-frontend/actions/runs/41539595160)). El build local aprobó y mostró una advertencia no bloqueante: bundle principal mayor a 500 KB minificado. No se encontró workflow de despliegue frontend; el push no verifica publicación en hosting.
- **2026-11-02, sincronización:** `supabase migration list --linked` confirmó 42 versiones locales y remotas coincidentes. `supabase functions list` confirmó `crear-usuario` v9 y `actualizar-usuario` v3, sin `consultar-tipo-cambio-bcrp`.
- **2026-11-02, frontend previo a integración:** `npm run build` aprobó con Vite 8.2.2 (11,773 módulos transformados). `npm run lint` terminó con código 0 y advertencias existentes de variables/imports no usados y `set-state-in-effect`; no se ejecutó `npm test` localmente. El resultado de CI del commit posterior se registra arriba.
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
