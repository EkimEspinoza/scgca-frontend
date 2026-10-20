import test from "node:test";
import assert from "node:assert/strict";
import { isActiveAdmin } from "./usuarioAuthorization.js";

test("autoriza únicamente a un usuario ACTIVO con permiso ADMIN activo", () => {
  assert.equal(
    isActiveAdmin({ estado: "ACTIVO", permiso: { nombre: "ADMIN", estado: true } }),
    true,
  );
});

test("rechaza usuario ausente, inactivo o sin permiso", () => {
  assert.equal(isActiveAdmin(null), false);
  assert.equal(isActiveAdmin(undefined), false);
  assert.equal(
    isActiveAdmin({ estado: "INACTIVO", permiso: { nombre: "ADMIN", estado: true } }),
    false,
  );
  assert.equal(
    isActiveAdmin({ estado: "PENDIENTE", permiso: { nombre: "ADMIN", estado: true } }),
    false,
  );
  assert.equal(isActiveAdmin({ estado: "ACTIVO", permiso: null }), false);
});

test("rechaza roles distintos de ADMIN y permisos desactivados", () => {
  assert.equal(
    isActiveAdmin({ estado: "ACTIVO", permiso: { nombre: "CONSULTA", estado: true } }),
    false,
  );
  assert.equal(
    isActiveAdmin({ estado: "ACTIVO", permiso: { nombre: "ADMIN", estado: false } }),
    false,
  );
});

test("acepta la relación permiso en forma de arreglo y rechaza arreglo vacío", () => {
  assert.equal(
    isActiveAdmin({ estado: "ACTIVO", permiso: [{ nombre: "ADMIN", estado: true }] }),
    true,
  );
  assert.equal(isActiveAdmin({ estado: "ACTIVO", permiso: [] }), false);
});

test("rechaza permiso mal formado sin lanzar excepción", () => {
  assert.equal(isActiveAdmin({ estado: "ACTIVO", permiso: "ADMIN" }), false);
  assert.equal(isActiveAdmin({ estado: "ACTIVO", permiso: [{ nombre: "ADMIN", estado: false }] }), false);
});
