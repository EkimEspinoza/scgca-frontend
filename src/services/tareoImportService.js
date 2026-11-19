import * as XLSX from 'xlsx'

const ALIAS_COLUMNAS = {
  NROPARTE: 'nro_parte', NUMEROPARTE: 'nro_parte',
  CODCC: 'cod_cc', CODCENTROCOSTO: 'cod_cc',
  CODCCMAQ: 'cod_cc_maq', CODMAQUINARIA: 'cod_cc_maq',
  HORA: 'hora', HORAS: 'hora', FECHATAREO: 'fecha_tareo', FECHA: 'fecha_tareo',
  ETAPATAREO: 'etapa_tareo', ETAPA: 'etapa_tareo', IDEMPRESA: 'id_empresa',
  CODCCPK: 'cod_cc_pk', CODCCPKMAQ: 'cod_cc_pk_maq', CODPKMAQ: 'cod_cc_pk_maq',
  OBSERVACION: 'observacion', ESTADO: 'estado',
}

function normalizarEncabezado(valor) {
  return String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function textoCelda(valor) {
  return String(valor ?? '').trim()
}

function numeroCelda(valor) {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : NaN
  const limpio = textoCelda(valor).replace(/\s/g, '').replace(',', '.')
  return limpio ? Number(limpio) : NaN
}

function fechaCelda(valor) {
  if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
    return `${valor.getFullYear()}-${String(valor.getMonth() + 1).padStart(2, '0')}-${String(valor.getDate()).padStart(2, '0')}`
  }
  if (typeof valor === 'number') {
    const fecha = XLSX.SSF.parse_date_code(valor)
    if (fecha?.y && fecha?.m && fecha?.d) return `${fecha.y}-${String(fecha.m).padStart(2, '0')}-${String(fecha.d).padStart(2, '0')}`
  }
  const texto = textoCelda(valor)
  const iso = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  const local = texto.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  const partes = iso ? [iso[1], iso[2], iso[3]] : local ? [local[3], local[2], local[1]] : null
  if (!partes) return ''
  const [year, month, day] = partes.map(Number)
  const valida = new Date(Date.UTC(year, month - 1, day))
  if (valida.getUTCFullYear() !== year || valida.getUTCMonth() !== month - 1 || valida.getUTCDate() !== day) return ''
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function estadoCelda(valor) {
  if (valor == null || textoCelda(valor) === '') return 1
  const estado = textoCelda(valor).toLocaleLowerCase('es-PE')
  if (['1', 'activo', 'true', 'si', 'sí'].includes(estado)) return 1
  if (['0', 'inactivo', 'false', 'no'].includes(estado)) return 0
  return null
}

export async function leerArchivoTareo(file) {
  if (!file) throw new Error('Selecciona un archivo Excel.')
  if (file.size > 25 * 1024 * 1024) throw new Error('El archivo supera el máximo permitido de 25 MB.')
  const libro = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true })
  const hoja = libro.Sheets[libro.SheetNames[0]]
  if (!hoja) throw new Error('El archivo no contiene una hoja con datos.')

  const filasCrudas = XLSX.utils.sheet_to_json(hoja, { defval: null, raw: true })
  if (!filasCrudas.length) throw new Error('La primera hoja no contiene registros.')
  const columnas = Object.keys(filasCrudas[0]).reduce((resultado, titulo) => {
    const campo = ALIAS_COLUMNAS[normalizarEncabezado(titulo)]
    if (campo && !resultado[campo]) resultado[campo] = titulo
    return resultado
  }, {})
  const requeridas = ['nro_parte', 'cod_cc', 'cod_cc_maq', 'hora', 'fecha_tareo', 'id_empresa', 'cod_cc_pk', 'cod_cc_pk_maq']
  const faltantes = requeridas.filter((campo) => !columnas[campo])
  if (faltantes.length) throw new Error(`Faltan columnas obligatorias: ${faltantes.join(', ')}.`)

  const errores = []
  const grupos = new Map()
  let duplicadosConsolidados = 0
  filasCrudas.forEach((fila, indice) => {
    const filaExcel = indice + 2
    const registro = {
      nro_parte: textoCelda(fila[columnas.nro_parte]),
      cod_cc: numeroCelda(fila[columnas.cod_cc]),
      cod_cc_maq: numeroCelda(fila[columnas.cod_cc_maq]),
      hora: numeroCelda(fila[columnas.hora]),
      fecha_tareo: fechaCelda(fila[columnas.fecha_tareo]),
      etapa_tareo: columnas.etapa_tareo ? textoCelda(fila[columnas.etapa_tareo]) || null : null,
      id_empresa: columnas.id_empresa ? numeroCelda(fila[columnas.id_empresa]) : null,
      cod_cc_pk: numeroCelda(fila[columnas.cod_cc_pk]),
      cod_cc_pk_maq: numeroCelda(fila[columnas.cod_cc_pk_maq]),
      observacion: columnas.observacion ? textoCelda(fila[columnas.observacion]) || null : null,
      estado: columnas.estado ? estadoCelda(fila[columnas.estado]) : 1,
      filas_origen: [filaExcel],
    }
    const validaciones = []
    if (!registro.nro_parte) validaciones.push('NRO_PARTE vacío')
    for (const campo of ['cod_cc', 'cod_cc_maq', 'cod_cc_pk', 'cod_cc_pk_maq']) {
      if (!Number.isSafeInteger(registro[campo]) || registro[campo] <= 0) validaciones.push(`${campo.toUpperCase()} inválido`)
    }
    if (!Number.isFinite(registro.hora) || registro.hora < 0 || Math.abs(registro.hora * 100 - Math.round(registro.hora * 100)) > 1e-8) validaciones.push('HORA debe ser un número no negativo de hasta 2 decimales')
    if (!registro.fecha_tareo) validaciones.push('FECHA_TAREO inválida')
    if (columnas.id_empresa && (!Number.isSafeInteger(registro.id_empresa) || registro.id_empresa <= 0)) validaciones.push('ID_EMPRESA inválido')
    if (registro.estado == null) validaciones.push('ESTADO debe ser 1/Activo o 0/Inactivo')
    if (validaciones.length) {
      errores.push({ fila: filaExcel, id_empresa: Number.isSafeInteger(registro.id_empresa) ? registro.id_empresa : null, nro_parte: registro.nro_parte || '—', motivo: validaciones.join('; ') })
      return
    }

    const clave = `${registro.id_empresa}|${registro.nro_parte}`
    const existente = grupos.get(clave)
    if (!existente) {
      grupos.set(clave, registro)
      return
    }
    const iguales = ['cod_cc', 'cod_cc_maq', 'fecha_tareo', 'etapa_tareo', 'id_empresa', 'cod_cc_pk', 'cod_cc_pk_maq', 'observacion', 'estado'].every((campo) => existente[campo] === registro[campo])
    if (!iguales) {
      errores.push({ fila: filaExcel, id_empresa: registro.id_empresa, nro_parte: registro.nro_parte, motivo: `NRO_PARTE duplicado con datos distintos (fila(s) ${existente.filas_origen.join(', ')})` })
      return
    }
    existente.hora += registro.hora
    existente.filas_origen.push(filaExcel)
    duplicadosConsolidados += 1
  })

  return { registros: [...grupos.values()], errores, filasArchivo: filasCrudas.length, duplicadosConsolidados, columnas }
}

