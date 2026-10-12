import { supabase } from '../lib/supabase'

/*
 * Obtener empresas activas
 *
 * Se utiliza para selectores y otros módulos
 * que solo necesitan empresas disponibles.
 */
export async function obtenerEmpresas() {
  const { data, error } = await supabase
    .from('Dim_Empresa')
    .select(`
      id_empresa,
      descripcion,
      nombre_comercial,
      estado,
      created_at,
      updated_at
    `)
    .eq('estado', true)
    .order('id_empresa')

  if (error) {
    console.error(
      'Error obteniendo empresas activas:',
      error,
    )
    throw error
  }

  return data ?? []
}

/*
 * Obtener todas las empresas
 *
 * Esta función es para el módulo administrativo
 * de Empresas.
 */
export async function obtenerTodasLasEmpresas() {
  const { data, error } = await supabase
    .from('Dim_Empresa')
    .select(`
      id_empresa,
      descripcion,
      nombre_comercial,
      estado,
      created_at,
      updated_at
    `)
    .order('id_empresa')

  if (error) {
    console.error(
      'Error obteniendo empresas:',
      error,
    )
    throw error
  }

  return data ?? []
}

/*
 * Obtener permisos disponibles
 */
export async function obtenerPermisos() {
  const { data, error } = await supabase
    .from('permiso')
    .select(`
      id_permiso,
      nombre,
      descripcion,
      estado,
      created_at
    `)
    .eq('estado', true)
    .order('id_permiso')

  if (error) {
    console.error(
      'Error obteniendo permisos:',
      error,
    )
    throw error
  }

  return data ?? []
}

/*
 * Obtener empresas vigentes para asignación a usuarios
 */
export async function obtenerEmpresasParaUsuario() {
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
    console.error(
      'Error obteniendo empresas para usuario:',
      error,
    )
    throw error
  }

  return data ?? []
}

/*
 * Guardar asignación de empresas a un usuario
 */
export async function guardarEmpresasUsuario(
  idUsuario,
  empresas = [],
) {
  const { error: errorDesactivar } =
    await supabase
      .from('usuario_empresa')
      .update({
        estado: false,
      })
      .eq('id_usuario', idUsuario)

  if (errorDesactivar) {
    console.error(
      'Error desactivando empresas del usuario:',
      errorDesactivar,
    )
    throw errorDesactivar
  }

  if (
    !Array.isArray(empresas) ||
    empresas.length === 0
  ) {
    return []
  }

  const {
    data: existentes,
    error: errorExistentes,
  } = await supabase
    .from('usuario_empresa')
    .select(`
      id_usuario_empresa,
      id_empresa
    `)
    .eq('id_usuario', idUsuario)

  if (errorExistentes) {
    console.error(
      'Error obteniendo empresas existentes:',
      errorExistentes,
    )
    throw errorExistentes
  }

  const empresasExistentes =
    existentes ?? []

  for (const idEmpresa of empresas) {
    const idEmpresaNumero =
      Number(idEmpresa)

    const existente =
      empresasExistentes.find(
        (item) =>
          Number(item.id_empresa) ===
          idEmpresaNumero,
      )

    if (existente) {
      const {
        error: errorActualizar,
      } = await supabase
        .from('usuario_empresa')
        .update({
          estado: true,
        })
        .eq(
          'id_usuario_empresa',
          existente.id_usuario_empresa,
        )

      if (errorActualizar) {
        console.error(
          'Error reactivando empresa del usuario:',
          errorActualizar,
        )
        throw errorActualizar
      }
    } else {
      const {
        error: errorInsertar,
      } = await supabase
        .from('usuario_empresa')
        .insert({
          id_usuario: idUsuario,
          id_empresa: idEmpresaNumero,
          estado: true,
        })

      if (errorInsertar) {
        console.error(
          'Error insertando empresa del usuario:',
          errorInsertar,
        )
        throw errorInsertar
      }
    }
  }

  const {
    data,
    error,
  } = await supabase
    .from('usuario_empresa')
    .select(`
      id_usuario_empresa,
      id_usuario,
      id_empresa,
      estado
    `)
    .eq('id_usuario', idUsuario)
    .eq('estado', true)

  if (error) {
    console.error(
      'Error obteniendo empresas actualizadas del usuario:',
      error,
    )
    throw error
  }

  return data ?? []
}

/*
 * Crear empresa
 */
export async function crearEmpresa(
  datos,
) {
  const descripcion =
    datos.descripcion?.trim()

  const nombreComercial =
    datos.nombre_comercial?.trim().toUpperCase()

  if (!descripcion) {
    throw new Error(
      'La descripción de la empresa es obligatoria.',
    )
  }

  if (!nombreComercial) {
    throw new Error(
      'El nombre comercial es obligatorio.',
    )
  }

  const {
    data,
    error,
  } = await supabase
    .from('Dim_Empresa')
    .insert({
      descripcion,
      nombre_comercial:
        nombreComercial,
      estado:
        typeof datos.estado ===
        'boolean'
          ? datos.estado
          : true,
    })
    .select(`
      id_empresa,
      descripcion,
      nombre_comercial,
      estado,
      created_at,
      updated_at
    `)
    .single()

  if (error) {
    console.error(
      'Error creando empresa:',
      error,
    )
    throw error
  }

  return data
}

/*
 * Actualizar empresa
 */
export async function actualizarEmpresa(
  idEmpresa,
  datos,
) {
  const descripcion =
    datos.descripcion?.trim()

  const nombreComercial =
    datos.nombre_comercial?.trim().toUpperCase()

  if (!descripcion) {
    throw new Error(
      'La descripción de la empresa es obligatoria.',
    )
  }

  if (!nombreComercial) {
    throw new Error(
      'El nombre comercial es obligatorio.',
    )
  }

  const {
    data,
    error,
  } = await supabase
    .from('Dim_Empresa')
    .update({
      descripcion,
      nombre_comercial:
        nombreComercial,
      estado:
        typeof datos.estado ===
        'boolean'
          ? datos.estado
          : true,
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      'id_empresa',
      idEmpresa,
    )
    .select(`
      id_empresa,
      descripcion,
      nombre_comercial,
      estado,
      created_at,
      updated_at
    `)
    .single()

  if (error) {
    console.error(
      'Error actualizando empresa:',
      error,
    )
    throw error
  }

  return data
}

/*
 * Cambiar estado de una empresa
 */
export async function cambiarEstadoEmpresa(
  idEmpresa,
  estado,
) {
  const {
    data,
    error,
  } = await supabase
    .from('Dim_Empresa')
    .update({
      estado,
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      'id_empresa',
      idEmpresa,
    )
    .select(`
      id_empresa,
      descripcion,
      nombre_comercial,
      estado,
      created_at,
      updated_at
    `)
    .single()

  if (error) {
    console.error(
      'Error cambiando estado de empresa:',
      error,
    )
    throw error
  }

  return data
}