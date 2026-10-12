import { supabase } from '../lib/supabase'


/*
 * =========================================================
 * OBTENER TIPOS DE MAQUINARIA
 * =========================================================
 */

export async function obtenerTiposMaquinaria() {

  const { data, error } = await supabase
    .from('dim_tipo_maq')
    .select(`
      id_tipo_maq,
      des_tipo_maquinaria,
      estado,
      created_at,
      updated_at
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


/*
 * =========================================================
 * CREAR TIPO DE MAQUINARIA
 * =========================================================
 */

export async function crearTipoMaquinaria(datos) {

  const descripcion =
    datos.des_tipo_maquinaria
      ?.trim()
      .toUpperCase()


  if (!descripcion) {

    throw new Error(
      'La descripción del tipo de maquinaria es obligatoria.',
    )
  }


  const { data, error } = await supabase
    .from('dim_tipo_maq')
    .insert({
      des_tipo_maquinaria: descripcion,
      estado: datos.estado ?? true,
    })
    .select(`
      id_tipo_maq,
      des_tipo_maquinaria,
      estado,
      created_at,
      updated_at
    `)
    .single()


  if (error) {

    console.error(
      'Error creando tipo de maquinaria:',
      error,
    )

    throw error
  }

  return data
}


/*
 * =========================================================
 * ACTUALIZAR TIPO DE MAQUINARIA
 * =========================================================
 */

export async function actualizarTipoMaquinaria(
  idTipoMaquinaria,
  datos,
) {

  const descripcion =
    datos.des_tipo_maquinaria
      ?.trim()
      .toUpperCase()


  if (!descripcion) {

    throw new Error(
      'La descripción del tipo de maquinaria es obligatoria.',
    )
  }


  const { data, error } = await supabase
    .from('dim_tipo_maq')
    .update({
      des_tipo_maquinaria: descripcion,
      estado: datos.estado,
      updated_at: new Date().toISOString(),
    })
    .eq(
      'id_tipo_maq',
      idTipoMaquinaria,
    )
    .select(`
      id_tipo_maq,
      des_tipo_maquinaria,
      estado,
      created_at,
      updated_at
    `)
    .single()


  if (error) {

    console.error(
      'Error actualizando tipo de maquinaria:',
      error,
    )

    throw error
  }

  return data
}