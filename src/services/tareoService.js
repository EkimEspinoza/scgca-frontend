import { supabase } from '../lib/supabase'

export async function contarMovimientosTareo(idEmpresa, fechaDesde, fechaHasta) {
  let movimientos = supabase.from('mov_tareo').select('id_mov_tareo', { count: 'exact', head: true })
  let pendientes = supabase.from('mov_tareo_pendiente').select('id_mov_tareo', { count: 'exact', head: true })

  if (idEmpresa) {
    movimientos = movimientos.eq('id_empresa', Number(idEmpresa))
    pendientes = pendientes.eq('id_empresa', Number(idEmpresa))
  }
  if (fechaDesde) {
    movimientos = movimientos.gte('fecha_tareo', fechaDesde)
    pendientes = pendientes.gte('fecha_tareo', fechaDesde)
  }
  if (fechaHasta) {
    movimientos = movimientos.lte('fecha_tareo', fechaHasta)
    pendientes = pendientes.lte('fecha_tareo', fechaHasta)
  }

  const [resultadoMovimientos, resultadoPendientes] = await Promise.all([movimientos, pendientes])
  if (resultadoMovimientos.error) throw resultadoMovimientos.error
  if (resultadoPendientes.error) throw resultadoPendientes.error

  return {
    registros: resultadoMovimientos.count ?? 0,
    pendientes: resultadoPendientes.count ?? 0,
  }
}

export async function listarMovimientosTareo({
  pendientes = false,
  idEmpresa,
  fechaDesde,
  fechaHasta,
  busqueda = '',
  estado = '',
  pagina = 0,
  filasPorPagina = 25,
}) {
  const tabla = pendientes ? 'mov_tareo_pendiente' : 'mov_tareo'
  const columnas = pendientes
    ? 'id_mov_tareo,nro_parte,cod_cc,cod_cc_maq,hora,fecha_tareo,etapa_tareo,id_empresa,cod_cc_pk,cod_cc_pk_maq,observacion,estado,estado_validacion,errores_validacion'
    : `id_mov_tareo,nro_parte,cod_cc,cod_cc_maq,hora,fecha_tareo,etapa_tareo,id_empresa,cod_cc_pk,cod_cc_pk_maq,observacion,estado,
       centro_operativo:dim_centro_costo!mov_tareo_centro_costo_fkey(cod_cc,desc_cc),
       maquinaria:dim_centro_costo!mov_tareo_maquinaria_fkey(cod_cc,desc_cc)`

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
  if (busqueda.trim()) {
    const termino = busqueda.trim().replace(/[,.()%*\\]/g, ' ').replace(/\s+/g, ' ').trim()
    const esCodigo = /^\d+$/.test(termino)
    let busquedaCentros = supabase
      .from('dim_centro_costo')
      .select('cod_cc_pk')
      .limit(500)

    if (idEmpresa) busquedaCentros = busquedaCentros.eq('id_empresa', Number(idEmpresa))
    if (esCodigo) {
      busquedaCentros = busquedaCentros.or(`desc_cc.ilike.%${termino}%,cod_cc.eq.${termino},cod_cc_pk.eq.${termino}`)
    } else if (termino) {
      busquedaCentros = busquedaCentros.ilike('desc_cc', `%${termino}%`)
    }

    const { data: centrosEncontrados, error: errorBusquedaCentros } = await busquedaCentros
    if (errorBusquedaCentros) throw errorBusquedaCentros

    const clavesCentro = [...new Set((centrosEncontrados ?? []).map((centro) => Number(centro.cod_cc_pk)))]
    const condiciones = [`nro_parte.ilike.%${termino}%`]
    if (esCodigo) {
      condiciones.push(
        `cod_cc.eq.${termino}`,
        `cod_cc_maq.eq.${termino}`,
        `cod_cc_pk.eq.${termino}`,
        `cod_cc_pk_maq.eq.${termino}`,
      )
    }
    if (clavesCentro.length) {
      const lista = `(${clavesCentro.join(',')})`
      condiciones.push(`cod_cc_pk.in.${lista}`, `cod_cc_pk_maq.in.${lista}`)
    }
    if (termino) query = query.or(condiciones.join(','))
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
      .eq('estado', true)
      .lte('fecha_inicio', valores.fecha_tareo)
      .gte('fecha_fin', valores.fecha_tareo)
      .limit(1)
      .maybeSingle()
    if (errorCampana) throw errorCampana
    if (!campana) throw new Error('El centro de costo Levante no tiene una campaña operativa para la fecha seleccionada.')
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
      etapa_tareo: valores.etapa_tareo?.trim() || null,
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
