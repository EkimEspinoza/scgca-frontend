import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  actualizarUsuarioConEmpresas as actualizarUsuarioConEmpresasService,
  crearUsuario as crearUsuarioService,
  obtenerEmpresasParaUsuario as obtenerEmpresasParaUsuarioService,
  obtenerPermisos as obtenerPermisosService,
  obtenerUsuarios as obtenerUsuariosService,
} from '../services/usuarioService'

const FILAS_POR_PAGINA = 10

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [permisos, setPermisos] = useState([])
  const [empresas, setEmpresas] = useState([])

  const [loading, setLoading] = useState(true)
  const [loadingMaestros, setLoadingMaestros] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const [pagina, setPagina] = useState(0)
  const [filasPorPagina, setFilasPorPagina] = useState(FILAS_POR_PAGINA)
  const [filtros, setFiltros] = useState({ buscar: '', estado: '', permiso: '', empresa: '' })
  const [modalAbierto, setModalAbierto] = useState(false)
  const [usuarioEditar, setUsuarioEditar] = useState(null)
  const [notificacion, setNotificacion] = useState({ open: false, mensaje: '', severity: 'success' })

  // ============================================================
  // CARGAR MAESTROS
  // ============================================================

  const cargarMaestros = useCallback(async () => {
    try {
      setLoadingMaestros(true)
      setError('')
      const [permisosData, empresasData] = await Promise.all([obtenerPermisosService(), obtenerEmpresasParaUsuarioService()])
      setPermisos(permisosData)
      setEmpresas(empresasData)
    } catch (err) {
      console.error('Error cargando maestros de usuarios:', err)
      setError('No se pudieron cargar los datos necesarios para gestionar usuarios.')
    } finally { setLoadingMaestros(false) }
  }, [])

  // ============================================================
  // CARGAR USUARIOS
  // ============================================================

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await obtenerUsuariosService()
      setUsuarios(data)
    } catch (err) {
      console.error('Error cargando usuarios:', err)
      setError('No se pudieron cargar los usuarios.')
    } finally { setLoading(false) }
  }, [])

  // ============================================================
  // CARGA INICIAL
  // ============================================================

  useEffect(() => {
    // Load remote data when the users screen mounts.
    // eslint-disable-next-line react/set-state-in-effect
    cargarMaestros()
    // eslint-disable-next-line react/set-state-in-effect
    cargarUsuarios()
  }, [cargarMaestros, cargarUsuarios])

  // ============================================================
  // NORMALIZAR TEXTO
  // ============================================================

  const normalizarTexto = (valor) => {
    return String(valor ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  // ============================================================
  // FILTROS
  // ============================================================

  const usuariosFiltrados = useMemo(() => {
    const buscar = normalizarTexto(filtros.buscar)
    return usuarios.filter((usuario) => {
      const nombreCompleto = `${usuario.nombre ?? ''} ${usuario.apellido ?? ''}`
      const permiso = usuario.permiso?.nombre ?? ''
      const empresasUsuario = usuario.usuario_empresa ?? []
      const coincideBuscar = !buscar || normalizarTexto(nombreCompleto).includes(buscar) || normalizarTexto(permiso).includes(buscar)
      const coincideEstado = !filtros.estado || usuario.estado === filtros.estado
      const coincidePermiso = !filtros.permiso || Number(usuario.id_permiso) === Number(filtros.permiso)
      const coincideEmpresa = !filtros.empresa || empresasUsuario.some((empresaUsuario) => empresaUsuario.estado === true && Number(empresaUsuario.id_empresa) === Number(filtros.empresa))
      return (coincideBuscar && coincideEstado && coincidePermiso && coincideEmpresa)
    })
  },
    [usuarios, filtros])

  // ============================================================
  // PAGINACIÓN
  // ============================================================

  const usuariosPaginados = useMemo(() => {
    const inicio = pagina * filasPorPagina
    const fin = inicio + filasPorPagina
    return usuariosFiltrados.slice(inicio, fin)
  }, [usuariosFiltrados, pagina, filasPorPagina])

  // ============================================================
  // CAMBIO DE FILTRO
  // ============================================================

  const handleFiltroChange = useCallback(
    (campo, valor) => {
      setFiltros((prev) => ({
        ...prev,
        [campo]: valor,
      }))
      setPagina(0)
    },
    [],
  )

  // ============================================================
  // LIMPIAR FILTROS
  // ============================================================

  const handleLimpiarFiltros =
    useCallback(() => {
      setFiltros({
        buscar: '',
        estado: '',
        permiso: '',
        empresa: '',
      })
      setPagina(0)
    }, [])

  // ============================================================
  // PAGINACIÓN
  // ============================================================

  const handleCambiarPagina =
    useCallback(
      (_event, nuevaPagina) => {
        setPagina(nuevaPagina)
      },
      [],
    )

  const handleCambiarFilasPorPagina =
    useCallback((event) => {
      setFilasPorPagina(parseInt(event.target.value, 10))
      setPagina(0)
    }, [])

  // ============================================================
  // NUEVO USUARIO
  // ============================================================

  const handleNuevo = useCallback(() => {
    setUsuarioEditar(null)
    setModalAbierto(true)
  }, [])

  // ============================================================
  // EDITAR USUARIO
  // ============================================================

  const handleEditar = useCallback(
    (usuario) => {
      setUsuarioEditar(usuario)
      setModalAbierto(true)
    },
    [],
  )

  // ============================================================
  // CERRAR MODAL
  // ============================================================

  const handleCerrarModal =
    useCallback(() => {
      setModalAbierto(false)
      setUsuarioEditar(null)
    }, [])

  // ============================================================
  // CERRAR NOTIFICACIÓN
  // ============================================================

  const cerrarNotificacion =
    useCallback(() => {
      setNotificacion((prev) => ({
        ...prev,
        open: false,
      }))
    }, [])

  // ============================================================
  // GUARDAR USUARIO
  // ============================================================

  const handleGuardar = useCallback(
    async (datos) => {
      try {
        setGuardando(true)
        setError('')
        // ========================================================
        // EDITAR USUARIO
        // ========================================================

        if (usuarioEditar) {
          await actualizarUsuarioConEmpresasService(
            usuarioEditar.id_usuario,
            datos,
          )

          setNotificacion({
            open: true,
            mensaje: 'Usuario actualizado correctamente.',
            severity: 'success'
          })
        }

        // ========================================================
        // NUEVO USUARIO
        // ========================================================
        //
        // La creación se realiza mediante la Edge Function.
        //
        // La Edge Function será responsable de:
        // - Crear el usuario en Supabase Auth.
        // - Enviar la invitación por email.
        // - Crear/actualizar public.usuarios.
        // - Asignar el permiso.
        // - Asignar las empresas.
        // - Mantener el estado inicial PENDIENTE.
        //
        // ========================================================

        else {
          await crearUsuarioService({
            email: datos.email,
            nombre: datos.nombre,
            apellido: datos.apellido,
            id_permiso: Number(datos.id_permiso),
            empresas: Array.isArray(datos.empresas) ? datos.empresas : [],
          })

          setNotificacion({
            open: true,
            mensaje: 'Usuario invitado correctamente. Se envió un correo para que configure su contraseña.',
            severity: 'success',
          })
        }

        // ========================================================
        // CERRAR MODAL
        // ========================================================

        setModalAbierto(false)
        setUsuarioEditar(null)

        // ========================================================
        // RECARGAR LISTADO
        // ========================================================

        await cargarUsuarios()
      } catch (err) {
        console.error('Error guardando usuario:', err)
        const mensajeError = err?.message || 'No se pudo guardar el usuario.'
        setError(mensajeError)
        setNotificacion({
          open: true,
          mensaje: mensajeError,
          severity: 'error',
        })
      } finally { setGuardando(false) }
    },
    [usuarioEditar, cargarUsuarios])

  // ============================================================
  // RETURN
  // ============================================================

  return {
    usuarios,
    usuariosPaginados,
    usuariosFiltrados,

    permisos,
    empresas,

    loading,
    loadingMaestros,
    guardando,
    error,

    pagina,
    filasPorPagina,

    filtros,

    modalAbierto,
    usuarioEditar,

    notificacion,

    handleFiltroChange,
    handleLimpiarFiltros,

    handleCambiarPagina,
    handleCambiarFilasPorPagina,

    handleNuevo,
    handleEditar,
    handleCerrarModal,

    handleGuardar,

    cerrarNotificacion,
  }
}

export default useUsuarios