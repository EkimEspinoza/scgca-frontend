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

import { obtenerComparativos, crearComparativo, actualizarComparativo, cambiarEstadoComparativo } from '../../services/comparativoService'

import SearchInput from '../../components/common/SearchInput'
import StatusChip from '../../components/common/StatusChip'
import Pagination from '../../components/common/Pagination'
import PageHeader from '../../components/common/PageHeader'
import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import DataTable from '../../components/common/DataTable'


const formularioInicial = { descripcion: '', estado: true }

function Comparativos() {
    const esVistaMovil = useMediaQuery('(max-width:760px)')

    const [comparativos, setComparativos] = useState([])
    const [comparativoSeleccionado, setComparativoSeleccionado] = useState(null)
    const [comparativoCambioEstado, setComparativoCambioEstado] = useState(null)
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
    // CARGAR COMPARATIVOS
    // =========================================================

    const cargarComparativos = async () => {
        try {
            setLoading(true)
            setError('')
            const data =
                await obtenerComparativos()
            setComparativos(data || [])
        }
        catch (err) {
            console.error('Error cargando comparativos:', err)
            setError('No se pudieron cargar los comparativos.')
        }
        finally { setLoading(false) }
    }

    useEffect(() => {
        if (cargaInicialIniciada.current) { return }
        cargaInicialIniciada.current = true
        cargarComparativos()
    }, [])

    // CAMBIO DE ESTADO
    // =========================================================
    const handleSolicitarCambioEstado = (comparativo) => {
        setComparativoCambioEstado({
            ...comparativo,
            nuevoEstado: !Boolean(comparativo.estado),
        })
    }

    const handleCerrarConfirmacionEstado = () => {
        if (cambiandoEstado) return
        setComparativoCambioEstado(null)
    }

    const handleConfirmarCambioEstado = async () => {
        if (!comparativoCambioEstado) return

        const { id_comparativo, nuevoEstado } = comparativoCambioEstado

        try {
            setCambiandoEstado(true)
            setError('')

            const comparativoActualizado = await cambiarEstadoComparativo(
                id_comparativo,
                nuevoEstado,
            )

            setComparativos((actuales) => actuales.map((comparativo) =>
                comparativo.id_comparativo === id_comparativo
                    ? comparativoActualizado
                    : comparativo,
            ))
            setMensaje(
                nuevoEstado
                    ? 'Comparativo reactivado correctamente.'
                    : 'Comparativo desactivado correctamente.',
            )
            setComparativoCambioEstado(null)
            setPagina(0)
        } catch (err) {
            console.error('Error cambiando estado del comparativo:', err)
            setError(err?.message || 'No se pudo cambiar el estado del comparativo.')
        } finally {
            setCambiandoEstado(false)
        }
    }
    // DATOS FILTRADOS
    // =========================================================

    const comparativosFiltrados = useMemo(() => {
        const texto = busqueda.trim().toLowerCase()

        return comparativos.filter((comparativo) => {
            const coincideTexto = comparativo.descripcion?.toLowerCase().includes(texto)
            const coincideEstado =
                filtroEstado === 'todos' ||
                (filtroEstado === 'activos' && Boolean(comparativo.estado)) ||
                (filtroEstado === 'inactivos' && !Boolean(comparativo.estado))

            return coincideTexto && coincideEstado
        })
    }, [comparativos, busqueda, filtroEstado])
    // =========================================================
    // DATOS PAGINADOS 
    // =========================================================

    const comparativosPaginados =
        useMemo(() => {
            const inicio = pagina * registrosPorPagina
            const fin = inicio + registrosPorPagina
            return comparativosFiltrados.slice(inicio, fin)
        },
            [comparativosFiltrados, pagina, registrosPorPagina])


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
    // NUEVO COMPARATIVO
    // =========================================================

    const handleNuevoComparativo = () => {
        setModoEdicion(false)
        setComparativoSeleccionado(null)
        setFormulario({ ...formularioInicial, estado: true })
        setErroresFormulario({})
        setDialogOpen(true)
    }

    // =========================================================
    // EDITAR COMPARATIVO
    // =========================================================

    const handleEditarComparativo = (
        comparativo,
    ) => {
        setModoEdicion(true)
        setComparativoSeleccionado(comparativo)
        setFormulario({
            descripcion: comparativo.descripcion || '',
            estado: comparativo.estado ?? true
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
        setComparativoSeleccionado(null)
        setFormulario(formularioInicial)
        setErroresFormulario({})
    }

    // =========================================================
    // CAMBIAR CAMPOS
    // =========================================================

    const handleChange = (
        event,
    ) => {
        const { name, value } = event.target
        const nuevoValor =
            name === 'descripcion'
                ? value.toUpperCase()
                : value
        setFormulario((prev) => ({ ...prev, [name]: nuevoValor }))
        setErroresFormulario((prev) => ({ ...prev, [name]: '', }))
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
                descripcion: formulario.descripcion.trim().toUpperCase(),
                estado: formulario.estado
            }

            if (modoEdicion) {
                await actualizarComparativo(comparativoSeleccionado.id_comparativo, datos)
                setMensaje('Comparativo actualizado correctamente.')
            }
            else {
                await crearComparativo(datos)
                setMensaje('Comparativo creado correctamente.')
                setPagina(0)
            }
            setDialogOpen(false)
            await cargarComparativos()
        }
        catch (err) {
            console.error('Error guardando comparativo:', err)
            setError(err?.message || 'No se pudo guardar el comparativo.')
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
            label: 'Comparativo',
            height: '100%',
            width: '60%',
            cellSx: {
                position: 'relative', pl: 1.5,
                '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: '0 0px 0px 0', backgroundColor: '#2E7D32' }
            },

            render: (comparativo) => (
                <Box sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>
                        {comparativo.descripcion}
                    </Typography>
                </Box>)
        },

        {
            key: 'estado',
            label: 'Estado',
            width: '20%',
            render: (comparativo) => (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title={comparativo.estado ? 'Desactivar comparativo' : 'Reactivar comparativo'}>
                        <span>
                            <Switch
                                checked={Boolean(comparativo.estado)}
                                onChange={() => handleSolicitarCambioEstado(comparativo)}
                                disabled={cambiandoEstado}
                                size="small"
                                inputProps={{
                                    'aria-label': `${comparativo.estado ? 'Desactivar' : 'Reactivar'} ${comparativo.descripcion}`,
                                }}
                            />
                        </span>
                    </Tooltip>
                    <StatusChip estado={comparativo.estado} activoLabel="Activo" inactivoLabel="Inactivo" />
                </Box>
            )
        },

        {
            key: 'acciones',
            label: 'Acciones',
            width: '20%',
            align: 'center',
            render: (comparativo) => (
                <IconButton size="small" onClick={() => handleEditarComparativo(comparativo)}
                    sx={{ p: 0.5, '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.08)' } }}>
                    <Edit fontSize="small" />
                </IconButton>
            ),
        },
    ]

    // =========================================================
    // TOTAL
    // =========================================================

    const totalRegistros = comparativosFiltrados.length


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
                    title="Comparativos"
                    description="Administración de comparativos agrícolas"
                    actionLabel="Nuevo comparativo"
                    onAction={handleNuevoComparativo}
                    actionIcon={<Add />}
                />
            </Box>


            {/* =====================================================
                CONTENEDOR PRINCIPAL
            ====================================================== */}

            {/* =================================================
                    BUSCADOR 
                ================================================= */}
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
                            value={busqueda.toUpperCase()}
                            onChange={handleCambioBusqueda}
                            placeholder="Buscar comparativo..."
                            ariaLabel="Buscar comparativo"
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
                        sx={{
                            ml: { xs: 'auto', sm: 0 },
                            whiteSpace: 'nowrap',
                            fontWeight: 500,
                        }}
                    >
                        {totalRegistros} {totalRegistros === 1 ? 'registro encontrado' : 'registros encontrados'}
                    </Typography>
                </Box>

                {error && (
                    <Box sx={{ px: 2, pb: 2 }}>
                        <Alert severity="error" sx={{ borderRadius: 1 }}>
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
                    width: '100%', minWidth: 0, minHeight: 0, flex: esVistaMovil ? '0 0 auto' : 1, display: 'flex', flexDirection: 'column',
                    border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', backgroundColor: 'background.paper'
                }}>
                {esVistaMovil ? (
                    <Box
                        component="ul"
                        aria-label="Lista de comparativos"
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
                        ) : comparativosPaginados.length === 0 ? (
                            <Typography color="text.secondary" align="center" sx={{ p: 3 }}>
                                {Boolean(busqueda.trim()) || filtroEstado !== 'todos'
                                    ? 'No se encontraron comparativos.'
                                    : 'No existen comparativos registrados.'}
                            </Typography>
                        ) : comparativosPaginados.map((comparativo) => (
                            <Box
                                component="li"
                                key={comparativo.id_comparativo}
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
                                        {comparativo.descripcion}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                                        <Tooltip title={comparativo.estado ? 'Desactivar comparativo' : 'Reactivar comparativo'}>
                                            <span>
                                                <Switch
                                                    checked={Boolean(comparativo.estado)}
                                                    onChange={() => handleSolicitarCambioEstado(comparativo)}
                                                    disabled={cambiandoEstado}
                                                    size="small"
                                                    inputProps={{
                                                        'aria-label': `${comparativo.estado ? 'Desactivar' : 'Reactivar'} ${comparativo.descripcion}`,
                                                    }}
                                                />
                                            </span>
                                        </Tooltip>
                                        <StatusChip
                                            estado={comparativo.estado}
                                            activoLabel="Activo"
                                            inactivoLabel="Inactivo"
                                        />
                                    </Box>
                                </Box>
                                <IconButton
                                    aria-label={`Editar ${comparativo.descripcion}`}
                                    onClick={() => handleEditarComparativo(comparativo)}
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
                        rows={comparativosPaginados}
                        loading={loading}
                        emptyMessage={'No existen comparativos registrados.'}
                        emptySearchMessage={'No se encontraron comparativos para la búsqueda.'}
                        hasSearch={Boolean(busqueda.trim()) || filtroEstado !== 'todos'}
                        getRowKey={(comparativo) => comparativo.id_comparativo}
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
                            ? 'Editar comparativo'
                            : 'Nuevo comparativo'}
                    </Typography>

                    <IconButton onClick={handleCerrarDialog} disabled={guardando} size="small">
                        <Close />
                    </IconButton>

                </DialogTitle>

                <DialogContent>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1}}>
                        {/* COMPARATIVO */}
                        <TextField
                            label="Comparativo"
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

                        {/* =====================================================
                ESTADO
            ====================================================== */}

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
                            : 'Crear comparativo'}
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
                open={Boolean(comparativoCambioEstado)}
                onClose={handleCerrarConfirmacionEstado}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    {comparativoCambioEstado?.nuevoEstado
                        ? 'Reactivar comparativo'
                        : 'Desactivar comparativo'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {comparativoCambioEstado?.nuevoEstado
                            ? `¿Deseas reactivar "${comparativoCambioEstado?.descripcion}"?`
                            : `¿Deseas desactivar "${comparativoCambioEstado?.descripcion}"? El registro se conservará en la base de datos.`}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCerrarConfirmacionEstado} disabled={cambiandoEstado}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        color={comparativoCambioEstado?.nuevoEstado ? 'success' : 'warning'}
                        onClick={handleConfirmarCambioEstado}
                        disabled={cambiandoEstado}
                        startIcon={cambiandoEstado ? <CircularProgress size={16} color="inherit" /> : undefined}
                    >
                        {cambiandoEstado
                            ? 'Guardando...'
                            : comparativoCambioEstado?.nuevoEstado
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

export default Comparativos
