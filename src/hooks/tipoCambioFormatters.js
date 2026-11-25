// Gestiona estado y acciones de tipoCambioFormatters.
export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const formularioTipoCambioInicial = { tipo_cambio: '', estado: true }

export const formatearPeriodo = (anho, mes) => {
  if (!anho || !mes || Number(mes) < 1 || Number(mes) > 12) return 'Período no disponible'
  return `${MESES[Number(mes) - 1]} ${anho}`
}

export const formatearTipoCambio = (valor) => {
  if (valor === null || valor === undefined || valor === '') return '—'
  return Number(valor).toLocaleString('es-PE', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
}

export const formatearFecha = (fecha) => {
  if (!fecha) return '—'
  const valor = new Date(fecha)
  if (Number.isNaN(valor.getTime())) return '—'
  return valor.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
}
