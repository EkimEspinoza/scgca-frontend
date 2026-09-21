import { supabase } from '../lib/supabase'


/*
 * Obtener todos los usuarios
 */
export async function obtenerUsuarios() {
  const { data, error } = await supabase
    .from('usuarios')
    .select(
      `
        id_usuario,
        auth_user_id,
        nombre,
        apellido,
        id_permiso,
        estado,
        created_at,
        updated_at,

        permiso:permiso(
          id_permiso,
          nombre,
          descripcion,
          estado
        ),

        usuario_empresa(
          id_usuario_empresa,
          id_empresa,
          estado,

          empresa:Dim_Empresa(
            id_empresa,
            descripcion,
            nombre_comercial,
            estado
          )
        )
      `,
    )
    .order('nombre', { ascending: true })
    .order('apellido', { ascending: true })

  if (error) {
    console.error('Error cargando usuarios:', error)
    throw error
  }

  return data ?? []
}


/*
 * Obtener un usuario por ID
 */
export async function obtenerUsuarioPorId(idUsuario) {
  const { data, error } = await supabase
    .from('usuarios')
    .select(
      `
        id_usuario,
        auth_user_id,
        nombre,
        apellido,
        id_permiso,
        estado,
        created_at,
        updated_at,

        permiso:permiso(
          id_permiso,
          nombre,
          descripcion,
          estado
        ),

        usuario_empresa(
          id_usuario_empresa,
          id_empresa,
          estado
        )
      `,
    )
    .eq('id_usuario', idUsuario)
    .single()

  if (error) {
    console.error(
      'Error obteniendo usuario:',
      error,
    )

    throw error
  }

  return data
}


/*
 * Actualizar información del usuario
 *
 * IMPORTANTE:
 * auth_user_id NO se modifica.
 */
export async function actualizarUsuario(
  idUsuario,
  datos,
) {
  const {
    nombre,
    apellido,
    id_permiso,
    estado,
  } = datos

  const { data, error } = await supabase
    .from('usuarios')
    .update({
      nombre: nombre?.trim(),
      apellido: apellido?.trim() || null,
      id_permiso,
      estado,
      updated_at: new Date().toISOString(),
    })
    .eq('id_usuario', idUsuario)
    .select(
      `
        id_usuario,
        auth_user_id,
        nombre,
        apellido,
        id_permiso,
        estado,
        created_at,
        updated_at,

        permiso:permiso(
          id_permiso,
          nombre,
          descripcion,
          estado
        )
      `,
    )
    .single()

  if (error) {
    console.error(
      'Error actualizando usuario:',
      error,
    )

    throw error
  }

  return data
}


/*
 * Actualizar empresas asignadas al usuario
 *
 * La estrategia es:
 *
 * 1. Desactivar las asignaciones actuales.
 * 2. Crear/reactivar las nuevas asignaciones.
 *
 * ADMIN no necesita registros en usuario_empresa,
 * porque tiene acceso a todas las empresas mediante RLS.
 */
export async function actualizarEmpresasUsuario(
  idUsuario,
  empresas,
) {
  const empresasIds = [
    ...new Set(
      (empresas ?? []).map(Number),
    ),
  ]


  /*
   * Primero desactivamos todas las asignaciones
   * actuales del usuario.
   */
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


  /*
   * Si no hay empresas nuevas,
   * terminamos aquí.
   */
  if (empresasIds.length === 0) {
    return []
  }


  /*
   * Revisamos si ya existen registros
   * para evitar duplicados.
   */
  const { data: existentes, error: errorExistentes } =
    await supabase
      .from('usuario_empresa')
      .select(
        `
          id_usuario_empresa,
          id_usuario,
          id_empresa,
          estado
        `,
      )
      .eq('id_usuario', idUsuario)
      .in('id_empresa', empresasIds)

  if (errorExistentes) {
    console.error(
      'Error consultando asignaciones existentes:',
      errorExistentes,
    )

    throw errorExistentes
  }


  const mapaExistentes = new Map(
    (existentes ?? []).map(
      (registro) => [
        Number(registro.id_empresa),
        registro,
      ],
    ),
  )


  /*
   * Reactivar registros existentes
   * o crear los que no existen.
   */
  for (const idEmpresa of empresasIds) {
    const existente =
      mapaExistentes.get(idEmpresa)

    if (existente) {
      const {
        error,
      } = await supabase
        .from('usuario_empresa')
        .update({
          estado: true,
        })
        .eq(
          'id_usuario_empresa',
          existente.id_usuario_empresa,
        )

      if (error) {
        console.error(
          'Error reactivando empresa:',
          error,
        )

        throw error
      }
    } else {
      const {
        error,
      } = await supabase
        .from('usuario_empresa')
        .insert({
          id_usuario: idUsuario,
          id_empresa: idEmpresa,
          estado: true,
        })

      if (error) {
        console.error(
          'Error asignando empresa:',
          error,
        )

        throw error
      }
    }
  }


  /*
   * Devolvemos las asignaciones activas.
   */
  const {
    data,
    error,
  } = await supabase
    .from('usuario_empresa')
    .select(
      `
        id_usuario_empresa,
        id_usuario,
        id_empresa,
        estado
      `,
    )
    .eq('id_usuario', idUsuario)
    .eq('estado', true)

  if (error) {
    console.error(
      'Error obteniendo empresas asignadas:',
      error,
    )

    throw error
  }

  return data ?? []
}


/*
 * Guardar usuario + empresas
 *
 * Esta función será utilizada por el formulario.
 */
export async function guardarUsuario(
  idUsuario,
  datos,
  empresas,
) {
  const usuarioActualizado =
    await actualizarUsuario(
      idUsuario,
      datos,
    )


  /*
   * Si el usuario es ADMIN,
   * no necesitamos asignarle empresas.
   */
  if (Number(datos.id_permiso) === 1) {
    await actualizarEmpresasUsuario(
      idUsuario,
      [],
    )
  } else {
    await actualizarEmpresasUsuario(
      idUsuario,
      empresas,
    )
  }


  return usuarioActualizado
}