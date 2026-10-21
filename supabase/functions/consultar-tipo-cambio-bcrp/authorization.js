/**
 * Autoriza la consulta BCRP solo para un perfil SCGCA activo
 * con permiso ADMIN también activo.
 */
export function isActiveAdminProfile(perfil) {
  if (!perfil || String(perfil.estado).toUpperCase() !== "ACTIVO") {
    return false;
  }

  const permiso = Array.isArray(perfil.permiso)
    ? perfil.permiso[0]
    : perfil.permiso;

  return (
    String(permiso?.nombre ?? "").toUpperCase() === "ADMIN" &&
    permiso?.estado === true
  );
}
