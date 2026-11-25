// Encapsula las operaciones de datos de laborService.
import { supabase } from '../lib/supabase'

const CAMPOS_LABOR = 'Id_Lab, Lab_SCIRE, Id_Lab_Fin, estado, created_at, updated_at'

export async function obtenerLabores() {
  const pageSize = 1000
  const labores = []
  for (let desde = 0; ; desde += pageSize) {
    const { data, error } = await supabase.from('Dim_Labor').select(CAMPOS_LABOR)
      .order('Id_Lab', { ascending: true }).range(desde, desde + pageSize - 1)
    if (error) throw error
    labores.push(...(data ?? []))
    if (!data || data.length < pageSize) return labores
  }
}

export async function crearLabor(datos) {
  const nombre = datos.Lab_SCIRE?.trim()
  if (!nombre) throw new Error('El nombre de la labor es obligatorio.')
  if (!datos.Id_Lab_Fin) throw new Error('Selecciona una labor final.')

  const { data, error } = await supabase.from('Dim_Labor').insert({
    Lab_SCIRE: nombre,
    Id_Lab_Fin: Number(datos.Id_Lab_Fin),
    estado: 1,
  }).select(CAMPOS_LABOR).single()

  if (error) throw error
  return data
}

export async function actualizarLabor(id, datos) {
  const nombre = datos.Lab_SCIRE?.trim()
  if (!nombre) throw new Error('El nombre de la labor es obligatorio.')
  if (!datos.Id_Lab_Fin) throw new Error('Selecciona una labor final.')

  const { data, error } = await supabase.from('Dim_Labor').update({
    Lab_SCIRE: nombre,
    Id_Lab_Fin: Number(datos.Id_Lab_Fin),
  }).eq('Id_Lab', Number(id)).select(CAMPOS_LABOR).single()

  if (error) throw error
  return data
}

export async function cambiarEstadoLabor(id, estado) {
  const { data, error } = await supabase.from('Dim_Labor').update({ estado: Number(estado) })
    .eq('Id_Lab', Number(id)).select(CAMPOS_LABOR).single()
  if (error) throw error
  return data
}
