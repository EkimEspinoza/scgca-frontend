export function esPermisoAdministrador(nombrePermiso) {
  return nombrePermiso === 'ADMIN'
}

export function validarFormularioUsuario(formulario, { esEdicion = false, esAdmin = false } = {}) {
  const errores = {}
  const email = String(formulario.email ?? '').trim()
  const nombre = String(formulario.nombre ?? '').trim()
  const idPermiso = formulario.id_permiso
  const empresas = Array.isArray(formulario.empresas) ? formulario.empresas : []

  if (!esEdicion) {
    if (!email) {
      errores.email = 'Ingresa el correo electrónico.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errores.email = 'Ingresa un correo electrónico válido.'
    }
  }

  if (!nombre) {
    errores.nombre = 'Ingresa el nombre.'
  }

  if (!idPermiso) {
    errores.id_permiso = 'Selecciona un permiso.'
  }

  if (!esAdmin && empresas.length === 0) {
    errores.empresas = 'Selecciona al menos una empresa.'
  }

  return errores
}
