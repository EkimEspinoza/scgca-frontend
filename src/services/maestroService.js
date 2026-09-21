import { supabase } from '../lib/supabase'


export async function obtenerTiposCentroCosto() {
  const { data, error } = await supabase
    .from('Dim_TipoCC')
    .select(`
      id_tip_cc,
      des_tip_cc,
      estado
    `)
    .order('des_tip_cc', {
      ascending: true,
    })

  if (error) {
    console.error(
      'Error cargando tipos de centro de costo:',
      error,
    )

    throw error
  }

  return data ?? []
}


export async function obtenerTiposMaquinaria() {
  const { data, error } = await supabase
    .from('dim_tipo_maq')
    .select(`
      id_tipo_maq,
      des_tipo_maquinaria,
      estado
    `)
    .order('des_tipo_maquinaria', {
      ascending: true,
    })

  if (error) {
    console.error(
      'Error cargando tipos de maquinaria:',
      error,
    )

    throw error
  }

  return data ?? []
}


export async function obtenerComparativos() {
  const { data, error } = await supabase
    .from('dim_comparativo')
    .select(`
      id_comparativo,
      descripcion,
      estado
    `)
    .order('descripcion', {
      ascending: true,
    })

  if (error) {
    console.error(
      'Error cargando comparativos:',
      error,
    )

    throw error
  }

  return data ?? []
}


export async function obtenerVariedades() {
  const { data, error } = await supabase
    .from('dim_variedad')
    .select(`
      id_variedad,
      descripcion,
      estado
    `)
    .order('descripcion', {
      ascending: true,
    })

  if (error) {
    console.error(
      'Error cargando variedades:',
      error,
    )

    throw error
  }

  return data ?? []
}