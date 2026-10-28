import { useEffect, useMemo, useRef, useState } from 'react'
import {
    Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogTitle, IconButton, MenuItem, Paper, Snackbar, Switch, TextField, Tooltip, Typography,
} from '@mui/material'
import { Add, Close as CloseIcon, Edit as EditIcon, Save } from '@mui/icons-material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { obtenerEtapasCosto, crearEtapaCosto, actualizarEtapaCosto, cambiarEstadoEtapaCosto } from '../../services/etapaCostoService'
import SearchInput from '../../components/common/SearchInput'
import StatusChip from '../../components/common/StatusChip'
import Pagination from '../../components/common/Pagination'
import PageHeader from '../../components/common/PageHeader'
import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import DataTable from '../../components/common/DataTable'

const formularioInicial = { etapa_costo: '', estado: true }

function EtapasCosto() {
    const esVistaMovil = useMediaQuery('(max-width:760px)')
    const [etapas, setEtapas] = useState([])
    const [etapaSeleccionada, setEtapaSeleccionada] = useState(null)
    const [etapaCambioEstado, setEtapaCambioEstado] = useState(null)
    const [cambiandoEstado, setCambiandoEstado] = useState(false)
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
    // CARGAR ETAPAS DE COSTO
    // =========================================================
    const cargarEtapas = async () => {
        try {
            setLoading(true)
            setError('')
            const data = await obtenerEtapasCosto()
            setEtapas(data ?? [])
        } catch (err) {
            console.error('Error cargando etapas de costo:', err)
            setError(err?.message || 'No se pudieron cargar las etapas de costo.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (cargaInicialIniciada.current) return
        cargaInicialIniciada.current = true
        cargarEtapas()
    }, [])

    // =========================================================
    // CAMBIO DE ESTADO
    // =========================================================
    const handleSolicitarCambioEstado = (etapa) => {
        setEtapaCambioEstado({
            ...etapa,
            nuevoEstado: !Boolean(etapa.estado),
        })
    }

    const handleCerrarConfirmacionEstado = () => {
        if (cambiandoEstado) return
        setEtapaCambioEstado(null)
    }

    const handleConfirmarCambioEstado = async () => {
        if (!etapaCambioEstado) return

        const { cod_etapa, nuevoEstado } = etapaCambioEstado

        try {
            setCambiandoEstado(true)
            setError('')

            const etapaActualizada = await cambiarEstadoEtapaCosto(cod_etapa, nuevoEstado)
            setEtapas((actuales) => actuales.map((etapa) =>
                etapa.cod_etapa === cod_etapa ? etapaActualizada : etapa,
            ))
            setMensaje(
                nuevoEstado
                    ? 'Etapa de costo reactivada correctamente.'
                    : 'Etapa de costo desactivada correctamente.',
            )
            setEtapaCambioEstado(null)
            setPagina(0)
        } catch (err) {
            console.error('Error cambiando estado de etapa de costo:', err)
            setError(err?.message || 'No se pudo cambiar el estado de la etapa de costo.')
        } finally {
            setCambiandoEstado(false)
        }
    }
    // FILTRAR ETAPAS POR CODIGO O DESCRIPCION
    // =========================================================
    const etapasFiltradas = useMemo(() => {
        const texto = busqueda.trim().toLocaleLowerCase('es')

        return etapas.filter((etapa) => {
            const coincideTexto =
                String(etapa.cod_etapa ?? '').toLocaleLowerCase('es').includes(texto) ||
                etapa.etapa_costo?.toLocaleLowerCase('es').includes(texto)
            const coincideEstado =
                filtroEstado === 'todos' ||
                (filtroEstado === 'activos' && Boolean(etapa.estado)) ||
                (filtroEstado === 'inactivos' && !Boolean(etapa.estado))

            return coincideTexto && coincideEstado
        })
    }, [etapas, busqueda, filtroEstado])
    // =========================================================
    // PAGINAR ETAPAS FILTRADAS
    // =========================================================
    const etapasPaginadas = useMemo(() => {
        const inicio = pagina * registrosPorPagina
        return etapasFiltradas.slice(inicio, inicio + registrosPorPagina)
    }, [etapasFiltradas, pagina, registrosPorPagina])

    // =========================================================
    // MANEJAR BUSQUEDA Y PAGINACION
    // =========================================================
    const handleCambioBusqueda = (event) => {
        setBusqueda(event.target.value)
        setPagina(0)
    }

    const handleChangePagina = (event, nuevaPagina) => {
        setPagina(nuevaPagina)
    }

    const handleChangeRegistrosPorPagina = (event) => {
        setRegistrosPorPagina(parseInt(event.target.value, 10))
        setPagina(0)
    }

    // =========================================================
    // ABRIR FORMULARIO PARA CREAR UNA ETAPA
    // =========================================================
    const handleNuevaEtapa = () => {
        setModoEdicion(false)
        setEtapaSeleccionada(null)
        setFormulario({ ...formularioInicial })
        setErroresFormulario({})
        setDialogOpen(true)
    }

    // =========================================================
    // ABRIR FORMULARIO PARA EDITAR UNA ETAPA
    // =========================================================
    const handleEditarEtapa = (etapa) => {
        setModoEdicion(true)
        setEtapaSeleccionada(etapa)
        setFormulario({
            etapa_costo: etapa.etapa_costo ?? '',
            estado: Boolean(etapa.estado),
        })
        setErroresFormulario({})
        setDialogOpen(true)
    }

    // =========================================================
    // CERRAR Y LIMPIAR EL FORMULARIO
    // =========================================================
    const handleCerrarDialog = () => {
        if (guardando) return
        setDialogOpen(false)
        setEtapaSeleccionada(null)
        setFormulario({ ...formularioInicial })
        setErroresFormulario({})
    }

    // =========================================================
    // ACTUALIZAR CAMPOS DEL FORMULARIO
    // =========================================================
    const handleChange = (event) => {
        const { name, value } = event.target
        setFormulario((actual) => ({ ...actual, [name]: value }))
        setErroresFormulario((actual) => ({ ...actual, [name]: '' }))
    }

    // =========================================================
    // CAMBIAR ESTADO ACTIVO / INACTIVO
    // =========================================================
    const handleCambiarEstadoFormulario = () => {
        setFormulario((actual) => ({ ...actual, estado: !actual.estado }))
    }

    // =========================================================
    // VALIDAR CAMPOS OBLIGATORIOS
    // =========================================================
    const validarFormulario = () => {
        const nuevosErrores = {}
        if (!formulario.etapa_costo.trim()) {
            nuevosErrores.etapa_costo = 'La descripción de la etapa es obligatoria.'
        }
        setErroresFormulario(nuevosErrores)
        return Object.keys(nuevosErrores).length === 0
    }

    // =========================================================
    // GUARDAR NUEVA ETAPA O ACTUALIZAR LA EXISTENTE
    // =========================================================
    const handleGuardar = async () => {
        if (!validarFormulario()) return
        try {
            setGuardando(true)
            setError('')
            const datos = {
                etapa_costo: formulario.etapa_costo.trim(),
                estado: Boolean(formulario.estado),
            }

            if (modoEdicion) {
                await actualizarEtapaCosto(etapaSeleccionada.cod_etapa, datos)
                setMensaje('Etapa de costo actualizada correctamente.')
            } else {
                await crearEtapaCosto(datos)
                setMensaje('Etapa de costo creada correctamente.')
                setPagina(0)
            }

            setDialogOpen(false)
            setEtapaSeleccionada(null)
            await cargarEtapas()
        } catch (err) {
            console.error('Error guardando etapa de costo:', err)
            setError(err?.message || 'No se pudo guardar la etapa de costo.')
        } finally {
            setGuardando(false)
        }
    }

    // =========================================================
    // CERRAR NOTIFICACIONES
    // =========================================================
    const handleCerrarMensaje = () => setMensaje('')
    const handleCerrarError = () => setError('')

    // =========================================================
    // DEFINIR COLUMNAS DE LA TABLA
    // =========================================================
    const columnas = [
        {
            key: 'etapa_costo',
            label: 'Etapa de Costo',
            
            width: '55%',
            cellSx: {
                position: 'relative',
                pl: 1.5,
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    backgroundColor: '#2E7D32',
                },
            },
            render: (etapa) => (
                <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>
                        {etapa.etapa_costo}
                    </Typography>
                </Box>
            ),
        },
        {
            key: 'estado',
            label: 'Estado',
            width: '15%',
            render: (etapa) => (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title={etapa.estado ? 'Desactivar etapa de costo' : 'Reactivar etapa de costo'}>
                        <span>
                            <Switch
                                checked={Boolean(etapa.estado)}
                                onChange={() => handleSolicitarCambioEstado(etapa)}
                                disabled={cambiandoEstado}
                                size="small"
                                inputProps={{
                                    'aria-label': `${etapa.estado ? 'Desactivar' : 'Reactivar'} etapa ${etapa.cod_etapa}`,
                                }}
                            />
                        </span>
                    </Tooltip>
                    <StatusChip estado={etapa.estado} activoLabel="Activo" inactivoLabel="Inactivo" />
                </Box>
            ),
        },
        {
            key: 'acciones',
            label: 'Acciones',
            width: '15%',
            align: 'center',
            render: (etapa) => (
                <IconButton
                    size="small"
                    onClick={() => handleEditarEtapa(etapa)}
                    aria-label={`Editar etapa ${etapa.cod_etapa}`}
                    sx={{ p: 0.5, '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.08)' } }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            ),
        },
    ]

    const totalRegistros = etapasFiltradas.length

    // =========================================================
    // RENDERIZAR PANTALLA
    // =========================================================
    return (
        <CompactModuleTheme>
<Box sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflowX: 'hidden', overflowY: 'auto' }}>
            {/* ENCABEZADO DE LA PANTALLA */}
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
                    title="Etapas de Costo"
                    description="Administración de etapas utilizadas para clasificar los costos de inversión."
                    actionLabel="Nueva etapa"
                    onAction={handleNuevaEtapa}
                    actionIcon={<Add />}
                />
            </Box>

            {/* BUSCADOR Y MENSAJE DE ERROR */}
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
                            value={busqueda}
                            onChange={handleCambioBusqueda}
                            placeholder="Buscar por código o etapa..."
                            ariaLabel="Buscar etapa de costo"
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
                        <MenuItem value="todos">Todos</MenuItem>
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

            {/* TABLA Y PAGINACION */}
            <Paper
                elevation={0}
                sx={{ width: '100%', minWidth: 0, minHeight: 0, flex: esVistaMovil ? '0 0 auto' : 1, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', backgroundColor: 'background.paper' }}
            >
                {esVistaMovil ? (
                    <Box
                        component="ul"
                        aria-label="Lista de etapas de costo"
                        sx={{ listStyle: 'none', m: 0, p: 0, flex: '0 1 auto', maxHeight: 420, overflowY: 'auto' }}
                    >
                        {loading ? (
                            <Box component="li" sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
                                <CircularProgress size={28} />
                            </Box>
                        ) : etapasPaginadas.length === 0 ? (
                            <Box component="li" sx={{ p: 3 }}>
                                <Typography color="text.secondary" align="center">
                                    {Boolean(busqueda.trim()) || filtroEstado !== 'todos'
                                        ? 'No se encontraron etapas de costo.'
                                        : 'No existen etapas de costo registradas.'}
                                </Typography>
                            </Box>
                        ) : etapasPaginadas.map((etapa) => (
                            <Box
                                component="li"
                                key={etapa.cod_etapa}
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
                                        {etapa.etapa_costo}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                        Código: {etapa.cod_etapa}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                                        <Tooltip title={etapa.estado ? 'Desactivar etapa de costo' : 'Reactivar etapa de costo'}>
                                            <span>
                                                <Switch
                                                    checked={Boolean(etapa.estado)}
                                                    onChange={() => handleSolicitarCambioEstado(etapa)}
                                                    disabled={cambiandoEstado}
                                                    size="small"
                                                    inputProps={{
                                                        'aria-label': `${etapa.estado ? 'Desactivar' : 'Reactivar'} etapa ${etapa.cod_etapa}`,
                                                    }}
                                                />
                                            </span>
                                        </Tooltip>
                                        <StatusChip estado={etapa.estado} activoLabel="Activo" inactivoLabel="Inactivo" />
                                    </Box>
                                </Box>
                                <IconButton
                                    aria-label={`Editar etapa ${etapa.cod_etapa}`}
                                    onClick={() => handleEditarEtapa(etapa)}
                                    sx={{ minWidth: 44, minHeight: 44 }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <DataTable
                        columns={columnas}
                        rows={etapasPaginadas}
                        loading={loading}
                        emptyMessage="No existen etapas de costo registradas."
                        emptySearchMessage="No se encontraron etapas de costo."
                        hasSearch={Boolean(busqueda.trim()) || filtroEstado !== 'todos'}
                        getRowKey={(etapa) => etapa.cod_etapa}
                    />
                )}
                <Pagination
                    total={totalRegistros}
                    pagina={pagina}
                    registrosPorPagina={registrosPorPagina}
                    onPageChange={handleChangePagina}
                    onRowsPerPageChange={handleChangeRegistrosPorPagina}
                />
            </Paper>

            {/* DIALOGO PARA CREAR O EDITAR UNA ETAPA */}
            <Dialog open={dialogOpen} onClose={handleCerrarDialog} fullWidth maxWidth="sm">
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                        {modoEdicion ? 'Editar etapa de costo' : 'Nueva etapa de costo'}
                    </Typography>
                    <IconButton onClick={handleCerrarDialog} disabled={guardando} size="small" aria-label="Cerrar formulario">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        {/* DESCRIPCION DE LA ETAPA */}
                        <TextField
                            label="Etapa de costo"
                            name="etapa_costo"
                            value={formulario.etapa_costo}
                            onChange={handleChange}
                            error={Boolean(erroresFormulario.etapa_costo)}
                            helperText={erroresFormulario.etapa_costo || 'Ingresa el código y el nombre de la etapa.'}
                            fullWidth
                            required
                            disabled={guardando}
                            autoFocus
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                        />

                        {/* ESTADO DE LA ETAPA */}

                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleCerrarDialog}
                        disabled={guardando}
                        startIcon={<CloseIcon />}
                        sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleGuardar}
                        disabled={guardando}
                        startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : <Save />}
                        sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                    >
                        {modoEdicion ? 'Guardar cambios' : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* NOTIFICACION DE OPERACION EXITOSA */}
            <Dialog
                open={Boolean(etapaCambioEstado)}
                onClose={handleCerrarConfirmacionEstado}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    {etapaCambioEstado?.nuevoEstado
                        ? 'Reactivar etapa de costo'
                        : 'Desactivar etapa de costo'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {etapaCambioEstado?.nuevoEstado
                            ? `¿Deseas reactivar "${etapaCambioEstado?.etapa_costo}"?`
                            : `¿Deseas desactivar "${etapaCambioEstado?.etapa_costo}"? El registro se conservará en la base de datos.`}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCerrarConfirmacionEstado} disabled={cambiandoEstado}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        color={etapaCambioEstado?.nuevoEstado ? 'success' : 'warning'}
                        onClick={handleConfirmarCambioEstado}
                        disabled={cambiandoEstado}
                        startIcon={cambiandoEstado ? <CircularProgress size={16} color="inherit" /> : undefined}
                    >
                        {cambiandoEstado
                            ? 'Guardando...'
                            : etapaCambioEstado?.nuevoEstado
                                ? 'Reactivar'
                                : 'Desactivar'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={Boolean(mensaje)}
                autoHideDuration={3500}
                onClose={handleCerrarMensaje}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCerrarMensaje} severity="success" variant="filled" sx={{ width: '100%' }}>
                    {mensaje}
                </Alert>
            </Snackbar>

            {/* NOTIFICACION DE ERROR */}
            <Snackbar
                open={Boolean(error)}
                autoHideDuration={5000}
                onClose={handleCerrarError}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCerrarError} severity="error" variant="filled" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
</CompactModuleTheme>
    )
}

export default EtapasCosto
