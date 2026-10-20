/**
 * Limpia un usuario parcialmente creado sin dejar deliberadamente
 * una fila SCGCA conocida sin su identidad Auth.
 *
 * Si no puede confirmar que public.usuarios está ausente, conserva Auth
 * para permitir diagnóstico y recuperación manual.
 */
export async function rollbackCrearUsuario(supabaseAdmin, authUserId, logger = console) {
  if (!authUserId) return { authDeleted: false, reason: "no-auth-user" };

  let idUsuario = null;
  let scgcaConfirmedAbsent = false;

  try {
    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .select("id_usuario")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (error) {
      logger.error("Rollback: no se pudo buscar el usuario SCGCA; se conserva Auth:", error);
      return { authDeleted: false, reason: "lookup-failed" };
    }

    if (data) idUsuario = data.id_usuario;
    else scgcaConfirmedAbsent = true;
  } catch (error) {
    logger.error("Rollback: excepción buscando usuario SCGCA; se conserva Auth:", error);
    return { authDeleted: false, reason: "lookup-threw" };
  }

  if (idUsuario !== null) {
    try {
      const { error } = await supabaseAdmin
        .from("usuarios")
        .delete()
        .eq("id_usuario", idUsuario);

      if (error) {
        logger.error("Rollback: falló la eliminación del usuario SCGCA; se conserva Auth:", error);
        return { authDeleted: false, reason: "delete-scgca-failed" };
      }

      const { data: remaining, error: verifyError } = await supabaseAdmin
        .from("usuarios")
        .select("id_usuario")
        .eq("id_usuario", idUsuario)
        .maybeSingle();

      if (verifyError) {
        logger.error("Rollback: no se pudo confirmar la eliminación SCGCA; se conserva Auth:", verifyError);
        return { authDeleted: false, reason: "verify-scgca-failed" };
      }
      if (remaining) {
        logger.error("Rollback: el registro SCGCA sigue existiendo; se conserva Auth.");
        return { authDeleted: false, reason: "scgca-still-exists" };
      }

      scgcaConfirmedAbsent = true;
    } catch (error) {
      logger.error("Rollback: excepción eliminando/verificando SCGCA; se conserva Auth:", error);
      return { authDeleted: false, reason: "delete-or-verify-threw" };
    }
  }

  if (!scgcaConfirmedAbsent) {
    logger.error("Rollback incompleto: no se elimina Auth sin confirmar la ausencia de SCGCA.");
    return { authDeleted: false, reason: "scgca-not-confirmed-absent" };
  }

  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(authUserId);
    if (error) {
      logger.error("Rollback: falló la eliminación de Auth; requiere revisión:", error);
      return { authDeleted: false, reason: "delete-auth-failed" };
    }
    return { authDeleted: true, reason: "cleanup-complete" };
  } catch (error) {
    logger.error("Rollback: excepción eliminando Auth; requiere revisión:", error);
    return { authDeleted: false, reason: "delete-auth-threw" };
  }
}
