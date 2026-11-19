import { supabase } from '../lib/supabase'

const tablas = ['mov_mo', 'mov_mo_proceso', 'mov_mo_pendiente']
const columnas = 'id_mov_mo,id_empresa,cod_cc_pk,cod_cc,cod_labor,labor_scire,imp_labor_sol,ess_labor_sol,fec_labor,etapa_costo,obs,estado,created_at,updated_at'
const columnasPendientes = `${columnas},estado_validacion,errores_validacion`

function normalizarBusqueda(busqueda = '') {
  return busqueda.trim().replace(/[,.()%*\\]/g, ' ').replace(/\s+/g, ' ').trim()
}

function aplicarFiltros(query, { idEmpresa, fechaDesde, fechaHasta, estado, busqueda, centroCostoPk, centrosTipoIds = [], tipoCentroId, gruposLaborIds = [], grupoLaborId, laborIdsBusqueda = [] }) {
  if (idEmpresa) query = query.eq('id_empresa', Number(idEmpresa))
  if (fechaDesde) query = query.gte('fec_labor', fechaDesde)
  if (fechaHasta) query = query.lte('fec_labor', fechaHasta)
  if (estado !== '') query = query.eq('estado', Number(estado))
  if (centroCostoPk) query = query.eq('cod_cc_pk', Number(centroCostoPk))
  if (tipoCentroId) query = query.in('cod_cc_pk', centrosTipoIds.length ? centrosTipoIds : [0])
  if (grupoLaborId) query = query.in('cod_labor', gruposLaborIds.length ? gruposLaborIds : [0])

  const termino = normalizarBusqueda(busqueda)
  if (termino) {
    const condiciones = [`labor_scire.ilike.%${termino}%`, `etapa_costo.ilike.%${termino}%`, `obs.ilike.%${termino}%`]
    if (laborIdsBusqueda.length) condiciones.push(`cod_labor.in.(${laborIdsBusqueda.join(',')})`)
    if (/^\d+$/.test(termino)) condiciones.push(`cod_cc.eq.${termino}`, `cod_cc_pk.eq.${termino}`, `cod_labor.eq.${termino}`)
    query = query.or(condiciones.join(','))
  }
  return query
}
export async function obtenerOpcionesFiltrosMO({ pestana = 0, idEmpresa = null, fechaDesde = null, fechaHasta = null } = {}) {
  const tabla = tablas[pestana] ?? tablas[0]
  const registros = []
  const tamanoLote = 1000
  for (let desde = 0; ; desde += tamanoLote) {
    let query = supabase.from(tabla).select('cod_cc_pk,cod_labor,estado').order('id_mov_mo').range(desde, desde + tamanoLote - 1)
    if (idEmpresa) query = query.eq('id_empresa', Number(idEmpresa))
    if (fechaDesde) query = query.gte('fec_labor', fechaDesde)
    if (fechaHasta) query = query.lte('fec_labor', fechaHasta)
    const { data, error } = await query
    if (error) throw error
    registros.push(...(data ?? []))
    if (!data?.length || data.length < tamanoLote) break
  }

  const centroIds = [...new Set(registros.map((registro) => Number(registro.cod_cc_pk)).filter(Number.isFinite))]
  const laborIds = [...new Set(registros.map((registro) => Number(registro.cod_labor)).filter(Number.isFinite))]
  const [centrosResult, laboresResult] = await Promise.all([
    centroIds.length
      ? supabase.from('dim_centro_costo').select('cod_cc_pk,id_empresa,cod_cc,desc_cc,id_tip_cc').in('cod_cc_pk', centroIds).order('desc_cc')
      : { data: [], error: null },
    laborIds.length
      ? supabase.from('Dim_Labor').select('Id_Lab,Id_Lab_Fin').in('Id_Lab', laborIds)
      : { data: [], error: null },
  ])
  if (centrosResult.error) throw centrosResult.error
  if (laboresResult.error) throw laboresResult.error
  const centros = centrosResult.data ?? []
  const tipoIds = [...new Set(centros.map((centro) => Number(centro.id_tip_cc)).filter(Number.isFinite))]
  const laborFinalIds = [...new Set((laboresResult.data ?? []).map((labor) => Number(labor.Id_Lab_Fin)).filter(Number.isFinite))]
  const [tiposResult, laboresFinalesResult] = await Promise.all([
    tipoIds.length
      ? supabase.from('Dim_TipoCC').select('id_tip_cc,des_tip_cc').in('id_tip_cc', tipoIds).order('des_tip_cc')
      : { data: [], error: null },
    laborFinalIds.length
      ? supabase.from('Dim_Labor_Final').select('Id_Lab_Fin,Id_Grupo_Labor').in('Id_Lab_Fin', laborFinalIds)
      : { data: [], error: null },
  ])
  if (tiposResult.error) throw tiposResult.error
  if (laboresFinalesResult.error) throw laboresFinalesResult.error
  const grupoIds = [...new Set((laboresFinalesResult.data ?? []).map((laborFinal) => Number(laborFinal.Id_Grupo_Labor)).filter(Number.isFinite))]
  const gruposResult = grupoIds.length
    ? await supabase.from('Dim_GrupoLabor').select('Id_Grupo_Labor,DescripcionLabor').in('Id_Grupo_Labor', grupoIds).order('DescripcionLabor')
    : { data: [], error: null }
  if (gruposResult.error) throw gruposResult.error
  return { centros, tipos: tiposResult.data ?? [], grupos: gruposResult.data ?? [] }
}
export async function contarMovimientosMO({ idEmpresa, fechaDesde, fechaHasta }) {
  const resultados = await Promise.all(tablas.map((tabla) => {
    let query = supabase.from(tabla).select('id_mov_mo', { count: 'exact', head: true })
    if (idEmpresa) query = query.eq('id_empresa', Number(idEmpresa))
    if (fechaDesde) query = query.gte('fec_labor', fechaDesde)
    if (fechaHasta) query = query.lte('fec_labor', fechaHasta)
    return query
  }))
  const fallo = resultados.find(({ error }) => error)
  if (fallo) throw fallo.error
  return { procesados: resultados[0].count ?? 0, enProceso: resultados[1].count ?? 0, pendientes: resultados[2].count ?? 0 }
}

