import test from "node:test";
import assert from "node:assert/strict";

import {
  TIPOS_CC_PERMITIDOS,
  esTipoCentroCostoPermitido,
  validarFormularioCampana,
  construirDatosCampana,
  traducirErrorCampana,
  obtenerMensajeErrorCampana,
} from "./campanaRules.js";

const formularioValido = {
  id_campana_emp: "101",
  id_empresa: "2",
  cod_cc_pk: "14001",
  fecha_inicio: "2026-01-01",
  fecha_fin: "2026-12-31",
  fecha_inicio_ctb: "2026-01-01",
  fecha_fin_ctb: "2026-12-31",
  hectareas: "12.5",
  estado: true,
  cierre_camp: false,
};

test("la lista de tipos permitidos no está vacía", () => {
  assert.ok(TIPOS_CC_PERMITIDOS.length > 0);
});

test("acepta tipo de centro de costo permitido ignorando mayúsculas y espacios", () => {
  assert.equal(esTipoCentroCostoPermitido("  levante y mantenimiento "), true);
});

test("rechaza tipo de centro de costo vacío o no permitido", () => {
  assert.equal(esTipoCentroCostoPermitido(""), false);
  assert.equal(esTipoCentroCostoPermitido(null), false);
  assert.equal(esTipoCentroCostoPermitido("TIPO INVENTADO"), false);
});

test("acepta formulario de campaña válido", () => {
  assert.equal(validarFormularioCampana(formularioValido), "");
});

test("requiere ID de campaña, empresa y centro de costo", () => {
  for (const [campo, esperado] of [
    ["id_campana_emp", "El ID de campaña de la empresa es obligatorio."],
    ["id_empresa", "Debe seleccionar una empresa."],
    ["cod_cc_pk", "Debe seleccionar un Centro de Costo."],
  ]) {
    assert.equal(validarFormularioCampana({ ...formularioValido, [campo]: "" }), esperado);
  }
});

test("requiere fechas operativas y contables", () => {
  for (const campo of ["fecha_inicio", "fecha_fin", "fecha_inicio_ctb", "fecha_fin_ctb"]) {
    assert.notEqual(validarFormularioCampana({ ...formularioValido, [campo]: "" }), "");
  }
});

test("rechaza fecha de inicio anterior al 01/01/2015", () => {
  assert.equal(
    validarFormularioCampana({ ...formularioValido, fecha_inicio: "2014-12-31" }),
    "La fecha de inicio no puede ser anterior al 01/01/2015.",
  );
});

test("rechaza fecha fin anterior al inicio", () => {
  assert.equal(
    validarFormularioCampana({ ...formularioValido, fecha_fin: "2025-12-31" }),
    "La fecha de fin no puede ser anterior a la fecha de inicio.",
  );
});

test("rechaza período contable invertido", () => {
  assert.equal(
    validarFormularioCampana({
      ...formularioValido,
      fecha_inicio_ctb: "2026-08-01",
      fecha_fin_ctb: "2026-07-31",
    }),
    "La fecha de fin CTB no puede ser anterior a la fecha de inicio CTB.",
  );
});

test("rechaza hectáreas ausentes, cero, negativas o no numéricas", () => {
  for (const hectareas of ["", null, undefined, "0", 0, "-1", "abc", Infinity]) {
    assert.notEqual(validarFormularioCampana({ ...formularioValido, hectareas }), "");
  }
});

test("acepta hectáreas estrictamente positivas", () => {
  for (const hectareas of ["0.01", 1, "12.5"]) {
    assert.equal(validarFormularioCampana({ ...formularioValido, hectareas }), "");
  }
});

test("construye payload con IDs y hectáreas numéricas", () => {
  const datos = construirDatosCampana(formularioValido);
  assert.equal(datos.id_campana_emp, 101);
  assert.equal(datos.id_empresa, 2);
  assert.equal(datos.cod_cc_pk, 14001);
  assert.equal(datos.hectareas, 12.5);
  assert.equal(datos.estado, true);
  assert.equal(datos.cierre_camp, false);
});

test("traduce el error de centro de costo inactivo", () => {
  assert.equal(
    traducirErrorCampana("No se puede crear una campaña para un Centro de Costo inactivo"),
    "No se puede crear una campaña porque el Centro de Costo está inactivo.",
  );
});

test("traduce error de clave duplicada y conserva errores de negocio conocidos", () => {
  assert.equal(
    traducirErrorCampana("duplicate key value violates unique constraint"),
    "El ID de campaña de la empresa ya existe para esta empresa.",
  );
  const mensaje = "La campaña se superpone con otra campaña";
  assert.equal(traducirErrorCampana(mensaje), mensaje);
});

test("obtiene el mensaje de error desde message o error_description", () => {
  assert.equal(obtenerMensajeErrorCampana({ message: "duplicate key" }), "El ID de campaña de la empresa ya existe para esta empresa.");
  assert.equal(obtenerMensajeErrorCampana({ error_description: "Fallo externo" }), "Fallo externo");
  assert.equal(obtenerMensajeErrorCampana({}), "Ocurrió un error inesperado.");
});
