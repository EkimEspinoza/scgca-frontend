import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const crear = readFileSync(new URL('./crear-usuario/index.ts', import.meta.url), 'utf8')
const actualizar = readFileSync(new URL('./actualizar-usuario/index.ts', import.meta.url), 'utf8')

function indexOfOrFail(source, fragment, message) {
  const index = source.indexOf(fragment)
  assert.notEqual(index, -1, message)
  return index
}

test('crear-usuario restringe el método a POST antes de operaciones privilegiadas', () => {
  const methodGuard = indexOfOrFail(crear, 'if (req.method !== "POST")', 'Debe rechazar métodos distintos de POST')
  const privilegedInvite = indexOfOrFail(crear, 'inviteUserByEmail', 'Debe localizar la operación privilegiada de invitación')
  assert.ok(methodGuard < privilegedInvite)
})

test('crear-usuario exige identidad autenticada y devuelve 401 si falta', () => {
  const identity = indexOfOrFail(crear, 'const authUserId = ctx.userClaims?.id', 'Debe derivar identidad del contexto autenticado')
  const unauthenticated = indexOfOrFail(crear, '{ status: 401 }', 'Debe devolver 401 si no hay autenticación')
  const privilegedInvite = indexOfOrFail(crear, 'inviteUserByEmail', 'Debe localizar la operación privilegiada')
  assert.ok(identity < unauthenticated)
  assert.ok(unauthenticated < privilegedInvite)
})

test('crear-usuario requiere administrador y usuario actual activo antes de invitar', () => {
  const guard = indexOfOrFail(crear, 'usuarioActual.estado !== "ACTIVO"', 'Debe validar el estado del actor')
  const adminRole = indexOfOrFail(crear, 'permisoActual?.nombre !== "ADMIN"', 'Debe validar el rol ADMIN del actor')
  const activePermission = indexOfOrFail(crear, 'permisoActual?.estado !== true', 'Debe validar que el permiso del actor esté activo')
  const invite = indexOfOrFail(crear, 'inviteUserByEmail', 'Debe localizar la invitación')
  assert.ok(guard < invite)
  assert.ok(adminRole < invite)
  assert.ok(activePermission < invite)
})

test('crear-usuario valida el cuerpo JSON y campos obligatorios antes de invitar', () => {
  const body = indexOfOrFail(crear, 'const parsedBody: unknown = await req.json()', 'Debe analizar el cuerpo como unknown')
  const objectGuard = indexOfOrFail(crear, 'Array.isArray(parsedBody)', 'Debe rechazar arreglos como cuerpo')
  const emailGuard = indexOfOrFail(crear, 'if (!email)', 'Debe validar el email')
  const nameGuard = indexOfOrFail(crear, 'if (!nombre)', 'Debe validar el nombre')
  const permissionGuard = indexOfOrFail(crear, '!Number.isInteger(idPermiso)', 'Debe validar el ID de permiso')
  const invite = indexOfOrFail(crear, 'inviteUserByEmail', 'Debe localizar la invitación')
  assert.ok(body < objectGuard && objectGuard < invite)
  assert.ok(emailGuard < invite && nameGuard < invite && permissionGuard < invite)
})

test('crear-usuario valida que el permiso destino exista y esté activo', () => {
  const lookup = indexOfOrFail(crear, '.from("permiso")', 'Debe consultar el permiso en la base de datos')
  const exists = indexOfOrFail(crear, 'if (!permisoNuevo)', 'Debe rechazar permisos inexistentes')
  const active = indexOfOrFail(crear, 'if (!permisoNuevo.estado)', 'Debe rechazar permisos inactivos')
  const invite = indexOfOrFail(crear, 'inviteUserByEmail', 'Debe localizar la invitación')
  assert.ok(lookup < exists && exists < active && active < invite)
})

