// =========================================================
 // IMPORTS
 // =========================================================

import { useEffect, useRef, useMemo, useState } from 'react'

import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, MenuItem, Paper, Snackbar, Switch, TextField, Typography, Tooltip
} from '@mui/material'

import { Add, Close, Edit, Save } from '@mui/icons-material'
import useMediaQuery from '@mui/material/useMediaQuery'

import {
  obtenerTodasLasEmpresas,
  crearEmpresa,
  actualizarEmpresa,
  cambiarEstadoEmpresa,
} from '../../services/empresaService'
import SearchInput from '../../components/common/SearchInput'
import StatusChip from '../../components/common/StatusChip'
import Pagination from '../../components/common/Pagination'
import PageHeader from '../../components/common/PageHeader'
import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import DataTable from '../../components/common/DataTable'

const formularioInicial = { descripcion: '', nombre_comercial: '', estado: true }

function Empresas() {
  const esVistaMovil = useMediaQuery('(max-width:760px)')
  const [empresas, setEmpresas] = useState([])
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null)


  const [empresaCambioEstado, setEmpresaCambioEstado] = useState(null)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)

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
  const [filtroEstado, setFiltroEstado] = useState('todos')

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



  const handleSolicitarCambioEstado = (empresa) => {
  setEmpresaCambioEstado({
    ...empresa,
    nuevoEstado: !Boolean(empresa.estado),
  })
}

const handleCerrarConfirmacionEstado = () => {
  if (cambiandoEstado) return
  setEmpresaCambioEstado(null)
}

const handleConfirmarCambioEstado = async () => {
  if (!empresaCambioEstado) return

  const { id_empresa, nuevoEstado } = empresaCambioEstado

  try {
    setCambiandoEstado(true)
    setError('')

    const empresaActualizada = await cambiarEstadoEmpresa(
      id_empresa,
      nuevoEstado,
    )

    setEmpresas((actuales) =>
      actuales.map((empresa) =>
        empresa.id_empresa === id_empresa
          ? empresaActualizada
          : empresa,
      ),
    )

    setMensaje(
      nuevoEstado
        ? 'Empresa reactivada correctamente.'
        : 'Empresa desactivada correctamente.',
    )

    setEmpresaCambioEstado(null)
    setPagina(0)
  } catch (err) {
    console.error('Error cambiando estado de empresa:', err)
    setError(err?.message || 'No se pudo cambiar el estado de la empresa.')
  } finally {
    setCambiandoEstado(false)
  }
}

  // =========================================================
  // DATOS FILTRADOS
  // =========================================================

  const empresasFiltrados =
    useMemo(() => {
      const texto = busqueda.trim().toLowerCase()

      return empresas.filter((empresa) => {
        const coincideTexto =
          empresa.descripcion?.toLowerCase().includes(texto) ||
          empresa.nombre_comercial?.toLowerCase().includes(texto)

        const coincideEstado =
          filtroEstado === 'todos' ||
          (filtroEstado === 'activos' && Boolean(empresa.estado)) ||
          (filtroEstado === 'inactivos' && !Boolean(empresa.estado))

        return coincideTexto && coincideEstado
      })
    }, [empresas, busqueda, filtroEstado])

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
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <Tooltip
            title={empresa.estado ? 'Desactivar empresa' : 'Reactivar empresa'}
          >
            <span>
              <Switch
                checked={Boolean(empresa.estado)}
                onChange={() => handleSolicitarCambioEstado(empresa)}
                disabled={cambiandoEstado}
                size="small"
                inputProps={{
                  'aria-label': (empresa.estado ? 'Desactivar ' : 'Reactivar ')
                    + empresa.descripcion,
                }}
              />
            </span>
          </Tooltip>

          <StatusChip
            estado={empresa.estado}
            activoLabel="Activo"
            inactivoLabel="Inactivo"
          />
        </Box>
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


    <CompactModuleTheme>
