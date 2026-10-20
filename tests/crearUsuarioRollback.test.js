import test from "node:test";
import assert from "node:assert/strict";
import { rollbackCrearUsuario } from "../supabase/functions/_shared/crearUsuarioRollback.js";

function makeAdmin({ lookupError, deleteError, verifyError, remaining, authDeleteError } = {}) {
  const calls = [];
  let selectCount = 0;
  const admin = {
    from(table) {
      assert.equal(table, "usuarios");
      return {
        select() {
          selectCount++;
          const isVerification = selectCount > 1;
          const query = {
            eq(column, value) { calls.push(["eq", column, value]); return query; },
            maybeSingle: async () => {
              calls.push(["select", isVerification ? "verify" : "lookup"]);
              if (!isVerification && lookupError) return { data: null, error: lookupError };
              if (isVerification && verifyError) return { data: null, error: verifyError };
              if (!isVerification) return { data: { id_usuario: 27 }, error: null };
              return { data: remaining ? { id_usuario: 27 } : null, error: null };
            },
          };
          return query;
        },
        delete() {
          const query = {
            eq(column, value) { calls.push(["delete-eq", column, value]); return query; },
            then(resolve) {
              calls.push(["delete"]);
              resolve({ error: deleteError ?? null });
            },
          };
          return query;
        },
      };
    },
    auth: { admin: { deleteUser: async (id) => {
      calls.push(["delete-auth", id]);
      return { error: authDeleteError ?? null };
    } } },
  };
  return { admin, calls };
}

const logger = { error() {} };

test("si falla la búsqueda SCGCA, conserva Auth", async () => {
  const { admin, calls } = makeAdmin({ lookupError: new Error("lookup") });
  const result = await rollbackCrearUsuario(admin, "auth-1", logger);
  assert.equal(result.authDeleted, false);
  assert.equal(result.reason, "lookup-failed");
  assert.equal(calls.some(([name]) => name === "delete-auth"), false);
});

test("si falla la eliminación SCGCA, conserva Auth", async () => {
  const { admin, calls } = makeAdmin({ deleteError: new Error("delete") });
  const result = await rollbackCrearUsuario(admin, "auth-1", logger);
  assert.equal(result.authDeleted, false);
  assert.equal(result.reason, "delete-scgca-failed");
  assert.equal(calls.some(([name]) => name === "delete-auth"), false);
});

test("si falla la verificación SCGCA, conserva Auth", async () => {
  const { admin, calls } = makeAdmin({ verifyError: new Error("verify") });
  const result = await rollbackCrearUsuario(admin, "auth-1", logger);
  assert.equal(result.authDeleted, false);
  assert.equal(result.reason, "verify-scgca-failed");
  assert.equal(calls.some(([name]) => name === "delete-auth"), false);
});

test("si el registro SCGCA sigue existiendo, conserva Auth", async () => {
  const { admin, calls } = makeAdmin({ remaining: true });
  const result = await rollbackCrearUsuario(admin, "auth-1", logger);
  assert.equal(result.authDeleted, false);
  assert.equal(result.reason, "scgca-still-exists");
  assert.equal(calls.some(([name]) => name === "delete-auth"), false);
});

test("si la limpieza SCGCA se confirma, elimina Auth al final", async () => {
  const { admin, calls } = makeAdmin();
  const result = await rollbackCrearUsuario(admin, "auth-1", logger);
  assert.equal(result.authDeleted, true);
  assert.equal(result.reason, "cleanup-complete");
  assert.deepEqual(calls.filter(([name]) => name === "delete-auth"), [["delete-auth", "auth-1"]]);
  const scgcaVerificationIndex = calls.findIndex(([name, kind]) => name === "select" && kind === "verify");
  const authDeletionIndex = calls.findIndex(([name]) => name === "delete-auth");
  assert.ok(scgcaVerificationIndex >= 0);
  assert.ok(authDeletionIndex > scgcaVerificationIndex);
});

test("si SCGCA confirma que la fila no existe, intenta eliminar Auth", async () => {
  const calls = [];
  const admin = {
    from() {
      const query = {
        select() { return query; },
        eq() { return query; },
        maybeSingle: async () => ({ data: null, error: null }),
      };
      return query;
    },
    auth: { admin: { deleteUser: async (id) => { calls.push(id); return { error: null }; } } },
  };
  const result = await rollbackCrearUsuario(admin, "auth-2", logger);
  assert.equal(result.authDeleted, true);
  assert.deepEqual(calls, ["auth-2"]);
});

test("si falla la eliminación de Auth después de limpiar SCGCA, informa revisión manual", async () => {
  const { admin } = makeAdmin({ authDeleteError: new Error("auth delete") });
  const result = await rollbackCrearUsuario(admin, "auth-3", logger);
  assert.equal(result.authDeleted, false);
  assert.equal(result.reason, "delete-auth-failed");
});

test("si no hay identificador Auth, no ejecuta operaciones", async () => {
  const { admin, calls } = makeAdmin();
  const result = await rollbackCrearUsuario(admin, null, logger);
  assert.equal(result.authDeleted, false);
  assert.equal(result.reason, "no-auth-user");
  assert.deepEqual(calls, []);
});
