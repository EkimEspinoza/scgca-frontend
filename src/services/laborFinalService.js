import { supabase } from '../lib/supabase'

const CAMPOS_LABOR_FINAL = 'Id_Lab_Fin, DESCRIPCION, Id_Grupo_Labor, id_Tipo_Jornal, estado, created_at, updated_at'

export async function obtenerLaboresFinales() {
  const { data, error } = await supabase.from('Dim_Labor_Final').select(CAMPOS_LABOR_FINAL).order('Id_Lab_Fin', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function crearLaborFinal(datos) {
  const descripcion = datos.DESCRIPCION?.trim()
  if (!descripcion) throw new Error('La descripción de la labor es obligatoria.')

  const { data, error } = await supabase.from('Dim_Labor_Final').insert({
    DESCRIPCION: descripcion,
    Id_Grupo_Labor: Number(datos.Id_Grupo_Labor),
    id_Tipo_Jornal: Number(datos.id_Tipo_Jornal),
    estado: 1,
  }).select(CAMPOS_LABOR_FINAL).single()

  if (error) throw error
  return data
}

export async function actualizarLaborFinal(id, datos) {
  const descripcion = datos.DESCRIPCION?.trim()
  if (!descripcion) throw new Error('La descripción de la labor es obligatoria.')

  const { data, error } = await supabase.from('Dim_Labor_Final').update({
    DESCRIPCION: descripcion,
    Id_Grupo_Labor: Number(datos.Id_Grupo_Labor),
    id_Tipo_Jornal: Number(datos.id_Tipo_Jornal),
  }).eq('Id_Lab_Fin', Number(id)).select(CAMPOS_LABOR_FINAL).single()

  if (error) throw error
  return data
}

export async function cambiarEstadoLaborFinal(id, estado) {
  const { data, error } = await supabase.from('Dim_Labor_Final').update({ estado: Number(estado) })
    .eq('Id_Lab_Fin', Number(id)).select(CAMPOS_LABOR_FINAL).single()
  if (error) throw error
  return data
}
