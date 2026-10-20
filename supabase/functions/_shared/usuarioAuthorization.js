/**
 * Reglas puras de autorización compartidas por las Edge Functions de usuarios.
 * No autentica la solicitud: el actor debe proceder de ctx.userClaims verificado.
 */
export function isActiveAdmin(usuario) {
  if (!usuario || usuario.estado !== "ACTIVO") return false;

  const permiso = Array.isArray(usuario.permiso)
    ? usuario.permiso[0]
    : usuario.permiso;

  return permiso?.nombre === "ADMIN" && permiso?.estado === true;
}
