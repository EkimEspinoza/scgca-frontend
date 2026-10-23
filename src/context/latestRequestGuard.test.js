import test from 'node:test'
import assert from 'node:assert/strict'

import { createLatestRequestGuard } from './latestRequestGuard.js'

function deferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

test('solo la solicitud más reciente puede aplicar su resultado', () => {
  const guard = createLatestRequestGuard()
  const primera = guard.next()
  const segunda = guard.next()

  assert.equal(guard.isCurrent(primera), false)
  assert.equal(guard.isCurrent(segunda), true)
})

test('una respuesta antigua que llega al final no sobrescribe el perfil nuevo', async () => {
  const guard = createLatestRequestGuard()
  const older = deferred()
  const newer = deferred()
  let profile = null

  const olderVersion = guard.next()
  const olderTask = older.promise.then((result) => {
    if (guard.isCurrent(olderVersion)) profile = result
  })

  const newerVersion = guard.next()
  const newerTask = newer.promise.then((result) => {
    if (guard.isCurrent(newerVersion)) profile = result
  })

  newer.resolve({ auth_user_id: 'user-B', nombre: 'Perfil B' })
  await newerTask
  older.resolve({ auth_user_id: 'user-A', nombre: 'Perfil A' })
  await olderTask

  assert.equal(profile.auth_user_id, 'user-B')
  assert.equal(profile.nombre, 'Perfil B')
})

test('una respuesta pendiente no restaura el perfil después de logout', async () => {
  const guard = createLatestRequestGuard()
  const pending = deferred()
  let profile = { auth_user_id: 'user-A', nombre: 'Perfil A' }

  const requestVersion = guard.next()
  const task = pending.promise.then((result) => {
    if (guard.isCurrent(requestVersion)) profile = result
  })

  // Representa la invalidación inmediata realizada al cerrar sesión.
  guard.invalidate()
  profile = null
  pending.resolve({ auth_user_id: 'user-A', nombre: 'Perfil A tardío' })
  await task

  assert.equal(profile, null)
})

test('el cambio de usuario descarta una respuesta del usuario anterior', async () => {
  const guard = createLatestRequestGuard()
  const userAResponse = deferred()
  let profile = null

  const userAVersion = guard.next()
  const taskA = userAResponse.promise.then((result) => {
    if (guard.isCurrent(userAVersion)) profile = result
  })

  const userBVersion = guard.next()
  if (guard.isCurrent(userBVersion)) profile = { auth_user_id: 'user-B' }

  userAResponse.resolve({ auth_user_id: 'user-A' })
  await taskA

  assert.equal(profile.auth_user_id, 'user-B')
})

test('invalidar bloquea solicitudes pendientes y la siguiente solicitud sigue vigente', () => {
  const guard = createLatestRequestGuard()
  const pendingVersion = guard.next()

  guard.invalidate()
  assert.equal(guard.isCurrent(pendingVersion), false)

  const nextVersion = guard.next()
  assert.equal(guard.isCurrent(nextVersion), true)
})

test('una solicitud inválida no vuelve a ser vigente tras nuevas solicitudes', () => {
  const guard = createLatestRequestGuard()
  const version = guard.next()

  guard.invalidate()
  guard.next()

  assert.equal(guard.isCurrent(version), false)
})
