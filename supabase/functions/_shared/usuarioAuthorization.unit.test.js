import test from "node:test";
import assert from "node:assert/strict";
import { isActiveAdmin } from "./usuarioAuthorization.js";

test("autoriza a un ADMIN activo con permiso activo", () => {
  assert.equal(isActiveAdmin({
    estado: "ACTIVO",
    permiso: { nombre: "ADMIN", estado: true },
  }), true);
});

test("acepta la relación de permiso cuando llega como arreglo", () => {
  assert.equal(isActiveAdmin({
    estado: "ACTIVO",
    permiso: [{ nombre: "ADMIN", estado: true }],
  }), true);
});

test("rechaza un usuario inactivo aunque tenga permiso ADMIN activo", () => {
  assert.equal(isActiveAdmin({
    estado: "INACTIVO",
    permiso: { nombre: "ADMIN", estado: true },
  }), false);
});

test("rechaza permisos distintos de ADMIN", () => {
  assert.equal(isActiveAdmin({
    estado: "ACTIVO",
    permiso: { nombre: "CONSULTA", estado: true },
  }), false);
});

test("rechaza un permiso ADMIN inactivo", () => {
  assert.equal(isActiveAdmin({
    estado: "ACTIVO",
    permiso: { nombre: "ADMIN", estado: false },
  }), false);
});

test("rechaza usuario inexistente o sin permiso", () => {
  assert.equal(isActiveAdmin(null), false);
  assert.equal(isActiveAdmin(undefined), false);
  assert.equal(isActiveAdmin({ estado: "ACTIVO", permiso: null }), false);
  assert.equal(isActiveAdmin({ estado: "ACTIVO", permiso: [] }), false);
});

test("no trata como ADMIN un nombre parecido ni estado truthy", () => {
  assert.equal(isActiveAdmin({
    estado: "ACTIVO",
    permiso: { nombre: "ADMINISTRADOR", estado: true },
  }), false);
  assert.equal(isActiveAdmin({
    estado: "ACTIVO",
    permiso: { nombre: "ADMIN", estado: 1 },
  }), false);
});
