// =========================================================
// IMPORTS
// =========================================================

import { useEffect, useRef, useMemo, useState } from 'react'

import {
    Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogTitle, IconButton, Paper, Snackbar, TextField, Typography
} from '@mui/material'

import { Add, Close, Edit, Save } from '@mui/icons-material'

import { obtenerVariedades, crearVariedad, actualizarVariedad } from '../../services/variedadService'

import SearchInput from '../../components/common/SearchInput'
import StatusChip from '../../components/common/StatusChip'
import Pagination from '../../components/common/Pagination'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'

const formularioInicial = { descripcion: '', estado: true }

function Variedades() {

    const [variedades, setVariedades] = useState([])
    const [variedadSeleccionada, setVariedadSeleccionada] = useState(null)
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
    // DATOS FILTRADOS
    // =========================================================


    const variedadesFiltradas = useMemo(() => {
        const texto = busqueda.trim().toLowerCase()
        if (!texto) { return variedades }
        return variedades.filter((variedad) =>
            variedad.descripcion?.toLowerCase().includes(texto),
        )
    }, [variedades, busqueda])

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
            key: 'des_tip_cc',
            label: 'Tipo de Centro de Costo',
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
                <StatusChip estado={variedad.estado} activoLabel="Activo" inactivoLabel="Inactivo" />
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

        <Box sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* =====================================================
            ENCABEZADO
                    ====================================================== */}

            <PageHeader
                title="Variedades"
                description="Administración de variedades agrícolas"
                actionLabel="Nueva variedad"
                onAction={handleNuevaVariedad}
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
                        placeholder="Buscar variedad..."
                        ariaLabel="Buscar variedad"
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
                    rows={variedadesPaginadas}
                    loading={loading}
                    emptyMessage={'No existen variedades registradas.'}
                    emptySearchMessage={'No se encontraron variedades para la búsqueda.'}
                    hasSearch={Boolean(busqueda.trim())}
                    getRowKey={(variedad) => variedad.id_variedad}
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

export default Variedades
