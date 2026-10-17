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
// ACTUALIZAR USUARIO Y EMPRESAS EN UNA SOLA TRANSACCIÓN
// ============================================================

export async function actualizarUsuarioConEmpresas(idUsuario, datos) {
  const empresas = Array.isArray(datos.empresas)
    ? datos.empresas.map(Number)
    : []

  const { data, error } = await supabase.functions.invoke(
    'actualizar-usuario',
    {
      body: {
        id_usuario: Number(idUsuario),
        nombre: datos.nombre?.trim() || '',
        apellido: datos.apellido?.trim() || '',
        id_permiso: Number(datos.id_permiso),
        estado: datos.estado,
        empresas,
      },
    },
  )

  if (error) {
    console.error('Error llamando Edge Function actualizar-usuario:', error)

    let mensaje = error.message || 'No se pudo actualizar el usuario y sus empresas.'

    try {
      if (error.context && typeof error.context.json === 'function') {
        const body = await error.context.json()
        if (body?.error) mensaje = body.error
      }
    } catch (parseError) {
      console.error('No se pudo interpretar el error de actualizar-usuario:', parseError)
    }

    throw new Error(mensaje)
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  return data
}
