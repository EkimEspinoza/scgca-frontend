// Encapsula las operaciones de datos de tareoService.
import { supabase } from '../lib/supabase'
import { obtenerPorIdsPaginado, obtenerTodasLasPaginas } from './paginacionService'

export async function obtenerResumenMensualTareo({ idEmpresa, fechaDesde, fechaHasta } = {}) {
  const { data, error } = await supabase.rpc('resumen_mensual_mov_tareo', {
    p_id_empresa: idEmpresa ? Number(idEmpresa) : null,
    p_fecha_desde: fechaDesde || null,
    p_fecha_hasta: fechaHasta || null,
  })
  if (error) throw error

  const empresasIds = [...new Set((data ?? []).map((fila) => Number(fila.id_empresa)))]
  if (!empresasIds.length) return []
  const { data: empresas, error: errorEmpresas } = await supabase
    .from('Dim_Empresa')
    .select('id_empresa,nombre_comercial,descripcion')
    .in('id_empresa', empresasIds)
  if (errorEmpresas) throw errorEmpresas
  const empresasPorId = new Map((empresas ?? []).map((empresa) => [Number(empresa.id_empresa), empresa]))
  return (data ?? []).map((fila) => ({ ...fila, empresa: empresasPorId.get(Number(fila.id_empresa)) ?? null }))
}

export async function contarMovimientosTareo(idEmpresa, fechaDesde, fechaHasta) {
  let movimientos = supabase.from('mov_tareo').select('id_mov_tareo', { count: 'exact', head: true })
  let enProceso = supabase.from('mov_tareo_proceso').select('id_mov_tareo', { count: 'exact', head: true })
  let pendientes = supabase.from('mov_tareo_pendiente').select('id_mov_tareo', { count: 'exact', head: true })

  if (idEmpresa) {
    movimientos = movimientos.eq('id_empresa', Number(idEmpresa))
    enProceso = enProceso.eq('id_empresa', Number(idEmpresa))
    pendientes = pendientes.eq('id_empresa', Number(idEmpresa))
  }
  if (fechaDesde) {
    movimientos = movimientos.gte('fecha_tareo', fechaDesde)
    enProceso = enProceso.gte('fecha_tareo', fechaDesde)
    pendientes = pendientes.gte('fecha_tareo', fechaDesde)
  }
  if (fechaHasta) {
    movimientos = movimientos.lte('fecha_tareo', fechaHasta)
    enProceso = enProceso.lte('fecha_tareo', fechaHasta)
    pendientes = pendientes.lte('fecha_tareo', fechaHasta)
  }

  const [resultadoMovimientos, resultadoEnProceso, resultadoPendientes] = await Promise.all([movimientos, enProceso, pendientes])
  if (resultadoMovimientos.error) throw resultadoMovimientos.error
  if (resultadoEnProceso.error) throw resultadoEnProceso.error
  if (resultadoPendientes.error) throw resultadoPendientes.error

  return {
    registros: resultadoMovimientos.count ?? 0,
    enProceso: resultadoEnProceso.count ?? 0,
    pendientes: resultadoPendientes.count ?? 0,
  }
}