export async function listarMovimientosMO({ pestana, pagina, filasPorPagina, ...filtros }) {
  const tabla = tablas[pestana] ?? tablas[0]
  const termino = normalizarBusqueda(filtros.busqueda)
  let centrosTipoIds = []
  if (filtros.tipoCentroId) {
    let queryCentrosTipo = supabase.from('dim_centro_costo').select('cod_cc_pk').eq('id_tip_cc', Number(filtros.tipoCentroId))
    if (filtros.idEmpresa) queryCentrosTipo = queryCentrosTipo.eq('id_empresa', Number(filtros.idEmpresa))
    const { data, error } = await queryCentrosTipo.range(0, 9999)
    if (error) throw error
    centrosTipoIds = (data ?? []).map((centro) => Number(centro.cod_cc_pk))
  }
  let gruposLaborIds = []
  if (filtros.grupoLaborId) {
    const { data: laboresFinales, error: errorLaboresFinales } = await supabase.from('Dim_Labor_Final').select('Id_Lab_Fin').eq('Id_Grupo_Labor', Number(filtros.grupoLaborId)).range(0, 9999)
    if (errorLaboresFinales) throw errorLaboresFinales
    const idsLaborFinal = (laboresFinales ?? []).map((laborFinal) => Number(laborFinal.Id_Lab_Fin))
    if (idsLaborFinal.length) {
      const { data: laboresCatalogo, error: errorLaboresCatalogo } = await supabase.from('Dim_Labor').select('Id_Lab').in('Id_Lab_Fin', idsLaborFinal).range(0, 9999)
      if (errorLaboresCatalogo) throw errorLaboresCatalogo
      gruposLaborIds = (laboresCatalogo ?? []).map((labor) => Number(labor.Id_Lab))
    }
  }
  let laborIdsBusqueda = []
  if (termino) {
    const { data: laboresCoincidentes, error: errorBusquedaLabor } = await supabase.from('Dim_Labor').select('Id_Lab').ilike('Lab_SCIRE', `%${termino}%`)
    if (errorBusquedaLabor) throw errorBusquedaLabor
    laborIdsBusqueda = (laboresCoincidentes ?? []).map((labor) => Number(labor.Id_Lab)).filter(Number.isFinite)
  }
  const seleccion = pestana === 2 ? columnasPendientes : columnas
  let query = aplicarFiltros(supabase.from(tabla).select(seleccion, { count: 'exact' }), { ...filtros, centrosTipoIds, gruposLaborIds, laborIdsBusqueda })
    .order('fec_labor', { ascending: false })
    .order('id_mov_mo', { ascending: false })
    .range(pagina * filasPorPagina, (pagina + 1) * filasPorPagina - 1)

  const { data, error, count } = await query
  if (error) throw error
  const filas = data ?? []
  const empresaIds = [...new Set(filas.map((fila) => fila.id_empresa).filter(Boolean))]
  const centroIds = [...new Set(filas.map((fila) => fila.cod_cc_pk).filter(Boolean))]
  const laborIds = [...new Set(filas.map((fila) => fila.cod_labor).filter(Boolean))]

  const [empresas, centros, labores] = await Promise.all([
    empresaIds.length ? supabase.from('Dim_Empresa').select('id_empresa,nombre_comercial,descripcion').in('id_empresa', empresaIds) : { data: [] },
    centroIds.length ? supabase.from('dim_centro_costo').select('cod_cc_pk,cod_cc,desc_cc,id_tip_cc').in('cod_cc_pk', centroIds) : { data: [] },
    laborIds.length ? supabase.from('Dim_Labor').select('Id_Lab,Lab_SCIRE,Id_Lab_Fin').in('Id_Lab', laborIds) : { data: [] },
  ])
  for (const resultado of [empresas, centros, labores]) if (resultado.error) throw resultado.error
  const tipoCCIds = [...new Set((centros.data ?? []).map((centro) => centro.id_tip_cc).filter(Boolean))]
  const tiposCC = tipoCCIds.length
    ? await supabase.from('Dim_TipoCC').select('id_tip_cc,des_tip_cc').in('id_tip_cc', tipoCCIds)
    : { data: [], error: null }
  if (tiposCC.error) throw tiposCC.error
  const laborFinalIds = [...new Set((labores.data ?? []).map((labor) => labor.Id_Lab_Fin).filter(Boolean))]
  const laboresFinales = laborFinalIds.length
    ? await supabase.from('Dim_Labor_Final').select('Id_Lab_Fin,Id_Grupo_Labor').in('Id_Lab_Fin', laborFinalIds)
    : { data: [], error: null }
  if (laboresFinales.error) throw laboresFinales.error
  const grupoIds = [...new Set((laboresFinales.data ?? []).map((laborFinal) => laborFinal.Id_Grupo_Labor).filter(Boolean))]
  const gruposLabor = grupoIds.length
    ? await supabase.from('Dim_GrupoLabor').select('Id_Grupo_Labor,DescripcionLabor').in('Id_Grupo_Labor', grupoIds)
    : { data: [], error: null }
  if (gruposLabor.error) throw gruposLabor.error

  const porId = (items, campo) => new Map((items ?? []).map((item) => [Number(item[campo]), item]))
  const empresaPorId = porId(empresas.data, 'id_empresa')
  const tipoCCPorId = porId(tiposCC.data, 'id_tip_cc')
  const centroPorId = new Map((centros.data ?? []).map((centro) => [Number(centro.cod_cc_pk), { ...centro, tipo_cc: tipoCCPorId.get(Number(centro.id_tip_cc)) ?? null }]))
  const grupoPorId = porId(gruposLabor.data, 'Id_Grupo_Labor')
  const laborFinalPorId = new Map((laboresFinales.data ?? []).map((laborFinal) => [Number(laborFinal.Id_Lab_Fin), { ...laborFinal, grupo_labor: grupoPorId.get(Number(laborFinal.Id_Grupo_Labor)) ?? null }]))
  const laborPorId = new Map((labores.data ?? []).map((labor) => [Number(labor.Id_Lab), { ...labor, labor_final: laborFinalPorId.get(Number(labor.Id_Lab_Fin)) ?? null }]))
  return {
    total: count ?? 0,
    filas: filas.map((fila) => ({
      ...fila,
      empresa: empresaPorId.get(Number(fila.id_empresa)) ?? null,
      centro: centroPorId.get(Number(fila.cod_cc_pk)) ?? null,
      labor: laborPorId.get(Number(fila.cod_labor)) ?? null,
    })),
  }
}

