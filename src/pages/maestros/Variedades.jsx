// =========================================================
// IMPORTS
// =========================================================

import { useEffect, useRef, useMemo, useState } from 'react'

import {
    Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogTitle, IconButton, MenuItem, Paper, Snackbar, Switch, TextField, Tooltip, Typography
} from '@mui/material'

import { Add, Close, Edit, Save } from '@mui/icons-material'
import useMediaQuery from '@mui/material/useMediaQuery'

import { obtenerVariedades, crearVariedad, actualizarVariedad, cambiarEstadoVariedad } from '../../services/variedadService'

import SearchInput from '../../components/common/SearchInput'
import StatusChip from '../../components/common/StatusChip'
import Pagination from '../../components/common/Pagination'
import PageHeader from '../../components/common/PageHeader'
import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import DataTable from '../../components/common/DataTable'

const formularioInicial = { descripcion: '', estado: true }

function Variedades() {
    const esVistaMovil = useMediaQuery('(max-width:760px)')

    const [variedades, setVariedades] = useState([])
    const [variedadSeleccionada, setVariedadSeleccionada] = useState(null)
    const [variedadCambioEstado, setVariedadCambioEstado] = useState(null)
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

    const cargarVariedades = async () => {
        try {
            setLoading(true)
            setError('')
            const data = await obtenerVariedades()
            setVariedades(data || [])
        } catch (err) {
            console.error('Error cargando variedades:', err)
            setError('No se pudieron cargar las variedades.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (cargaInicialIniciada.current) { return }
        cargaInicialIniciada.current = true
        cargarVariedades()
    }, [])

    // =========================================================
    // CAMBIO DE ESTADO
    // =========================================================
    const handleSolicitarCambioEstado = (variedad) => {
        setVariedadCambioEstado({ ...variedad, nuevoEstado: !Boolean(variedad.estado) })
    }

    const handleCerrarConfirmacionEstado = () => {
        if (cambiandoEstado) return
        setVariedadCambioEstado(null)
    }

    const handleConfirmarCambioEstado = async () => {
        if (!variedadCambioEstado) return
        const { id_variedad, nuevoEstado } = variedadCambioEstado

        try {
            setCambiandoEstado(true)
            setError('')
            const variedadActualizada = await cambiarEstadoVariedad(id_variedad, nuevoEstado)
            setVariedades((actuales) => actuales.map((variedad) =>
                variedad.id_variedad === id_variedad ? variedadActualizada : variedad,
            ))
            setMensaje(
                nuevoEstado
                    ? 'Variedad reactivada correctamente.'
                    : 'Variedad desactivada correctamente.',
            )
            setVariedadCambioEstado(null)
            setPagina(0)
        } catch (err) {
            console.error('Error cambiando estado de variedad:', err)
            setError(err?.message || 'No se pudo cambiar el estado de la variedad.')
        } finally {
            setCambiandoEstado(false)
        }
    }
    // DATOS FILTRADOS
    // =========================================================


    const variedadesFiltradas = useMemo(() => {
        const texto = busqueda.trim().toLocaleLowerCase('es')

        return variedades.filter((variedad) => {
            const coincideTexto = variedad.descripcion?.toLocaleLowerCase('es').includes(texto)
            const coincideEstado =
                filtroEstado === 'todos' ||
                (filtroEstado === 'activos' && Boolean(variedad.estado)) ||
                (filtroEstado === 'inactivos' && !Boolean(variedad.estado))

            return coincideTexto && coincideEstado
        })
    }, [variedades, busqueda, filtroEstado])
    // =========================================================
    // DATOS PAGINADOS
    // =========================================================

    const variedadesPaginadas = useMemo(() => {
        const inicio = pagina * registrosPorPagina
        const fin = inicio + registrosPorPagina
        return variedadesFiltradas.slice(inicio, fin)
    }, [variedadesFiltradas, pagina, registrosPorPagina])

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
    // NUEVA VARIEDAD
    // =========================================================

    const handleNuevaVariedad = () => {
        setModoEdicion(false)
        setVariedadSeleccionada(null)
        setFormulario({ ...formularioInicial, estado: true })
        setErroresFormulario({})
        setDialogOpen(true)
    }

    // =========================================================
    // EDITAR VARIEDAD
    // =========================================================

    const handleEditarVariedad = (variedad) => {
        setModoEdicion(true)
        setVariedadSeleccionada(variedad)
        setFormulario({
            descripcion: variedad.descripcion || '',
            estado: variedad.estado ?? true
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
        setVariedadSeleccionada(null)
        setFormulario(formularioInicial)
        setErroresFormulario({})
    }

    // =========================================================
    // CAMBIAR CAMPOS
    // =========================================================

    const handleChange = (event) => {
        const { name, value } = event.target
        const nuevoValor =
            name === 'descripcion'
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
        setErroresFormulario(nuevosErrores)
        return Object.keys(nuevosErrores).length === 0
    }

    // =========================================================
    // GUARDAR VARIEDAD
    // =========================================================

    const handleGuardar = async () => {
        if (!validarFormulario()) { return }
        try {
            setGuardando(true)
            setError('')
            const datos = {
                descripcion: formulario.descripcion.trim().toUpperCase(),
                estado: formulario.estado
            }
            if (modoEdicion) {
                await actualizarVariedad(variedadSeleccionada.id_variedad, datos)
                setMensaje('Variedad actualizada correctamente.')
            } else {
                await crearVariedad(datos)
                setMensaje('Variedad creada correctamente.')
                setPagina(0)
            }
            setDialogOpen(false)
            await cargarVariedades()
        } catch (err) {
            console.error('Error guardando variedad:', err)
            setError(err?.message || 'No se pudo guardar la variedad.')
        } finally { setGuardando(false) }
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
            label: 'Variedad',
            height: '100%',
            width: '60%',
            cellSx: {
                position: 'relative', pl: 1.5,
                '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: '0 0px 0px 0', backgroundColor: '#2E7D32' }
            },
            render: (variedad) => (
                <Box sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>
                        {variedad.descripcion}
                    </Typography>
                </Box>)
        },
        {
            key: 'estado',
            label: 'Estado',
            width: '20%',
            render: (variedad) => (
                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title={variedad.estado ? 'Desactivar variedad' : 'Reactivar variedad'}>
                        <span>
                            <Switch
                                checked={Boolean(variedad.estado)}
                                onChange={() => handleSolicitarCambioEstado(variedad)}
                                disabled={cambiandoEstado}
                                size="small"
                                inputProps={{
                                    'aria-label': `${variedad.estado ? 'Desactivar' : 'Reactivar'} ${variedad.descripcion}`,
                                }}
                            />
                        </span>
                    </Tooltip>
                    <StatusChip estado={variedad.estado} activoLabel="Activo" inactivoLabel="Inactivo" />
                </Box>
            )
        },
        {
            key: 'acciones',
            label: 'Acciones',
            width: '20%',
            align: 'center',
            render: (variedad) => (
                <IconButton size="small" onClick={() => handleEditarVariedad(variedad)}
                    sx={{ p: 0.5, '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.08)' } }}>
                    <Edit fontSize="small" />
                </IconButton>
            ),
        },
    ]

    // =========================================================
    // TOTAL DE REGISTROS
    // =========================================================

    const totalRegistros = variedadesFiltradas.length

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
                    title="Variedades"
                    description="Administración de variedades agrícolas"
                    actionLabel="Nueva variedad"
                    onAction={handleNuevaVariedad}
                    actionIcon={<Add />}
                />
            </Box>


            <Paper
                elevation={0}
                sx={{
                    width: '100%', minWidth: 0, flex: '0 0 auto', display: 'flex', flexDirection: 'column',
                    border: '1px solid', borderColor: 'divider', borderRadius: 1,
                    overflow: 'hidden', backgroundColor: 'background.paper', marginBottom: 1,
                }}
            >
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
                            value={busqueda.toLocaleUpperCase()}
                            onChange={handleCambioBusqueda}
                            placeholder="Buscar variedad..."
                            ariaLabel="Buscar variedad"
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
                        sx={{ ml: { xs: 'auto', sm: 0 }, whiteSpace: 'nowrap', fontWeight: 500 }}
                    >
                        {totalRegistros} {totalRegistros === 1 ? 'registro encontrado' : 'registros encontrados'}
                    </Typography>
                </Box>
                {error && (
                    <Box sx={{ px: 2, pb: 2 }}>
                        <Alert severity="error" sx={{ borderRadius: 1 }}>{error}</Alert>
                    </Box>
                )}
            </Paper>
            {/* =================================================
                    TABLA 
                ================================================= */}
            <Paper
                elevation={0}
                sx={{
                    width: '100%', minWidth: 0, minHeight: 0, flex: esVistaMovil ? '0 0 auto' : 1, display: 'flex', flexDirection: 'column',
                    border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', backgroundColor: 'background.paper'
                }}>



                {/* ===================================================
            TABLA
        ==================================================== */}

                {esVistaMovil ? (
                    <Box
                        component="ul"
                        aria-label="Lista de variedades"
                        sx={{ listStyle: 'none', m: 0, p: 0, flex: '0 1 auto', maxHeight: 420, overflowY: 'auto' }}
                    >
                        {loading ? (
                            <Box component="li" sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
                                <CircularProgress size={28} />
                            </Box>
                        ) : variedadesPaginadas.length === 0 ? (
                            <Box component="li" sx={{ p: 3 }}>
                                <Typography color="text.secondary" align="center">
                                    {Boolean(busqueda.trim()) || filtroEstado !== 'todos'
                                        ? 'No se encontraron variedades.'
                                        : 'No existen variedades registradas.'}
                                </Typography>
                            </Box>
                        ) : variedadesPaginadas.map((variedad) => (
                            <Box
                                component="li"
                                key={variedad.id_variedad}
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
                                        {variedad.descripcion}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                                        <Tooltip title={variedad.estado ? 'Desactivar variedad' : 'Reactivar variedad'}>
                                            <span>
                                                <Switch
                                                    checked={Boolean(variedad.estado)}
                                                    onChange={() => handleSolicitarCambioEstado(variedad)}
                                                    disabled={cambiandoEstado}
                                                    size="small"
                                                    inputProps={{
                                                        'aria-label': `${variedad.estado ? 'Desactivar' : 'Reactivar'} ${variedad.descripcion}`,
                                                    }}
                                                />
                                            </span>
                                        </Tooltip>
                                        <StatusChip estado={variedad.estado} activoLabel="Activo" inactivoLabel="Inactivo" />
                                    </Box>
                                </Box>
                                <IconButton
                                    aria-label={`Editar ${variedad.descripcion}`}
                                    onClick={() => handleEditarVariedad(variedad)}
                                    sx={{ minWidth: 44, minHeight: 44 }}
                                >
                                    <Edit fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <DataTable
                        columns={columnas}
                        rows={variedadesPaginadas}
                        loading={loading}
                        emptyMessage={'No existen variedades registradas.'}
                        emptySearchMessage={'No se encontraron variedades.'}
                        hasSearch={Boolean(busqueda.trim()) || filtroEstado !== 'todos'}
                        getRowKey={(variedad) => variedad.id_variedad}
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
                            ? 'Editar variedad'
                            : 'Nueva variedad'}
                    </Typography>

                    <IconButton onClick={handleCerrarDialog} disabled={guardando} size="small">
                        <Close />
                    </IconButton>

                </DialogTitle>

                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>

                        {/* ===============================================
              DESCRIPCIÓN
          ================================================ */}

                        <TextField
                            label="Variedad"
                            name="descripcion"
                            value={formulario.descripcion}
                            onChange={handleChange}
                            error={Boolean(erroresFormulario.descripcion)}
                            helperText={erroresFormulario.descripcion}
                            autoFocus
                            sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                            required
                            disabled={guardando}
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

            <Dialog
                open={Boolean(variedadCambioEstado)}
                onClose={handleCerrarConfirmacionEstado}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    {variedadCambioEstado?.nuevoEstado
                        ? 'Reactivar variedad'
                        : 'Desactivar variedad'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {variedadCambioEstado?.nuevoEstado
                            ? `¿Deseas reactivar "${variedadCambioEstado?.descripcion}"?`
                            : `¿Deseas desactivar "${variedadCambioEstado?.descripcion}"? El registro se conservará en la base de datos.`}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCerrarConfirmacionEstado} disabled={cambiandoEstado}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        color={variedadCambioEstado?.nuevoEstado ? 'success' : 'warning'}
                        onClick={handleConfirmarCambioEstado}
                        disabled={cambiandoEstado}
                        startIcon={cambiandoEstado ? <CircularProgress size={16} color="inherit" /> : undefined}
                    >
                        {cambiandoEstado
                            ? 'Guardando...'
                            : variedadCambioEstado?.nuevoEstado
                                ? 'Reactivar'
                                : 'Desactivar'}
                    </Button>
                </DialogActions>
            </Dialog>
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

export default Variedades
