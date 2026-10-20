import test from 'node:test'
import assert from 'node:assert/strict'

import { esPermisoAdministrador, validarFormularioUsuario } from './usuarioRules.js'

const usuarioValido = {
  email: 'persona@empresa.com',
  nombre: 'Ana',
  apellido: 'Pérez',
  id_permiso: '2',
  estado: 'PENDIENTE',
  empresas: [1],
}

test('acepta un usuario válido con permiso y empresa asignada', () => {
  assert.deepEqual(validarFormularioUsuario(usuarioValido), {})
})

test('exige correo al crear un usuario', () => {
  assert.equal(validarFormularioUsuario({ ...usuarioValido, email: ' ' }).email, 'Ingresa el correo electrónico.')
})

test('rechaza correo con formato inválido al crear', () => {
  for (const email of ['sin-arroba', 'persona@', '@empresa.com', 'persona @empresa.com']) {
    assert.equal(validarFormularioUsuario({ ...usuarioValido, email }).email, 'Ingresa un correo electrónico válido.')
  }
})

test('ignora el correo al editar porque el formulario no permite modificarlo', () => {
  assert.deepEqual(validarFormularioUsuario({ ...usuarioValido, email: '' }, { esEdicion: true }), {})
})

test('exige nombre y rechaza nombre compuesto solo por espacios', () => {
  assert.equal(validarFormularioUsuario({ ...usuarioValido, nombre: '  ' }).nombre, 'Ingresa el nombre.')
})

test('exige seleccionar un permiso', () => {
  assert.equal(validarFormularioUsuario({ ...usuarioValido, id_permiso: '' }).id_permiso, 'Selecciona un permiso.')
  assert.equal(validarFormularioUsuario({ ...usuarioValido, id_permiso: null }).id_permiso, 'Selecciona un permiso.')
})

test('exige al menos una empresa para usuarios no administradores', () => {
  assert.equal(validarFormularioUsuario({ ...usuarioValido, empresas: [] }).empresas, 'Selecciona al menos una empresa.')
  assert.equal(validarFormularioUsuario({ ...usuarioValido, empresas: null }).empresas, 'Selecciona al menos una empresa.')
})

test('permite administrador sin asignación individual de empresas', () => {
  assert.deepEqual(validarFormularioUsuario({ ...usuarioValido, empresas: [] }, { esAdmin: true }), {})
})

test('permiso administrador solo corresponde al nombre exacto ADMIN', () => {
  assert.equal(esPermisoAdministrador('ADMIN'), true)
  assert.equal(esPermisoAdministrador('CONSULTA'), false)
  assert.equal(esPermisoAdministrador('admin'), false)
  assert.equal(esPermisoAdministrador(undefined), false)
})

test('acumula varios errores sin ocultar validaciones', () => {
  assert.deepEqual(validarFormularioUsuario({ email: '', nombre: '', id_permiso: '', empresas: [] }), {
    email: 'Ingresa el correo electrónico.',
    nombre: 'Ingresa el nombre.',
    id_permiso: 'Selecciona un permiso.',
    empresas: 'Selecciona al menos una empresa.',
  })
})
