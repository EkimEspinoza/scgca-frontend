import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { isActiveAdmin } from "../_shared/usuarioAuthorization.js";

type ActualizarUsuarioRequest = {
  id_usuario: number;
  nombre: string;
  apellido?: string;
  id_permiso: number;
  estado: "PENDIENTE" | "ACTIVO" | "INACTIVO";
  empresas: number[];
};

export default {
  fetch: withSupabase(
    { auth: "user" },
    async (req, ctx) => {
      try {
        if (req.method !== "POST") {
          return Response.json({ error: "Método no permitido." }, { status: 405 });
        }

        const authUserId = ctx.userClaims?.id;
        if (!authUserId) {
          return Response.json({ error: "No autenticado." }, { status: 401 });
        }

        // Verificación de autorización en el servidor, antes de usar service_role.
        const { data: usuarioActual, error: errorUsuario } = await ctx.supabase
          .from("usuarios")
          .select(`
            id_usuario,
            estado,
            permiso:permiso(id_permiso, nombre, estado)
          `)
          .eq("auth_user_id", authUserId)
          .maybeSingle();

        if (errorUsuario) {
          console.error("Error verificando administrador:", errorUsuario);
          return Response.json({ error: "No se pudo verificar el usuario actual." }, { status: 500 });
        }

        if (!isActiveAdmin(usuarioActual)) {
          return Response.json({ error: "Solo un administrador activo puede actualizar usuarios." }, { status: 403 });
        }

        let payload: unknown;
        try {
          payload = await req.json();
        } catch {
          return Response.json({ error: "El cuerpo de la solicitud no es válido." }, { status: 400 });
        }

        // Rechazar null, primitivos y arreglos antes de leer propiedades del cuerpo.
        if (
          payload === null ||
          typeof payload !== "object" ||
          Array.isArray(payload)
        ) {
          return Response.json(
            { error: "El cuerpo de la solicitud debe ser un objeto JSON." },
            { status: 400 },
          );
        }

        const body = payload as Partial<ActualizarUsuarioRequest> & Record<string, unknown>;

        // No convertir campos mal formados en []: el arreglo vacío solo es válido
        // cuando se envía explícitamente y la regla de negocio lo permite (p. ej., ADMIN).
        if (!Object.prototype.hasOwnProperty.call(body, "empresas") || !Array.isArray(body.empresas)) {
          return Response.json(
            { error: "El campo empresas es obligatorio y debe ser un arreglo de identificadores." },
            { status: 400 },
          );
        }

        const idUsuario = Number(body.id_usuario);
        const idPermiso = Number(body.id_permiso);
        const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
        const apellido = typeof body.apellido === "string" ? body.apellido.trim() : "";
        const estado = body.estado;
        const empresas = body.empresas;

        if (!Number.isSafeInteger(idUsuario) || idUsuario <= 0) {
          return Response.json({ error: "El usuario seleccionado no es válido." }, { status: 400 });
        }
        if (!Number.isSafeInteger(idPermiso) || idPermiso <= 0) {
          return Response.json({ error: "Debes seleccionar un permiso válido." }, { status: 400 });
        }
        if (!nombre) {
          return Response.json({ error: "El nombre es obligatorio." }, { status: 400 });
        }
        if (!["PENDIENTE", "ACTIVO", "INACTIVO"].includes(estado as string)) {
          return Response.json({ error: "El estado del usuario no es válido." }, { status: 400 });
        }
        if (
          empresas.some(
            (id) => typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0,
          )
        ) {
          return Response.json(
            { error: "La lista contiene un identificador de empresa inválido." },
            { status: 400 },
          );
        }

        // La función SQL mantiene la validación de datos y toda la operación atómica.
        // Solo service_role podrá ejecutarla después de aplicar la migración S-01.
        const { data, error } = await ctx.supabaseAdmin.rpc(
          "actualizar_usuario_con_empresas",
          {
            p_id_usuario: idUsuario,
            p_nombre: nombre,
            p_apellido: apellido,
            p_id_permiso: idPermiso,
            p_estado: estado,
            p_empresas: empresas,
            p_actor_auth_user_id: authUserId,
          },
        );

        if (error) {
          console.error("Error actualizando usuario y empresas:", error);
          const status = error.code === "42501" ? 403 : 400;
          return Response.json({ error: error.message || "No se pudo actualizar el usuario y sus empresas." }, { status });
        }

        return Response.json(data ?? { success: true });
      } catch (error) {
        console.error("Error inesperado en actualizar-usuario:", error);
        return Response.json({ error: "Ocurrió un error inesperado al actualizar el usuario." }, { status: 500 });
      }
    },
  ),
};
