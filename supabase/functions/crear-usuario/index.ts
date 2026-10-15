import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

type CrearUsuarioRequest = {
  email: string;
  nombre: string;
  apellido?: string;
  id_permiso: number;
  empresas?: number[];
};

export default {
  fetch: withSupabase(
    { auth: "user" },
    async (req, ctx) => {
      let authUserIdCreado: string | null = null;

      try {
        // ============================================================
        // VALIDAR MÉTODO
        // ============================================================

        if (req.method !== "POST") {
          return Response.json(
            {
              error: "Método no permitido.",
            },
            { status: 405 },
          );
        }

        // ============================================================
        // IDENTIFICAR USUARIO ACTUAL
        // ============================================================

        const authUserId = ctx.userClaims?.id;

        if (!authUserId) {
          return Response.json(
            {
              error: "No autenticado.",
            },
            { status: 401 },
          );
        }

        // ============================================================
        // VERIFICAR USUARIO ACTUAL Y PERMISO ADMIN
        // ============================================================

        const {
          data: usuarioActual,
          error: errorUsuario,
        } = await ctx.supabase
          .from("usuarios")
          .select(`
            id_usuario,
            estado,
            permiso:permiso(
              id_permiso,
              nombre,
              estado
            )
          `)
          .eq("auth_user_id", authUserId)
          .single();

        if (errorUsuario) {
          console.error(
            "Error verificando usuario actual:",
            errorUsuario,
          );

          return Response.json(
            {
              error:
                "No se pudo verificar el usuario actual.",
            },
            { status: 500 },
          );
        }

        if (!usuarioActual) {
          return Response.json(
            {
              error:
                "Usuario no registrado en SCGCA.",
            },
            { status: 403 },
          );
        }

        const permisoActual =
          Array.isArray(usuarioActual.permiso)
            ? usuarioActual.permiso[0]
            : usuarioActual.permiso;

        if (
          usuarioActual.estado !== "ACTIVO" ||
          permisoActual?.nombre !== "ADMIN" ||
          permisoActual?.estado !== true
        ) {
          return Response.json(
            {
              error:
                "No tienes permisos para crear usuarios.",
            },
            { status: 403 },
          );
        }

        // ============================================================
        // LEER BODY
        // ============================================================

        let body: CrearUsuarioRequest;

        try {
          const parsedBody: unknown = await req.json();

          if (
            parsedBody === null ||
            typeof parsedBody !== "object" ||
            Array.isArray(parsedBody)
          ) {
            return Response.json(
              {
                error:
                  "El cuerpo de la solicitud debe ser un objeto JSON.",
              },
              { status: 400 },
            );
          }

          body = parsedBody as CrearUsuarioRequest;
        } catch {
          return Response.json(
            {
              error:
                "El cuerpo de la solicitud no es un JSON válido.",
            },
            { status: 400 },
          );
        }

        // ============================================================
        // NORMALIZAR DATOS
        // ============================================================

        if (
          typeof body.email !== "string" ||
          typeof body.nombre !== "string" ||
          (body.apellido !== undefined &&
            typeof body.apellido !== "string")
        ) {
          return Response.json(
            {
              error:
                "Email, nombre y apellido deben tener formato de texto válido.",
            },
            { status: 400 },
          );
        }

        const email = body.email.trim().toLowerCase();
        const nombre = body.nombre.trim();
        const apellido = body.apellido?.trim() || "";
        const idPermiso = Number(body.id_permiso);

        // Si se envía la lista, se valida completa: no se descartan
        // silenciosamente identificadores inválidos.
        if (
          body.empresas !== undefined &&
          (!Array.isArray(body.empresas) ||
            body.empresas.some(
              (id) =>
                typeof id !== "number" ||
                !Number.isInteger(id) ||
                id <= 0,
            ))
        ) {
          return Response.json(
            {
              error:
                "La lista de empresas contiene identificadores inválidos. Envía únicamente IDs enteros positivos.",
            },
            { status: 400 },
          );
        }

        const empresas = [
          ...new Set(body.empresas ?? []),
        ];

        // ============================================================
        // VALIDAR EMAIL
        // ============================================================

        if (!email) {
          return Response.json(
            {
              error:
                "El email es obligatorio.",
            },
            { status: 400 },
          );
        }

        const emailValido =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email,
          );

        if (!emailValido) {
          return Response.json(
            {
              error:
                "El email no tiene un formato válido.",
            },
            { status: 400 },
          );
        }

        // ============================================================
        // VALIDAR NOMBRE
        // ============================================================

        if (!nombre) {
          return Response.json(
            {
              error:
                "El nombre es obligatorio.",
            },
            { status: 400 },
          );
        }

        // ============================================================
        // VALIDAR PERMISO
        // ============================================================

        if (
          !Number.isInteger(idPermiso) ||
          idPermiso <= 0
        ) {
          return Response.json(
            {
              error:
                "Debes seleccionar un permiso válido.",
            },
            { status: 400 },
          );
        }

        const {
          data: permisoNuevo,
          error: errorPermiso,
        } = await ctx.supabaseAdmin
          .from("permiso")
          .select(
            `
              id_permiso,
              nombre,
              estado
            `,
          )
          .eq("id_permiso", idPermiso)
          .single();

        if (errorPermiso) {
          console.error(
            "Error validando permiso:",
            errorPermiso,
          );

          return Response.json(
            {
              error:
                "No se pudo validar el permiso seleccionado.",
            },
            { status: 500 },
          );
        }

        if (!permisoNuevo) {
          return Response.json(
            {
              error:
                "El permiso seleccionado no existe.",
            },
            { status: 400 },
          );
        }

        if (!permisoNuevo.estado) {
          return Response.json(
            {
              error:
                "El permiso seleccionado está inactivo.",
            },
            { status: 400 },
          );
        }

        // ============================================================
        // VALIDAR EMPRESAS
        // ============================================================

        // Los ADMIN no necesitan empresas asignadas.
        const esNuevoAdmin =
          permisoNuevo.nombre === "ADMIN";

        const empresasFinales =
          esNuevoAdmin
            ? []
            : empresas;

        if (
          !esNuevoAdmin &&
          empresasFinales.length === 0
        ) {
          return Response.json(
            {
              error:
                "Debes asignar al menos una empresa al usuario.",
            },
            { status: 400 },
          );
        }

        if (
          empresasFinales.length > 0
        ) {
          const {
            data: empresasValidas,
            error: errorEmpresas,
          } = await ctx.supabaseAdmin
            .from("Dim_Empresa")
            .select(
              `
                id_empresa,
                estado
              `,
            )
            .in(
              "id_empresa",
              empresasFinales,
            );

          if (errorEmpresas) {
            console.error(
              "Error validando empresas:",
              errorEmpresas,
            );

            return Response.json(
              {
                error:
                  "No se pudieron validar las empresas seleccionadas.",
              },
              { status: 500 },
            );
          }

          const empresasActivas =
            (empresasValidas ?? [])
              .filter(
                (empresa) =>
                  empresa.estado === true,
              )
              .map(
                (empresa) =>
                  Number(
                    empresa.id_empresa,
                  ),
              );

          const empresasInvalidas =
            empresasFinales.filter(
              (idEmpresa) =>
                !empresasActivas.includes(
                  Number(idEmpresa),
                ),
            );

          if (
            empresasInvalidas.length > 0
          ) {
            return Response.json(
              {
                error:
                  "Una o más empresas seleccionadas no existen o están inactivas.",
              },
              { status: 400 },
            );
          }
        }

        // ============================================================
        // CREAR USUARIO EN SUPABASE AUTH
        // ============================================================

        const {
          data: invitacion,
          error: errorInvitacion,
        } =
          await ctx.supabaseAdmin.auth.admin
            .inviteUserByEmail(
              email,
              {
                data: {
                  nombre,
                  apellido,
                },
              },
            );

        if (errorInvitacion) {
          console.error(
            "Error invitando usuario:",
            errorInvitacion,
          );

          return Response.json(
            {
              error:
                errorInvitacion.message ||
                "No se pudo crear la invitación.",
            },
            { status: 400 },
          );
        }

        authUserIdCreado =
          invitacion.user?.id ?? null;

        if (!authUserIdCreado) {
          throw new Error(
            "Supabase no devolvió el ID del usuario creado.",
          );
        }

        // ============================================================
        // ESPERAR / OBTENER REGISTRO PUBLIC.USUARIOS
        // ============================================================
        //
        // El trigger handle_new_user() crea este registro
        // automáticamente cuando se crea auth.users.
        //
        // ============================================================

        const {
          data: usuarioNuevo,
          error: errorUsuarioNuevo,
        } =
          await ctx.supabaseAdmin
            .from("usuarios")
            .select(
              `
                id_usuario,
                auth_user_id,
                estado,
                id_permiso
              `,
            )
            .eq(
              "auth_user_id",
              authUserIdCreado,
            )
            .maybeSingle();

        if (errorUsuarioNuevo) {
          console.error(
            "Error buscando usuario creado:",
            errorUsuarioNuevo,
          );

          throw new Error(
            "El usuario fue creado en Auth, pero no se pudo encontrar su registro en SCGCA.",
          );
        }

        if (!usuarioNuevo) {
          throw new Error(
            "El usuario fue creado en Auth, pero el registro en SCGCA no fue creado.",
          );
        }

        // ============================================================
        // ACTUALIZAR PUBLIC.USUARIOS
        // ============================================================

        const {
          data: usuarioActualizado,
          error: errorActualizacion,
        } =
          await ctx.supabaseAdmin
            .from("usuarios")
            .update({
              nombre,
              apellido,
              id_permiso: idPermiso,
              estado: "PENDIENTE",
              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id_usuario",
              usuarioNuevo.id_usuario,
            )
            .select(
              `
                id_usuario,
                auth_user_id,
                nombre,
                apellido,
                id_permiso,
                estado
              `,
            )
            .single();

        if (errorActualizacion) {
          console.error(
            "Error actualizando usuario SCGCA:",
            errorActualizacion,
          );

          throw new Error(
            "El usuario fue creado, pero no se pudo completar su configuración en SCGCA.",
          );
        }

        // ============================================================
        // ASIGNAR EMPRESAS
        // ============================================================

        if (
          empresasFinales.length > 0
        ) {
          const asignaciones =
            empresasFinales.map(
              (idEmpresa) => ({
                id_usuario:
                  usuarioNuevo.id_usuario,
                id_empresa:
                  Number(idEmpresa),
                estado: true,
              }),
            );

          const {
            error: errorAsignaciones,
          } =
            await ctx.supabaseAdmin
              .from("usuario_empresa")
              .insert(asignaciones);

          if (errorAsignaciones) {
            console.error(
              "Error asignando empresas:",
              errorAsignaciones,
            );

            throw new Error(
              "El usuario fue creado, pero no se pudieron asignar las empresas.",
            );
          }
        }

        // ============================================================
        // RESPUESTA EXITOSA
        // ============================================================

        return Response.json(
          {
            success: true,
            message:
              "Usuario invitado y configurado correctamente.",
            user: {
              id:
                invitacion.user?.id ??
                authUserIdCreado,
              email:
                invitacion.user?.email ??
                email,
            },
            usuario: {
              id_usuario:
                usuarioActualizado.id_usuario,
              id_permiso:
                usuarioActualizado.id_permiso,
              estado:
                usuarioActualizado.estado,
            },
            empresas:
              empresasFinales,
          },
          { status: 201 },
        );
      } catch (error) {
        console.error(
          "Error inesperado creando usuario:",
          error,
        );

        // ============================================================
        // ROLLBACK
        // ============================================================
        //
        // Si Auth llegó a crear el usuario pero posteriormente
        // falló la configuración de SCGCA, intentamos eliminar
        // lo creado para no dejar información inconsistente.
        //
        // ============================================================

        if (authUserIdCreado) {
          // Cada operación verifica el error devuelto por Supabase.
          // Un fallo en una etapa no impide intentar las siguientes.
          let idUsuarioRollback: number | null = null;

          try {
            const {
              data: usuarioRollback,
              error: errorBusquedaRollback,
            } = await ctx.supabaseAdmin
              .from("usuarios")
              .select("id_usuario")
              .eq("auth_user_id", authUserIdCreado)
              .maybeSingle();

            if (errorBusquedaRollback) {
              console.error(
                "Rollback: no se pudo buscar el usuario SCGCA:",
                errorBusquedaRollback,
              );
            } else {
              idUsuarioRollback =
                usuarioRollback?.id_usuario ?? null;
            }
          } catch (rollbackError) {
            console.error(
              "Rollback: excepción buscando usuario SCGCA:",
              rollbackError,
            );
          }

          if (idUsuarioRollback !== null) {
            try {
              const { error: errorEliminarAsignaciones } =
                await ctx.supabaseAdmin
                  .from("usuario_empresa")
                  .delete()
                  .eq("id_usuario", idUsuarioRollback);

              if (errorEliminarAsignaciones) {
                console.error(
                  "Rollback: falló la eliminación de asignaciones:",
                  errorEliminarAsignaciones,
                );
              }
            } catch (rollbackError) {
              console.error(
                "Rollback: excepción eliminando asignaciones:",
                rollbackError,
              );
            }

            try {
              const { error: errorEliminarUsuario } =
                await ctx.supabaseAdmin
                  .from("usuarios")
                  .delete()
                  .eq("id_usuario", idUsuarioRollback);

              if (errorEliminarUsuario) {
                console.error(
                  "Rollback: falló la eliminación del usuario SCGCA:",
                  errorEliminarUsuario,
                );
              }
            } catch (rollbackError) {
              console.error(
                "Rollback: excepción eliminando usuario SCGCA:",
                rollbackError,
              );
            }
          } else {
            console.error(
              "Rollback: no se encontró el ID del usuario SCGCA; se continuará intentando eliminar el usuario de Auth.",
            );
          }

          try {
            const { error: errorEliminarAuth } =
              await ctx.supabaseAdmin.auth.admin.deleteUser(
                authUserIdCreado,
              );

            if (errorEliminarAuth) {
              console.error(
                "Rollback: falló la eliminación del usuario de Auth:",
                errorEliminarAuth,
              );
            }
          } catch (rollbackError) {
            console.error(
              "Rollback: excepción eliminando usuario de Auth:",
              rollbackError,
            );
          }
        }

        return Response.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Ocurrió un error inesperado.",
          },
          { status: 500 },
        );
      }
    },
  ),
};