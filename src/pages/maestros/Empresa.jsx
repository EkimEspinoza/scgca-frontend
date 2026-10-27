// =========================================================
// IMPORTS
// =========================================================

import { useEffect, useRef, useMemo, useState } from 'react'

import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, Paper, Snackbar, TextField, Typography, Tooltip
} from '@mui/material'

import { Add, Close, Edit, Save } from '@mui/icons-material'

import { obtenerTodasLasEmpresas, crearEmpresa, actualizarEmpresa } from '../../services/empresaService'

import SearchInput from '../../components/common/SearchInput'
import StatusChip from '../../components/common/StatusChip'
import Pagination from '../../components/common/Pagination'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'

const formularioInicial = { descripcion: '', nombre_comercial: '', estado: true }

function Empresas() {
  const [empresas, setEmpresas] = useState([])
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null)

  // =========================================================
  // DATOS - DIÁLOGO - FORMULARIO - BÚSQUEDA - PAGINACIÓN&& NO EDITABLE
  // =========================================================

  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)

  const [formulario, setFormulario] = useState(formularioInicial)
  const [erroresFormulario, setErroresFormulario] = useState({})

  const [busqueda, setBusqueda] = useState('')

  const [pagina, setPagina] = useState(0)
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10)

  const cargaInicialIniciada = useRef(false)

  // =========================================================
  // CARGAR EMPRESAS
  // =========================================================

  const cargarEmpresas = async () => {
    try {
      setLoading(true)
      setError('')
      const data =
        await obtenerTodasLasEmpresas()
      setEmpresas(data || [])
    }
    catch (err) {
      console.error('Error cargando empresas:', err)
      setError('No se pudieron cargar las empresas.')
    }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (cargaInicialIniciada.current) { return }
    cargaInicialIniciada.current = true
    cargarEmpresas()
  }, [])

  // =========================================================
  // DATOS FILTRADOS
  // =========================================================

  const empresasFiltrados =
    useMemo(() => {
      const texto = busqueda.trim().toLowerCase()
      if (!texto) { return empresas }
      return empresas.filter(
        (empresas) =>
          empresas.descripcion?.toLowerCase().includes(texto))
    },
      [empresas, busqueda])

  // =========================================================
  // DATOS PAGINADOS 
  // =========================================================

  const empresasPaginados =
    useMemo(() => {
      const inicio = pagina * registrosPorPagina
      const fin = inicio + registrosPorPagina
      return empresasFiltrados.slice(inicio, fin)
    }, [empresasFiltrados, pagina, registrosPorPagina])

  // =========================================================
  // CAMBIO DE BÚSQUEDA - CAMBIO DE PÁGINA - CAMBIO DE REGISTROS POR PÁGINA && NO EDITABLE
  // =========================================================

  const handleCambioBusqueda = (
    event,
  ) => {
    setBusqueda(event.target.value)
    setPagina(0)
  }

  const handleChangePagina = (
    event,
    nuevaPagina,
  ) => {
    setPagina(nuevaPagina)
  }

  const handleChangeRegistrosPorPagina = (
    event
  ) => {
    setRegistrosPorPagina(
      parseInt(
        event.target.value, 10))
    setPagina(0)
  }

  // =========================================================
  // ABRIR NUEVA EMPRESA
  // =========================================================

  const handleNuevaEmpresa = () => {
    setModoEdicion(false)
    setEmpresaSeleccionada(null)
    setFormulario({
      ...formularioInicial,
      estado: true,
    })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  // =========================================================
  // ABRIR EDICIÓN
  // =========================================================

  const handleEditarEmpresa = (
    empresa,
  ) => {
    setModoEdicion(true)
    setEmpresaSeleccionada(empresa)
    setFormulario({
      descripcion: empresa.descripcion || '',
      nombre_comercial: (empresa.nombre_comercial || '').toUpperCase(),
      estado: empresa.estado ?? true,
    })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  // =========================================================
  // CERRAR DIALOG
  // =========================================================

  const handleCerrarDialog = () => {
    if (guardando) return
    setDialogOpen(false)
    setEmpresaSeleccionada(null)
    setFormulario(formularioInicial)
    setErroresFormulario({})
  }

  // =========================================================
  // CAMBIAR CAMPOS
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target
    const nuevoValor = name === 'nombre_comercial'
      ? value.toUpperCase()
      : value
    setFormulario((prev) => ({ ...prev, [name]: nuevoValor }))
    setErroresFormulario((prev) => ({ ...prev, [name]: '' }))
  }

  // =========================================================
  // CAMBIAR ESTADO && NO EDITABLE
  // =========================================================

  const handleCambiarEstadoFormulario =
    () => {
      setFormulario((prev) => ({
        ...prev,
        estado: !prev.estado,
      }))
    }

  // =========================================================
  // VALIDAR FORMULARIO
  // =========================================================

  const validarFormulario = () => {
    const nuevosErrores = {}
    if (!formulario.descripcion.trim()) { nuevosErrores.descripcion = 'La descripción es obligatoria.' }
    if (!formulario.nombre_comercial.trim()) { nuevosErrores.nombre_comercial = 'El nombre comercial es obligatorio.' }
    setErroresFormulario(nuevosErrores)
    return (Object.keys(nuevosErrores).length === 0)
  }

  // =========================================================
  // GUARDAR EMPRESA
  // =========================================================

  const handleGuardar = async () => {
    if (!validarFormulario()) { return }
    try {
      setGuardando(true)
      setError('')
      const datos = {
        descripcion: formulario.descripcion.trim(),
        nombre_comercial: formulario.nombre_comercial.trim().toUpperCase(),
        estado: formulario.estado
      }

      if (modoEdicion) {
        await actualizarEmpresa(empresaSeleccionada.id_empresa, datos)
        setMensaje('Empresa actualizada correctamente.')
      }
      else {
        await crearEmpresa(datos)
        setMensaje('Empresa creada correctamente.')
      }
      setDialogOpen(false)
      await cargarEmpresas()
    }
    catch (err) {
      console.error('Error guardando empresa:', err)
      setError(err?.message || 'No se pudo guardar la empresa.')
    }
    finally { setGuardando(false) }
  }

  // =========================================================
  // CERRAR MENSAJES && NO EDITABLE
  // =========================================================

  const handleCerrarMensaje = () => { setMensaje('') }
  const handleCerrarError = () => { setError('') }

  // =========================================================
  // COLUMNAS DEL DATATABLE
  // =========================================================

  const columnas = [
    {
      key: 'descripcion',
      label: 'Empresa',
      height: '100%',
      width: 'auto',
      whiteSpace: 'nowrap',
      cellSx: {
        position: 'relative', pl: 1.5,
        '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: '0 0px 0px 0', backgroundColor: '#2E7D32' }
      },
      render: (empresa) => (
        <Box sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>
            {empresa.descripcion}
          </Typography>
        </Box>
      )
    },

    {
      key: 'nombre_comercial',
      label: 'Nombre comercial',
      width: 'auto',
      whiteSpace: 'nowrap',
      render: (empresa) => (
        <Typography color="text.primary">
          {empresa.nombre_comercial}
        </Typography>
      )
    },

    {
      key: 'estado',
      label: 'Estado',
      width: 'auto',
      whiteSpace: 'nowrap',
      render: (empresa) => (
        <StatusChip estado={empresa.estado} activoLabel="Activo" inactivoLabel="Inactivo" />
      )
    },

    {
      key: 'acciones',
      label: 'Acciones',
      width: 'auto',
      whiteSpace: 'nowrap',
      align: 'center',
      render: (empresa) => (
        <Tooltip title="Editar empresa">
          <IconButton size="small" onClick={() => handleEditarEmpresa(empresa)}
            sx={{ p: 0.5, '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.08)' } }}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    }
  ]

  // =========================================================
  // TOTAL
  // =========================================================

  const totalRegistros = empresasFiltrados.length

  // =========================================================
  // RENDER
  // =========================================================

  return (


    <Box sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* =====================================================
      ENCABEZADO
            ====================================================== */}

      <PageHeader
        title="Empresas"
        description="Administración de empresas del sistema"
        actionLabel="Nueva Empresa"
        onAction={handleNuevaEmpresa}
        actionIcon={<Add />}
      />

      {/* =================================================
      BUSCADOR 
            ================================================= */}

      <Paper
        elevation={0}
        sx={{
          width: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 1,
          overflow: 'hidden', backgroundColor: 'background.paper', marginBottom: 1
        }}>

        <Box sx={{ p: 2, flexShrink: 0, backgroundColor: 'background.paper' }}>
          <SearchInput
            value={busqueda.toUpperCase()}
            onChange={handleCambioBusqueda}
            placeholder="Buscar empresa..."
            ariaLabel="Buscar empresa"
          />
        </Box>

        {/* =================================================
                    ERROR && NO EDITABLE
                ================================================= */}

        {error && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Alert severity="error" sx={{ borderRadius: 1 }} >
              {error}
            </Alert>
          </Box>
        )}
      </Paper>

      {/* =================================================
                    TABLA 
                ================================================= */}

      <Paper
        elevation={0}
        sx={{
          width: '100%', minWidth: 0, minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column',
          border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', backgroundColor: 'background.paper'
        }}>

        <DataTable
          columns={columnas}
          rows={empresasPaginados}
          loading={loading}
          emptyMessage={'No existen empresas registradas.'}
          emptySearchMessage={'No se encontraron empresas.'}
          hasSearch={Boolean(busqueda.trim())}
          getRowKey={(empresa) => empresa.id_empresa}

        />

        {/* =================================================
                    PAGINACIÓN
                ================================================= */}

        <Pagination


          total={totalRegistros}
          pagina={pagina}
          registrosPorPagina={registrosPorPagina}
          onPageChange={handleChangePagina}
          onRowsPerPageChange={handleChangeRegistrosPorPagina}


        />
      </Paper>

      {/* =====================================================
                DIÁLOGO && NO EDITABLE
            ====================================================== */}

      <Dialog open={dialogOpen} onClose={handleCerrarDialog} fullWidth maxWidth="sm">

        {/* =====================================================
                FORMULARIO DE NUEVO / ACTUALIZAR
                ====================================================== */}

        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>

          <Typography variant="h6" fontWeight={700}>
            {modoEdicion
              ? 'Editar empresa'
              : 'Nuevo empresa'}
          </Typography>

          <IconButton onClick={handleCerrarDialog} disabled={guardando} size="small">
            <Close />
          </IconButton>

        </DialogTitle>

        <DialogContent>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>

            {/* EMPRESA */}
            <TextField
              label="Empresa"
              name="descripcion"
              value={formulario.descripcion}
              onChange={handleChange}
              error={Boolean(erroresFormulario.descripcion)}
              helperText={erroresFormulario.descripcion}
              fullWidth
              required
              disabled={guardando}
              autoFocus
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />

            {/* NOMBRE COMERCIAL */}

            <TextField
              label="Nombre comercial"
              name="nombre_comercial"
              value={formulario.nombre_comercial}
              onChange={handleChange}
              error={Boolean(erroresFormulario.nombre_comercial)}
              helperText={erroresFormulario.nombre_comercial}
              fullWidth
              required
              disabled={guardando}
              autoFocus
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />

            {/* ESTADO */}

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                Estado
              </Typography>

              <StatusChip
                estado={formulario.estado}
                onClick={!guardando ? handleCambiarEstadoFormulario : undefined}
                disabled={guardando}
              />
            </Box>
          </Box>

        </DialogContent>

        {/* =====================================================
                BOTON DE CERRAR && NO EDITABLE
            ====================================================== */}

        <DialogActions sx={{ px: 3, pb: 2 }}>

          <Button onClick={handleCerrarDialog}
            disabled={guardando}
            startIcon={<Close />}
            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>
            Cancelar
          </Button>

          {/* =====================================================
                BOTÓN DE GUARDAR
            ====================================================== */}

          <Button variant="contained" onClick={handleGuardar}
            disabled={guardando}
            startIcon={guardando ? (<CircularProgress size={18} color="inherit" />) : (<Save />)}
            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>
            {modoEdicion
              ? 'Guardar cambios'
              : 'Crear empresa'}
          </Button>

        </DialogActions>

      </Dialog>

      {/* =====================================================
                NOTIFICACIONES && NO EDITABLE
            ====================================================== */}

      {/* =====================================================
          MENSAJE DE ÉXITO && NO EDITABLE
      ====================================================== */}

      <Snackbar
        open={Boolean(mensaje)}
        autoHideDuration={3500}
        onClose={handleCerrarMensaje}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} >

        <Alert
          onClose={handleCerrarMensaje}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}>
          {mensaje}
        </Alert>

      </Snackbar>

      {/* =====================================================
          MENSAJE ERROR && NO EDITABLE
      ====================================================== */}

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={5000}
        onClose={handleCerrarError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >

        <Alert
          onClose={handleCerrarError}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Empresas