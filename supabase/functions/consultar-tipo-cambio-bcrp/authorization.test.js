import test from "node:test";
import assert from "node:assert/strict";
import { isActiveAdminProfile } from "./authorization.js";

test("allows only active users with an active ADMIN permission", () => {
  assert.equal(
    isActiveAdminProfile({
      estado: "ACTIVO",
      permiso: { nombre: "ADMIN", estado: true },
    }),
    true,
  );
});

test("rejects inactive users and non-admin roles", () => {
  assert.equal(
    isActiveAdminProfile({
      estado: "INACTIVO",
      permiso: { nombre: "ADMIN", estado: true },
    }),
    false,
  );
  assert.equal(
    isActiveAdminProfile({
      estado: "ACTIVO",
      permiso: { nombre: "CONSULTA", estado: true },
    }),
    false,
  );
});

test("rejects ADMIN permission when its estado is false or missing", () => {
  assert.equal(
    isActiveAdminProfile({
      estado: "ACTIVO",
      permiso: { nombre: "ADMIN", estado: false },
    }),
    false,
  );
  assert.equal(
    isActiveAdminProfile({
      estado: "ACTIVO",
      permiso: { nombre: "ADMIN" },
    }),
    false,
  );
});

test("supports object and array relationships and rejects empty/malformed values", () => {
  assert.equal(
    isActiveAdminProfile({
      estado: "ACTIVO",
      permiso: [{ nombre: "ADMIN", estado: true }],
    }),
    true,
  );
  assert.equal(
    isActiveAdminProfile({ estado: "ACTIVO", permiso: [] }),
    false,
  );
  assert.equal(
    isActiveAdminProfile({ estado: "ACTIVO", permiso: "ADMIN" }),
    false,
  );
  assert.equal(isActiveAdminProfile(null), false);
});
