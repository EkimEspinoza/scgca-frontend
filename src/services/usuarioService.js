import { supabase } from '../lib/supabase'

export {
  obtenerEmpresasParaUsuario,
  obtenerPermisos,
  guardarEmpresasUsuario,
} from './empresaService'

// ============================================================
// CREAR USUARIO
// ============================================================
//
// La creación se realiza mediante la Edge Function:
//
// crear-usuario
//
// La Edge Function se encarga de:
// - Crear el usuario en Supabase Auth.
// - Enviar la invitación por correo.
// - Crear/actualizar public.usuarios.
// - Asignar el permiso.
// - Asignar las empresas.
// - Mantener PENDIENTE como estado inicial.
//
// ============================================================

export async function crearUsuario(datos) {
  const {
    email,
    nombre,
    apellido,
    id_permiso,
    empresas = [],
  } = datos

  const emailNormalizado =
    email?.trim().toLowerCase()

  const nombreNormalizado =
    nombre?.trim()

  const apellidoNormalizado =
    apellido?.trim() || ''

  const permiso =
    Number(id_permiso)

  const empresasNormalizadas =
    Array.isArray(empresas)
      ? empresas.map(Number)
      : []

  // ============================================================
  // INVOCAR EDGE FUNCTION
  // ============================================================

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    'crear-usuario',
    {
      body: {
        email: emailNormalizado,
        nombre: nombreNormalizado,
        apellido: apellidoNormalizado,
        id_permiso: permiso,
        empresas: empresasNormalizadas,
      },
    },
  )

  // ============================================================
  // ERROR DE LA EDGE FUNCTION
  // ============================================================

  if (error) {
    console.error(
      'Error llamando Edge Function crear-usuario:',
      error,
    )

    let mensaje =
      error.message ||
      'No se pudo crear el usuario.'

    try {
      if (error.context) {
        const response =
          error.context

        if (
          typeof response.json ===
          'function'
        ) {
          const body =
            await response.json()

          if (body?.error) {
            mensaje = body.error
          }
        }
      }
    } catch (parseError) {
      console.error(
        'No se pudo interpretar el error de la Edge Function:',
        parseError,
      )
    }

    throw new Error(mensaje)
  }

  // ============================================================
  // ERROR DEVUELTO EN EL BODY
  // ============================================================

  if (data?.error) {
    throw new Error(data.error)
  }

  // ============================================================
  // RESPUESTA
  // ============================================================

  return data
}

// ============================================================
// OBTENER USUARIOS
// ============================================================

export async function obtenerUsuarios() {
  const {
    data,
    error,
  } = await supabase
    .from('usuarios')
    .select(`
      id_usuario,
      auth_user_id,
      nombre,
      apellido,
      estado,
      id_permiso,
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
    `)
    .order(
      'id_usuario',
      {
        ascending: true,
      },
    )

  if (error) {
    console.error(
      'Error obteniendo usuarios:',
      error,
    )

    throw error
  }

  return data ?? []
}

// ============================================================
// OBTENER USUARIO POR ID
// ============================================================

export async function obtenerUsuarioPorId(
  idUsuario,
) {
  const {
    data,
    error,
  } = await supabase
    .from('usuarios')
    .select(`
      id_usuario,
      auth_user_id,
      nombre,
      apellido,
      estado,
      id_permiso,
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
    `)
    .eq(
      'id_usuario',
      idUsuario,
    )
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

// ============================================================
// ACTUALIZAR USUARIO
// ============================================================

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

  const {
    data,
    error,
  } = await supabase
    .from('usuarios')
    .update({
      nombre:
        nombre?.trim() || '',
      apellido:
        apellido?.trim() || '',
      id_permiso:
        Number(id_permiso),
      estado,
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      'id_usuario',
      idUsuario,
    )
    .select(`
      id_usuario,
      auth_user_id,
      nombre,
      apellido,
      estado,
      id_permiso
    `)
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

// ============================================================
// ACTUALIZAR EMPRESAS DE USUARIO
// ============================================================

export async function actualizarEmpresasUsuario(
  idUsuario,
  empresas = [],
) {
  // ------------------------------------------------------------
  // Desactivar todas las asignaciones actuales
  // ------------------------------------------------------------

  const {
    error: errorDesactivar,
  } = await supabase
    .from('usuario_empresa')
    .update({
      estado: false,
    })
    .eq(
      'id_usuario',
      idUsuario,
    )

  if (errorDesactivar) {
    console.error(
      'Error desactivando empresas del usuario:',
      errorDesactivar,
    )

    throw errorDesactivar
  }

  // ------------------------------------------------------------
  // Si no hay empresas, terminamos
  // ------------------------------------------------------------

  if (
    !Array.isArray(empresas) ||
    empresas.length === 0
  ) {
    return []
  }

  // ------------------------------------------------------------
  // Obtener asignaciones existentes
  // ------------------------------------------------------------

  const {
    data: existentes,
    error: errorExistentes,
  } = await supabase
    .from('usuario_empresa')
    .select(`
      id_usuario_empresa,
      id_empresa
    `)
    .eq(
      'id_usuario',
      idUsuario,
    )

  if (errorExistentes) {
    console.error(
      'Error obteniendo empresas existentes:',
      errorExistentes,
    )

    throw errorExistentes
  }

  const empresasExistentes =
    existentes ?? []

  // ------------------------------------------------------------
  // Reactivar existentes o crear nuevas
  // ------------------------------------------------------------

  for (const idEmpresa of empresas) {
    const idEmpresaNumero =
      Number(idEmpresa)

    const existente =
      empresasExistentes.find(
        (item) =>
          Number(
            item.id_empresa,
          ) === idEmpresaNumero,
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
          'Error reactivando empresa:',
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
          id_usuario:
            idUsuario,
          id_empresa:
            idEmpresaNumero,
          estado: true,
        })

      if (errorInsertar) {
        console.error(
          'Error insertando empresa:',
          errorInsertar,
        )

        throw errorInsertar
      }
    }
  }

  // ------------------------------------------------------------
  // Retornar asignaciones activas
  // ------------------------------------------------------------

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
    .eq(
      'id_usuario',
      idUsuario,
    )
    .eq(
      'estado',
      true,
    )

  if (error) {
    console.error(
      'Error obteniendo empresas actualizadas:',
      error,
    )

    throw error
  }

  return data ?? []
}

// ============================================================
// GUARDAR EMPRESAS DE USUARIO
// ============================================================

export async function guardarUsuario(
  idUsuario,
  datos,
) {
  const usuario =
    await actualizarUsuario(
      idUsuario,
      datos,
    )

  if (
    Array.isArray(
      datos.empresas,
    )
  ) {
    await actualizarEmpresasUsuario(
      idUsuario,
      datos.empresas,
    )
  }

  return usuario
}