export async function obtenerResumenMensualMO({ idEmpresa, fechaDesde, fechaHasta, estado }) {
  const { data, error } = await supabase.rpc('resumen_mensual_mov_mo', {
    p_id_empresa: idEmpresa ? Number(idEmpresa) : null,
    p_fecha_desde: fechaDesde || null,
    p_fecha_hasta: fechaHasta || null,
    p_estado: estado === '' ? null : Number(estado),
  })
  if (error) throw error

  const empresaIds = [...new Set((data ?? []).map((fila) => Number(fila.id_empresa)))]
  if (!empresaIds.length) return []
  const { data: empresas, error: errorEmpresas } = await supabase
    .from('Dim_Empresa')
    .select('id_empresa,nombre_comercial,descripcion')
    .in('id_empresa', empresaIds)
  if (errorEmpresas) throw errorEmpresas
  const porId = new Map((empresas ?? []).map((empresa) => [Number(empresa.id_empresa), empresa]))
  return (data ?? []).map((fila) => ({
    ...fila,
    empresa: porId.get(Number(fila.id_empresa)) ?? null,
  }))
}

export async function actualizarMovimientoMO({ pestana, idMovimiento, datos }) {
  const tabla = tablas[pestana] ?? tablas[0]
  const actualizacion = {
    cod_cc_pk: Number(datos.cod_cc_pk),
    cod_cc: Number(datos.cod_cc),
    updated_at: new Date().toISOString(),
  }
  if (pestana !== 0 && datos.cod_labor != null) actualizacion.cod_labor = Number(datos.cod_labor)
  if (Object.hasOwn(datos, 'etapa_costo')) actualizacion.etapa_costo = datos.etapa_costo || null
  const { data, error } = await supabase.from(tabla).update(actualizacion).eq('id_mov_mo', Number(idMovimiento)).select('id_mov_mo').maybeSingle()
  if (error) throw error
  if (!data) throw new Error('No se encontró el movimiento o no tienes permiso para editarlo.')
}

export async function crearMovimientoMO(datos) {
  const { data, error } = await supabase.from('mov_mo').insert({
    id_empresa: Number(datos.id_empresa),
    cod_cc_pk: Number(datos.cod_cc_pk),
    cod_cc: Number(datos.cod_cc),
    cod_labor: Number(datos.cod_labor),
    labor_scire: datos.labor_scire,
    imp_labor_sol: Number(datos.imp_labor_sol),
    ess_labor_sol: Number(datos.ess_labor_sol ?? 0),
    fec_labor: datos.fec_labor,
    etapa_costo: datos.etapa_costo || null,
    obs: datos.obs || null,
    estado: 1,
  }).select('id_mov_mo').single()
  if (error) throw error
  return data
}

export async function actualizarEstadoMovimientoMO({ pestana, idMovimiento, estado }) {
  const tabla = tablas[pestana] ?? tablas[0]
  const { data, error } = await supabase.from(tabla).update({ estado: Number(estado), updated_at: new Date().toISOString() })
    .eq('id_mov_mo', Number(idMovimiento)).select('id_mov_mo').maybeSingle()
  if (error) throw error
  if (!data) throw new Error('No se encontró el movimiento o no tienes permiso para cambiar su estado.')
}
