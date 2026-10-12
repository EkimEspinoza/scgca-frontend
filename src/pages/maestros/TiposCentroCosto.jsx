// =========================================================
// IMPORTS
// =========================================================

import { useEffect, useRef, useMemo, useState } from 'react'

import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, Paper, Snackbar, TextField, Typography
} from '@mui/material'

import { Add, Close as CloseIcon, Edit as EditIcon, Save } from '@mui/icons-material'

import { obtenerTiposCentroCosto, crearTipoCentroCosto, actualizarTipoCentroCosto } from '../../services/tipoCentroCostoService'

import SearchInput from '../../components/common/SearchInput'
import StatusChip from '../../components/common/StatusChip'
import Pagination from '../../components/common/Pagination'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'


const formularioInicial = { des_tip_cc: '', estado: true }

function TiposCentroCosto() {

  const [tipos, setTipos] = useState([])
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null)

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
  // CARGAR TIPOS
  // =========================================================

  const cargarTipos = async () => {
    try {
      setLoading(true)
      setError('')
      const data =
        await obtenerTiposCentroCosto()
      setTipos(data)
    }
    catch (err) {
      console.error('Error cargando tipos de centro de costo:', err)
      setError('No se pudieron cargar los tipos de centro de costo.')
    }
    finally { setLoading(false) }
  }


  useEffect(() => {
    if (cargaInicialIniciada.current) { return }
    cargaInicialIniciada.current = true
    cargarTipos()
  }, [])

  // =========================================================
  // DATOS FILTRADOS
  // =========================================================

  const tiposFiltrados =
    useMemo(() => {
      const texto = busqueda.trim().toLowerCase()
      if (!texto) { return tipos }
      return tipos.filter((tipo) => String(tipo.des_tip_cc ?? '').toLowerCase().includes(texto))
    },
      [tipos, busqueda])

  // =========================================================
  // DATOS PAGINADOS 
  // =========================================================


  const tiposPaginados = useMemo(() => {
    const inicio = pagina * registrosPorPagina
    const fin = inicio + registrosPorPagina
    return tiposFiltrados.slice(inicio, fin)
  }, [tiposFiltrados, pagina, registrosPorPagina])


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
  // NUEVO TIPO DE CENTRO DE COSTO
  // =========================================================

  const handleNuevoTipoCentroCosto = () => {
    setModoEdicion(false)
    setTipoSeleccionado(null)
    setFormulario({ ...formularioInicial, estado: true })
    setErroresFormulario({})
    setDialogOpen(true)
  }

  // =========================================================
  // EDITAR TIPO DE CENTRO DE COSTO
  // =========================================================

  const handleEditar = (tipo) => {
    setModoEdicion(true)
    setTipoSeleccionado(tipo)
    setFormulario({
      des_tip_cc: tipo.des_tip_cc ?? '',
      estado: Boolean(tipo.estado)
    })
    setErroresFormulario({})
    setDialogOpen(true)
  }


  // =========================================================
  // CERRAR DIÁLOGO 
  // =========================================================

  const handleCerrarDialog = () => {
    if (guardando) { return }
    setDialogOpen(false)
    setModoEdicion(false)
    setTipoSeleccionado(null)
    setFormulario({ des_tip_cc: '', estado: true, })
    setErroresFormulario({})
  }


  // =========================================================
  // CAMBIAR CAMPOS
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormulario((actual) => ({
      ...actual,
      [name]: name === 'des_tip_cc' ? value.toLocaleUpperCase('es') : value
    }))
    if (name === 'des_tip_cc' && erroresFormulario?.des_tip_cc) {
      setErroresFormulario((actual) => ({
        ...actual,
        des_tip_cc: ''
      }))
    }
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
    const descripcion = formulario.des_tip_cc?.trim()
    if (!descripcion)
      if (!formulario.des_tip_cc.trim()) { nuevosErrores.des_tip_cc = ('La descripción del tipo de centro de costo es obligatoria.') }
    setErroresFormulario(nuevosErrores)
    return (Object.keys(nuevosErrores).length === 0)
  }

  // =========================================================
  // GUARDAR COMPARATIVO
  // =========================================================


  const handleGuardar = async () => {

    if (!validarFormulario()) { return }
    try {
      setGuardando(true)
      setError('')
      const datos = {
        des_tip_cc: formulario.des_tip_cc.trim().toLocaleUpperCase('es'),
        estado: Boolean(formulario.estado)
      }

      if (!modoEdicion) {
        const nuevoTipo = await crearTipoCentroCosto(datos)
        setTipos((actual) => {
          const nuevaLista = [...actual, nuevoTipo]
          return nuevaLista.sort((a, b) => String(a.des_tip_cc ?? '').localeCompare(String(b.des_tip_cc ?? ''), 'es', { sensitivity: 'base', }))
        })
        setMensaje('Tipo de centro de costo creado correctamente.')
      }
      else {
        const tipoActualizado = await actualizarTipoCentroCosto(tipoSeleccionado.id_tip_cc, datos)
        setTipos((actual) =>
          actual
            .map((tipo) =>
              tipo.id_tip_cc === tipoSeleccionado.id_tip_cc ? tipoActualizado : tipo)
            .sort(
              (a, b) =>
                String(a.des_tip_cc ?? '').localeCompare(String(b.des_tip_cc ?? '',), 'es', { sensitivity: 'base' })))
        setMensaje('Tipo de centro de costo actualizado correctamente.')
        setPagina(0)
      }
      setDialogOpen(false)
      await cargarTipos()
    } catch (err) {
      console.error('Error guardando tipo de centro de costo:', err)
      setMensaje(err?.message || 'No se pudo guardar el tipo de centro de costo.')
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
      key: 'des_tip_cc',
      label: 'Tipo de Centro de Costo',
      height: '100%',
      width: '60%',
      cellSx: {
        position: 'relative', pl: 1.5,
        '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: '0 0px 0px 0', backgroundColor: '#2E7D32' }
      },
      render: (tipo) => (
        <Box sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>
            {tipo.des_tip_cc}
          </Typography>
        </Box>)
    },

    {
      key: 'estado',
      label: 'Estado',
      width: '20%',
      render: (tipo) => (
        <StatusChip estado={tipo.estado} activoLabel="Activo" inactivoLabel="Inactivo" />
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      width: '20%',
      align: 'center',
      render: (tipo) => (
        <IconButton size="small" onClick={() => handleEditar(tipo)}
          sx={{ p: 0.5, '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.08)' } }}>
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ]

  // =========================================================
  // TOTAL
  // =========================================================

  const totalRegistros = tiposFiltrados.length

  // =========================================================
  // RENDER 
  // =========================================================

  return (

    <Box sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* =====================================================
            ENCABEZADO
                    ====================================================== */}

      <PageHeader
        title="Tipos de Centro de Costo"
        description="Administra los tipos utilizados para clasificar los Centros de Costo"
        actionLabel="Nuevo tipo de Centro de Costo"
        onAction={handleNuevoTipoCentroCosto}
        actionIcon={<Add />}
      />

      <Paper
        elevation={0}
        sx={{
          width: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 1,
          overflow: 'hidden', backgroundColor: 'background.paper', marginBottom: 1
        }}>

        {/* =====================================================
                    BUSCADOR
                ====================================================== */}
        <Box sx={{ p: 2, flexShrink: 0, backgroundColor: 'background.paper' }}>

          <SearchInput
            value={busqueda.toLocaleUpperCase()}
            onChange={handleCambioBusqueda}
            placeholder="Buscar tipo de centro de costo.."
            ariaLabel="Buscar tipo de centro de costo"
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



        {/* ===================================================
            TABLA
        ==================================================== */}

        <DataTable
          columns={columnas}
          rows={tiposPaginados}
          loading={loading}
          emptyMessage={'No existen tipos de centro de costo registrados.'}
          emptySearchMessage={'No se encontraron tipos de centro de costo para la búsqueda.'}
          hasSearch={Boolean(busqueda.trim())}
          getRowKey={(tipo) => tipo.id_tip_cc}
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
              ? 'Editar Tipo de Centro de Costo'
              : 'Nuevo Tipo de Centro de Costo'}
          </Typography>

          <IconButton onClick={handleCerrarDialog} disabled={guardando} size="small">
            <CloseIcon />
          </IconButton>

        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>

            {/* ===============================================
              DESCRIPCIÓN
          ================================================ */}

            <TextField
              fullWidth
              label="Descripción"
              name="des_tip_cc"
              value={formulario.des_tip_cc}
              onChange={handleChange}
              error={Boolean(erroresFormulario?.des_tip_cc)}
              helperText={erroresFormulario?.des_tip_cc || 'La descripción se guardará en mayúsculas.'}
              autoFocus
              sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              required
              disabled={guardando}
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />

            {/* =====================================================
                ESTADO
            ====================================================== */}

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
            startIcon={<CloseIcon />}
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
              : 'Guardar'}
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

export default TiposCentroCosto