import { supabase } from '../lib/supabase'

export async function obtenerEmpresas() {
  const { data, error } = await supabase
    .from('Dim_Empresa')
    .select(`
      id_empresa,
      descripcion,
      nombre_comercial,
      estado
    `)
    .eq('estado', true)
    .order('id_empresa')

  if (error) {
    throw error
  }

  return data
}