<Box sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflowX: 'hidden', overflowY: 'auto' }}>

      {/* =====================================================
      ENCABEZADO
            ====================================================== */}

      <Box
        sx={{
          '& > .MuiBox-root': {
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
          },
          '& > .MuiBox-root > .MuiButton-root': {
            width: { xs: '100%', sm: 'auto' },
          },
        }}
      >
        <PageHeader
          title={
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              Empresas

            </Box>
          }
          description="Administración de empresas del sistema"
          actionLabel="Nueva Empresa"
          onAction={handleNuevaEmpresa}
          actionIcon={<Add />}
        />
      </Box>

      {/* =================================================
      BUSCADOR
            ================================================= */}

      <Paper
        elevation={0}
        sx={{
          width: '100%', minWidth: 0, flex: '0 0 auto', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 1,
          overflow: 'hidden', backgroundColor: 'background.paper', marginBottom: 1
        }}>

        <Box
          sx={{
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
            backgroundColor: 'background.paper',
          }}
        >
          <Box sx={{ flex: '1 1 280px', minWidth: { xs: '100%', sm: 240 } }}>
            <SearchInput
              value={busqueda}
              onChange={handleCambioBusqueda}
              placeholder="Buscar empresa o nombre comercial..."
              ariaLabel="Buscar empresa o nombre comercial"
              maxWidth="none"
            />
          </Box>

          <TextField
            select
            size="small"
            label="Estado"
            value={filtroEstado}
            onChange={(event) => {
              setFiltroEstado(event.target.value)
              setPagina(0)
            }}
            sx={{ width: { xs: '100%', sm: 190 }, flexShrink: 0 }}
          >
            <MenuItem value="todos">Todas</MenuItem>
            <MenuItem value="activos">Activo</MenuItem>
            <MenuItem value="inactivos">Inactivo</MenuItem>
          </TextField>

          <Typography
            variant="body2"
            color="text.secondary"
            aria-live="polite"
            sx={{
              ml: { xs: 'auto', sm: 0 },
              whiteSpace: 'nowrap',
              fontWeight: 500,
            }}
          >
            {totalRegistros} {totalRegistros === 1 ? 'registro encontrado' : 'registros encontrados'}
          </Typography>
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
          width: '100%',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          flex: '0 0 auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          '& .MuiTableContainer-root': {
            flex: '0 1 auto',
            maxHeight: { xs: 420, sm: 560 },
          },
        }}>

        {esVistaMovil ? (
          <Box
            component="ul"
            aria-label="Lista de empresas"
            sx={{
              listStyle: 'none',
              m: 0,
              p: 0,
              flex: '0 1 auto',
              maxHeight: 420,
              overflowY: 'auto',
            }}
          >
            {loading ? (
              <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
                <CircularProgress size={28} />
              </Box>
            ) : empresasPaginados.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ p: 3 }}>
                {Boolean(busqueda.trim()) || filtroEstado !== 'todos'
                  ? 'No se encontraron empresas.'
                  : 'No existen empresas registradas.'}
              </Typography>
            ) : empresasPaginados.map((empresa) => (
              <Box
                component="li"
                key={empresa.id_empresa}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) auto',
                  columnGap: 1,
                  alignItems: 'center',
                  px: 1.5,
                  py: 1.25,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 0 },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
                    {empresa.descripcion}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, overflowWrap: 'anywhere' }}>
                    Nombre comercial: {empresa.nombre_comercial || 'Sin especificar'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                    <Tooltip title={empresa.estado ? 'Desactivar empresa' : 'Reactivar empresa'}>
                      <span>
                        <Switch
                          checked={Boolean(empresa.estado)}
                          onChange={() => handleSolicitarCambioEstado(empresa)}
                          disabled={cambiandoEstado}
                          size="small"
                          inputProps={{
                            'aria-label': `${empresa.estado ? 'Desactivar' : 'Reactivar'} ${empresa.descripcion}`,
                          }}
                        />
                      </span>
                    </Tooltip>
                    <StatusChip
                      estado={empresa.estado}
                      activoLabel="Activo"
                      inactivoLabel="Inactivo"
                    />
                  </Box>
                </Box>
                <Tooltip title="Editar empresa">
                  <IconButton
                    aria-label={`Editar ${empresa.descripcion}`}
                    onClick={() => handleEditarEmpresa(empresa)}
                    sx={{ minWidth: 44, minHeight: 44 }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
          </Box>
        ) : (
          <DataTable
            columns={columnas}
            rows={empresasPaginados}
            loading={loading}
            emptyMessage={'No existen empresas registradas.'}
            emptySearchMessage={'No se encontraron empresas.'}
            hasSearch={Boolean(busqueda.trim()) || filtroEstado !== 'todos'}
            getRowKey={(empresa) => empresa.id_empresa}
          />
        )}

        {/* =================================================
                    PAGINACIÓN
                ================================================= */}

        <Pagination


          total={totalRegistros}
          pagina={pagina}
          registrosPorPagina={registrosPorPagina}
          onPageChange={handleChangePagina}
          onRowsPerPageChange={handleChangeRegistrosPorPagina}
          opciones={[5, 10]}


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

      <Dialog
        open={Boolean(empresaCambioEstado)}
        onClose={handleCerrarConfirmacionEstado}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {empresaCambioEstado?.nuevoEstado
            ? 'Reactivar empresa'
            : 'Desactivar empresa'}
        </DialogTitle>

        <DialogContent>
          <Typography>
            {empresaCambioEstado?.nuevoEstado
              ? '¿Deseas reactivar "' + empresaCambioEstado?.descripcion + '"?'
              : '¿Deseas desactivar "' + empresaCambioEstado?.descripcion
                + '"? El registro se conservará en la base de datos.'}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleCerrarConfirmacionEstado}
            disabled={cambiandoEstado}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            color={empresaCambioEstado?.nuevoEstado ? 'success' : 'warning'}
            onClick={handleConfirmarCambioEstado}
            disabled={cambiandoEstado}
            startIcon={
              cambiandoEstado
                ? <CircularProgress size={16} color="inherit" />
                : undefined
            }
          >
            {cambiandoEstado
              ? 'Guardando...'
              : empresaCambioEstado?.nuevoEstado
                ? 'Reactivar'
                : 'Desactivar'}
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
</CompactModuleTheme>
  )
}

export default Empresas
