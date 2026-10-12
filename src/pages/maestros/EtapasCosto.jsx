import { useEffect, useMemo, useRef, useState } from 'react'
import {
    Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogTitle, IconButton, Paper, Snackbar, TextField, Typography,
} from '@mui/material'
import { Add, Close as CloseIcon, Edit as EditIcon, Save } from '@mui/icons-material'
import { obtenerEtapasCosto, crearEtapaCosto, actualizarEtapaCosto } from '../../services/etapaCostoService'
import SearchInput from '../../components/common/SearchInput'
import StatusChip from '../../components/common/StatusChip'
import Pagination from '../../components/common/Pagination'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'

const formularioInicial = { etapa_costo: '', estado: true }

function EtapasCosto() {
    const [etapas, setEtapas] = useState([])
    const [etapaSeleccionada, setEtapaSeleccionada] = useState(null)
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
    // FILTRAR ETAPAS POR CODIGO O DESCRIPCION
    // =========================================================
    const etapasFiltradas = useMemo(() => {
        const texto = busqueda.trim().toLocaleLowerCase('es')
        if (!texto) return etapas
        return etapas.filter((etapa) =>
            String(etapa.cod_etapa ?? '').includes(texto) ||
            etapa.etapa_costo?.toLocaleLowerCase('es').includes(texto)
        )
    }, [etapas, busqueda])

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
                <StatusChip estado={etapa.estado} activoLabel="Activo" inactivoLabel="Inactivo" />
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
        <Box sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* ENCABEZADO DE LA PANTALLA */}
            <PageHeader
                title="Etapas de Costo"
                description="Administración de etapas utilizadas para clasificar los costos de inversión."
                actionLabel="Nueva etapa"
                onAction={handleNuevaEtapa}
                actionIcon={<Add />}
            />

            {/* BUSCADOR Y MENSAJE DE ERROR */}
            <Paper
                elevation={0}
                sx={{ width: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', backgroundColor: 'background.paper', mb: 1 }}
            >
                <Box sx={{ p: 2, flexShrink: 0, backgroundColor: 'background.paper' }}>
                    <SearchInput
                        value={busqueda}
                        onChange={handleCambioBusqueda}
                        placeholder="Buscar por código o etapa..."
                        ariaLabel="Buscar etapa de costo"
                    />
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
                sx={{ width: '100%', minWidth: 0, minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', backgroundColor: 'background.paper' }}
            >
                <DataTable
                    columns={columnas}
                    rows={etapasPaginadas}
                    loading={loading}
                    emptyMessage="No existen etapas de costo registradas."
                    emptySearchMessage="No se encontraron etapas para la búsqueda."
                    hasSearch={Boolean(busqueda.trim())}
                    getRowKey={(etapa) => etapa.cod_etapa}
                />
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
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                                Estado
                            </Typography>
                            <StatusChip
                                estado={formulario.estado}
                                onClick={!guardando ? handleCambiarEstadoFormulario : undefined}
                                disabled={guardando}
                                activoLabel="Activo"
                                inactivoLabel="Inactivo"
                            />
                        </Box>
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
    )
}

export default EtapasCosto