export async function obtenerOpcionesFiltrosTareo({ pendientes = false, enProceso = false, idEmpresa = null, fechaDesde = null, fechaHasta = null } = {}) {
  const tabla = pendientes ? 'mov_tareo_pendiente' : enProceso ? 'mov_tareo_proceso' : 'mov_tareo'
  const registros = []
  const tamanoPagina = 1000
  for (let desde = 0; ; desde += tamanoPagina) {
    let query = supabase.from(tabla).select('id_empresa,cod_cc_pk,cod_cc,cod_cc_pk_maq,cod_cc_maq').order('id_mov_tareo').range(desde, desde + tamanoPagina - 1)
    if (idEmpresa) query = query.eq('id_empresa', Number(idEmpresa))
    if (fechaDesde) query = query.gte('fecha_tareo', fechaDesde)
    if (fechaHasta) query = query.lte('fecha_tareo', fechaHasta)
    const { data, error } = await query
    if (error) throw error
    registros.push(...(data ?? []))
    if (!data?.length || data.length < tamanoPagina) break
  }

  const codigos = [...new Set(registros.flatMap((fila) => [fila.cod_cc_pk, fila.cod_cc_pk_maq]).filter((codigo) => codigo != null && Number.isFinite(Number(codigo))).map(Number))]
  const centrosCatalogo = await obtenerPorIdsPaginado(codigos, (ids, desde, hasta) => supabase.from('dim_centro_costo')
    .select('cod_cc_pk,cod_cc,desc_cc,id_empresa').in('cod_cc_pk', ids).order('cod_cc_pk').range(desde, hasta))
  const centrosPorPk = new Map(centrosCatalogo.map((centro) => [Number(centro.cod_cc_pk), centro]))
  const obtenerOpciones = (pkKey, codKey) => {
    const opciones = new Map()
    registros.forEach((fila) => {
      const pk = Number(fila[pkKey])
      const codigo = fila[codKey]
      const centro = Number.isFinite(pk) ? centrosPorPk.get(pk) : null
      const valor = centro ? `pk:${centro.cod_cc_pk}` : codigo != null ? `cod:${codigo}` : null
      if (!valor || opciones.has(valor)) return
      opciones.set(valor, {
        value: valor,
        cod_cc_pk: centro?.cod_cc_pk ?? null,
        cod_cc: centro?.cod_cc ?? codigo ?? null,
        desc_cc: centro?.desc_cc ?? (codigo != null ? 'Centro no registrado' : ''),
        id_empresa: centro?.id_empresa ?? fila.id_empresa ?? null,
      })
    })
    return [...opciones.values()].sort((a, b) => String(a.desc_cc || a.cod_cc).localeCompare(String(b.desc_cc || b.cod_cc), 'es-PE', { numeric: true, sensitivity: 'base' }))
  }
  return { centros: obtenerOpciones('cod_cc_pk', 'cod_cc'), maquinarias: obtenerOpciones('cod_cc_pk_maq', 'cod_cc_maq') }
}

export async function obtenerCatalogoCentrosEditarTareo(idEmpresa) {
  const centros = await obtenerTodasLasPaginas((desde, hasta) => supabase.from('dim_centro_costo')
    .select('cod_cc_pk,cod_cc,desc_cc,id_empresa,id_tip_cc,estado')
    .eq('id_empresa', Number(idEmpresa))
    .order('desc_cc')
    .order('cod_cc_pk')
    .range(desde, hasta))
  const tipoIds = [...new Set(centros.map((centro) => Number(centro.id_tip_cc)).filter(Number.isFinite))]
  if (!tipoIds.length) return centros
  const { data: tipos, error } = await supabase.from('Dim_TipoCC')
    .select('id_tip_cc,des_tip_cc')
    .in('id_tip_cc', tipoIds)
  if (error) throw error
  const tipoPorId = new Map((tipos ?? []).map((tipo) => [Number(tipo.id_tip_cc), tipo.des_tip_cc]))
  return centros.map((centro) => ({ ...centro, des_tip_cc: tipoPorId.get(Number(centro.id_tip_cc)) ?? '' }))
}

