import { supabase } from '../lib/supabase'

/**
 * Obtiene todos los tipos de centro de costo.
 */
export async function obtenerTiposCentroCosto() {
  const { data, error } = await supabase
    .from('Dim_TipoCC')
    .select(`
      id_tip_cc,
      des_tip_cc,
      estado,
      created_at,
      updated_at
    `)
    .order('des_tip_cc', {
      ascending: true,
    })

  if (error) {
    console.error('Error cargando tipos de centro de costo:', error)
    throw error
  }

  return data ?? []
}

/**
 * Crea un nuevo tipo de centro de costo.
 */
export async function crearTipoCentroCosto(datos) {
  const descripcion = datos.des_tip_cc
    ?.trim()
    .toUpperCase()

  if (!descripcion) {
    throw new Error(
      'La descripción del tipo de centro de costo es obligatoria.'
    )
  }

  const { data, error } = await supabase
    .from('Dim_TipoCC')
    .insert({
      des_tip_cc: descripcion,
      estado: datos.estado ?? true,
    })
    .select(`
      id_tip_cc,
      des_tip_cc,
      estado,
      created_at,
      updated_at
    `)
    .single()

  if (error) {
    console.error('Error creando tipo de centro de costo:', error)
    throw error
  }

  return data
}

/**
 * Actualiza un tipo de centro de costo.
 */
export async function actualizarTipoCentroCosto(idTipoCc, datos) {
  const descripcion = datos.des_tip_cc
    ?.trim()
    .toUpperCase()

  if (!descripcion) {
    throw new Error(
      'La descripción del tipo de centro de costo es obligatoria.'
    )
  }

  const { data, error } = await supabase
    .from('Dim_TipoCC')
    .update({
      des_tip_cc: descripcion,
      estado: datos.estado,
      updated_at: new Date().toISOString(),
    })
    .eq('id_tip_cc', idTipoCc)
    .select(`
      id_tip_cc,
      des_tip_cc,
      estado,
      created_at,
      updated_at
    `)
    .single()

  if (error) {
    console.error('Error actualizando tipo de centro de costo:', error)
    throw error
  }

  return data
}
/**
 * Cambia el estado activo/inactivo de un tipo de centro de costo.
 */
export async function cambiarEstadoTipoCentroCosto(idTipoCc, estado) {
  const { data, error } = await supabase
    .from('Dim_TipoCC')
    .update({
      estado,
      updated_at: new Date().toISOString(),
    })
    .eq('id_tip_cc', idTipoCc)
    .select(`
      id_tip_cc,
      des_tip_cc,
      estado,
      created_at,
      updated_at
    `)
    .single()

  if (error) {
    console.error('Error cambiando estado del tipo de centro de costo:', error)
    throw error
  }

  return data
}
