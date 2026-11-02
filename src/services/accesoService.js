import { supabase } from '../lib/supabase'

export async function obtenerModulos() {
  const { data, error } = await supabase
    .from('modulos')
    .select('id_modulo, codigo, nombre, grupo, ruta, orden, estado, created_at, updated_at')
    .order('grupo', { ascending: true })
    .order('nombre', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function crearModulo(modulo) {
  const { data, error } = await supabase
    .from('modulos')
    .insert({
      ...modulo,
      codigo: modulo.codigo.trim().toUpperCase(),
      nombre: modulo.nombre.trim(),
      grupo: modulo.grupo.trim(),
      ruta: modulo.ruta.trim(),
      updated_at: new Date().toISOString(),
    })
    .select('id_modulo, codigo, nombre, grupo, ruta, orden, estado')
    .single()

  if (error) throw error
  return data
}

export async function actualizarModulo(idModulo, cambios) {
  const { data, error } = await supabase
    .from('modulos')
    .update({
      nombre: cambios.nombre.trim(),
      grupo: cambios.grupo.trim(),
      ruta: cambios.ruta.trim(),
      orden: Number(cambios.orden),
      estado: Boolean(cambios.estado),
      updated_at: new Date().toISOString(),
    })
    .eq('id_modulo', idModulo)
    .select('id_modulo, codigo, nombre, grupo, ruta, orden, estado')
    .single()

  if (error) throw error
  return data
}

export async function actualizarEstadoModulo(idModulo, estado) {
  const { error } = await supabase
    .from('modulos')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id_modulo', idModulo)

  if (error) throw error
}

export async function obtenerUsuariosParaPermisos() {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id_usuario, nombre, apellido, estado, id_permiso, permiso:permiso(id_permiso, nombre, estado)')
    .order('nombre', { ascending: true })
    .order('apellido', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function obtenerAsignacionesUsuario(idUsuario) {
  const { data, error } = await supabase
    .from('usuario_modulo')
    .select('id_usuario_modulo, id_usuario, id_modulo, nivel, estado')
    .eq('id_usuario', Number(idUsuario))

  if (error) throw error
  return data ?? []
}

export async function guardarPermisosPorModulo(idUsuario, asignaciones) {
  const idUsuarioNumerico = Number(idUsuario)
  const marcaTiempo = new Date().toISOString()

  const { error: desactivarError } = await supabase
    .from('usuario_modulo')
    .update({ estado: false, updated_at: marcaTiempo })
    .eq('id_usuario', idUsuarioNumerico)

  if (desactivarError) throw desactivarError

  const asignacionesActivas = asignaciones
    .filter((asignacion) => ['QUERY', 'WRITER'].includes(asignacion.nivel))
    .map((asignacion) => ({
      id_usuario: idUsuarioNumerico,
      id_modulo: Number(asignacion.id_modulo),
      nivel: asignacion.nivel,
      estado: true,
      updated_at: marcaTiempo,
    }))

  if (asignacionesActivas.length === 0) return

  const { error: guardarError } = await supabase
    .from('usuario_modulo')
    .upsert(asignacionesActivas, { onConflict: 'id_usuario,id_modulo' })

  if (guardarError) throw guardarError
}
