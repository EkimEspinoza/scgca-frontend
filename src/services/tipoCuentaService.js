// Encapsula las operaciones de datos del catálogo Dim_TipoCuenta.
import { supabase } from '../lib/supabase'

const CAMPOS_TIPO_CUENTA = 'Id_Tipo_Cuenta, DESCRIPCION_TIPO_CUENTA, estado, created_at, updated_at'

export async function obtenerTiposCuenta() {
  const { data, error } = await supabase.from('Dim_TipoCuenta').select(CAMPOS_TIPO_CUENTA).order('Id_Tipo_Cuenta')
  if (error) throw error
  return data ?? []
}

export async function crearTipoCuenta(datos) {
  const descripcion = datos.DESCRIPCION_TIPO_CUENTA?.trim()
  if (!descripcion) throw new Error('La descripción del tipo de cuenta es obligatoria.')
  const { data, error } = await supabase.from('Dim_TipoCuenta').insert({ DESCRIPCION_TIPO_CUENTA: descripcion, estado: 1 }).select(CAMPOS_TIPO_CUENTA).single()
  if (error) throw error
  return data
}

export async function actualizarTipoCuenta(id, datos) {
  const descripcion = datos.DESCRIPCION_TIPO_CUENTA?.trim()
  if (!descripcion) throw new Error('La descripción del tipo de cuenta es obligatoria.')
  const { data, error } = await supabase.from('Dim_TipoCuenta').update({ DESCRIPCION_TIPO_CUENTA: descripcion }).eq('Id_Tipo_Cuenta', Number(id)).select(CAMPOS_TIPO_CUENTA).single()
  if (error) throw error
  return data
}

export async function cambiarEstadoTipoCuenta(id, estado) {
  const { data, error } = await supabase.from('Dim_TipoCuenta').update({ estado: Number(estado) }).eq('Id_Tipo_Cuenta', Number(id)).select(CAMPOS_TIPO_CUENTA).single()
  if (error) throw error
  return data
}