export async function listarMovimientosTareo({
  pendientes = false,
  enProceso = false,
  idEmpresa,
  fechaDesde,
  fechaHasta,
  busqueda = '',
  estado = '',
  centroCostoFiltro = '',
  maquinariaFiltro = '',
  pagina = 0,
  filasPorPagina = 25,
}) {
  const tabla = pendientes ? 'mov_tareo_pendiente' : enProceso ? 'mov_tareo_proceso' : 'mov_tareo'
  const columnas = pendientes
    ? 'id_mov_tareo,nro_parte,cod_cc,cod_cc_maq,hora,fecha_tareo,etapa_tareo,id_empresa,cod_cc_pk,cod_cc_pk_maq,observacion,estado,estado_validacion,errores_validacion'
    : `id_mov_tareo,nro_parte,cod_cc,cod_cc_maq,hora,fecha_tareo,etapa_tareo,id_empresa,cod_cc_pk,cod_cc_pk_maq,observacion,estado,
       centro_operativo:dim_centro_costo!${tabla}_centro_costo_fkey(cod_cc,desc_cc),
       maquinaria:dim_centro_costo!${tabla}_maquinaria_fkey(cod_cc,desc_cc)`

  let query = supabase
    .from(tabla)
    .select(columnas, { count: 'exact' })
    .order('fecha_tareo', { ascending: false })
    .order('nro_parte', { ascending: true })
    .range(pagina * filasPorPagina, (pagina + 1) * filasPorPagina - 1)

  if (idEmpresa) query = query.eq('id_empresa', Number(idEmpresa))
  if (fechaDesde) query = query.gte('fecha_tareo', fechaDesde)
  if (fechaHasta) query = query.lte('fecha_tareo', fechaHasta)
  if (estado !== '' && estado != null) query = query.eq('estado', Number(estado))
  for (const [filtro, columnaPk, columnaCodigo] of [[centroCostoFiltro, 'cod_cc_pk', 'cod_cc'], [maquinariaFiltro, 'cod_cc_pk_maq', 'cod_cc_maq']]) {
    if (!filtro) continue
    const [tipo, codigo] = String(filtro).split(':')
    query = query.eq(tipo === 'pk' ? columnaPk : columnaCodigo, Number(codigo))
  }
  if (busqueda.trim()) {
    const termino = busqueda.trim().replace(/[,.()%*\\]/g, ' ').replace(/\s+/g, ' ').trim()
    if (termino) query = query.ilike('nro_parte', `%${termino}%`)
  }

  const { data, error, count } = await query
  if (error) throw error

  let filas = data ?? []
  if (pendientes && filas.length) {
    const codigos = [...new Set(filas.flatMap((fila) => [fila.cod_cc_pk, fila.cod_cc_pk_maq]).filter(Boolean))]
    if (codigos.length) {
      const { data: centros, error: errorCentros } = await supabase
        .from('dim_centro_costo')
        .select('cod_cc_pk,cod_cc,desc_cc')
        .in('cod_cc_pk', codigos)
      if (errorCentros) throw errorCentros

      const porCodigo = new Map((centros ?? []).map((centro) => [Number(centro.cod_cc_pk), centro]))
      filas = filas.map((fila) => ({
        ...fila,
        centro_operativo: porCodigo.get(Number(fila.cod_cc_pk)) ?? null,
        maquinaria: porCodigo.get(Number(fila.cod_cc_pk_maq)) ?? null,
      }))
    }
  }

  return { filas, total: count ?? 0 }
}

async function obtenerCentroCosto(idEmpresa, codCc, etiqueta) {
  const codigo = Number(codCc)
  if (!Number.isInteger(codigo) || codigo <= 0) {
    throw new Error(`Ingresa un código válido para ${etiqueta}.`)
  }

  const { data, error } = await supabase
    .from('dim_centro_costo')
    .select('cod_cc_pk,cod_cc,id_empresa,estado,id_tip_cc')
    .eq('id_empresa', Number(idEmpresa))
    .eq('cod_cc', codigo)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error(`El centro de costo ${codigo} para ${etiqueta} no está registrado en esta empresa.`)
  return data
}

