
import { useEffect, useMemo, useRef, useState } from 'react'
import {
    Alert, Box, Button, Card, CardContent, CircularProgress, Dialog,
    DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton,
    Paper, Snackbar, TextField, Typography
} from '@mui/material'
import {
    CalendarMonth, CheckCircle, Close as CloseIcon, CloudDownload,
    CurrencyExchange, Edit as EditIcon, Save, TrendingUp
} from '@mui/icons-material'
import {
    obtenerTiposCambio,
    obtenerUltimoTipoCambio,
    obtenerSiguientePeriodo,
    consultarTipoCambioBCRP,
    crearTipoCambio,
    actualizarTipoCambio
} from '../../services/tipoCambioService'
import SearchInput from '../../components/common/SearchInput'
import StatusChip from '../../components/common/StatusChip'
import Pagination from '../../components/common/Pagination'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const formularioInicial = {
    tipo_cambio: '',
    estado: true
}

const formatearPeriodo = (anho, mes) => {
    if (!anho || !mes || Number(mes) < 1 || Number(mes) > 12) {
        return 'Período no disponible'
    }
    return `${MESES[Number(mes) - 1]} ${anho}`
}

const formatearTipoCambio = (valor) => {
    if (valor === null || valor === undefined || valor === '') return '—'
    return Number(valor).toLocaleString('es-PE', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
    })
}

const formatearFecha = (fecha) => {
    if (!fecha) return '—'
    const valor = new Date(fecha)
    if (Number.isNaN(valor.getTime())) return '—'
    return valor.toLocaleString('es-PE', {
        dateStyle: 'short',
        timeStyle: 'short'
    })
}

