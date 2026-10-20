# Reconciliación de Edge Functions de usuarios

Fecha de revisión: 2026-10-20
Proyecto Supabase: `ajzmheqoanihdujmgbhv`
Repositorio: `EkimEspinoza/scgca-frontend`, rama `main`

## Resultado de comparación

| Función | Versión activa observada | Código en main | Resultado |
|---|---:|---|---|
| `crear-usuario` | 8 | Usa `isActiveAdmin()` de `supabase/functions/_shared/usuarioAuthorization.js` | La autorización desplegada está inline y es semánticamente equivalente a la regla compartida revisada. El flujo desplegado coincide en los pasos principales de validación, invitación, actualización del perfil SCGCA, asignaciones y compensación. |
| `actualizar-usuario` | 2 | Usa `isActiveAdmin()` y llama `actualizar_usuario_con_empresas` | La autorización desplegada está inline y es semánticamente equivalente. La validación de entradas y llamada a la RPC atómica coinciden en su comportamiento esencial. |

## Controles observados

- Ambas funciones usan `withSupabase({ auth: "user" })` y derivan el actor de `ctx.userClaims?.id`.
- Ambas verifican que el actor tenga usuario SCGCA activo y permiso ADMIN activo antes de usar operaciones privilegiadas.
- `crear-usuario` valida el permiso de destino y las empresas activas antes de invitar; si ocurre un fallo después de crear Auth, intenta compensar eliminando asignaciones, usuario SCGCA y usuario Auth.
- `actualizar-usuario` valida el cuerpo y los IDs antes de llamar `actualizar_usuario_con_empresas`, pasando `p_actor_auth_user_id` para validar al actor en el lado SQL.
- `verify_jwt=false` está configurado en las versiones activas. No debe evaluarse aisladamente como vulnerabilidad porque la autenticación se aplica en el handler; conservar esa configuración requiere que las pruebas negativas verifiquen el comportamiento.

## Riesgos y límites

1. La compensación en `crear-usuario` no es una transacción distribuida. Si fallan tanto el flujo principal como una operación de compensación, puede quedar un registro huérfano. Los errores de compensación deben quedar visibles en logs y existir un procedimiento de reconciliación.
2. Los tests del repositorio son mayormente pruebas estáticas de orden y presencia de validaciones; no demuestran por sí solos el comportamiento HTTP real ni los casos de concurrencia.
3. No se realizó prueba destructiva contra producción ni se crearon usuarios de prueba en producción.
4. No se desplegó una nueva versión en esta revisión. Las versiones activas no son idénticas byte por byte a `main` debido a que la regla de autorización está inline en producción y centralizada en el repositorio.

## Criterios para cerrar completamente

- [ ] Ejecutar CI de `main` después de cualquier cambio.
- [ ] Ejecutar pruebas de integración en un proyecto Supabase de pruebas: sin JWT, JWT inválido, usuario inexistente, usuario inactivo, rol no ADMIN, permiso ADMIN inactivo, JSON malformado, permiso destino inactivo, empresa inexistente/inactiva, y éxito.
- [ ] Probar fallos parciales en `crear-usuario` y verificar que no queden asignaciones o registros huérfanos; documentar recuperación manual si la compensación falla.
- [ ] Verificar en logs el comportamiento de errores sin exponer secretos ni datos personales innecesarios.
- [ ] Desplegar el artefacto exacto de `main` a producción solo tras aprobar las pruebas, y volver a consultar la versión activa y su configuración.

## Decisión de esta revisión

No se identifica evidencia suficiente para calificar las diferencias de autorización inline vs helper como una vulnerabilidad. El riesgo principal que permanece es la falta de equivalencia exacta del artefacto y de pruebas de integración reales, además de la compensación no atómica del flujo de creación.
