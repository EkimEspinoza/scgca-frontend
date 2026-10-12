// =========================================================
// IMPORTS
// =========================================================

import { useEffect, useRef, useMemo, useState } from 'react'

import {
    Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogTitle, IconButton, Paper, Snackbar, TextField, Typography
} from '@mui/material'

import { Add, Close, Edit, Save } from '@mui/icons-material'

import { obtenerComparativos, crearComparativo, actualizarComparativo } from '../../services/comparativoService'

import SearchInput from '../../components/common/SearchInput'
import StatusChip from '../../components/common/StatusChip'
import Pagination from '../../components/common/Pagination'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'


const formularioInicial = { descripcion: '', estado: true }

function Comparativos() {

    const [comparativos, setComparativos] = useState([])
    const [comparativoSeleccionado, setComparativoSeleccionado] = useState(null)

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

    // =========================================================
    // DATOS FILTRADOS
    // =========================================================

    const comparativosFiltrados =
        useMemo(() => {
            const texto = busqueda.trim().toLowerCase()
            if (!texto) { return comparativos }
            return comparativos.filter(
                (comparativo) =>
                    comparativo.descripcion?.toLowerCase().includes(texto))
        },
            [comparativos, busqueda])

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
                <StatusChip estado={comparativo.estado} activoLabel="Activo" inactivoLabel="Inactivo" />
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
        <Box sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* =====================================================
            ENCABEZADO
                    ====================================================== */}

            <PageHeader

                title="Comparativos"
                description="Administración de comparativos agrícolas"
                actionLabel="Nuevo comparativo"
                onAction={handleNuevoComparativo}
                actionIcon={<Add />}
            />


            {/* =====================================================
                CONTENEDOR PRINCIPAL
            ====================================================== */}

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
                        placeholder="Buscar comparativo..."
                        ariaLabel="Buscar comparativo" />
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
                    rows={comparativosPaginados}
                    loading={loading}
                    emptyMessage={'No existen comparativos registrados.'}
                    emptySearchMessage={'No se encontraron comparativos para la búsqueda.'}
                    hasSearch={Boolean(busqueda.trim())}
                    getRowKey={(comparativo) => comparativo.id_comparativo}
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

export default Comparativos