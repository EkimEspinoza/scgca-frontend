import test from 'node:test'
import assert from 'node:assert/strict'

import { createLatestRequestGuard } from './latestRequestGuard.js'

test('solo la solicitud más reciente puede aplicar su resultado', () => {
  const guard = createLatestRequestGuard()
  const primera = guard.next()
  const segunda = guard.next()

  assert.equal(guard.isCurrent(primera), false)
  assert.equal(guard.isCurrent(segunda), true)
})

test('invalidar bloquea respuestas pendientes tras logout', () => {
  const guard = createLatestRequestGuard()
  const solicitudPendiente = guard.next()

  guard.invalidate()

  assert.equal(guard.isCurrent(solicitudPendiente), false)
})

test('un cambio de usuario invalida la solicitud del usuario anterior', () => {
  const guard = createLatestRequestGuard()
  const solicitudUsuarioA = guard.next()
  const solicitudUsuarioB = guard.next()

  assert.equal(guard.isCurrent(solicitudUsuarioA), false)
  assert.equal(guard.isCurrent(solicitudUsuarioB), true)
})

test('una solicitud invalidada no vuelve a ser vigente', () => {
  const guard = createLatestRequestGuard()
  const solicitud = guard.next()

  guard.invalidate()
  const solicitudNueva = guard.next()

  assert.equal(guard.isCurrent(solicitud), false)
  assert.equal(guard.isCurrent(solicitudNueva), true)
})
