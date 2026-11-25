// Gestiona estado y acciones de useUsuarioForm.
import { useEffect, useMemo, useState } from 'react'
import { esPermisoAdministrador, validarFormularioUsuario } from '../components/usuarios/usuarioRules'

const crearFormularioInicial = () => ({ email: '', nombre: '', apellido: '', id_permiso: '', estado: 'PENDIENTE', empresas: [] })

export default function useUsuarioForm({ open, usuario, permisos, guardando, onSave }) {
  const esEdicion = Boolean(usuario)
  const [formulario, setFormulario] = useState(crearFormularioInicial)
  const [errores, setErrores] = useState({})

  useEffect(() => {
    if (!open) return
    const empresasAsignadas = (usuario?.usuario_empresa ?? [])
      .filter((empresa) => empresa.estado === true)
      .map((empresa) => Number(empresa.id_empresa))

    // Se reinicia el borrador al abrir el diálogo o cambiar el usuario editado.
    setFormulario(usuario ? {
      email: usuario.email ?? '',
      nombre: usuario.nombre ?? '',
      apellido: usuario.apellido ?? '',
      id_permiso: usuario.id_permiso ? String(usuario.id_permiso) : '',
      estado: usuario.estado ?? 'PENDIENTE',
      empresas: empresasAsignadas,
    } : crearFormularioInicial())
    setErrores({})
  }, [open, usuario])

  const permisoSeleccionado = useMemo(
    () => permisos.find((permiso) => Number(permiso.id_permiso) === Number(formulario.id_permiso)),
    [permisos, formulario.id_permiso],
  )
  const esAdmin = esPermisoAdministrador(permisoSeleccionado?.nombre)

  const manejarCambio = (campo, valor) => {
    setFormulario((prev) => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: '' }))
  }

  const manejarPermiso = (event) => {
    const valor = event.target.value
    const permiso = permisos.find((item) => Number(item.id_permiso) === Number(valor))
    setFormulario((prev) => ({ ...prev, id_permiso: valor, empresas: permiso?.nombre === 'ADMIN' ? [] : prev.empresas }))
    if (errores.id_permiso) setErrores((prev) => ({ ...prev, id_permiso: '' }))
  }

  const validar = () => {
    const nuevosErrores = validarFormularioUsuario(formulario, { esEdicion, esAdmin })
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const manejarGuardar = async () => {
    if (!validar()) return
    await onSave({
      ...(esEdicion ? {} : { email: formulario.email.trim().toLowerCase() }),
      nombre: formulario.nombre.trim(),
      apellido: formulario.apellido.trim(),
      id_permiso: Number(formulario.id_permiso),
      estado: formulario.estado,
      empresas: esAdmin ? [] : formulario.empresas,
    })
  }

  return { esEdicion, formulario, errores, esAdmin, manejarCambio, manejarPermiso, manejarGuardar }
}
