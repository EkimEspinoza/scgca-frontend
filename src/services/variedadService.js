import { supabase } from '../lib/supabase'


// =========================================================
// OBTENER TODAS LAS VARIEDADES
// =========================================================

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


// =========================================================
// CREAR VARIEDAD
// =========================================================

export async function crearVariedad(datos) {
  const { data, error } = await supabase
    .from('dim_variedad')
    .insert({
      descripcion: datos.descripcion.trim().toUpperCase(),
      estado: datos.estado ?? true,
    })
    .select(`
      id_variedad,
      descripcion,
      estado
    `)
    .single()

  if (error) {
    console.error(
      'Error creando variedad:',
      error,
    )

    throw error
  }

  return data
}


// =========================================================
// ACTUALIZAR VARIEDAD
// =========================================================

export async function actualizarVariedad(
  idVariedad,
  datos,
) {
  const { data, error } = await supabase
    .from('dim_variedad')
    .update({
      descripcion: datos.descripcion.trim().toUpperCase(),
      estado: datos.estado,
    })
    .eq('id_variedad', idVariedad)
    .select(`
      id_variedad,
      descripcion,
      estado
    `)
    .single()

  if (error) {
    console.error(
      'Error actualizando variedad:',
      error,
    )

    throw error
  }

  return data
}
// Cambia el estado activo/inactivo de una variedad sin eliminarla.
export async function cambiarEstadoVariedad(idVariedad, estado) {
  const { data, error } = await supabase
    .from('dim_variedad')
    .update({ estado })
    .eq('id_variedad', idVariedad)
    .select(`
      id_variedad,
      descripcion,
      estado
    `)
    .single()

  if (error) {
    console.error('Error cambiando estado de variedad:', error)
    throw error
  }

  return data
}