export async function actualizarMovimientoTareo(idMovimiento, valores, pendientes = false) {
  const idEmpresa = Number(valores.id_empresa)
  const hora = Number(valores.hora)
  if (!Number.isFinite(hora) || hora <= 0) throw new Error('Las horas deben ser mayores a cero.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valores.fecha_tareo)) throw new Error('Selecciona una fecha válida.')

  const [centro, maquinaria] = await Promise.all([
    obtenerCentroCosto(idEmpresa, valores.cod_cc, 'centro operativo'),
    obtenerCentroCosto(idEmpresa, valores.cod_cc_maq, 'maquinaria'),
  ])

  const { data: tipo, error: errorTipo } = await supabase
    .from('Dim_TipoCC')
    .select('des_tip_cc')
    .eq('id_tip_cc', centro.id_tip_cc)
    .maybeSingle()
  if (errorTipo) throw errorTipo

  if (!pendientes && tipo?.des_tip_cc?.toLocaleUpperCase('es-PE').includes('LEVANTE')) {
    const { data: campana, error: errorCampana } = await supabase
      .from('Dim_Campana')
      .select('id_campana')
      .eq('id_empresa', idEmpresa)
      .eq('cod_cc_pk', centro.cod_cc_pk)
      .lte('fecha_inicio', valores.fecha_tareo)
      .gte('fecha_fin', valores.fecha_tareo)
      .limit(1)
      .maybeSingle()
    if (errorCampana) throw errorCampana
    if (!campana) throw new Error('El centro de costo Levante no tiene una campaña que cubra la fecha seleccionada.')
  }

  const tabla = pendientes ? 'mov_tareo_pendiente' : 'mov_tareo'
  const { data, error } = await supabase
    .from(tabla)
    .update({
      cod_cc: centro.cod_cc,
      cod_cc_pk: centro.cod_cc_pk,
      cod_cc_maq: maquinaria.cod_cc,
      cod_cc_pk_maq: maquinaria.cod_cc_pk,
      hora,
      fecha_tareo: valores.fecha_tareo,
      etapa_tareo: valores.etapa_tareo == null || valores.etapa_tareo === '' ? null : Number(valores.etapa_tareo),
      observacion: valores.observacion?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id_mov_tareo', Number(idMovimiento))
    .select('id_mov_tareo')
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('No se encontró el movimiento o no tienes permiso para actualizarlo.')
}

export async function actualizarEstadoMovimientoTareo(idMovimiento, estado, pendientes = false) {
  const tabla = pendientes ? 'mov_tareo_pendiente' : 'mov_tareo'
  const { data, error } = await supabase
    .from(tabla)
    .update({ estado: Number(estado), updated_at: new Date().toISOString() })
    .eq('id_mov_tareo', Number(idMovimiento))
    .select('id_mov_tareo')
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('No se encontró el movimiento o no tienes permiso para cambiar su estado.')
}

export async function listarPartesTareoActivas(idEmpresa, fechaDesde, fechaHasta) {
  const filas = []
  const tamanoPagina = 1000
  let desde = 0

  while (true) {
    let query = supabase
      .from('mov_tareo')
      .select('id_mov_tareo,nro_parte,fecha_tareo')
      .eq('id_empresa', Number(idEmpresa))
      .eq('estado', 1)
      .gte('fecha_tareo', fechaDesde)
      .lte('fecha_tareo', fechaHasta)
      .order('id_mov_tareo')
      .range(desde, desde + tamanoPagina - 1)

    const { data, error } = await query
    if (error) throw error
    filas.push(...(data ?? []))
    if (!data || data.length < tamanoPagina) break
    desde += tamanoPagina
  }

  return filas
}

export async function buscarPartesTareoAusentes(idEmpresa, fechaDesde, fechaHasta, numerosDelArchivo) {
  const filas = await listarPartesTareoActivas(idEmpresa, fechaDesde, fechaHasta)
  const presentes = new Set(numerosDelArchivo.map(String))
  return filas.filter((fila) => !presentes.has(String(fila.nro_parte)))
}

export async function importarMovimientosTareo(registros, alProgresar = () => {}) {
  const tamanoLote = 500
  const totales = { recibidos: 0, partes_unicas: 0, duplicados_consolidados: 0, ya_existentes: 0, cargados: 0, en_proceso: 0, procesados: 0, pendientes: 0 }
  const lotes = Math.ceil(registros.length / tamanoLote)

  for (let indice = 0; indice < lotes; indice += 1) {
    const lote = registros.slice(indice * tamanoLote, (indice + 1) * tamanoLote)
    const { data, error } = await supabase.functions.invoke('importar-mov-tareo', {
      body: { id_empresa: lote[0].id_empresa, registros: lote, finalizar: indice === lotes - 1 },
    })
    if (error) {
      const respuesta = error.context instanceof Response ? await error.context.clone().json().catch(() => null) : null
      const mensaje = data?.error || respuesta?.error || error.message || 'No se pudo importar el lote.'
      const fallo = new Error(`${mensaje} Se procesaron ${indice} de ${lotes} lotes; puedes volver a cargar el archivo sin duplicar lo ya guardado.`)
      fallo.avance = { ...totales, lotesProcesados: indice, lotesTotales: lotes }
      throw fallo
    }
    for (const campo of ['recibidos', 'partes_unicas', 'duplicados_consolidados', 'ya_existentes', 'cargados', 'en_proceso', 'procesados', 'pendientes']) {
      totales[campo] += Number(data?.[campo] ?? 0)
    }
    alProgresar({ loteActual: indice + 1, lotesTotales: lotes, registrosProcesados: Math.min((indice + 1) * tamanoLote, registros.length), registrosTotales: registros.length })
  }

  return totales
}

export async function inactivarMovimientosTareo(ids, observacion) {
  const idsUnicos = [...new Set(ids.map(Number).filter((id) => Number.isSafeInteger(id) && id > 0))]
  let actualizados = 0
  for (let indice = 0; indice < idsUnicos.length; indice += 500) {
    const lote = idsUnicos.slice(indice, indice + 500)
    const { data, error } = await supabase
      .from('mov_tareo')
      .update({ estado: 0, observacion, updated_at: new Date().toISOString() })
      .in('id_mov_tareo', lote)
      .eq('estado', 1)
      .select('id_mov_tareo')
    if (error) throw error
    actualizados += data?.length ?? 0
  }
  return actualizados
}
