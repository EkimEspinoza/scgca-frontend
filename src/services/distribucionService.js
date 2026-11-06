import { supabase } from '../lib/supabase'

export async function obtenerEmpresasDistribucion() {
  const { data, error } = await supabase.rpc('obtener_empresas_distribucion')
  if (error) throw error
  return data ?? []
}
export async function previsualizarDistribucionMes(idEmpresa, fecha) {
  const { data, error } = await supabase.rpc('previsualizar_distribucion_mes', {
    p_id_empresa: Number(idEmpresa),
    p_fecha: fecha,
  })
  if (error) throw error
  return data ?? []
}

export async function obtenerEstadoDistribucionMes(idEmpresa, fecha) {
  const { data, error } = await supabase
    .from('distribucion_mes')
    .select('estado, cerrado_at, cerrado_por, reabierto_at, reabierto_por')
    .eq('id_empresa', Number(idEmpresa))
    .eq('fecha', fecha)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function guardarDistribucionMes(idEmpresa, fecha, filas, cerrar = false) {
  const { error } = await supabase.rpc('guardar_distribucion_mes', {
    p_id_empresa: Number(idEmpresa),
    p_fecha: fecha,
    p_filas: filas.map((fila) => ({
      cod_cc_pk: Number(fila.cod_cc_pk_dist),
      porcentaje: fila.porcentaje === '' || fila.porcentaje === null || fila.porcentaje === undefined
        ? null
        : Number(fila.porcentaje),
    })),
    p_cerrar: Boolean(cerrar),
  })
  if (error) throw error
}

export async function reabrirDistribucionMes(idEmpresa, fecha) {
  const { data, error } = await supabase.rpc('reabrir_distribucion_mes', {
    p_id_empresa: Number(idEmpresa),
    p_fecha: fecha,
  })
  if (error) throw error
  return Number(data ?? 0)
}