export function aplicarEmpresaYPeriodoTareo(resultado, idEmpresa, anio, mesCorte) {
  const empresa = Number(idEmpresa)
  const year = Number(anio)
  const mes = Number(mesCorte)
  const fechaLimite = `${year}-${String(mes).padStart(2, '0')}-${String(new Date(year, mes, 0).getDate()).padStart(2, '0')}`
  const errores = resultado.errores.filter((error) => error.id_empresa == null || Number(error.id_empresa) === empresa)
  const registros = []
  resultado.registros.forEach((registro) => {
    if (Number(registro.id_empresa) !== empresa) return
    if (registro.fecha_tareo.slice(0, 4) !== String(year)) {
      errores.push({ fila: registro.filas_origen[0], nro_parte: registro.nro_parte, motivo: `La fecha está fuera del año ${year}` })
      return
    }
    if (registro.fecha_tareo < '2017-01-01') {
      errores.push({ fila: registro.filas_origen[0], nro_parte: registro.nro_parte, motivo: 'La fecha de tareo debe ser desde enero de 2017' })
      return
    }
    if (registro.fecha_tareo > fechaLimite) {
      errores.push({ fila: registro.filas_origen[0], nro_parte: registro.nro_parte, motivo: `La fecha supera el periodo declarado (${fechaLimite})` })
      return
    }
    const { filas_origen: _filasOrigen, ...datos } = registro
    registros.push({ ...datos, id_empresa: empresa })
  })
  return { registros, errores, fechaDesde: `${year}-01-01`, fechaHasta: fechaLimite }
}
