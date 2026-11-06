const PRECISION = 4
const ESCALA_PORCENTAJE = 10 ** PRECISION

function claveCentroCosto(fila) {
  return String(fila.cod_cc_pk ?? fila.cod_cc_pk_dist ?? '')
}

/** Devuelve la fecha calendario final del mes como YYYY-MM-DD. */
export function fechaFinDeMes(anio, mes) {
  const year = Number(anio)
  const month = Number(mes)
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error('Selecciona un año y un mes válidos.')
  }
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10)
}

/**
 * Distribuye Porcentaje_Hec por hectáreas entre filas cuyo Porcentaje no sea cero.
 * Los valores se manejan como fracciones: 0.2300 equivale a 23.00 %.
 * El residuo se asigna por mayor parte decimal y, en empate, por Cod_CC_PK ascendente.
 */
export function calcularPorcentajesHectareas(filas) {
  if (!Array.isArray(filas) || filas.length === 0) return []

  const escaladas = filas.map((fila) => {
    const hectareas = Number(fila.num_hec ?? fila.hectareas)
    if (!Number.isFinite(hectareas) || hectareas < 0) {
      throw new Error(`Las hectáreas de ${claveCentroCosto(fila) || 'un centro de costo'} no son válidas.`)
    }
    return {
      fila,
      hectareasUnidades: Math.round(hectareas * ESCALA_PORCENTAJE),
      clave: claveCentroCosto(fila),
      elegible: fila.porcentaje === null || fila.porcentaje === undefined || fila.porcentaje === ''
        ? true
        : Number.isFinite(Number(fila.porcentaje)) && Number(fila.porcentaje) !== 0,
    }
  })

  const elegibles = escaladas.filter((item) => item.elegible)
  if (elegibles.length === 0) {
    return escaladas.map(({ fila }) => ({ ...fila, porcentaje_hec: 0 }))
  }

  const totalHectareas = elegibles.reduce((total, item) => total + item.hectareasUnidades, 0)
  if (totalHectareas <= 0) {
    throw new Error('No se pueden calcular porcentajes sin hectáreas mayores que cero.')
  }

  const asignaciones = elegibles.map((item, indice) => {
    const numerador = item.hectareasUnidades * ESCALA_PORCENTAJE
    return {
      ...item,
      indice,
      unidades: Math.floor(numerador / totalHectareas),
      residuo: numerador % totalHectareas,
    }
  })

  const unidadesPendientes = ESCALA_PORCENTAJE - asignaciones.reduce((total, item) => total + item.unidades, 0)
  const prioridadResiduo = [...asignaciones].sort((a, b) =>
    b.residuo - a.residuo || a.clave.localeCompare(b.clave, 'en', { numeric: true }) || a.indice - b.indice,
  )
  prioridadResiduo.slice(0, unidadesPendientes).forEach((item) => { item.unidades += 1 })

  const calculados = asignaciones
    .sort((a, b) => a.indice - b.indice)
    .map(({ fila, unidades }) => [claveCentroCosto(fila), Number((unidades / ESCALA_PORCENTAJE).toFixed(PRECISION))])
  const resultadoPorClave = new Map(calculados)
  return escaladas.map(({ fila, elegible }) => ({
    ...fila,
    porcentaje_hec: elegible ? (resultadoPorClave.get(claveCentroCosto(fila)) ?? 0) : 0,
  }))
}

/** Valida porcentajes contables almacenados como fracciones con cuatro decimales. */
export function validarPorcentajeContable(filas) {
  if (!Array.isArray(filas) || filas.length === 0) {
    return { valido: false, unidades: 0, total: 0, mensaje: 'No hay centros de costo para distribuir.' }
  }

  let unidades = 0
  for (const fila of filas) {
    const valor = fila.porcentaje
    if (valor === null || valor === undefined || valor === '') {
      return { valido: false, unidades, total: unidades / ESCALA_PORCENTAJE, mensaje: `Falta el porcentaje contable de ${claveCentroCosto(fila) || 'un centro de costo'}.` }
    }

    const numero = Number(valor)
    const escalado = numero * ESCALA_PORCENTAJE
    if (!Number.isFinite(numero) || numero < 0 || numero > 1 || Math.abs(escalado - Math.round(escalado)) > 1e-7) {
      return { valido: false, unidades, total: unidades / ESCALA_PORCENTAJE, mensaje: `El porcentaje de ${claveCentroCosto(fila) || 'un centro de costo'} debe estar entre 0 y 1 y usar hasta cuatro decimales.` }
    }
    unidades += Math.round(escalado)
  }

  const valido = unidades === ESCALA_PORCENTAJE
  return {
    valido,
    unidades,
    total: Number((unidades / ESCALA_PORCENTAJE).toFixed(PRECISION)),
    mensaje: valido ? '' : 'Los porcentajes contables deben sumar exactamente 100.0000 % por empresa y fecha.',
  }
}

export function formatearPorcentaje(fraccion) {
  const numero = Number(fraccion)
  if (!Number.isFinite(numero)) return '—'
  return `${(numero * 100).toFixed(PRECISION)} %`
}
