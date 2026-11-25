// Define el componente reutilizable motivoValidacion.
const mensajesValidacion = { SIN_CAMPANA_EN_FECHA: 'No existe una campaña activa para la fecha' }

export const motivoValidacion = (error, fila) => {
  const codigo = typeof error === 'string' ? error : error?.codigo ?? error?.code ?? error?.message ?? String(error)
  if (codigo === 'CENTRO_COSTO_NO_EXISTE') return 'Centro de costo no existe · Cod_CC: ' + (fila?.cod_cc ?? '—')
  return mensajesValidacion[codigo] ?? codigo.replaceAll('_', ' ').toLocaleLowerCase('es-PE')
}
