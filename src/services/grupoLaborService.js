import { supabase } from '../lib/supabase'

const CAMPOS_GRUPO_LABOR = `
  Id_Grupo_Labor,
  DescripcionLabor,
  TIPO_GRUPO,
  estado,
  created_at,
  updated_at
`

export async function obtenerGruposLabor() {
  const { data, error } = await supabase
    .from('Dim_GrupoLabor')
    .select(CAMPOS_GRUPO_LABOR)
    .order('Id_Grupo_Labor', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function crearGrupoLabor(datos) {
  const descripcion = datos.DescripcionLabor?.trim()
  if (!descripcion) throw new Error('La descripción del grupo de labor es obligatoria.')

  const { data, error } = await supabase
    .from('Dim_GrupoLabor')
    .insert({ DescripcionLabor: descripcion, TIPO_GRUPO: Number(datos.TIPO_GRUPO), estado: 1 })
    .select(CAMPOS_GRUPO_LABOR)
    .single()

  if (error) throw error
  return data
}

export async function actualizarGrupoLabor(id, datos) {
  const descripcion = datos.DescripcionLabor?.trim()
  if (!descripcion) throw new Error('La descripción del grupo de labor es obligatoria.')

  const { data, error } = await supabase
    .from('Dim_GrupoLabor')
    .update({ DescripcionLabor: descripcion, TIPO_GRUPO: Number(datos.TIPO_GRUPO) })
    .eq('Id_Grupo_Labor', Number(id))
    .select(CAMPOS_GRUPO_LABOR)
    .single()

  if (error) throw error
  return data
}

export async function cambiarEstadoGrupoLabor(id, estado) {
  const { data, error } = await supabase
    .from('Dim_GrupoLabor')
    .update({ estado: Number(estado) })
    .eq('Id_Grupo_Labor', Number(id))
    .select(CAMPOS_GRUPO_LABOR)
    .single()

  if (error) throw error
  return data
}