function TipoCambio() {
    const [tiposCambio, setTiposCambio] = useState([])
    const [ultimoTipoCambio, setUltimoTipoCambio] = useState(null)
    const [siguientePeriodo, setSiguientePeriodo] = useState(null)
    const [propuesta, setPropuesta] = useState(null)
    const [tipoSeleccionado, setTipoSeleccionado] = useState(null)
    const [formulario, setFormulario] = useState(formularioInicial)
    const [erroresFormulario, setErroresFormulario] = useState({})
    const [loading, setLoading] = useState(true)
    const [consultando, setConsultando] = useState(false)
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [dialogEdicionOpen, setDialogEdicionOpen] = useState(false)
    const [dialogPropuestaOpen, setDialogPropuestaOpen] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [pagina, setPagina] = useState(0)
    const [registrosPorPagina, setRegistrosPorPagina] = useState(10)
    const cargaInicialIniciada = useRef(false)

    // =========================================================
    // CARGAR HISTÓRICO Y PERÍODOS
    // =========================================================
    const cargarDatos = async () => {
        try {
            setLoading(true)
            setError('')
            const [historico, ultimo] = await Promise.all([
                obtenerTiposCambio(),
                obtenerUltimoTipoCambio()
            ])
            setTiposCambio(historico || [])
            setUltimoTipoCambio(ultimo || null)

            try {
                const siguiente = await obtenerSiguientePeriodo()
                setSiguientePeriodo(siguiente)
            } catch {
                setSiguientePeriodo(null)
            }
        } catch (err) {
            console.error('Error cargando tipos de cambio:', err)
            setError(err?.message || 'No se pudo cargar el histórico de tipos de cambio.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (cargaInicialIniciada.current) return
        cargaInicialIniciada.current = true
        cargarDatos()
    }, [])

    // =========================================================
    // BÚSQUEDA Y PAGINACIÓN
    // =========================================================
    const tiposCambioFiltrados = useMemo(() => {
        const texto = busqueda.trim().toLowerCase()
        if (!texto) return tiposCambio

        return tiposCambio.filter((registro) => {
            const periodo = formatearPeriodo(registro.anho, registro.mes).toLowerCase()
            return (
                String(registro.anho).includes(texto) ||
                String(registro.mes).includes(texto) ||
                periodo.includes(texto) ||
                String(registro.tipo_cambio).includes(texto) ||
                (registro.estado ? 'activo' : 'inactivo').includes(texto)
            )
        })
    }, [tiposCambio, busqueda])

    const tiposCambioPaginados = useMemo(() => {
        const inicio = pagina * registrosPorPagina
        return tiposCambioFiltrados.slice(inicio, inicio + registrosPorPagina)
    }, [tiposCambioFiltrados, pagina, registrosPorPagina])

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
    // CONSULTAR PROPUESTA DEL BCRP
    // =========================================================
    const handleConsultarBCRP = async () => {
        try {
            setConsultando(true)
            setError('')
            setPropuesta(null)
            const data = await consultarTipoCambioBCRP()
            setPropuesta(data)
            setDialogPropuestaOpen(true)
        } catch (err) {
            console.error('Error consultando el BCRP:', err)
            setError(err?.message || 'No se pudo consultar el tipo de cambio del BCRP.')
        } finally {
            setConsultando(false)
        }
    }

    // =========================================================
    // CONFIRMAR Y GUARDAR PROPUESTA
    // =========================================================
    const handleConfirmarPropuesta = async () => {
        if (!propuesta) return

        try {
            setGuardando(true)
            setError('')
            await crearTipoCambio({
                anho: propuesta.anho,
                mes: propuesta.mes,
                tipo_cambio: propuesta.tipo_cambio
            })
            setDialogPropuestaOpen(false)
            setPropuesta(null)
            setMensaje('Tipo de cambio registrado correctamente.')
            setPagina(0)
            await cargarDatos()
        } catch (err) {
            console.error('Error guardando el tipo de cambio:', err)
            setError(err?.message || 'No se pudo registrar el tipo de cambio.')
        } finally {
            setGuardando(false)
        }
    }

    // =========================================================
    // EDITAR REGISTRO HISTÓRICO
    // =========================================================
    const handleEditarTipo = (registro) => {
        setTipoSeleccionado(registro)
        setFormulario({
            tipo_cambio: String(registro.tipo_cambio ?? ''),
            estado: registro.estado ?? true
        })
        setErroresFormulario({})
        setDialogEdicionOpen(true)
    }

    const handleCerrarEdicion = () => {
        if (guardando) return
        setDialogEdicionOpen(false)
        setTipoSeleccionado(null)
        setFormulario(formularioInicial)
        setErroresFormulario({})
    }

    const handleChangeFormulario = (event) => {
        const { name, value } = event.target
        setFormulario((prev) => ({ ...prev, [name]: value }))
        setErroresFormulario((prev) => ({ ...prev, [name]: '' }))
    }

    const handleCambiarEstadoFormulario = () => {
        setFormulario((prev) => ({ ...prev, estado: !prev.estado }))
    }

    const validarFormulario = () => {
        const nuevosErrores = {}
        const valor = Number(formulario.tipo_cambio)

        if (formulario.tipo_cambio === '' || !Number.isFinite(valor) || valor <= 0) {
            nuevosErrores.tipo_cambio = 'Ingresa un tipo de cambio mayor que cero.'
        }

        setErroresFormulario(nuevosErrores)
        return Object.keys(nuevosErrores).length === 0
    }

    const handleGuardarEdicion = async () => {
        if (!tipoSeleccionado || !validarFormulario()) return

        try {
            setGuardando(true)
            setError('')
            await actualizarTipoCambio(tipoSeleccionado.id_tipo_cambio, {
                tipo_cambio: Number(formulario.tipo_cambio),
                estado: formulario.estado
            })
            setDialogEdicionOpen(false)
            setTipoSeleccionado(null)
            setMensaje('Tipo de cambio actualizado correctamente.')
            await cargarDatos()
        } catch (err) {
            console.error('Error actualizando el tipo de cambio:', err)
            setError(err?.message || 'No se pudo actualizar el tipo de cambio.')
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
    // COLUMNAS DEL HISTÓRICO
    // =========================================================
    const columnas = [
        {
            key: 'periodo',
            label: 'Período',
            width: '24%',
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
                    backgroundColor: '#2E7D32'
                }
            },
            render: (registro) => (
                <Box>
                    <Typography variant="body2" fontWeight={600}>
                        {formatearPeriodo(registro.anho, registro.mes)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {registro.anho}-{String(registro.mes).padStart(2, '0')}
                    </Typography>
                </Box>
            )
        },
        {
            key: 'tipo_cambio',
            label: 'Tipo de cambio',
            width: '24%',
            render: (registro) => (
                <Typography variant="body2" fontWeight={700}>
                    S/ {formatearTipoCambio(registro.tipo_cambio)}
                </Typography>
            )
        },
        {
            key: 'updated_at',
            label: 'Última actualización',
            width: '24%',
            render: (registro) => (
                <Typography variant="body2" color="text.secondary">
                    {formatearFecha(registro.updated_at || registro.created_at)}
                </Typography>
            )
        },
        {
            key: 'acciones',
            label: 'Acciones',
            width: '12%',
            align: 'center',
            render: (registro) => (
                <IconButton
                    size="small"
                    aria-label="Editar tipo de cambio"
                    onClick={() => handleEditarTipo(registro)}
                    sx={{
                        p: 0.5,
                        '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.08)' }
                    }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            )
        }
    ]

    // =========================================================
    // TARJETAS DE RESUMEN
    // =========================================================
    const tarjetaSx = {
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        boxShadow: 'none',
        backgroundColor: 'background.paper'
    }

    const totalRegistros = tiposCambioFiltrados.length

    // =========================================================
    // RENDER
    // =========================================================
    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                minWidth: 0,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                overflow: 'auto',
                pb: 1
            }}
        >
            {/* ENCABEZADO */}

            {/* TARJETAS DE PERÍODOS */}
            
            {/* CONSULTA DEL BCRP */}
            
            {/* Contenedor horizontal de consulta e histórico */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'minmax(0, 8fr) minmax(0, 8fr)'
                    },
                    gap: 2,
                    alignItems: 'start'
                }}
            >
                {/* Panel de consulta del BCRP */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        backgroundColor: 'background.paper',
                        minWidth: 0
                    }}
                >
                    {/* Encabezado de consulta */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.5
                        }}
                    >
                        <Box
                            sx={{
                                color: 'success.main',
                                display: 'flex',
                                mt: 0.25
                            }}
                        >
                            <CloudDownload />
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                variant="subtitle1"
                                fontWeight={700}
                            >
                                Consulta del Banco Central de Reserva del Perú
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Consulta el siguiente período y revisa el valor antes de registrarlo.
                            </Typography>
                        </Box>
                    </Box>

                    
                    {/* Período pendiente y botón de consulta en la misma fila */}
                    {siguientePeriodo && (
                        <Box
                            sx={{
                                mt: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 2,
                                flexWrap: 'wrap'
                            }}
                        >
                            {/* Caja del período */}
                            <Box
                                sx={{
                                    p: 1.5,
                                    borderRadius: 1,
                                    backgroundColor: 'action.hover',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    flexWrap: 'wrap',
                                    flex: 1,
                                    minWidth: 0
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Período por consultar:
                                </Typography>

                                <Typography
                                    variant="body2"
                                    fontWeight={700}
                                >
                                    {formatearPeriodo(
                                        siguientePeriodo.anho,
                                        siguientePeriodo.mes
                                    )}
                                </Typography>
                            </Box>

                            {/* Botón a la derecha */}
                            <Button
                                variant="contained"
                                onClick={handleConsultarBCRP}
                                disabled={
                                    consultando ||
                                    loading ||
                                    !siguientePeriodo
                                }
                                startIcon={
                                    consultando
                                        ? (
                                            <CircularProgress
                                                size={18}
                                                color="inherit"
                                            />
                                        )
                                        : <CurrencyExchange />
                                }
                                sx={{
                                    borderRadius: 1,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    flexShrink: 0
                                }}
                            >
                                {consultando
                                    ? 'Consultando...'
                                    : 'Consultar siguiente mes'}
                            </Button>
                        </Box>
                    )}

                    {/* Mensaje de error de consulta */}
                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mt: 2,
                                borderRadius: 1
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                </Paper>

                {/* Panel del histórico de tipos de cambio */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        backgroundColor: 'background.paper',
                        minWidth: 0
                    }}
                >
                    {/* Encabezado y buscador del histórico */}
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{ mb: 0.5 }}
                        >
                            Histórico de tipos de cambio
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                        >
                            Consulta y administra los valores mensuales compartidos por las empresas.
                        </Typography>

                        <SearchInput
                            value={busqueda}
                            onChange={handleCambioBusqueda}
                            placeholder="Buscar por año, mes, tipo de cambio o estado..."
                            ariaLabel="Buscar en el histórico de tipos de cambio"
                        />
                    </Box>
                    {/* Mantén aquí la tabla del histórico y su paginación */}
                </Paper>
            </Box>
            
            {/* HISTÓRICO */}
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    minWidth: 0,
                    minHeight: 300,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'hidden',
                    backgroundColor: 'background.paper'
                }}
            >
                                <Divider />
                <DataTable
                    columns={columnas}
                    rows={tiposCambioPaginados}
                    loading={loading}
                    emptyMessage="No existen tipos de cambio registrados."
                    emptySearchMessage="No se encontraron tipos de cambio para la búsqueda."
                    hasSearch={Boolean(busqueda.trim())}
                    getRowKey={(registro) => registro.id_tipo_cambio}
                />
                <Pagination
                    total={totalRegistros}
                    pagina={pagina}
                    registrosPorPagina={registrosPorPagina}
                    onPageChange={handleChangePagina}
                    onRowsPerPageChange={handleChangeRegistrosPorPagina}
                />
            </Paper>

            {/* DIÁLOGO DE PROPUESTA DEL BCRP */}
            <Dialog
                open={dialogPropuestaOpen}
                onClose={() => !guardando && setDialogPropuestaOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                        Confirmar tipo de cambio
                    </Typography>
                    <IconButton
                        onClick={() => setDialogPropuestaOpen(false)}
                        disabled={guardando}
                        size="small"
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {propuesta && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <Alert severity="info" sx={{ borderRadius: 1 }}>
                                Revisa el período y el valor consultado. El registro solo se guardará cuando lo confirmes.
                            </Alert>
                            <Box
                                sx={{
                                    p: 2.5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    textAlign: 'center'
                                }}
                            >
                                <Typography variant="body2" color="text.secondary">
                                    Período consultado
                                </Typography>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                                    {formatearPeriodo(propuesta.anho, propuesta.mes)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Tipo de cambio propuesto
                                </Typography>
                                <Typography variant="h4" fontWeight={800} color="success.main">
                                    S/ {formatearTipoCambio(propuesta.tipo_cambio)}
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                                La consulta no modifica la base de datos. Debes confirmar para guardar el registro.
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setDialogPropuestaOpen(false)}
                        disabled={guardando}
                        startIcon={<CloseIcon />}
                        sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmarPropuesta}
                        disabled={guardando || !propuesta}
                        startIcon={
                            guardando
                                ? <CircularProgress size={18} color="inherit" />
                                : <CheckCircle />
                        }
                        sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                    >
                        {guardando ? 'Guardando...' : 'Confirmar y guardar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* DIÁLOGO DE EDICIÓN */}
            <Dialog
                open={dialogEdicionOpen}
                onClose={handleCerrarEdicion}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                        Editar tipo de cambio
                    </Typography>
                    <IconButton onClick={handleCerrarEdicion} disabled={guardando} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Período"
                            value={
                                tipoSeleccionado
                                    ? formatearPeriodo(tipoSeleccionado.anho, tipoSeleccionado.mes)
                                    : ''
                            }
                            fullWidth
                            disabled
                        />
                        <TextField
                            label="Tipo de cambio"
                            name="tipo_cambio"
                            type="number"
                            value={formulario.tipo_cambio}
                            onChange={handleChangeFormulario}
                            error={Boolean(erroresFormulario.tipo_cambio)}
                            helperText={erroresFormulario.tipo_cambio || 'Ingresa el valor con hasta cuatro decimales.'}
                            inputProps={{ min: 0, step: '0.0001' }}
                            fullWidth
                            required
                            disabled={guardando}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleCerrarEdicion}
                        disabled={guardando}
                        startIcon={<CloseIcon />}
                        sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleGuardarEdicion}
                        disabled={guardando}
                        startIcon={
                            guardando
                                ? <CircularProgress size={18} color="inherit" />
                                : <Save />
                        }
                        sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                    >
                        {guardando ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* NOTIFICACIONES */}
            <Snackbar
                open={Boolean(mensaje)}
                autoHideDuration={3500}
                onClose={handleCerrarMensaje}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCerrarMensaje}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {mensaje}
                </Alert>
            </Snackbar>
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
                    sx={{ width: '100%' }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default TipoCambio
