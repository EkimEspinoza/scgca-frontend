import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { isActiveAdmin } from "../_shared/usuarioAuthorization.js";

type RegistroTareo = {
  nro_parte: string;
  cod_cc: number;
  cod_cc_maq: number;
  hora: number;
  fecha_tareo: string;
  etapa_tareo: string | null;
  id_empresa: number;
  cod_cc_pk: number;
  cod_cc_pk_maq: number;
  observacion: string | null;
  estado: 0 | 1;
};

function validarRegistro(value: unknown): value is RegistroTareo {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  const fecha = typeof row.fecha_tareo === "string" ? new Date(`${row.fecha_tareo}T00:00:00Z`) : null;
  const fechaValida = Boolean(fecha && !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === row.fecha_tareo);
  return typeof row.nro_parte === "string" && row.nro_parte.trim().length > 0 &&
    row.nro_parte.length <= 120 &&
    ["cod_cc", "cod_cc_maq", "id_empresa", "cod_cc_pk", "cod_cc_pk_maq"].every((key) => Number.isSafeInteger(row[key]) && Number(row[key]) > 0) &&
    typeof row.hora === "number" && Number.isFinite(row.hora) && row.hora >= 0 &&
    Math.abs(Number(row.hora) * 100 - Math.round(Number(row.hora) * 100)) <= 1e-8 && fechaValida &&
    (row.etapa_tareo == null || (typeof row.etapa_tareo === "string" && row.etapa_tareo.length <= 50)) &&
    (row.observacion == null || (typeof row.observacion === "string" && row.observacion.length <= 20)) &&
    (row.estado === 0 || row.estado === 1);
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") return Response.json({ error: "Método no permitido." }, { status: 405 });
    const authUserId = ctx.userClaims?.id;
    if (!authUserId) return Response.json({ error: "No autenticado." }, { status: 401 });
    if (Number(req.headers.get("content-length") || 0) > 1_200_000) {
      return Response.json({ error: "El lote excede el tamaño permitido. Reduce la cantidad de filas por envío." }, { status: 413 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "El cuerpo de la solicitud no es JSON válido." }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json({ error: "El cuerpo debe contener una empresa y un lote de registros." }, { status: 400 });
    }

    const request = body as { id_empresa?: unknown; registros?: unknown; finalizar?: unknown };
    const idEmpresa = Number(request.id_empresa);
    const registros = request.registros;
    if (!Number.isSafeInteger(idEmpresa) || idEmpresa <= 0) {
      return Response.json({ error: "La empresa seleccionada no es válida." }, { status: 400 });
    }
    if (!Array.isArray(registros) || registros.length === 0 || registros.length > 500 || !registros.every(validarRegistro)) {
      return Response.json({ error: "El lote debe contener entre 1 y 500 registros válidos." }, { status: 400 });
    }
    if (typeof request.finalizar !== "boolean") {
      return Response.json({ error: "El indicador de cierre del archivo no es válido." }, { status: 400 });
    }
    if (registros.some((row) => row.id_empresa !== idEmpresa)) {
      return Response.json({ error: "Todos los registros deben corresponder a la empresa seleccionada." }, { status: 400 });
    }

    const admin = ctx.supabaseAdmin;
    const { data: usuario, error: errorUsuario } = await admin
      .from("usuarios")
      .select("id_usuario, estado, permiso:permiso(nombre, estado)")
      .eq("auth_user_id", authUserId)
      .maybeSingle();
    if (errorUsuario) {
      console.error("Error verificando usuario para importar Tareo:", errorUsuario);
      return Response.json({ error: "No se pudo verificar el usuario." }, { status: 500 });
    }
    if (!usuario || usuario.estado !== "ACTIVO") {
      return Response.json({ error: "El usuario no está activo." }, { status: 403 });
    }

    if (!isActiveAdmin(usuario)) return Response.json({ error: "Solo ADMIN puede importar datos de Tareo." }, { status: 403 });

    const { data, error } = await admin.rpc("importar_mov_tareo_seguro", { p_registros: registros, p_finalizar: request.finalizar });
    if (error) {
      console.error("Error importando registros de Tareo:", error);
      return Response.json({ error: error.message || "No se pudo importar el lote." }, { status: 400 });
    }
    return Response.json(data ?? { recibidos: registros.length, cargados: 0, en_proceso: 0, procesados: 0, pendientes: 0, ya_existentes: 0 });
  }),
};