test('crear-usuario valida empresas activas y exige empresa para no administradores', () => {
  const adminRule = indexOfOrFail(crear, 'const esNuevoAdmin', 'Debe distinguir el permiso ADMIN destino')
  const required = indexOfOrFail(crear, 'empresasFinales.length === 0', 'Debe exigir empresas a usuarios no ADMIN')
  const companyLookup = indexOfOrFail(crear, '.from("Dim_Empresa")', 'Debe consultar las empresas')
  const activeCheck = indexOfOrFail(crear, 'empresa.estado === true', 'Debe comprobar que las empresas estén activas')
  const invite = indexOfOrFail(crear, 'inviteUserByEmail', 'Debe localizar la invitación')
  assert.ok(adminRule < invite && required < invite && companyLookup < invite && activeCheck < invite)
})

test('actualizar-usuario exige POST, identidad autenticada y actor ADMIN activo antes del RPC', () => {
  const method = indexOfOrFail(actualizar, 'if (req.method !== "POST")', 'Debe rechazar métodos distintos de POST')
  const identity = indexOfOrFail(actualizar, 'const authUserId = ctx.userClaims?.id', 'Debe derivar identidad autenticada')
  const role = indexOfOrFail(actualizar, 'permisoActual?.nombre !== "ADMIN"', 'Debe exigir rol ADMIN')
  const active = indexOfOrFail(actualizar, 'usuarioActual.estado !== "ACTIVO"', 'Debe exigir actor activo')
  const permissionActive = indexOfOrFail(actualizar, 'permisoActual?.estado !== true', 'Debe exigir permiso activo')
  const rpc = indexOfOrFail(actualizar, '"actualizar_usuario_con_empresas"', 'Debe ejecutar la operación atómica mediante RPC')
  assert.ok(method < rpc && identity < rpc && role < rpc && active < rpc && permissionActive < rpc)
})

test('actualizar-usuario rechaza cuerpo inválido y empresas ausentes o no-array antes del RPC', () => {
  const parse = indexOfOrFail(actualizar, 'payload = await req.json()', 'Debe analizar el cuerpo')
  const objectGuard = indexOfOrFail(actualizar, 'Array.isArray(payload)', 'Debe rechazar arreglos como cuerpo')
  const companiesGuard = indexOfOrFail(actualizar, 'hasOwnProperty.call(body, "empresas")', 'Debe exigir el campo empresas explícitamente')
  const rpc = indexOfOrFail(actualizar, '"actualizar_usuario_con_empresas"', 'Debe localizar el RPC')
  assert.ok(parse < objectGuard && objectGuard < companiesGuard && companiesGuard < rpc)
})

test('actualizar-usuario valida IDs, nombre y estado antes del RPC', () => {
  const idUser = indexOfOrFail(actualizar, 'if (!Number.isSafeInteger(idUsuario) || idUsuario <= 0)', 'Debe validar ID de usuario')
  const idRole = indexOfOrFail(actualizar, 'if (!Number.isSafeInteger(idPermiso) || idPermiso <= 0)', 'Debe validar ID de permiso')
  const name = indexOfOrFail(actualizar, 'if (!nombre)', 'Debe validar nombre')
  const state = indexOfOrFail(actualizar, 'includes(estado as string)', 'Debe limitar estados permitidos')
  const companies = indexOfOrFail(actualizar, 'empresas.some(', 'Debe validar cada ID de empresa')
  const rpc = indexOfOrFail(actualizar, '"actualizar_usuario_con_empresas"', 'Debe localizar el RPC')
  assert.ok(idUser < rpc && idRole < rpc && name < rpc && state < rpc && companies < rpc)
})

test('actualizar-usuario pasa el actor autenticado a la función SQL para validación del lado servidor', () => {
  const actor = indexOfOrFail(actualizar, 'p_actor_auth_user_id: authUserId', 'Debe pasar la identidad autenticada al RPC')
  const rpc = indexOfOrFail(actualizar, '"actualizar_usuario_con_empresas"', 'Debe localizar el RPC')
  assert.ok(actor > rpc)
})
