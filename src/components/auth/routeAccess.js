// Evalúa permisos de rol y nivel de acceso a módulos.
export function tieneAccesoARuta(perfil, requiredPermissions = [], moduleCode, requiredLevel = 'QUERY') {
  const permiso = perfil?.permiso?.nombre
  const tienePermisoPorRol = requiredPermissions.length === 0 || requiredPermissions.includes(permiso)

  if (!moduleCode) return tienePermisoPorRol

  const accesoModulo = perfil?.modulos?.find((modulo) => modulo.codigo === moduleCode)
  const nivelModulo = accesoModulo?.nivel
  const tienePermisoPorModulo = accesoModulo && (
    permiso === 'ADMIN' || nivelModulo === 'WRITER' ||
    (requiredLevel === 'QUERY' && nivelModulo === 'QUERY')
  )

  return tienePermisoPorRol && tienePermisoPorModulo
}
