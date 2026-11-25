// Encapsula las operaciones de datos de centroCostoUtils.
export function convertirEstado(estado) {
  if (estado === null || estado === undefined) return null
  if (typeof estado === 'boolean') return estado
  if (estado === 'true' || estado === true) return true
  if (estado === 'false' || estado === false) return false
  return Boolean(estado)
}
