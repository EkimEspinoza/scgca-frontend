// Encapsula las operaciones de datos de tipoJornalService.
import { supabase } from '../lib/supabase'

const CAMPOS_TIPO_JORNAL = 'Id_Tipo_Jornal, Descripcion, estado, created_at, updated_at'

export async function obtenerTiposJornal() {
  const { data, error } = await supabase.from('Dim_TipoJornal').select(CAMPOS_TIPO_JORNAL).order('Id_Tipo_Jornal', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function crearTipoJornal(datos) {
  const descripcion = datos.Descripcion?.trim()
  if (!descripcion) throw new Error('La descripción del tipo de jornal es obligatoria.')
  const { data, error } = await supabase.from('Dim_TipoJornal').insert({ Descripcion: descripcion, estado: 1 })
    .select(CAMPOS_TIPO_JORNAL).single()
  if (error) throw error
  return data
}

export async function actualizarTipoJornal(id, datos) {
  const descripcion = datos.Descripcion?.trim()
  if (!descripcion) throw new Error('La descripción del tipo de jornal es obligatoria.')
  const { data, error } = await supabase.from('Dim_TipoJornal').update({ Descripcion: descripcion })
    .eq('Id_Tipo_Jornal', Number(id)).select(CAMPOS_TIPO_JORNAL).single()
  if (error) throw error
  return data
}

export async function cambiarEstadoTipoJornal(id, estado) {
  const { data, error } = await supabase.from('Dim_TipoJornal').update({ estado: Number(estado) })
    .eq('Id_Tipo_Jornal', Number(id)).select(CAMPOS_TIPO_JORNAL).single()
  if (error) throw error
  return data
}
